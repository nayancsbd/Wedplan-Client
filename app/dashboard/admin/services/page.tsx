"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles, ExternalLink } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { ServiceItem, normalizeService } from "@/lib/service-utils"

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const fetchAllServices = async () => {
      try {
        const res = await fetch("/api/admin/services", {
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

    fetchAllServices()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<ServiceItem>[] = [
    {
      header: "Service Title",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Vendor",
      cell: (item) => (
        <span className="font-medium text-foreground text-xs">
          {item.vendorName || "Vendor"}
        </span>
      ),
    },
    {
      header: "Price",
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
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/services/${item.id}`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 cursor-pointer">
              <span>View</span>
              <ExternalLink className="size-3" />
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Marketplace Moderation"
        title="Manage Platform Services"
        description="Review vendor listings, verify packages, and ensure quality standards across categories."
        centered={false}
      />

      <DataTable
        columns={columns}
        data={services}
        isLoading={isLoading}
        emptyState={{
          title: "No services listed yet",
          description: "All vendor services submitted for platform listing will appear here.",
        }}
      />
    </div>
  )
}
