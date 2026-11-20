"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  MapPin,
  Store,
  Clock,
  Eye,
  XCircle,
  Search,
  ExternalLink,
  Sparkles,
  Loader2,
  CalendarHeart,
  Mail,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface CustomerBookingItem {
  id: string
  serviceId?: string
  serviceTitle: string
  serviceImage?: string
  category?: string
  totalPrice?: number
  vendorName: string
  vendorEmail?: string
  eventDate: string
  eventLocation: string
  status: string
  createdAt: string
  customerMessage?: string
}

type FilterStatus = "all" | "pending" | "accepted" | "rejected" | "cancelled"

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = React.useState<CustomerBookingItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [selectedBooking, setSelectedBooking] = React.useState<CustomerBookingItem | null>(null)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>("all")
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  const refetch = React.useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const loadBookings = async () => {
      setIsLoading(true)
      setHasError(false)

      const endpoints = [
        "/api/customer/bookings",
        "/api/bookings/my",
        "/api/bookings/customer",
        "/api/bookings",
      ]

      let fetchedList: CustomerBookingItem[] = []
      let success = false

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            headers: { Accept: "application/json" },
            credentials: "include",
          })

          if (res.ok) {
            const json = await res.json().catch(() => null)
            let arrayData: unknown[] = []

            if (Array.isArray(json)) {
              arrayData = json
            } else if (json && typeof json === "object") {
              const jsonObj = json as Record<string, unknown>
              if (Array.isArray(jsonObj.data)) arrayData = jsonObj.data
              else if (Array.isArray(jsonObj.bookings)) arrayData = jsonObj.bookings
            }

            if (arrayData.length > 0 || res.status === 200) {
              fetchedList = arrayData.map((item, idx) => {
                const rec = (item || {}) as Record<string, unknown>
                const serviceObj = (rec.service || {}) as Record<string, unknown>
                const vendorObj = (rec.vendor || {}) as Record<string, unknown>

                const imageFromService =
                  Array.isArray(serviceObj.images) && serviceObj.images.length > 0
                    ? String(serviceObj.images[0])
                    : serviceObj.imageUrl || serviceObj.image
                const imageDirect =
                  rec.serviceImage || (Array.isArray(rec.images) ? rec.images[0] : rec.image)
                const finalImage = (imageFromService || imageDirect || "") as string

                return {
                  id: String(rec.id || rec._id || `booking_${idx + 1}`),
                  serviceId: String(serviceObj.id || serviceObj._id || rec.serviceId || ""),
                  serviceTitle: String(
                    serviceObj.name ||
                      serviceObj.title ||
                      rec.serviceTitle ||
                      rec.serviceName ||
                      "Wedding Service"
                  ),
                  serviceImage: finalImage,
                  category: String(serviceObj.category || rec.category || ""),
                  totalPrice: Number(
                    rec.totalPrice || rec.price || serviceObj.price || 0
                  ),
                  vendorName: String(
                    vendorObj.businessName ||
                      vendorObj.name ||
                      rec.vendorBusinessName ||
                      rec.vendorName ||
                      "Wedding Vendor"
                  ),
                  vendorEmail: (vendorObj.email || rec.vendorEmail) as string | undefined,
                  eventDate: String(rec.eventDate || rec.date || "TBD"),
                  eventLocation: String(rec.eventLocation || rec.location || "Flexible"),
                  status: String(rec.status || "pending").toLowerCase(),
                  createdAt: String(rec.createdAt || rec.created || rec.requestDate || new Date().toISOString()),
                  customerMessage: (rec.message ||
                    rec.additionalMessage ||
                    rec.specialRequests ||
                    rec.notes) as string | undefined,
                }
              })
              success = true
              break
            }
          }
        } catch {
          continue
        }
      }

      if (!isMounted) return

      if (success) {
        setBookings(fetchedList)
      } else {
        setHasError(true)
        setBookings([])
      }
      setIsLoading(false)
    }

    loadBookings()

    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  const handleCancelBooking = async (bookingId: string) => {
    const previousBookings = [...bookings]
    setCancellingId(bookingId)

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    )

    try {
      try {
        await api.patch(`/api/bookings/${bookingId}/cancel`, { status: "cancelled" })
      } catch {
        try {
          await api.patch(`/api/bookings/${bookingId}/status`, { status: "cancelled" })
        } catch {
          await api.patch(`/api/bookings/${bookingId}`, { status: "cancelled" })
        }
      }

      toast.success("Booking request cancelled successfully")
      refetch()
    } catch (err: unknown) {
      setBookings(previousBookings)
      const errObj = err as { message?: string; error?: string }
      toast.error(errObj?.message || errObj?.error || "Could not cancel booking request. Please try again.")
    } finally {
      setCancellingId(null)
    }
  }

  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "all" ? true : b.status === statusFilter

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        b.serviceTitle.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q) ||
        b.eventLocation.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [bookings, statusFilter, searchQuery])

  const counts = React.useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted" || b.status === "confirmed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter((b) => b.status === "cancelled" || b.status === "canceled").length,
    }
  }, [bookings])

  const formatDisplayDate = (dateVal: string) => {
    if (!dateVal || dateVal === "TBD") return "TBD"
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <SectionHeading
          badge="My Reservations"
          title="My Bookings"
          description="Review your wedding vendor requests, track real-time confirmations, and coordinate your big day."
          centered={false}
        />

        <Link
          href="/services"
          className={buttonVariants({
            variant: "default",
            className: "gap-2 shadow-sm shrink-0 cursor-pointer self-start md:self-auto",
          })}
        >
          <Sparkles className="size-4" />
          <span>Browse Services</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {(
            [
              { key: "all", label: "All Requests", count: counts.all },
              { key: "pending", label: "Pending", count: counts.pending },
              { key: "accepted", label: "Accepted", count: counts.accepted },
              { key: "rejected", label: "Rejected", count: counts.rejected },
              { key: "cancelled", label: "Cancelled", count: counts.cancelled },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
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

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service, vendor, location..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <p className="text-foreground">
              Unable to load your bookings. Please verify your connection or try again.
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
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Skeleton className="size-16 rounded-xl shrink-0" />
                <div className="space-y-2 w-full max-w-sm">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <CalendarHeart className="size-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-serif text-xl font-bold text-foreground">
              {bookings.length === 0 ? "No bookings placed yet" : "No matching bookings found"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {bookings.length === 0
                ? "You haven't requested any wedding services yet. Discover venues, photographers, florists, and caterers to make your special day unforgettable."
                : "No booking requests match your current search and filter criteria. Try adjusting your search term."}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/services"
              className={buttonVariants({
                variant: "default",
                className: "gap-2 shadow-sm cursor-pointer",
              })}
            >
              <Sparkles className="size-4" />
              <span>Browse Services</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border/80 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-4">Wedding Service</th>
                  <th className="px-4 py-3.5">Vendor</th>
                  <th className="px-4 py-3.5">Event Date</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Requested On</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBookings.map((item) => {
                  const isPending = item.status === "pending"
                  const isCancelling = cancellingId === item.id

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-muted/60 shrink-0 border border-border/60">
                            {item.serviceImage ? (
                              <Image
                                src={item.serviceImage}
                                alt={item.serviceTitle}
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
                            <p className="font-medium text-foreground text-sm line-clamp-1">
                              {item.serviceTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.category && (
                                <span className="text-[11px] text-muted-foreground capitalize">
                                  {item.category}
                                </span>
                              )}
                              {item.totalPrice ? (
                                <span className="text-[11px] font-semibold text-primary">
                                  ${item.totalPrice.toLocaleString()}
                                </span>
                              ) : null}
                            </div>
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
                          <Calendar className="size-3.5 text-primary shrink-0" />
                          <span>{formatDisplayDate(item.eventDate)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 text-primary shrink-0" />
                          <span className="line-clamp-1 max-w-[140px]">{item.eventLocation}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5 text-muted-foreground/80 shrink-0" />
                          <span>{formatDisplayDate(item.createdAt)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(item)}
                            className="h-8 gap-1 text-xs cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            <span>View Details</span>
                          </Button>

                          {isPending && (
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isCancelling}
                                    className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 cursor-pointer"
                                  />
                                }
                              >
                                {isCancelling ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="size-3.5" />
                                )}
                                <span>Cancel</span>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking Request?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel your booking request for &ldquo;{item.serviceTitle}&rdquo;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelBooking(item.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-white"
                                  >
                                    Yes, Cancel Booking
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredBookings.map((item) => {
              const isPending = item.status === "pending"
              const isCancelling = cancellingId === item.id

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative size-14 rounded-xl overflow-hidden bg-muted/60 shrink-0 border border-border/60">
                        {item.serviceImage ? (
                          <Image
                            src={item.serviceImage}
                            alt={item.serviceTitle}
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-muted-foreground capitalize">
                            {item.category || "Wedding"}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <h4 className="font-serif text-base font-bold text-foreground line-clamp-1 mt-0.5">
                          {item.serviceTitle}
                        </h4>
                        {item.totalPrice ? (
                          <p className="text-xs font-semibold text-primary mt-0.5">
                            ${item.totalPrice.toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Store className="size-3.5 text-primary" />
                          <span>Vendor:</span>
                        </span>
                        <span className="font-medium text-foreground">{item.vendorName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-primary" />
                          <span>Event Date:</span>
                        </span>
                        <span className="font-medium text-foreground">{formatDisplayDate(item.eventDate)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" />
                          <span>Location:</span>
                        </span>
                        <span className="font-medium text-foreground text-right line-clamp-1 max-w-[160px]">
                          {item.eventLocation}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground/80" />
                          <span>Requested:</span>
                        </span>
                        <span>{formatDisplayDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(item)}
                      className="flex-1 gap-1 text-xs cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>View Details</span>
                    </Button>

                    {isPending && (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isCancelling}
                              className="gap-1 text-xs text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
                            />
                          }
                        >
                          {isCancelling ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <XCircle className="size-3.5" />
                          )}
                          <span>Cancel</span>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Booking Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel your booking request for &ldquo;{item.serviceTitle}&rdquo;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Request</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelBooking(item.id)}
                              className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                              Yes, Cancel Booking
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
        </div>
      )}

      {selectedBooking && (
        <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="sm:max-w-lg p-6 space-y-5">
            <DialogHeader className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Booking Request Details
                </span>
                <StatusBadge status={selectedBooking.status} />
              </div>
              <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                {selectedBooking.serviceTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Reservation submitted on {formatDisplayDate(selectedBooking.createdAt)}
              </DialogDescription>
            </DialogHeader>

            {selectedBooking.serviceImage && (
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-border/80">
                <Image
                  src={selectedBooking.serviceImage}
                  alt={selectedBooking.serviceTitle}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3 text-primary" />
                  <span>Wedding Date</span>
                </span>
                <p className="font-semibold text-foreground text-sm">
                  {formatDisplayDate(selectedBooking.eventDate)}
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-primary" />
                  <span>Event Location</span>
                </span>
                <p className="font-semibold text-foreground text-sm line-clamp-1">
                  {selectedBooking.eventLocation}
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Store className="size-3 text-primary" />
                  <span>Vendor Partner</span>
                </span>
                <p className="font-semibold text-foreground text-sm">
                  {selectedBooking.vendorName}
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" />
                  <span>Estimated Total</span>
                </span>
                <p className="font-semibold text-foreground text-sm">
                  {selectedBooking.totalPrice
                    ? `$${selectedBooking.totalPrice.toLocaleString()}`
                    : "Custom Quote"}
                </p>
              </div>
            </div>

            {selectedBooking.vendorEmail && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-3.5 text-primary" />
                <span>Vendor Contact:</span>
                <a
                  href={`mailto:${selectedBooking.vendorEmail}`}
                  className="text-primary hover:underline font-medium"
                >
                  {selectedBooking.vendorEmail}
                </a>
              </div>
            )}

            {selectedBooking.customerMessage && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Your Message to Vendor:
                </span>
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {selectedBooking.customerMessage}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border/80">
              {selectedBooking.serviceId && (
                <Link
                  href={`/services/${selectedBooking.serviceId}`}
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full sm:w-auto gap-1.5 text-xs cursor-pointer",
                  })}
                >
                  <span>View Public Service Page</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedBooking(null)}
                className="w-full sm:w-auto text-xs cursor-pointer"
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
