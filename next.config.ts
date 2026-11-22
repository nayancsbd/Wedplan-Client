import type { NextConfig } from "next"

const apiUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" || process.env.VERCEL
    ? "https://wedplan-server-nayanbddm.vercel.app"
    : "http://localhost:5001")

const cleanApiUrl = apiUrl
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/health$/, "")
  .replace(/\/api$/, "")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "*.ibb.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
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
