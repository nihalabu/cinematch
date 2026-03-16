import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

// GET /api/admin/reviews — list all reviews across all users
export async function GET(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Ratings are stored as: ratings/{uid}/{uid}/{movieId}
    const ratingsRef = adminDb.collection("ratings")
    const userDocs = await ratingsRef.listDocuments()

    const allReviews: {
      id: string
      uid: string
      movieId: string
      score: number
      review: string
      genre_ids: number[]
      timestamp: string
    }[] = []

    for (const userDoc of userDocs) {
      const uid = userDoc.id
      const subCollection = adminDb.collection("ratings").doc(uid).collection(uid)
      const reviewDocs = await subCollection.get()

      for (const doc of reviewDocs.docs) {
        const data = doc.data()
        allReviews.push({
          id: `${uid}_${doc.id}`,
          uid,
          movieId: data.movieId || doc.id,
          score: data.score || 0,
          review: data.review || "",
          genre_ids: data.genre_ids || [],
          timestamp: data.timestamp?.toDate?.()?.toISOString?.() || "",
        })
      }
    }

    // Sort by timestamp descending
    allReviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ reviews: allReviews })
  } catch (error) {
    console.error("Error listing reviews:", error)
    return NextResponse.json({ error: "Failed to list reviews" }, { status: 500 })
  }
}

// DELETE /api/admin/reviews — delete a specific review
export async function DELETE(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { uid, movieId } = await req.json()
    if (!uid || !movieId) {
      return NextResponse.json({ error: "uid and movieId are required" }, { status: 400 })
    }

    await adminDb
      .collection("ratings")
      .doc(uid)
      .collection(uid)
      .doc(String(movieId))
      .delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
