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
      (process.env.NODE_ENV === "production" || process.env.VERCEL
        ? "https://wedplan-server-nayanbddm.vercel.app"
        : "http://localhost:5001")
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

    const tokenMatch = cookie.match(/wedplan_jwt_token=([^;]+)/)
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1].trim()) : null

    const meRes = await fetch(`${apiUrl}/api/me`, {
      headers: {
        cookie,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        accept: "application/json",
      },
      cache: "no-store",
    }).catch(() => null)

    if (meRes && meRes.ok) {
      const meData = (await meRes.json().catch(() => null)) as Record<string, any> | null
      const meUser = (meData?.data?.user || meData?.user || meData?.data) as ServerSessionUser | undefined
      if (meUser && (meUser.id || (meUser as { _id?: string })._id)) {
        return {
          user: {
            ...meUser,
            id: String(meUser.id || (meUser as { _id?: string })._id),
          },
          session: null,
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
