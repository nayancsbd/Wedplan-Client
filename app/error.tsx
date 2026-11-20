"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home, LayoutDashboard } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Global application error:", error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg text-center space-y-6 rounded-3xl border border-destructive/20 bg-card p-8 sm:p-10 shadow-lg backdrop-blur-xs">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
          <AlertTriangle className="size-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive uppercase tracking-wider">
            Application Error
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            A Momentary Stumble
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
            We encountered an unexpected issue while preparing your wedding view. Your saved data, bookings, and account details remain safe.
          </p>
          {error.digest && (
            <p className="font-mono text-[11px] text-muted-foreground/70">
              Reference Code: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            size="sm"
            className="h-9 gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Try Again</span>
          </Button>

          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-9 gap-1.5 text-xs cursor-pointer",
            })}
          >
            <LayoutDashboard className="size-3.5 text-primary" />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            href="/"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-9 gap-1.5 text-xs text-muted-foreground cursor-pointer",
            })}
          >
            <Home className="size-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
