"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"

type Suggestion = {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

type SearchBarProps = {
  onSearch: (query: string) => void
  loading?: boolean
}

export default function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const res = await fetch(`/api/movie?suggestions=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data.slice(0, 6) : [])
        setShowSuggestions(true)
      }
    } catch {
      setSuggestions([])
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      onSearch(trimmed)
      setShowSuggestions(false)
      setSuggestions([])
    } else {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.title)
    setShowSuggestions(false)
    setSuggestions([])
    onSearch(suggestion.title)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className={`flex w-full font-[family-name:var(--font-dm-sans)] ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder="Search for movies..."
          className="flex-1 bg-[#1f1f1f] text-white placeholder-[#525252] px-6 py-4 rounded-l-full border border-transparent focus:border-[#e50914] focus-glow outline-none transition-all duration-300 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-red text-white px-8 py-4 rounded-r-full font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
          Search
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-[#1f1f1f] border border-[#333] rounded-2xl z-50 overflow-hidden shadow-xl">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSuggestionClick(s)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/5 transition-colors duration-200"
            >
              {/* Poster thumbnail */}
              <div className="w-10 h-14 relative flex-shrink-0 rounded overflow-hidden bg-[#141414]">
                {s.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${s.poster_path}`}
                    alt={s.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#525252]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate font-[family-name:var(--font-dm-sans)]">
                  {s.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {s.release_date && (
                    <span className="text-[#a3a3a3] text-xs font-[family-name:var(--font-dm-sans)]">
                      {s.release_date.slice(0, 4)}
                    </span>
                  )}
                  {s.vote_average > 0 && (
                    <span className="text-[#f59e0b] text-xs font-semibold font-[family-name:var(--font-dm-sans)]">
                      ⭐ {s.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
