"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  CalendarHeart,
  CalendarCheck,
  CreditCard,
  UserCog,
  Users,
  Briefcase,
  Receipt,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Crown,
  HeartHandshake,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

// Sidebar links per role as requested
const VENDOR_NAV_ITEMS: NavItem[] = [
  { title: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
  { title: "My Services", href: "/dashboard/vendor/services", icon: Layers },
  { title: "Add Service", href: "/dashboard/vendor/services/new", icon: PlusCircle },
  { title: "Booking Requests", href: "/dashboard/vendor/bookings", icon: CalendarHeart },
  { title: "Subscription", href: "/dashboard/vendor/subscription", icon: CreditCard },
  { title: "Profile Settings", href: "/dashboard/vendor/profile", icon: UserCog },
]

const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { title: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
  { title: "My Bookings", href: "/dashboard/customer/bookings", icon: CalendarCheck },
  { title: "Profile Settings", href: "/dashboard/customer/profile", icon: UserCog },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Manage Users", href: "/dashboard/admin/users", icon: Users },
  { title: "Manage Services", href: "/dashboard/admin/services", icon: Briefcase },
  { title: "Transactions", href: "/dashboard/admin/transactions", icon: Receipt },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, role, signOut } = useAuth()

  // Collapse sidebar state (desktop)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  // Mobile sheet open state
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  // Track pathname during render to auto-close sheet on route change without cascading effects
  const [prevPathname, setPrevPathname] = React.useState(pathname)

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsMobileOpen(false)
  }

  // Select navigation list by role or URL prefix fallback
  const navItems = React.useMemo(() => {
    if (role === "admin" || pathname.startsWith("/dashboard/admin")) {
      return ADMIN_NAV_ITEMS
    }
    if (role === "vendor" || pathname.startsWith("/dashboard/vendor")) {
      return VENDOR_NAV_ITEMS
    }
    return CUSTOMER_NAV_ITEMS
  }, [role, pathname])

  // Current section title for top bar
  const currentSection = React.useMemo(() => {
    const activeItem = navItems.find((item) => {
      if (item.href === "/dashboard/vendor" || item.href === "/dashboard/customer" || item.href === "/dashboard/admin") {
        return pathname === item.href
      }
      return pathname.startsWith(item.href)
    })
    return activeItem?.title || "Dashboard"
  }, [navItems, pathname])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch {
      toast.error("Error signing out")
    }
  }

  const userInitials = (user?.name || "WedPlan User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const isPremiumVendor =
    role === "vendor" &&
    ((user as unknown as { subscriptionPlan?: string })?.subscriptionPlan === "premium" ||
      (user as unknown as { isPremium?: boolean })?.isPremium)

  // Reusable Nav Link Item
  const renderNavLink = (item: NavItem, collapsed = false) => {
    const Icon = item.icon
    const isRoot =
      item.href === "/dashboard/vendor" ||
      item.href === "/dashboard/customer" ||
      item.href === "/dashboard/admin"

    const isActive = isRoot ? pathname === item.href : pathname.startsWith(item.href)

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        title={collapsed ? item.title : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary text-primary-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon
          className={cn(
            "size-4.5 shrink-0 transition-transform group-hover:scale-105",
            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && <span className="truncate flex-1">{item.title}</span>}
        {!collapsed && item.badge && (
          <Badge
            variant={isActive ? "secondary" : "outline"}
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    )
  }

  // Sidebar content (used for desktop & mobile)
  const renderSidebarContent = (collapsed = false) => (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand Logo & Name */}
        <div className={cn("flex items-center gap-2.5 px-2", collapsed && "justify-center px-0")}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary via-primary/90 to-primary/75 text-primary-foreground shadow-xs">
            <HeartHandshake className="size-5 stroke-[2.2]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground block leading-none">
                WedPlan
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-1 font-medium">
                {role ? `${role} portal` : "Dashboard"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">
              Menu
            </p>
          )}
          <nav className="space-y-1" aria-label="Dashboard Sidebar Navigation">
            {navItems.map((item) => renderNavLink(item, collapsed))}
          </nav>
        </div>
      </div>

      {/* Bottom Footer Section: Back to Home + User Profile Card + Logout */}
      <div className="space-y-3 border-t border-border/70 pt-4">
        {/* Link Back to Home */}
        <Link
          href="/"
          onClick={() => setIsMobileOpen(false)}
          title={collapsed ? "Back to WedPlan Home" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <Home className="size-4 shrink-0 text-muted-foreground" />
          {!collapsed && <span>Back to WedPlan</span>}
        </Link>

        {/* User Profile Card */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-2.5 shadow-2xs",
            collapsed && "flex-col p-1.5 border-none bg-transparent"
          )}
        >
          <Avatar className="size-9 shrink-0 border border-border">
            {user?.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.name || "Wedding Partner"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted-foreground capitalize">
                  {role || "Customer"}
                </span>
                {isPremiumVendor && (
                  <Badge className="bg-primary text-primary-foreground text-[9px] px-1 py-0 h-3.5 gap-0.5">
                    <Crown className="size-2.5" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Logout Action */}
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={handleLogout}
            title="Log Out"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/80 bg-card/40 transition-all duration-200 z-30 sticky top-0 h-screen",
          isCollapsed ? "w-18" : "w-64"
        )}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 border-r border-border">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          {renderSidebarContent(false)}
        </SheetContent>
      </Sheet>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Dashboard Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger Button */}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu className="size-4" />
            </Button>

            {/* Desktop Collapse Toggle Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-4.5" />
              ) : (
                <PanelLeftClose className="size-4.5" />
              )}
            </Button>

            {/* Current Section Title */}
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl font-semibold text-foreground tracking-tight">
                {currentSection}
              </h1>
            </div>
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-3">
            {/* Back to Home Quick Link */}
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex text-xs h-8 gap-1.5 border-border/80 cursor-pointer"
              >
                <Home className="size-3.5" />
                <span>Visit Storefront</span>
              </Button>
            </Link>

            {/* Topbar User Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-border/70">
              <Avatar className="size-8 rounded-full border border-primary/20">
                {user?.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-foreground leading-tight truncate max-w-[140px]">
                  {user?.name || "Account"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {role || "Customer"}
                </p>
              </div>

              {/* Logout Button in Topbar */}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Log Out"
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
