import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import {
  searchMovies,
  fetchMovieById,
  fetchMoviesByGenre,
  fetchTrending,
  fetchSuggestions,
  TMDB_IMAGE_BASE,
} from "@/lib/tmdb"
import { TMDBMovie } from "@/types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")
  const idParam = searchParams.get("id")
  const genreParam = searchParams.get("genre")
  const trendingParam = searchParams.get("trending")
  const suggestionsParam = searchParams.get("suggestions")

  // ── Autocomplete suggestions ──
  if (suggestionsParam) {
    const results = await fetchSuggestions(suggestionsParam)
    return NextResponse.json(results)
  }

  // ── Trending movies ──
  if (trendingParam) {
    const results = await fetchTrending()
    return NextResponse.json(results)
  }

  // ── Genre discover ──
  // ── Genre discover ──
  if (genreParam) {
    const genreId = parseInt(genreParam, 10)
    if (isNaN(genreId)) {
      return NextResponse.json({ error: "Invalid genre ID" }, { status: 400 })
    }
    const sortBy = searchParams.get("sort_by") || "popularity.desc"
    const language = searchParams.get("language") || ""
    const minRating = parseFloat(searchParams.get("min_rating") || "0")

    const TMDB_KEY = process.env.TMDB_API_KEY
    const url = new URL("https://api.themoviedb.org/3/discover/movie")
    url.searchParams.set("api_key", TMDB_KEY || "")
    url.searchParams.set("with_genres", String(genreId))
    url.searchParams.set("sort_by", sortBy)
    url.searchParams.set("vote_count.gte", "200")
    if (language) url.searchParams.set("with_original_language", language)
    if (minRating > 0) url.searchParams.set("vote_average.gte", String(minRating))

    const res = await fetch(url.toString())
    const data = await res.json()
    return NextResponse.json(data.results ?? [])
  }

  // ── Movie detail by TMDB ID — with Firestore caching ──
  if (idParam) {
    const tmdbId = parseInt(idParam, 10)
    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: "Invalid TMDB ID" }, { status: 400 })
    }

    const docRef = adminDb.collection("movies").doc(String(tmdbId))
    const doc = await docRef.get()

    if (doc.exists) {
      const data = doc.data()
      const cachedAt = data?.cachedAt?.toDate?.() || new Date(0)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      if (cachedAt > sevenDaysAgo) {
        return NextResponse.json(data)
      }
    }

    const movie = await fetchMovieById(tmdbId)
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    // Build a flattened cache object
    const cacheData = {
      ...movie,
      poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      backdrop_url: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
      cachedAt: new Date(),
    }

    await docRef.set(cacheData)
    return NextResponse.json(cacheData)
  }
  // ── Similar movies ──
  const similarParam = searchParams.get("similar")
  if (similarParam) {
    const tmdbId = parseInt(similarParam, 10)
    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const TMDB_KEY = process.env.TMDB_API_KEY

    // Fetch the movie's genres first
    const detailRes = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=similar`
    )
    if (!detailRes.ok) {
      return NextResponse.json([], { status: 200 })
    }
    const detail = await detailRes.json()

    const genreIds: number[] = detail.genres?.map((g: { id: number }) => g.id) ?? []

    // Pull TMDB similar + discover by same genres, then score and merge
    const similarMovies: TMDBMovie[] = detail.similar?.results ?? []

    // Discover more from the top 2 genres
    const originalLanguage: string = detail.original_language ?? ""
    const productionCountries: string[] = detail.production_countries?.map(
      (c: { iso_3166_1: string }) => c.iso_3166_1
    ) ?? []
    const discoverResults: TMDBMovie[] = []
    for (const gid of genreIds.slice(0, 2)) {
      const discRes = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${gid}&sort_by=vote_average.desc&vote_count.gte=300&page=1`
      )
      if (discRes.ok) {
        const discData = await discRes.json()
        discoverResults.push(...(discData.results ?? []))
      }
    }

    // If movie is non-English, also fetch same-language movies for that genre
    if (originalLanguage && originalLanguage !== "en") {
      for (const gid of genreIds.slice(0, 2)) {
        const langRes = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${gid}&with_original_language=${originalLanguage}&sort_by=vote_average.desc&vote_count.gte=50&page=1`
        )
        if (langRes.ok) {
          const langData = await langRes.json()
          discoverResults.push(...(langData.results ?? []))
        }
      }

      // Also fetch popular movies in that language regardless of genre
      const popularLangRes = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_original_language=${originalLanguage}&sort_by=popularity.desc&vote_count.gte=50&page=1`
      )
      if (popularLangRes.ok) {
        const popularLangData = await popularLangRes.json()
        discoverResults.push(...(popularLangData.results ?? []))
      }
    }

    // Merge, deduplicate, exclude current movie
    const seen = new Set<number>([tmdbId])
    const merged: TMDBMovie[] = []

    for (const movie of [...similarMovies, ...discoverResults]) {
      if (!seen.has(movie.id)) {
        seen.add(movie.id)
        merged.push(movie)
      }
    }

    // Score: genr
    const scored = merged
      .map((movie) => {
        const movieGenres: number[] = movie.genre_ids ?? []
        const genreOverlap = movieGenres.filter((g) => genreIds.includes(g)).length

        // Language match — strong boost if same language
        const languageMatch = movie.original_language === originalLanguage ? 4 : 0

        // Country match — moderate boost
        const movieCountries: string[] = (movie as TMDBMovie & { production_countries?: { iso_3166_1: string }[] })
          .production_countries?.map((c) => c.iso_3166_1) ?? []
        const countryMatch = movieCountries.some((c) => productionCountries.includes(c)) ? 2 : 0

        const score =
          genreOverlap * 3 +
          languageMatch +
          countryMatch +
          (movie.vote_average ?? 0) * 0.5 +
          Math.log10((movie.vote_count ?? 0) + 1) * 0.3

        return { movie, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((s) => s.movie)

    return NextResponse.json(scored)
  }

  // ── Search by query ──
  if (query) {
    const results = await searchMovies(query)
    return NextResponse.json(results)
  }

  return NextResponse.json(
    { error: "Provide ?q=query, ?id=tmdbId, ?genre=genreId, ?trending=1, or ?suggestions=query" },
    { status: 400 }
  )
}
