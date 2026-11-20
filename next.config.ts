import type { NextConfig } from "next"

const apiUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001"

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
