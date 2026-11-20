import * as React from "react"
import { requireRole } from "@/lib/auth-guard"

/**
 * Admin Dashboard Server-Side Guard:
 * Restricts access to admin users only.
 * Wrong role redirects to their own dashboard.
 * Blocked accounts redirect to /blocked.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("admin", "/dashboard/admin")
  return <div className="min-h-screen bg-background">{children}</div>
}
