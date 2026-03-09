"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import MovieCard from "@/components/MovieCard"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { WatchlistItem } from "@/types"

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchWatchlist = async () => {
      try {
        const snap = await getDocs(
          collection(db, "watchlist", user.uid, user.uid)
        )
        const watchlistItems: WatchlistItem[] = snap.docs.map((doc) => {
          const data = doc.data()
          return {
            movieId: data.movieId,
            title: data.title,
            poster: data.poster,
            addedAt: data.addedAt?.toDate?.() || new Date(),
          }
        })
        setItems(watchlistItems)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchWatchlist()
  }, [user])

  const handleWatchlistChange = () => {
    if (!user) return
    const refetch = async () => {
      const snap = await getDocs(
        collection(db, "watchlist", user.uid, user.uid)
      )
      const watchlistItems: WatchlistItem[] = snap.docs.map((doc) => {
        const data = doc.data()
        return {
          movieId: data.movieId,
          title: data.title,
          poster: data.poster,
          addedAt: data.addedAt?.toDate?.() || new Date(),
        }
      })
      setItems(watchlistItems)
    }
    refetch()
  }

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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)] italic">
            My Watchlist
          </h1>
          {!loading && (
            <span className="bg-white/5 backdrop-blur-sm text-[#a3a3a3] border border-white/10 rounded-full px-3 py-1 text-xs font-semibold font-[family-name:var(--font-dm-sans)]">
              {items.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="aspect-[2/3] bg-[#141414] animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <svg className="w-16 h-16 text-[#525252] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-[#525252] text-lg mb-2 font-[family-name:var(--font-playfair)] italic">
              Your watchlist is empty
            </p>
            <p className="text-[#525252] text-sm mb-6 font-[family-name:var(--font-dm-sans)] font-light">
              Start saving movies you want to watch
            </p>
            <Link
              href="/"
              className="bg-gradient-red text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] text-sm font-[family-name:var(--font-dm-sans)]"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {items.map((item, i) => (
              <MovieCard
                key={item.movieId}
                movie={{
                  id: Number(item.movieId) || 0,
                  title: item.title,
                  poster_path: null,
                  poster_url: item.poster || null,
                }}
                showWatchlistButton
                isInWatchlist
                onWatchlistChange={handleWatchlistChange}
                animationDelay={i * 80}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
