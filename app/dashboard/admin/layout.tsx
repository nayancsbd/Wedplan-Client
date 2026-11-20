import * as React from "react"
import { requireRole } from "@/lib/auth-guard"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("admin", "/dashboard/admin")
  return <>{children}</>
}
