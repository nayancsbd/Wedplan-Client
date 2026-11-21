"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X, ChevronLeft, ChevronRight, Filter, AlertCircle, RotateCcw } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { apiFetch } from "@/lib/api"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ServiceItem, normalizeService } from "@/lib/service-utils"

export type { ServiceItem }

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "photography", label: "Photography & Videography" },
  { value: "venue", label: "Wedding Venues" },
  { value: "decor", label: "Decoration & Florist" },
  { value: "catering", label: "Catering Services" },
  { value: "hair_makeup", label: "Makeup & Styling" },
  { value: "attire", label: "Wedding Fashion" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Listings" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
]

const DEFAULT_LOCATIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Miami, FL",
  "Napa Valley, CA",
  "Austin, TX",
  "Seattle, WA",
  "Charleston, SC",
  "San Francisco, CA",
  "Denver, CO",
]

const PAGE_SIZE = 9

function normalizeSort(val: string): "newest" | "price_asc" | "price_desc" | "rating" {
  const s = (val || "").toLowerCase().trim()
  if (s === "price_asc" || s === "asc" || s === "price-asc" || s === "low_to_high" || s === "price_low") {
    return "price_asc"
  }
  if (s === "price_desc" || s === "desc" || s === "price-desc" || s === "high_to_low" || s === "price_high") {
    return "price_desc"
  }
  if (s === "rating" || s === "highest_rated") {
    return "rating"
  }
  return "newest"
}

export function ServicesCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()

  const querySearch = searchParams.get("search") || ""
  const queryCategory = searchParams.get("category") || "all"
  const queryLocation = searchParams.get("location") || "all"
  const rawSort = searchParams.get("sort") || "newest"
  const activeSort = normalizeSort(rawSort)
  const queryPage = parseInt(searchParams.get("page") || "1", 10) || 1

  const [prevQuerySearch, setPrevQuerySearch] = React.useState(querySearch)
  const [searchInput, setSearchInput] = React.useState(querySearch)

  if (querySearch !== prevQuerySearch) {
    setPrevQuerySearch(querySearch)
    setSearchInput(querySearch)
  }

  const [locations, setLocations] = React.useState<string[]>(DEFAULT_LOCATIONS)
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isError, setIsError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [retryTrigger, setRetryTrigger] = React.useState(0)

  React.useEffect(() => {
    let isMounted = true
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/services/locations", {
          headers: { Accept: "application/json" },
        })
        if (res.ok && isMounted) {
          const json = await res.json()
          let locs: string[] = []
          if (Array.isArray(json)) {
            locs = json
          } else if (Array.isArray(json?.data)) {
            locs = json.data
          } else if (Array.isArray(json?.locations)) {
            locs = json.locations
          } else if (Array.isArray(json?.data?.locations)) {
            locs = json.data.locations
          }

          const validLocs = locs.filter(
            (l): l is string => typeof l === "string" && l.trim().length > 0
          )

          if (validLocs.length > 0) {
            setLocations((prev) => Array.from(new Set([...prev, ...validLocs])))
          }
        }
      } catch {
      }
    }

    fetchLocations()

    return () => {
      isMounted = false
    }
  }, [])

  const updateQueryParams = React.useCallback(
    (newParams: {
      search?: string
      category?: string
      location?: string
      sort?: string
      page?: number
      replace?: boolean
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      const searchVal =
        newParams.search !== undefined ? newParams.search : querySearch
      const catVal =
        newParams.category !== undefined ? newParams.category : queryCategory
      const locVal =
        newParams.location !== undefined ? newParams.location : queryLocation
      const sortVal =
        newParams.sort !== undefined ? newParams.sort : activeSort
      const pageVal =
        newParams.page !== undefined ? newParams.page : queryPage

      if (searchVal.trim()) {
        params.set("search", searchVal.trim())
      } else {
        params.delete("search")
      }

      if (catVal && catVal !== "all") {
        params.set("category", catVal)
      } else {
        params.delete("category")
      }

      if (locVal && locVal !== "all") {
        params.set("location", locVal)
      } else {
        params.delete("location")
      }

      if (sortVal && sortVal !== "newest") {
        params.set("sort", sortVal)
      } else {
        params.delete("sort")
      }

      if (pageVal > 1) {
        params.set("page", pageVal.toString())
      } else {
        params.delete("page")
      }

      const queryString = params.toString()
      const destination = queryString ? `${pathname}?${queryString}` : pathname
      if (newParams.replace) {
        router.replace(destination, { scroll: false })
      } else {
        router.push(destination, { scroll: false })
      }
    },
    [router, pathname, searchParams, querySearch, queryCategory, queryLocation, activeSort, queryPage]
  )

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== querySearch) {
        updateQueryParams({ search: searchInput, page: 1, replace: true })
      }
    }, 350)

    return () => clearTimeout(handler)
  }, [searchInput, querySearch, updateQueryParams])

  React.useEffect(() => {
    let isMounted = true

    const fetchServices = async () => {
      setIsLoading(true)
      setIsError(false)
      setErrorMessage(null)

      try {
        const queryParams = new URLSearchParams()
        if (querySearch.trim()) queryParams.set("search", querySearch.trim())
        if (queryCategory !== "all") queryParams.set("category", queryCategory)
        if (queryLocation !== "all") queryParams.set("location", queryLocation)

        if (activeSort === "price_asc") {
          queryParams.set("sort", "price_asc")
          queryParams.set("sortBy", "price")
          queryParams.set("sortOrder", "asc")
          queryParams.set("order", "asc")
        } else if (activeSort === "price_desc") {
          queryParams.set("sort", "price_desc")
          queryParams.set("sortBy", "price")
          queryParams.set("sortOrder", "desc")
          queryParams.set("order", "desc")
        } else if (activeSort === "rating") {
          queryParams.set("sort", "rating")
          queryParams.set("sortBy", "rating")
          queryParams.set("order", "desc")
        } else {
          queryParams.set("sort", "newest")
          queryParams.set("sortBy", "createdAt")
          queryParams.set("order", "desc")
        }

        queryParams.set("page", queryPage.toString())
        queryParams.set("limit", PAGE_SIZE.toString())

        const json: unknown = await apiFetch(`/api/services?${queryParams.toString()}`, {
          skipAuth: !isAuthenticated,
        })

        if (!isMounted) return

        let rawList: unknown[] = []
        let total = 0
        let pages = 1

        if (Array.isArray(json)) {
          rawList = json
          total = json.length
          pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
        } else if (json && typeof json === "object") {
          const jsonObj = json as Record<string, unknown>
          const dataObj = jsonObj.data as Record<string, unknown> | undefined

          if (dataObj && Array.isArray(dataObj.services)) {
            rawList = dataObj.services as unknown[]
            const dataTotal = typeof dataObj.total === "number" ? dataObj.total : undefined
            const jsonTotal = typeof jsonObj.total === "number" ? jsonObj.total : undefined
            total = dataTotal ?? jsonTotal ?? rawList.length

            const dataPages = typeof dataObj.totalPages === "number" ? dataObj.totalPages : undefined
            const jsonPages = typeof jsonObj.totalPages === "number" ? jsonObj.totalPages : undefined
            pages = dataPages ?? jsonPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE))
          } else if (Array.isArray(jsonObj.services)) {
            rawList = jsonObj.services as unknown[]
            total = typeof jsonObj.total === "number" ? jsonObj.total : rawList.length
            pages = typeof jsonObj.totalPages === "number" ? jsonObj.totalPages : Math.max(1, Math.ceil(total / PAGE_SIZE))
          } else if (Array.isArray(jsonObj.data)) {
            rawList = jsonObj.data as unknown[]
            const jsonTotal = typeof jsonObj.total === "number" ? jsonObj.total : undefined
            const jsonCount = typeof jsonObj.count === "number" ? jsonObj.count : undefined
            total = jsonTotal ?? jsonCount ?? rawList.length
            pages = typeof jsonObj.totalPages === "number" ? jsonObj.totalPages : Math.max(1, Math.ceil(total / PAGE_SIZE))
          }
        }

        let items = rawList.map(normalizeService)

        if (queryCategory !== "all") {
          const cat = queryCategory.toLowerCase()
          const matched = items.filter(
            (s) => s.category?.toLowerCase() === cat || s.category?.toLowerCase().includes(cat)
          )
          if (matched.length > 0 || total === items.length) {
            items = matched
            total = matched.length
          }
        }

        if (queryLocation !== "all") {
          const loc = queryLocation.toLowerCase()
          const matched = items.filter(
            (s) => s.location && s.location.toLowerCase().includes(loc)
          )
          if (matched.length > 0 || total === items.length) {
            items = matched
            total = matched.length
          }
        }

        if (querySearch.trim()) {
          const q = querySearch.trim().toLowerCase()
          const matched = items.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              (s.vendorName && s.vendorName.toLowerCase().includes(q)) ||
              (s.category && s.category.toLowerCase().includes(q)) ||
              (s.location && s.location.toLowerCase().includes(q)) ||
              (s.description && s.description.toLowerCase().includes(q))
          )
          if (matched.length > 0 || total === items.length) {
            items = matched
            total = matched.length
          }
        }

        if (activeSort === "price_asc") {
          items = [...items].sort((a, b) => (Number(a.startingPrice) || 0) - (Number(b.startingPrice) || 0))
        } else if (activeSort === "price_desc") {
          items = [...items].sort((a, b) => (Number(b.startingPrice) || 0) - (Number(a.startingPrice) || 0))
        } else if (activeSort === "rating") {
          items = [...items].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        }

        const discoveredLocations = items
          .map((s) => s.location)
          .filter((l): l is string => Boolean(l && l.trim().length > 0))

        if (discoveredLocations.length > 0) {
          setLocations((prev) => Array.from(new Set([...prev, ...discoveredLocations])))
        }

        setServices(items)
        setTotalCount(total)
        setTotalPages(Math.max(1, pages))
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true)
          const msg = err instanceof Error ? err.message : "Unable to load wedding services catalog."
          setErrorMessage(msg)
          setServices([])
          setTotalCount(0)
          setTotalPages(1)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchServices()

    return () => {
      isMounted = false
    }
  }, [querySearch, queryCategory, queryLocation, activeSort, queryPage, retryTrigger, isAuthenticated])

  const handleClearFilters = () => {
    setSearchInput("")
    router.push(pathname)
  }

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1)
  }

  const hasActiveFilters =
    Boolean(querySearch) ||
    queryCategory !== "all" ||
    queryLocation !== "all" ||
    activeSort !== "newest"

  const selectableLocations = React.useMemo(() => {
    const list = Array.from(new Set(locations))
    if (queryLocation !== "all" && !list.includes(queryLocation)) {
      list.unshift(queryLocation)
    }
    return list
  }, [locations, queryLocation])

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services, studios, or locations..."
              className="h-10 pl-9 pr-9 bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
              aria-label="Search wedding services"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("")
                  updateQueryParams({ search: "", page: 1 })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5 rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
                aria-label="Clear search query"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="relative">
              <select
                value={queryCategory}
                onChange={(e) =>
                  updateQueryParams({ category: e.target.value, page: 1 })
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                aria-label="Filter services by category"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="relative">
              <select
                value={queryLocation}
                onChange={(e) =>
                  updateQueryParams({ location: e.target.value, page: 1 })
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                aria-label="Filter services by location"
              >
                <option value="all">All Locations</option>
                {selectableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={activeSort}
                onChange={(e) =>
                  updateQueryParams({ sort: e.target.value, page: 1 })
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                aria-label="Sort services by price or newest"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <Filter className="size-3 text-primary" />
              Active filters:
            </span>

            {querySearch && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal"
              >
                Search: &ldquo;{querySearch}&rdquo;
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("")
                    updateQueryParams({ search: "", page: 1 })
                  }}
                  className="hover:text-destructive cursor-pointer"
                  aria-label="Remove search filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {queryCategory !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal"
              >
                Category:{" "}
                {CATEGORY_OPTIONS.find((c) => c.value === queryCategory)?.label || queryCategory}
                <button
                  type="button"
                  onClick={() => updateQueryParams({ category: "all", page: 1 })}
                  className="hover:text-destructive cursor-pointer"
                  aria-label="Remove category filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {queryLocation !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal"
              >
                Location: {queryLocation}
                <button
                  type="button"
                  onClick={() => updateQueryParams({ location: "all", page: 1 })}
                  className="hover:text-destructive cursor-pointer"
                  aria-label="Remove location filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {activeSort !== "newest" && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal"
              >
                Sort: {SORT_OPTIONS.find((s) => s.value === activeSort)?.label}
                <button
                  type="button"
                  onClick={() => updateQueryParams({ sort: "newest", page: 1 })}
                  className="hover:text-destructive cursor-pointer"
                  aria-label="Remove sort filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-medium text-primary hover:underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            )}

            {!hasActiveFilters && (
              <span className="text-muted-foreground italic">None (Showing all services)</span>
            )}
          </div>

          <div className="text-muted-foreground font-medium">
            {!isLoading && !isError && (
              <span>
                Showing {services.length} of {totalCount} services
              </span>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-card p-4 space-y-3"
            >
              <Skeleton className="aspect-4/3 w-full rounded-xl" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Unable to Load Wedding Services
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorMessage || "We encountered an issue connecting to the directory. Please check your internet or retry."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleRetry}
              size="sm"
              className="gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Retry</span>
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No wedding services found"
          description={
            hasActiveFilters
              ? "We couldn't find any services matching your active filters. Try adjusting your search term, category, or location."
              : "No wedding services are currently available. Check back soon!"
          }
          action={
            hasActiveFilters
              ? {
                  label: "Clear All Filters",
                  onClick: handleClearFilters,
                }
              : undefined
          }
          className="my-8"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item) => {
            const detailHref = isAuthenticated
              ? `/services/${item.id}`
              : `/signin?callbackUrl=${encodeURIComponent(`/services/${item.id}`)}`

            return (
              <ServiceCard
                key={item.id}
                id={item.id}
                title={item.title}
                category={item.category}
                vendorName={item.vendorName}
                location={item.location}
                startingPrice={item.startingPrice}
                priceRange={item.priceRange}
                rating={item.rating}
                reviewCount={item.reviewCount}
                imageUrl={item.imageUrl}
                featured={item.featured}
                href={detailHref}
              />
            )
          })}
        </div>
      )}

      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/70 pt-8">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            Page <span className="font-semibold text-foreground">{queryPage}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateQueryParams({ page: Math.max(1, queryPage - 1) })
              }
              disabled={queryPage <= 1}
              className="h-9 px-3 gap-1 border-border/80 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1
                const isActive = pageNumber === queryPage

                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= queryPage - 1 && pageNumber <= queryPage + 1)
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateQueryParams({ page: pageNumber })}
                      className="size-9 p-0 font-medium cursor-pointer"
                      aria-current={isActive ? "page" : undefined}
                    >
                      {pageNumber}
                    </Button>
                  )
                }

                if (
                  pageNumber === queryPage - 2 ||
                  pageNumber === queryPage + 2
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className="px-1 text-xs text-muted-foreground select-none"
                    >
                      ...
                    </span>
                  )
                }

                return null
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateQueryParams({ page: Math.min(totalPages, queryPage + 1) })
              }
              disabled={queryPage >= totalPages}
              className="h-9 px-3 gap-1 border-border/80 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
