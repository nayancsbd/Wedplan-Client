import * as React from "react"
import Link from "next/link"
import { Heart, Mail, Phone, Clock } from "lucide-react"

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Services", href: "/services" },
    { label: "Vendor Directory", href: "/services" },
    { label: "Wedding Checklist", href: "/services" },
  ]

  const vendorLinks = [
    { label: "Become a Vendor", href: "/signup" },
    { label: "Vendor Dashboard", href: "/dashboard/vendor" },
    { label: "Success Stories", href: "/success-stories" },
  ]

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Security & Trust", href: "#" },
  ]

  return (
    <footer className="border-t border-border/80 bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Wed<span className="text-primary font-serif">Plan</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              The premier role-based wedding planning platform connecting
              couples with verified vendors, effortless checklist coordination,
              and transparent budget tracking for life&apos;s most memorable day.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="WedPlan on Instagram"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="WedPlan on Facebook"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="WedPlan on Twitter"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              >
                <TwitterIcon className="size-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-serif text-sm font-semibold tracking-wide text-foreground uppercase">
              For Couples
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-serif text-sm font-semibold tracking-wide text-foreground uppercase">
              For Vendors
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {vendorLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-serif text-sm font-semibold tracking-wide text-foreground uppercase">
              Get in Touch
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary shrink-0" />
                <a
                  href="mailto:[EMAIL_ADDRESS]"
                  className="hover:text-primary transition-colors truncate"
                >
                  das680970@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary shrink-0" />
                <a
                  href="tel:+18005559337"
                  className="hover:text-primary transition-colors"
                >
                  +88 016*****804
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs">
                  Mon – Fri: 9:00 AM – 7:00 PM EST
                  <br />
                  Sat: 10:00 AM – 4:00 PM EST
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-1.5">
            &copy; {currentYear} WedPlan Inc. Crafted with{" "}
            <Heart className="size-3 fill-primary text-primary" /> for
            extraordinary weddings.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
