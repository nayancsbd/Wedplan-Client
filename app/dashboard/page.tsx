import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-guard"

export default async function DashboardRootPage() {
  const sessionData = await getServerSession()

  if (!sessionData?.user) {
    redirect("/signin?callbackUrl=/dashboard")
  }

  const user = sessionData.user

  if (user.isBlocked) {
    redirect("/blocked")
  }

  const role = user.role || "customer"
  if (role === "admin") {
    redirect("/dashboard/admin")
  } else if (role === "vendor") {
    redirect("/dashboard/vendor")
  } else {
    redirect("/dashboard/customer")
  }
}
