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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const adminUid = await verifyAdmin(req)
  if (!adminUid) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { uid } = await params

  try {
    const ratingsSnap = await adminDb
      .collection("ratings")
      .doc(uid)
      .collection(uid)
      .orderBy("timestamp", "desc")
      .get()

    const ratings = await Promise.all(
      ratingsSnap.docs.map(async (doc) => {
        const data = doc.data()
        const movieId = doc.id

        // Look up movie title from Firestore cache
        let title = null
        let poster = null
        try {
          const movieDoc = await adminDb.collection("movies").doc(movieId).get()
          if (movieDoc.exists) {
            title = movieDoc.data()?.title || null
            poster = movieDoc.data()?.poster_url || null
          }
        } catch {
          // silently fail
        }

        return {
          movieId,
          title,
          poster,
          score: data.score || 0,
          review: data.review || "",
          timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
        }
      })
    )

    const watchlistSnap = await adminDb
      .collection("watchlist")
      .doc(uid)
      .collection(uid)
      .orderBy("addedAt", "desc")
      .get()

    const watchlist = watchlistSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        movieId: doc.id,
        title: data.title || "—",
        poster: data.poster || "",
        addedAt: data.addedAt?.toDate?.()?.toISOString() || null,
      }
    })

    return NextResponse.json({ ratings, watchlist })
  } catch {
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
  }
}