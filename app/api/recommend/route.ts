import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"
import { fetchMoviesByGenre, TMDB_IMAGE_BASE } from "@/lib/tmdb"
import { TMDBMovie } from "@/types"

const TMDB_KEY = process.env.TMDB_API_KEY

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const token = authHeader.split("Bearer ")[1]
    const decoded = await adminAuth.verifyIdToken(token)
    const uid = decoded.uid

    // STEP 1 — Fetch user ratings and build genre affinity
    const ratingsSnap = await adminDb
      .collection("ratings")
      .doc(uid)
      .collection(uid)
      .get()

    // ── Cold start: no ratings or too few → return trending ──
    if (ratingsSnap.empty) {
      return serveTrending()
    }

    const ratedIds = new Set<string>()
    const genreScores: Record<number, number> = {}

    for (const ratingDoc of ratingsSnap.docs) {
      const data = ratingDoc.data()
      const movieId = String(data.movieId)
      ratedIds.add(movieId)

      let genreIds: number[] = data.genre_ids || []

      // Fallback: look up genre_ids from Firestore movies cache for old ratings
      if (!Array.isArray(genreIds) || genreIds.length === 0) {
        try {
          const movieDoc = await adminDb.collection("movies").doc(movieId).get()
          if (movieDoc.exists) {
            const movieData = movieDoc.data()
            genreIds = movieData?.genre_ids
              ?? movieData?.genres?.map((g: { id: number }) => g.id)
              ?? []
          }
        } catch {
          // silently continue
        }
      }

      if (!Array.isArray(genreIds) || genreIds.length === 0) continue

      const weight = (data.score || 3) - 3 // 5★=+2, 4★=+1, 3★=0, 2★=-1, 1★=-2

      for (const gid of genreIds) {
        genreScores[gid] = (genreScores[gid] || 0) + weight
      }
    }

    // STEP 2 — Find top 3 genres by score
    const topGenreIds = Object.entries(genreScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => Number(id))

    if (topGenreIds.length === 0) {
      return serveTrending()
    }

    // STEP 3 — Fetch candidate movies from TMDB for each top genre
    const candidateMovies: TMDBMovie[] = []
    const seenIds = new Set<number>()

    for (const genreId of topGenreIds) {
      const movies = await fetchMoviesByGenre(genreId, 1)
      for (const movie of movies) {
        if (!seenIds.has(movie.id)) {
          seenIds.add(movie.id)
          candidateMovies.push(movie)

          // Cache in Firestore for future use
          await adminDb
            .collection("movies")
            .doc(String(movie.id))
            .set(
              {
                ...movie,
                poster_url: movie.poster_path
                  ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
                  : null,
                cachedAt: new Date(),
              },
              { merge: true }
            )
            .catch(() => {})
        }
      }
    }

    // STEP 4 — Score each candidate
    const scoredMovies = candidateMovies
      .filter((movie) => !ratedIds.has(String(movie.id)))
      .map((movie) => {
        let score = movie.vote_average * 0.4
        score += Math.log10((movie.vote_count || 0) + 1) * 0.3

        for (const gid of movie.genre_ids ?? []) {
          if (genreScores[gid]) {
            score += genreScores[gid] * 1.5
          }
        }

        return { movie, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((s) => s.movie)

    return NextResponse.json(scoredMovies, {
      headers: { "X-Recommendation-Type": "personalized" },
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

async function serveTrending(): Promise<NextResponse> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`
    )
    const data = await res.json()
    return NextResponse.json(
      data.results?.slice(0, 12) ?? [],
      { headers: { "X-Recommendation-Type": "trending" } }
    )
  } catch {
    return NextResponse.json([], {
      headers: { "X-Recommendation-Type": "trending" },
    })
  }
}
