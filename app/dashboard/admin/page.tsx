"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  Store,
  Heart,
  Layers,
  Clock,
  CreditCard,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from "lucide-react"

import { SectionHeading, StatCard, StatusBadge } from "@/components/shared"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { buttonVariants } from "@/components/ui/button"

interface AdminStats {
  totalUsers: number
  vendors: number
  customers: number
  totalServices: number
  pendingServices: number
  totalTransactions: number
}

interface PendingReviewService {
  id: string
  title: string
  vendorName: string
  category: string
  price: number
  status: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<AdminStats>({
    totalUsers: 0,
    vendors: 0,
    customers: 0,
    totalServices: 0,
    pendingServices: 0,
    totalTransactions: 0,
  })
  const [pendingList, setPendingList] = React.useState<PendingReviewService[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadAdminOverview = async () => {
      try {
        let statsLoaded = false

        try {
          const overviewRes = await fetch("/api/admin/overview", {
            headers: { Accept: "application/json" },
            credentials: "include",
          })

          if (overviewRes.ok) {
            const overviewJson = await overviewRes.json().catch(() => null)
            const d = (overviewJson?.data || overviewJson || {}) as Record<string, unknown>

            if (
              typeof d.totalUsers === "number" ||
              typeof d.totalRegisteredUsers === "number" ||
              typeof d.users === "number"
            ) {
              setStats({
                totalUsers: Number(d.totalUsers ?? d.totalRegisteredUsers ?? d.users ?? 0),
                vendors: Number(d.vendors ?? d.totalVendors ?? 0),
                customers: Number(d.customers ?? d.totalCustomers ?? 0),
                totalServices: Number(d.totalServices ?? d.services ?? 0),
                pendingServices: Number(d.pendingServices ?? d.pending ?? 0),
                totalTransactions: Number(d.totalTransactions ?? d.transactions ?? 0),
              })
              statsLoaded = true
            }
          }
        } catch {
          statsLoaded = false
        }

        const [usersRes, servicesRes, txRes] = await Promise.allSettled([
          fetch("/api/admin/users?limit=100", { headers: { Accept: "application/json" }, credentials: "include" }),
          fetch("/api/admin/services?limit=100", { headers: { Accept: "application/json" }, credentials: "include" }),
          fetch("/api/admin/transactions?limit=100", { headers: { Accept: "application/json" }, credentials: "include" }),
        ])

        let userCount = 0
        let vendorCount = 0
        let customerCount = 0
        let servicesCount = 0
        let pendingCount = 0
        let txCount = 0
        let pendingServices: PendingReviewService[] = []

        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          const uJson = await usersRes.value.json().catch(() => null)
          const uArr: Record<string, unknown>[] = Array.isArray(uJson)
            ? uJson
            : Array.isArray(uJson?.data)
            ? uJson.data
            : Array.isArray(uJson?.data?.users)
            ? uJson.data.users
            : Array.isArray(uJson?.users)
            ? uJson.users
            : []

          userCount = uArr.length
          vendorCount = uArr.filter((u) => u.role === "vendor").length
          customerCount = uArr.filter((u) => u.role === "customer" || !u.role).length
        }

        if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
          const sJson = await servicesRes.value.json().catch(() => null)
          const sArr: Record<string, unknown>[] = Array.isArray(sJson)
            ? sJson
            : Array.isArray(sJson?.data)
            ? sJson.data
            : Array.isArray(sJson?.data?.services)
            ? sJson.data.services
            : Array.isArray(sJson?.services)
            ? sJson.services
            : []

          servicesCount = sArr.length
          const pendingRaw = sArr.filter((s) => String(s.status || "pending").toLowerCase() === "pending")
          pendingCount = pendingRaw.length

          pendingServices = pendingRaw.slice(0, 5).map((s, idx) => {
            const vendorObj = (s.vendor || {}) as Record<string, unknown>
            return {
              id: String(s.id || s._id || `pending_${idx + 1}`),
              title: String(s.serviceName || s.title || s.name || "Wedding Service"),
              vendorName: String(vendorObj.businessName || vendorObj.name || s.vendorName || "Wedding Vendor"),
              category: String(s.category || "General"),
              price: Number(s.price || s.startingPrice || 0),
              status: "pending",
              createdAt: String(s.createdAt || s.created || new Date().toISOString()),
            }
          })
        }

        if (txRes.status === "fulfilled" && txRes.value.ok) {
          const tJson = await txRes.value.json().catch(() => null)
          const tArr: unknown[] = Array.isArray(tJson)
            ? tJson
            : Array.isArray(tJson?.data)
            ? tJson.data
            : Array.isArray((tJson?.data as Record<string, unknown>)?.transactions)
            ? ((tJson?.data as Record<string, unknown>)?.transactions as unknown[])
            : Array.isArray(tJson?.transactions)
            ? tJson.transactions
            : []

          txCount = tArr.length
        }

        if (isMounted) {
          if (!statsLoaded) {
            setStats({
              totalUsers: userCount,
              vendors: vendorCount,
              customers: customerCount,
              totalServices: servicesCount,
              pendingServices: pendingCount,
              totalTransactions: txCount,
            })
          }
          setPendingList(pendingServices)
        }
      } catch {
        if (isMounted) {
          setPendingList([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAdminOverview()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<PendingReviewService>[] = [
    {
      header: "Service Title",
      cell: (item) => (
        <div>
          <span className="font-medium text-foreground block">{item.title}</span>
          <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
        </div>
      ),
    },
    {
      header: "Vendor",
      cell: (item) => (
        <span className="text-xs font-medium text-foreground">{item.vendorName}</span>
      ),
    },
    {
      header: "Starting Price",
      cell: (item) => (
        <span className="font-semibold text-foreground text-xs">
          ${item.price.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Action",
      align: "right",
      cell: () => (
        <Link
          href="/dashboard/admin/services"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "h-7 text-xs cursor-pointer",
          })}
        >
          Review
        </Link>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Platform Administration"
        title="Admin Control Center"
        description="Oversee users, service verifications, and financial transactions across WedPlan."
        centered={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Users"
          value={isLoading ? "..." : String(stats.totalUsers)}
          description="Total active & verified platform accounts"
          icon={Users}
        />
        <StatCard
          title="Vendors"
          value={isLoading ? "..." : String(stats.vendors)}
          description="Registered wedding service providers"
          icon={Store}
        />
        <StatCard
          title="Customers"
          value={isLoading ? "..." : String(stats.customers)}
          description="Couples & wedding planners"
          icon={Heart}
        />
        <StatCard
          title="Total Services"
          value={isLoading ? "..." : String(stats.totalServices)}
          description="Catalog listings across all categories"
          icon={Layers}
        />
        <StatCard
          title="Pending Services"
          value={isLoading ? "..." : String(stats.pendingServices)}
          description="Listings awaiting admin verification"
          icon={Clock}
        />
        <StatCard
          title="Total Transactions"
          value={isLoading ? "..." : String(stats.totalTransactions)}
          description="Stripe subscriptions & payments"
          icon={CreditCard}
        />
      </div>

      {stats.pendingServices > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-foreground">
                {stats.pendingServices} Services Awaiting Approval
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                New vendor listings require review before appearing in public search.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/admin/services?status=pending"
            className={buttonVariants({
              variant: "default",
              className: "gap-1.5 text-xs font-medium cursor-pointer w-full sm:w-auto",
            })}
          >
            <span>Review Pending Services</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/admin/users"
          className="rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/40 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                Manage Users
              </h4>
              <p className="text-xs text-muted-foreground">View, filter & manage user accounts</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/admin/services"
          className="rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/40 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                Manage Services
              </h4>
              <p className="text-xs text-muted-foreground">Approve, reject or delete listings</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/admin/transactions"
          className="rounded-2xl border border-border/80 bg-card p-5 hover:border-primary/40 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                Transactions
              </h4>
              <p className="text-xs text-muted-foreground">Audit Stripe platform revenue</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Pending Service Review Queue</span>
          </h2>
          <Link
            href="/dashboard/admin/services?status=pending"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1 text-xs cursor-pointer",
            })}
          >
            <span>View All Services</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={pendingList}
          isLoading={isLoading}
          emptyState={{
            title: "Review queue is clear",
            description: "No services are currently pending approval. All vendor listings are verified.",
          }}
        />
      </div>
    </div>
  )
}
