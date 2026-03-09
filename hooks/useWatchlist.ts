"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { WatchlistItem } from "@/types"

export function useWatchlist() {
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWatchlist = async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

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

  useEffect(() => {
    fetchWatchlist()
  }, [user])

  const isInWatchlist = (movieId: string) =>
    items.some((item) => item.movieId === movieId)

  const addToWatchlist = async (movieId: string, title: string, poster: string) => {
    if (!user) return false

    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return false

      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId, title, poster }),
      })

      if (res.ok) {
        await fetchWatchlist()
        return true
      }
    } catch {
      // silently fail
    }
    return false
  }

  const removeFromWatchlist = async (movieId: string) => {
    if (!user) return false

    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return false

      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
      })

      if (res.ok) {
        await fetchWatchlist()
        return true
      }
    } catch {
      // silently fail
    }
    return false
  }

  return {
    items,
    loading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    refetch: fetchWatchlist,
  }
}
