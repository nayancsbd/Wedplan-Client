"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PageLoaderProps {
  message?: string
  fullPage?: boolean
  className?: string
}

export function PageLoader({
  message = "Loading wedding moments...",
  fullPage = false,
  className,
}: PageLoaderProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-8 text-center",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="size-16 rounded-full bg-primary/15 blur-sm"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute size-14 rounded-full border-2 border-primary/25 border-t-primary border-r-primary/60"
        />

        <motion.div
          animate={{ scale: [0.9, 1.12, 0.9] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute flex items-center justify-center"
        >
          <Heart className="size-6 fill-primary/30 text-primary stroke-[1.75]" />
        </motion.div>
      </div>

      {message && (
        <p className="font-serif text-sm tracking-wide text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}
