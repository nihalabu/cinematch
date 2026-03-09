// ── TMDB Types ──

export type TMDBMovie = {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  genre_ids: number[]
  vote_average: number
  vote_count: number
  release_date: string
  overview: string
  original_language: string
}

export type Actor = {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export type CrewMember = {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export type Video = {
  id: string
  key: string
  name: string
  site: string
  type: string
}

export type TMDBMovieDetail = TMDBMovie & {
  credits: { cast: Actor[]; crew: CrewMember[] }
  similar: { results: TMDBMovie[] }
  videos: { results: Video[] }
  genres: { id: number; name: string }[]
  runtime: number
  production_countries: { name: string }[]
}

// ── Legacy OMDb-compatible type (for Firestore backwards compat) ──

export type Movie = {
  Title: string
  imdbID: string
  Poster: string
  Genre: string
  Year: string
  imdbRating: string
  Plot: string
  Director: string
  Actors: string
  Runtime: string
  Language: string
  Country: string
  tmdbId?: number
}

// ── App Types ──

export type UserProfile = {
  uid: string
  name: string
  email: string
  favoriteGenres: string[]
  createdAt: Date
}

export type Rating = {
  movieId: string
  score: number
  review: string
  timestamp: Date
  genre_ids?: number[]
}

export type WatchlistItem = {
  movieId: string
  title: string
  poster: string
  addedAt: Date
}

export type SearchResult = {
  Title: string
  imdbID: string
  Poster: string
  Year: string
  Type: string
}
