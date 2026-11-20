import Link from "next/link"
import { Heart, Search, LayoutDashboard, Home } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg text-center space-y-6 rounded-3xl border border-primary/20 bg-card p-8 sm:p-10 shadow-lg backdrop-blur-xs">
        <div className="mx-auto flex size-18 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
          <Heart className="size-9 fill-primary/30 text-primary stroke-[1.7]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            404 Error
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Lost on the Way to the Altar?
          </h1>
          <p className="mx-auto max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
            The wedding package, vendor profile, or page you were looking for could not be found or may have been updated.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/services"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "h-9 gap-1.5 text-xs shadow-xs cursor-pointer",
            })}
          >
            <Search className="size-3.5" />
            <span>Browse Services</span>
          </Link>

          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-9 gap-1.5 text-xs cursor-pointer",
            })}
          >
            <LayoutDashboard className="size-3.5 text-primary" />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            href="/"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-9 gap-1.5 text-xs text-muted-foreground cursor-pointer",
            })}
          >
            <Home className="size-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
