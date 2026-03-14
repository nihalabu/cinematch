"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import ReviewForm from "@/components/ReviewForm"
import { useAuth } from "@/context/AuthContext"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { TMDBMovieDetail, Rating, TMDBMovie } from "@/types"
import MovieCard from "@/components/MovieCard"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([])
  const [similarLoading, setSimilarLoading] = useState(true)
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [movie, setMovie] = useState<TMDBMovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [existingRating, setExistingRating] = useState<Rating | undefined>()

  // Fetch movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movie?id=${id}`)
        if (res.ok) {
          const data = await res.json()
          setMovie(data)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchMovie()
  }, [id])

  // Check watchlist & existing rating
  useEffect(() => {
    if (!user) return

    const checkUserData = async () => {
      try {
        const watchlistDoc = await getDoc(
          doc(db, "watchlist", user.uid, user.uid, id)
        )
        setInWatchlist(watchlistDoc.exists())

        const ratingDoc = await getDoc(
          doc(db, "ratings", user.uid, user.uid, id)
        )
        if (ratingDoc.exists()) {
          const data = ratingDoc.data()
          setExistingRating({
            movieId: id,
            score: data.score,
            review: data.review,
            timestamp: data.timestamp?.toDate?.() || new Date(),
          })
        }
      } catch {
        // silently fail
      }
    }
    checkUserData()
  }, [user, id])
  useEffect(() => {
    if (!id) return
    const fetchSimilar = async () => {
      try {
        const res = await fetch(`/api/movie?similar=${id}`)
        if (res.ok) {
          const data = await res.json()
          setSimilarMovies(Array.isArray(data) ? data : [])
        }
      } catch {
        // silently fail
      } finally {
        setSimilarLoading(false)
      }
    }
    fetchSimilar()
  }, [id])

  const toggleWatchlist = async () => {
    if (!user || watchlistLoading) return

    setWatchlistLoading(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token || !movie) return

      const posterUrl = movie.poster_path
        ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
        : ""

      if (inWatchlist) {
        await fetch("/api/watchlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movieId: id }),
        })
        setInWatchlist(false)
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movieId: id,
            title: movie.title,
            poster: posterUrl,
          }),
        })
        setInWatchlist(true)
      }
    } finally {
      setWatchlistLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-[40%] aspect-[2/3] bg-[#141414] rounded-xl animate-pulse" />
            <div className="flex-1 space-y-4">
              <div className="h-10 bg-[#141414] rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-[#141414] rounded-lg w-1/2 animate-pulse" />
              <div className="h-4 bg-[#141414] rounded-lg w-1/4 animate-pulse" />
              <div className="h-32 bg-[#141414] rounded-lg animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-[#525252] text-lg font-[family-name:var(--font-dm-sans)]">Movie not found</p>
          </div>
        </div>
      </div>
    )
  }

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null
  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}`
    : null
  const genres = movie.genres || []
  const year = movie.release_date ? movie.release_date.slice(0, 4) : ""
  const runtimeStr = movie.runtime ? `${movie.runtime} min` : ""
  const director = movie.credits?.crew?.find(
    (c) => c.job === "Director"
  )
  const cast = movie.credits?.cast?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <Navbar />

      {/* Blurred backdrop image */}
      {(backdropUrl || posterUrl) && (
        <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden z-0">
          <Image
            src={backdropUrl || posterUrl!}
            alt=""
            fill
            className="object-cover blur-3xl opacity-20 scale-110"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 animate-fade-in-up">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#a3a3a3] hover:text-white transition-colors duration-300 mb-8 group font-[family-name:var(--font-dm-sans)] text-sm"
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster */}
          <div className="w-full md:w-[40%] flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-[#141414] glow-red-intense">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#525252]">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)]">
              {movie.title}
            </h1>

            <div className="flex items-center gap-4 mt-3 text-[#a3a3a3] text-sm font-[family-name:var(--font-dm-sans)]">
              {year && <span>{year}</span>}
              {runtimeStr && <span>{runtimeStr}</span>}
            </div>

            {/* TMDB rating */}
            {movie.vote_average > 0 && (
              <div className="mt-4">
                <span className="text-[#f59e0b] text-lg font-semibold font-[family-name:var(--font-dm-sans)]">
                  ⭐ {movie.vote_average.toFixed(1)}
                  <span className="text-[#a3a3a3] text-sm ml-1">TMDB</span>
                </span>
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-white/5 backdrop-blur-sm text-[#a3a3a3] border border-white/10 rounded-full px-3 py-1 text-xs font-[family-name:var(--font-dm-sans)]"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <p className="text-[#a3a3a3] leading-relaxed mt-6 text-lg font-light font-[family-name:var(--font-dm-sans)]">
                {movie.overview}
              </p>
            )}

            {/* Director & Cast */}
            <div className="mt-6 space-y-2 font-[family-name:var(--font-dm-sans)]">
              {director && (
                <p className="text-[#525252] text-sm">
                  <span className="text-[#a3a3a3]">Director:</span> {director.name}
                </p>
              )}
              {cast.length > 0 && (
                <p className="text-[#525252] text-sm">
                  <span className="text-[#a3a3a3]">Cast:</span>{" "}
                  {cast.map((a) => a.name).join(", ")}
                </p>
              )}
            </div>

            {/* Gradient divider */}
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Watchlist toggle */}
            {user && (
              <button
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-sm flex items-center gap-2 mb-8 font-[family-name:var(--font-dm-sans)] ${inWatchlist
                  ? "glass text-white"
                  : "border-2 border-[#e50914] text-[#e50914] hover:bg-gradient-red hover:text-white hover:border-transparent hover:shadow-[0_0_20px_rgba(229,9,20,0.3)]"
                  } disabled:opacity-50`}
              >
                {watchlistLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg
                    className={`w-4 h-4 ${inWatchlist ? "fill-[#e50914] text-[#e50914]" : ""}`}
                    fill={inWatchlist ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            )}

            {/* Review form */}
            {user && movie && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4 font-[family-name:var(--font-playfair)]">Your Review</h2>
                <ReviewForm
                  movieId={id}
                  existingRating={existingRating}
                  genreIds={movie.genres?.map((g) => g.id) || movie.genre_ids || []}
                />
              </div>
            )}
          </div>
        </div>
        {/* Similar Movies */}
        <div className="mt-16">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />
          <h2 className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)] italic mb-6">
            More Like This
          </h2>

          {similarLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-[#141414] animate-pulse">
                  <div className="aspect-[2/3] bg-[#1f1f1f]" />
                </div>
              ))}
            </div>
          ) : similarMovies.length === 0 ? (
            <p className="text-[#525252] text-sm font-[family-name:var(--font-dm-sans)]">
              No similar movies found.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {similarMovies.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  showWatchlistButton
                  animationDelay={i * 60}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
