"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarHeart, DollarSign, CheckCircle2, Users, ArrowRight } from "lucide-react"

import { SectionHeading, StatCard, StatusBadge } from "@/components/shared"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { Button } from "@/components/ui/button"

interface RecentCustomerBooking {
  id: string
  serviceTitle: string
  vendorName: string
  eventDate: string
  status: string
}

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = React.useState<RecentCustomerBooking[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadBookings = async () => {
      try {
        const res = await fetch("/api/customer/bookings", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: RecentCustomerBooking[] = []

          if (Array.isArray(json)) {
            rawList = json as RecentCustomerBooking[]
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data as RecentCustomerBooking[]
            } else if (Array.isArray(jsonObj.bookings)) {
              rawList = jsonObj.bookings as RecentCustomerBooking[]
            }
          }
          setBookings(rawList.slice(0, 5))
        } else {
          setBookings([])
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

    loadBookings()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<RecentCustomerBooking>[] = [
    {
      header: "Service",
      cell: (item) => <span className="font-medium text-foreground">{item.serviceTitle}</span>,
    },
    {
      header: "Vendor",
      cell: (item) => (
        <span className="text-muted-foreground">{item.vendorName || "Wedding Pro"}</span>
      ),
    },
    {
      header: "Wedding Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">{item.eventDate || "TBD"}</span>
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

      {/* Bookings Preview Table */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Current Vendor Bookings
          </h2>
          <Link href="/dashboard/customer/bookings">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <span>View All Bookings</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          emptyState={{
            title: "No vendor bookings yet",
            description: "Explore photography, venues, florals, and catering to reserve your wedding vendors.",
            action: {
              label: "Browse Wedding Services",
              href: "/services",
            },
          }}
        />
      </div>
    </div>
  )
}
