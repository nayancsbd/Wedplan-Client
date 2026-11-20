"use client"

import * as React from "react"
import {
  Calendar,
  MapPin,
  MessageSquare,
  Check,
  X,
  Mail,
  Search,
  Loader2,
  CalendarHeart,
} from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { EmptyState } from "@/components/shared/EmptyState"
import { api } from "@/lib/api"

export interface BookingRequestItem {
  id: string
  serviceId?: string
  serviceTitle: string
  serviceCategory?: string
  servicePrice?: number
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAvatar?: string
  eventDate: string
  eventLocation: string
  message?: string
  totalPrice?: number
  status: string
  createdAt?: string
}

function normalizeBooking(raw: unknown): BookingRequestItem {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      serviceTitle: "Wedding Service",
      customerName: "Wedding Couple",
      eventDate: "TBD",
      eventLocation: "TBD",
      status: "pending",
    }
  }

  const obj = raw as Record<string, unknown>
  const id =
    (typeof obj.id === "string" ? obj.id : "") ||
    (typeof obj._id === "string" ? obj._id : "") ||
    (obj.id ? String(obj.id) : "") ||
    (obj._id ? String(obj._id) : "")

  const customerObj =
    obj.customer && typeof obj.customer === "object"
      ? (obj.customer as Record<string, unknown>)
      : obj.user && typeof obj.user === "object"
      ? (obj.user as Record<string, unknown>)
      : null

  const customerName =
    (typeof obj.customerName === "string" ? obj.customerName : "") ||
    (typeof obj.clientName === "string" ? obj.clientName : "") ||
    (typeof customerObj?.name === "string" ? customerObj.name : "") ||
    "Wedding Couple"

  const customerEmail =
    (typeof obj.customerEmail === "string" ? obj.customerEmail : "") ||
    (typeof obj.clientEmail === "string" ? obj.clientEmail : "") ||
    (typeof customerObj?.email === "string" ? customerObj.email : "") ||
    ""

  const customerPhone =
    (typeof obj.customerPhone === "string" ? obj.customerPhone : "") ||
    (typeof customerObj?.phone === "string" ? customerObj.phone : "") ||
    ""

  const customerAvatar =
    (typeof obj.customerAvatar === "string" ? obj.customerAvatar : "") ||
    (typeof customerObj?.image === "string" ? customerObj.image : "") ||
    ""

  const serviceObj =
    obj.service && typeof obj.service === "object"
      ? (obj.service as Record<string, unknown>)
      : null

  const serviceTitle =
    (typeof obj.serviceTitle === "string" ? obj.serviceTitle : "") ||
    (typeof obj.serviceName === "string" ? obj.serviceName : "") ||
    (typeof serviceObj?.title === "string" ? serviceObj.title : "") ||
    (typeof serviceObj?.name === "string" ? serviceObj.name : "") ||
    "Custom Wedding Package"

  const serviceCategory =
    (typeof obj.category === "string" ? obj.category : "") ||
    (typeof serviceObj?.category === "string" ? serviceObj.category : "") ||
    ""

  const servicePrice = Number(
    obj.totalPrice ?? obj.price ?? serviceObj?.startingPrice ?? serviceObj?.price ?? 0
  )

  const eventDate =
    typeof obj.eventDate === "string" && obj.eventDate.trim()
      ? obj.eventDate
      : "Date Flexible"

  const eventLocation =
    typeof obj.eventLocation === "string" && obj.eventLocation.trim()
      ? obj.eventLocation
      : typeof obj.location === "string" && obj.location.trim()
      ? obj.location
      : "Location Flexible"

  const message =
    typeof obj.message === "string"
      ? obj.message
      : typeof obj.notes === "string"
      ? obj.notes
      : ""

  const rawStatus = (typeof obj.status === "string" ? obj.status : "pending").toLowerCase()

  return {
    id,
    serviceId: typeof obj.serviceId === "string" ? obj.serviceId : undefined,
    serviceTitle,
    serviceCategory,
    servicePrice: isNaN(servicePrice) ? 0 : servicePrice,
    customerName,
    customerEmail,
    customerPhone,
    customerAvatar,
    eventDate,
    eventLocation,
    message,
    totalPrice: isNaN(servicePrice) ? 0 : servicePrice,
    status: rawStatus,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
  }
}

export default function VendorBookingRequestsPage() {
  const [bookings, setBookings] = React.useState<BookingRequestItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [activeMessage, setActiveMessage] = React.useState<BookingRequestItem | null>(null)
  const [actionInProgressId, setActionInProgressId] = React.useState<string | null>(null)

  const refetch = React.useCallback(() => {
    setRefreshTrigger((c) => c + 1)
  }, [])

  React.useEffect(() => {
    let isMounted = true

    const loadBookings = async () => {
      try {
        const endpoints = [
          "/api/vendor/booking-requests",
          "/api/vendor/bookings",
          "/api/bookings/vendor",
        ]

        let res: Response | null = null
        for (const endpoint of endpoints) {
          try {
            const attempt = await fetch(endpoint, {
              headers: { Accept: "application/json" },
            })
            if (attempt.ok) {
              res = attempt
              break
            }
          } catch {
            continue
          }
        }

        if (!isMounted) return

        if (res && res.ok) {
          const json: unknown = await res.json()
          let rawList: unknown[] = []

          if (Array.isArray(json)) {
            rawList = json
          } else if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (Array.isArray(jsonObj.data)) {
              rawList = jsonObj.data
            } else if (Array.isArray(jsonObj.bookings)) {
              rawList = jsonObj.bookings
            } else if (Array.isArray(jsonObj.bookingRequests)) {
              rawList = jsonObj.bookingRequests
            }
          }

          const normalized = rawList.map(normalizeBooking)
          setBookings(normalized)
        } else {
          setBookings([])
        }
      } catch {
        if (isMounted) {
          setBookings([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: "accepted" | "rejected"
  ) => {
    const previousBookings = [...bookings]
    setActionInProgressId(bookingId)

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    )

    try {
      try {
        await api.patch(`/api/bookings/${bookingId}/status`, { status: newStatus })
      } catch (patchErr: unknown) {
        const status = (patchErr as { status?: number })?.status
        if (status === 409) throw patchErr

        try {
          await api.patch(`/api/bookings/${bookingId}`, { status: newStatus })
        } catch (secondErr: unknown) {
          const secondStatus = (secondErr as { status?: number })?.status
          if (secondStatus === 409) throw secondErr

          await api.post(`/api/bookings/${bookingId}/${newStatus}`, {})
        }
      }

      toast.success(
        newStatus === "accepted"
          ? "Booking request accepted successfully!"
          : "Booking request declined"
      )

      refetch()
    } catch (err: unknown) {
      setBookings(previousBookings)

      const errObj = err as { message?: string; status?: number; error?: string }
      const status = errObj.status
      const msg = errObj.message || errObj.error || ""

      if (
        status === 409 ||
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("conflict") ||
        msg.toLowerCase().includes("processed")
      ) {
        toast.error("Already Processed: This booking request has already been accepted or rejected.")
      } else {
        toast.error(msg || `Failed to ${newStatus} booking request`)
      }

      refetch()
    } finally {
      setActionInProgressId(null)
    }
  }

  const counts = React.useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter(
        (b) => b.status === "accepted" || b.status === "confirmed"
      ).length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter(
        (b) => b.status === "cancelled" || b.status === "canceled"
      ).length,
    }
  }, [bookings])

  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all") {
        if (statusFilter === "accepted") {
          if (b.status !== "accepted" && b.status !== "confirmed") return false
        } else if (statusFilter === "cancelled") {
          if (b.status !== "cancelled" && b.status !== "canceled") return false
        } else if (b.status !== statusFilter) {
          return false
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchCustomer = b.customerName.toLowerCase().includes(query)
        const matchEmail = (b.customerEmail || "").toLowerCase().includes(query)
        const matchService = b.serviceTitle.toLowerCase().includes(query)
        const matchLocation = b.eventLocation.toLowerCase().includes(query)
        if (!matchCustomer && !matchEmail && !matchService && !matchLocation) {
          return false
        }
      }

      return true
    })
  }, [bookings, statusFilter, searchQuery])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Inquiries & Reservations"
        title="Wedding Booking Requests"
        description="Review incoming reservations from couples, coordinate event details, and accept or decline requests."
        centered={false}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <Button
              type="button"
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="h-8 text-xs cursor-pointer gap-1.5"
            >
              <span>All Requests</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4">
                {counts.all}
              </Badge>
            </Button>

            <Button
              type="button"
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className="h-8 text-xs cursor-pointer gap-1.5"
            >
              <span>Pending</span>
              <Badge
                variant={statusFilter === "pending" ? "secondary" : "outline"}
                className="px-1.5 py-0 text-[10px] h-4"
              >
                {counts.pending}
              </Badge>
            </Button>

            <Button
              type="button"
              variant={statusFilter === "accepted" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("accepted")}
              className="h-8 text-xs cursor-pointer gap-1.5"
            >
              <span>Accepted</span>
              <Badge
                variant={statusFilter === "accepted" ? "secondary" : "outline"}
                className="px-1.5 py-0 text-[10px] h-4"
              >
                {counts.accepted}
              </Badge>
            </Button>

            <Button
              type="button"
              variant={statusFilter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("rejected")}
              className="h-8 text-xs cursor-pointer gap-1.5"
            >
              <span>Rejected</span>
              <Badge
                variant={statusFilter === "rejected" ? "secondary" : "outline"}
                className="px-1.5 py-0 text-[10px] h-4"
              >
                {counts.rejected}
              </Badge>
            </Button>

            {counts.cancelled > 0 && (
              <Button
                type="button"
                variant={statusFilter === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("cancelled")}
                className="h-8 text-xs cursor-pointer gap-1.5"
              >
                <span>Cancelled</span>
                <Badge
                  variant={statusFilter === "cancelled" ? "secondary" : "outline"}
                  className="px-1.5 py-0 text-[10px] h-4"
                >
                  {counts.cancelled}
                </Badge>
              </Button>
            )}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by couple or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 pl-8.5 text-xs bg-background"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-48 bg-muted rounded-md" />
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-muted rounded-md" />
              <div className="h-8 w-40 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarHeart}
          title={
            statusFilter !== "all" || searchQuery
              ? "No matching booking requests"
              : "No booking requests yet"
          }
          description={
            statusFilter !== "all" || searchQuery
              ? "Try clearing your active status filter or search keywords to view other wedding inquiries."
              : "When couples request to reserve your wedding packages, their celebration dates and requests will appear here."
          }
          action={
            statusFilter !== "all" || searchQuery
              ? {
                  label: "Clear Filter",
                  onClick: () => {
                    setStatusFilter("all")
                    setSearchQuery("")
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden lg:block rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-border/70 text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-3.5 px-4">Couple / Client</th>
                    <th className="py-3.5 px-4">Wedding Service</th>
                    <th className="py-3.5 px-4">Date & Location</th>
                    <th className="py-3.5 px-4">Message</th>
                    <th className="py-3.5 px-4">Investment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredBookings.map((item) => {
                    const isPending = item.status === "pending"
                    const isActing = actionInProgressId === item.id
                    const initials = (item.customerName || "Couple")
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()

                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 rounded-full border border-primary/20 shrink-0">
                              {item.customerAvatar && (
                                <AvatarImage src={item.customerAvatar} alt={item.customerName} />
                              )}
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {item.customerName}
                              </p>
                              {item.customerEmail && (
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="size-3 shrink-0" />
                                  <span className="truncate">{item.customerEmail}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <p className="font-medium text-foreground">{item.serviceTitle}</p>
                          {item.serviceCategory && (
                            <p className="text-xs text-muted-foreground capitalize mt-0.5">
                              {item.serviceCategory}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-4 align-top text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Calendar className="size-3.5 text-primary shrink-0" />
                            <span>{item.eventDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="size-3.5 text-primary/70 shrink-0" />
                            <span className="truncate max-w-[160px]">{item.eventLocation}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top max-w-[200px]">
                          {item.message ? (
                            <button
                              type="button"
                              onClick={() => setActiveMessage(item)}
                              className="text-left text-xs text-muted-foreground hover:text-foreground line-clamp-2 transition-colors cursor-pointer group"
                            >
                              <span>{item.message}</span>
                              <span className="text-[11px] text-primary block mt-0.5 group-hover:underline">
                                View full message
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No notes</span>
                          )}
                        </td>

                        <td className="py-4 px-4 align-top font-bold text-foreground">
                          ${Number(item.totalPrice || item.servicePrice || 0).toLocaleString()}
                        </td>

                        <td className="py-4 px-4 align-top">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="py-4 px-4 align-top text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={isActing}
                                      className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs cursor-pointer shadow-2xs font-medium"
                                      title="Accept booking request"
                                    />
                                  }
                                >
                                  {isActing ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <Check className="size-3.5 stroke-[2.5]" />
                                  )}
                                  <span>Accept</span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Accept Booking Request?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Confirm this wedding booking for {item.customerName} on{" "}
                                      {item.eventDate}? The couple will be notified and this celebration date will be marked as secured.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUpdateStatus(item.id, "accepted")}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                      Accept Booking
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={isActing}
                                      className="h-8 px-2.5 text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 text-xs cursor-pointer font-medium"
                                      title="Decline booking request"
                                    />
                                  }
                                >
                                  <X className="size-3.5 stroke-[2.5]" />
                                  <span>Reject</span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Decline Booking Request?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to decline this wedding inquiry from{" "}
                                      {item.customerName}? The couple will be notified that you are unavailable for this date.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUpdateStatus(item.id, "rejected")}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Decline Request
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground capitalize font-medium">
                              {item.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {filteredBookings.map((item) => {
              const isPending = item.status === "pending"
              const isActing = actionInProgressId === item.id
              const initials = (item.customerName || "Couple")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-full border border-primary/20">
                        {item.customerAvatar && (
                          <AvatarImage src={item.customerAvatar} alt={item.customerName} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.customerName}</p>
                        {item.customerEmail && (
                          <p className="text-xs text-muted-foreground">{item.customerEmail}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="border-t border-border/60 pt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Service: </span>
                      <span className="font-medium text-foreground">{item.serviceTitle}</span>
                      {item.serviceCategory && (
                        <span className="text-muted-foreground capitalize ml-1">
                          ({item.serviceCategory})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{item.eventDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item.eventLocation}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Investment: </span>
                      <span className="font-bold text-foreground">
                        ${Number(item.totalPrice || item.servicePrice || 0).toLocaleString()}
                      </span>
                    </div>

                    {item.message && (
                      <div className="rounded-xl bg-muted/40 p-3 mt-2">
                        <p className="font-medium text-foreground mb-0.5 flex items-center gap-1.5">
                          <MessageSquare className="size-3 text-primary" />
                          <span>Couple&apos;s Message</span>
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isActing}
                              className="w-1/2 text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-medium cursor-pointer"
                            />
                          }
                        >
                          <X className="size-3.5 mr-1" />
                          <span>Reject</span>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Decline Booking Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to decline this wedding inquiry from {item.customerName}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUpdateStatus(item.id, "rejected")}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Decline Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              size="sm"
                              disabled={isActing}
                              className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                            />
                          }
                        >
                          {isActing ? (
                            <Loader2 className="size-3.5 animate-spin mr-1" />
                          ) : (
                            <Check className="size-3.5 mr-1" />
                          )}
                          <span>Accept</span>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Accept Booking Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Confirm wedding reservation for {item.customerName} on {item.eventDate}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUpdateStatus(item.id, "accepted")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Accept Booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeMessage && (
        <Dialog open={Boolean(activeMessage)} onOpenChange={(open) => !open && setActiveMessage(null)}>
          <DialogContent className="sm:max-w-md p-6">
            <DialogHeader className="space-y-1.5 pb-2">
              <DialogTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                <span>Inquiry from {activeMessage.customerName}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Wedding reservation details for {activeMessage.serviceTitle} on {activeMessage.eventDate}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-foreground text-sm leading-relaxed whitespace-pre-line">
                {activeMessage.message || "No special requests provided."}
              </div>

              <div className="flex items-center justify-between text-muted-foreground pt-1">
                <span>Location: {activeMessage.eventLocation}</span>
                {activeMessage.customerEmail && (
                  <a
                    href={`mailto:${activeMessage.customerEmail}`}
                    className="text-primary hover:underline"
                  >
                    {activeMessage.customerEmail}
                  </a>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
