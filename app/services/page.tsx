import type { Metadata } from "next"
import * as React from "react"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { PageLoader } from "@/components/shared/PageLoader"
import { ServicesCatalog } from "@/components/services/ServicesCatalog"

export const metadata: Metadata = {
  title: "Browse Wedding Services | WedPlan",
  description:
    "Explore approved venues, photographers, florists, caterers, and beauty artists for your dream wedding.",
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Section Header */}
        <SectionHeading
          badge="Curated Directory"
          title="Browse Wedding Services"
          description="Explore verified wedding professionals, compare packages, and connect with trusted artisans for your special day."
        />

        {/* Catalog Wrapped in Suspense for URL Query Param Sync */}
        <React.Suspense fallback={<PageLoader message="Loading wedding directory..." />}>
          <ServicesCatalog />
        </React.Suspense>
      </div>
    </div>
  )
}
