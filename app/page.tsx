import type { Metadata } from "next"
import {
  HeroBanner,
  FeaturedServices,
  ServiceCategories,
  WhyChooseUs,
  HowItWorks,
} from "@/components/home"

export const metadata: Metadata = {
  title: "WedPlan | Premier Role-Based Wedding Planning Platform",
  description:
    "Discover verified wedding vendors, transparent pricing, checklist trackers, and milestone protection for your dream wedding.",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <HeroBanner />
      <FeaturedServices />
      <ServiceCategories />
      <WhyChooseUs />
      <HowItWorks />
    </div>
  )
}
