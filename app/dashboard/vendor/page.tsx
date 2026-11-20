import type { Metadata } from "next"
import { Store, CalendarHeart, DollarSign, Star } from "lucide-react"
import { SectionHeading, StatCard } from "@/components/shared"

export const metadata: Metadata = {
  title: "Vendor Studio | WedPlan",
  description: "Manage your wedding services, client inquiries, and bookings.",
}

export default function VendorDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Vendor Workspace"
        title="Vendor Studio Overview"
        description="Review customer inquiries, manage service packages, and track booking revenue."
        centered={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Listings"
          value="4 Services"
          description="Photography & Videography"
          icon={Store}
        />
        <StatCard
          title="Upcoming Weddings"
          value="18 Booked"
          description="Next on Saturday, Oct 24"
          icon={CalendarHeart}
          change={{ value: "3 new this week", isPositive: true }}
        />
        <StatCard
          title="Revenue (30d)"
          value="$14,250"
          description="Cleared via Stripe"
          icon={DollarSign}
          change={{ value: "18% increase", isPositive: true }}
        />
        <StatCard
          title="Client Rating"
          value="4.96"
          description="Based on 42 reviews"
          icon={Star}
        />
      </div>
    </div>
  )
}
