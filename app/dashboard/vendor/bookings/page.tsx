"use client"

import * as React from "react"
import { MapPin, User, Calendar } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"

interface BookingRequestItem {
  id: string
  clientName: string
  clientEmail?: string
  serviceTitle: string
  eventDate: string
  eventLocation: string
  totalPrice?: number
  status: string
  createdAt?: string
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = React.useState<BookingRequestItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/vendor/bookings", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: BookingRequestItem[] = []

          if (Array.isArray(json)) {
            rawList = json as BookingRequestItem[]
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data as BookingRequestItem[]
            } else if (Array.isArray(jsonObj.bookings)) {
              rawList = jsonObj.bookings as BookingRequestItem[]
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

    fetchBookings()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<BookingRequestItem>[] = [
    {
      header: "Client / Couple",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-3.5" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.clientName || "Wedding Couple"}</p>
            {item.clientEmail && (
              <p className="text-xs text-muted-foreground">{item.clientEmail}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Service",
      cell: (item) => (
        <p className="font-medium text-foreground">{item.serviceTitle || "Custom Package"}</p>
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
      header: "Event Location",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span>{item.eventLocation || "Flexible"}</span>
        </div>
      ),
    },
    {
      header: "Amount",
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
      header: "Action",
      align: "right",
      cell: () => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer">
            Manage
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Inquiries & Bookings"
        title="Booking Requests"
        description="Review, confirm, or coordinate with couples who requested your wedding services."
        centered={false}
      />

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        emptyState={{
          title: "No booking requests yet",
          description: "When couples request to reserve your services, their dates and details will appear here.",
        }}
      />
    </div>
  )
}
