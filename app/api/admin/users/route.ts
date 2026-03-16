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
    const users = await Promise.all(
      usersSnap.docs.map(async (doc) => {
        const data = doc.data()
        const ratingsSnap = await adminDb
          .collection("ratings")
          .doc(doc.id)
          .collection(doc.id)
          .get()
        const watchlistSnap = await adminDb
          .collection("watchlist")
          .doc(doc.id)
          .collection(doc.id)
          .get()
        return {
          uid: doc.id,
          name: data.name || "—",
          email: data.email || "—",
          role: data.role || "user",
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          ratingsCount: ratingsSnap.size,
          watchlistCount: watchlistSnap.size,
        }
      })
    )
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const uid = await verifyAdmin(req)
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { targetUid, role } = await req.json()
    if (!targetUid || !role) {
      return NextResponse.json({ error: "targetUid and role required" }, { status: 400 })
    }
    await adminDb.collection("users").doc(targetUid).update({ role })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const uid = await verifyAdmin(req)
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { targetUid } = await req.json()
    if (!targetUid) return NextResponse.json({ error: "targetUid required" }, { status: 400 })
    if (targetUid === uid) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })

    await adminDb.collection("users").doc(targetUid).delete()
    await adminAuth.deleteUser(targetUid)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}