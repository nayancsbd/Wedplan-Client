"use client"

import * as React from "react"
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Store,
  Crown,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/api"

interface AdminUserItem {
  id: string
  name: string
  email: string
  role: string
  isBlocked: boolean
  businessName?: string
  subscriptionPlan?: string
  image?: string
  createdAt?: string
}

type RoleFilter = "all" | "customer" | "vendor" | "admin"

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all")
  const [selectedUser, setSelectedUser] = React.useState<AdminUserItem | null>(null)
  const [actingUserId, setActingUserId] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)
  const [hasError, setHasError] = React.useState(false)

  const pageSize = 10

  const refetch = React.useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const endpoints = ["/api/admin/users", "/api/users"]
        let rawList: AdminUserItem[] = []

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
                else if (Array.isArray(jsonObj.users)) arrayData = jsonObj.users
              }

              if (arrayData.length > 0 || res.status === 200) {
                rawList = arrayData.map((u, idx) => {
                  const rec = (u || {}) as Record<string, unknown>
                  return {
                    id: String(rec.id || rec._id || `user_${idx + 1}`),
                    name: String(rec.name || "WedPlan User"),
                    email: String(rec.email || "user@example.com"),
                    role: String(rec.role || "customer").toLowerCase(),
                    isBlocked: Boolean(rec.isBlocked),
                    businessName: rec.businessName as string | undefined,
                    subscriptionPlan: (rec.subscriptionPlan || rec.plan) as string | undefined,
                    image: (rec.image || rec.avatar) as string | undefined,
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
          setUsers(rawList)
          setHasError(false)
        }
      } catch {
        if (isMounted) {
          setUsers([])
          setHasError(true)
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
  }, [refreshTrigger])

  const handleToggleBlock = async (userItem: AdminUserItem) => {
    if (userItem.role === "admin") {
      toast.error("Administrators cannot be blocked.")
      return
    }

    const previousUsers = [...users]
    const nextBlockedState = !userItem.isBlocked
    setActingUserId(userItem.id)

    setUsers((prev) =>
      prev.map((u) => (u.id === userItem.id ? { ...u, isBlocked: nextBlockedState } : u))
    )

    try {
      try {
        await api.patch(`/api/admin/users/${userItem.id}/block`, { isBlocked: nextBlockedState })
      } catch {
        try {
          await api.patch(`/api/admin/users/${userItem.id}`, { isBlocked: nextBlockedState })
        } catch {
          await api.put(`/api/admin/users/${userItem.id}`, { isBlocked: nextBlockedState })
        }
      }

      toast.success(
        nextBlockedState
          ? `User "${userItem.name}" has been blocked.`
          : `User "${userItem.name}" has been unblocked.`
      )

      refetch()
    } catch (err: unknown) {
      setUsers(previousUsers)
      const errObj = err as { message?: string; error?: string }
      toast.error(errObj?.message || errObj?.error || "Failed to update user block status.")
    } finally {
      setActingUserId(null)
    }
  }

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.businessName && u.businessName.toLowerCase().includes(q))

      return matchesRole && matchesSearch
    })
  }, [users, roleFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const counts = React.useMemo(() => {
    return {
      all: users.length,
      customer: users.filter((u) => u.role === "customer" || !u.role).length,
      vendor: users.filter((u) => u.role === "vendor").length,
      admin: users.filter((u) => u.role === "admin").length,
    }
  }, [users])

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
        badge="User Directory"
        title="Manage Platform Users"
        description="Oversee user accounts, review profile details, filter by role, and manage system access permissions."
        centered={false}
      />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {(
            [
              { key: "all", label: "All Users", count: counts.all },
              { key: "customer", label: "Customers", count: counts.customer },
              { key: "vendor", label: "Vendors", count: counts.vendor },
              { key: "admin", label: "Admins", count: counts.admin },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setRoleFilter(tab.key)
                setCurrentPage(1)
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                roleFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  roleFilter === tab.key
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
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by name, email, business..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <p className="text-foreground">
              Unable to load platform users. Please check your network or try again.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="h-8 text-xs cursor-pointer"
          >
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border/80 bg-card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-foreground">No users found</h3>
            <p className="text-xs text-muted-foreground">
              No registered user accounts match your search or filter.
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
        <div className="space-y-4">
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border/80 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3.5 pl-6 pr-4">User</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Business / Plan</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Registered</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedUsers.map((item) => {
                    const isAdmin = item.role === "admin"
                    const isActing = actingUserId === item.id

                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 border border-border/60">
                              <AvatarImage src={item.image || ""} alt={item.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {item.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                                <span>{item.name}</span>
                                {isAdmin && (
                                  <Shield className="size-3 text-primary shrink-0" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              isAdmin
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : item.role === "vendor"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.role || "customer"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {item.businessName ? (
                            <span className="font-medium text-foreground text-xs block">
                              {item.businessName}
                            </span>
                          ) : item.subscriptionPlan ? (
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.subscriptionPlan} Plan
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            status={item.isBlocked ? "blocked" : "active"}
                            label={item.isBlocked ? "Blocked" : "Active"}
                          />
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs text-muted-foreground">
                            {formatDisplayDate(item.createdAt)}
                          </span>
                        </td>

                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(item)}
                              className="h-8 gap-1 text-xs cursor-pointer"
                            >
                              <Eye className="size-3.5" />
                              <span>Details</span>
                            </Button>

                            {isAdmin ? (
                              <span className="text-[11px] text-muted-foreground/70 italic px-2">
                                Admin Protected
                              </span>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={isActing}
                                      className={`h-8 text-xs cursor-pointer ${
                                        item.isBlocked
                                          ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30"
                                          : "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                      }`}
                                    />
                                  }
                                >
                                  {isActing ? (
                                    <Loader2 className="size-3.5 animate-spin mr-1" />
                                  ) : item.isBlocked ? (
                                    <ShieldCheck className="size-3.5 mr-1" />
                                  ) : (
                                    <ShieldAlert className="size-3.5 mr-1" />
                                  )}
                                  <span>{item.isBlocked ? "Unblock" : "Block"}</span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {item.isBlocked ? "Unblock User Account?" : "Block User Account?"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {item.isBlocked
                                        ? `Restore full platform access for ${item.name} (${item.email})?`
                                        : `Restrict ${item.name} (${item.email}) from logging in and accessing wedding services?`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleToggleBlock(item)}
                                      className={
                                        item.isBlocked
                                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                          : "bg-destructive hover:bg-destructive/90 text-white"
                                      }
                                    >
                                      {item.isBlocked ? "Yes, Unblock Account" : "Yes, Block Account"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginatedUsers.map((item) => {
              const isAdmin = item.role === "admin"
              const isActing = actingUserId === item.id

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="size-11 border border-border/60 shrink-0">
                          <AvatarImage src={item.image || ""} alt={item.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {item.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm flex items-center gap-1.5 truncate">
                            <span className="truncate">{item.name}</span>
                            {isAdmin && (
                              <Shield className="size-3 text-primary shrink-0" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                        </div>
                      </div>

                      <StatusBadge
                        status={item.isBlocked ? "blocked" : "active"}
                        label={item.isBlocked ? "Blocked" : "Active"}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          isAdmin
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : item.role === "vendor"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.role || "customer"}
                      </span>

                      {item.businessName ? (
                        <span className="font-medium text-foreground text-xs truncate max-w-[150px]">
                          {item.businessName}
                        </span>
                      ) : item.subscriptionPlan ? (
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.subscriptionPlan} Plan
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Registered {formatDisplayDate(item.createdAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(item)}
                      className="flex-1 sm:flex-initial h-8 gap-1 text-xs cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Details</span>
                    </Button>

                    {isAdmin ? (
                      <span className="text-[11px] text-muted-foreground/70 italic px-2">
                        Admin Protected
                      </span>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isActing}
                              className={`flex-1 sm:flex-initial h-8 text-xs cursor-pointer ${
                                item.isBlocked
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30"
                                  : "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                              }`}
                            />
                          }
                        >
                          {isActing ? (
                            <Loader2 className="size-3.5 animate-spin mr-1" />
                          ) : item.isBlocked ? (
                            <ShieldCheck className="size-3.5 mr-1" />
                          ) : (
                            <ShieldAlert className="size-3.5 mr-1" />
                          )}
                          <span>{item.isBlocked ? "Unblock" : "Block"}</span>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {item.isBlocked ? "Unblock User Account?" : "Block User Account?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {item.isBlocked
                                ? `Restore full platform access for ${item.name} (${item.email})?`
                                : `Restrict ${item.name} (${item.email}) from logging in and accessing wedding services?`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleToggleBlock(item)}
                              className={
                                item.isBlocked
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-destructive hover:bg-destructive/90 text-white"
                              }
                            >
                              {item.isBlocked ? "Yes, Unblock Account" : "Yes, Block Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-8 gap-1 text-xs cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>

              <div className="text-xs font-medium px-2 text-foreground">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 gap-1 text-xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="sm:max-w-md p-6 space-y-5">
            <DialogHeader className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="capitalize text-xs font-medium text-primary border-primary/30"
                >
                  {selectedUser.role} Account
                </Badge>
                <StatusBadge
                  status={selectedUser.isBlocked ? "blocked" : "active"}
                  label={selectedUser.isBlocked ? "Blocked" : "Active"}
                />
              </div>
              <DialogTitle className="font-serif text-xl font-bold text-foreground">
                User Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Platform account records and security profile.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/80 bg-muted/20">
              <Avatar className="size-12 border border-border/80">
                <AvatarImage src={selectedUser.image || ""} alt={selectedUser.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-serif font-bold text-foreground text-base truncate">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span>Account ID</span>
                <span className="font-mono text-foreground">{selectedUser.id}</span>
              </div>

              {selectedUser.businessName && (
                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                  <span className="flex items-center gap-1.5">
                    <Store className="size-3.5 text-primary" />
                    <span>Business Name</span>
                  </span>
                  <span className="font-semibold text-foreground">{selectedUser.businessName}</span>
                </div>
              )}

              {selectedUser.subscriptionPlan && (
                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                  <span className="flex items-center gap-1.5">
                    <Crown className="size-3.5 text-primary" />
                    <span>Subscription Plan</span>
                  </span>
                  <span className="font-semibold text-foreground capitalize">
                    {selectedUser.subscriptionPlan}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  <span>Member Since</span>
                </span>
                <span className="text-foreground">{formatDisplayDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="text-xs cursor-pointer"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
