"use client"

import * as React from "react"
import Link from "next/link"
import { ShieldAlert, Mail, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { clearTokenCache } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function BlockedPage() {
  // Sign user out and clear token cache immediately upon landing
  React.useEffect(() => {
    clearTokenCache()
    authClient.signOut().catch(() => {})
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-5">
          <ShieldAlert className="size-7 stroke-[1.8]" />
        </div>

        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Account Suspended
        </h1>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Your WedPlan account has been blocked or suspended by an
          administrator. You have been signed out of all active sessions.
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          If you believe this was an error or would like to submit an appeal,
          please contact our concierge support team.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="mailto:concierge@wedplan.com?subject=Account%20Suspension%20Inquiry"
            className="w-full"
          >
            <Button className="w-full h-10 font-medium">
              <Mail className="size-4 mr-2" />
              Contact Concierge Support
            </Button>
          </a>

          <Link href="/signin" className="w-full">
            <Button variant="outline" className="w-full h-10 border-border">
              <LogOut className="size-4 mr-2 text-muted-foreground" />
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
