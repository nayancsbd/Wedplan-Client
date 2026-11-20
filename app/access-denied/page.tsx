import type { Metadata } from "next"
import { AccessDenied } from "@/components/shared"

export const metadata: Metadata = {
  title: "Access Denied | WedPlan",
  description: "You do not have permission to access this page or action.",
}

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center p-4 sm:p-8">
      <AccessDenied />
    </div>
  )
}
