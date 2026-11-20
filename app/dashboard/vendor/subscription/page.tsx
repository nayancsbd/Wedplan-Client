"use client"

import * as React from "react"
import { Crown, Check, Sparkles, Shield, Zap } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

export default function VendorSubscriptionPage() {
  const { user } = useAuth()
  const isPremium =
    (user as unknown as { subscriptionPlan?: string })?.subscriptionPlan === "premium"

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Vendor Growth"
        title="Subscription & Membership"
        description="Elevate your profile visibility, unlock priority listing, and reach more couples planning weddings."
        centered={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl font-bold text-foreground">Standard Partner</span>
              {!isPremium && <Badge variant="secondary">Current Plan</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              Essential listing features for boutique wedding vendors.
            </p>
            <div className="pt-2">
              <span className="font-serif text-3xl font-bold text-foreground">$0</span>
              <span className="text-xs text-muted-foreground"> / month forever</span>
            </div>
            <ul className="space-y-2.5 pt-4 text-xs text-muted-foreground border-t border-border/60">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                <span>Up to 3 active service listings</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                <span>Direct client messaging & booking requests</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                <span>Standard directory placement</span>
              </li>
            </ul>
          </div>

          <Button variant="outline" disabled={!isPremium} className="w-full cursor-pointer">
            {!isPremium ? "Active Plan" : "Downgrade to Standard"}
          </Button>
        </div>

        <div className="rounded-2xl border-2 border-primary bg-card/90 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-4 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
            <Crown className="size-3" />
            Recommended
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                <span>Featured Pro</span>
                <Sparkles className="size-4 text-primary" />
              </span>
              {isPremium && <Badge className="bg-primary text-primary-foreground">Active</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum exposure with featured placement on WedPlan home and search.
            </p>
            <div className="pt-2">
              <span className="font-serif text-3xl font-bold text-foreground">$49</span>
              <span className="text-xs text-muted-foreground"> / month, cancel anytime</span>
            </div>
            <ul className="space-y-2.5 pt-4 text-xs text-foreground border-t border-border/60">
              <li className="flex items-center gap-2">
                <Zap className="size-4 text-primary shrink-0" />
                <span className="font-medium">Unlimited active service listings</span>
              </li>
              <li className="flex items-center gap-2">
                <Crown className="size-4 text-primary shrink-0" />
                <span className="font-medium">&ldquo;Featured Vendor&rdquo; badge on cards</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="size-4 text-primary shrink-0" />
                <span className="font-medium">Top placement in category searches</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                <span>0% additional commission fee</span>
              </li>
            </ul>
          </div>

          <Button className="w-full gap-2 font-medium shadow-sm cursor-pointer">
            <Crown className="size-4" />
            <span>{isPremium ? "Manage Subscription via Stripe" : "Upgrade to Featured Pro"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
