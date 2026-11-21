"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ServiceCardProps {
  id?: string
  title: string
  category: string
  vendorName?: string
  location?: string
  startingPrice?: number | string
  priceRange?: string
  rating?: number
  reviewCount?: number
  imageUrl?: string
  featured?: boolean
  href?: string
  onFavorite?: () => void
  isFavorite?: boolean
  className?: string
}

export function ServiceCard({
  title,
  category,
  vendorName,
  location,
  startingPrice,
  priceRange,
  rating = 5.0,
  reviewCount = 0,
  imageUrl,
  featured = false,
  href,
  onFavorite,
  isFavorite = false,
  className,
}: ServiceCardProps) {
  const cardBody = (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-border/80 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden",
        className
      )}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/15 via-muted to-secondary text-primary/40">
            <span className="font-serif text-3xl font-light">WedPlan</span>
          </div>
        )}

        {featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-primary text-primary-foreground border-none font-medium text-xs shadow-xs">
              Featured
            </Badge>
          </div>
        )}

        {onFavorite && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFavorite()
            }}
            className="absolute top-3 right-3 z-10 size-8 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-background hover:text-primary transition-colors cursor-pointer"
            aria-label="Add to favorites"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isFavorite
                  ? "fill-primary text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
          </Button>
        )}

        <div className="absolute bottom-3 left-3 z-10">
          <span className="rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-foreground uppercase tracking-wide">
            {category}
          </span>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {vendorName && (
              <p className="text-xs font-medium text-muted-foreground truncate">
                {vendorName}
              </p>
            )}
            <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 sm:text-lg">
              {title}
            </h3>
          </div>

          {rating > 0 && (
            <div className="flex items-center gap-1 shrink-0 rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-foreground">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              <span>{rating.toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{location}</span>
          </div>
        )}

        <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-3">
          <div className="text-xs text-muted-foreground">
            {startingPrice ? (
              <>
                Starting from{" "}
                <span className="font-serif text-base font-semibold text-foreground">
                  ${startingPrice}
                </span>
              </>
            ) : priceRange ? (
              <span className="font-medium text-foreground">{priceRange}</span>
            ) : (
              <span>Custom pricing</span>
            )}
          </div>

          <span className="text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform">
            View Details &rarr;
          </span>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline focus-visible:outline-hidden">
        {cardBody}
      </Link>
    )
  }

  return cardBody
}
