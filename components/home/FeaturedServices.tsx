"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, RefreshCw } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export interface ServiceItem {
  id: string
  title: string
  category: string
  vendorName?: string
  location?: string
  startingPrice?: number | string
  rating?: number
  reviewCount?: number
  imageUrl?: string
  featured?: boolean
}

// High-quality fallback featured services for seamless presentation
const FALLBACK_FEATURED_SERVICES: ServiceItem[] = [
  {
    id: "srv-1",
    title: "Golden Hour Fine Art Photography",
    category: "Photography & Videography",
    vendorName: "Lumière Wedding Studios",
    location: "Napa Valley, CA",
    startingPrice: 3200,
    rating: 4.9,
    reviewCount: 48,
    featured: true,
  },
  {
    id: "srv-2",
    title: "The Glasshouse Botanical Estate",
    category: "Wedding Venues",
    vendorName: "Estate of Cascades",
    location: "Carmel-by-the-Sea, CA",
    startingPrice: 6500,
    rating: 5.0,
    reviewCount: 64,
    featured: true,
  },
  {
    id: "srv-3",
    title: "Blush Garden Florals & Luxe Arches",
    category: "Decoration & Florist",
    vendorName: "Petals & Prose Floristry",
    location: "San Francisco, CA",
    startingPrice: 1850,
    rating: 4.8,
    reviewCount: 39,
    featured: true,
  },
  {
    id: "srv-4",
    title: "Farm-to-Table Artisan Multi-Course Feast",
    category: "Catering Services",
    vendorName: "Heirloom & Thyme Culinary",
    location: "Sonoma, CA",
    startingPrice: 85,
    rating: 5.0,
    reviewCount: 52,
    featured: true,
  },
  {
    id: "srv-5",
    title: "Bridal Glow Glamour & Hair Styling",
    category: "Makeup & Styling",
    vendorName: "Aura Bridal Beauty",
    location: "Oakland, CA",
    startingPrice: 650,
    rating: 4.9,
    reviewCount: 31,
    featured: true,
  },
  {
    id: "srv-6",
    title: "Couture Silk & Hand-Beaded Gowns",
    category: "Wedding Fashion",
    vendorName: "Maison Blanche Bridal",
    location: "San Jose, CA",
    startingPrice: 2400,
    rating: 4.8,
    reviewCount: 27,
    featured: true,
  },
]

export function FeaturedServices() {
  const shouldReduceMotion = useReducedMotion()
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isError, setIsError] = React.useState(false)

  const fetchFeatured = React.useCallback(async () => {
    setIsLoading(true)
    setIsError(false)

    try {
      const res = await fetch("/api/services/featured", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      if (res.ok) {
        const json = await res.json()
        const fetchedItems: ServiceItem[] =
          json?.data || json?.services || (Array.isArray(json) ? json : [])

        if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
          setServices(fetchedItems)
        } else {
          setServices(FALLBACK_FEATURED_SERVICES)
        }
      } else {
        setServices(FALLBACK_FEATURED_SERVICES)
      }
    } catch {
      setServices(FALLBACK_FEATURED_SERVICES)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetch("/api/services/featured", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        })

        if (!isMounted) return

        if (res.ok) {
          const json = await res.json()
          const fetchedItems: ServiceItem[] =
            json?.data || json?.services || (Array.isArray(json) ? json : [])

          if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
            setServices(fetchedItems)
          } else {
            setServices(FALLBACK_FEATURED_SERVICES)
          }
        } else {
          setServices(FALLBACK_FEATURED_SERVICES)
        }
      } catch {
        if (isMounted) {
          setServices(FALLBACK_FEATURED_SERVICES)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="py-16 sm:py-24 bg-card/40 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionHeading
            badge="Handpicked Excellence"
            title="Featured Wedding Services"
            description="Discover award-winning professionals and fairytale venues verified for your special day."
          />
        </motion.div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card p-4 space-y-3"
              >
                <Skeleton className="aspect-4/3 w-full rounded-xl" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : isError && services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-2xl border border-dashed border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Unable to load featured services right now.
            </p>
            <Button variant="outline" size="sm" onClick={fetchFeatured}>
              <RefreshCw className="size-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                }}
              >
                <ServiceCard
                  id={item.id}
                  title={item.title}
                  category={item.category}
                  vendorName={item.vendorName}
                  location={item.location}
                  startingPrice={item.startingPrice}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  imageUrl={item.imageUrl}
                  featured={item.featured}
                  href={`/services/${item.id}`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center pt-4">
          <Link href="/services">
            <Button
              variant="outline"
              size="lg"
              className="border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary transition-all font-medium"
            >
              <span>Browse All Wedding Services</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
