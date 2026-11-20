"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { PageLoader } from "@/components/shared/PageLoader"

/**
 * /dashboard root redirector:
 * Automatically resolves and routes the authenticated user to their role-specific dashboard:
 * - Admin -> /dashboard/admin
 * - Vendor -> /dashboard/vendor
 * - Customer -> /dashboard/customer
 */
export default function DashboardIndexPage() {
  const router = useRouter()
  const { user, role, isPending, isAuthenticated } = useAuth()

  React.useEffect(() => {
    if (!isPending) {
      if (!isAuthenticated || !user) {
        router.replace("/signin?redirect=/dashboard")
        return
      }

      if (role === "admin") {
        router.replace("/dashboard/admin")
      } else if (role === "vendor") {
        router.replace("/dashboard/vendor")
      } else {
        router.replace("/dashboard/customer")
      }
    }
  }, [isPending, isAuthenticated, user, role, router])

  return <PageLoader message="Redirecting to your wedding dashboard..." fullPage />
}
