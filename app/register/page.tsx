"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"

export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        favoriteGenres: [],
        createdAt: new Date(),
      })
      router.push("/")
    } catch {
      setError("Registration failed. Email may already be in use.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || user) {
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at center, #141414 0%, #0a0a0a 70%)" }}
    >
      <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in-up shadow-[0_0_60px_rgba(229,9,20,0.05)]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold tracking-wider font-[family-name:var(--font-playfair)] italic">
              <span className="text-[#e50914]">Cine</span>
              <span className="text-white">Match</span>
            </span>
          </Link>
          <h1 className="text-white text-2xl font-bold mt-6 font-[family-name:var(--font-playfair)]">Create an account</h1>
          <p className="text-[#a3a3a3] text-sm mt-2 font-[family-name:var(--font-dm-sans)] font-light tracking-wide">Join CineMatch and discover movies</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-[family-name:var(--font-dm-sans)]">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full bg-white/5 text-white placeholder-[#525252] px-4 py-3 rounded-lg border border-white/5 focus:border-[#e50914] focus-glow outline-none transition-all duration-300 text-sm"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white/5 text-white placeholder-[#525252] px-4 py-3 rounded-lg border border-white/5 focus:border-[#e50914] focus-glow outline-none transition-all duration-300 text-sm"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              className="w-full bg-white/5 text-white placeholder-[#525252] px-4 py-3 rounded-lg border border-white/5 focus:border-[#e50914] focus-glow outline-none transition-all duration-300 text-sm"
            />
          </div>

          {error && (
            <p className="text-[#ff6b6b] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-red text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-[#a3a3a3] text-sm text-center mt-6 font-[family-name:var(--font-dm-sans)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#e50914] hover:text-[#b81c23] font-semibold transition-colors duration-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
