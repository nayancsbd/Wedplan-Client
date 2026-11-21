"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, RefreshCw } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ServiceItem, normalizeService } from "@/lib/service-utils"

export type { ServiceItem }

export function FeaturedServices() {
  const shouldReduceMotion = useReducedMotion()
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isError, setIsError] = React.useState(false)
  const [reloadTrigger, setReloadTrigger] = React.useState(0)

  React.useEffect(() => {
    let isMounted = true

    const loadFeatured = async () => {
      try {
        const res = await fetch("/api/services/featured", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: unknown[] = []

          if (Array.isArray(json)) {
            rawList = json
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data
            } else if (Array.isArray(jsonObj.services)) {
              rawList = jsonObj.services
            } else if (
              jsonObj.data &&
              typeof jsonObj.data === "object" &&
              Array.isArray((jsonObj.data as Record<string, unknown>).services)
            ) {
              rawList = (jsonObj.data as Record<string, unknown>).services as unknown[]
            }
          }

          const items = rawList.map(normalizeService)
          setServices(items)
          setIsError(false)
        } else {
          setIsError(true)
          setServices([])
        }
      } catch {
        if (isMounted) {
          setIsError(true)
          setServices([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFeatured()

    return () => {
      isMounted = false
    }
  }, [reloadTrigger])

  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)
    setReloadTrigger((prev) => prev + 1)
  }

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-card/40 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            badge="Handpicked Excellence"
            title="Featured Wedding Services"
            description="Discover award-winning professionals and fairytale venues verified for your special day."
          />
        </motion.div>

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
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-2xl border border-dashed border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Unable to load featured services right now.
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry} className="cursor-pointer gap-2">
              <RefreshCw className="size-3.5" />
              <span>Try Again</span>
            </Button>
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            title="No Featured Services Found"
            description="We couldn't find any featured services at this time. Explore our complete collection of wedding vendors and venues."
            action={{
              label: "Browse All Services",
              href: "/services",
            }}
            className="my-8"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.35,
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
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

        <div className="text-center pt-2">
          <Link href="/services">
            <Button
              variant="outline"
              size="lg"
              className="border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary transition-all font-medium cursor-pointer"
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
