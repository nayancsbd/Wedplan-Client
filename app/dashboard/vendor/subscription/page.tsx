"use client"

import * as React from "react"
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  Shield,
  Loader2,
  Calendar,
  CreditCard,
  Receipt,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/dashboard/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useAuth } from "@/hooks/use-auth"

interface SubscriptionData {
  plan: string
  status?: string
  expiresAt?: string | null
  activeServicesCount?: number
  maxServices?: number | "unlimited"
}

interface VendorTransaction {
  id: string
  amount: number
  currency?: string
  status: string
  description?: string
  plan?: string
  createdAt?: string
  receiptUrl?: string
}

export default function VendorSubscriptionPage() {
  const { user } = useAuth()
  const [isUpgrading, setIsUpgrading] = React.useState(false)
  const [subscription, setSubscription] = React.useState<SubscriptionData | null>(null)
  const [transactions, setTransactions] = React.useState<VendorTransaction[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const subRes = await fetch("/api/vendor/subscription", {
          headers: { Accept: "application/json" },
          credentials: "include",
        }).catch(() => null)

        if (isMounted && subRes && subRes.ok) {
          const subJson = await subRes.json().catch(() => null)
          if (subJson) {
            const data = (subJson.data || subJson.subscription || subJson) as Record<string, unknown>
            setSubscription({
              plan: String(data.plan || data.subscriptionPlan || "free"),
              status: String(data.status || "active"),
              expiresAt: (data.expiresAt || data.subscriptionExpiresAt || data.currentPeriodEnd) as string | null,
              activeServicesCount: Number(data.activeServicesCount || 0),
              maxServices: data.maxServices === "unlimited" ? "unlimited" : Number(data.maxServices || 3),
            })
          }
        }

        const txEndpoints = [
          "/api/vendor/transactions",
          "/api/payments/vendor/transactions",
          "/api/payments/transactions",
          "/api/payments/history",
        ]

        let txList: VendorTransaction[] = []
        for (const ep of txEndpoints) {
          try {
            const txRes = await fetch(ep, {
              headers: { Accept: "application/json" },
              credentials: "include",
            })
            if (txRes.ok) {
              const txJson = await txRes.json().catch(() => null)
              let rawArray: unknown[] = []
              if (Array.isArray(txJson)) {
                rawArray = txJson
              } else if (txJson && typeof txJson === "object") {
                const obj = txJson as Record<string, unknown>
                if (Array.isArray(obj.data)) rawArray = obj.data
                else if (Array.isArray(obj.transactions)) rawArray = obj.transactions
                else if (Array.isArray(obj.history)) rawArray = obj.history
              }

              if (rawArray.length > 0) {
                txList = rawArray.map((item, idx) => {
                  const rec = (item || {}) as Record<string, unknown>
                  return {
                    id: String(rec.id || rec._id || rec.stripeId || `tx_${idx + 1}`),
                    amount: Number(rec.amount || rec.total || 0),
                    currency: String(rec.currency || "USD").toUpperCase(),
                    status: String(rec.status || "completed"),
                    description: String(rec.description || rec.plan || "Premium Vendor Plan"),
                    plan: String(rec.plan || "Premium"),
                    createdAt: (rec.createdAt || rec.date || rec.created) as string | undefined,
                    receiptUrl: (rec.receiptUrl || rec.receipt_url || rec.invoiceUrl) as string | undefined,
                  }
                })
                break
              }
            }
          } catch {
            continue
          }
        }

        if (isMounted) {
          setTransactions(txList)
        }
      } catch {
        if (isMounted) {
          setTransactions([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const rawUserPlan = (user as unknown as { subscriptionPlan?: string })?.subscriptionPlan
  const isPremium =
    subscription?.plan?.toLowerCase().includes("prem") ||
    rawUserPlan?.toLowerCase().includes("prem") ||
    false

  const formatExpiry = () => {
    if (!isPremium) {
      return "Lifetime Free Plan"
    }

    const expiryValue =
      subscription?.expiresAt ||
      (user as unknown as { subscriptionExpiresAt?: string })?.subscriptionExpiresAt

    if (expiryValue) {
      const parsed = new Date(expiryValue)
      if (!isNaN(parsed.getTime())) {
        return `Renews on ${parsed.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
      }
    }

    return "Active (Auto-renewing monthly)"
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ plan: "premium" }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          "Failed to initiate checkout session. Please try again."
        toast.error(errorMsg)
        return
      }

      const checkoutUrl =
        data?.url ||
        data?.checkoutUrl ||
        data?.sessionUrl ||
        data?.data?.url

      if (checkoutUrl) {
        toast.loading("Redirecting to Stripe Checkout...")
        window.location.href = checkoutUrl
      } else {
        toast.error("Checkout URL was not received. Please try again.")
      }
    } catch {
      toast.error("Network error while connecting to payment gateway.")
    } finally {
      setIsUpgrading(false)
    }
  }

  const columns: DataTableColumn<VendorTransaction>[] = [
    {
      header: "Transaction ID",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-muted-foreground shrink-0" />
          <span className="font-mono text-xs text-foreground font-medium">
            {item.id.length > 20 ? `${item.id.slice(0, 16)}...` : item.id}
          </span>
        </div>
      ),
    },
    {
      header: "Plan / Description",
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground text-sm">
            {item.description || "Premium Membership"}
          </p>
          <p className="text-xs text-muted-foreground">Stripe Test Checkout</p>
        </div>
      ),
    },
    {
      header: "Date",
      cell: (item) => {
        if (!item.createdAt) return <span className="text-xs text-muted-foreground">—</span>
        const d = new Date(item.createdAt)
        const dateStr = isNaN(d.getTime())
          ? String(item.createdAt)
          : d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-primary shrink-0" />
            <span>{dateStr}</span>
          </div>
        )
      },
    },
    {
      header: "Amount",
      cell: (item) => {
        const amt = item.amount >= 100 && item.amount % 1 === 0 ? item.amount / 100 : item.amount
        return (
          <span className="font-semibold text-foreground text-sm">
            ${amt.toFixed(2)} {item.currency || "USD"}
          </span>
        )
      },
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status || "completed"} />,
    },
    {
      header: "Invoice",
      align: "right",
      cell: (item) =>
        item.receiptUrl ? (
          <a
            href={item.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-8 gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer",
            })}
          >
            <span>Receipt</span>
            <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Standard</span>
        ),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <SectionHeading
        badge="Vendor Membership"
        title="Subscription Plans"
        description="Expand your wedding reach, unlock unlimited active listings, and gain a trusted Premium Vendor badge."
        centered={false}
      />

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Crown className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-foreground">
                Current Plan: {isPremium ? "Premium Vendor" : "Free Plan"}
              </span>
              <Badge
                variant={isPremium ? "default" : "secondary"}
                className={isPremium ? "bg-primary text-primary-foreground text-xs" : "text-xs"}
              >
                {isPremium ? "Premium" : "Free"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Calendar className="size-3.5 text-primary" />
              <span>{formatExpiry()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {!isPremium && (
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="gap-2 cursor-pointer w-full sm:w-auto"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Upgrade to Premium</span>
                </>
              )}
            </Button>
          )}
          {isPremium && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Check className="size-3.5" />
              <span>Unlimited Active Listings Enabled</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div
          className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all ${
            !isPremium
              ? "border-primary/40 bg-card shadow-sm ring-1 ring-primary/20"
              : "border-border/80 bg-card/60"
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif text-2xl font-bold text-foreground">Free</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standard platform presence for emerging artisans.
                </p>
              </div>
              {!isPremium && (
                <Badge variant="outline" className="border-primary/40 text-primary font-medium">
                  Current Plan
                </Badge>
              )}
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-extrabold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground">/ month forever</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plan Inclusions
              </p>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span>
                    <strong>Max 3 active services</strong> listed for couples to browse
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span>Basic vendor dashboard with key metrics</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span>Booking request management with accept and reject</span>
                </li>
              </ul>
            </div>
          </div>

          <Button
            variant="outline"
            disabled
            className="w-full text-xs font-medium cursor-default"
          >
            {!isPremium ? "Your Active Plan" : "Included in Base Plan"}
          </Button>
        </div>

        <div
          className={`rounded-2xl border-2 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden transition-all ${
            isPremium
              ? "border-emerald-500/40 bg-card shadow-emerald-500/5 ring-1 ring-emerald-500/20"
              : "border-primary bg-card/95 shadow-primary/5 ring-2 ring-primary/20"
          }`}
        >
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-4 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Crown className="size-3" />
            Recommended
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-foreground">Premium</span>
                  <Sparkles className="size-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Maximum visibility, limitless listings & premium vendor status.
                </p>
              </div>
              {isPremium && (
                <Badge className="bg-emerald-600 text-white font-medium">
                  Active
                </Badge>
              )}
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-extrabold text-foreground">$29</span>
                <span className="text-xs text-muted-foreground">/ month, cancel anytime</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Everything in Free, plus:
              </p>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Zap className="size-3" />
                  </div>
                  <span>
                    <strong>Unlimited active services</strong> without quota limits
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Crown className="size-3" />
                  </div>
                  <span>
                    <strong>Premium Vendor badge</strong> shown on cards and listings
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Shield className="size-3" />
                  </div>
                  <span>All Free features included with top priority placement</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            {isPremium ? (
              <Button
                variant="outline"
                disabled
                className="w-full gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default"
              >
                <Check className="size-4" />
                <span>Current Active Plan</span>
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full gap-2 font-medium shadow-md cursor-pointer"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Preparing Checkout...</span>
                  </>
                ) : (
                  <>
                    <Crown className="size-4" />
                    <span>Upgrade to Premium</span>
                    <ArrowRight className="size-4 ml-auto" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              <span>Transaction History</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receipts and invoices for subscription payments.
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          emptyState={{
            title: "No transactions recorded",
            description: "When you upgrade or pay for subscriptions, invoices and transaction records will appear here.",
          }}
        />
      </div>
    </div>
  )
}
