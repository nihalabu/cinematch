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

export default function HomePage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeGenre, setActiveGenre] = useState<number | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Load trending movies on mount
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

  const handleGenreClick = async (genreId: number) => {
    if (activeGenre === genreId) {
      // Deselect — go back to trending
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
      const res = await fetch(`/api/movie?genre=${genreId}`)
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] opacity-0 animate-fade-in">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, #141414 0%, #0a0a0a 70%)" }}
      >
        {/* Floating shapes */}
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
        <div className="relative z-10 mt-16 px-8 w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-wrap justify-center gap-3">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 font-[family-name:var(--font-dm-sans)] ${
                  activeGenre === genre.id
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
      <section className="max-w-7xl mx-auto px-8 pb-24">
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
          <div className="pt-16 animate-fade-in-up">
            <h2 className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)] italic mb-6">
              {activeGenre
                ? `${GENRES.find((g) => g.id === activeGenre)?.name} Movies`
                : searched
                ? `Showing ${movies.length} results for '${searchQuery}'`
                : "Trending This Week"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
