import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"

// GET /api/admin/users — list all Firebase Auth users
export async function GET(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const pageToken = req.nextUrl.searchParams.get("pageToken") || undefined
    const listResult = await adminAuth.listUsers(100, pageToken)

    const users = listResult.users.map((user) => ({
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime || "",
      lastSignIn: user.metadata.lastSignInTime || "",
    }))

    return NextResponse.json({
      users,
      nextPageToken: listResult.pageToken || null,
    })
  } catch (error) {
    console.error("Error listing users:", error)
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 })
  }
}

// DELETE /api/admin/users — delete a user
export async function DELETE(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { uid } = await req.json()
    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 })
    }
    await adminAuth.deleteUser(uid)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

// PATCH /api/admin/users — disable/enable a user
export async function PATCH(req: NextRequest) {
  const adminCheck = req.headers.get("x-admin-token")
  if (adminCheck !== "cinematch-admin-secret") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { uid, disabled } = await req.json()
    if (!uid || disabled === undefined) {
      return NextResponse.json({ error: "UID and disabled status required" }, { status: 400 })
    }
    await adminAuth.updateUser(uid, { disabled })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
