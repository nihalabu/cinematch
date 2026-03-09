// Global auth state provider
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

// 1. Define what our context holds
type AuthContextType = {
  user: User | null
  loading: boolean
}

// 2. Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
})

// 3. Create the provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Firebase listener — fires whenever auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    // Cleanup listener when component unmounts
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. Custom hook to use auth anywhere
export function useAuth() {
  return useContext(AuthContext)
}