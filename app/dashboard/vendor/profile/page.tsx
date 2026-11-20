"use client"

import * as React from "react"
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm"

export default function VendorProfilePage() {
  return (
    <ProfileSettingsForm
      badge="Vendor Branding"
      title="Vendor Profile Settings"
      description="Manage your studio contact details, business branding, and public wedding bio."
    />
  )
}
