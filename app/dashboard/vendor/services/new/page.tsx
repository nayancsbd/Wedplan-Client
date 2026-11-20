"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Sparkles, Upload, X, Loader2, Crown, Image as ImageIcon } from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

const CATEGORIES = [
  { value: "photography", label: "Photography & Videography" },
  { value: "venue", label: "Wedding Venues" },
  { value: "decor", label: "Decoration & Florist" },
  { value: "catering", label: "Catering Services" },
  { value: "hair_makeup", label: "Makeup & Styling" },
  { value: "attire", label: "Wedding Fashion" },
]

const addServiceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters").max(120),
  category: z.string().min(1, "Please select a category"),
  price: z.number().min(1, "Price must be greater than 0"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
})

type AddServiceFormValues = z.infer<typeof addServiceSchema>

export default function AddServicePage() {
  const router = useRouter()
  const [images, setImages] = React.useState<string[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [planLimitError, setPlanLimitError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddServiceFormValues>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      name: "",
      category: "photography",
      price: 1500,
      location: "",
      description: "",
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = 5 - images.length
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed per service")
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("image", file)

        let uploadUrl = ""

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (res.ok) {
            const json: unknown = await res.json()
            const record = json as Record<string, unknown>
            uploadUrl =
              (typeof record.url === "string" ? record.url : "") ||
              (typeof record.imageUrl === "string" ? record.imageUrl : "") ||
              (typeof (record.data as Record<string, unknown>)?.url === "string"
                ? (record.data as Record<string, unknown>).url as string
                : "")
          }
        } catch {
          uploadUrl = ""
        }

        if (!uploadUrl) {
          uploadUrl = URL.createObjectURL(file)
        }

        uploadedUrls.push(uploadUrl)
      }

      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 5))
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch {
      toast.error("Failed to upload some images")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const onSubmit = async (values: AddServiceFormValues) => {
    setPlanLimitError(null)

    try {
      const payload = {
        title: values.name,
        name: values.name,
        category: values.category,
        price: values.price,
        startingPrice: values.price,
        location: values.location,
        description: values.description,
        images,
        imageUrl: images[0] || "",
      }

      await api.post("/api/services", payload)

      toast.success("Wedding service created successfully!")
      router.push("/dashboard/vendor/services")
    } catch (err: unknown) {
      const errObj = err as { message?: string; status?: number; error?: string }
      const status = errObj.status
      const msg = errObj.message || errObj.error || "Failed to publish wedding service"

      const isPlanLimit =
        status === 403 ||
        msg.toLowerCase().includes("limit") ||
        msg.toLowerCase().includes("plan") ||
        msg.toLowerCase().includes("upgrade") ||
        msg.toLowerCase().includes("subscription")

      if (isPlanLimit) {
        setPlanLimitError(msg)
        toast.error("Free plan listing limit reached. Upgrade to Featured Pro to publish more services.")
      } else {
        toast.error(msg)
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard/vendor/services"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to My Services</span>
        </Link>
        <SectionHeading
          badge="Package Builder"
          title="Add New Wedding Service"
          description="Introduce your services, configure pricing, upload high-resolution photos, and attract couples."
          centered={false}
        />
      </div>

      {planLimitError && (
        <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Crown className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Free Plan Limit Reached
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {planLimitError}. You have reached the maximum number of active listings allowed on the standard tier. Upgrade to Featured Pro for unlimited service packages, priority directory ranking, and 0% additional commission.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/dashboard/vendor/subscription">
              <Button className="gap-2 shadow-xs cursor-pointer font-medium">
                <Crown className="size-4" />
                <span>Upgrade to Featured Pro</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setPlanLimitError(null)}
              className="cursor-pointer"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="service-name" className="text-xs font-medium">
              Service Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-name"
              placeholder="e.g. Full-Day Fine Art Wedding Photography"
              disabled={isSubmitting}
              className="bg-background h-10"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-category" className="text-xs font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="service-category"
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              {...register("category")}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-price" className="text-xs font-medium">
              Starting Price ($ USD) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-price"
              type="number"
              placeholder="e.g. 2800"
              disabled={isSubmitting}
              className="bg-background h-10"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="service-location" className="text-xs font-medium">
              Primary Location / Region <span className="text-destructive">*</span>
            </Label>
            <Input
              id="service-location"
              placeholder="e.g. Napa Valley, CA"
              disabled={isSubmitting}
              className="bg-background h-10"
              {...register("location")}
            />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="service-description" className="text-xs font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="service-description"
              rows={4}
              placeholder="Describe your package deliverables, event timeline, shooting style, equipment, or culinary vision..."
              disabled={isSubmitting}
              className="bg-background text-sm resize-none"
              {...register("description")}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-3 sm:col-span-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" />
                  <span>Service Portfolio Photos ({images.length}/5)</span>
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Upload up to 5 photos showcasing your past weddings and packages.
                </p>
              </div>

              {images.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading || isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs h-8 cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span>{isUploading ? "Uploading..." : "Upload Photos"}</span>
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 overflow-hidden rounded-xl border border-border group bg-muted"
                  >
                    <Image
                      src={url}
                      alt={`Upload preview ${idx + 1}`}
                      width={300}
                      height={225}
                      unoptimized
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={isSubmitting}
                      className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <Upload className="size-6 text-muted-foreground mb-2" />
                <p className="text-xs font-medium text-foreground">Click to upload photos</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">JPEG, PNG, or WebP up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
          <Link href="/dashboard/vendor/services">
            <Button type="button" variant="outline" disabled={isSubmitting} className="cursor-pointer">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || isUploading} className="gap-2 font-medium cursor-pointer">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Publishing Service...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Publish Service</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
