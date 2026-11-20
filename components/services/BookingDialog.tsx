"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Calendar, MapPin, MessageSquare, Loader2, CalendarHeart } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { ServiceItem } from "@/lib/service-utils"

// Compute tomorrow's date YYYY-MM-DD for min date picker restriction
function getTomorrowDateString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split("T")[0]
}

const bookingSchema = z.object({
  eventDate: z
    .string()
    .min(1, "Please choose an event date")
    .refine((val) => {
      const selected = new Date(`${val}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selected > today
    }, "Event date must be in the future"),
  eventLocation: z
    .string()
    .min(3, "Event location must be at least 3 characters")
    .max(150, "Event location is too long"),
  message: z
    .string()
    .max(1000, "Message cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
})

type BookingFormValues = z.infer<typeof bookingSchema>

interface BookingDialogProps {
  service: ServiceItem
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BookingDialog({
  service,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BookingDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const minDate = React.useMemo(() => getTomorrowDateString(), [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      eventDate: "",
      eventLocation: service.location || "",
      message: "",
    },
  })

  const onSubmit = async (values: BookingFormValues) => {
    try {
      const payload = {
        serviceId: service.id,
        vendorId: service.vendorId,
        serviceTitle: service.title,
        category: service.category,
        eventDate: values.eventDate,
        eventLocation: values.eventLocation.trim(),
        message: values.message?.trim() || undefined,
        totalPrice: service.startingPrice,
      }

      await api.post("/api/bookings", payload)

      toast.success("Booking request submitted successfully!", {
        description: "The vendor has been notified. Track status in My Bookings.",
        action: {
          label: "My Bookings",
          onClick: () => router.push("/dashboard/customer"),
        },
        duration: 6000,
      })

      reset()
      setIsOpen(false)
    } catch (err: unknown) {
      const errObj = err as { message?: string; status?: number }
      const status = errObj?.status
      const msg = errObj?.message || "Failed to submit booking request"

      // Handle specific server booking errors
      if (
        status === 409 ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("already booked")
      ) {
        toast.error(
          "Duplicate Booking: You have already submitted a booking request for this service on this date."
        )
      } else if (
        status === 422 ||
        msg.toLowerCase().includes("unavailable") ||
        msg.toLowerCase().includes("not available")
      ) {
        toast.error(
          "Unavailable Service: This service is currently unavailable for bookings on the selected date."
        )
      } else {
        toast.error(msg)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}

      <DialogContent className="sm:max-w-lg p-6 overflow-hidden">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2 text-primary font-serif">
            <CalendarHeart className="size-5" />
            <span className="text-xs font-sans font-semibold tracking-wider uppercase text-primary/80">
              WedPlan Reservation
            </span>
          </div>
          <DialogTitle className="font-serif text-xl sm:text-2xl text-foreground">
            Request to Book
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Submit your wedding details for <span className="font-medium text-foreground">{service.title}</span>.
            {service.vendorName && ` Managed by ${service.vendorName}.`}
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Summary Card */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex items-center justify-between text-xs">
          <div>
            <p className="text-muted-foreground font-medium">Starting Package</p>
            <p className="font-serif text-base sm:text-lg font-semibold text-foreground">
              ${Number(service.startingPrice || 0).toLocaleString()}
            </p>
          </div>
          {service.category && (
            <div className="text-right">
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium capitalize text-foreground">{service.category}</p>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Event Date (Future Only) */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-event-date" className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" />
              Event Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="booking-event-date"
              type="date"
              min={minDate}
              disabled={isSubmitting}
              className="h-10 bg-background"
              {...register("eventDate")}
            />
            {errors.eventDate && (
              <p className="text-xs text-destructive">{errors.eventDate.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Please choose a future date for your wedding celebration.
            </p>
          </div>

          {/* Event Location */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-event-location" className="text-xs font-medium flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              Event Location / Venue <span className="text-destructive">*</span>
            </Label>
            <Input
              id="booking-event-location"
              type="text"
              placeholder="e.g. Glasshouse Estate, Carmel-by-the-Sea, CA"
              disabled={isSubmitting}
              className="h-10 bg-background"
              {...register("eventLocation")}
            />
            {errors.eventLocation && (
              <p className="text-xs text-destructive">{errors.eventLocation.message}</p>
            )}
          </div>

          {/* Additional Message */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-message" className="text-xs font-medium flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-primary" />
              Additional Message & Requests (Optional)
            </Label>
            <Textarea
              id="booking-message"
              placeholder="Tell the vendor about your guest count, schedule, style preferences, or custom requirements..."
              rows={3}
              disabled={isSubmitting}
              className="bg-background resize-none text-xs sm:text-sm"
              {...register("message")}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto h-10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-10 px-6 font-medium cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Sending Request...
                </>
              ) : (
                "Confirm Booking Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
