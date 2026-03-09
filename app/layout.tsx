import type { Metadata } from "next"
import { Playfair_Display, DM_Sans, Outfit } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import ScrollToTop from "@/components/ScrollToTop"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: "CineMatch",
  description: "Movie Recommendation Portal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} ${outfit.variable}`}>
        <AuthProvider>
          {children}
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  )
}