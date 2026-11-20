"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarHeart,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Store,
  Calendar,
  Sparkles,
} from "lucide-react"

import { SectionHeading, StatCard, StatusBadge } from "@/components/shared"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { buttonVariants } from "@/components/ui/button"

interface CustomerBookingItem {
  id: string
  serviceId?: string
  serviceTitle: string
  vendorName?: string
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
}

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = React.useState<CustomerBookingItem[]>([])
  const [stats, setStats] = React.useState<CustomerOverviewStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)

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
              setStats({
                total: Number(data.total ?? data.totalBookings ?? 0),
                pending: Number(data.pending ?? data.pendingBookings ?? 0),
                accepted: Number(data.accepted ?? data.acceptedBookings ?? 0),
                rejected: Number(data.rejected ?? data.rejectedBookings ?? 0),
              })
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

                  return {
                    id: String(rec.id || rec._id || `booking_${idx + 1}`),
                    serviceId: String(serviceObj.id || serviceObj._id || rec.serviceId || ""),
                    serviceTitle: String(serviceObj.name || serviceObj.title || rec.serviceTitle || "Wedding Service"),
                    vendorName: String(vendorObj.businessName || vendorObj.name || rec.vendorName || "Wedding Pro"),
                    eventDate: String(rec.eventDate || rec.date || "TBD"),
                    eventLocation: String(rec.eventLocation || rec.location || "Flexible"),
                    totalPrice: Number(rec.totalPrice || rec.price || serviceObj.price || 0),
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

        if (isMounted) {
          setBookings(rawList)

          if (!overviewLoaded) {
            const total = rawList.length
            const pending = rawList.filter((b) => b.status === "pending").length
            const accepted = rawList.filter((b) => b.status === "accepted" || b.status === "confirmed").length
            const rejected = rawList.filter((b) => b.status === "rejected").length

            setStats({
              total,
              pending,
              accepted,
              rejected,
            })
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

  const columns: DataTableColumn<CustomerBookingItem>[] = [
    {
      header: "Service",
      cell: (item) => (
        <div>
          <span className="font-medium text-foreground block">{item.serviceTitle}</span>
          <span className="text-xs text-muted-foreground">{item.eventLocation}</span>
        </div>
      ),
    },
    {
      header: "Vendor",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Store className="size-3.5 text-primary shrink-0" />
          <span className="font-medium text-foreground">{item.vendorName}</span>
        </div>
      ),
    },
    {
      header: "Wedding Date",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 text-primary shrink-0" />
          <span>{item.eventDate}</span>
        </div>
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
        badge="Wedding Hub"
        title="Welcome to Your Wedding Portal"
        description="Monitor your vendor reservations, track booking requests, and organize your wedding team."
        centered={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Booking Requests"
          value={isLoading ? "..." : String(stats.total)}
          description="All requested services"
          icon={CalendarHeart}
        />
        <StatCard
          title="Pending"
          value={isLoading ? "..." : String(stats.pending)}
          description="Awaiting vendor response"
          icon={Clock}
        />
        <StatCard
          title="Accepted"
          value={isLoading ? "..." : String(stats.accepted)}
          description="Confirmed reservations"
          icon={CheckCircle2}
        />
        <StatCard
          title="Rejected"
          value={isLoading ? "..." : String(stats.rejected)}
          description="Declined requests"
          icon={XCircle}
        />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              Discover Wedding Vendors
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Find premium venues, award-winning photographers, decorators, makeup artists, and caterers for your dream wedding.
          </p>
        </div>

        <Link
          href="/services"
          className={buttonVariants({
            variant: "default",
            className: "gap-2 shadow-sm shrink-0 cursor-pointer w-full sm:w-auto",
          })}
        >
          <span>Explore Services</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Recent Booking Requests
          </h2>
          <Link
            href="/dashboard/customer/bookings"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1 text-xs cursor-pointer",
            })}
          >
            <span>View All Bookings</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={bookings.slice(0, 5)}
          isLoading={isLoading}
          emptyState={{
            title: "No booking requests yet",
            description: "Start exploring verified vendors to create reservations for your wedding day.",
            action: {
              label: "Browse Services",
              href: "/services",
            },
          }}
        />
      </div>
    </div>
  )
}
