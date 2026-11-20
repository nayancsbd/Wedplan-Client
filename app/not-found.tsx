import Link from "next/link"
import { Heart, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Heart className="size-8 fill-primary/30 text-primary stroke-[1.7]" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            404 Error
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Lost on the Way to the Altar?
          </h1>
          <p className="mx-auto max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
            The wedding page, service listing, or dashboard you are looking for
            could not be found or may have moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button size="lg" className="shadow-xs">
              <ArrowLeft className="size-4 mr-2" />
              Return Home
            </Button>
          </Link>

          <Link href="/services">
            <Button variant="outline" size="lg">
              <Search className="size-4 mr-2 text-primary" />
              Browse Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
