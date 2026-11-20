/**
 * WedPlan Core Types
 * Roles: customer | vendor | admin
 */

export type UserRole = "customer" | "vendor" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isBlocked?: boolean
  businessName?: string
  subscriptionPlan?: string
  image?: string | null
  phone?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export type ServiceCategory =
  | "venue"
  | "photography"
  | "videography"
  | "catering"
  | "florist"
  | "music"
  | "hair_makeup"
  | "decor"
  | "planner"
  | "attire"
  | "cake"
  | "invitations"

export interface Service {
  id: string
  vendorId: string
  vendorName?: string
  title: string
  description: string
  category: ServiceCategory
  location: string
  startingPrice: number
  priceRange?: string
  images: string[]
  featured?: boolean
  rating?: number
  reviewCount?: number
  createdAt?: string
  updatedAt?: string
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed"

export interface Booking {
  id: string
  serviceId: string
  serviceTitle: string
  customerId: string
  customerName: string
  vendorId: string
  eventDate: string
  guestCount?: number
  totalAmount: number
  status: BookingStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  serviceId: string
  customerId: string
  customerName: string
  customerAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

export interface StatItem {
  title: string
  value: string | number
  description?: string
  change?: {
    value: string | number
    isPositive?: boolean
  }
}
