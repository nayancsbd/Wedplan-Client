"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Critical root application error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center space-y-6 rounded-3xl border border-destructive/20 bg-card p-8 sm:p-10 shadow-lg">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
            <AlertTriangle className="size-8 stroke-[1.8]" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive uppercase tracking-wider">
              Critical Error
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
              We encountered a system problem while loading WedPlan. Please refresh the page or try again.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
