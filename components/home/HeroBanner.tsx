"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroBanner() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-radial-[at_50%_0%] from-primary/10 via-background to-background py-12 sm:py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 left-10 size-72 rounded-full bg-secondary blur-3xl opacity-60" />
        <div className="absolute top-1/2 right-10 size-80 rounded-full bg-primary/5 blur-3xl" />

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
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left space-y-5 sm:space-y-6">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary px-3.5 py-1 text-xs uppercase tracking-widest font-sans shadow-2xs"
              >
                <Sparkles className="size-3.5 mr-1.5 fill-primary text-primary" />
                The Modern Wedding Planning Platform
              </Badge>
            </motion.div>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]"
            >
              Where Extraordinary <br className="hidden sm:inline" />
              <span className="text-primary italic font-serif">Weddings</span> Come to Life
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed"
            >
              Discover verified photographers, fairytale venues, artisanal florists,
              and premier caterers. Plan seamlessly with transparent pricing,
              contract protection, and automated milestone tracking.
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto pt-1 sm:justify-start"
            >
              <Link href="/services" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 shadow-md text-sm sm:text-base font-medium cursor-pointer">
                  <span>Explore Wedding Services</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>

              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 text-sm sm:text-base border-border/80 font-medium cursor-pointer">
                  <span>Join as a Vendor</span>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pt-4 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-6 border-t border-border/70 w-full max-w-lg"
            >
              <div className="text-center sm:text-left">
                <p className="font-serif text-lg sm:text-2xl font-bold text-foreground">
                  500+
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">Verified Vendors</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-serif text-lg sm:text-2xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-1">
                  <span>4.9</span>
                  <Star className="size-3.5 sm:size-4 fill-amber-500 text-amber-500 inline" />
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">Couples Review Score</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-serif text-lg sm:text-2xl font-bold text-foreground">
                  $0
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">Hidden Markups</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5 flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-3/4 sm:aspect-4/5 rounded-3xl border border-primary/20 bg-linear-to-b from-card via-card to-background p-3 shadow-xl ring-1 ring-black/5">
              <div className="relative size-full overflow-hidden rounded-2xl">
                <Image
                  src="/hero-wedding.jpg"
                  alt="WedPlan Wedding Couple Celebration"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 480px"
                  className="object-cover object-top transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground shadow-xs">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    Verified Vendors
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-full bg-background/85 text-primary shadow-xs">
                    <Heart className="size-4 fill-primary" />
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
