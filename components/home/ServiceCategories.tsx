"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  Camera,
  Building2,
  Flower2,
  UtensilsCrossed,
  Sparkles,
  Crown,
  ArrowUpRight,
} from "lucide-react"
import { SectionHeading } from "@/components/shared/SectionHeading"

interface CategoryItem {
  title: string
  slug: string
  count: string
  description: string
  image: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: CategoryItem[] = [
  {
    title: "Photography & Videography",
    slug: "photography",
    count: "140+ Studios",
    description: "Fine art, editorial, and documentary wedding storytellers.",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
    icon: Camera,
  },
  {
    title: "Wedding Venues",
    slug: "venue",
    count: "95+ Venues",
    description: "Historic estates, vineyard châteaux, and modern loft spaces.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    icon: Building2,
  },
  {
    title: "Decoration & Florist",
    slug: "decor",
    count: "85+ Artisans",
    description: "Custom floral arches, tablescapes, and ambient installations.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    icon: Flower2,
  },
  {
    title: "Catering Services",
    slug: "catering",
    count: "65+ Caterers",
    description: "Farm-to-table menus, bespoke cocktails, and dessert bars.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    icon: UtensilsCrossed,
  },
  {
    title: "Makeup & Styling",
    slug: "hair_makeup",
    count: "110+ Artists",
    description: "Bridal hair, skincare prep, and radiant red-carpet glam.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    icon: Sparkles,
  },
  {
    title: "Wedding Fashion",
    slug: "attire",
    count: "75+ Boutiques",
    description: "Couture wedding gowns, bespoke tuxedos, and heirloom veils.",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
    icon: Crown,
  },
]

export function ServiceCategories() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionHeading
            badge="Curated Directory"
            title="Wedding Service Categories"
            description="Explore our six core wedding dimensions to assemble your dream team of professionals."
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.slug}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                }}
              >
                <Link
                  href={`/services?category=${cat.slug}`}
                  aria-label={`Explore ${cat.title} services`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-background/90 text-primary backdrop-blur-md shadow-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-4.5 stroke-[1.8]" />
                      </div>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur-md shadow-xs transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3">
                      <span className="inline-block rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                        {cat.count}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-1.5 flex-1">
                    <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Verified Directory
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:underline underline-offset-4">
                      Explore Listings &rarr;
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
