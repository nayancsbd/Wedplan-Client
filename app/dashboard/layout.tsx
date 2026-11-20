import * as React from "react"
import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export const metadata: Metadata = {
  title: "Dashboard | WedPlan",
  description: "Manage your wedding bookings, listings, and account settings.",
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
