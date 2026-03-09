"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import StarRating from "./StarRating"
import { Rating } from "@/types"

type ReviewFormProps = {
  movieId: string
  existingRating?: Rating
  genreIds?: number[]
}

export default function ReviewForm({ movieId, existingRating, genreIds = [] }: ReviewFormProps) {
  const [score, setScore] = useState(existingRating?.score || 0)
  const [review, setReview] = useState(existingRating?.review || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (score === 0) {
      setError("Please select a rating")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        setError("You must be logged in to submit a review")
        return
      }

      const res = await fetch("/api/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId, score, review, genre_ids: genreIds }),
      })

      if (res.ok) {
        setSuccess("Review saved!")
      } else {
        const data = await res.json()
        setError(data.error || "Failed to save review")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-[family-name:var(--font-dm-sans)]">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium">
            Your Rating
          </label>
          <StarRating value={score} onChange={setScore} />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium">
            Your Review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your thoughts about this movie..."
            rows={4}
            className="w-full bg-white/5 text-white placeholder-[#525252] px-4 py-3 rounded-lg border border-white/5 focus:border-[#e50914] focus-glow outline-none transition-all duration-300 text-sm resize-none"
          />
        </div>

        {error && (
          <p className="text-[#ff6b6b] text-sm">{error}</p>
        )}
        {success && (
          <p className="text-[#10b981] text-sm">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-red text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  )
}
