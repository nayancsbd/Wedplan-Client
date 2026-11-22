# WedPlan - A Wedding Planning Platform 

WedPlan is a full-featured, role-based wedding planning web application inspired by The Knot and Zola. It connects couples planning their wedding with verified vendors across photography, venues, catering, decoration and floral styling, makeup artistry, and bridal fashion, overseen by a centralized administrative moderation system.

---

## Repositories
- **Live Demo**: [https://wedplan-client-nayanbddm.vercel.app](https://wedplan-client-nayanbddm.vercel.app)
- **Client Repository**: [https://github.com/nayancsbd/Wedplan-Client](https://github.com/nayancsbd/Wedplan-Client)
- **Server Repository**: [https://github.com/nayancsbd/Wedplan-Server](https://github.com/nayancsbd/Wedplan-Server)

---

## Core Features

### 1. Role-Based Portals & Authentication
- **Three Distinct Roles**: Dedicated access models for Customer, Vendor, and Admin users.
- **Authentication**: Powered by Better Auth with session cookies and JWT Bearer token fallback.
- **Google OAuth 2.0 & Credentials**: Seamless one-click Google login alongside traditional email and password authentication.
- **Automatic Token Refresh**: Client-side authentication client with single-flight 401 refresh queue and automated redirects to sign-in on session expiration.
- **Role-Adaptive Navigation**: Navbar dynamically renders direct dashboard action buttons (`Customer Dashboard`, `Vendor Dashboard`, or `Admin Dashboard`) based on the authenticated session.

### 2. Public Marketplace & Advanced Service Search
- **Search with Debounce**: Real-time keyword search bar debounced at 350ms and synchronized with browser URL parameters.
- **Multi-Criteria Filtering**: Filter listings simultaneously by search keywords, wedding service category, location, and sorting criteria.
- **Dynamic Sorting Options**:
  - Price: Low to High (`price_asc`)
  - Price: High to Low (`price_desc`)
  - Newest Listings (`newest`)
  - Highest Rated (`rating`)
- **Active Filter Chips**: Interactive filter chips with one-click individual dismissal and a global "Clear all filters" control.
- **Detailed Service Pages (`/services/[id]`)**: Full-width hero gallery, structured service inclusions, vendor profile card, interactive booking modal, and customer reviews.
- **Curated Category Directory**: Visual cards for the 6 core dimensions of wedding planning with interactive zoom transitions and direct filter links.
- **Success Stories (`/success-stories`)**: Showcase of real couple celebrations with wedding testimonials, vendor highlights, and photo galleries.

### 3. Customer Dashboard (`/dashboard/customer`)
- **Overview Dashboard**: Real-time KPI statistics tracking Total Requests, Pending Inquiries, Confirmed Bookings, and Cancelled/Rejected Bookings.
- **My Bookings (`/dashboard/customer/bookings`)**: Comprehensive booking tracker with vendor details, event date, venue location, price, and current status badges (`pending`, `accepted`, `rejected`, `cancelled`).
- **Interactive Booking Actions**: Modal dialog to inspect full booking details and an atomic confirmation dialog to cancel pending requests.
- **Profile Settings (`/dashboard/customer/profile`)**: Manage personal details, phone number, bio, and upload custom avatars via ImgBB.

### 4. Vendor Workspace (`/dashboard/vendor`)
- **Package Builder (`/dashboard/vendor/services/new`)**:
  - Multi-image upload to ImgBB (up to 5 photos per service package).
  - Pre-upload and post-upload image deduplication.
  - Image aspect ratio preview switcher (`Fill` vs. `Fit Whole Photo`).
  - Fullscreen photo inspection modal.
  - Category selector adhering to platform standards.
  - Inclusions tag builder and custom pricing input.
- **Listing Limit & Tier Enforcement**:
  - Free tier vendors are limited to a maximum of 3 active listings.
  - Automated prompts to upgrade to Featured Pro when listing limits are reached.
- **Service Listings Manager (`/dashboard/vendor/services`)**:
  - Instant live availability toggle (`Active` vs. `Paused`) without full page reloads.
  - In-place package editor dialog.
  - Deletion confirmation dialog protected by active booking checks.
- **Booking Requests (`/dashboard/vendor/booking-requests`)**:
  - Real-time inquiry feed with customer contact info, event date, and custom notes.
  - One-click Accept and Reject controls with status updates.
- **Subscription Management (`/dashboard/vendor/subscription`)**:
  - Comparison of Free plan vs. Featured Pro plan (unlimited listings and priority directory ranking).
  - Stripe Checkout session integration with automatic checkout redirects.
  - Verification polling on `/payment/success` ensuring database plan activation.
  - Cancel and recovery handler on `/payment/cancel`.
  - Vendor transaction history ledger.

### 5. Admin Moderation Suite (`/dashboard/admin`)
- **System Overview**: Platform-wide metrics showing total registered users, customer count, vendor count, approved services, pending review queue, and revenue.
- **User Management (`/dashboard/admin/users`)**: Searchable user table with role filters, pagination, user details modal, and instant Block/Unblock actions (admins are protected from self-blocking).
- **Service Moderation (`/dashboard/admin/services`)**: Dedicated moderation tabs (`Pending Review`, `Approved`, `Rejected`) with one-click Approve, Reject, and Delete actions.
- **Transaction Audit Log (`/dashboard/admin/transactions`)**: Read-only financial ledger displaying vendor profile, subscription plan, amount, currency, payment status, and timestamp.
- **Admin Profile (`/dashboard/admin/profile`)**: Update administrative profile information.

### 6. Design & User Experience
- **Theme Palette**: Soft ivory and blush backgrounds, dusty-rose/rose-gold primary accents, and deep charcoal body text.
- **Typography**: Playfair Display serif headings paired with Inter clean sans-serif body text.
- **Animations**: Fluid Framer Motion entrance effects, layout transitions, and hover states.
- **Toast Notifications**: Comprehensive user feedback via Sonner with zero browser `alert()` popups.
- **Responsive Layout**: Designed for mobile screens (360px+), tablets (768px+), and high-resolution desktops (1440px+).
- **Error Handling**: Custom 404 page, role-based 403 Access Denied view with redirection buttons, and global React error boundaries.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS, ShadCN UI, Radix UI
- **Animations**: Framer Motion (`motion`)
- **Forms & Validation**: React Hook Form, Zod
- **Authentication**: Better Auth (Session Cookies + JWT Plugin)
- **Payments**: Stripe Checkout (Test Mode)
- **Image Hosting**: ImgBB API via secure proxy
- **Icons**: Lucide React
- **Notifications**: Sonner

---

## Environment Variables

Configure the following environment variables in `.env` or `.env.local` for development and in your Vercel Project Settings for production:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical URL of the frontend application. | `http://localhost:3000` |
| `API_URL` | Yes | Backend server URL used by Next.js server-side proxy rewrites. | `http://localhost:5001` |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL accessible from the client browser. | `http://localhost:5001/api` |

The repository contains a committed `.env.example` file. All `.env` and `.env.local` files containing real secrets are strictly ignored by Git.

---

## Installation & Local Development

### 1. Prerequisites
- Node.js 18.18.0 or higher (Node 20+ recommended)
- npm 9+ (or pnpm / yarn)
- Running instance of the WedPlan Express backend (`wedplan-server`) on port 5001

### 2. Clone the Repository
```bash
git clone https://github.com/nayancsbd/Wedplan-Client.git
cd Wedplan-Client
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
```bash
cp .env.example .env
```
Ensure the API URLs match your running backend instance:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build and Verification
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Production Deployment & Proxy Architecture

### Rewrites Proxy Architecture
To prevent third-party cookie restrictions and cross-origin resource sharing (CORS) issues across different deployment domains, Next.js acts as a reverse proxy in `next.config.ts`:

- Any browser request to `/api/:path*` is proxied server-side to `${API_URL}/api/:path*`.
- Better Auth session cookies (`better-auth.session_token`, `__Secure-better-auth.session_token`) remain first-party to the frontend domain, ensuring seamless authentication in modern browsers with strict cookie policies.

### Production Route Reloading Guarantee
- All Next.js routes, including dynamic routes like `/services/[id]` and nested dashboard paths (`/dashboard/vendor/services`, `/dashboard/customer/bookings`), are fully supported by the Next.js App Router.
- In `proxy.ts`, protected route guards inspect session cookies and allow legitimate browser page reloads without producing 404 or 504 errors.
- Asynchronous data fetchers implement graceful error states, loading skeletons, and retry mechanisms.

---

## Google Cloud Console OAuth 2.0 Setup

When configuring Google OAuth credentials for development and production:

1. **Google Cloud Console**: Navigate to **APIs & Services > Credentials** and select your OAuth 2.0 Client ID.
2. **Authorized JavaScript Origins**:
   - `http://localhost:3000` (Local development)
   - `https://your-production-app.vercel.app` (Production client domain)
3. **Authorized Redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (Proxied locally)
   - `http://localhost:5001/api/auth/callback/google` (Direct server locally)
   - `https://your-production-app.vercel.app/api/auth/callback/google` (Production client domain via proxy)
   - `https://your-production-api.com/api/auth/callback/google` (Production server direct)
4. **Backend Sync**: Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in the backend environment.

---

## Stripe Webhook Setup

When configuring Stripe Checkout subscriptions:

1. **Stripe Dashboard**: Navigate to **Developers > Webhooks** (Test mode or Live mode).
2. **Endpoint URL**:
   - Local testing via Stripe CLI:
     ```bash
     stripe listen --forward-to localhost:5001/api/webhooks/stripe
     ```
   - Production endpoint:
     ```
     https://your-production-api.com/api/webhooks/stripe
     ```
3. **Events to Listen For**:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `checkout.session.expired`
4. **Webhook Secret**: Assign the signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET` in the backend environment.

---

## Submission & Test Instructions

### Seeded Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin680970@wedplan.com` | Configured via server seed |
| **Vendor (Free)** | Register via `/signup` with role **Vendor** | Any valid 8+ char password |
| **Customer** | Register via `/signup` with role **Customer** | Any valid 8+ char password |

### Verification Scenarios

1. **Customer Flow**:
   - Browse listings on `/services`, use the debounced search bar, apply category and location filters, and change sort order.
   - Click a service card to view package details on `/services/[id]`.
   - Click **Book This Service**; note that optional special requests can be left blank.
   - Navigate to `/dashboard/customer/bookings` to inspect the submitted booking.
   - Cancel the pending booking and confirm the status badge updates to `cancelled`.

2. **Vendor Flow**:
   - Log in as a Vendor and navigate to `/dashboard/vendor/services/new`.
   - Upload photos to ImgBB, toggle between `Fill` and `Fit Whole Photo`, and inspect the photo preview dialog.
   - Publish up to 3 services; attempting a 4th service triggers the Featured Pro upgrade prompt.
   - Go to `/dashboard/vendor/subscription`, click **Upgrade to Featured Pro**, complete the Stripe test checkout (card `4242 4242 4242 4242`), and observe instant plan activation.
   - Review incoming booking inquiries on `/dashboard/vendor/booking-requests` and test the **Accept** and **Reject** buttons.

3. **Admin Flow**:
   - Log in with the administrative credentials.
   - Go to `/dashboard/admin/services` and inspect pending listings; approve or reject them and observe instant directory updates.
   - Go to `/dashboard/admin/users`, search by name or email, and test the **Block/Unblock** toggles.
   - Visit `/dashboard/admin/transactions` to inspect the read-only Stripe payment ledger.

4. **Security & Route Guard Checks**:
   - Attempt to manually access `/dashboard/admin` while logged in as a Customer; verify that the application renders the 403 Access Denied view with convenient return buttons.
   - Perform full-page reloads on any nested dashboard route (`/dashboard/customer/bookings`, `/dashboard/vendor/services`); verify the session persists without 404 or 504 errors.
