import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  change?: {
    value: string | number
    isPositive?: boolean
  }
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-0 flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>

          <p className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>

          {(description || change) && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {change && (
                <span
                  className={cn(
                    "font-semibold",
                    change.isPositive !== false
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  )}
                >
                  {change.isPositive !== false ? "+" : ""}
                  {change.value}
                </span>
              )}
              {description && (
                <span className="text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5 stroke-[1.8]" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
