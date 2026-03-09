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
  if (genreParam) {
    const genreId = parseInt(genreParam, 10)
    if (isNaN(genreId)) {
      return NextResponse.json({ error: "Invalid genre ID" }, { status: 400 })
    }
    const results = await fetchMoviesByGenre(genreId)
    return NextResponse.json(results)
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
