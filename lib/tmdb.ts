import { TMDBMovie, TMDBMovieDetail } from "@/types"

const API_KEY = process.env.TMDB_API_KEY
const BASE_URL = "https://api.themoviedb.org/3"
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

export const TMDB_GENRES: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Drama: 18,
  Fantasy: 14,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  SciFi: 878,
  Thriller: 53,
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const url = new URL(`${BASE_URL}${path}`)
    url.searchParams.set("api_key", API_KEY || "")
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
    const res = await fetch(url.toString())
    if (!res.ok) {
      console.error(`[TMDB] ${res.status} ${res.statusText} for ${path}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.error(`[TMDB] Fetch failed for ${path}:`, err)
    return null
  }
}
export async function fetchMoviesByGenre(
  genreId: number,
  page: number = 1
): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<{ results: TMDBMovie[] }>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "vote_average.desc",
    "vote_count.gte": "500",
    page: String(page),
  })
  return data?.results ?? []
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<{ results: TMDBMovie[] }>("/search/movie", {
    query,
    page: String(page),
  })
  return data?.results ?? []
}

export async function fetchMovieById(
  id: number
): Promise<TMDBMovieDetail | null> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,similar,videos",
  })
}

export async function fetchTrending(): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<{ results: TMDBMovie[] }>("/trending/movie/week")
  return data?.results ?? []
}

export async function fetchSuggestions(
  query: string
): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<{ results: TMDBMovie[] }>("/search/movie", {
    query,
    page: "1",
  })
  return (data?.results ?? []).slice(0, 6)
}
