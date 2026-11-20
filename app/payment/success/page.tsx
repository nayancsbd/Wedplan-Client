"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Crown,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

type PaymentVerificationState = "verifying" | "confirmed" | "processing" | "error"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId")
  const { refetch } = useAuth()

  const [state, setState] = React.useState<PaymentVerificationState>(
    sessionId ? "verifying" : "error"
  )
  const [pollCount, setPollCount] = React.useState(0)

  React.useEffect(() => {
    if (!sessionId) {
      return
    }

    let isMounted = true
    let attempts = 0
    const maxAttempts = 15
    const pollIntervalMs = 2000
    let timerId: ReturnType<typeof setTimeout> | null = null

    const checkSessionStatus = async () => {
      try {
        const res = await fetch(
          `/api/payments/session-status?session_id=${encodeURIComponent(sessionId)}`,
          {
            headers: { Accept: "application/json" },
            credentials: "include",
          }
        )

        if (!isMounted) return

        if (res.ok) {
          const json = await res.json().catch(() => null)
          const data = (json?.data || json || {}) as Record<string, unknown>
          const userObj = (data.user || {}) as Record<string, unknown>

          const isPremiumConfirmed =
            data.isPremium === true ||
            data.subscriptionPlan === "premium" ||
            userObj.subscriptionPlan === "premium" ||
            (data.status === "complete" &&
              (data.payment_status === "paid" ||
                data.paid === true ||
                data.isPremium !== false))

          if (isPremiumConfirmed) {
            refetch()
            setState("confirmed")
            return
          }
        }
      } catch {
        if (!isMounted) return
      }

      attempts += 1
      setPollCount(attempts)

      if (attempts >= maxAttempts) {
        if (isMounted) {
          setState("processing")
        }
        return
      }

      if (isMounted) {
        timerId = setTimeout(checkSessionStatus, pollIntervalMs)
      }
    }

    checkSessionStatus()

    return () => {
      isMounted = false
      if (timerId) clearTimeout(timerId)
    }
  }, [sessionId, refetch])

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-primary/20 bg-card/95 p-8 sm:p-10 shadow-xl backdrop-blur-sm text-center space-y-6">
        {state === "verifying" && (
          <div className="space-y-6">
            <div className="relative mx-auto flex size-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping opacity-25" />
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RefreshCw className="size-9 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>Stripe Checkout</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Verifying your payment
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Please wait while we confirm your transaction with Stripe and verify your premium vendor privileges...
              </p>
            </div>

            <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${Math.min(100, Math.max(15, (pollCount / 15) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {state === "confirmed" && (
          <div className="space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Crown className="size-3.5" />
                <span>Upgrade Confirmed</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Payment Confirmed!
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you! Your account is now upgraded to Premium. You can now publish unlimited active wedding listings and display your Premium Vendor badge.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/vendor"
                className={buttonVariants({
                  variant: "default",
                  className: "w-full sm:w-auto gap-2 shadow-md cursor-pointer",
                })}
              >
                <span>Go to Vendor Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/vendor/services"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full sm:w-auto cursor-pointer",
                })}
              >
                <span>Manage Services</span>
              </Link>
            </div>
          </div>
        )}

        {state === "processing" && (
          <div className="space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5">
              <Clock className="size-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>Webhook In Transit</span>
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Payment is processing
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Stripe received your payment, and our backend is finalizing the subscription update. Your account will automatically switch to Premium in a few moments.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/vendor"
                className={buttonVariants({
                  variant: "default",
                  className: "w-full sm:w-auto gap-2 cursor-pointer",
                })}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/vendor/subscription"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full sm:w-auto cursor-pointer",
                })}
              >
                <span>Check Subscription Status</span>
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
              <AlertCircle className="size-10" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Session Not Found
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                We could not locate a checkout session reference to verify. If you recently completed a payment, please inspect your subscription page.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/vendor/subscription"
                className={buttonVariants({
                  variant: "default",
                  className: "gap-2 cursor-pointer",
                })}
              >
                <span>Return to Subscription Plans</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </React.Suspense>
  )
}
