"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Calendar, MapPin, Loader2, CalendarHeart } from "lucide-react"

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
  const setIsOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

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
          onClick: () => router.push("/dashboard/customer/bookings"),
        },
        duration: 6000,
      })

      reset()
      setIsOpen(false)
    } catch (err: unknown) {
      const errObj = err as { message?: string; status?: number }
      const status = errObj?.status
      const msg = errObj?.message || "Failed to submit booking request"

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

      <DialogContent className="sm:max-w-lg p-6 space-y-4">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary">
            <CalendarHeart className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reserve Service
            </span>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">
            Book &ldquo;{service.title}&rdquo;
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Submit your event date and location to inquire and reserve your date with{" "}
            <strong className="text-foreground">{service.vendorName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Pricing Guide</span>
            <span className="font-bold text-base text-foreground">
              ${service.startingPrice.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-[11px]"> starting rate</span>
          </div>
          {service.category && (
            <span className="capitalize px-2.5 py-1 rounded-full bg-background border border-border text-foreground font-medium">
              {service.category}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="booking-date" className="text-xs font-medium text-foreground">
              Event Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="booking-date"
                type="date"
                min={minDate}
                className="pl-9 h-10 bg-background text-sm"
                aria-invalid={Boolean(errors.eventDate)}
                {...register("eventDate")}
              />
            </div>
            {errors.eventDate ? (
              <p className="text-xs font-medium text-destructive">{errors.eventDate.message}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Only future dates are selectable.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="booking-location" className="text-xs font-medium text-foreground">
              Event Location / Venue Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="booking-location"
                placeholder="e.g. City Hall, The Grand Ballroom, Napa Valley..."
                className="pl-9 h-10 bg-background text-sm"
                aria-invalid={Boolean(errors.eventLocation)}
                {...register("eventLocation")}
              />
            </div>
            {errors.eventLocation && (
              <p className="text-xs font-medium text-destructive">
                {errors.eventLocation.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="booking-message" className="text-xs font-medium text-foreground">
              Special Requests or Message (Optional)
            </Label>
            <div className="relative">
              <Textarea
                id="booking-message"
                placeholder="Share your wedding theme, estimated guest count, preferred timing, or special notes for the vendor..."
                rows={3}
                className="bg-background text-sm leading-relaxed"
                aria-invalid={Boolean(errors.message)}
                {...register("message")}
              />
            </div>
            {errors.message && (
              <p className="text-xs font-medium text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-border/60">
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
