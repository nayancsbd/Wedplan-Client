"use client"

import * as React from "react"
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm"

export default function CustomerProfilePage() {
  return (
    <ProfileSettingsForm
      badge="Account & Couple Vision"
      title="Profile Settings"
      description="Keep your contact info, wedding preferences, and personal details up to date."
    />
  )
}
