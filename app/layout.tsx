import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "WedPlan - Wedding Planning Platform",
  description:
    "Role-based wedding planning platform connecting couples, vendors, and coordinators.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", inter.variable, playfair.variable, "font-sans")}
    >
      <body className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
