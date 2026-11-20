"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Heart, Eye, EyeOff, Loader2, LogIn, AlertCircle } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type SignInFormValues = z.infer<typeof signInSchema>

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

export function SignInForm() {
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
  const [authErrorBanner, setAuthErrorBanner] = React.useState<string | null>(
    null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect already-logged-in users away from signin
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

  // Email / Password Form Submission
  const onSubmit = async (values: SignInFormValues) => {
    setIsSubmitting(true)
    setAuthErrorBanner(null)

    try {
      const res = await authClient.signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })

      if (res.error) {
        const errMsg = res.error.message?.toLowerCase() || ""
        const errCode = (res.error as { code?: string })?.code?.toLowerCase() || ""

        // Handle blocked account error
        if (
          errMsg.includes("blocked") ||
          errMsg.includes("suspended") ||
          errCode.includes("blocked") ||
          res.error.status === 403
        ) {
          const message =
            "Your account has been suspended or blocked. Please contact WedPlan concierge support."
          setAuthErrorBanner(message)
          toast.error(message)
          setIsSubmitting(false)
          return
        }

        // Handle invalid credentials error
        if (
          errMsg.includes("invalid") ||
          errMsg.includes("credential") ||
          errMsg.includes("password") ||
          errMsg.includes("user not found") ||
          res.error.status === 401
        ) {
          const message =
            "Invalid email or password. Please verify your credentials and try again."
          setAuthErrorBanner(message)
          toast.error(message)
          setIsSubmitting(false)
          return
        }

        // Other generic errors
        const message = res.error.message || "Failed to sign in. Please try again."
        setAuthErrorBanner(message)
        toast.error(message)
        setIsSubmitting(false)
        return
      }

      // Check if user object returned is blocked
      const signedInUser = res.data?.user as {
        role?: string
        isBlocked?: boolean
      } | null

      if (signedInUser?.isBlocked) {
        await authClient.signOut()
        const message =
          "Your account has been suspended or blocked. Please contact WedPlan concierge support."
        setAuthErrorBanner(message)
        toast.error(message)
        setIsSubmitting(false)
        return
      }

      toast.success("Welcome back to WedPlan!")

      // Redirect by role or callbackUrl
      const userRole = signedInUser?.role || "customer"
      const target =
        callbackUrl ||
        (userRole === "admin"
          ? "/dashboard/admin"
          : userRole === "vendor"
          ? "/dashboard/vendor"
          : "/dashboard/customer")

      router.push(target)
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred during sign in"
      setAuthErrorBanner(errorMsg)
      toast.error(errorMsg)
      setIsSubmitting(false)
    }
  }

  // Google Social Sign In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setAuthErrorBanner(null)
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const target = callbackUrl || "/dashboard"
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
    <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-2 pb-6">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <Heart className="size-5 fill-primary text-primary" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your wedding planning dashboard
        </p>
      </div>

      {/* Error Banner */}
      {authErrorBanner && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-foreground"
        >
          <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
          <p className="font-medium leading-relaxed">{authErrorBanner}</p>
        </div>
      )}

      {/* Google Login */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isSubmitting}
        className="w-full h-10 justify-center gap-2.5 font-medium border-border/80 hover:bg-muted"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <GoogleIcon />
        )}
        <span>Sign in with Google</span>
      </Button>

      {/* Divider */}
      <div className="relative my-6 text-center text-xs text-muted-foreground">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/70" />
        </div>
        <span className="relative bg-card px-3 uppercase tracking-wider">
          Or continue with email
        </span>
      </div>

      {/* Sign In Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="h-10"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="w-full h-10 mt-2 font-medium shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn className="size-4 mr-2" />
              Sign In
            </>
          )}
        </Button>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link
          href={`/signup${callbackUrl ? `?redirect=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}
