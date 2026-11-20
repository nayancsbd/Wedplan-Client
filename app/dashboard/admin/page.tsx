"use client"

import * as React from "react"
import Link from "next/link"
import { ShieldCheck, Users, Store, DollarSign, ArrowRight } from "lucide-react"

import { SectionHeading, StatCard, StatusBadge } from "@/components/shared"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { Button } from "@/components/ui/button"

interface AdminRecentActivity {
  id: string
  action: string
  target: string
  user: string
  status: string
  date: string
}

export default function AdminDashboardPage() {
  const [activities, setActivities] = React.useState<AdminRecentActivity[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const res = await fetch("/api/admin/recent-activity", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: AdminRecentActivity[] = []

          if (Array.isArray(json)) {
            rawList = json as AdminRecentActivity[]
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data as AdminRecentActivity[]
            }
          }
          setActivities(rawList.slice(0, 5))
        } else {
          setActivities([])
        }
      } catch {
        if (isMounted) {
          setActivities([])
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

  const columns: DataTableColumn<AdminRecentActivity>[] = [
    {
      header: "Action",
      cell: (item) => <span className="font-medium text-foreground">{item.action}</span>,
    },
    {
      header: "Target / Service",
      cell: (item) => <span className="text-muted-foreground">{item.target}</span>,
    },
    {
      header: "User / Vendor",
      cell: (item) => <span className="text-xs text-muted-foreground">{item.user}</span>,
    },
    {
      header: "Status",
      align: "right",
      cell: (item) => <StatusBadge status={item.status || "completed"} />,
    },
  ]

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

      {/* Admin Action Shortcuts & Table */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Recent Platform Activity
          </h2>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/users">
              <Button variant="ghost" size="sm" className="gap-1 text-xs cursor-pointer">
                <span>Manage Users</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            <Link href="/dashboard/admin/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs cursor-pointer">
                <span>Transactions</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={activities}
          isLoading={isLoading}
          emptyState={{
            title: "No recent security or platform events",
            description: "Vendor onboarding, listing approvals, and transactions will stream here in real time.",
          }}
        />
      </div>
    </div>
  )
}
