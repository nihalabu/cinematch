"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

    const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    const checkAdmin = async () => {
      try {
        const { db } = await import("@/lib/firebase")
        const { doc, getDoc } = await import("firebase/firestore")
        const userDoc = await getDoc(doc(db, "users", user.uid))
        setIsAdmin(userDoc.data()?.role === "admin")
      } catch { setIsAdmin(false) }
    }
    checkAdmin()
  }, [user])

  const navLinks = isAdmin
    ? [
        { href: "/", label: "Home" },
        { href: "/admin", label: "Admin" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/watchlist", label: "Watchlist" },
        { href: "/recommendations", label: "Recommendations" },
      ]
  return (
    <nav
      className={`h-16 sticky top-0 z-50 animate-fade-in transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold tracking-wider font-[family-name:var(--font-playfair)] italic">
            <span className="text-[#e50914]">Cine</span>
            <span className="text-white">Match</span>
          </span>
        </Link>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-sm font-medium tracking-wide font-[family-name:var(--font-dm-sans)] transition-colors duration-300 ${
                pathname === link.href
                  ? "text-white"
                  : "text-[#a3a3a3] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side — desktop */}
        <div className="hidden md:flex items-center gap-4 font-[family-name:var(--font-dm-sans)]">
          {loading ? (
            <div className="w-20 h-8 bg-white/5 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              <span className="text-sm text-[#a3a3a3]">
                {user.displayName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="glass glass-hover text-white text-sm px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[#a3a3a3] text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-300 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-red text-white text-sm px-5 py-2 rounded-lg font-semibold transition-all duration-300 hover:glow-red hover:shadow-[0_0_20px_rgba(229,9,20,0.3)]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 px-8 py-4 flex flex-col gap-4 animate-fade-in font-[family-name:var(--font-dm-sans)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition-colors duration-300 ${
                pathname === link.href
                  ? "text-white"
                  : "text-[#a3a3a3] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!loading && (
            <>
              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="glass text-white text-sm px-4 py-2 rounded-lg font-medium transition-all duration-300 text-left"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-[#a3a3a3] text-sm font-medium hover:text-white transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="bg-gradient-red text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  )
}
