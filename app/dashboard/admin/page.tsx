import type { Metadata } from "next"
import { ShieldCheck, Users, Store, DollarSign } from "lucide-react"
import { SectionHeading, StatCard } from "@/components/shared"

export const metadata: Metadata = {
  title: "Admin Dashboard | WedPlan",
  description: "Platform management, user verification, and admin controls.",
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Platform Administration"
        title="Admin Control Center"
        description="Monitor wedding marketplace activity, verify vendors, and oversee platform integrity."
        centered={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Platform Users"
          value="1,420"
          description="+8% from last month"
          icon={Users}
          change={{ value: "8.4%", isPositive: true }}
        />
        <StatCard
          title="Verified Vendors"
          value="318"
          description="12 pending approval"
          icon={Store}
          change={{ value: "12 pending", isPositive: true }}
        />
        <StatCard
          title="Platform Volume"
          value="$248,500"
          description="Gross marketplace booking value"
          icon={DollarSign}
        />
        <StatCard
          title="System Health"
          value="99.98%"
          description="All services operational"
          icon={ShieldCheck}
        />
      </div>
    </div>
  )
}
