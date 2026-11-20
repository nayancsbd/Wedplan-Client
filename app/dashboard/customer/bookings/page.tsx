"use client"

import * as React from "react"
import Link from "next/link"
import { MapPin, Store, Calendar, ArrowRight } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"

interface CustomerBookingItem {
  id: string
  serviceId?: string
  serviceTitle: string
  category?: string
  vendorName?: string
  eventDate: string
  eventLocation: string
  totalPrice?: number
  status: string
  createdAt?: string
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = React.useState<CustomerBookingItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const fetchMyBookings = async () => {
      try {
        const res = await fetch("/api/customer/bookings", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: CustomerBookingItem[] = []

          if (Array.isArray(json)) {
            rawList = json as CustomerBookingItem[]
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data as CustomerBookingItem[]
            } else if (Array.isArray(jsonObj.bookings)) {
              rawList = jsonObj.bookings as CustomerBookingItem[]
            }
          }
          setBookings(rawList)
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

    fetchMyBookings()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<CustomerBookingItem>[] = [
    {
      header: "Wedding Service",
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.serviceTitle}</p>
          {item.category && (
            <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
          )}
        </div>
      ),
    },
    {
      header: "Vendor",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Store className="size-3.5 text-primary shrink-0" />
          <span className="font-medium text-foreground">{item.vendorName || "Verified Pro"}</span>
        </div>
      ),
    },
    {
      header: "Wedding Date",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 text-primary shrink-0" />
          <span>{item.eventDate || "TBD"}</span>
        </div>
      ),
    },
    {
      header: "Location",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span>{item.eventLocation || "Flexible"}</span>
        </div>
      ),
    },
    {
      header: "Price",
      cell: (item) => (
        <span className="font-semibold text-foreground">
          ${Number(item.totalPrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status || "pending"} />,
    },
    {
      header: "Details",
      align: "right",
      cell: (item) =>
        item.serviceId ? (
          <Link href={`/services/${item.serviceId}`}>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs cursor-pointer">
              <span>View</span>
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Wedding Schedule"
        title="My Bookings & Reservations"
        description="Track and review your wedding professional reservations, status updates, and venue bookings."
        centered={false}
      />

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        emptyState={{
          title: "No bookings placed yet",
          description: "Browse curated wedding venues and professionals to build your wedding dream team.",
          action: {
            label: "Explore Wedding Services",
            href: "/services",
          },
        }}
      />
    </div>
  )
}
