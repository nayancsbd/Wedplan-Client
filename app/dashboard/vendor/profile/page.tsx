"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

export default function VendorProfilePage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Profile settings updated successfully!")
    }, 600)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge="Account & Branding"
        title="Vendor Profile Settings"
        description="Update your business contact information, public studio details, and wedding bio."
        centered={false}
      />

      <form onSubmit={handleSave} className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="vendor-name" className="text-xs font-medium">
              Contact Full Name
            </Label>
            <Input
              id="vendor-name"
              defaultValue={user?.name || ""}
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-bizname" className="text-xs font-medium">
              Business / Studio Name
            </Label>
            <Input
              id="vendor-bizname"
              defaultValue={(user as unknown as { businessName?: string })?.businessName || user?.name || ""}
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-email" className="text-xs font-medium">
              Email Address
            </Label>
            <Input
              id="vendor-email"
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="bg-muted/50 h-10 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-phone" className="text-xs font-medium">
              Phone Number
            </Label>
            <Input
              id="vendor-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="vendor-location" className="text-xs font-medium">
              Primary Service Location
            </Label>
            <Input
              id="vendor-location"
              placeholder="e.g. San Francisco Bay Area & Napa Valley, CA"
              className="bg-background h-10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="vendor-bio" className="text-xs font-medium">
              Public Wedding Bio
            </Label>
            <Textarea
              id="vendor-bio"
              rows={4}
              placeholder="Tell couples about your creative philosophy, background, awards, and what makes working with you unique..."
              className="bg-background text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
          <Button type="submit" disabled={isSaving} className="gap-2 cursor-pointer font-medium">
            <Save className="size-4" />
            <span>{isSaving ? "Saving Changes..." : "Save Profile"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
