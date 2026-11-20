"use client"

import * as React from "react"
import Link from "next/link"
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
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: CategoryItem[] = [
  {
    title: "Photography & Videography",
    slug: "photography",
    count: "140+ Studios",
    description: "Fine art, editorial, and documentary wedding storytellers.",
    icon: Camera,
  },
  {
    title: "Wedding Venues",
    slug: "venue",
    count: "95+ Venues",
    description: "Historic estates, vineyard châteaux, and modern loft spaces.",
    icon: Building2,
  },
  {
    title: "Decoration & Florist",
    slug: "decor",
    count: "85+ Artisans",
    description: "Custom floral arches, tablescapes, and ambient installations.",
    icon: Flower2,
  },
  {
    title: "Catering Services",
    slug: "catering",
    count: "65+ Caterers",
    description: "Farm-to-table menus, bespoke cocktails, and dessert bars.",
    icon: UtensilsCrossed,
  },
  {
    title: "Makeup & Styling",
    slug: "hair_makeup",
    count: "110+ Artists",
    description: "Bridal hair, skincare prep, and radiant red-carpet glam.",
    icon: Sparkles,
  },
  {
    title: "Wedding Fashion",
    slug: "attire",
    count: "75+ Boutiques",
    description: "Couture wedding gowns, bespoke tuxedos, and heirloom veils.",
    icon: Crown,
  },
]

export function ServiceCategories() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
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
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                }}
              >
                <Link
                  href={`/services?category=${cat.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Subtle hover gradient background */}
                  <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/20" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-2xs">
                        <Icon className="size-6 stroke-[1.8]" />
                      </div>

                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all group-hover:bg-primary/15 group-hover:text-primary">
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="text-xs font-medium text-foreground">
                      {cat.count}
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
