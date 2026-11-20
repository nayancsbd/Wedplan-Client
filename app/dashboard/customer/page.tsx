import type { Metadata } from "next"
import { CalendarHeart, DollarSign, CheckCircle2, Users } from "lucide-react"
import { SectionHeading, StatCard } from "@/components/shared"

export const metadata: Metadata = {
  title: "My Wedding Dashboard | WedPlan",
  description: "Track your wedding checklist, budget, and booked vendors.",
}

export default function CustomerDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Wedding Planning"
        title="Your Wedding Hub"
        description="Everything you need for your big day: vendors, budget, and schedule in one place."
        centered={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Days to Wedding"
          value="142 Days"
          description="Saturday, September 19"
          icon={CalendarHeart}
        />
        <StatCard
          title="Budget Spent"
          value="$22,400"
          description="Budget cap: $35,000"
          icon={DollarSign}
          change={{ value: "On target", isPositive: true }}
        />
        <StatCard
          title="Booked Vendors"
          value="5 / 8"
          description="Venue, Florist, Photo secured"
          icon={CheckCircle2}
        />
        <StatCard
          title="Guest RSVPs"
          value="118 / 150"
          description="78% response rate"
          icon={Users}
          change={{ value: "+12 this week", isPositive: true }}
        />
      </div>
    </div>
  )
}
