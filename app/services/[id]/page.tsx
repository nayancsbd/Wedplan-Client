import type { Metadata } from "next"
import { ServiceDetailPageClient } from "./ServiceDetailPageClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Wedding Service Details | WedPlan",
  description:
    "Explore wedding packages, vendor profiles, portfolio photos, and reserve your date with verified wedding professionals.",
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { id } = await params
  return <ServiceDetailPageClient id={id} />
}
