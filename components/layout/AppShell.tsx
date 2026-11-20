"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export interface AppShellProps {
  children: React.ReactNode
}

/**
 * AppShell manages persistent UI chrome.
 * Hides public Navbar and Footer inside /dashboard routes
 * so dashboard layouts can provide their own dedicated navigation shell.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isDashboardRoute = pathname?.startsWith("/dashboard")

  if (isDashboardRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
