/**
 * Utility functions for normalizing service objects from backend API responses.
 * Ensures compatibility across various MongoDB / Express response shapes.
 */

export interface ServiceItem {
  id: string
  title: string
  category: string
  vendorName?: string
  location?: string
  startingPrice: number
  priceRange?: string
  rating?: number
  reviewCount?: number
  imageUrl?: string
  featured?: boolean
  status?: string
  description?: string
}

export function normalizeService(raw: unknown): ServiceItem {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      title: "",
      category: "",
      startingPrice: 0,
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

  let vendorName = ""
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

  if (!imageUrl && Array.isArray(obj.images) && obj.images.length > 0) {
    const firstImg = obj.images[0]
    if (typeof firstImg === "string") {
      imageUrl = firstImg
    } else if (firstImg && typeof firstImg === "object") {
      const imgObj = firstImg as Record<string, unknown>
      if (typeof imgObj.url === "string") {
        imageUrl = imgObj.url
      }
    }
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

  return {
    id,
    title,
    category,
    vendorName,
    location,
    startingPrice: isNaN(startingPrice) ? 0 : startingPrice,
    priceRange,
    rating,
    reviewCount,
    imageUrl,
    featured,
    status,
    description,
  }
}
