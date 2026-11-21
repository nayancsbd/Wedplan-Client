"use client"

import * as React from "react"
import Link from "next/link"
import { ShieldX, LayoutDashboard, Search, Home } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"

export interface AccessDeniedProps {
  title?: string
  message?: string
  onRetry?: () => void
  showDashboardLink?: boolean
  showHomeLink?: boolean
}

export function AccessDenied({
  title = "Access Restricted",
  message = "You do not have permission to view this resource or perform this action. This area is reserved for authorized accounts.",
  onRetry,
  showDashboardLink = true,
  showHomeLink = true,
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg text-center space-y-6 rounded-3xl border border-destructive/20 bg-card p-8 sm:p-10 shadow-lg backdrop-blur-xs">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
          <ShieldX className="size-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive uppercase tracking-wider">
            HTTP 403 Forbidden
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onRetry && (
            <Button onClick={onRetry} size="sm" className="h-9 gap-1.5 text-xs shadow-xs cursor-pointer">
              <span>Try Again</span>
            </Button>
          )}

          {showDashboardLink && (
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "h-9 gap-1.5 text-xs shadow-xs cursor-pointer",
              })}
            >
              <LayoutDashboard className="size-3.5" />
              <span>Go to Dashboard</span>
            </Link>
          )}

          <Link
            href="/services"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-9 gap-1.5 text-xs cursor-pointer",
            })}
          >
            <Search className="size-3.5 text-primary" />
            <span>Browse Services</span>
          </Link>

          {showHomeLink && (
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "h-9 gap-1.5 text-xs text-muted-foreground cursor-pointer",
              })}
            >
              <Home className="size-3.5" />
              <span>Home</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}


