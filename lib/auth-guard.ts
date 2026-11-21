import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import type { UserRole } from "@/types"

export interface ServerSessionUser {
  id: string
  name: string
  email: string
  role?: UserRole
  isBlocked?: boolean
  businessName?: string
  subscriptionPlan?: string
  image?: string | null
  [key: string]: unknown
}

export async function getServerSession(): Promise<{
  user: ServerSessionUser
  session: unknown
} | null> {
  const reqHeaders = await headers()
  const cookie = reqHeaders.get("cookie")
  if (!cookie) {
    return null
  }

  try {
    const sessionRes = await authClient.getSession({
      fetchOptions: {
        headers: reqHeaders,
      },
    })
    if (sessionRes?.data?.user) {
      return sessionRes.data as unknown as {
        user: ServerSessionUser
        session: unknown
      }
    }
  } catch {
  }

  try {
    const rawApiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5001"
    const apiUrl = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "")

    const res = await fetch(`${apiUrl}/api/auth/get-session`, {
      headers: {
        cookie,
        accept: "application/json",
      },
      cache: "no-store",
    })

    if (res.ok) {
      const data = (await res.json()) as {
        user?: ServerSessionUser
        session?: unknown
      }
      if (data?.user) {
        return {
          user: data.user,
          session: data.session ?? null,
        }
      }
    }
  } catch {
  }

  return null
}

export async function requireRole(
  allowedRole: UserRole,
  currentPath: string
): Promise<ServerSessionUser> {
  const sessionData = await getServerSession()

  if (!sessionData?.user) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
  }

  const user = sessionData.user

  if (user.isBlocked) {
    redirect("/blocked")
  }

  const role = user.role || "customer"

  if (role !== allowedRole) {
    if (role === "admin") {
      redirect("/dashboard/admin")
    } else if (role === "vendor") {
      redirect("/dashboard/vendor")
    } else {
      redirect("/dashboard/customer")
    }
  }

  return user
}
