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
    const usersSnap = await adminDb.collection("users").get()
    const moviesSnap = await adminDb.collection("movies").get()

    let totalRatings = 0
    let totalWatchlist = 0

    for (const userDoc of usersSnap.docs) {
      const ratingsSnap = await adminDb
        .collection("ratings")
        .doc(userDoc.id)
        .collection(userDoc.id)
        .get()
      totalRatings += ratingsSnap.size

      const watchlistSnap = await adminDb
        .collection("watchlist")
        .doc(userDoc.id)
        .collection(userDoc.id)
        .get()
      totalWatchlist += watchlistSnap.size
    }

    return NextResponse.json({
      totalUsers: usersSnap.size,
      totalMoviesCached: moviesSnap.size,
      totalRatings,
      totalWatchlist,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}