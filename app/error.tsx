"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log unexpected error to error reporting service
    console.error("Global application error:", error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg text-center space-y-6 rounded-2xl border border-destructive/20 bg-card p-8 sm:p-10 shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="size-7 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            A Momentary Stumble
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
            We encountered an unexpected error while preparing this wedding
            view. Your saved items and wedding details remain completely safe.
          </p>
          {error.digest && (
            <p className="font-mono text-[11px] text-muted-foreground/80">
              Error Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} size="lg" className="shadow-xs">
            <RotateCcw className="size-4 mr-2" />
            Try Again
          </Button>

          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="size-4 mr-2 text-primary" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
