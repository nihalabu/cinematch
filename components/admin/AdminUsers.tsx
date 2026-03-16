"use client"

import { useEffect, useState } from "react"
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

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState("")

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

  const handleDelete = async (targetUid: string) => {
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
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
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
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm font-[family-name:var(--font-dm-sans)]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4">User</th>
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4 hidden md:table-cell">Joined</th>
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4 hidden lg:table-cell">Ratings</th>
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4 hidden lg:table-cell">Watchlist</th>
                <th className="text-left text-xs uppercase tracking-wider text-[#525252] px-5 py-4">Role</th>
                <th className="text-right text-xs uppercase tracking-wider text-[#525252] px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">{u.name}</p>
                    <p className="text-[#525252] text-xs mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#a3a3a3] hidden md:table-cell">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4 text-[#a3a3a3] hidden lg:table-cell">{u.ratingsCount}</td>
                  <td className="px-5 py-4 text-[#a3a3a3] hidden lg:table-cell">{u.watchlistCount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.role === "admin"
                        ? "bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30"
                        : "bg-white/5 text-[#a3a3a3] border border-white/10"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleToggle(u.uid, u.role)}
                        disabled={actionLoading === u.uid}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white border border-white/10 transition-all duration-200 disabled:opacity-50"
                      >
                        {actionLoading === u.uid ? "..." : u.role === "admin" ? "Demote" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.uid)}
                        disabled={actionLoading === u.uid}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#e50914]/10 text-[#e50914] hover:bg-[#e50914]/20 border border-[#e50914]/20 transition-all duration-200 disabled:opacity-50"
                      >
                        Delete
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