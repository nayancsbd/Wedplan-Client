"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Sparkles, MapPin, ExternalLink } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { ServiceItem, normalizeService } from "@/lib/service-utils"

export default function VendorServicesPage() {
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const fetchMyServices = async () => {
      try {
        const res = await fetch("/api/vendor/services", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: unknown[] = []

          if (Array.isArray(json)) {
            rawList = json
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data
            } else if (Array.isArray(jsonObj.services)) {
              rawList = jsonObj.services
            }
          }

          setServices(rawList.map(normalizeService))
        } else {
          setServices([])
        }
      } catch {
        if (isMounted) {
          setServices([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchMyServices()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<ServiceItem>[] = [
    {
      header: "Service",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span>{item.location || "Location Flexible"}</span>
        </div>
      ),
    },
    {
      header: "Starting Price",
      cell: (item) => (
        <span className="font-semibold text-foreground">
          ${Number(item.startingPrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status || "approved"} />,
    },
    {
      header: "Action",
      align: "right",
      cell: (item) => (
        <Link href={`/services/${item.id}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs cursor-pointer">
            <span>View</span>
            <ExternalLink className="size-3" />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeading
          badge="Listing Management"
          title="My Wedding Services"
          description="Manage your published packages, pricing, and active listings."
          centered={false}
        />

        <Link href="/dashboard/vendor/services/new">
          <Button className="gap-2 shadow-xs cursor-pointer">
            <Plus className="size-4" />
            <span>Add New Service</span>
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={services}
        isLoading={isLoading}
        emptyState={{
          title: "No services published yet",
          description: "Create your first wedding package or venue listing to start receiving inquiries from couples.",
          action: {
            label: "Add Your First Service",
            href: "/dashboard/vendor/services/new",
          },
        }}
      />
    </div>
  )
}
