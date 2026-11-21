"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { clearTokenCache } from "@/lib/api"
import type { User, UserRole } from "@/types"

export interface AuthUser extends Partial<User> {
  id: string
  name: string
  email: string
  role?: UserRole
  isBlocked?: boolean
  businessName?: string
  subscriptionPlan?: string
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  [key: string]: unknown
}

export interface AuthContextValue {
  user: AuthUser | null
  role: UserRole | null
  isPending: boolean
  isAuthenticated: boolean
  session: unknown
  signOut: () => Promise<void>
  refetch: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: sessionData, isPending, refetch } = authClient.useSession()

  const user = (sessionData?.user as unknown as AuthUser) || null
  const role = (user?.role as UserRole) || null
  const isAuthenticated = !!user

  const handleSignOut = React.useCallback(async () => {
    clearTokenCache()
    await authClient.signOut()
    router.push("/signin")
    router.refresh()
  }, [router])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isPending,
      isAuthenticated,
      session: sessionData?.session ?? null,
      signOut: handleSignOut,
      refetch,
    }),
    [user, role, isPending, isAuthenticated, sessionData, handleSignOut, refetch]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
