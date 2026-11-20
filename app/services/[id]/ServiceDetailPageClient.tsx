"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"

import { normalizeService, ServiceItem } from "@/lib/service-utils"
import { ServiceDetailView } from "@/components/services/ServiceDetailView"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"

interface ServiceDetailPageClientProps {
  id: string
}

export function ServiceDetailPageClient({ id }: ServiceDetailPageClientProps) {
  const isInvalidId =
    !id || id === "undefined" || id === "null" || id.trim().length === 0

  const [service, setService] = React.useState<ServiceItem | null>(null)
  const [isLoading, setIsLoading] = React.useState(!isInvalidId)
  const [isError, setIsError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = React.useState(0)

  React.useEffect(() => {
    if (isInvalidId) return

    let isMounted = true

    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${encodeURIComponent(id)}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        })

        if (!isMounted) return

        if (res.ok) {
          const json: unknown = await res.json()
          let rawData: unknown = null

          if (json && typeof json === "object") {
            const jsonObj = json as Record<string, unknown>
            if (jsonObj.data && typeof jsonObj.data === "object") {
              const dataObj = jsonObj.data as Record<string, unknown>
              rawData = dataObj.service || dataObj
            } else if (jsonObj.service) {
              rawData = jsonObj.service
            } else {
              rawData = jsonObj
            }
          }

          if (rawData && typeof rawData === "object") {
            const normalized = normalizeService(rawData)
            if (!normalized.id) {
              normalized.id = id
            }
            setService(normalized)
            setIsError(false)
          } else {
            setIsError(true)
            setErrorMessage("Service data was not in expected format.")
          }
        } else {
          setIsError(true)
          if (res.status === 404) {
            setErrorMessage("The wedding service you requested could not be found.")
          } else {
            setErrorMessage(`Unable to load service details (Status ${res.status}).`)
          }
        }
      } catch {
        if (isMounted) {
          setIsError(true)
          setErrorMessage("Network issue or server unavailable.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchService()

    return () => {
      isMounted = false
    }
  }, [id, isInvalidId, reloadTrigger])

  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)
    setReloadTrigger((prev) => prev + 1)
  }

  if (isInvalidId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-6">
        <EmptyState
          icon={AlertCircle}
          title="Invalid Wedding Service"
          description="The service identifier is missing or malformed. Please select a valid service from our curated directory."
          action={{
            label: "Browse All Wedding Services",
            href: "/services",
          }}
        />
        <div className="text-center pt-2">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to services directory</span>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="aspect-16/10 w-full rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-20 rounded-xl" />
              <Skeleton className="h-16 w-20 rounded-xl" />
              <Skeleton className="h-16 w-20 rounded-xl" />
            </div>
            <div className="space-y-3 pt-2">
              <Skeleton className="h-6 w-28 rounded-md" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-44" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-6">
        <EmptyState
          icon={AlertCircle}
          title="Wedding Service Not Found"
          description={
            errorMessage ||
            "We couldn't locate this wedding service listing. It may have been unlisted, removed, or the link may be invalid."
          }
          action={{
            label: "Browse All Wedding Services",
            href: "/services",
          }}
          secondaryAction={{
            label: "Try Again",
            onClick: handleRetry,
          }}
        />

        <div className="text-center pt-2">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to services directory</span>
          </Link>
        </div>
      </div>
    )
  }

  return <ServiceDetailView service={service} />
}
