"use client"

import * as React from "react"
import {
  CreditCard,
  Search,
  Receipt,
  Store,
  Calendar,
} from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminTransactionItem {
  id: string
  vendorName: string
  vendorEmail?: string
  plan: string
  amount: number
  currency?: string
  status: string
  createdAt?: string
}

type StatusFilter = "all" | "paid" | "pending" | "failed"

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = React.useState<AdminTransactionItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")

  React.useEffect(() => {
    let isMounted = true

    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const endpoints = [
          "/api/admin/transactions",
          "/api/payments/transactions",
          "/api/transactions",
        ]

        let rawList: AdminTransactionItem[] = []

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, {
              headers: { Accept: "application/json" },
              credentials: "include",
            })

            if (res.ok) {
              const json = await res.json().catch(() => null)
              let arrayData: unknown[] = []

              if (Array.isArray(json)) arrayData = json
              else if (json && typeof json === "object") {
                const jsonObj = json as Record<string, unknown>
                if (Array.isArray(jsonObj.data)) arrayData = jsonObj.data
                else if (Array.isArray(jsonObj.transactions)) arrayData = jsonObj.transactions
              }

              if (arrayData.length > 0 || res.status === 200) {
                rawList = arrayData.map((item, idx) => {
                  const rec = (item || {}) as Record<string, unknown>
                  const vendorObj = (rec.vendor || {}) as Record<string, unknown>
                  const userObj = (rec.user || {}) as Record<string, unknown>

                  const vendorName = String(
                    vendorObj.businessName ||
                      vendorObj.name ||
                      userObj.businessName ||
                      userObj.name ||
                      rec.vendorName ||
                      rec.businessName ||
                      "Wedding Vendor"
                  )

                  const vendorEmail = (vendorObj.email || userObj.email || rec.vendorEmail || rec.email) as string | undefined
                  const rawAmount = Number(rec.amount || rec.total || 0)
                  const normalizedAmount =
                    rawAmount >= 100 && rawAmount % 1 === 0 ? rawAmount / 100 : rawAmount

                  return {
                    id: String(rec.id || rec._id || rec.stripeId || `tx_${idx + 1}`),
                    vendorName,
                    vendorEmail,
                    plan: String(rec.plan || rec.description || "Premium Vendor Plan"),
                    amount: normalizedAmount,
                    currency: String(rec.currency || "USD").toUpperCase(),
                    status: String(rec.status || "completed").toLowerCase(),
                    createdAt: (rec.createdAt || rec.created || rec.date) as string | undefined,
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
          setTransactions(rawList)
        }
      } catch {
        if (isMounted) {
          setTransactions([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTransactions()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      const normalizedStatus = t.status.toLowerCase()
      let matchesStatus = true

      if (statusFilter === "paid") {
        matchesStatus =
          normalizedStatus === "paid" ||
          normalizedStatus === "completed" ||
          normalizedStatus === "succeeded"
      } else if (statusFilter === "pending") {
        matchesStatus = normalizedStatus === "pending" || normalizedStatus === "processing"
      } else if (statusFilter === "failed") {
        matchesStatus = normalizedStatus === "failed" || normalizedStatus === "cancelled"
      }

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.vendorName.toLowerCase().includes(q) ||
        (t.vendorEmail && t.vendorEmail.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q) ||
        t.plan.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [transactions, statusFilter, searchQuery])

  const counts = React.useMemo(() => {
    return {
      all: transactions.length,
      paid: transactions.filter((t) =>
        ["paid", "completed", "succeeded"].includes(t.status.toLowerCase())
      ).length,
      pending: transactions.filter((t) =>
        ["pending", "processing"].includes(t.status.toLowerCase())
      ).length,
      failed: transactions.filter((t) =>
        ["failed", "cancelled"].includes(t.status.toLowerCase())
      ).length,
    }
  }, [transactions])

  const formatDisplayDate = (dateVal?: string) => {
    if (!dateVal) return "—"
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return dateVal
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Financial Audit"
        title="Marketplace Transactions"
        description="Comprehensive read-only log of Stripe subscription charges, vendor membership fees, and platform settlements."
        centered={false}
      />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {(
            [
              { key: "all", label: "All Records", count: counts.all },
              { key: "paid", label: "Paid / Succeeded", count: counts.paid },
              { key: "pending", label: "Pending", count: counts.pending },
              { key: "failed", label: "Failed", count: counts.failed },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  statusFilter === tab.key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor, email, transaction ID..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border/80 bg-card p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-foreground">No transactions recorded</h3>
            <p className="text-xs text-muted-foreground">
              No payment transactions match the selected filter criteria.
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-xs cursor-pointer"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border/80 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-4">Transaction ID</th>
                  <th className="px-4 py-3.5">Vendor</th>
                  <th className="px-4 py-3.5">Plan / Description</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="size-4 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs text-foreground font-semibold">
                          {item.id.length > 20 ? `${item.id.slice(0, 16)}...` : item.id}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground text-xs flex items-center gap-1.5">
                          <Store className="size-3 text-primary shrink-0" />
                          <span>{item.vendorName}</span>
                        </p>
                        {item.vendorEmail && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.vendorEmail}</p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-medium text-foreground text-xs capitalize">
                        {item.plan}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-foreground text-sm">
                        ${item.amount.toFixed(2)} {item.currency || "USD"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-4 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <span>{formatDisplayDate(item.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
