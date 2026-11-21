# WedPlan - A Wedding Planning Platform

WedPlan is a full-featured, role-based wedding planning platform inspired by The Knot and Zola. It connects couples planning their special day with verified wedding service vendors across photography, venues, catering, floral design, styling, and bridal fashion, overseen by an administrative moderation dashboard.

---

## Important Features

### Role-Based Portals & Authentication
- Three dedicated roles: **Customer**, **Vendor**, and **Admin**.
- Secure authentication powered by Better Auth with session cookies and JWT Bearer token fallback.
- Client-side token cache with automatic single-flight 401 refresh queue and seamless redirect to sign-in on expiration.
- Google OAuth 2.0 social login alongside email/password credentials.

### Public Directory & Advanced Service Search
- Search bar with debounced 350ms input, synchronized with browser URL parameters.
- Combined multi-criteria filtering: keyword search, category selector, location selector, and sorting.
- Price sorting: **Price: Low to High** (`price_asc`), **Price: High to Low** (`price_desc`), **Newest Listings** (`newest`), and **Highest Rated** (`rating`).
- Active filter badges with one-click individual dismissal and a "Clear all filters" CTA.
- Responsive service cards featuring cover images, price range, location badges, vendor badges, and rating stars.
- Dedicated service detail pages (`/services/[id]`) with image galleries, inclusions list, vendor profile, and interactive booking modal.

### Customer Dashboard
- **Overview**: Real-time KPI statistics for Total Booking Requests, Pending Inquiries, Accepted Bookings, and Rejected Bookings.
- **My Bookings**: Filterable list with service thumbnail, vendor details, scheduled event date, event location, status badge, and request timestamp.
- **Booking Actions**: View details dialog with complete message thread and cancellation confirmation dialog (available for pending bookings).
- **Profile Settings**: Edit full name, profile image (ImgBB upload), phone number, and personal bio.

### Vendor Workspace
- **Package Builder (`/dashboard/vendor/services/new`)**:
  - Multi-image upload to ImgBB (up to 5 photos).
  - Pre-upload and post-upload deduplication preventing repeated images.
  - Image preview controls: **Fill** (`object-cover`) vs. **Fit Whole Photo** (`object-contain`) for non-4:3 and cropped images.
  - Full-resolution photo inspection modal dialog.
  - Category mapping adhering to the server enum.
  - Client-side and server-side validation enforcing listing limits.
- **Service Listings Manager**:
  - Live marketplace availability toggle (**Active** vs. **Paused**) without page reload.
  - In-place service package editing dialog.
  - Delete package confirmation dialog with active booking checks.
- **Booking Requests**:
  - Review incoming customer inquiries with event details and customized messages.
  - Accept or reject requests with immediate status badge updates.
- **Subscription Management (`/dashboard/vendor/subscription`)**:
  - Comparison of Free (up to 3 active listings) vs. Featured Pro Premium (unlimited listings, priority directory placement).
  - Stripe Checkout session integration with redirect.
  - Polled verification flow on `/payment/success` confirming database activation.
  - Cancel and retry flow on `/payment/cancel`.
  - Vendor transaction history log.

### Admin Moderation Panel
- **Overview Metrics**: Total registered users, vendors, customers, total services, pending service approvals, and platform transactions.
- **Manage Users**: Searchable table with role filtering, pagination, user details modal, and Block/Unblock actions (admins protected).
- **Service Moderation**: Filter by status and category; Approve, Reject, or Delete listings with pending services highlighted.
- **Transaction Logs**: Read-only financial ledger displaying vendor info, subscription plan, amount, currency, status, and creation date.

### Design & User Experience
- Elegant wedding palette: soft ivory and blush backgrounds, rose-gold accents, deep charcoal typography.
- Typography: Playfair Display serif headings paired with Inter sans-serif body.
- Subtle Framer Motion page entrance transitions and staggered cards.
- Toast notifications via Sonner across all user feedback channels (zero browser `alert()` calls).
- Responsive layout across mobile (360px), tablet (768px), and desktop (1280px+).
- Custom 404 Not Found page, 403 Access Denied view, and global error boundaries.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS, ShadCN UI, Radix UI primitives
- **Animations**: Framer Motion (`motion`)
- **Form Management**: React Hook Form + Zod validation resolvers
- **Authentication**: Better Auth with JWT plugin
- **Payments**: Stripe Checkout (Test Mode)
- **Image Uploads**: ImgBB API
- **Icons**: Lucide React
- **Notifications**: Sonner

---

## Repository Links & Live Application

- **Client Repository**: [https://github.com/nayancsbd/wedplan-client](https://github.com/nayancsbd/wedplan-client)
- **Server Repository**: [https://github.com/nayancsbd/wedplan-server](https://github.com/nayancsbd/wedplan-server)

---

## Environment Variables

The client requires the following environment variables configured in `.env.local` for development or in Vercel Project Settings for production:


The repository contains a committed `.env.example` file. All sensitive `.env` files are ignored by git.

---

## Installation & Local Development

### 1. Prerequisites
- Node.js 18.18.0 or higher
- npm 9+ (or pnpm / yarn)
- Running instance of the WedPlan Express server (`wedplan-server`) on port 5001

### 2. Clone the Repository
```bash
git clone https://github.com/nayancsbd/wedplan-client.git
cd wedplan-client
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
```bash
cp .env.example .env
```
Ensure `API_URL` points to your backend instance:
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

### 6. Verification Commands
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Vercel Deployment & Rewrites Proxy

### Rewrites Proxy Architecture
To avoid CORS issues and allow secure cookie forwarding between client and server across different domains, Next.js acts as a reverse proxy in `next.config.ts`:

- Any request originating from the browser to `/api/:path*` is proxied server-side to `${API_URL}/api/:path*`.
- Better Auth sessions and cookies (`better-auth.session_token`, `__Secure-better-auth.session_token`) attach to the same origin, preventing cross-site cookie blocking.

### Production Route Reloading Guarantee
- All Next.js routes, including dynamic routes like `/services/[id]` and dashboard subroutes (`/dashboard/vendor/services`, `/dashboard/customer/bookings`), are rendered via the App Router.
- In `proxy.ts`, protected route checks inspect session cookies and allow legitimate browser refreshes to load without 404 or 504 errors.
- Dynamic route data fetching implements graceful fallbacks, loading skeletons, and retry controls if the backend undergoes temporary cold starts.

---

## Vercel + Google OAuth Redirect URI Checklist

When configuring Google OAuth credentials in the Google Cloud Console for production on Vercel:

1. **Google Cloud Console Setup**:
   - Go to **APIs & Services > Credentials**.
   - Select your **OAuth 2.0 Client ID**.
2. **Authorized JavaScript Origins**:
   -  (Local development)
   -  (Your production Vercel domain)
   -  (If using a custom domain)
3. **Authorized Redirect URIs**:
   -  (Proxied locally)
   -  (Direct server locally)
   -  (Production client domain via proxy)
   -  (Production server direct)
4. **Backend Environment Variables**:
   - Update `CLIENT_URL` in the server environment to your Vercel URL ().
   - Update `BETTER_AUTH_URL` to the production backend URL ().
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## Stripe Webhook Registration Checklist

When configuring Stripe Checkout subscriptions for production:

1. **Stripe Dashboard Setup**:
   - Go to **Developers > Webhooks** in the Stripe Dashboard (Test or Live mode).
   - Click **Add an endpoint**.
2. **Endpoint URL**:
   - URL: 
   - Alternatively, if proxying through Vercel: 
3. **Select Events to Listen For**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. **Environment Variables**:
   - Copy the **Signing secret** (`whsec_...`) into your backend environment as `STRIPE_WEBHOOK_SECRET`.
   - Set `STRIPE_SECRET_KEY` (`sk_test_...` or `sk_live_...`).
   - Set `STRIPE_PREMIUM_PRICE_ID` (`price_...`).
5. **Verify Webhook Delivery**:
   - Run a test checkout session on `/dashboard/vendor/subscription`.
   - In Stripe Dashboard, inspect the webhook delivery logs and confirm an HTTP `200 OK` response.
