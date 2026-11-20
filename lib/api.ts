import { authClient } from "@/lib/auth-client"

export interface ApiErrorPayload {
  success?: boolean
  message?: string
  error?: string
  errors?: Record<string, string[] | string>
}

export class ApiError extends Error {
  status: number
  success: boolean
  errors?: Record<string, string[] | string> | unknown

  constructor(status: number, message: string, errors?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.success = false
    this.errors = errors
  }
}

interface TokenCache {
  token: string
  expiresAt: number
}

// In-memory token cache (never stored in localStorage)
let memoryTokenCache: TokenCache | null = null

// Cache briefly for 60 seconds
const CACHE_TTL_MS = 60 * 1000

export function clearTokenCache(): void {
  memoryTokenCache = null
}

interface TokenClientResponse {
  data?: {
    token?: string
  }
  token?: string
}

export async function getAuthToken(): Promise<string | null> {
  const now = Date.now()
  if (memoryTokenCache && memoryTokenCache.expiresAt > now) {
    return memoryTokenCache.token
  }

  try {
    const clientWithToken = authClient as unknown as {
      token: () => Promise<TokenClientResponse | string>
    }
    const res = await clientWithToken.token()
    let token: string | null = null

    if (typeof res === "string") {
      token = res
    } else if (res && typeof res === "object") {
      token = res.data?.token || res.token || null
    }

    if (token) {
      memoryTokenCache = {
        token,
        expiresAt: now + CACHE_TTL_MS,
      }
      return token
    }
  } catch {
    // Session may not exist or request failed
  }

  memoryTokenCache = null
  return null
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  skipAuth?: boolean
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, headers = {}, skipAuth = false, ...customConfig } = options

  const reqHeaders = new Headers(headers)

  // Attach JWT Bearer Authorization header if available
  if (!skipAuth && !reqHeaders.has("Authorization")) {
    const token = await getAuthToken()
    if (token) {
      reqHeaders.set("Authorization", `Bearer ${token}`)
    }
  }

  // Format request body (JSON if standard object and not FormData/Blob)
  let formattedBody: BodyInit | undefined = undefined
  if (body !== undefined && body !== null) {
    if (
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof URLSearchParams)
    ) {
      if (!reqHeaders.has("Content-Type")) {
        reqHeaders.set("Content-Type", "application/json")
      }
      formattedBody = JSON.stringify(body)
    } else {
      formattedBody = body as BodyInit
    }
  }

  if (!reqHeaders.has("Accept")) {
    reqHeaders.set("Accept", "application/json")
  }

  // Format target URL (defaults to /api/:path if relative)
  let url = endpoint
  if (
    !url.startsWith("/") &&
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {
    url = `/api/${url}`
  }

  const response = await fetch(url, {
    ...customConfig,
    headers: reqHeaders,
    body: formattedBody,
  })

  // Handle 401 Unauthorized -> clear memory token cache and redirect to /signin
  if (response.status === 401) {
    clearTokenCache()

    let errorData: ApiErrorPayload | null = null
    try {
      errorData = (await response.json()) as ApiErrorPayload
    } catch {
      // response was not JSON
    }

    const message =
      errorData?.message ||
      errorData?.error ||
      "Unauthorized. Please sign in to continue."
    const errors = errorData?.errors

    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/signin")
    ) {
      const currentPath = window.location.pathname + window.location.search
      const redirect =
        currentPath && currentPath !== "/"
          ? `?redirect=${encodeURIComponent(currentPath)}`
          : ""
      // Hard navigation on 401 resets application and in-memory state
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `${window.location.origin}/signin${redirect}`
    }

    throw new ApiError(401, message, errors)
  }

  // Handle other HTTP errors (4xx, 5xx)
  if (!response.ok) {
    let errorData: ApiErrorPayload | null = null
    try {
      errorData = (await response.json()) as ApiErrorPayload
    } catch {
      // response was not JSON
    }

    const message =
      errorData?.message ||
      errorData?.error ||
      response.statusText ||
      `Request failed with status ${response.status}`
    const errors = errorData?.errors

    throw new ApiError(response.status, message, errors)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  // Parse JSON response
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }

  return (await response.text()) as unknown as T
}

export const api = Object.assign(apiFetch, {
  get: <T = unknown>(
    endpoint: string,
    options?: Omit<ApiFetchOptions, "method">
  ) => apiFetch<T>(endpoint, { ...options, method: "GET" }),
  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiFetchOptions, "method" | "body">
  ) => apiFetch<T>(endpoint, { ...options, method: "POST", body }),
  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiFetchOptions, "method" | "body">
  ) => apiFetch<T>(endpoint, { ...options, method: "PUT", body }),
  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiFetchOptions, "method" | "body">
  ) => apiFetch<T>(endpoint, { ...options, method: "PATCH", body }),
  delete: <T = unknown>(
    endpoint: string,
    options?: Omit<ApiFetchOptions, "method">
  ) => apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
  clearTokenCache,
})

export default api
