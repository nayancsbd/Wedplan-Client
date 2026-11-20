import * as React from "react"
import { requireRole } from "@/lib/auth-guard"

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("vendor", "/dashboard/vendor")
  return <>{children}</>
}
