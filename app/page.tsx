"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Sparkles,
  Heart,
  CalendarHeart,
  Users,
  DollarSign,
  Camera,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SectionHeading,
  StatCard,
  ServiceCard,
  EmptyState,
  ErrorState,
  PageLoader,
} from "@/components/shared"

export default function HomePage() {
  const [favoriteServices, setFavoriteServices] = React.useState<string[]>([
    "srv-1",
  ])
  const [showDemoLoader, setShowDemoLoader] = React.useState(false)

  const toggleFavorite = (id: string) => {
    setFavoriteServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    toast.success(
      favoriteServices.includes(id)
        ? "Removed from your wedding shortlist"
        : "Added to your wedding shortlist!"
    )
  }

  const triggerToast = () => {
    toast.success("Welcome to WedPlan!", {
      description: "Your luxury wedding planning workspace is now ready.",
      action: {
        label: "Explore",
        onClick: () => console.log("Explore clicked"),
      },
    })
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* Hero Section with Wedding Typography */}
        <header className="text-center space-y-4 pt-6">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary px-3.5 py-1 text-xs uppercase tracking-widest font-sans"
          >
            Role-Based Wedding Planning Platform
          </Badge>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Crafting Unforgettable <span className="text-primary">Weddings</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
            WedPlan connects couples, premier wedding vendors, and coordinators
            with elegant collaboration tools, live booking, and seamless budget
            tracking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button size="lg" onClick={triggerToast} className="shadow-md">
              <Sparkles className="size-4 mr-2" />
              Test Toast Notification
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setShowDemoLoader(true)
                setTimeout(() => setShowDemoLoader(false), 2000)
              }}
            >
              <Heart className="size-4 mr-2 text-primary" />
              Test Page Loader
            </Button>
          </div>
        </header>

        {showDemoLoader && (
          <PageLoader
            message="Curating your custom wedding experience..."
            fullPage
          />
        )}

        {/* Section Heading & Stat Cards (Dashboard Preview) */}
        <section className="space-y-6">
          <SectionHeading
            badge="Platform Overview"
            title="Dashboard Insights"
            description="Real-time wedding metrics for customers, vendors, and coordinators."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Budget"
              value="$35,000"
              description="Allocated across 8 categories"
              icon={DollarSign}
              change={{ value: "4% under target", isPositive: true }}
            />
            <StatCard
              title="Booked Vendors"
              value="6 / 9"
              description="Venue, Photo, Florist confirmed"
              icon={CheckCircle2}
            />
            <StatCard
              title="Confirmed Guests"
              value="142"
              description="165 invitations sent"
              icon={Users}
              change={{ value: "86% RSVP rate", isPositive: true }}
            />
            <StatCard
              title="Days Remaining"
              value="118"
              description="Saturday, September 19"
              icon={CalendarHeart}
            />
          </div>
        </section>

        {/* Section Heading & Service Cards */}
        <section className="space-y-6">
          <SectionHeading
            badge="Curated Marketplace"
            title="Featured Wedding Services"
            description="Explore handpicked vendors with verified client reviews and bespoke packages."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              id="srv-1"
              title="Golden Hour Elegance Photography"
              category="Photography"
              vendorName="Lumière Wedding Studios"
              location="Napa Valley, CA"
              startingPrice="3,200"
              rating={4.9}
              reviewCount={48}
              featured={true}
              isFavorite={favoriteServices.includes("srv-1")}
              onFavorite={() => toggleFavorite("srv-1")}
            />
            <ServiceCard
              id="srv-2"
              title="Blush & Botanical Floral Arrangements"
              category="Floral & Decor"
              vendorName="Petals & Prose"
              location="San Francisco, CA"
              startingPrice="1,850"
              rating={5.0}
              reviewCount={32}
              isFavorite={favoriteServices.includes("srv-2")}
              onFavorite={() => toggleFavorite("srv-2")}
            />
            <ServiceCard
              id="srv-3"
              title="Artisan Organic Wedding Cakes"
              category="Cakes & Dessert"
              vendorName="Sweet Velvet Bakery"
              location="Oakland, CA"
              startingPrice="750"
              rating={4.8}
              reviewCount={19}
              isFavorite={favoriteServices.includes("srv-3")}
              onFavorite={() => toggleFavorite("srv-3")}
            />
          </div>
        </section>

        {/* Reusable UI States (EmptyState & ErrorState) */}
        <section className="space-y-6">
          <SectionHeading
            badge="System States"
            title="Clean State Handling"
            description="Graceful feedback states adhering to the soft ivory & rose gold wedding theme."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              icon={Camera}
              title="No Vendor Proposals Yet"
              description="You haven't requested any custom proposals yet. Browse our verified vendors to receive quotes."
              action={{
                label: "Browse Vendors",
                onClick: () => toast.info("Opening vendor catalog"),
              }}
              secondaryAction={{
                label: "Learn More",
                onClick: () => toast.info("Wedding planning guide"),
              }}
            />

            <ErrorState
              title="Unable to Sync Guest List"
              message="We had trouble connecting to your guest list sheet. Check your connection or try again."
              onRetry={() => toast.success("Guest list re-synced successfully!")}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
