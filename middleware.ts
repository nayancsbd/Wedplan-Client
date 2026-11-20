import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Protected route matching:
  // - /dashboard and /dashboard/*
  // - /services/* (subroutes, preserving public /services browse page)
  // - /profile and /profile/*
  // - /payment and /payment/*
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  const isProfile = pathname === "/profile" || pathname.startsWith("/profile/")
  const isPayment = pathname === "/payment" || pathname.startsWith("/payment/")
  const isServicesSubroute =
    pathname.startsWith("/services/") && pathname !== "/services"

  if (isDashboard || isProfile || isPayment || isServicesSubroute) {
    const sessionCookie = getSessionCookie(request)
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
    "/services/:path+",
    "/profile/:path*",
    "/profile",
    "/payment/:path*",
    "/payment",
  ],
}
