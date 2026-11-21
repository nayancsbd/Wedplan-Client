"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  ArrowLeft,
  Sparkles,
  Upload,
  X,
  Loader2,
  Crown,
  Image as ImageIcon,
  AlertCircle,
  RotateCcw,
  Eye,
  Plus,
  Scan,
} from "lucide-react"

import { SectionHeading } from "@/components/shared/SectionHeading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"

const CATEGORIES = [
  { value: "Photography & Videography", label: "Photography & Videography" },
  { value: "Wedding Venues", label: "Wedding Venues" },
  { value: "Decoration & Florist", label: "Decoration & Florist" },
  { value: "Catering Services", label: "Catering Services" },
  { value: "Makeup & Styling", label: "Makeup & Styling" },
  { value: "Wedding Fashion", label: "Wedding Fashion" },
]

const CATEGORY_MAP: Record<string, string> = {
  photography: "Photography & Videography",
  venue: "Wedding Venues",
  venues: "Wedding Venues",
  decor: "Decoration & Florist",
  catering: "Catering Services",
  hair_makeup: "Makeup & Styling",
  makeup: "Makeup & Styling",
  attire: "Wedding Fashion",
  fashion: "Wedding Fashion",
  "Photography & Videography": "Photography & Videography",
  "Wedding Venues": "Wedding Venues",
  "Decoration & Florist": "Decoration & Florist",
  "Catering Services": "Catering Services",
  "Makeup & Styling": "Makeup & Styling",
  "Wedding Fashion": "Wedding Fashion",
}

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
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [failedFiles, setFailedFiles] = React.useState<File[]>([])
  const [planLimitError, setPlanLimitError] = React.useState<string | null>(null)
  const [previewModalUrl, setPreviewModalUrl] = React.useState<string | null>(null)
  const [fitMode, setFitMode] = React.useState<"cover" | "contain">("cover")
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const uploadedSignatures = React.useRef<Set<string>>(new Set())

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddServiceFormValues>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      name: "",
      category: "Photography & Videography",
      price: 1500,
      location: "",
      description: "",
    },
  })

  const getFileSignature = (file: File) => `${file.name}_${file.size}_${file.lastModified}`

  const uploadBatch = async (filesToUpload: File[]) => {
    const remainingSlots = 5 - images.length
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed per service")
      return
    }

    const uniqueFiles: File[] = []
    let duplicateCount = 0

    for (const file of filesToUpload) {
      const sig = getFileSignature(file)
      if (uploadedSignatures.current.has(sig)) {
        duplicateCount++
      } else {
        uniqueFiles.push(file)
      }
    }

    if (duplicateCount > 0) {
      toast.info(`${duplicateCount} duplicate photo(s) were skipped`)
    }

    if (uniqueFiles.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    const files = uniqueFiles.slice(0, remainingSlots)
    setIsUploading(true)
    setUploadError(null)

    const newlyUploaded: string[] = []
    const failed: File[] = []

    try {
      for (const file of files) {
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
                ? ((record.data as Record<string, unknown>).url as string)
                : "")
          } else {
            failed.push(file)
          }
        } catch {
          failed.push(file)
        }

        if (uploadUrl) {
          if (!images.includes(uploadUrl) && !newlyUploaded.includes(uploadUrl)) {
            newlyUploaded.push(uploadUrl)
            uploadedSignatures.current.add(getFileSignature(file))
          } else {
            toast.info("This photo is already in your service gallery")
          }
        }
      }

      if (newlyUploaded.length > 0) {
        setImages((prev) => {
          const next = [...prev]
          for (const url of newlyUploaded) {
            if (!next.includes(url) && next.length < 5) {
              next.push(url)
            }
          }
          return next
        })
        toast.success(`${newlyUploaded.length} photo(s) uploaded successfully`)
      }

      if (failed.length > 0) {
        setFailedFiles(failed)
        setUploadError(`${failed.length} photo(s) failed to upload. Click retry to try again.`)
        toast.error(`Failed to upload ${failed.length} photo(s). Please retry.`)
      } else {
        setFailedFiles([])
        setUploadError(null)
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await uploadBatch(Array.from(files))
  }

  const handleRetryUpload = async () => {
    if (failedFiles.length > 0) {
      await uploadBatch(failedFiles)
    } else {
      fileInputRef.current?.click()
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const onSubmit = async (values: AddServiceFormValues) => {
    if (images.length === 0) {
      toast.error("Please upload at least 1 photo before publishing your service")
      return
    }

    setPlanLimitError(null)

    const resolvedCategory = CATEGORY_MAP[values.category] || values.category
    const cleanImages = Array.from(new Set(images)).slice(0, 5)

    const payload = {
      serviceName: values.name.trim(),
      name: values.name.trim(),
      title: values.name.trim(),
      category: resolvedCategory,
      price: Number(values.price),
      startingPrice: Number(values.price),
      location: values.location.trim(),
      description: values.description.trim(),
      images: cleanImages,
      imageUrl: cleanImages[0] || "",
      isActive: true,
    }

    try {
      try {
        await api.post("/api/vendor/services", payload)
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status
        if (status === 404 || status === 405) {
          await api.post("/api/services", payload)
        } else {
          throw err
        }
      }

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" />
                  <span>Service Portfolio Photos ({images.length}/5)</span>
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Upload up to 5 photos showcasing your past weddings and packages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {images.length > 0 && (
                  <div className="flex items-center rounded-lg border border-border/80 bg-background p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setFitMode("cover")}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        fitMode === "cover"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Fill card preview"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode("contain")}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        fitMode === "contain"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Show entire cropped image without cropping edges"
                    >
                      Fit Whole Photo
                    </button>
                  </div>
                )}

                {images.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading || isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 text-xs h-8 cursor-pointer shrink-0"
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
            </div>

            {uploadError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={handleRetryUpload}
                    className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5"
                  >
                    {isUploading ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3" />
                    )}
                    <span>Retry Upload</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

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
                    key={`${url}-${idx}`}
                    className="relative aspect-4/3 overflow-hidden rounded-xl border border-border group bg-muted/60"
                  >
                    <Image
                      src={url}
                      alt={`Upload preview ${idx + 1}`}
                      width={300}
                      height={225}
                      unoptimized
                      className={`size-full transition-transform ${
                        fitMode === "cover" ? "object-cover" : "object-contain bg-black/10"
                      }`}
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(url)}
                        className="flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground hover:bg-white transition-colors cursor-pointer shadow-xs"
                        title="View full cropped image"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        disabled={isSubmitting}
                        className="flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer shadow-xs"
                        title="Remove image"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={isSubmitting}
                      className="group-hover:hidden absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="size-3" />
                    </button>

                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white font-medium">
                        Cover Photo
                      </span>
                    )}
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    disabled={isUploading || isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center aspect-4/3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-primary p-2 group"
                  >
                    {isUploading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Plus className="size-5 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[11px] font-medium mt-1 text-center">
                      {isUploading ? "Uploading..." : `Add Photo (${images.length}/5)`}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Upload className="size-6" />
                </div>
                <p className="text-sm font-medium text-foreground">Click to upload portfolio photos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload up to 5 photos (JPEG, PNG, or WebP). Cropped images and original ratios supported.
                </p>
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

      <Dialog open={Boolean(previewModalUrl)} onOpenChange={(open) => !open && setPreviewModalUrl(null)}>
        <DialogContent className="sm:max-w-3xl p-5">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="font-serif text-lg text-foreground flex items-center gap-2">
              <Scan className="size-4 text-primary" />
              <span>Full Photo Inspection</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review your full uploaded photo without aspect clipping.
            </DialogDescription>
          </DialogHeader>
          {previewModalUrl && (
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-muted/50 p-2 border border-border">
              <Image
                src={previewModalUrl}
                alt="Full photo inspection"
                width={1200}
                height={800}
                unoptimized
                className="max-h-[65vh] w-auto h-auto object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
