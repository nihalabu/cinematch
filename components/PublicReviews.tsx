"use client"

import { useEffect, useState } from "react"
import StarRating from "./StarRating"

type PublicReview = {
  uid: string
  score: number
  review: string
  timestamp: string | null
  displayName: string | null
}

export default function PublicReviews({
  movieId,
  currentUserId,
  refreshTrigger,
}: {
  movieId: string
  currentUserId?: string
  refreshTrigger?: number
}) {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/movie?reviews=${movieId}`)
        if (res.ok) {
          const data = await res.json()
          setReviews(Array.isArray(data) ? data : [])
        }
      } catch {
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [movieId, refreshTrigger])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/4 mb-3" />
            <div className="h-3 bg-white/10 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <p className="text-[#525252] text-sm font-[family-name:var(--font-dm-sans)]">
        No reviews yet. Be the first to review!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const isOwnReview = r.uid === currentUserId
        return (
          <div
            key={r.uid}
            className={`glass rounded-2xl p-5 border ${
              isOwnReview
                ? "border-[#e50914]/20 bg-[#e50914]/[0.03]"
                : "border-white/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914]/30 to-[#e50914]/10 flex items-center justify-center border border-[#e50914]/20 flex-shrink-0">
                  <span className="text-[#e50914] text-xs font-bold font-[family-name:var(--font-dm-sans)]">
                    {r.displayName?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <span className="text-white text-sm font-medium font-[family-name:var(--font-dm-sans)]">
                    {r.displayName || "Anonymous"}
                    {isOwnReview && (
                      <span className="ml-2 text-[10px] text-[#e50914] border border-[#e50914]/30 rounded-full px-2 py-0.5">
                        You
                      </span>
                    )}
                  </span>
                  {r.timestamp && (
                    <p className="text-[#525252] text-xs font-[family-name:var(--font-dm-sans)]">
                      {new Date(r.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <StarRating value={r.score} readonly />
            </div>

            {r.review && (
              <p className="text-[#a3a3a3] text-sm leading-relaxed mt-3 font-[family-name:var(--font-dm-sans)] font-light">
                {r.review}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}