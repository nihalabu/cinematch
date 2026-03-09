"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import MovieCard from "@/components/MovieCard"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { TMDBMovie } from "@/types"

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [recType, setRecType] = useState<"personalized" | "trending" | null>(null)
  const [ratedCount, setRatedCount] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchRecommendations = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) return

        const res = await fetch("/api/recommend", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const type = res.headers.get("X-Recommendation-Type")
          setRecType(type === "trending" ? "trending" : "personalized")

          const data = await res.json()
          setMovies(Array.isArray(data) ? data : [])
        } else {
          setMovies([])
        }
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [user])

  // Fetch rated count for progress bar
  useEffect(() => {
    if (!user) return

    const fetchRatedCount = async () => {
      try {
        const { db } = await import("@/lib/firebase")
        const { collection, getDocs } = await import("firebase/firestore")
        const snap = await getDocs(collection(db, "ratings", user.uid, user.uid))
        setRatedCount(snap.size)
      } catch {
        // silently fail
      }
    }
    fetchRatedCount()
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-[#e50914]/10 rounded-full animate-pulse-glow" />
          <div className="relative text-3xl font-bold tracking-wider font-[family-name:var(--font-playfair)] italic">
            <span className="text-[#e50914]">Cine</span>
            <span className="text-white">Match</span>
          </div>
        </div>
      </div>
    )
  }

  const progressTarget = 5
  const progressPercent = Math.min((ratedCount / progressTarget) * 100, 100)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)] italic">
            {recType === "trending" ? "Trending Now" : "Recommended For You"}
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-2 font-[family-name:var(--font-dm-sans)] font-light tracking-wide">
            {recType === "trending"
              ? "Start rating movies to get personalized picks"
              : "Based on your ratings and favorite genres"}
          </p>
        </div>

        {/* Trending banner with progress bar */}
        {recType === "trending" && (
          <div className="mb-8 glass rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-white text-sm font-medium font-[family-name:var(--font-dm-sans)]">
                Rate at least {progressTarget} movies to unlock personalized recommendations
              </p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e50914] to-[#f59e0b] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[#a3a3a3] text-xs mt-2 font-[family-name:var(--font-dm-sans)]">
              {ratedCount} / {progressTarget} movies rated
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="aspect-[2/3] bg-[#141414] animate-pulse" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <svg className="w-16 h-16 text-[#525252] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <p className="text-[#525252] text-lg mb-2 font-[family-name:var(--font-playfair)] italic">
              No recommendations yet
            </p>
            <p className="text-[#525252] text-sm mb-6 font-[family-name:var(--font-dm-sans)] font-light">
              Rate some movies first to get personalized suggestions
            </p>
            <Link
              href="/"
              className="bg-gradient-red text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] text-sm font-[family-name:var(--font-dm-sans)]"
            >
              Start Rating
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {movies.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                showWatchlistButton
                animationDelay={i * 80}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
