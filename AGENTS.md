You are building WedPlan, a role-based wedding planning platform (similar to
The Knot and Zola). Roles: customer, vendor, admin.
Stack: Next.js (App Router, TypeScript), Tailwind + ShadCN UI, Framer Motion
(package: motion), Express.js (TypeScript), MongoDB (native driver), Better
Auth, Stripe Checkout (test mode), ImgBB for image uploads, react-hook-form +
zod, sonner for toasts.
Hard rules for the whole project:
- Client and server are separate repos. Never put secrets in code. All
secrets (Mongo URI, Better Auth secret/URL, Google OAuth, Stripe secret +
webhook secret + price id, ImgBB key, app URLs, admin seed credentials) come
from environment variables. Always create a committed .env.example with
placeholder values and keep .env in .gitignore.
- Server-side role verification on every protected API. Frontend checks are
only for UX. Never trust user IDs or roles from the client. Return 401 for
unauthenticated and 403 for forbidden. Return 404 for missing records,
400/422 for invalid input, 409 for conflicts.
- Validate all request bodies and params with zod on the server. Centralized
error handler returning JSON { success, message, errors? }.
- Use toast notifications (sonner), never alert(). Show loaders/skeletons for
every async action. Every button and link must work.
- Fully responsive (mobile, tablet, desktop). Professional wedding theme:
soft ivory/blush background, rose-gold or dusty-rose primary, deep charcoal
text, elegant serif headings (e.g. Playfair Display) with a clean sans body
(e.g. Inter).
- Reloading any route in production must not give 404/504 or log the user
out.
- Use the latest official docs for Better Auth, Stripe, and ShadCN. Do not
invent APIs. If unsure, read the docs.
- Write clean, reusable, typed code in small commits with meaningful
messages. Do not commit until I say so. After each task, tell me what to
test.