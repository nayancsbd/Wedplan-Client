"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 shadow-sm">
        <Icon className="size-7 stroke-[1.6]" />
      </div>

      <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action &&
            (action.href ? (
              <Link href={action.href}>
                <Button>{action.label}</Button>
              </Link>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline">{secondaryAction.label}</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  )
}
