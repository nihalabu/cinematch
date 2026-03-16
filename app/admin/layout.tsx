"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    href: "/admin/movies",
    label: "Movies",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setChecking(false)
      setIsAuthenticated(true)
      return
    }

    const admin = sessionStorage.getItem("cinematch_admin")
    if (!admin) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
    setChecking(false)
  }, [pathname, router])

  const handleLogout = () => {
    sessionStorage.removeItem("cinematch_admin")
    router.push("/admin/login")
  }

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
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

  // Render login page without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-wider font-[family-name:var(--font-playfair)] italic">
              <span className="text-[#e50914]">Cine</span>
              <span className="text-white">Match</span>
            </span>
          </Link>
          <button
            className="ml-auto md:hidden text-[#a3a3a3] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-6 py-4">
          <div className="bg-[#e50914]/10 border border-[#e50914]/20 rounded-lg px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-red rounded-full flex items-center justify-center text-white text-sm font-bold font-[family-name:var(--font-dm-sans)]">
              A
            </div>
            <div>
              <p className="text-white text-xs font-semibold font-[family-name:var(--font-dm-sans)]">Admin</p>
              <p className="text-[#a3a3a3] text-[10px] font-[family-name:var(--font-dm-sans)]">admin@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 font-[family-name:var(--font-dm-sans)] ${
                  isActive
                    ? "bg-[#e50914]/10 text-white border border-[#e50914]/20"
                    : "text-[#a3a3a3] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={isActive ? "text-[#e50914]" : ""}>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#a3a3a3] hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/5 transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 flex items-center px-6 sticky top-0 z-30">
          <button
            className="md:hidden text-white mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-white text-sm font-medium font-[family-name:var(--font-dm-sans)] tracking-wide">
            {sidebarLinks.find((l) => l.href === pathname)?.label || "Admin Panel"}
          </h2>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
