import type { Metadata } from "next"
import * as React from "react"
import { SignInForm } from "@/components/auth/SignInForm"
import { PageLoader } from "@/components/shared/PageLoader"

export const metadata: Metadata = {
  title: "Sign In | WedPlan",
  description: "Sign in to your WedPlan wedding planning dashboard.",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <React.Suspense fallback={<PageLoader message="Loading..." />}>
        <SignInForm />
      </React.Suspense>
    </div>
  )
}
