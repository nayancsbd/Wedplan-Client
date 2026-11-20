import { redirect } from "next/navigation"

export default function VendorBookingsRedirectPage() {
  redirect("/dashboard/vendor/booking-requests")
}
