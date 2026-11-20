"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  compact?: boolean
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an unexpected error while preparing your wedding details. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  icon: Icon = AlertCircle,
  className,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-foreground",
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 shrink-0 text-destructive" />
          <span className="font-medium">{message || title}</span>
        </div>
        {onRetry && (
          <Button
            size="xs"
            variant="outline"
            onClick={onRetry}
            className="border-destructive/30 hover:bg-destructive/15 text-destructive"
          >
            <RotateCcw className="size-3 mr-1" />
            {retryLabel}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/25 bg-card/80 p-8 text-center shadow-xs sm:p-12",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-4">
        <Icon className="size-7 stroke-[1.6]" />
      </div>

      <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
      </h3>

      {message && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-6 border-destructive/30 hover:bg-destructive/10 text-foreground"
        >
          <RotateCcw className="size-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
