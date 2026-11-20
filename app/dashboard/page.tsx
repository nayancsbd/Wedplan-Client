import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-guard"

/**
 * Server-Side Dashboard Root Redirector:
 * Evaluates session on the server before rendering HTML.
 * Ensures zero flash of unauthenticated or incorrect-role state on page refresh.
 */
export default async function DashboardRootPage() {
  const sessionData = await getServerSession()

  // 1. Unauthenticated -> Redirect to sign in with callback
  if (!sessionData?.user) {
    redirect("/signin?callbackUrl=/dashboard")
  }

  const user = sessionData.user

  // 2. Suspended / Blocked -> Redirect to blocked page
  if (user.isBlocked) {
    redirect("/blocked")
  }

  // 3. Authenticated -> Redirect to role's dashboard
  const role = user.role || "customer"
  if (role === "admin") {
    redirect("/dashboard/admin")
  } else if (role === "vendor") {
    redirect("/dashboard/vendor")
  } else {
    redirect("/dashboard/customer")
  }
}
