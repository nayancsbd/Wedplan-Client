"use client"

import * as React from "react"
import Link from "next/link"
import {
  Camera,
  Save,
  Loader2,
  Lock,
  Crown,
  Store,
  AlertCircle,
  X,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { authClient } from "@/lib/auth-client"
import { api } from "@/lib/api"

export interface ProfileSettingsFormProps {
  badge?: string
  title?: string
  description?: string
}

export function ProfileSettingsForm({
  badge = "Account Settings",
  title = "Profile Settings",
  description = "Manage your personal profile, branding details, and account preferences.",
}: ProfileSettingsFormProps) {
  const { user, refetch } = useAuth()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const lastSelectedFileRef = React.useRef<File | null>(null)

  const [name, setName] = React.useState(user?.name || "")
  const [image, setImage] = React.useState(user?.image || "")
  const [businessName, setBusinessName] = React.useState(
    (user as unknown as { businessName?: string })?.businessName || ""
  )
  const [phone, setPhone] = React.useState(
    (user as unknown as { phone?: string })?.phone || ""
  )
  const [bio, setBio] = React.useState(
    (user as unknown as { bio?: string })?.bio || ""
  )

  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const role = user?.role || "customer"
  const isVendor = role === "vendor"

  const userSubPlan =
    (user as unknown as { subscriptionPlan?: string })?.subscriptionPlan || "free"
  const isPremium = userSubPlan.toLowerCase().includes("prem")

  React.useEffect(() => {
    let isMounted = true

    const fetchDetailedProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          headers: { Accept: "application/json" },
          credentials: "include",
        })

        if (!isMounted) return

        if (res.ok) {
          const json = await res.json().catch(() => null)
          const data = (json?.data || json?.user || json || {}) as Record<string, unknown>

          if (data.name) setName(String(data.name))
          if (data.image) setImage(String(data.image))
          if (data.businessName) setBusinessName(String(data.businessName))
          if (data.phone) setPhone(String(data.phone))
          if (data.bio) setBio(String(data.bio))
        }
      } catch {
      }
    }

    fetchDetailedProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP).")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.")
      return
    }

    lastSelectedFileRef.current = file
    const localPreview = URL.createObjectURL(file)
    setImage(localPreview)
    setIsUploadingImage(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("file", file)

      let uploadedUrl = ""

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        })

        if (res.ok) {
          const json = await res.json().catch(() => null)
          const rec = (json?.data || json || {}) as Record<string, unknown>
          uploadedUrl = String(rec.url || rec.imageUrl || "")
        }
      } catch {
        try {
          const pubRes = await fetch("/api/upload/public", {
            method: "POST",
            body: formData,
          })
          if (pubRes.ok) {
            const pubJson = await pubRes.json().catch(() => null)
            const rec = (pubJson?.data || pubJson || {}) as Record<string, unknown>
            uploadedUrl = String(rec.url || rec.imageUrl || "")
          }
        } catch {
          uploadedUrl = ""
        }
      }

      if (uploadedUrl) {
        setImage(uploadedUrl)
        setUploadError(null)
        toast.success("Profile photo uploaded successfully")
      } else {
        setUploadError("Image could not be permanently saved on server. You can retry.")
        toast.error("Failed to upload photo to image storage. Click Retry to try again.")
      }
    } catch {
      setUploadError("Network error occurred during image upload.")
      toast.error("Photo upload failed. Please check your internet and try again.")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const handleRetryUpload = () => {
    if (lastSelectedFileRef.current) {
      uploadFile(lastSelectedFileRef.current)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleRemovePhoto = () => {
    setImage("")
    setUploadError(null)
    lastSelectedFileRef.current = null
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.info("Profile photo removed. Save changes to confirm.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long.")
      return
    }

    if (isVendor && (!businessName.trim() || businessName.trim().length < 2)) {
      toast.error("Business name is required for vendors (min 2 characters).")
      return
    }

    setIsSaving(true)

    const payload: Record<string, unknown> = {
      name: name.trim(),
      image: image || undefined,
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
    }

    if (isVendor) {
      payload.businessName = businessName.trim()
    }

    try {
      try {
        await api.patch("/api/profile", payload)
      } catch {
        try {
          await api.put("/api/profile", payload)
        } catch {
          await api.patch("/api/user/profile", payload)
        }
      }

      try {
        const clientWithUpdate = authClient as unknown as {
          updateUser?: (params: { name?: string; image?: string }) => Promise<unknown>
        }
        if (typeof clientWithUpdate.updateUser === "function") {
          await clientWithUpdate.updateUser({
            name: name.trim(),
            image: image || undefined,
          }).catch(() => null)
        }
      } catch {
      }

      refetch()

      toast.success("Profile settings updated successfully!")
    } catch (err: unknown) {
      const errObj = err as { message?: string; error?: string }
      toast.error(errObj?.message || errObj?.error || "Failed to update profile settings.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <SectionHeading
        badge={badge}
        title={title}
        description={description}
        centered={false}
      />

      <div className="rounded-2xl border border-primary/20 bg-card p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative group">
            <Avatar className="size-20 border-2 border-primary/30 shadow-sm">
              <AvatarImage src={image} alt={name || "User Avatar"} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {(name || user?.name || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
              title="Change Profile Photo"
            >
              {isUploadingImage ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="font-serif text-xl font-bold text-foreground">
                {name || user?.name || "Your Name"}
              </h3>
              <Badge
                variant="outline"
                className="capitalize text-xs font-medium text-primary border-primary/30"
              >
                {role}
              </Badge>
              {isVendor && (
                <Badge
                  className={
                    isPremium
                      ? "bg-primary text-primary-foreground text-xs"
                      : "bg-muted text-muted-foreground text-xs"
                  }
                >
                  {isPremium ? "Premium Vendor" : "Free Plan"}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{user?.email}</p>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Upload Photo
              </button>

              {image && (
                <>
                  <span className="text-border">•</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-destructive hover:underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {isVendor && !isPremium && (
          <Link
            href="/dashboard/vendor/subscription"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 shrink-0 cursor-pointer",
            })}
          >
            <Crown className="size-3.5" />
            <span>Upgrade Plan</span>
          </Link>
        )}
      </div>

      {uploadError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingImage}
              onClick={handleRetryUpload}
              className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5"
            >
              {isUploadingImage ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RotateCcw className="size-3" />
              )}
              <span>Retry Upload</span>
            </Button>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
              title="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />

        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h4 className="font-serif text-base font-bold text-foreground">
              Personal Information
            </h4>
            <p className="text-xs text-muted-foreground">
              Update your identity details shown across WedPlan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-semibold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="bg-background h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-normal">
                  <Lock className="size-3" />
                  Read-only
                </span>
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted/50 h-10 text-sm cursor-not-allowed text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-role" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Account Role</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-normal">
                  <Lock className="size-3" />
                  Display-only
                </span>
              </Label>
              <Input
                id="profile-role"
                value={role === "vendor" ? "Vendor Partner" : role === "admin" ? "Platform Administrator" : "Customer (Couple / Planner)"}
                disabled
                className="bg-muted/50 h-10 text-sm cursor-not-allowed capitalize text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-subscription" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Subscription Plan</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-normal">
                  <Lock className="size-3" />
                  Display-only
                </span>
              </Label>
              <Input
                id="profile-subscription"
                value={isPremium ? "Premium Membership" : "Standard Free Plan"}
                disabled
                className="bg-muted/50 h-10 text-sm cursor-not-allowed text-muted-foreground"
              />
            </div>

            {isVendor && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="profile-bizname" className="text-xs font-semibold text-foreground">
                  Business / Studio Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="profile-bizname"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Blossom & Ivy Floral Design"
                    className="bg-background h-10 pl-9 text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-phone" className="text-xs font-semibold text-foreground">
                Phone Number
              </Label>
              <Input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-background h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-bio" className="text-xs font-semibold text-foreground">
                {isVendor ? "Studio & Service Bio" : "Wedding Vision / Notes"}
              </Label>
              <Textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  isVendor
                    ? "Tell couples about your experience, awards, creative style, and what makes your wedding service exceptional..."
                    : "Share details about your wedding style, vibe, or special notes for vendors..."
                }
                rows={4}
                className="bg-background text-sm leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 cursor-pointer font-medium shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Save Profile Settings</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
