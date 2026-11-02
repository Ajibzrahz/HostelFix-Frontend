'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { clearStoredUser, readStoredUser, type User } from '@/lib/auth'

const publicPaths = new Set(['/', '/login', '/register', '/verify-email'])

type AuthContextValue = {
  user: User | null
  ready: boolean
  setUser: (user: User | null) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUserState] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUserState(readStoredUser())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || publicPaths.has(pathname)) return
    if (!user) router.replace('/login')
  }, [pathname, ready, router, user])

  const value = useMemo(() => ({
    user,
    ready,
    setUser: (nextUser: User | null) => setUserState(nextUser),
    signOut: () => {
      clearStoredUser()
      setUserState(null)
      router.replace('/login')
    },
  }), [ready, router, user])

  if (!ready || (!publicPaths.has(pathname) && !user)) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading HostelFix...</div>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
