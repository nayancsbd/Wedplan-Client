import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-guard"

export default async function ProfilePage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/signin?callbackUrl=%2Fprofile")
  }

  const role = session.user.role || "customer"

  if (role === "vendor") {
    redirect("/dashboard/vendor/profile")
  }

  if (role === "admin") {
    redirect("/dashboard/admin/profile")
  }

  redirect("/dashboard/customer/profile")
}
