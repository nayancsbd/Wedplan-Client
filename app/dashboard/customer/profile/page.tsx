"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

export default function CustomerProfilePage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Wedding profile saved successfully!")
    }, 600)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Account & Wedding Vision"
        title="Couple Profile Settings"
        description="Keep your personal details, wedding date, and wedding preferences up to date."
        centered={false}
      />

      <form onSubmit={handleSave} className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="couple-name" className="text-xs font-medium">
              Your Full Name
            </Label>
            <Input
              id="couple-name"
              defaultValue={user?.name || ""}
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="partner-name" className="text-xs font-medium">
              Partner&apos;s Name
            </Label>
            <Input
              id="partner-name"
              placeholder="e.g. Alex"
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="couple-email" className="text-xs font-medium">
              Email Address
            </Label>
            <Input
              id="couple-email"
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="bg-muted/50 h-10 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wedding-date" className="text-xs font-medium">
              Wedding Date
            </Label>
            <Input
              id="wedding-date"
              type="date"
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="wedding-location" className="text-xs font-medium">
              Wedding City / Region
            </Label>
            <Input
              id="wedding-location"
              placeholder="e.g. Napa Valley, CA"
              className="bg-background h-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
          <Button type="submit" disabled={isSaving} className="gap-2 cursor-pointer font-medium">
            <Save className="size-4" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
