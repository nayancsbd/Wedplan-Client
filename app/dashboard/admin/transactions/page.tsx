"use client"

import * as React from "react"
// React and icons

import { SectionHeading } from "@/components/shared/SectionHeading"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface AdminTransactionItem {
  id: string
  customerName?: string
  vendorName?: string
  serviceTitle?: string
  amount: number
  status: string
  createdAt?: string
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = React.useState<AdminTransactionItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/admin/transactions", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: AdminTransactionItem[] = []

          if (Array.isArray(json)) {
            rawList = json as AdminTransactionItem[]
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data as AdminTransactionItem[]
            } else if (Array.isArray(jsonObj.transactions)) {
              rawList = jsonObj.transactions as AdminTransactionItem[]
            }
          }
          setTransactions(rawList)
        } else {
          setTransactions([])
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

  const columns: DataTableColumn<AdminTransactionItem>[] = [
    {
      header: "Transaction ID",
      cell: (item) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          #{item.id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Couple / Customer",
      cell: (item) => (
        <span className="font-medium text-foreground text-xs">
          {item.customerName || "Customer"}
        </span>
      ),
    },
    {
      header: "Vendor",
      cell: (item) => (
        <span className="text-muted-foreground text-xs">
          {item.vendorName || "Wedding Vendor"}
        </span>
      ),
    },
    {
      header: "Amount",
      cell: (item) => (
        <span className="font-bold text-foreground">
          ${Number(item.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Payment Status",
      cell: (item) => <StatusBadge status={item.status || "completed"} />,
    },
    {
      header: "Date",
      align: "right",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Financial Overview"
        title="Marketplace Transactions"
        description="Monitor booking payments, vendor payouts, and Stripe platform transactions."
        centered={false}
      />

      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        emptyState={{
          title: "No transactions processed yet",
          description: "Stripe marketplace charges and wedding booking payments will appear here.",
        }}
      />
    </div>
  )
}
