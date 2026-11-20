import type { Metadata } from "next"
import * as React from "react"
import { SignUpForm } from "@/components/auth/SignUpForm"
import { PageLoader } from "@/components/shared/PageLoader"

export const metadata: Metadata = {
  title: "Create an Account | WedPlan",
  description:
    "Join WedPlan to plan your wedding or showcase your wedding vendor services.",
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <React.Suspense fallback={<PageLoader message="Loading..." />}>
        <SignUpForm />
      </React.Suspense>
    </div>
  )
}
