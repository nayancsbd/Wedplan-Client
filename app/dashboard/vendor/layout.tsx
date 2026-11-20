import * as React from "react"
import { requireRole } from "@/lib/auth-guard"

/**
 * Vendor Dashboard Server-Side Guard:
 * Restricts access to vendor accounts only.
 * Wrong role redirects to their own dashboard.
 * Blocked accounts redirect to /blocked.
 */
export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("vendor", "/dashboard/vendor")
  return <div className="min-h-screen bg-background">{children}</div>
}
