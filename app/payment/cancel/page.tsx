"use client"

import * as React from "react"
import Link from "next/link"
import { XCircle, RotateCcw, LayoutDashboard } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card/95 p-8 sm:p-10 shadow-xl backdrop-blur-sm text-center space-y-6">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/5">
          <XCircle className="size-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Checkout Discontinued
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Your checkout process was cancelled and no charges were applied. You can retry upgrading whenever you are ready, or continue on your current plan.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/vendor/subscription"
            className={buttonVariants({
              variant: "default",
              className: "w-full sm:w-auto gap-2 shadow-md cursor-pointer",
            })}
          >
            <RotateCcw className="size-4" />
            <span>Retry Upgrade</span>
          </Link>

          <Link
            href="/dashboard/vendor"
            className={buttonVariants({
              variant: "outline",
              className: "w-full sm:w-auto gap-2 cursor-pointer",
            })}
          >
            <LayoutDashboard className="size-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
