"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceImageGalleryProps {
  images: string[]
  title: string
  className?: string
}

export function ServiceImageGallery({
  images = [],
  title,
  className,
}: ServiceImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const activeIndex =
    images.length > 0 ? Math.min(selectedIndex, images.length - 1) : 0
  const activeImage = images[activeIndex]

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-primary/10 via-card to-secondary/30 flex flex-col items-center justify-center text-center p-6",
          className
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <Sparkles className="size-6 stroke-[1.8]" />
        </div>
        <p className="font-serif text-2xl font-light text-foreground">{title}</p>
        <span className="text-xs text-muted-foreground mt-1">WedPlan Exclusive Service</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.2 }}
            className="relative size-full"
          >
            <Image
              src={activeImage}
              alt={`${title} - photo ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md flex items-center gap-1.5 shadow-sm z-10">
            <ImageIcon className="size-3.5" />
            <span>
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {images.map((imgUrl, idx) => {
            const isSelected = idx === activeIndex
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 opacity-100 scale-102"
                    : "border-transparent opacity-65 hover:opacity-100 hover:border-border"
                )}
                aria-label={`View photo ${idx + 1}`}
                aria-current={isSelected ? "true" : undefined}
              >
                <Image
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
