"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  CalendarHeart,
  Clock,
  CheckCircle2,
  ArrowRight,
  Store,
  Calendar,
  Sparkles,
  Heart,
  DollarSign,
  Compass,
  UserCheck,
  Check,
  ChevronRight,
  Star,
  MapPin,
} from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CustomerBookingItem {
  id: string
  serviceId?: string
  serviceTitle: string
  serviceImage?: string
  serviceCategory?: string
  vendorName?: string
  vendorAvatar?: string
  eventDate: string
  eventLocation?: string
  totalPrice?: number
  status: string
  createdAt?: string
}

interface CustomerOverviewStats {
  total: number
  pending: number
  accepted: number
  rejected: number
  committedBudget: number
}

interface RecommendedService {
  id: string
  title: string
  category: string
  vendorName: string
  location: string
  price: number
  rating: number
  imageUrl: string
}

const PLANNING_STEPS = [
  { id: 1, title: "Set Wedding Date & Vision", completed: true },
  { id: 2, title: "Reserve Ceremony & Reception Venue", completed: true },
  { id: 3, title: "Book Wedding Photographer", completed: false, inProgress: true },
  { id: 4, title: "Finalize Florals & Event Decor", completed: false },
  { id: 5, title: "Catering Menu & Cake Tasting", completed: false },
]

export default function CustomerDashboardPage() {
  const { user } = useAuth()
  const prefersReducedMotion = useReducedMotion()

  const [bookings, setBookings] = React.useState<CustomerBookingItem[]>([])
  const [recommended, setRecommended] = React.useState<RecommendedService[]>([])
  const [stats, setStats] = React.useState<CustomerOverviewStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    committedBudget: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  const userName = user?.name ? user.name.split(" ")[0] : "Wedding Partner"

  React.useEffect(() => {
    let isMounted = true

    const loadCustomerData = async () => {
      try {
        let overviewLoaded = false

        try {
          const overviewRes = await fetch("/api/customer/overview", {
            headers: { Accept: "application/json" },
            credentials: "include",
          })

          if (overviewRes.ok) {
            const overviewJson = await overviewRes.json().catch(() => null)
            const data = (overviewJson?.data || overviewJson || {}) as Record<string, unknown>

            if (typeof data.total === "number" || typeof data.totalBookings === "number") {
              setStats((prev) => ({
                ...prev,
                total: Number(data.total ?? data.totalBookings ?? 0),
                pending: Number(data.pending ?? data.pendingBookings ?? 0),
                accepted: Number(data.accepted ?? data.acceptedBookings ?? 0),
                rejected: Number(data.rejected ?? data.rejectedBookings ?? 0),
              }))
              overviewLoaded = true
            }
          }
        } catch {
          overviewLoaded = false
        }

        const bookingEndpoints = [
          "/api/customer/bookings",
          "/api/bookings/my",
          "/api/bookings/customer",
          "/api/bookings",
        ]

        let rawList: CustomerBookingItem[] = []

        for (const ep of bookingEndpoints) {
          try {
            const res = await fetch(ep, {
              headers: { Accept: "application/json" },
              credentials: "include",
            })

            if (res.ok) {
              const json = await res.json().catch(() => null)
              let arrayData: unknown[] = []

              if (Array.isArray(json)) {
                arrayData = json
              } else if (json && typeof json === "object") {
                const jsonObj = json as Record<string, unknown>
                if (Array.isArray(jsonObj.data)) arrayData = jsonObj.data
                else if (Array.isArray(jsonObj.bookings)) arrayData = jsonObj.bookings
              }

              if (arrayData.length > 0 || res.status === 200) {
                rawList = arrayData.map((b, idx) => {
                  const rec = (b || {}) as Record<string, unknown>
                  const serviceObj = (rec.service || {}) as Record<string, unknown>
                  const vendorObj = (rec.vendor || {}) as Record<string, unknown>

                  const images = Array.isArray(serviceObj.images)
                    ? (serviceObj.images as string[])
                    : []
                  const primaryImg =
                    typeof serviceObj.image === "string"
                      ? serviceObj.image
                      : images[0] ||
                        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"

                  const price = Number(rec.totalPrice || rec.price || serviceObj.price || 0)

                  return {
                    id: String(rec.id || rec._id || `booking_${idx + 1}`),
                    serviceId: String(serviceObj.id || serviceObj._id || rec.serviceId || ""),
                    serviceTitle: String(
                      serviceObj.name ||
                        serviceObj.serviceName ||
                        serviceObj.title ||
                        rec.serviceTitle ||
                        "Wedding Package"
                    ),
                    serviceImage: primaryImg,
                    serviceCategory: String(serviceObj.category || rec.category || "Wedding Service"),
                    vendorName: String(
                      vendorObj.businessName || vendorObj.name || rec.vendorName || "Verified Artisan"
                    ),
                    vendorAvatar: typeof vendorObj.image === "string" ? vendorObj.image : undefined,
                    eventDate: String(rec.eventDate || rec.date || "TBD"),
                    eventLocation: String(rec.eventLocation || rec.location || "Flexible"),
                    totalPrice: price,
                    status: String(rec.status || "pending").toLowerCase(),
                    createdAt: (rec.createdAt || rec.created) as string | undefined,
                  }
                })
                break
              }
            }
          } catch {
            continue
          }
        }

        try {
          const recRes = await fetch("/api/services?limit=3&sort=rating", {
            headers: { Accept: "application/json" },
          })
          if (recRes.ok) {
            const recJson = await recRes.json().catch(() => null)
            const list = Array.isArray(recJson?.data?.services)
              ? recJson.data.services
              : Array.isArray(recJson?.data)
              ? recJson.data
              : []
            if (Array.isArray(list) && list.length > 0) {
              const mapped = list.slice(0, 3).map((item: Record<string, unknown>) => {
                const vendor = (item.vendor || {}) as Record<string, unknown>
                const images = Array.isArray(item.images) ? (item.images as string[]) : []
                return {
                  id: String(item._id || item.id),
                  title: String(item.serviceName || item.name || item.title || "Wedding Service"),
                  category: String(item.category || "Specialty"),
                  vendorName: String(vendor.businessName || vendor.name || "Wedding Artisan"),
                  location: String(item.location || "Available Nationwide"),
                  price: Number(item.price || item.startingPrice || 1200),
                  rating: Number(item.rating || 5.0),
                  imageUrl:
                    images[0] ||
                    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
                }
              })
              if (isMounted) setRecommended(mapped)
            }
          }
        } catch {
        }

        if (isMounted) {
          setBookings(rawList)

          const total = rawList.length
          const pending = rawList.filter((b) => b.status === "pending").length
          const accepted = rawList.filter(
            (b) => b.status === "accepted" || b.status === "confirmed"
          ).length
          const rejected = rawList.filter((b) => b.status === "rejected").length
          const committed = rawList
            .filter((b) => b.status === "accepted" || b.status === "pending")
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0)

          if (!overviewLoaded) {
            setStats({
              total,
              pending,
              accepted,
              rejected,
              committedBudget: committed,
            })
          } else {
            setStats((prev) => ({
              ...prev,
              committedBudget: committed,
            }))
          }
        }
      } catch {
        if (isMounted) {
          setBookings([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCustomerData()

    return () => {
      isMounted = false
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-primary/25 bg-linear-to-r from-primary/15 via-primary/5 to-card p-6 sm:p-8 lg:p-10 shadow-xs"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 size-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-serif text-xs px-2.5 py-0.5 gap-1.5 shadow-xs">
                <Sparkles className="size-3" />
                <span>Wedding Hub</span>
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Calendar className="size-3 text-primary" />
                Planning Season 2025–2026
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Hello, {userName}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Track vendor proposals, manage reserved wedding services, and build your dream
              celebration team all from your personal couple portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/services">
              <Button size="sm" className="gap-2 shadow-xs cursor-pointer font-serif font-medium">
                <Compass className="size-4" />
                <span>Browse Vendors</span>
              </Button>
            </Link>

            <Link href="/dashboard/customer/bookings">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer border-primary/30 text-primary hover:bg-primary/10 font-serif"
              >
                <CalendarHeart className="size-4" />
                <span>My Bookings</span>
              </Button>
            </Link>

            <Link href="/dashboard/customer/profile">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <UserCheck className="size-4" />
                <span>Couple Vision</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Inquiries
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <CalendarHeart className="size-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-foreground mt-3">
            {isLoading ? "..." : stats.total}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span>Requested packages</span>
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-emerald-500/25 bg-card p-5 shadow-2xs hover:shadow-xs hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Confirmed & Accepted
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="size-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-foreground mt-3">
            {isLoading ? "..." : stats.accepted}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Ready for your celebration
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-amber-500/25 bg-card p-5 shadow-2xs hover:shadow-xs hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Awaiting Vendor
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="size-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-foreground mt-3">
            {isLoading ? "..." : stats.pending}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Response pending</span>
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="group rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Committed Total
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-foreground mt-3">
            {isLoading ? "..." : `$${stats.committedBudget.toLocaleString()}`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active reservations & proposals
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
          <div className="space-y-0.5">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="size-4 text-primary fill-primary" />
              <span>Wedding Planning Checklist</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Milestone progress towards assembling your complete vendor team.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-serif text-primary border-primary/30 w-fit">
            40% Completed
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PLANNING_STEPS.map((step) => (
            <div
              key={step.id}
              className={`rounded-2xl p-4 border transition-all text-left flex flex-col justify-between gap-3 ${
                step.completed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                  : step.inProgress
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : "bg-muted/40 border-border/60 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold">Step {step.id}</span>
                {step.completed ? (
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-3 stroke-[2.5]" />
                  </div>
                ) : step.inProgress ? (
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">
                    Active
                  </Badge>
                ) : (
                  <div className="size-4 rounded-full border border-muted-foreground/40" />
                )}
              </div>
              <p className="text-xs font-semibold leading-snug">{step.title}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Recent Booking Inquiries
              </h2>
              <p className="text-xs text-muted-foreground">
                Your latest reserved packages and vendor responses.
              </p>
            </div>

            <Link
              href="/dashboard/customer/bookings"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "gap-1 text-xs cursor-pointer text-primary hover:text-primary",
              })}
            >
              <span>View All</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl border border-border/70 bg-card p-4 animate-pulse"
                />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/90 bg-card/60 p-8 sm:p-12 text-center space-y-4">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarHeart className="size-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif text-base font-bold text-foreground">
                  No wedding bookings yet
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Start discovering verified wedding venues, photographers, and caterers to make
                  inquiries for your big day.
                </p>
              </div>
              <Link href="/services">
                <Button size="sm" className="gap-1.5 cursor-pointer font-serif">
                  <Compass className="size-3.5" />
                  <span>Discover Wedding Services</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative size-14 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                      {booking.serviceImage && (
                        <Image
                          src={booking.serviceImage}
                          alt={booking.serviceTitle}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-bold text-foreground truncate">
                          {booking.serviceTitle}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 capitalize"
                        >
                          {booking.serviceCategory}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <Store className="size-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{booking.vendorName}</span>
                        <span className="text-border">•</span>
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <span>{booking.eventLocation}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-foreground">
                        {booking.totalPrice ? `$${booking.totalPrice.toLocaleString()}` : "Custom Quote"}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 sm:justify-end">
                        <Calendar className="size-3" />
                        <span>{booking.eventDate}</span>
                      </p>
                    </div>

                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Recommended For You
            </h2>
            <p className="text-xs text-muted-foreground">
              Top rated artisans for your wedding vision.
            </p>
          </div>

          <div className="space-y-3">
            {recommended.length > 0 ? (
              recommended.map((serv) => (
                <Link
                  key={serv.id}
                  href={`/services/${serv.id}`}
                  className="group block rounded-2xl border border-border/80 bg-card p-3 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                      <Image
                        src={serv.imageUrl}
                        alt={serv.title}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-serif text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {serv.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {serv.vendorName}
                      </p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs font-bold text-foreground">
                          From ${serv.price.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                          <Star className="size-3 fill-amber-500" />
                          <span>{serv.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-border/70 bg-card p-6 text-center space-y-2">
                <Sparkles className="size-6 text-primary mx-auto" />
                <p className="font-serif text-xs font-semibold text-foreground">
                  Find Wedding Vendors
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Browse verified venues, photographers, florists, and caterers.
                </p>
                <Link href="/services" className="inline-block pt-1">
                  <Button size="xs" variant="outline" className="text-xs">
                    Explore Directory
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/15 via-primary/5 to-card p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <p className="font-serif text-xs font-bold text-foreground">
                Need Help Planning?
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Read real couple testimonials, vendor advice, and planning inspiration in our
              curated success stories.
            </p>
            <Link href="/success-stories" className="block pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-serif border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
              >
                <span>Read Success Stories</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
