"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"

type Stats = {
  totalUsers: number
  totalMoviesCached: number
  totalRatings: number
  totalWatchlist: number
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setStats(await res.json())
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [])

  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-[#e50914]/20 to-[#e50914]/5",
      border: "border-[#e50914]/20",
      iconColor: "text-[#e50914]",
    },
    {
      label: "Movies Cached",
      value: stats?.totalMoviesCached,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      color: "from-[#f59e0b]/20 to-[#f59e0b]/5",
      border: "border-[#f59e0b]/20",
      iconColor: "text-[#f59e0b]",
    },
    {
      label: "Total Ratings",
      value: stats?.totalRatings,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: "from-[#10b981]/20 to-[#10b981]/5",
      border: "border-[#10b981]/20",
      iconColor: "text-[#10b981]",
    },
    {
      label: "Watchlist Entries",
      value: stats?.totalWatchlist,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: "from-[#8b5cf6]/20 to-[#8b5cf6]/5",
      border: "border-[#8b5cf6]/20",
      iconColor: "text-[#8b5cf6]",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`glass rounded-2xl p-6 border ${card.border} bg-gradient-to-br ${card.color}`}
        >
          <div className={`${card.iconColor} mb-4`}>{card.icon}</div>
          {loading ? (
            <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse mb-1" />
          ) : (
            <p className="text-3xl font-bold text-white font-[family-name:var(--font-playfair)]">
              {card.value ?? "—"}
            </p>
          )}
          <p className="text-[#a3a3a3] text-sm mt-1 font-[family-name:var(--font-dm-sans)]">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  )
}