import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const token = authHeader.split("Bearer ")[1]
    const decoded = await adminAuth.verifyIdToken(token)
    const uid = decoded.uid

    const body = await req.json()
    const { movieId, score, review, genre_ids } = body

    if (!movieId || score === undefined || score === null) {
      return NextResponse.json({ error: "movieId and score are required" }, { status: 400 })
    }

    // Fetch genre_ids from Firestore movies cache if not provided by client
    let movieGenreIds: number[] = genre_ids || []
    if (movieGenreIds.length === 0) {
      const movieDoc = await adminDb.collection("movies").doc(String(movieId)).get()
      movieGenreIds = movieDoc.exists
        ? (movieDoc.data()?.genre_ids ?? movieDoc.data()?.genres?.map((g: { id: number }) => g.id) ?? [])
        : []
    }

    await adminDb
      .collection("ratings")
      .doc(uid)
      .collection(uid)
      .doc(String(movieId))
      .set({
        movieId: String(movieId),
        score,
        review: review || "",
        genre_ids: movieGenreIds,
        timestamp: new Date(),
      })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
