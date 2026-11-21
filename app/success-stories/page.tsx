"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  Heart,
  Star,
  MapPin,
  Calendar,
  Users,
  Camera,
  Sparkles,
  ArrowRight,
  Quote,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface WeddingStory {
  id: string
  couple: string
  category: string
  categoryLabel: string
  date: string
  location: string
  guestCount: number
  heroImage: string
  galleryImages: string[]
  quote: string
  author: string
  vendors: {
    role: string
    name: string
  }[]
  highlights: string[]
}

const CATEGORIES = [
  { id: "all", label: "All Weddings" },
  { id: "coastal", label: "Coastal & Beach" },
  { id: "ballroom", label: "Luxury Ballroom" },
  { id: "vineyard", label: "Vineyard & Rustic" },
  { id: "modern", label: "Modern City" },
]

const STORIES: WeddingStory[] = [
  {
    id: "maya-julian",
    couple: "Maya & Julian",
    category: "coastal",
    categoryLabel: "Coastal Romance",
    date: "October 14, 2025",
    location: "Malibu, California",
    guestCount: 135,
    heroImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80",
    ],
    quote:
      "WedPlan allowed us to curate our entire dream team in under three weeks. Being able to compare verified venues and directly message award-winning photographers made planning from across the country completely stress-free.",
    author: "Maya, Bride",
    vendors: [
      { role: "Venue", name: "Cliffside Ocean Terrace" },
      { role: "Photography", name: "Lumina Wedding Arts" },
      { role: "Florist", name: "Blossom & Vine Botanicals" },
      { role: "Catering", name: "Pacific Coastal Culinary" },
    ],
    highlights: ["Sunset oceanfront ceremony", "Acoustic strings trio", "Farm-to-table seafood tasting"],
  },
  {
    id: "sophia-ethan",
    couple: "Sophia & Ethan",
    category: "ballroom",
    categoryLabel: "Luxury Ballroom",
    date: "December 6, 2025",
    location: "New York, New York",
    guestCount: 220,
    heroImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
    ],
    quote:
      "The transparency of pricing on WedPlan saved us thousands. We booked a 5-star historic ballroom and top-tier floral artisans without the typical endless quote emails. It felt like having a personal luxury concierge.",
    author: "Ethan, Groom",
    vendors: [
      { role: "Venue", name: "The Grand Astor Hall" },
      { role: "Photography", name: "Vogue Elegance Studios" },
      { role: "Floral Design", name: "Royal Orchid & Ivy" },
      { role: "Hair & Makeup", name: "Glow Bridal Atelier" },
    ],
    highlights: ["Crystal chandelier reception", "Live 8-piece swing orchestra", "Midnight espresso & gelato bar"],
  },
  {
    id: "camila-lucas",
    couple: "Camila & Lucas",
    category: "vineyard",
    categoryLabel: "Vineyard Estate",
    date: "September 20, 2025",
    location: "Napa Valley, California",
    guestCount: 160,
    heroImage:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80",
    ],
    quote:
      "Every single vendor we hired through WedPlan showed up with warmth, precision, and artistry. Our guests are still raving about the wine pairings and the breathtaking golden hour portraits amongst the vines.",
    author: "Camila, Bride",
    vendors: [
      { role: "Venue", name: "Sunlit Ridge Vineyards" },
      { role: "Photography", name: "Golden Hour Chronicles" },
      { role: "Florist", name: "Wildflower & Rosemary Co." },
      { role: "Catering", name: "Artisan Wood-Fired Table" },
    ],
    highlights: ["Private estate wine tasting", "Hanging eucalyptus chandeliers", "Sunset sparkler send-off"],
  },
  {
    id: "hannah-oliver",
    couple: "Hannah & Oliver",
    category: "modern",
    categoryLabel: "Modern Rooftop",
    date: "August 18, 2025",
    location: "Chicago, Illinois",
    guestCount: 110,
    heroImage:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
    ],
    quote:
      "We wanted a sleek, contemporary celebration with skyline views. WedPlan matched us with an incredible loft space and modern floral sculptors who brought our architectural vision to life effortlessly.",
    author: "Hannah & Oliver",
    vendors: [
      { role: "Venue", name: "The Glass Penthouse Studio" },
      { role: "Photography", name: "Minimalist Moments" },
      { role: "Decor", name: "Modernist Floral Lab" },
      { role: "Catering", name: "Urban Contemporary Bites" },
    ],
    highlights: ["360 skyline sunset views", "Monochrome floral installations", "Late-night artisanal pizza cart"],
  },
]

export default function SuccessStoriesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const prefersReducedMotion = useReducedMotion()

  const filteredStories = React.useMemo(() => {
    if (selectedCategory === "all") return STORIES
    return STORIES.filter((s) => s.category === selectedCategory)
  }, [selectedCategory])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-primary/10 via-primary/5 to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase"
          >
            <Sparkles className="size-3.5" />
            <span>WedPlan Real Weddings</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Love Stories That Inspire
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed"
          >
            Discover how real couples planned and celebrated their extraordinary wedding days
            with WedPlan&apos;s verified vendors, transparent packages, and seamless coordination.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 rounded-2xl border border-border/80 bg-card/60 p-4 sm:grid-cols-4 sm:p-6 shadow-2xs backdrop-blur-xs"
          >
            <div className="space-y-1 border-r border-border/60 last:border-none pr-2">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">1,400+</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                Weddings Planned
              </p>
            </div>
            <div className="space-y-1 sm:border-r border-border/60 pr-2">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-primary">4.9 / 5</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                Average Rating
              </p>
            </div>
            <div className="space-y-1 border-r border-border/60 last:border-none pr-2">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">500+</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                Verified Artisans
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-primary">98%</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                On-Budget Days
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16 pt-4"
        >
          {filteredStories.map((story) => (
            <motion.article
              key={story.id}
              variants={itemVariants}
              className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="relative h-72 sm:h-96 lg:h-auto lg:col-span-5 overflow-hidden">
                  <Image
                    src={story.heroImage}
                    alt={`${story.couple} Wedding`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-xs font-serif text-xs px-3 py-1 shadow-xs border-none">
                      {story.categoryLabel}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                    <h3 className="font-serif text-2xl font-bold">{story.couple}</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 mt-1">
                      <MapPin className="size-3.5" />
                      <span>{story.location}</span>
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10 lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="hidden lg:flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="text-xs text-primary border-primary/30">
                          {story.categoryLabel}
                        </Badge>
                        <h3 className="font-serif text-3xl font-bold text-foreground mt-2">
                          {story.couple}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-4 fill-amber-500" />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-y border-border/60 py-3">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        {story.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-primary" />
                        {story.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary" />
                        {story.guestCount} Guests
                      </span>
                    </div>

                    <div className="relative rounded-2xl bg-primary/5 p-5 border border-primary/10">
                      <Quote className="size-6 text-primary/30 mb-2" />
                      <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                        &ldquo;{story.quote}&rdquo;
                      </p>
                      <p className="mt-3 text-xs font-semibold text-primary not-italic">
                        — {story.author}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        WedPlan Dream Team
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {story.vendors.map((v, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-border/70 bg-background/80 p-2.5 text-left"
                          >
                            <p className="text-[10px] text-muted-foreground uppercase">{v.role}</p>
                            <p className="font-serif text-xs font-semibold text-foreground truncate mt-0.5">
                              {v.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Celebration Highlights
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {story.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                          >
                            <CheckCircle2 className="size-3 text-primary" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <Link href="/services">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Camera className="size-3.5" />
                        <span>Browse Similar Vendors</span>
                      </Button>
                    </Link>

                    <Link href="/services">
                      <Button size="sm" className="gap-1.5 text-xs cursor-pointer shadow-xs">
                        <span>Plan Your Day</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="mt-20 overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-background p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Heart className="size-7 fill-primary-foreground" />
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
              Ready to Write Your Own Love Story?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Connect with verified wedding artisans, venues, and planners who will bring your
              dream celebration to life without the stress.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/services">
              <Button size="lg" className="shadow-sm cursor-pointer gap-2 font-serif font-semibold">
                <span>Explore Wedding Vendors</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                size="lg"
                className="cursor-pointer border-border/80 font-serif"
              >
                Create Couple Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
