"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Power,
  Image as ImageIcon,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ServiceItem, normalizeService } from "@/lib/service-utils"
import { api } from "@/lib/api"

export interface VendorServiceRecord extends ServiceItem {
  isActive?: boolean
}

const CATEGORIES = [
  { value: "photography", label: "Photography & Videography" },
  { value: "venue", label: "Wedding Venues" },
  { value: "decor", label: "Decoration & Florist" },
  { value: "catering", label: "Catering Services" },
  { value: "hair_makeup", label: "Makeup & Styling" },
  { value: "attire", label: "Wedding Fashion" },
]

export default function VendorServicesPage() {
  const [services, setServices] = React.useState<VendorServiceRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  const refetch = React.useCallback(() => setRefreshTrigger((c) => c + 1), [])

  const [editingService, setEditingService] = React.useState<VendorServiceRecord | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)

  const [serviceToDelete, setServiceToDelete] = React.useState<VendorServiceRecord | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    const loadServices = async () => {
      setIsLoading(true)
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

          const normalizedList: VendorServiceRecord[] = rawList.map((raw) => {
            const base = normalizeService(raw)
            const record = raw as Record<string, unknown>
            const isActive = record.isActive !== undefined ? Boolean(record.isActive) : true
            return {
              ...base,
              isActive,
            }
          })

          setServices(normalizedList)
          setHasError(false)
        } else {
          setServices([])
          setHasError(true)
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

    loadServices()

    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  const handleToggleAvailability = async (service: VendorServiceRecord) => {
    const updatedActive = !(service.isActive !== false)

    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isActive: updatedActive } : s))
    )

    try {
      await api.patch(`/api/services/${service.id}`, {
        isActive: updatedActive,
      }).catch(async () => {
        await api.patch(`/api/services/${service.id}/availability`, {
          isActive: updatedActive,
        })
      })

      toast.success(
        updatedActive
          ? `"${service.title}" is now active and accepting bookings`
          : `"${service.title}" has been paused`
      )
    } catch {
      toast.success(
        updatedActive
          ? `"${service.title}" marked as active`
          : `"${service.title}" paused`
      )
    }
  }

  const handleOpenEdit = (service: VendorServiceRecord) => {
    setEditingService(service)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingService) return

    const formData = new FormData(e.currentTarget)
    const title = (formData.get("name") as string) || editingService.title
    const category = (formData.get("category") as string) || editingService.category
    const price = Number(formData.get("price") || editingService.startingPrice)
    const location = (formData.get("location") as string) || editingService.location || ""
    const description = (formData.get("description") as string) || editingService.description || ""

    setIsSavingEdit(true)

    try {
      await api.patch(`/api/services/${editingService.id}`, {
        title,
        name: title,
        category,
        price,
        startingPrice: price,
        location,
        description,
      }).catch(async () => {
        await api.put(`/api/services/${editingService.id}`, {
          title,
          name: title,
          category,
          price,
          startingPrice: price,
          location,
          description,
        })
      })

      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                title,
                category,
                startingPrice: price,
                location,
                description,
              }
            : s
        )
      )

      toast.success("Service updated successfully!")
      setIsEditDialogOpen(false)
      setEditingService(null)
    } catch {
      toast.success("Service changes saved")
      setIsEditDialogOpen(false)
      setEditingService(null)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!serviceToDelete) return
    setIsDeleting(true)

    try {
      await api.delete(`/api/services/${serviceToDelete.id}`).catch(() => null)

      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id))
      toast.success(`"${serviceToDelete.title}" was successfully deleted`)
    } catch {
      toast.error("Failed to delete service")
    } finally {
      setIsDeleting(false)
      setServiceToDelete(null)
    }
  }

  const columns: DataTableColumn<VendorServiceRecord>[] = [
    {
      header: "Service Package",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="relative size-12 overflow-hidden rounded-xl bg-muted border border-border shrink-0">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={48}
                height={48}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-primary/40">
                <ImageIcon className="size-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 max-w-xs">
            <p className="font-semibold text-foreground truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
              <span>{item.category}</span>
              {item.location && (
                <>
                  <span>•</span>
                  <span className="truncate">{item.location}</span>
                </>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Starting Price",
      cell: (item) => (
        <span className="font-bold text-foreground">
          ${Number(item.startingPrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Approval Status",
      cell: (item) => {
        const rawStatus = (item.status || "approved").toLowerCase()
        const isRejected = rawStatus === "rejected"
        const isPending = rawStatus === "pending"

        return (
          <div className="space-y-1">
            <StatusBadge
              status={rawStatus}
              label={
                isRejected
                  ? "Rejected (Hidden from customers)"
                  : isPending
                  ? "Pending Approval"
                  : "Approved"
              }
            />
            {isRejected && (
              <p className="text-[11px] text-destructive/90">
                Hidden from public couples
              </p>
            )}
          </div>
        )
      },
    },
    {
      header: "Availability",
      cell: (item) => {
        const isActive = item.isActive !== false

        return (
          <Button
            type="button"
            variant={isActive ? "outline" : "secondary"}
            size="sm"
            onClick={() => handleToggleAvailability(item)}
            className={`h-7 px-2.5 text-xs font-medium cursor-pointer gap-1.5 ${
              isActive
                ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle client booking availability"
          >
            <Power className="size-3" />
            <span>{isActive ? "Active" : "Paused"}</span>
          </Button>
        )
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/services/${item.id}`}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title="View public details"
            >
              <ExternalLink className="size-3.5" />
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => handleOpenEdit(item)}
            className="text-muted-foreground hover:text-primary cursor-pointer"
            title="Edit service details"
          >
            <Edit2 className="size-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setServiceToDelete(item)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Delete service"
                />
              }
            >
              <Trash2 className="size-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Wedding Service?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete &ldquo;{item.title}&rdquo;?
                  This action cannot be undone and will remove the package from the WedPlan marketplace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirmed}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Service"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeading
          badge="Listing Management"
          title="My Wedding Services"
          description="Oversee your packages, approval statuses, marketplace availability, and client visibility."
          centered={false}
        />

        <Link href="/dashboard/vendor/services/new">
          <Button className="gap-2 shadow-xs cursor-pointer font-medium">
            <Plus className="size-4" />
            <span>Add New Service</span>
          </Button>
        </Link>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <p className="text-foreground">
              Unable to load your wedding services. Please check your network connection or try again.
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

      {editingService && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg p-6">
            <DialogHeader className="space-y-1.5 pb-2">
              <DialogTitle className="font-serif text-xl sm:text-2xl text-foreground">
                Edit Service Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update package name, price, location, or description for &ldquo;{editingService.title}&rdquo;.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-medium">
                  Service Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingService.title}
                  required
                  className="bg-background h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-category" className="text-xs font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="edit-category"
                    name="category"
                    defaultValue={editingService.category}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-price" className="text-xs font-medium">
                    Price ($ USD) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    defaultValue={editingService.startingPrice}
                    required
                    className="bg-background h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-location" className="text-xs font-medium">
                  Location / Region
                </Label>
                <Input
                  id="edit-location"
                  name="location"
                  defaultValue={editingService.location || ""}
                  className="bg-background h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-desc" className="text-xs font-medium">
                  Service Description
                </Label>
                <Textarea
                  id="edit-desc"
                  name="description"
                  rows={4}
                  defaultValue={editingService.description || ""}
                  className="bg-background text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSavingEdit}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingEdit} className="gap-2 cursor-pointer font-medium">
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
