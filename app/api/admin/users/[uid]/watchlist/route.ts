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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const adminUid = await verifyAdmin(req)
  if (!adminUid) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { uid } = await params
  const { movieId } = await req.json()

  if (!movieId) return NextResponse.json({ error: "movieId required" }, { status: 400 })

  try {
    await adminDb.collection("watchlist").doc(uid).collection(uid).doc(movieId).delete()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete watchlist item" }, { status: 500 })
  }
}
