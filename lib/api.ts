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

  constructor(status: number, message: unknown, errors?: unknown) {
    const cleanMessage =
      typeof message === "string" && message.trim()
        ? message.trim()
        : message && typeof message === "object"
        ? (message as { message?: string }).message ||
          (message as { error?: string }).error ||
          JSON.stringify(message)
        : String(message || "An unexpected error occurred")
    super(cleanMessage)
    this.name = "ApiError"
    this.status = status
    this.success = false
    this.errors = errors
  }
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback
  if (typeof data === "string" && data.trim()) return data.trim()
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message.trim()
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim()
    if (obj.error && typeof obj.error === "object") {
      const nested = obj.error as Record<string, unknown>
      if (typeof nested.message === "string" && nested.message.trim()) return nested.message.trim()
    }
    if (obj.message && typeof obj.message === "object") {
      const nested = obj.message as Record<string, unknown>
      if (typeof nested.message === "string" && nested.message.trim()) return nested.message.trim()
    }
    try {
      return JSON.stringify(data)
    } catch {
      return fallback
    }
  }
  return String(data)
}

interface TokenCache {
  token: string
  expiresAt: number
}

let memoryTokenCache: TokenCache | null = null
const CACHE_TTL_MS = 15 * 60 * 1000
let refreshPromise: Promise<string | null> | null = null

export function setAuthToken(token: string, ttlMs = CACHE_TTL_MS): void {
  if (!token || typeof token !== "string") return
  memoryTokenCache = {
    token,
    expiresAt: Date.now() + ttlMs,
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("wedplan_jwt_token", token)
    } catch {
    }
  }
}

export function clearTokenCache(): void {
  memoryTokenCache = null
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("wedplan_jwt_token")
    } catch {
    }
  }
}

interface TokenClientResponse {
  data?: {
    token?: string
  }
  token?: string
}

export async function refreshAuthToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      clearTokenCache()

      const tokenRes = await fetch("/api/auth/token", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
      }).catch(() => null)

      if (tokenRes && tokenRes.ok) {
        const json = (await tokenRes.json().catch(() => null)) as
          | { token?: string; data?: { token?: string } }
          | null
        const token = json?.token || json?.data?.token
        if (token && typeof token === "string") {
          setAuthToken(token)
          return token
        }
      }

      try {
        const clientWithToken = authClient as unknown as {
          token?: () => Promise<TokenClientResponse | string>
        }
        if (typeof clientWithToken?.token === "function") {
          const clientRes = await clientWithToken.token()
          let token: string | null = null
          if (typeof clientRes === "string") {
            token = clientRes
          } else if (clientRes && typeof clientRes === "object") {
            token = clientRes.data?.token || clientRes.token || null
          }
          if (token) {
            setAuthToken(token)
            return token
          }
        }
      } catch {
      }

      const sessionRes = await fetch("/api/auth/get-session", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      }).catch(() => null)

      if (sessionRes && sessionRes.ok) {
        const sessionJson = (await sessionRes.json().catch(() => null)) as Record<string, unknown> | null
        const sessionToken = (
          (sessionJson?.session as Record<string, unknown>)?.token ||
          sessionJson?.token ||
          (sessionJson?.data as Record<string, unknown>)?.token
        ) as string | undefined

        if (sessionToken && typeof sessionToken === "string") {
          setAuthToken(sessionToken)
          return sessionToken
        }
      }

      const refreshEndpointRes = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      }).catch(() => null)

      if (refreshEndpointRes && refreshEndpointRes.ok) {
        const refreshJson = (await refreshEndpointRes.json().catch(() => null)) as Record<string, unknown> | null
        const refToken = (
          refreshJson?.token ||
          refreshJson?.accessToken ||
          (refreshJson?.data as Record<string, unknown>)?.token
        ) as string | undefined

        if (refToken && typeof refToken === "string") {
          setAuthToken(refToken)
          return refToken
        }
      }
    } catch {
    } finally {
      refreshPromise = null
    }

    return null
  })()

  return refreshPromise
}

export async function getAuthToken(): Promise<string | null> {
  const now = Date.now()
  if (memoryTokenCache && memoryTokenCache.expiresAt > now) {
    return memoryTokenCache.token
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("wedplan_jwt_token")
      if (stored && typeof stored === "string" && stored.trim().length > 0) {
        memoryTokenCache = {
          token: stored.trim(),
          expiresAt: now + CACHE_TTL_MS,
        }
        return memoryTokenCache.token
      }
    } catch {
    }
  }

  return null
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  skipAuth?: boolean
  _isRetry?: boolean
}

function redirectToSignIn(): void {
  if (typeof window === "undefined") return
  const pathname = window.location.pathname
  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname === "/" ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact")
  ) {
    return
  }

  const currentPath = pathname + window.location.search
  const redirectTarget =
    currentPath && currentPath !== "/"
      ? `/signin?callbackUrl=${encodeURIComponent(currentPath)}`
      : "/signin"

  window.location.replace(`${window.location.origin}${redirectTarget}`)
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, headers = {}, skipAuth = false, _isRetry = false, ...customConfig } = options

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
    credentials: customConfig.credentials ?? "include",
  })

  if (response.status === 401) {
    clearTokenCache()

    if (!_isRetry) {
      const freshToken = await refreshAuthToken()
      if (freshToken) {
        reqHeaders.set("Authorization", `Bearer ${freshToken}`)
        return apiFetch<T>(endpoint, {
          ...options,
          _isRetry: true,
          headers: reqHeaders,
        })
      }
    }

    let errorData: unknown = null
    try {
      errorData = await response.json()
    } catch {
    }

    const message = extractErrorMessage(
      errorData,
      "Session expired. Please sign in to continue."
    )
    const errors = (errorData as ApiErrorPayload | null)?.errors

    if (!skipAuth) {
      redirectToSignIn()
    }

    throw new ApiError(401, message, errors)
  }

  if (response.status === 403) {
    let errorData: unknown = null
    try {
      errorData = await response.json()
    } catch {
    }

    const message = extractErrorMessage(
      errorData,
      "Access Denied: You do not have permission to view this resource or perform this action."
    )
    const errors = (errorData as ApiErrorPayload | null)?.errors

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
    let errorData: unknown = null
    try {
      errorData = await response.json()
    } catch {
    }

    const message = extractErrorMessage(
      errorData,
      response.statusText || `Request failed with status ${response.status}`
    )
    const errors = (errorData as ApiErrorPayload | null)?.errors

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

let interceptorInstalled = false

export function installFetchInterceptor(): void {
  if (typeof window === "undefined" || interceptorInstalled) return
  interceptorInstalled = true

  const originalFetch = window.fetch

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url

    const isApiRequest = urlString.startsWith("/api/") || urlString.includes("/api/")

    const isAuthBypass =
      urlString.includes("/api/auth/") ||
      urlString.includes("/api/auth") ||
      urlString.includes("/api/health")

    const isPublicService =
      (urlString.startsWith("/api/services") || urlString.includes("/api/services")) &&
      (!init?.method || init.method.toUpperCase() === "GET")

    if (!isApiRequest || isAuthBypass || isPublicService) {
      return originalFetch(input, init)
    }

    const reqHeaders = new Headers(
      init?.headers || (typeof input === "object" && !(input instanceof URL) ? input.headers : undefined)
    )

    if (!reqHeaders.has("Authorization")) {
      const token = await getAuthToken()
      if (token) {
        reqHeaders.set("Authorization", `Bearer ${token}`)
      }
    }

    const modifiedInit: RequestInit = {
      ...init,
      headers: reqHeaders,
      credentials: init?.credentials ?? "include",
    }

    let response = await originalFetch(input, modifiedInit)

    if (response.status === 401) {
      const isRetry = (init as { _isRetry?: boolean } | undefined)?._isRetry
      if (!isRetry) {
        clearTokenCache()
        const freshToken = await refreshAuthToken()
        if (freshToken) {
          reqHeaders.set("Authorization", `Bearer ${freshToken}`)
          response = await originalFetch(input, {
            ...modifiedInit,
            headers: reqHeaders,
            _isRetry: true,
          } as RequestInit)
        }
      }

      if (response.status === 401) {
        clearTokenCache()
        redirectToSignIn()
      }
    }

    return response
  }
}

if (typeof window !== "undefined") {
  installFetchInterceptor()
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
  getAuthToken,
  setAuthToken,
  refreshAuthToken,
})

export default api
