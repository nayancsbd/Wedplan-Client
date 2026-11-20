"use client"

import * as React from "react"
import Link from "next/link"
import { Store, CalendarHeart, DollarSign, Star, ArrowRight } from "lucide-react"

import { SectionHeading, StatCard, StatusBadge } from "@/components/shared"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { Button } from "@/components/ui/button"

interface RecentBookingItem {
  id: string
  clientName: string
  serviceTitle: string
  eventDate: string
  amount: number
  status: string
}

export default function VendorDashboardPage() {
  const [recentBookings, setRecentBookings] = React.useState<RecentBookingItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const res = await fetch("/api/vendor/bookings", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: RecentBookingItem[] = []

          if (Array.isArray(json)) {
            rawList = json as RecentBookingItem[]
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data as RecentBookingItem[]
            } else if (Array.isArray(jsonObj.bookings)) {
              rawList = jsonObj.bookings as RecentBookingItem[]
            }
          }
          setRecentBookings(rawList.slice(0, 5))
        } else {
          setRecentBookings([])
        }
      } catch {
        if (isMounted) {
          setRecentBookings([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<RecentBookingItem>[] = [
    {
      header: "Client / Couple",
      cell: (item) => (
        <span className="font-medium text-foreground">{item.clientName || "Wedding Couple"}</span>
      ),
    },
    {
      header: "Service",
      cell: (item) => (
        <span className="text-muted-foreground">{item.serviceTitle || "Custom Service"}</span>
      ),
    },
    {
      header: "Event Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">{item.eventDate || "TBD"}</span>
      ),
    },
    {
      header: "Amount",
      cell: (item) => (
        <span className="font-semibold text-foreground">
          ${Number(item.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      align: "right",
      cell: (item) => <StatusBadge status={item.status || "pending"} />,
    },
  ]

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

      {/* Recent Activity Table */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Recent Booking Inquiries
          </h2>
          <Link href="/dashboard/vendor/bookings">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <span>View All Requests</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={recentBookings}
          isLoading={isLoading}
          emptyState={{
            title: "No booking requests yet",
            description: "New wedding inquiries submitted by couples will appear in this workspace.",
            action: {
              label: "Explore Market Listings",
              href: "/services",
            },
          }}
        />
      </div>
    </div>
  )
}
