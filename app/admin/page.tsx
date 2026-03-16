"use client"

import { useState, useEffect } from "react"

const ADMIN_HEADER = { "x-admin-token": "cinematch-admin-secret" }

type Stats = {
  totalUsers: number
  totalMovies: number
  totalReviews: number
  totalWatchlistItems: number
}

const statCards = [
  {
    key: "totalUsers" as keyof Stats,
    label: "Total Users",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: "from-[#e50914] to-[#b81c23]",
    glow: "rgba(229, 9, 20, 0.15)",
  },
  {
    key: "totalMovies" as keyof Stats,
    label: "Cached Movies",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    gradient: "from-[#f59e0b] to-[#d97706]",
    glow: "rgba(245, 158, 11, 0.15)",
  },
  {
    key: "totalReviews" as keyof Stats,
    label: "Total Reviews",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    gradient: "from-[#10b981] to-[#059669]",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  {
    key: "totalWatchlistItems" as keyof Stats,
    label: "Watchlist Items",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: "from-[#8b5cf6] to-[#7c3aed]",
    glow: "rgba(139, 92, 246, 0.15)",
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", { headers: ADMIN_HEADER })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-playfair)]">
          Welcome back, <span className="text-[#e50914] italic">Admin</span>
        </h1>
        <p className="text-[#a3a3a3] text-sm mt-2 font-[family-name:var(--font-dm-sans)] font-light">
          Here&apos;s an overview of your CineMatch platform.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.key}
            className="glass rounded-2xl p-6 animate-fade-in-up group hover:scale-[1.02] transition-all duration-300"
            style={{
              animationDelay: `${i * 100}ms`,
              boxShadow: `0 0 30px ${card.glow}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white`}>
                {card.icon}
              </div>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 bg-white/5 rounded-lg w-16 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-24 animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-white font-[family-name:var(--font-dm-sans)]">
                  {stats?.[card.key]?.toLocaleString() ?? 0}
                </p>
                <p className="text-[#a3a3a3] text-xs mt-1 font-[family-name:var(--font-dm-sans)] font-medium tracking-wide">
                  {card.label}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <h2 className="text-xl font-bold text-white font-[family-name:var(--font-playfair)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="glass glass-hover rounded-xl p-5 flex items-center gap-4 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e50914]/10 flex items-center justify-center text-[#e50914] group-hover:bg-[#e50914]/20 transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold font-[family-name:var(--font-dm-sans)]">Manage Users</p>
              <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">View, disable, or delete users</p>
            </div>
          </a>

          <a
            href="/admin/reviews"
            className="glass glass-hover rounded-xl p-5 flex items-center gap-4 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/20 transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold font-[family-name:var(--font-dm-sans)]">Manage Reviews</p>
              <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">View and moderate all reviews</p>
            </div>
          </a>

          <a
            href="/admin/movies"
            className="glass glass-hover rounded-xl p-5 flex items-center gap-4 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] group-hover:bg-[#f59e0b]/20 transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-semibold font-[family-name:var(--font-dm-sans)]">Manage Movies</p>
              <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">View and manage movie cache</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
