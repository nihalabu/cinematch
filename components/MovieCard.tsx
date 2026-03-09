"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { useState } from "react"

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

type MovieCardProps = {
  movie: {
    id: number
    title: string
    poster_path: string | null
    poster_url?: string | null
    release_date?: string
    vote_average?: number
  }
  showWatchlistButton?: boolean
  isInWatchlist?: boolean
  onWatchlistChange?: () => void
  animationDelay?: number
}

export default function MovieCard({
  movie,
  showWatchlistButton = false,
  isInWatchlist = false,
  onWatchlistChange,
  animationDelay = 0,
}: MovieCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist)
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  const handleClick = () => {
    router.push(`/movie/${movie.id}`)
  }

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user || watchlistLoading) return

    setWatchlistLoading(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return

      const movieId = String(movie.id)

      if (inWatchlist) {
        await fetch("/api/watchlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movieId }),
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
            movieId,
            title: movie.title,
            poster: movie.poster_path
              ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
              : "",
          }),
        })
        setInWatchlist(true)
      }
      onWatchlistChange?.()
    } finally {
      setWatchlistLoading(false)
    }
  }

  const posterUrl = movie.poster_url
    || (movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null)
  const year = movie.release_date ? movie.release_date.slice(0, 4) : ""
  const rating =
    movie.vote_average != null && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null

  return (
    <div
      onClick={handleClick}
      style={{ animationDelay: `${Math.min(animationDelay, 500)}ms` }}
      className="opacity-0 animate-fade-in-up relative rounded-xl cursor-pointer overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(229,9,20,0.15)] hover:scale-105 transition-all duration-300"
    >
      {/* Watchlist heart */}
      {showWatchlistButton && user && (
        <button
          onClick={toggleWatchlist}
          disabled={watchlistLoading}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[#0a0a0a]/70 backdrop-blur-sm transition-all duration-300 hover:bg-[#0a0a0a]/90"
          aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {watchlistLoading ? (
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg
              className={`w-5 h-5 transition-all duration-300 ${
                inWatchlist ? "text-[#e50914] fill-[#e50914] drop-shadow-[0_0_6px_rgba(229,9,20,0.6)]" : "text-[#a3a3a3]"
              }`}
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
        </button>
      )}

      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden bg-[#141414]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#525252]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/20 to-transparent" />

        {/* Info overlay on poster */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-sm truncate font-[family-name:var(--font-playfair)]">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            {year && (
              <span className="text-[#a3a3a3] text-xs font-[family-name:var(--font-dm-sans)]">{year}</span>
            )}
            {rating && (
              <span className="bg-[#0a0a0a]/70 backdrop-blur-sm text-[#f59e0b] text-xs font-semibold px-2 py-0.5 rounded-full font-[family-name:var(--font-dm-sans)]">
                ⭐ {rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
