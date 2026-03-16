"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { auth } from "@/lib/firebase"

type UserRow = {
  uid: string
  name: string
  email: string
  role: string
  createdAt: string | null
  ratingsCount: number
  watchlistCount: number
}

type RatingDetail = {
  movieId: string
  title: string | null
  poster: string | null
  score: number
  review: string
  timestamp: string | null
}

type WatchlistDetail = {
  movieId: string
  title: string
  poster: string
  addedAt: string | null
}

type UserDetail = {
  ratings: RatingDetail[]
  watchlist: WatchlistDetail[]
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<Record<string, UserDetail>>({})
  const [detailLoading, setDetailLoading] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<Record<string, "ratings" | "watchlist">>({})

  const fetchUsers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setUsers(await res.json())
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetail = async (uid: string) => {
    if (userDetails[uid]) return
    setDetailLoading(uid)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch(`/api/admin/users/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserDetails((prev) => ({ ...prev, [uid]: data }))
        setActiveDetailTab((prev) => ({ ...prev, [uid]: "ratings" }))
      }
    } catch {
      // silently fail
    } finally {
      setDetailLoading(null)
    }
  }

  const handleExpand = async (uid: string) => {
    if (expandedUser === uid) {
      setExpandedUser(null)
      return
    }
    setExpandedUser(uid)
    await fetchUserDetail(uid)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleRoleToggle = async (targetUid: string, currentRole: string) => {
    setActionLoading(targetUid)
    try {
      const token = await auth.currentUser?.getIdToken()
      const newRole = currentRole === "admin" ? "user" : "admin"
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUid, role: newRole }),
      })
      await fetchUsers()
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (targetUid: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return
    setActionLoading(targetUid)
    try {
      const token = await auth.currentUser?.getIdToken()
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUid }),
      })
      await fetchUsers()
      setExpandedUser(null)
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteRating = async (uid: string, movieId: string) => {
    if (!confirm("Delete this rating?")) return
    try {
      const token = await auth.currentUser?.getIdToken()
      await fetch(`/api/admin/users/${uid}/ratings`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
      })
      setUserDetails((prev) => ({
        ...prev,
        [uid]: {
          ...prev[uid],
          ratings: prev[uid].ratings.filter((r) => r.movieId !== movieId),
        },
      }))
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid ? { ...u, ratingsCount: u.ratingsCount - 1 } : u
        )
      )
    } catch {
      // silently fail
    }
  }

  const handleDeleteWatchlist = async (uid: string, movieId: string) => {
    if (!confirm("Remove from watchlist?")) return
    try {
      const token = await auth.currentUser?.getIdToken()
      await fetch(`/api/admin/users/${uid}/watchlist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
      })
      setUserDetails((prev) => ({
        ...prev,
        [uid]: {
          ...prev[uid],
          watchlist: prev[uid].watchlist.filter((w) => w.movieId !== movieId),
        },
      }))
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid ? { ...u, watchlistCount: u.watchlistCount - 1 } : u
        )
      )
    } catch {
      // silently fail
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white/5 text-white placeholder-[#525252] px-4 py-2.5 rounded-lg border border-white/10 focus:border-[#e50914] outline-none transition-all duration-300 text-sm font-[family-name:var(--font-dm-sans)]"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[#525252] text-sm font-[family-name:var(--font-dm-sans)]">No users found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.uid} className="glass rounded-2xl overflow-hidden border border-white/5">
              {/* User row */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e50914]/30 to-[#e50914]/10 flex items-center justify-center flex-shrink-0 border border-[#e50914]/20">
                    <span className="text-[#e50914] text-sm font-bold font-[family-name:var(--font-dm-sans)]">
                      {u.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm font-[family-name:var(--font-dm-sans)] truncate">
                        {u.name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${u.role === "admin"
                          ? "bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30"
                          : "bg-white/5 text-[#a3a3a3] border border-white/10"
                        }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[#525252] text-xs mt-0.5 font-[family-name:var(--font-dm-sans)]">
                      {u.email}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 mx-6">
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold font-[family-name:var(--font-dm-sans)]">{u.ratingsCount}</p>
                    <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">Ratings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold font-[family-name:var(--font-dm-sans)]">{u.watchlistCount}</p>
                    <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">Watchlist</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleExpand(u.uid)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white border border-white/10 transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
                  >
                    {expandedUser === u.uid ? "Collapse" : "View"}
                  </button>
                  <button
                    onClick={() => handleRoleToggle(u.uid, u.role)}
                    disabled={actionLoading === u.uid}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white border border-white/10 transition-all duration-200 disabled:opacity-50 hidden sm:block font-[family-name:var(--font-dm-sans)]"
                  >
                    {actionLoading === u.uid ? "..." : u.role === "admin" ? "Demote" : "Make Admin"}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.uid)}
                    disabled={actionLoading === u.uid}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#e50914]/10 text-[#e50914] hover:bg-[#e50914]/20 border border-[#e50914]/20 transition-all duration-200 disabled:opacity-50 font-[family-name:var(--font-dm-sans)]"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedUser === u.uid && (
                <div className="border-t border-white/5 px-5 pb-5 pt-4">
                  {detailLoading === u.uid ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : userDetails[u.uid] ? (
                    <div>
                      {/* Sub tabs */}
                      <div className="flex gap-1 mb-4">
                        <button
                          onClick={() => setActiveDetailTab((prev) => ({ ...prev, [u.uid]: "ratings" }))}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 font-[family-name:var(--font-dm-sans)] ${activeDetailTab[u.uid] === "ratings"
                              ? "bg-[#e50914] text-white"
                              : "bg-white/5 text-[#a3a3a3] hover:text-white"
                            }`}
                        >
                          Ratings ({userDetails[u.uid].ratings.length})
                        </button>
                        <button
                          onClick={() => setActiveDetailTab((prev) => ({ ...prev, [u.uid]: "watchlist" }))}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 font-[family-name:var(--font-dm-sans)] ${activeDetailTab[u.uid] === "watchlist"
                              ? "bg-[#e50914] text-white"
                              : "bg-white/5 text-[#a3a3a3] hover:text-white"
                            }`}
                        >
                          Watchlist ({userDetails[u.uid].watchlist.length})
                        </button>
                      </div>

                      {/* Ratings */}
                      {activeDetailTab[u.uid] === "ratings" && (
                        <div className="space-y-2">
                          {userDetails[u.uid].ratings.length === 0 ? (
                            <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">No ratings yet.</p>
                          ) : (
                            userDetails[u.uid].ratings.map((r) => (
                              <div key={r.movieId} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-4 py-3 border border-white/5">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-11 relative flex-shrink-0 rounded overflow-hidden bg-[#141414]">
                                    {r.poster ? (
                                      <Image src={r.poster} alt={r.title || ""} fill className="object-cover" sizes="32px" />
                                    ) : (
                                      <div className="w-full h-full bg-[#1f1f1f]" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-white text-xs font-medium truncate font-[family-name:var(--font-dm-sans)]">
                                      {r.title || `Movie ${r.movieId}`}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-[#f59e0b] text-xs font-semibold font-[family-name:var(--font-dm-sans)]">
                                        {"★".repeat(r.score)}{"☆".repeat(5 - r.score)}
                                      </span>
                                      {r.timestamp && (
                                        <span className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">
                                          {new Date(r.timestamp).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                    {r.review && (
                                      <p className="text-[#a3a3a3] text-xs mt-1 truncate font-[family-name:var(--font-dm-sans)]">
                                        &ldquo;{r.review}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteRating(u.uid, r.movieId)}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-[#e50914]/10 text-[#e50914] hover:bg-[#e50914]/20 border border-[#e50914]/20 transition-all duration-200 ml-3 flex-shrink-0 font-[family-name:var(--font-dm-sans)]"
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Watchlist */}
                      {activeDetailTab[u.uid] === "watchlist" && (
                        <div className="space-y-2">
                          {userDetails[u.uid].watchlist.length === 0 ? (
                            <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">Watchlist is empty.</p>
                          ) : (
                            userDetails[u.uid].watchlist.map((w) => (
                              <div key={w.movieId} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-4 py-3 border border-white/5">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-11 relative flex-shrink-0 rounded overflow-hidden bg-[#141414]">
                                    {w.poster ? (
                                      <Image src={w.poster} alt={w.title} fill className="object-cover" sizes="32px" />
                                    ) : (
                                      <div className="w-full h-full bg-[#1f1f1f]" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white text-xs font-medium truncate font-[family-name:var(--font-dm-sans)]">{w.title}</p>
                                    {w.addedAt && (
                                      <p className="text-[#525252] text-xs mt-0.5 font-[family-name:var(--font-dm-sans)]">
                                        Added {new Date(w.addedAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteWatchlist(u.uid, w.movieId)}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-[#e50914]/10 text-[#e50914] hover:bg-[#e50914]/20 border border-[#e50914]/20 transition-all duration-200 ml-3 flex-shrink-0 font-[family-name:var(--font-dm-sans)]"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">Failed to load details.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}