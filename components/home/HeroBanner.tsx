"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import {
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroBanner() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-radial-[at_50%_0%] from-primary/10 via-background to-background py-16 sm:py-24 lg:py-32">
      {/* Decorative Background Elements */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft glowing ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 left-10 size-72 rounded-full bg-secondary blur-3xl opacity-60" />
        <div className="absolute top-1/2 right-10 size-80 rounded-full bg-primary/5 blur-3xl" />

        {/* Subtle decorative grid/arch pattern */}
        <svg
          className="absolute inset-0 size-full stroke-primary/10 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="wedding-hero-pattern"
              width="60"
              height="60"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 60V.5H60" fill="none" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            strokeWidth="0"
            fill="url(#wedding-hero-pattern)"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Main Headline & CTA Column */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left space-y-6"
          >
            {/* Romantic Pill Badge */}
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 text-primary px-3.5 py-1 text-xs uppercase tracking-widest font-sans shadow-2xs"
            >
              <Sparkles className="size-3.5 mr-1.5 fill-primary text-primary" />
              The Modern Wedding Planning Platform
            </Badge>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Where Extraordinary <br className="hidden sm:inline" />
              <span className="text-primary italic font-serif">Weddings</span> Come to Life
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Discover verified photographers, fairytale venues, artisanal florists,
              and premier caterers. Plan seamlessly with transparent pricing,
              contract protection, and automated milestone tracking.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 sm:justify-start">
              <Link href="/services">
                <Button size="lg" className="h-12 px-6 shadow-md text-base">
                  <span>Explore Wedding Services</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>

              <Link href="/signup">
                <Button variant="outline" size="lg" className="h-12 px-6 text-base border-border/80">
                  <span>Join as a Vendor</span>
                </Button>
              </Link>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-border/70 w-full max-w-lg">
              <div className="text-center sm:text-left">
                <p className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  500+
                </p>
                <p className="text-xs text-muted-foreground">Verified Vendors</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-serif text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-1">
                  <span>4.9</span>
                  <Star className="size-4 fill-amber-500 text-amber-500 inline" />
                </p>
                <p className="text-xs text-muted-foreground">Couples Review Score</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  $0
                </p>
                <p className="text-xs text-muted-foreground">Hidden Markups</p>
              </div>
            </div>
          </motion.div>

          {/* Interactive Illustration / Showcase Column */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5 flex items-center justify-center"
          >
            {/* Visual Frame */}
            <div className="relative w-full max-w-md aspect-4/5 rounded-3xl border border-primary/20 bg-linear-to-b from-card via-card to-background p-3 shadow-xl ring-1 ring-black/5">
              {/* Inner Decorative Card */}
              <div className="relative size-full overflow-hidden rounded-2xl bg-linear-to-tr from-primary/15 via-muted/60 to-secondary/80 flex flex-col justify-between p-6">
                {/* Top Badge Overlay */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground shadow-xs">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    Verified Vendors
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-full bg-background/80 text-primary">
                    <Heart className="size-4 fill-primary" />
                  </div>
                </div>

                {/* Center Wedding Icon Artwork */}
                <div className="my-auto flex flex-col items-center text-center space-y-3">
                  <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5 shadow-inner">
                    <Sparkles className="size-10 stroke-[1.6]" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    Your Dream Wedding
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[220px]">
                    Curated vendors, guaranteed milestone payments, and effortless coordination.
                  </p>
                </div>

                {/* Bottom Floating Stats Box */}
                <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-3.5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Curated Packages</span>
                    <span className="font-semibold text-primary">Available Now</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-primary" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      10,000+ Couples Planned
                    </span>
                    <span>100% Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
