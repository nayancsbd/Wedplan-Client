import * as React from "react"
import { requireRole } from "@/lib/auth-guard"

/**
 * Customer Dashboard Server-Side Guard:
 * Restricts access to customer accounts only.
 * Wrong role redirects to their own dashboard.
 * Blocked accounts redirect to /blocked.
 */
export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("customer", "/dashboard/customer")
  return <div className="min-h-screen bg-background">{children}</div>
}
