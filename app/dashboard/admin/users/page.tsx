"use client"

import * as React from "react"
// Icons and react

import { SectionHeading } from "@/components/shared/SectionHeading"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"

interface AdminUserItem {
  id: string
  name: string
  email: string
  role: string
  isBlocked?: boolean
  createdAt?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", {
          headers: { Accept: "application/json" },
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawList: AdminUserItem[] = []

          if (Array.isArray(json)) {
            rawList = json as AdminUserItem[]
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data as AdminUserItem[]
            } else if (Array.isArray(jsonObj.users)) {
              rawList = jsonObj.users as AdminUserItem[]
            }
          }
          setUsers(rawList)
        } else {
          setUsers([])
        }
      } catch {
        if (isMounted) {
          setUsers([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [])

  const columns: DataTableColumn<AdminUserItem>[] = [
    {
      header: "User",
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (item) => (
        <span className="capitalize font-medium text-xs text-foreground px-2 py-0.5 rounded-md bg-muted">
          {item.role || "customer"}
        </span>
      ),
    },
    {
      header: "Account Status",
      cell: (item) => (
        <StatusBadge
          status={item.isBlocked ? "blocked" : "active"}
          label={item.isBlocked ? "Blocked" : "Active"}
        />
      ),
    },
    {
      header: "Registered",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      cell: (item) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs cursor-pointer hover:text-destructive"
        >
          {item.isBlocked ? "Unblock" : "Block User"}
        </Button>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="User Directory"
        title="Manage Platform Accounts"
        description="Inspect registered customer couples, vendor studios, and platform administrators."
        centered={false}
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyState={{
          title: "No users registered yet",
          description: "Registered couples and vendors will appear here for administrative review.",
        }}
      />
    </div>
  )
}
