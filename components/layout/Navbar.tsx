"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Heart,
  Menu,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Sparkles,
  ChevronDown,
} from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, isPending, isAuthenticated, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const getDashboardHref = () => {
    if (role === "admin") return "/dashboard/admin"
    if (role === "vendor") return "/dashboard/vendor"
    if (role === "customer") return "/dashboard/customer"
    return "/dashboard"
  }

  const getProfileHref = () => {
    if (role === "admin") return "/dashboard/admin/profile"
    if (role === "vendor") return "/dashboard/vendor/profile"
    return "/dashboard/customer/profile"
  }

  const getDashboardButtonLabel = () => {
    if (role === "admin") return "Admin Dashboard"
    if (role === "vendor") return "Vendor Dashboard"
    return "Customer Dashboard"
  }

  const isPremiumVendor =
    role === "vendor" &&
    (user?.subscriptionPlan?.toLowerCase().includes("prem") ||
      user?.subscriptionPlan?.toLowerCase().includes("pro") ||
      Boolean((user as { isPremium?: boolean })?.isPremium))

  const userName = user?.name
  const userInitials = React.useMemo(() => {
    if (!userName) return "WP"
    const parts = userName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return userName.slice(0, 2).toUpperCase()
  }, [userName])

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Services", href: "/services" },
  ]

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await signOut()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 transition-transform active:scale-98"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Heart className="size-5 fill-primary text-primary stroke-[1.8] transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            Wed<span className="text-primary font-serif">Plan</span>
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-7">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-3">
          {isPending ? (
            <div className="size-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <>
              <Link href={getDashboardHref()}>
                <Button
                  size="sm"
                  className="gap-1.5 shadow-xs font-serif font-medium cursor-pointer"
                >
                  <LayoutDashboard className="size-3.5" />
                  <span>{getDashboardButtonLabel()}</span>
                </Button>
              </Link>

              <DropdownMenu>
              <DropdownMenuTrigger
                className="group flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                aria-label="User navigation menu"
              >
                <div className="relative">
                  <Avatar className="size-9 ring-1 ring-border/80 group-hover:ring-primary/50 transition-all">
                    {user.image && (
                      <AvatarImage
                        src={user.image}
                        alt={user.name || "User Avatar"}
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 font-serif font-semibold text-primary text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  {isPremiumVendor && (
                    <span
                      title="Premium Vendor"
                      className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-amber-500 ring-2 ring-background text-[8px] text-white"
                    >
                      ★
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-left">
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user.name || "Account"}
                  </span>
                  {isPremiumVendor && (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0 font-medium tracking-wide uppercase">
                      Premium
                    </Badge>
                  )}
                  <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-border/80 bg-popover p-1.5 shadow-lg"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 py-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif font-semibold text-foreground truncate">
                          {user.name}
                        </span>
                        {isPremiumVendor ? (
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-none text-[10px] px-1.5 py-0">
                            Premium
                          </Badge>
                        ) : (
                          role && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                              {role}
                            </span>
                          )
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push(getDashboardHref())}
                    className="cursor-pointer gap-2.5 px-2.5 py-2 text-sm text-foreground focus:bg-primary/10 focus:text-primary rounded-md"
                  >
                    <LayoutDashboard className="size-4 text-primary" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push(getProfileHref())}
                    className="cursor-pointer gap-2.5 px-2.5 py-2 text-sm text-foreground focus:bg-primary/10 focus:text-primary rounded-md"
                  >
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="cursor-pointer gap-2.5 px-2.5 py-2 text-sm rounded-md"
                >
                  <LogOut className="size-4 text-destructive" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-xs">
                  <Sparkles className="size-3.5 mr-1" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && user && (
            <Link href={getDashboardHref()}>
              <Button
                size="sm"
                className="text-xs h-9 px-3 gap-1.5 font-serif cursor-pointer shadow-xs"
              >
                <LayoutDashboard className="size-3.5" />
                <span>{getDashboardButtonLabel()}</span>
              </Button>
            </Link>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              aria-label="Open mobile navigation"
              className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <SheetHeader className="text-left pb-2 border-b border-border/60">
                  <SheetTitle>
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Heart className="size-4 fill-primary text-primary" />
                      </div>
                      <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                        Wed<span className="text-primary font-serif">Plan</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
                    <Avatar className="size-10">
                      {user.image && (
                        <AvatarImage src={user.image} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-primary/10 font-serif font-semibold text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-serif text-sm font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        {isPremiumVendor && (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] px-1 py-0 uppercase">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu
                  </p>
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}

                  {isAuthenticated && (
                    <>
                      <div className="my-2 border-t border-border/60" />
                      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Workspace
                      </p>

                      <Link
                        href={getDashboardHref()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <LayoutDashboard className="size-4 text-primary" />
                        <span>{getDashboardButtonLabel()}</span>
                        {role && (
                          <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                            {role}
                          </span>
                        )}
                      </Link>

                      <Link
                        href={getProfileHref()}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <UserIcon className="size-4 text-muted-foreground" />
                        <span>Profile Settings</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-border/60">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full justify-center">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button className="w-full justify-center shadow-xs">
                        <Sparkles className="size-3.5 mr-1.5" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
