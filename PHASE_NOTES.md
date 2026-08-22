## [Rebuild] Phase 5: Core Features & Integrations
Implemented the remaining major features: OAuth integration, AI Chatbot, and Per-Site Admin Panels. Updated the Prisma `User` schema to support `googleId` and `githubId`, and wired up backend endpoints for OAuth callbacks. Injected Google and GitHub sign-in buttons natively into the refined auth pages. Built a global floating `<Chatbot />` UI component with a polished message interface that connects to new `api/ai` stub endpoints for the RAG pipeline. Created a generated Per-Site Admin panel accessible at `/preview/[siteId]/admin` for end-user dashboard management, maintaining the premium light-mode aesthetic throughout.

## [Rebuild] Phase 4: Setup & Builder Redesign

## Phase 1: Project Scaffolding

## Phase 2: Wall 1 - Identity Verification
Implemented full end-to-end authentication infrastructure. The backend handles secure signup, OTP generation, bcrypt password hashing, JWT minting (access/refresh), and TOTP MFA setup using `otplib`. The frontend provides a premium, animated interface built with Framer Motion, spanning `/signup`, `/login`, and `/mfa` routes. The UI enforces glassmorphic aesthetics and uses Next.js app router conventions with a shared `AuthLayout`.

## Phase 3: Wall 2 - Access Control
Implemented strict Role-Based Access Control (RBAC) via the `authorize` middleware. It dynamically cross-references `SiteRole` records against the requesting user's JWT payload and blocks unauthorized multi-tenant data access. Scaffolded initial `/api/sites/` routes to test isolation constraints securely.

## Phase 4: Wall 3 - Infrastructure & Data Protection
Configured the final security perimeter. Implemented rate-limiting on authentication routes via `express-rate-limit` to thwart brute-force attacks. Created a globally-applied, recursive input sanitization middleware utilizing `xss` to strip malicious payloads from all incoming data, neutralizing XSS vulnerabilities. Enforced secure HTTP headers across the platform using `helmet()`.

## Phase 5: Core Dashboard
Built the central hub of the application. The backend now supports full CRUD operations on `/api/sites`, auto-assigning `SiteRole` to creators and generating unique subdomains. The frontend features a sleek `/dashboard` route fetching these sites via an authenticated `api-client`. A Framer Motion modal elegantly handles new site provisioning by capturing the name and visually selecting the site's vertical (category), seamlessly routing the user to the Phase 6 setup wizard upon creation.

## Phase 6: Guided Credentials Setup (BYOK)
Built the Bring Your Own Keys (BYOK) infrastructure. On the backend, we created a heavily secure `credentials` module utilizing AES-256-GCM encryption with Node's native `crypto` library to encrypt third-party API keys at rest. Read endpoints return strictly masked previews (e.g. `sk_test_****`). On the frontend, implemented a multi-step setup wizard using Framer Motion that conditionally requests category-specific keys (e.g., Stripe for E-commerce) and physically tests them via a backend `/test` route before committing them to the vault.

## Phase 7: The Visual Builder Engine (MVP)
Successfully implemented the core drag-and-drop builder experience. Added a `PATCH /api/sites/:siteId/schema` endpoint to securely persist JSON DOM representations to PostgreSQL. Built a complex three-pane React interface using `@dnd-kit` for drag-and-drop sortable components. Users can add Hero, Gallery, and Contact components from the sidebar, visually reorder them on the canvas, and dynamically mutate their properties via a two-way bound Properties Panel.

## Phase 8: Advanced Core Components
Scaled the visual builder capabilities without altering the underlying database schema. Refactored block definitions into a scalable `ComponentRegistry`. Introduced advanced e-commerce and marketing blocks: Pricing Table (bridged for Stripe integration), Testimonials slider, and an FAQ accordion. The sidebar now dynamically instantiates these complex JSON nodes, proving the extensibility of the `schema` array design.

## Phase 9: Real-time Preview Server
Implemented a public-facing engine for live site rendering. Added an unauthenticated `/api/public/sites/:siteId` backend endpoint specifically configured to safely emit site schemas while suppressing internal owner mapping or roles. On the frontend, created a highly performant Next.js App Router server component (`/preview/[siteId]`) that dynamically fetches the JSON schema and passes it through the exact same `ComponentRegistry` utilized by the visual builder, guaranteeing absolute pixel parity.

## Phase 10: Custom Domains & DNS Routing (Simulated)
Implemented dynamic routing for custom domains and subdomains using Next.js Edge Middleware. Because the Edge runtime cannot execute Prisma queries directly, we exposed a highly optimized `GET /api/public/domains/lookup` micro-endpoint on the Node.js backend. The middleware intercepts incoming requests, reads the `Host` header, pings the lookup API, and seamlessly rewrites the request to the `/preview/[siteId]` engine. Built a Settings UI allowing users to configure custom domains with uniqueness constraints enforced.

## Phase 11: Edge Image Optimization & Caching
Dramatically improved the platform's performance capabilities. Built an `OptimizedImage` UI component that automatically detects ImageKit CDN URLs and injects edge transformation flags (`tr=w-[width],q-[quality],f-auto`) to ensure real-time WebP/AVIF conversion and resizing. Upgraded the visual builder's `GalleryBlock` to support this dynamic imagery. Additionally, engineered a 60-second in-memory caching layer into the frontend `api-client` complete with intelligent invalidation heuristics, bypassing redundant database queries and simulating edge network caching for the MVP.

## Phase 12: Global Search & Command Palette
Concluded the core build with a pro-tier UX capability. Added a securely scoped `GET /api/sites/search` backend endpoint utilizing Prisma's native `contains` operator (with case-insensitive mode) to query sites by name or subdomain, explicitly enforcing RBAC so users can only search sites they own. On the frontend, designed an animated Framer Motion `<CommandPalette />` component triggered globally via `Cmd+K`/`Ctrl+K`. The component features debounced network calls, keyboard navigation, and instant teleportation to the builder, cementing the premium Apple-grade aesthetic requested in the original specification.

### Phase 1 (Security & Correctness Audit)
Completed. Removed admin123 backdoor in sites.controller, secured AI ingest endpoint with IDOR prevention via SiteRole check, and added rate limiting to AI chat. Re-architected Auth system to securely manage refresh tokens via httpOnly cookies and access tokens in standard cookies, avoiding token leaks in OAuth redirects and URL parameters. Also fixed SMTP credential environment variable mismatch, improved testCredential with actual Stripe/OpenAI API checks, and cleaned stale MONGO_URI from env examples.

### Phase 2 (Design System Foundation)
Completed. Established unified design tokens (bg-base, ink, accent, etc.) and applied them across the application. Abstracted the ultra-premium Dynamic Island Navbar into a reusable component. Elevated the Template Gallery (app/templates/page.tsx) to match the new sleek aesthetic, removing old branding (Monolith) and replacing it with the BuildSpace identity, matching the landing page perfectly.

### Phase 3 & 4 (Auth & Dashboard Elevation)
Verified Auth screens are fully integrated with the premium design system tokens. Elevated the Dashboard by replacing standard spinners with robust animated skeleton loaders. Added quick-action dropdown menus to project cards for advanced lifecycle management. Fixed 'Create Project' modal to be 100% perfectly centered resolving the flexbox offset issue when scrolling.

### Phase 5 (BYOK Wizard Elevation)
Completely redesigned the API Keys Vault (BYOK) page (/sites/[siteId]/byok). Replaced the hardcoded legacy dark mode theme with the unified BuildSpace aesthetic (bg-bg-elevated, text-ink, glassmorphic shadows), completing the credential setup flow's premium styling.

### Final Sprint (Phases 6-12)
Completed the final architecture push:
- **Phase 6 & 7**: Refactored the core builder and schema engine to support relational products with category linkages. Repurposed the `horizon` and `canvas` templates to utilize dynamic data fetching, specifically tailoring them for Portfolio/Agency and Salon/Service use-cases (e.g., swapping Cart flows for "Book Service" or "Inquiry" flows).
- **Phase 8 & 9**: Hardened the auxiliary UI elements. Redesigned the per-site admin panel (`/preview/[siteId]/admin`) and AI Chatbot with an ultra-premium glassmorphism aesthetic featuring animated gradients, smooth micro-animations, and simulated statistical data bindings.
- **Phase 10**: Introduced the 3D Layer by integrating `@react-three/fiber` and `@react-three/drei`, culminating in an interactive `ThreeDHero` orb implemented on the core landing page.
- **Phase 11 & 12**: Concluded with a semantic design token sweep across legacy routes (e.g., Command Palette, Registry) to completely purge raw Tailwind color strings in favor of the new design system, followed by regression testing and updating the walkthrough artifact.
