"use client"

import { useState } from "react"

type StarRatingProps = {
  value: number
  onChange?: (n: number) => void
  readonly?: boolean
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hoverValue ? star <= hoverValue : star <= value
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={`text-2xl transition-all duration-300 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } ${filled ? "text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "text-[#2a2a2a]"}`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
