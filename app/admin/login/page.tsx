"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ADMIN_EMAIL = "admin@gmail.com"
const ADMIN_PASSWORD = "admin123"

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        // Simple hardcoded admin check
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Store admin session in sessionStorage
            sessionStorage.setItem("cinematch_admin", JSON.stringify({ email, loggedInAt: Date.now() }))
            router.push("/admin")
        } else {
            setError("Invalid admin credentials")
        }
        setLoading(false)
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "radial-gradient(ellipse at center, #141414 0%, #0a0a0a 70%)" }}
        >
            {/* Floating orbs */}
            <div className="absolute top-20 left-[15%] w-72 h-72 bg-[#e50914]/10 rounded-full blur-3xl animate-float pointer-events-none" />
            <div className="absolute bottom-32 right-[10%] w-96 h-96 bg-[#e50914]/5 rounded-full blur-3xl animate-float-reverse pointer-events-none" />

            <div className="w-full max-w-md glass rounded-2xl p-8 animate-fade-in-up shadow-[0_0_60px_rgba(229,9,20,0.05)] relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="text-3xl font-bold tracking-wider font-[family-name:var(--font-playfair)] italic">
                            <span className="text-[#e50914]">Cine</span>
                            <span className="text-white">Match</span>
                        </span>
                    </Link>

                    {/* Admin badge */}
                    <div className="flex items-center justify-center mt-4">
                        <span className="bg-[#e50914]/10 border border-[#e50914]/30 text-[#e50914] text-xs font-semibold px-3 py-1 rounded-full tracking-wider uppercase font-[family-name:var(--font-dm-sans)]">
                            Admin Portal
                        </span>
                    </div>

                    <h1 className="text-white text-2xl font-bold mt-6 font-[family-name:var(--font-playfair)]">
                        Admin Access
                    </h1>
                    <p className="text-[#a3a3a3] text-sm mt-2 font-[family-name:var(--font-dm-sans)] font-light tracking-wide">
                        Sign in with your admin credentials
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-[family-name:var(--font-dm-sans)]">
                    <div>
                        <label className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2 block font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@gmail.com"
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
                            placeholder="••••••••"
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
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Sign In as Admin
                            </>
                        )}
                    </button>
                </form>

                <p className="text-[#a3a3a3] text-sm text-center mt-6 font-[family-name:var(--font-dm-sans)]">
                    <Link href="/login" className="text-[#e50914] hover:text-[#b81c23] font-semibold transition-colors duration-300">
                        ← Back to User Login
                    </Link>
                </p>
            </div>
        </div>
    )
}
