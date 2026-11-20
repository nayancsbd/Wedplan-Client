import * as React from "react"
import { requireRole } from "@/lib/auth-guard"

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("customer", "/dashboard/customer")
  return <>{children}</>
}
