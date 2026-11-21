"use client"

import * as React from "react"
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm"

export default function AdminProfilePage() {
  return (
    <ProfileSettingsForm
      badge="System Administration"
      title="Admin Profile Settings"
      description="Manage your administrator profile details, contact information, and security preferences."
    />
  )
}
