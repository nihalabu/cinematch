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
    const { movieId, title, poster } = body

    if (!movieId || !title) {
      return NextResponse.json({ error: "movieId and title are required" }, { status: 400 })
    }

    await adminDb
      .collection("watchlist")
      .doc(uid)
      .collection(uid)
      .doc(movieId)
      .set({
        movieId,
        title,
        poster: poster || "",
        addedAt: new Date(),
      })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const token = authHeader.split("Bearer ")[1]
    const decoded = await adminAuth.verifyIdToken(token)
    const uid = decoded.uid

    const body = await req.json()
    const { movieId } = body

    if (!movieId) {
      return NextResponse.json({ error: "movieId is required" }, { status: 400 })
    }

    await adminDb
      .collection("watchlist")
      .doc(uid)
      .collection(uid)
      .doc(movieId)
      .delete()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
