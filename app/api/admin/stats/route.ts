import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"

// GET /api/admin/stats — dashboard statistics
export async function GET(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Count users
    let totalUsers = 0
    let pageToken: string | undefined = undefined
    do {
      const listResult = await adminAuth.listUsers(1000, pageToken)
      totalUsers += listResult.users.length
      pageToken = listResult.pageToken
    } while (pageToken)

    // Count cached movies
    const moviesSnapshot = await adminDb.collection("movies").count().get()
    const totalMovies = moviesSnapshot.data().count

    // Count reviews
    const ratingsRef = adminDb.collection("ratings")
    const userDocs = await ratingsRef.listDocuments()
    let totalReviews = 0
    for (const userDoc of userDocs) {
      const uid = userDoc.id
      const subSnapshot = await adminDb.collection("ratings").doc(uid).collection(uid).count().get()
      totalReviews += subSnapshot.data().count
    }

    // Count watchlist items
    const watchlistRef = adminDb.collection("watchlist")
    const watchlistUserDocs = await watchlistRef.listDocuments()
    let totalWatchlistItems = 0
    for (const userDoc of watchlistUserDocs) {
      const uid = userDoc.id
      const subSnapshot = await adminDb.collection("watchlist").doc(uid).collection(uid).count().get()
      totalWatchlistItems += subSnapshot.data().count
    }

    return NextResponse.json({
      totalUsers,
      totalMovies,
      totalReviews,
      totalWatchlistItems,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
