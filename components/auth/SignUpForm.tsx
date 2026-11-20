"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Heart,
  Eye,
  EyeOff,
  Upload,
  X,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  Store,
  User as UserIcon,
  AlertCircle,
  RotateCcw,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const signUpSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter"),
    role: z.enum(["customer", "vendor"]),
    businessName: z.string().optional(),
    image: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "vendor") {
        return Boolean(data.businessName && data.businessName.trim().length >= 2)
      }
      return true
    },
    {
      message: "Business name is required for wedding vendors (min 2 characters)",
      path: ["businessName"],
    }
  )

type SignUpFormValues = z.infer<typeof signUpSchema>

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isPending: isAuthChecking } = useAuth()

  const rawCallbackUrl =
    searchParams.get("callbackUrl") || searchParams.get("redirect") || ""
  const callbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : ""

  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const lastSelectedFileRef = React.useRef<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "customer",
      businessName: "",
      image: "",
    },
  })

  const selectedRole = useWatch({ control, name: "role" })
  const passwordValue = useWatch({ control, name: "password" }) || ""

  const hasMinLength = passwordValue.length >= 6
  const hasUppercase = /[A-Z]/.test(passwordValue)
  const hasLowercase = /[a-z]/.test(passwordValue)

  React.useEffect(() => {
    if (!isAuthChecking && isAuthenticated && user) {
      const target =
        callbackUrl ||
        (user.role === "admin"
          ? "/dashboard/admin"
          : user.role === "vendor"
          ? "/dashboard/vendor"
          : "/dashboard/customer")
      router.replace(target)
    }
  }, [isAuthChecking, isAuthenticated, user, callbackUrl, router])

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.")
      return
    }

    lastSelectedFileRef.current = file
    const localPreview = URL.createObjectURL(file)
    setImagePreview(localPreview)
    setIsUploadingImage(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("file", file)

      const res = await fetch("/api/upload/public", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = (await res.json()) as {
          url?: string
          data?: { url?: string; imageUrl?: string }
          imageUrl?: string
        }
        const uploadedUrl =
          data?.data?.url ||
          data?.url ||
          data?.data?.imageUrl ||
          data?.imageUrl

        if (uploadedUrl) {
          setValue("image", uploadedUrl)
          setUploadError(null)
          toast.success("Profile photo uploaded successfully")
        } else {
          setValue("image", localPreview)
          setUploadError("Image uploaded locally. Permanent storage was unavailable.")
        }
      } else {
        setValue("image", localPreview)
        setUploadError("Image upload to server failed. You can retry.")
        toast.error("Image upload failed. Click retry to try again.")
      }
    } catch {
      setValue("image", localPreview)
      setUploadError("Network connection issue while uploading image.")
      toast.error("Failed to connect to image upload service.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleRemoveImage = () => {
    setImagePreview(null)
    setUploadError(null)
    lastSelectedFileRef.current = null
    setValue("image", "")
  }

  const onSubmit = async (values: SignUpFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        image: values.image || undefined,
        ...(values.role ? { role: values.role } : {}),
        ...(values.role === "vendor" && values.businessName
          ? { businessName: values.businessName.trim() }
          : {}),
      })

      if (res.error) {
        const errMsg = res.error.message?.toLowerCase() || ""
        if (errMsg.includes("already exists") || errMsg.includes("duplicate")) {
          toast.error("An account with this email already exists. Please sign in.")
        } else {
          toast.error(res.error.message || "Failed to create account. Please try again.")
        }
        setIsSubmitting(false)
        return
      }

      toast.success("Welcome to WedPlan! Your account has been created.")

      const target =
        callbackUrl ||
        (values.role === "vendor"
          ? "/dashboard/vendor"
          : "/dashboard/customer")
      router.push(target)
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred during sign up"
      toast.error(errorMsg)
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const defaultRoleTarget =
        selectedRole === "vendor" ? "/dashboard/vendor" : "/dashboard/customer"
      const target = callbackUrl || defaultRoleTarget
      const resolvedCallbackUrl = target.startsWith("http")
        ? target
        : `${origin}${target}`

      await authClient.signIn.social({
        provider: "google",
        callbackURL: resolvedCallbackUrl,
      })
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect with Google"
      toast.error(errorMsg)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      <div className="text-center space-y-2 pb-6">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <Heart className="size-5 fill-primary text-primary" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Create Your WedPlan Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join couples and wedding professionals crafting unforgettable moments
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isSubmitting}
        className="w-full h-10 justify-center gap-2.5 font-medium border-border/80 hover:bg-muted"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <GoogleIcon />
        )}
        <span>Sign up with Google</span>
      </Button>

      <div className="relative my-6 text-center text-xs text-muted-foreground">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/70" />
        </div>
        <span className="relative bg-card px-3 uppercase tracking-wider">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            I am joining as a
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("role", "customer")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-center transition-all cursor-pointer",
                selectedRole === "customer"
                  ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/50 text-foreground"
              )}
            >
              <UserIcon className="size-5" />
              <span className="font-serif text-sm font-semibold">Customer / Couple</span>
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                Planning my wedding
              </span>
            </button>

            <button
              type="button"
              onClick={() => setValue("role", "vendor")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-center transition-all cursor-pointer",
                selectedRole === "vendor"
                  ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/50 text-foreground"
              )}
            >
              <Store className="size-5" />
              <span className="font-serif text-sm font-semibold">Wedding Vendor</span>
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                Offering wedding services
              </span>
            </button>
          </div>
        </div>

        {selectedRole === "vendor" && (
          <div className="space-y-1.5 animate-in fade-in-50 duration-200">
            <Label htmlFor="businessName">Business / Studio Name *</Label>
            <Input
              id="businessName"
              placeholder="e.g. Lumière Wedding Studios"
              className="h-10"
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="text-xs text-destructive">{errors.businessName.message}</p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="e.g. Eleanor Vance"
            className="h-10"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-10"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters with mixed case"
              className="h-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}

          {passwordValue && (
            <div className="mt-2 space-y-1 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs">
              <p className="font-medium text-foreground">Password requirements:</p>
              <div className="grid grid-cols-1 gap-1 pt-1">
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {hasMinLength ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : (
                    <Circle className="size-3.5 shrink-0" />
                  )}
                  <span>At least 6 characters</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {hasUppercase ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : (
                    <Circle className="size-3.5 shrink-0" />
                  )}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    hasLowercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {hasLowercase ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : (
                    <Circle className="size-3.5 shrink-0" />
                  )}
                  <span>At least one lowercase letter (a-z)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Profile Image (Optional)
          </Label>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-14 ring-2 ring-border/80">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt="Profile preview" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-serif">
                  WP
                </AvatarFallback>
              </Avatar>

              {isUploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-xs">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="profile-image-upload"
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-muted",
                    isUploadingImage && "pointer-events-none opacity-50"
                  )}
                >
                  <Upload className="size-3.5 text-primary" />
                  <span>{imagePreview ? "Change Photo" : "Upload Photo"}</span>
                  <input
                    ref={fileInputRef}
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageFileChange}
                    disabled={isUploadingImage}
                  />
                </label>

                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                PNG, JPG or WEBP (Max 5MB)
              </p>
            </div>
          </div>

          {uploadError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 flex items-center justify-between gap-3 text-xs text-destructive mt-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingImage}
                  onClick={handleRetryUpload}
                  className="h-6 text-[11px] px-2 border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer gap-1"
                >
                  {isUploadingImage ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3" />
                  )}
                  <span>Retry</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isGoogleLoading || isUploadingImage}
          className="w-full h-10 mt-2 font-medium shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            <>
              <Sparkles className="size-4 mr-2" />
              Create Account
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/signin${callbackUrl ? `?redirect=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}
