"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Layers,
  Search,
  Check,
  X,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  Store,
  MapPin,
  Clock,
  MoreVertical,
  Eye,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"

interface AdminServiceItem {
  id: string
  title: string
  category: string
  price: number
  location: string
  vendorName: string
  vendorEmail?: string
  status: "pending" | "approved" | "rejected" | string
  images: string[]
  createdAt: string
  description?: string
}

type StatusFilter = "all" | "pending" | "approved" | "rejected"

const CATEGORIES = [
  "All Categories",
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
]

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<AdminServiceItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = React.useState("All Categories")
  const [actingServiceId, setActingServiceId] = React.useState<string | null>(null)
  const [selectedPreview, setSelectedPreview] = React.useState<AdminServiceItem | null>(null)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  const refetch = React.useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const endpoints = ["/api/admin/services", "/api/services/all", "/api/services"]
        let rawList: AdminServiceItem[] = []

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
                else if (Array.isArray(jsonObj.services)) arrayData = jsonObj.services
              }

              if (arrayData.length > 0 || res.status === 200) {
                rawList = arrayData.map((item, idx) => {
                  const rec = (item || {}) as Record<string, unknown>
                  const vendorObj = (rec.vendor || {}) as Record<string, unknown>

                  let imgList: string[] = []
                  if (Array.isArray(rec.images)) {
                    imgList = rec.images.map(String)
                  } else if (rec.imageUrl || rec.image) {
                    imgList = [String(rec.imageUrl || rec.image)]
                  }

                  return {
                    id: String(rec.id || rec._id || `srv_${idx + 1}`),
                    title: String(rec.title || rec.name || "Wedding Service"),
                    category: String(rec.category || "General"),
                    price: Number(rec.price || rec.startingPrice || 0),
                    location: String(rec.location || rec.city || "Various"),
                    vendorName: String(
                      vendorObj.businessName ||
                        vendorObj.name ||
                        rec.vendorBusinessName ||
                        rec.vendorName ||
                        "Wedding Vendor"
                    ),
                    vendorEmail: (vendorObj.email || rec.vendorEmail) as string | undefined,
                    status: String(rec.status || "pending").toLowerCase(),
                    images: imgList,
                    createdAt: String(rec.createdAt || rec.created || new Date().toISOString()),
                    description: String(rec.description || ""),
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
          setServices(rawList)
          setHasError(false)
        }
      } catch {
        if (isMounted) {
          setServices([])
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchServices()

    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  const handleUpdateStatus = async (
    serviceId: string,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    const previous = [...services]
    setActingServiceId(serviceId)

    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, status: newStatus } : s))
    )

    try {
      try {
        await api.patch(`/api/admin/services/${serviceId}/status`, { status: newStatus })
      } catch {
        try {
          await api.patch(`/api/admin/services/${serviceId}`, { status: newStatus })
        } catch {
          await api.patch(`/api/services/${serviceId}/status`, { status: newStatus })
        }
      }

      toast.success(
        newStatus === "approved"
          ? "Service approved and published to public catalog."
          : newStatus === "rejected"
          ? "Service listing rejected and hidden from couples."
          : "Service status reset to pending."
      )

      refetch()
    } catch (err: unknown) {
      setServices(previous)
      const errObj = err as { message?: string; error?: string }
      toast.error(errObj?.message || errObj?.error || "Failed to update service status.")
    } finally {
      setActingServiceId(null)
    }
  }

  const handleDeleteService = async (serviceId: string, title: string) => {
    const previous = [...services]
    setActingServiceId(serviceId)

    setServices((prev) => prev.filter((s) => s.id !== serviceId))

    try {
      try {
        await api.delete(`/api/admin/services/${serviceId}`)
      } catch {
        await api.delete(`/api/services/${serviceId}`)
      }

      toast.success(`Service "${title}" was permanently removed.`)
      refetch()
    } catch (err: unknown) {
      setServices(previous)
      const errObj = err as { message?: string; error?: string }
      toast.error(errObj?.message || errObj?.error || "Failed to delete service listing.")
    } finally {
      setActingServiceId(null)
    }
  }

  const filteredServices = React.useMemo(() => {
    return services.filter((s) => {
      const matchesStatus =
        statusFilter === "all" ? true : s.status === statusFilter

      const matchesCategory =
        categoryFilter === "All Categories"
          ? true
          : s.category.toLowerCase().includes(categoryFilter.toLowerCase()) ||
            categoryFilter.toLowerCase().includes(s.category.toLowerCase())

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.vendorName.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)

      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [services, statusFilter, categoryFilter, searchQuery])

  const counts = React.useMemo(() => {
    return {
      all: services.length,
      pending: services.filter((s) => s.status === "pending").length,
      approved: services.filter((s) => s.status === "approved" || s.status === "active").length,
      rejected: services.filter((s) => s.status === "rejected").length,
    }
  }, [services])

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
        badge="Catalog Verification"
        title="Manage Wedding Services"
        description="Review vendor submissions, approve new offerings, manage category assignments, and maintain quality standards."
        centered={false}
      />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {(
            [
              { key: "all", label: "All Services", count: counts.all },
              { key: "pending", label: "Pending", count: counts.pending },
              { key: "approved", label: "Approved", count: counts.approved },
              { key: "rejected", label: "Rejected", count: counts.rejected },
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

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, vendor, city..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <p className="text-foreground">
              Unable to load marketplace services. Please check your network or try again.
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
              <div className="flex items-center gap-3.5">
                <Skeleton className="size-14 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-36" />
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Layers className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-foreground">No services found</h3>
            <p className="text-xs text-muted-foreground">
              No service listings match your selected status and filter parameters.
            </p>
          </div>
          {(searchQuery || categoryFilter !== "All Categories" || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("All Categories")
                setStatusFilter("all")
              }}
              className="text-xs cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border/80 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-4">Service</th>
                  <th className="px-4 py-3.5">Vendor</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date Added</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredServices.map((item) => {
                  const isPending = item.status === "pending"
                  const isActing = actingServiceId === item.id

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isPending
                          ? "bg-amber-500/10 border-l-4 border-l-amber-500 hover:bg-amber-500/15"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-muted/60 shrink-0 border border-border/60">
                            {item.images[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.title}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-primary bg-primary/10">
                                <Sparkles className="size-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm flex items-center gap-2">
                              <span>{item.title}</span>
                              {isPending && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500 text-white">
                                  Review
                                </span>
                              )}
                            </p>
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Store className="size-3.5 text-primary shrink-0" />
                          <span className="font-medium text-foreground">{item.vendorName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 text-primary shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-bold text-foreground text-xs">
                          ${item.price.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs text-muted-foreground">
                          {formatDisplayDate(item.createdAt)}
                        </span>
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                disabled={isActing}
                                onClick={() => handleUpdateStatus(item.id, "approved")}
                                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 cursor-pointer"
                              >
                                {isActing ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3" />
                                )}
                                <span>Approve</span>
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isActing}
                                onClick={() => handleUpdateStatus(item.id, "rejected")}
                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 border-destructive/30 gap-1 cursor-pointer"
                              >
                                <X className="size-3" />
                                <span>Reject</span>
                              </Button>
                            </>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPreview(item)}
                            className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Preview Details"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={isActing}
                                  className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                />
                              }
                            >
                              <MoreVertical className="size-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 text-xs">
                              <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                                Change Status
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(item.id, "approved")}
                                className="gap-2 cursor-pointer"
                              >
                                <Check className="size-3.5 text-emerald-600" />
                                <span>Approve Listing</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(item.id, "pending")}
                                className="gap-2 cursor-pointer"
                              >
                                <Clock className="size-3.5 text-amber-600" />
                                <span>Mark Pending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(item.id, "rejected")}
                                className="gap-2 cursor-pointer"
                              >
                                <X className="size-3.5 text-destructive" />
                                <span>Reject Listing</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => window.open(`/services/${item.id}`, "_blank")}
                                className="gap-2 cursor-pointer"
                              >
                                <ExternalLink className="size-3.5" />
                                <span>View Public Page</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={isActing}
                                  className="size-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="Delete Service"
                                />
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Wedding Service?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete &ldquo;{item.title}&rdquo; from the platform? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteService(item.id, item.title)}
                                  className="bg-destructive hover:bg-destructive/90 text-white"
                                >
                                  Yes, Delete Service
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPreview && (
        <Dialog open={Boolean(selectedPreview)} onOpenChange={(open) => !open && setSelectedPreview(null)}>
          <DialogContent className="sm:max-w-lg p-6 space-y-4">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="capitalize text-xs">
                  {selectedPreview.category}
                </Badge>
                <StatusBadge status={selectedPreview.status} />
              </div>
              <DialogTitle className="font-serif text-xl font-bold text-foreground">
                {selectedPreview.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Offered by {selectedPreview.vendorName} • Starting at ${selectedPreview.price.toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {selectedPreview.images[0] && (
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-border/80">
                <Image
                  src={selectedPreview.images[0]}
                  alt={selectedPreview.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-foreground">{selectedPreview.location}</span>
              </div>
              {selectedPreview.vendorEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vendor Contact:</span>
                  <a href={`mailto:${selectedPreview.vendorEmail}`} className="text-primary hover:underline">
                    {selectedPreview.vendorEmail}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="text-foreground">{formatDisplayDate(selectedPreview.createdAt)}</span>
              </div>
            </div>

            {selectedPreview.description && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Description:</span>
                <p className="text-xs text-foreground leading-relaxed line-clamp-4">
                  {selectedPreview.description}
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/80">
              <Link
                href={`/services/${selectedPreview.id}`}
                target="_blank"
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "gap-1 text-xs cursor-pointer",
                })}
              >
                <span>View Full Listing</span>
                <ExternalLink className="size-3" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPreview(null)}
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
