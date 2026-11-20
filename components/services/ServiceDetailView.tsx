"use client"

import * as React from "react"
import Link from "next/link"
import {
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Info,
  ChevronRight,
  Sparkles,
  Share2,
  Heart,
  Check,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/use-auth"
import { ServiceItem } from "@/lib/service-utils"
import { ServiceImageGallery } from "@/components/services/ServiceImageGallery"
import { BookingDialog } from "@/components/services/BookingDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ServiceDetailViewProps {
  service: ServiceItem
}

export function ServiceDetailView({ service }: ServiceDetailViewProps) {
  const { user, role, isAuthenticated } = useAuth()
  const [isBookingOpen, setIsBookingOpen] = React.useState(false)
  const [isFavorited, setIsFavorited] = React.useState(false)

  // Determine user role flags
  const isCustomer = role === "customer"
  const isVendor = role === "vendor"
  const isAdmin = role === "admin"

  // Check if current vendor owns this service listing
  const isOwner =
    isVendor &&
    Boolean(
      (user?.id && service.vendorId && String(user.id) === String(service.vendorId)) ||
      (user?.email &&
        service.vendorEmail &&
        user.email.toLowerCase() === service.vendorEmail.toLowerCase())
    )

  // Vendor initials for avatar fallback
  const vendorInitials = (service.vendorName || "Wedding Vendor")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorited((prev) => !prev)
    toast.success(
      isFavorited ? "Removed from favorites" : "Saved to your wedding favorites!"
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-1"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link href="/services" className="hover:text-foreground transition-colors">
          Services
        </Link>
        {service.category && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              href={`/services?category=${encodeURIComponent(service.category.toLowerCase())}`}
              className="hover:text-foreground transition-colors capitalize"
            >
              {service.category}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
          {service.title}
        </span>
      </nav>

      {/* Main Service Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (8 cols): Media Gallery & Full Service Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Image Gallery with Thumbnails */}
          <ServiceImageGallery images={service.images} title={service.title} />

          {/* Core Info & Title Header */}
          <div className="space-y-4 border-b border-border/70 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs capitalize font-medium">
                  {service.category}
                </Badge>
                {service.featured && (
                  <Badge className="bg-primary text-primary-foreground border-none font-medium text-xs">
                    <Sparkles className="size-3 mr-1" />
                    Featured Service
                  </Badge>
                )}
                {service.status && service.status !== "approved" && (
                  <Badge variant="outline" className="text-xs uppercase">
                    {service.status}
                  </Badge>
                )}
              </div>

              {/* Action buttons (Share / Save) */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 gap-1.5 text-xs cursor-pointer"
                >
                  <Share2 className="size-3.5" />
                  <span>Share</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="h-8 gap-1.5 text-xs cursor-pointer"
                >
                  <Heart
                    className={`size-3.5 ${
                      isFavorited ? "fill-primary text-primary" : ""
                    }`}
                  />
                  <span>{isFavorited ? "Saved" : "Save"}</span>
                </Button>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              {service.title}
            </h1>

            {/* Location & Rating meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
              {service.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>{service.location}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-semibold text-foreground">
                  {(service.rating || 5.0).toFixed(1)}
                </span>
                <span>({service.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              About This Service
            </h2>
            <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {service.description ||
                "This wedding professional offers tailored packages designed to make your wedding day seamless, memorable, and stunning. Contact the vendor or request a booking to discuss customized schedules, custom decor, or specialized requirements."}
            </div>
          </div>

          {/* Inclusions / Highlights */}
          {service.inclusions && service.inclusions.length > 0 && (
            <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Package Inclusions & Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {service.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <div className="rounded-full bg-primary/10 p-1 text-primary shrink-0 mt-0.5">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor Information Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Vendor Information
            </h2>
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 rounded-full border-2 border-primary/20">
                  {service.vendorAvatar && (
                    <AvatarImage
                      src={service.vendorAvatar}
                      alt={service.vendorName || "Vendor"}
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {vendorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {service.vendorName || "WedPlan Verified Pro"}
                  </h3>
                  {service.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      {service.location}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <ShieldCheck className="size-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Verified WedPlan Professional
                    </span>
                  </div>
                </div>
              </div>

              {service.vendorEmail && (
                <div className="text-right text-xs text-muted-foreground sm:self-center">
                  <p>Inquiries</p>
                  <p className="font-medium text-foreground">{service.vendorEmail}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Booking & Pricing Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            {/* Price Header */}
            <div className="border-b border-border/70 pb-4 space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Investment
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                  ${Number(service.startingPrice || 0).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">starting price</span>
              </div>
              {service.priceRange && (
                <p className="text-xs text-muted-foreground pt-1">
                  Typical range: <span className="font-medium text-foreground">{service.priceRange}</span>
                </p>
              )}
            </div>

            {/* Dynamic Role-Based Booking Section */}
            <div className="space-y-4">
              {/* Scenario 1: Not Logged In */}
              {!isAuthenticated && (
                <div className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-4 text-center">
                  <Info className="size-5 text-primary mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Sign in to book this service
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create or log into your couple/customer account to reserve wedding dates and message vendors.
                    </p>
                  </div>
                  <Link
                    href={`/signin?callbackUrl=${encodeURIComponent(`/services/${service.id}`)}`}
                    className="block"
                  >
                    <Button className="w-full font-medium cursor-pointer">
                      Sign In to Book
                    </Button>
                  </Link>
                </div>
              )}

              {/* Scenario 2: Vendor owns this service -> 'You cannot book your own service' */}
              {isAuthenticated && isOwner && (
                <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-sm">
                        You cannot book your own service
                      </p>
                      <p className="text-muted-foreground dark:text-amber-300/80 leading-relaxed">
                        You are the verified provider for this wedding listing. Manage your packages, availability, and customer inquiries from your vendor portal.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/vendor" className="block pt-1">
                    <Button variant="outline" className="w-full text-xs font-medium cursor-pointer">
                      Go to Vendor Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {/* Scenario 3: Vendor does NOT own this service -> Info message */}
              {isAuthenticated && isVendor && !isOwner && (
                <div className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-start gap-2.5">
                    <Info className="size-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-sm text-foreground">
                        Vendor Account Notice
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Vendors cannot book services. Bookings are reserved for couple and customer accounts.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/vendor" className="block pt-1">
                    <Button variant="outline" className="w-full text-xs font-medium cursor-pointer">
                      Manage Your Listings
                    </Button>
                  </Link>
                </div>
              )}

              {/* Scenario 4: Admin -> Info message */}
              {isAuthenticated && isAdmin && (
                <div className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-start gap-2.5">
                    <Info className="size-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-sm text-foreground">
                        Administrator Notice
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Administrators cannot book services. To place a reservation, sign in with a couple or customer account.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/admin" className="block pt-1">
                    <Button variant="outline" className="w-full text-xs font-medium cursor-pointer">
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {/* Scenario 5: Customer -> Show Booking Action & Form Trigger */}
              {isAuthenticated && isCustomer && (
                <div className="space-y-4">
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Response time:</span>
                      <span className="font-medium text-foreground">Within 24 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Deposit:</span>
                      <span className="font-medium text-foreground">Held securely</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cancellation:</span>
                      <span className="font-medium text-foreground">Flexible policy</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsBookingOpen(true)}
                    size="lg"
                    className="w-full gap-2 font-medium shadow-sm cursor-pointer"
                  >
                    <Calendar className="size-4" />
                    <span>Book This Service</span>
                  </Button>

                  {/* Booking Modal Dialog */}
                  <BookingDialog
                    service={service}
                    open={isBookingOpen}
                    onOpenChange={setIsBookingOpen}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
