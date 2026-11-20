import type { NextConfig } from "next"

const apiUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

// Strip trailing slash and/or /api suffix so destination resolves cleanly to ${cleanApiUrl}/api/:path*
const cleanApiUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "")

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${cleanApiUrl}/api/:path*`,
      },
    ]
  },
  devIndicators: false,
}

export default nextConfig
