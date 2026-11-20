"use client"

import * as React from "react"
import Link from "next/link"
import { Layers, Sparkles, Clock, CalendarCheck, Crown, ArrowRight, Plus } from "lucide-react"

import { SectionHeading, StatCard } from "@/components/shared"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface VendorOverviewStats {
  totalServices: number
  activeServices: number
  pendingBookings: number
  acceptedBookings: number
  subscriptionPlan: string
}

interface RecentBookingItem {
  id: string
  clientName: string
  serviceTitle: string
  eventDate: string
  amount: number
  status: string
}

export default function VendorDashboardPage() {
  const [stats, setStats] = React.useState<VendorOverviewStats>({
    totalServices: 0,
    activeServices: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    subscriptionPlan: "Free Plan",
  })
  const [recentBookings, setRecentBookings] = React.useState<RecentBookingItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadOverviewData = async () => {
      try {
        const [overviewRes, bookingsRes] = await Promise.all([
          fetch("/api/vendor/overview", { headers: { Accept: "application/json" } }).catch(() => null),
          fetch("/api/vendor/bookings", { headers: { Accept: "application/json" } }).catch(() => null),
        ])

        if (!isMounted) return

        if (overviewRes && overviewRes.ok) {
          const json: unknown = await overviewRes.json()
          const dataObj =
            (json as Record<string, unknown>)?.data || (json as Record<string, unknown>) || {}
          const record = dataObj as Record<string, unknown>

          const total = Number(record.totalServices ?? record.total_services ?? record.servicesCount ?? 0)
          const active = Number(record.activeServices ?? record.active_services ?? 0)
          const pending = Number(record.pendingBookings ?? record.pendingRequests ?? record.pending_bookings ?? 0)
          const accepted = Number(record.acceptedBookings ?? record.accepted_bookings ?? record.confirmedBookings ?? 0)
          const planRaw = String(record.subscriptionPlan ?? record.plan ?? record.subscription ?? "Free Plan")
          const planDisplay =
            planRaw.toLowerCase() === "premium" || planRaw.toLowerCase().includes("pro")
              ? "Featured Pro"
              : "Standard Free"

          setStats({
            totalServices: isNaN(total) ? 0 : total,
            activeServices: isNaN(active) ? 0 : active,
            pendingBookings: isNaN(pending) ? 0 : pending,
            acceptedBookings: isNaN(accepted) ? 0 : accepted,
            subscriptionPlan: planDisplay,
          })
        }

        if (bookingsRes && bookingsRes.ok) {
          const json: unknown = await bookingsRes.json()
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
        }
      } catch {
        if (isMounted) {
          setStats({
            totalServices: 0,
            activeServices: 0,
            pendingBookings: 0,
            acceptedBookings: 0,
            subscriptionPlan: "Standard Free",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadOverviewData()

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeading
          badge="Vendor Studio"
          title="Vendor Dashboard Overview"
          description="Track active listings, pending client inquiries, confirmed dates, and subscription status."
          centered={false}
        />

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/vendor/services/new">
            <Button className="gap-2 shadow-xs cursor-pointer">
              <Plus className="size-4" />
              <span>Add Service</span>
            </Button>
          </Link>
          <Link href="/dashboard/vendor/subscription">
            <Button variant="outline" className="gap-1.5 cursor-pointer">
              <Crown className="size-4 text-primary" />
              <span>Plans</span>
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Services"
            value={stats.totalServices}
            description="Created packages"
            icon={Layers}
          />
          <StatCard
            title="Active Services"
            value={stats.activeServices}
            description="Live on marketplace"
            icon={Sparkles}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingBookings}
            description="Awaiting your response"
            icon={Clock}
          />
          <StatCard
            title="Accepted Bookings"
            value={stats.acceptedBookings}
            description="Confirmed celebrations"
            icon={CalendarCheck}
          />
          <StatCard
            title="Current Plan"
            value={stats.subscriptionPlan}
            description={stats.subscriptionPlan.includes("Pro") ? "Unlimited listings" : "Standard quota"}
            icon={Crown}
          />
        </div>
      )}

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Recent Booking Requests
          </h2>
          <Link href="/dashboard/vendor/booking-requests">
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
              label: "View My Published Services",
              href: "/dashboard/vendor/services",
            },
          }}
        />
      </div>
    </div>
  )
}
