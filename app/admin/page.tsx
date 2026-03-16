"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Navbar from "@/components/Navbar"
import AdminUsers from "@/components/admin/AdminUsers"
import AdminMovies from "@/components/admin/AdminMovies"
import AdminStats from "@/components/admin/AdminStats"

type Tab = "stats" | "users" | "movies"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("stats")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (!user) return

    const checkAdmin = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data()?.role === "admin") {
          setIsAdmin(true)
        } else {
          router.push("/")
        }
      } catch {
        router.push("/")
      } finally {
        setChecking(false)
      }
    }
    checkAdmin()
  }, [user, authLoading, router])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at center, #141414 0%, #0a0a0a 70%)" }}
      >
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-[#e50914]/10 rounded-full animate-pulse-glow" />
          <div className="relative text-3xl font-bold tracking-wider font-[family-name:var(--font-playfair)] italic">
            <span className="text-[#e50914]">Cine</span>
            <span className="text-white">Match</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "stats",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: "users",
      label: "Users",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "movies",
      label: "Movie Cache",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
            <span className="text-[#e50914] text-xs uppercase tracking-widest font-medium font-[family-name:var(--font-dm-sans)]">
              Admin Panel
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-[family-name:var(--font-playfair)] italic">
            Dashboard
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-2 font-[family-name:var(--font-dm-sans)] font-light">
            Manage users, movie records, and platform data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/5 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-300 font-[family-name:var(--font-dm-sans)] border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "text-white border-[#e50914]"
                  : "text-[#a3a3a3] border-transparent hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === "stats" && <AdminStats />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "movies" && <AdminMovies />}
        </div>
      </div>
    </div>
  )
}