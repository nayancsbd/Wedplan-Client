"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusType =
  | "active"
  | "approved"
  | "confirmed"
  | "completed"
  | "paid"
  | "pending"
  | "in_progress"
  | "processing"
  | "review"
  | "trialing"
  | "cancelled"
  | "canceled"
  | "rejected"
  | "failed"
  | "blocked"
  | "suspended"
  | "past_due"
  | "premium"
  | "featured"
  | "inactive"
  | "draft"
  | "refunded"
  | string

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType
  label?: string
  showDot?: boolean
  size?: "sm" | "default" | "lg"
}

interface StatusConfig {
  label: string
  containerClass: string
  dotClass: string
}

function getStatusConfig(status: string): StatusConfig {
  const normalized = (status || "").toLowerCase().trim().replace(/[- ]/g, "_")

  switch (normalized) {
    case "active":
    case "approved":
    case "confirmed":
    case "completed":
    case "paid":
    case "success":
      return {
        label: capitalize(normalized),
        containerClass:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
        dotClass: "bg-emerald-500",
      }

    case "pending":
    case "in_progress":
    case "processing":
    case "review":
    case "trialing":
      return {
        label: normalized === "in_progress" ? "In Progress" : capitalize(normalized),
        containerClass:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
        dotClass: "bg-amber-500",
      }

    case "cancelled":
    case "canceled":
    case "rejected":
    case "failed":
    case "blocked":
    case "suspended":
    case "past_due":
      return {
        label:
          normalized === "past_due"
            ? "Past Due"
            : normalized === "canceled"
            ? "Cancelled"
            : capitalize(normalized),
        containerClass:
          "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
        dotClass: "bg-rose-500",
      }

    case "premium":
    case "featured":
      return {
        label: capitalize(normalized),
        containerClass:
          "bg-primary/15 text-primary border-primary/30 font-medium",
        dotClass: "bg-primary",
      }

    case "inactive":
    case "draft":
    case "refunded":
    case "archived":
    default:
      return {
        label: capitalize(normalized || "Unknown"),
        containerClass:
          "bg-muted text-muted-foreground border-border/80",
        dotClass: "bg-muted-foreground",
      }
  }
}

function capitalize(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function StatusBadge({
  status,
  label,
  showDot = true,
  size = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const displayLabel = label || config.label

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    default: "px-2.5 py-0.5 text-xs gap-1.5",
    lg: "px-3 py-1 text-sm gap-2",
  }

  const dotSizeClasses = {
    sm: "size-1.5",
    default: "size-2",
    lg: "size-2.5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors select-none",
        sizeClasses[size],
        config.containerClass,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn("rounded-full shrink-0", dotSizeClasses[size], config.dotClass)}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  )
}
