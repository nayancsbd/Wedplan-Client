"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  ShieldCheck,
  CreditCard,
  Users,
  DollarSign,
  CalendarHeart,
  Headphones,
} from "lucide-react"
import { SectionHeading } from "@/components/shared/SectionHeading"

interface BenefitItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const BENEFITS: BenefitItem[] = [
  {
    title: "Verified Professionals Only",
    description:
      "Every vendor profile undergoes vetting for verified wedding portfolios, business legitimacy, and authentic client reviews.",
    icon: ShieldCheck,
  },
  {
    title: "Milestone Escrow Security",
    description:
      "Pay securely with Stripe Checkout. Deposits are safeguarded and released strictly upon completion of agreed milestone deliverables.",
    icon: CreditCard,
  },
  {
    title: "Role-Based Portals",
    description:
      "Tailored dashboards for couples, vendors, and coordinators to share timelines, checklists, and invoices in real time.",
    icon: Users,
  },
  {
    title: "Transparent Direct Pricing",
    description:
      "Zero hidden middleman markups. View itemized package pricing and request custom quotes directly from creators.",
    icon: DollarSign,
  },
  {
    title: "Live Planning & Countdown",
    description:
      "Smart checklist trackers, automated milestone reminders, and guest list synchronization tailored to your ceremony date.",
    icon: CalendarHeart,
  },
  {
    title: "Dedicated Concierge Support",
    description:
      "Access experienced wedding advisors ready to recommend vendors, review contracts, and assist whenever you need guidance.",
    icon: Headphones,
  },
]

export function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="py-16 sm:py-24 bg-card/40 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionHeading
            badge="The WedPlan Advantage"
            title="Why Choose WedPlan?"
            description="We built a modern, stress-free platform designed to give couples total peace of mind and vendors a thriving workspace."
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                }}
                className="flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 shadow-2xs">
                  <Icon className="size-6 stroke-[1.8]" />
                </div>

                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
