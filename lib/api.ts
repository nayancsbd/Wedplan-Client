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

let memoryTokenCache: TokenCache | null = null
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

  if (!skipAuth && !reqHeaders.has("Authorization")) {
    const token = await getAuthToken()
    if (token) {
      reqHeaders.set("Authorization", `Bearer ${token}`)
    }
  }

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

  if (response.status === 401) {
    clearTokenCache()

    let errorData: ApiErrorPayload | null = null
    try {
      errorData = (await response.json()) as ApiErrorPayload
    } catch {
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
      window.location.replace(`${window.location.origin}/signin${redirect}`)
    }

    throw new ApiError(401, message, errors)
  }

  if (response.status === 403) {
    let errorData: ApiErrorPayload | null = null
    try {
      errorData = (await response.json()) as ApiErrorPayload
    } catch {
    }

    const message =
      errorData?.message ||
      errorData?.error ||
      "Access Denied: You do not have permission to view this resource or perform this action."
    const errors = errorData?.errors

    if (
      typeof window !== "undefined" &&
      (message.toLowerCase().includes("blocked") || message.toLowerCase().includes("suspended"))
    ) {
      clearTokenCache()
      window.location.replace(`${window.location.origin}/blocked`)
    }

    throw new ApiError(403, message, errors)
  }

  if (!response.ok) {
    let errorData: ApiErrorPayload | null = null
    try {
      errorData = (await response.json()) as ApiErrorPayload
    } catch {
    }

    const message =
      errorData?.message ||
      errorData?.error ||
      response.statusText ||
      `Request failed with status ${response.status}`
    const errors = errorData?.errors

    throw new ApiError(response.status, message, errors)
  }

  if (response.status === 204) {
    return null as T
  }

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
