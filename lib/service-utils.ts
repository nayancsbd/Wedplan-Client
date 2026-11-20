/**
 * Utility functions for normalizing service objects from backend API responses.
 * Ensures compatibility across various MongoDB / Express response shapes.
 */

export interface ServiceItem {
  id: string
  title: string
  category: string
  vendorId?: string
  vendorName?: string
  vendorEmail?: string
  vendorAvatar?: string
  location?: string
  startingPrice: number
  priceRange?: string
  rating?: number
  reviewCount?: number
  imageUrl?: string
  images: string[]
  featured?: boolean
  status?: string
  description?: string
  inclusions?: string[]
}

export function normalizeService(raw: unknown): ServiceItem {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      title: "",
      category: "",
      startingPrice: 0,
      images: [],
    }
  }

  const obj = raw as Record<string, unknown>

  const id =
    (typeof obj.id === "string" ? obj.id : "") ||
    (typeof obj._id === "string" ? obj._id : "") ||
    (obj.id ? String(obj.id) : "") ||
    (obj._id ? String(obj._id) : "")

  const title =
    (typeof obj.title === "string" ? obj.title : "") ||
    (typeof obj.name === "string" ? obj.name : "") ||
    (typeof obj.serviceName === "string" ? obj.serviceName : "") ||
    "Wedding Service"

  const category =
    (typeof obj.category === "string" ? obj.category : "") ||
    (typeof obj.categoryName === "string" ? obj.categoryName : "") ||
    "Services"

  let vendorId =
    (typeof obj.vendorId === "string" ? obj.vendorId : "") ||
    (typeof obj.userId === "string" ? obj.userId : "") ||
    (typeof obj.vendor_id === "string" ? obj.vendor_id : "")

  let vendorName = ""
  let vendorEmail = typeof obj.vendorEmail === "string" ? obj.vendorEmail : ""
  let vendorAvatar = typeof obj.vendorAvatar === "string" ? obj.vendorAvatar : ""

  if (typeof obj.vendor === "string") {
    vendorName = obj.vendor
  } else if (obj.vendor && typeof obj.vendor === "object") {
    const vendorObj = obj.vendor as Record<string, unknown>
    vendorName =
      (typeof vendorObj.businessName === "string"
        ? vendorObj.businessName
        : "") ||
      (typeof vendorObj.name === "string" ? vendorObj.name : "") ||
      (typeof vendorObj.fullName === "string" ? vendorObj.fullName : "") ||
      ""

    if (!vendorId) {
      vendorId =
        (typeof vendorObj.id === "string" ? vendorObj.id : "") ||
        (typeof vendorObj._id === "string" ? vendorObj._id : "") ||
        (vendorObj.id ? String(vendorObj.id) : "") ||
        (vendorObj._id ? String(vendorObj._id) : "")
    }

    if (!vendorEmail && typeof vendorObj.email === "string") {
      vendorEmail = vendorObj.email
    }
    if (!vendorAvatar && typeof vendorObj.image === "string") {
      vendorAvatar = vendorObj.image
    }
  }

  if (!vendorName) {
    vendorName =
      (typeof obj.vendorName === "string" ? obj.vendorName : "") ||
      (typeof obj.businessName === "string" ? obj.businessName : "") ||
      (typeof obj.vendor_name === "string" ? obj.vendor_name : "") ||
      ""
  }

  let location = typeof obj.location === "string" ? obj.location : ""
  if (!location) {
    const city = typeof obj.city === "string" ? obj.city : ""
    const state = typeof obj.state === "string" ? obj.state : ""
    location = [city, state].filter(Boolean).join(", ")
  }

  const rawPrice =
    obj.startingPrice ?? obj.price ?? obj.priceMin ?? obj.cost ?? 0
  const startingPrice = Number(rawPrice)

  let imageUrl =
    (typeof obj.imageUrl === "string" ? obj.imageUrl : "") ||
    (typeof obj.image === "string" ? obj.image : "")

  const images: string[] = []
  if (Array.isArray(obj.images)) {
    for (const img of obj.images) {
      if (typeof img === "string" && img.trim()) {
        images.push(img.trim())
      } else if (img && typeof img === "object") {
        const imgObj = img as Record<string, unknown>
        if (typeof imgObj.url === "string" && imgObj.url.trim()) {
          images.push(imgObj.url.trim())
        }
      }
    }
  }

  if (imageUrl && !images.includes(imageUrl)) {
    images.unshift(imageUrl)
  }

  if (!imageUrl && images.length > 0) {
    imageUrl = images[0]
  }

  const rating =
    typeof obj.rating === "number"
      ? obj.rating
      : typeof obj.averageRating === "number"
      ? obj.averageRating
      : 5.0

  const reviewCount =
    typeof obj.reviewCount === "number"
      ? obj.reviewCount
      : typeof obj.reviewsCount === "number"
      ? obj.reviewsCount
      : Array.isArray(obj.reviews)
      ? obj.reviews.length
      : 0

  const featured = Boolean(obj.featured ?? obj.isFeatured)
  const status = typeof obj.status === "string" ? obj.status : "approved"
  const description =
    typeof obj.description === "string" ? obj.description : ""
  const priceRange =
    typeof obj.priceRange === "string" ? obj.priceRange : undefined

  const inclusions: string[] = []
  const rawInclusions = obj.inclusions || obj.features || obj.highlights
  if (Array.isArray(rawInclusions)) {
    for (const inc of rawInclusions) {
      if (typeof inc === "string" && inc.trim()) {
        inclusions.push(inc.trim())
      }
    }
  }

  return {
    id,
    title,
    category,
    vendorId,
    vendorName,
    vendorEmail,
    vendorAvatar,
    location,
    startingPrice: isNaN(startingPrice) ? 0 : startingPrice,
    priceRange,
    rating,
    reviewCount,
    imageUrl,
    images,
    featured,
    status,
    description,
    inclusions,
  }
}
