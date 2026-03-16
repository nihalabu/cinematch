import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  try {
    const token = authHeader.split("Bearer ")[1]
    const decoded = await adminAuth.verifyIdToken(token)
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get()
    if (userDoc.data()?.role !== "admin") return null
    return decoded.uid
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const uid = await verifyAdmin(req)
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const moviesSnap = await adminDb
      .collection("movies")
      .orderBy("cachedAt", "desc")
      .limit(50)
      .get()

    const movies = moviesSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "—",
        poster_url: data.poster_url || null,
        vote_average: data.vote_average || 0,
        original_language: data.original_language || "—",
        cachedAt: data.cachedAt?.toDate?.()?.toISOString() || null,
      }
    })
    return NextResponse.json(movies)
  } catch {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const uid = await verifyAdmin(req)
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { movieId } = await req.json()
    if (!movieId) return NextResponse.json({ error: "movieId required" }, { status: 400 })
    await adminDb.collection("movies").doc(movieId).delete()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete movie" }, { status: 500 })
  }
}