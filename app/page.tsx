"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import MovieCard from "@/components/MovieCard"
import { TMDBMovie } from "@/types"

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
]

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
]

const LANGUAGE_OPTIONS = [
  { value: "", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ml", label: "Malayalam" },
  { value: "ta", label: "Tamil" },
  { value: "ko", label: "Korean" },
  { value: "ja", label: "Japanese" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
]

export default function HomePage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeGenre, setActiveGenre] = useState<number | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [sortBy, setSortBy] = useState("popularity.desc")
  const [language, setLanguage] = useState("")
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const res = await fetch("/api/movie?trending=1")
        if (res.ok) {
          const data = await res.json()
          setMovies(Array.isArray(data) ? data : [])
        }
      } catch {
        // silently fail
      } finally {
        setInitialLoading(false)
      }
    }
    loadTrending()
  }, [])

  const buildFilterParams = () => {
    const params = new URLSearchParams()
    if (sortBy) params.set("sort_by", sortBy)
    if (language) params.set("language", language)
    if (minRating > 0) params.set("min_rating", String(minRating))
    return params.toString()
  }

  const handleGenreClick = async (genreId: number) => {
    if (activeGenre === genreId) {
      setActiveGenre(null)
      setSearched(false)
      setSearchQuery("")
      setLoading(true)
      try {
        const res = await fetch("/api/movie?trending=1")
        if (res.ok) {
          const data = await res.json()
          setMovies(Array.isArray(data) ? data : [])
        }
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
      return
    }

    setActiveGenre(genreId)
    setSearched(true)
    setSearchQuery(GENRES.find((g) => g.id === genreId)?.name || "")
    setLoading(true)

    try {
      const filterParams = buildFilterParams()
      const res = await fetch(`/api/movie?genre=${genreId}&${filterParams}`)
      if (res.ok) {
        const data = await res.json()
        setMovies(Array.isArray(data) ? data : [])
      } else {
        setMovies([])
      }
    } catch {
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setActiveGenre(null)
    setSearched(true)
    setSearchQuery(query)
    setLoading(true)

    try {
      const res = await fetch(`/api/movie?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        let results: TMDBMovie[] = Array.isArray(data) ? data : []

        if (minRating > 0) {
          results = results.filter((m) => m.vote_average >= minRating)
        }
        if (language) {
          results = results.filter((m) => m.original_language === language)
        }
        if (sortBy === "vote_average.desc") {
          results.sort((a, b) => b.vote_average - a.vote_average)
        } else if (sortBy === "vote_average.asc") {
          results.sort((a, b) => a.vote_average - b.vote_average)
        } else if (sortBy === "release_date.desc") {
          results.sort((a, b) =>
            (b.release_date ?? "") > (a.release_date ?? "") ? 1 : -1
          )
        } else if (sortBy === "release_date.asc") {
          results.sort((a, b) =>
            (a.release_date ?? "") > (b.release_date ?? "") ? 1 : -1
          )
        }

        setMovies(results)
      } else {
        setMovies([])
      }
    } catch {
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = async () => {
    setShowFilters(false)

    if (!activeGenre && !searchQuery) {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (sortBy) params.set("sort_by", sortBy)
        if (language) params.set("language", language)
        if (minRating > 0) params.set("min_rating", String(minRating))
        const res = await fetch(`/api/movie?trending=1&${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setMovies(Array.isArray(data) ? data : [])
        }
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
      return
    }

    if (activeGenre) {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (sortBy) params.set("sort_by", sortBy)
        if (language) params.set("language", language)
        if (minRating > 0) params.set("min_rating", String(minRating))
        const res = await fetch(`/api/movie?genre=${activeGenre}&${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setMovies(Array.isArray(data) ? data : [])
        }
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
      return
    }

    if (searchQuery) {
      setLoading(true)
      try {
        const res = await fetch(`/api/movie?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          let results: TMDBMovie[] = Array.isArray(data) ? data : []
          if (minRating > 0) {
            results = results.filter((m) => m.vote_average >= minRating)
          }
          if (language) {
            results = results.filter((m) => m.original_language === language)
          }
          if (sortBy === "vote_average.desc") {
            results.sort((a, b) => b.vote_average - a.vote_average)
          } else if (sortBy === "vote_average.asc") {
            results.sort((a, b) => a.vote_average - b.vote_average)
          } else if (sortBy === "release_date.desc") {
            results.sort((a, b) =>
              (b.release_date ?? "") > (a.release_date ?? "") ? 1 : -1
            )
          } else if (sortBy === "release_date.asc") {
            results.sort((a, b) =>
              (a.release_date ?? "") > (b.release_date ?? "") ? 1 : -1
            )
          }
          setMovies(results)
        }
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
  }
  const handleResetFilters = async () => {
    setSortBy("popularity.desc")
    setLanguage("")
    setMinRating(0)
    setShowFilters(false)

    if (activeGenre) {
      setLoading(true)
      try {
        const res = await fetch(`/api/movie?genre=${activeGenre}`)
        if (res.ok) {
          const data = await res.json()
          setMovies(Array.isArray(data) ? data : [])
        }
      } catch {
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
  }

  const activeFilterCount = [
    sortBy !== "popularity.desc",
    language !== "",
    minRating > 0,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#0a0a0a] opacity-0 animate-fade-in">
      <Navbar />

      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, #141414 0%, #0a0a0a 70%)" }}
      >
        <div className="absolute top-20 left-[15%] w-72 h-72 bg-[#e50914]/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-32 right-[10%] w-96 h-96 bg-[#e50914]/5 rounded-full blur-3xl animate-float-reverse pointer-events-none" />
        <div className="absolute top-[40%] right-[30%] w-48 h-48 bg-[#e50914]/[0.08] rounded-full blur-3xl animate-float-slow pointer-events-none" />

        <div className="relative z-10 text-center px-8 animate-fade-in-up">
          <h1 className="font-[family-name:var(--font-playfair)] italic mb-4">
            <span className="text-white text-5xl md:text-6xl font-bold block">Find Your Next</span>
            <span className="text-[#e50914] text-5xl md:text-6xl font-extrabold block mt-2 text-glow-red">
              Favorite Movie
            </span>
          </h1>
          <p className="text-[#a3a3a3] text-lg font-light tracking-wide mb-10 max-w-xl mx-auto font-[family-name:var(--font-outfit)]">
            Discover, rate, and get personalized movie recommendations powered by your taste.
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Genre Pills */}
        <div
          className="relative z-10 mt-16 px-8 w-full max-w-3xl animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 font-[family-name:var(--font-dm-sans)] ${activeGenre === genre.id
                    ? "bg-[#e50914] text-white border border-[#e50914] shadow-[0_0_20px_rgba(229,9,20,0.3)]"
                    : "bg-white/5 backdrop-blur-sm text-[#a3a3a3] border border-white/10 hover:bg-white/10 hover:border-[#1f1f1f] hover:text-white"
                  }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-8 pb-24 relative z-0">
        {/* Filter bar — only shown when there are results */}
        {!initialLoading && movies.length > 0 && (
          <div className="pt-16 flex items-center justify-between mb-6 animate-fade-in relative z-[9999]">
            <h2 className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)] italic">
              {activeGenre
                ? `${GENRES.find((g) => g.id === activeGenre)?.name} Movies`
                : searched
                  ? `Results for '${searchQuery}'`
                  : "Trending This Week"}
            </h2>

            <div className="relative z-[9999]">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 font-[family-name:var(--font-dm-sans)] border ${showFilters || activeFilterCount > 0
                    ? "bg-[#e50914]/10 border-[#e50914]/40 text-white"
                    : "bg-white/5 border-white/10 text-[#a3a3a3] hover:text-white hover:bg-white/10"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#e50914] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-72 bg-[#1f1f1f] border border-white/10 rounded-2xl p-5 z-[999] shadow-2xl animate-fade-in">
                  {/* Sort */}
                  <div className="mb-4">
                    <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium font-[family-name:var(--font-dm-sans)]">
                      Sort By
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 font-[family-name:var(--font-dm-sans)] ${sortBy === opt.value
                              ? "bg-[#e50914] text-white"
                              : "bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white"
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="mb-4">
                    <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium font-[family-name:var(--font-dm-sans)]">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white/5 text-white text-sm px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#e50914] transition-colors duration-200 font-[family-name:var(--font-dm-sans)]"
                    >
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#1f1f1f]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Rating */}
                  <div className="mb-5">
                    <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium font-[family-name:var(--font-dm-sans)]">
                      Minimum Rating:{" "}
                      <span className="text-white">
                        {minRating > 0 ? `${minRating}+` : "Any"}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={9}
                      step={1}
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="w-full accent-[#e50914]"
                    />
                    <div className="flex justify-between text-[#525252] text-xs mt-1 font-[family-name:var(--font-dm-sans)]">
                      <span>Any</span>
                      <span>9+</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleResetFilters}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#e50914] text-white hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading || initialLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-16">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-[#141414] animate-pulse">
                <div className="aspect-[2/3] bg-[#1f1f1f]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#1f1f1f] rounded w-3/4" />
                  <div className="h-2 bg-[#1f1f1f] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : searched && movies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#525252] text-lg font-[family-name:var(--font-dm-sans)]">
              No movies found for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : movies.length > 0 ? (
          <div className={initialLoading ? "pt-16 animate-fade-in-up" : "animate-fade-in-up"}>
            {initialLoading && (
              <h2 className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)] italic mb-6">
                Trending This Week
              </h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 isolation-isolate">
              {movies.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  showWatchlistButton
                  animationDelay={i * 75}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}