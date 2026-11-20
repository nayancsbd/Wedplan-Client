import { Skeleton } from "@/components/ui/skeleton"

export default function ServiceDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in-50 duration-300">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="aspect-16/10 w-full rounded-3xl" />

          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="size-20 rounded-xl" />
            ))}
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/3 rounded-md" />
            </div>

            <div className="pt-4 border-t border-border/60 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-36" />
            </div>

            <div className="space-y-3 pt-4 border-t border-border/60">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
