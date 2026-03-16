import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

// GET /api/admin/movies — list cached movies from Firestore
export async function GET(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const limitParam = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10)
    const moviesRef = adminDb.collection("movies").orderBy("cachedAt", "desc").limit(limitParam)
    const snapshot = await moviesRef.get()

    const movies = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "Unknown",
        poster_url: data.poster_url || null,
        poster_path: data.poster_path || null,
        backdrop_url: data.backdrop_url || null,
        vote_average: data.vote_average || 0,
        vote_count: data.vote_count || 0,
        release_date: data.release_date || "",
        overview: data.overview || "",
        genres: data.genres || [],
        genre_ids: data.genre_ids || [],
        runtime: data.runtime || 0,
        original_language: data.original_language || "",
        cachedAt: data.cachedAt?.toDate?.()?.toISOString?.() || "",
      }
    })

    return NextResponse.json({ movies })
  } catch (error) {
    console.error("Error listing movies:", error)
    return NextResponse.json({ error: "Failed to list movies" }, { status: 500 })
  }
}

// DELETE /api/admin/movies — delete a cached movie record
export async function DELETE(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { movieId } = await req.json()
    if (!movieId) {
      return NextResponse.json({ error: "movieId is required" }, { status: 400 })
    }

    await adminDb.collection("movies").doc(String(movieId)).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting movie:", error)
    return NextResponse.json({ error: "Failed to delete movie" }, { status: 500 })
  }
}
