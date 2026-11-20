"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  Search,
  MessageSquare,
  ShieldCheck,
  Heart,
  Sparkles,
  Store,
  DollarSign,
  CheckCircle2,
} from "lucide-react"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { cn } from "@/lib/utils"

interface Step {
  number: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const CUSTOMER_STEPS: Step[] = [
  {
    number: "01",
    title: "Discover & Shortlist",
    description:
      "Explore vetted vendors across all categories, filter by your aesthetic and budget, and bookmark your favorites.",
    icon: Search,
  },
  {
    number: "02",
    title: "Request Custom Proposals",
    description:
      "Inquire directly with studios, share your guest count and vision, and compare itemized quote estimates.",
    icon: MessageSquare,
  },
  {
    number: "03",
    title: "Book with Milestone Escrow",
    description:
      "Lock in your wedding date with protected Stripe deposits. Payments are disbursed only upon milestone completion.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Celebrate Your Dream Day",
    description:
      "Collaborate on day-of timelines and synchronized checklists so you can relax and cherish every memory.",
    icon: Heart,
  },
]

const VENDOR_STEPS: Step[] = [
  {
    number: "01",
    title: "Build Your Studio Profile",
    description:
      "Showcase high-resolution photo galleries, service menus, packages, and transparent pricing structures.",
    icon: Store,
  },
  {
    number: "02",
    title: "Receive Qualified Leads",
    description:
      "Get matched with couples whose wedding date, venue location, and budget align with your studio calendar.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Send Contracts & Invoices",
    description:
      "Generate digital agreements, schedule consultations, and manage wedding bookings from one central hub.",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Guaranteed Payouts",
    description:
      "Automated payouts delivered directly to your bank account with zero payment chasing and low platform fees.",
    icon: DollarSign,
  },
]

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion()
  const [activeTab, setActiveTab] = React.useState<"customers" | "vendors">(
    "customers"
  )

  const steps = activeTab === "customers" ? CUSTOMER_STEPS : VENDOR_STEPS

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionHeading
            badge="Effortless Journey"
            title="How WedPlan Works"
            description="Whether you are planning your once-in-a-lifetime wedding or showcasing your creative studio, the path is simple."
          />
        </motion.div>

        {/* Audience Toggle Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("customers")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer",
                activeTab === "customers"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              For Couples
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vendors")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer",
                activeTab === "vendors"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              For Wedding Vendors
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number + activeTab}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                }}
                className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-2xl font-bold text-primary/40">
                    {step.number}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5 stroke-[1.8]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
