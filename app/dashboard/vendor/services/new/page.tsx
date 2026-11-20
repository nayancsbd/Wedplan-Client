"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const CATEGORIES = [
  { value: "photography", label: "Photography & Videography" },
  { value: "venue", label: "Wedding Venues" },
  { value: "decor", label: "Decoration & Florist" },
  { value: "catering", label: "Catering Services" },
  { value: "hair_makeup", label: "Makeup & Styling" },
  { value: "attire", label: "Wedding Fashion" },
]

export default function AddServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard/vendor/services"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to My Services</span>
        </Link>
        <SectionHeading
          badge="Package Builder"
          title="Create New Wedding Service"
          description="Introduce your services, configure pricing, and attract couples planning their dream wedding."
          centered={false}
        />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="service-title" className="text-xs font-medium">
              Service Name / Package Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-title"
              placeholder="e.g. Full-Day Editorial Golden Hour Photography"
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-category" className="text-xs font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="service-category"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-price" className="text-xs font-medium">
              Starting Price ($ USD) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-price"
              type="number"
              placeholder="e.g. 2500"
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="service-location" className="text-xs font-medium">
              Primary Location / Region <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-location"
              placeholder="e.g. Napa Valley, CA"
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="service-desc" className="text-xs font-medium">
              Service Description & Package Inclusions
            </Label>
            <Textarea
              id="service-desc"
              rows={4}
              placeholder="Describe your style, timeline, deliverables, and what makes your wedding service exceptional..."
              className="bg-background text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
          <Link href="/dashboard/vendor/services">
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </Link>
          <Button className="gap-2 cursor-pointer font-medium">
            <Sparkles className="size-4" />
            <span>Publish Service Listing</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
