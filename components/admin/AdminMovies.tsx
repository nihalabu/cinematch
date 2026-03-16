"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { auth } from "@/lib/firebase"

type MovieRow = {
  id: string
  title: string
  poster_url: string | null
  vote_average: number
  original_language: string
  cachedAt: string | null
}

export default function AdminMovies() {
  const [movies, setMovies] = useState<MovieRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const fetchMovies = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch("/api/admin/movies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setMovies(await res.json())
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMovies() }, [])

  const handleDelete = async (movieId: string) => {
    if (!confirm("Remove this movie from cache?")) return
    setActionLoading(movieId)
    try {
      const token = await auth.currentUser?.getIdToken()
      await fetch("/api/admin/movies", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
      })
      await fetchMovies()
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <input
          type="text"
          placeholder="Search cached movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white/5 text-white placeholder-[#525252] px-4 py-2.5 rounded-lg border border-white/10 focus:border-[#e50914] outline-none transition-all duration-300 text-sm font-[family-name:var(--font-dm-sans)]"
        />
        <span className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)] ml-4 whitespace-nowrap">
          {movies.length} cached
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[#525252] text-sm font-[family-name:var(--font-dm-sans)]">No movies found.</p>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm font-[family-name:var(--font-dm-sans)]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4">Movie</th>
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4 hidden md:table-cell">Language</th>
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4 hidden md:table-cell">Rating</th>
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4 hidden lg:table-cell">Cached At</th>
                <th className="text-right text-xs uppercase tracking-wider text-[#525252] px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-12 relative flex-shrink-0 rounded overflow-hidden bg-[#141414]">
                        {m.poster_url ? (
                          <Image src={m.poster_url} alt={m.title} fill className="object-cover" sizes="32px" />
                        ) : (
                          <div className="w-full h-full bg-[#1f1f1f]" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium truncate max-w-[180px]">{m.title}</p>
                        <p className="text-[#525252] text-xs mt-0.5">ID: {m.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#a3a3a3] uppercase hidden md:table-cell">{m.original_language}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-[#f59e0b] text-xs font-semibold">⭐ {m.vote_average.toFixed(1)}</span>
                  </td>
                  <td className="px-5 py-3 text-[#525252] text-xs hidden lg:table-cell">
                    {m.cachedAt ? new Date(m.cachedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(m.id)}
                        disabled={actionLoading === m.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#e50914]/10 text-[#e50914] hover:bg-[#e50914]/20 border border-[#e50914]/20 transition-all duration-200 disabled:opacity-50"
                      >
                        {actionLoading === m.id ? "..." : "Remove"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}