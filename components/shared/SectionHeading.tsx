import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeadingProps {
  badge?: string
  title: string
  description?: string
  centered?: boolean
  className?: string
}

export function SectionHeading({
  badge,
  title,
  description,
  centered = true,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        centered ? "items-center text-center mx-auto" : "items-start text-left",
        "max-w-2xl",
        className
      )}
    >
      {badge && (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium tracking-wider uppercase text-primary">
          {badge}
        </span>
      )}

      <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
