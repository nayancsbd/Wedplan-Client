import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  const isProfile = pathname === "/profile" || pathname.startsWith("/profile/")
  const isPayment = pathname === "/payment" || pathname.startsWith("/payment/")

  if (isDashboard || isProfile || isPayment) {
    const sessionCookie =
      getSessionCookie(request) ||
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value ||
      request.cookies.get("better-auth.session_data")?.value ||
      request.cookies.get("__Secure-better-auth.session_data")?.value ||
      request.cookies.get("wedplan_jwt_token")?.value

    if (!sessionCookie) {
      const callbackUrl = encodeURIComponent(`${pathname}${search}`)
      return NextResponse.redirect(
        new URL(`/signin?callbackUrl=${callbackUrl}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/profile",
    "/payment/:path*",
    "/payment",
  ],
}
