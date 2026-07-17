# BuildSpace — Full Implementation Spec

> Paste this entire document into Antigravity as the project brief. It is self-contained: tech stack, folder structure, environment variables, data schemas, API endpoints, and a phase-by-phase build plan with acceptance checks. Work top to bottom, phase by phase, and do not skip ahead. After each phase, write a one-paragraph entry to `PHASE_NOTES.md` so context survives across sessions.

---

## 0. Project Summary

**BuildSpace** is a multi-tenant SaaS platform. A user signs up, passes through three-layer security, picks a site category (portfolio / e-commerce / salon / restaurant), enters their own service keys through a guided wizard, builds their site in a drag-and-drop editor (fonts, theme, sections, AI chatbot, a 3D element), publishes it to a live URL, and then manages it going forward through a **separate admin panel auto-generated from that site's own section schema**.

Two flows anchor the entire system — everything you build should map to one of these:

```
Sign up / login → Security gateway (3 walls) → Dashboard → Guided credentials wizard
   → Builder engine → AI + 3D layer → Publish & hosting → Live site
```

```
Publish site → Schema stored → Panel builder reads schema → Owner edits sections → Updates go live
```

---

## 1. Tech Stack (fixed)

| Layer | Choice |
|---|---|
| Frontend | React + Next.js + Tailwind CSS |
| 3D rendering | Three.js via React Three Fiber |
| Backend | Node.js with Express (or NestJS) |
| Relational DB | PostgreSQL (users, accounts, billing, roles, credentials) |
| Document DB | MongoDB (per-site section schemas) |
| Auth | JWT (access + refresh) + Passport.js or NextAuth.js |
| AI | Anthropic or OpenAI API in a RAG pipeline, scoped per site |
| Image hosting | ImageKit (user-supplied keys, see Phase 6) |
| Payments | Stripe or Razorpay (platform billing + optional per-site user keys) |
| Email | Resend or SendGrid |
| Hosting/domains | Vercel/Netlify-style deploy + Cloudflare DNS |

---

## 2. Repository & Folder Structure

```
buildspace/
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/            → Phase 2
│   │   ├── (auth)/signup/           → Phase 2
│   │   ├── (auth)/mfa/              → Phase 2
│   │   ├── dashboard/               → Phase 5
│   │   ├── sites/[siteId]/setup/    → Phase 6 (credentials wizard)
│   │   ├── sites/[siteId]/builder/  → Phase 7 (drag-drop editor)
│   │   ├── sites/[siteId]/admin/    → Phase 11 (schema-driven CMS)
│   │   └── s/[subdomain]/           → published site renderer (Phase 10)
│   ├── components/
│   │   ├── builder/                 (canvas, section editor, theme picker)
│   │   ├── sections/                (one renderer component per section type)
│   │   ├── chatbot/                 → Phase 8
│   │   ├── three/                   → Phase 9 (3D hero component)
│   │   └── wizard/                  → Phase 6 (credential steps)
│   └── lib/api-client.ts
│
├── backend/
│   ├── src/
│   │   ├── auth/                    → Phases 2–4 (signup, login, OAuth, MFA, JWT, RBAC)
│   │   ├── middleware/
│   │   │   ├── authenticate.ts      (validates JWT)
│   │   │   ├── authorize.ts         (checks site_roles for the resource)
│   │   │   ├── rateLimit.ts
│   │   │   └── sanitizeInput.ts
│   │   ├── sites/                   → Phase 5 (CRUD for sites)
│   │   ├── credentials/             → Phase 6 (encrypt/store/test keys)
│   │   ├── schema/                  → Phase 7 (site schema CRUD, draft vs published)
│   │   ├── ai/                      → Phase 8 (RAG pipeline, chatbot endpoint)
│   │   ├── publish/                 → Phase 10 (subdomain + custom domain)
│   │   ├── admin-panel/             → Phase 11 (schema-driven CRUD per section type)
│   │   └── billing/                 → Phase 13 (subscription tiers)
│   ├── prisma/schema.prisma          (PostgreSQL models)
│   └── .env.example
│
└── PHASE_NOTES.md
```

---

## 3. Environment Variables Reference

**Platform-level secrets (`.env` on the server, never per-site):**
```
DATABASE_URL=postgresql://...
MONGO_URI=mongodb://...
JWT_PLATFORM_SECRET=          # signs platform session tokens (separate from each site's own JWT secret)
CREDENTIALS_MASTER_KEY=       # AES-256 key used to encrypt every row in site_credentials
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=
PLATFORM_AI_API_KEY=          # shared AI quota for free-tier sites
PLATFORM_PAYMENT_SECRET_KEY=  # platform's own Stripe/Razorpay account for subscription billing
CLOUDFLARE_API_TOKEN=         # for custom domain DNS automation
```

**Per-site secrets (entered via the Phase 6 wizard, stored encrypted in `site_credentials`, never in a `.env` file):**
```
site.jwt_secret
site.imagekit_public_key
site.imagekit_private_key
site.imagekit_url_endpoint
site.ai_api_key              (optional — falls back to PLATFORM_AI_API_KEY)
site.payment_publishable_key (e-commerce only)
site.payment_secret_key      (e-commerce only)
site.email_service_key       (optional)
```

---

## 4. Data Models

### 4.1 PostgreSQL (Prisma-style)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  mfaSecret     String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  sites         SiteRole[]
}

model Site {
  id           String   @id @default(uuid())
  ownerId      String
  name         String
  category     String   // portfolio | ecommerce | salon | restaurant
  subdomain    String   @unique
  customDomain String?  @unique
  status       String   @default("draft") // draft | published
  createdAt    DateTime @default(now())
  roles        SiteRole[]
  credentials  SiteCredential[]
}

model SiteRole {
  id     String @id @default(uuid())
  siteId String
  userId String
  role   String // owner | editor | viewer
  site   Site   @relation(fields: [siteId], references: [id])
  user   User   @relation(fields: [userId], references: [id])
}

model SiteCredential {
  id            String   @id @default(uuid())
  siteId        String
  keyType       String   // jwt_secret | imagekit_public | imagekit_private | imagekit_url_endpoint
                          // | ai_api_key | payment_publishable_key | payment_secret_key | email_service_key
  encryptedValue String
  maskedPreview  String
  verifiedAt     DateTime?
  updatedAt      DateTime @updatedAt
  site           Site     @relation(fields: [siteId], references: [id])
}
```

### 4.2 MongoDB — site schema document

```json
{
  "siteId": "uuid",
  "status": "draft",
  "version": 4,
  "theme": {
    "font": "Inter",
    "colors": { "primary": "#1F4E5F", "secondary": "#EAF2F4" },
    "layoutWidth": "wide"
  },
  "sections": [
    {
      "id": "sec_01",
      "type": "hero",
      "order": 0,
      "data": { "heading": "Hi, I'm Priya", "subheading": "Product Designer", "ctaText": "View my work" }
    },
    {
      "id": "sec_02",
      "type": "projects",
      "order": 1,
      "data": { "items": [ { "title": "Redesigning a banking app", "image": "...", "link": "..." } ] }
    }
  ]
}
```
Keep a `draft` document and a `published` document per `siteId` (recommended: same collection, `status` field, query the right one depending on builder vs. public renderer vs. admin panel).

### 4.3 Section type → `data` shape reference

| Section type | Category | Key fields in `data` |
|---|---|---|
| `hero` | all | heading, subheading, ctaText, backgroundImage, show3D (bool) |
| `about` | portfolio | bio, photo |
| `projects` | portfolio | items: [{title, description, image, link}] |
| `skills` | portfolio | items: [{name, level}] |
| `resume` | portfolio | fileUrl |
| `product_grid` | ecommerce | products: [{name, price, image, productId}] |
| `product_detail` | ecommerce | productId, description, images, price, stock |
| `cart` | ecommerce | (reads from client-side cart state, no stored data) |
| `checkout` | ecommerce | shippingOptions, taxRate |
| `reviews` | ecommerce | items: [{author, rating, text}] |
| `services` | salon | items: [{name, price, durationMinutes}] |
| `gallery` | salon, restaurant | images: [url] |
| `staff` | salon | items: [{name, role, photo}] |
| `booking` | salon | availableSlots, bookingFormFields |
| `menu` | restaurant | categories: [{name, items: [{name, price, description}]}] |
| `reservations` | restaurant | formFields, maxPartySize |
| `location_hours` | restaurant | address, mapEmbedUrl, hours |
| `contact` | all | email, phone, formFields |

---

## 5. API Endpoint Reference

### Auth (Phases 2–4)
```
POST   /api/auth/signup
POST   /api/auth/verify-otp
POST   /api/auth/login
POST   /api/auth/oauth/google
POST   /api/auth/oauth/github
POST   /api/auth/mfa/enable
POST   /api/auth/mfa/verify
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Sites & Dashboard (Phase 5)
```
GET    /api/sites                    (list current user's sites)
POST   /api/sites                    (create new site: name, category)
GET    /api/sites/:siteId
PATCH  /api/sites/:siteId
DELETE /api/sites/:siteId
POST   /api/sites/:siteId/roles      (invite editor/viewer)
```

### Credentials Wizard (Phase 6)
```
GET    /api/sites/:siteId/credentials              (masked list + which keys are still missing)
POST   /api/sites/:siteId/credentials/generate      (e.g. auto-generate JWT secret)
POST   /api/sites/:siteId/credentials               (save a key: keyType, value)
POST   /api/sites/:siteId/credentials/:keyType/test (test connection before allowing save)
DELETE /api/sites/:siteId/credentials/:keyType      (rotate/remove)
```

### Builder / Schema (Phase 7)
```
GET    /api/sites/:siteId/schema?status=draft
PUT    /api/sites/:siteId/schema            (full schema save, autosave-friendly)
PATCH  /api/sites/:siteId/schema/theme
POST   /api/sites/:siteId/schema/sections
PATCH  /api/sites/:siteId/schema/sections/:sectionId
DELETE /api/sites/:siteId/schema/sections/:sectionId
PATCH  /api/sites/:siteId/schema/sections/reorder
```

### AI Assistant (Phase 8)
```
POST   /api/sites/:siteId/ai/reindex        (re-embed site content, call after publish)
POST   /api/sites/:siteId/ai/chat           (visitor question → grounded answer)
```

### Publish & Hosting (Phase 10)
```
POST   /api/sites/:siteId/publish
POST   /api/sites/:siteId/domain/connect     (stretch: submit custom domain)
GET    /api/sites/:siteId/domain/verify      (stretch: check DNS verification status)
GET    /s/:subdomain                         (public site renderer, reads published schema)
```

### Per-Site Admin Panel (Phase 11)
```
GET    /api/sites/:siteId/admin/schema        (fetch published schema to drive UI generation)
GET    /api/sites/:siteId/admin/sections/:type            (list items, e.g. all services/products)
POST   /api/sites/:siteId/admin/sections/:type            (add item)
PATCH  /api/sites/:siteId/admin/sections/:type/:itemId
DELETE /api/sites/:siteId/admin/sections/:type/:itemId
```

### Billing (Phase 13, post-MVP)
```
GET    /api/billing/plans
POST   /api/billing/subscribe
POST   /api/billing/webhook          (Stripe/Razorpay webhook)
```

---

## 6. Phase-by-Phase Build Plan

### Phase 1 — Project Scaffolding
1. Create the folder structure in Section 2.
2. Set up Next.js + Tailwind, Express/NestJS, Prisma (PostgreSQL), Mongoose (MongoDB).
3. Set up `.env` handling per Section 3 — never hardcode secrets.
4. **Acceptance:** both apps run locally, a health-check route responds, both DBs connect.

### Phase 2 — Wall 1: Identity Verification
1. Implement `/api/auth/signup`, `/api/auth/verify-otp`, `/api/auth/login` with argon2/bcrypt password hashing.
2. Add Google and GitHub OAuth.
3. Add optional TOTP MFA (`/api/auth/mfa/enable`, `/api/auth/mfa/verify`).
4. **Acceptance:** a user can sign up, verify, log in by password or OAuth, and optionally complete MFA.

### Phase 3 — Wall 2: Access Control
1. Issue short-lived access tokens (~15 min) + refresh tokens; implement `/api/auth/refresh` and rotation on use.
2. Implement `SiteRole` (owner/editor/viewer) and the `authorize.ts` middleware — every `/api/sites/:siteId/*` route must pass through it.
3. **Acceptance:** User A's token cannot read or modify User B's site via direct API calls.

### Phase 4 — Wall 3: Infrastructure & Data Protection
1. Add `rateLimit.ts` on auth routes with progressive lockout.
2. Add `sanitizeInput.ts` applied to every section `data` write, and re-escape on render.
3. Confirm all DB access goes through the ORM (no raw concatenated SQL), enforce HTTPS, add CSRF protection on state-changing routes.
4. **Acceptance:** an XSS payload placed in a section field renders as inert text on the published site.

### Phase 5 — Core Dashboard
1. Build `/api/sites` CRUD and the `dashboard/` frontend route.
2. Category picker on site creation.
3. **Acceptance:** a user creates a site of a chosen category and sees it listed.

### Phase 6 — Guided Credentials Setup (BYOK Wizard)
1. Build `sites/[siteId]/setup/` with the step sequence: explain screen → JWT secret (generate or paste) → ImageKit keys (with guided links) → category-conditional keys (payment for e-commerce, email/AI optional for all) → test each → save encrypted.
2. Implement `credentials/` backend module: AES-256 encryption using `CREDENTIALS_MASTER_KEY`, masked previews only in API responses, `/test` endpoints that actually call each external service.
3. Gate Phase 7's image upload and Phase 8's AI features behind a verified key.
4. **Acceptance:** a first-time user completes the wizard using only in-app guidance; an invalid key is rejected by the test step before saving.

### Phase 7 — Builder Engine
1. Implement the schema CRUD endpoints and the `builder/` canvas UI.
2. Build the category-specific section library from Section 4.3 above.
3. Build a per-section-type editor form generator (reads `data` shape, renders matching fields).
4. Build global theme controls (font, colors, layout width).
5. Build the live preview pane using the same section renderer components used on the public site.
6. **Acceptance:** a user builds a full portfolio site (sections, theme, content) and sees it correctly in preview.

### Phase 8 — AI Assistant Layer
1. On publish/reindex, chunk and embed the site's own section content, scoped by `siteId`.
2. Build the chatbot widget and `/api/sites/:siteId/ai/chat`, retrieving only that site's chunks as context.
3. **Acceptance:** the chatbot on Site A never answers using Site B's content.

### Phase 9 — 3D & Visual Layer
1. Build one configurable React Three Fiber hero component (`components/three/`).
2. Expose shape/color/rotation-speed controls in the builder's `hero` section editor (`showThreeD` flag).
3. Lazy-load the Three.js bundle so non-3D pages aren't penalized.
4. **Acceptance:** the 3D element appears in preview and on the published site, configurable without code.

### Phase 10 — Publish & Hosting
1. Implement `/api/sites/:siteId/publish` (copies draft schema to published, bumps version).
2. Implement the public renderer at `s/[subdomain]/` reading only the published schema.
3. (Stretch) Implement `/domain/connect` and `/domain/verify` with Cloudflare DNS TXT record verification.
4. **Acceptance:** publishing makes the site reachable at `subdomain.buildspace.app`; further draft edits don't affect the live version until republished.

### Phase 11 — Per-Site Admin Panel (schema-driven CMS)
1. Build `sites/[siteId]/admin/`, distinct from the Phase 5 dashboard.
2. On load, call `/api/sites/:siteId/admin/schema` and dynamically render one management screen per section type present in that site's schema (e.g. `services` → services CRUD screen, `gallery` → image manager).
3. Wire admin edits to update the **published** schema directly.
4. **Acceptance:** a salon site and a portfolio site, using identical admin panel code, show different management screens purely because their schemas differ.

### Phase 12 — Polish, Testing, and Documentation
1. Integration tests for all three security walls.
2. `README.md` covering setup and architecture.
3. Demo script: sign up → build a portfolio site → complete credentials wizard → publish → open admin panel → ask chatbot a question → show 3D element.
4. **Acceptance:** the full demo script runs without manual DB edits.

---

## 7. Startup Extension Roadmap (post-MVP)

### Phase 13 — Tiered Billing
Free / Pro / Business tiers; Stripe/Razorpay subscriptions via `billing/`; feature gating by tier.

### Phase 14 — Template & Asset Marketplace
Sellable schema-based templates; approval flow; commission on sales.

### Phase 15 — AI Content Generation
"Auto-write this for me" on text fields (About Us, product descriptions, SEO meta), using the same AI pipeline as Phase 8.

### Phase 16 — Per-Site Analytics
Page views, traffic sources, chatbot volume, surfaced inside the Phase 11 admin panel.

### Phase 17 — White-Label / Reseller Mode
Agency accounts managing multiple client sites under their own brand.

### Phase 18 — SEO Tooling
Auto sitemap.xml/robots.txt, auto meta tags from section content, basic page-speed score.

---

## 8. What NOT to Do
- Do not hardcode a separate admin panel per category — generate it from the schema.
- Do not let the chatbot answer from any content outside that specific site.
- Do not skip Phases 2–4 to reach the builder faster.
- Do not build all four categories before one works end-to-end through publish and the admin panel.
- Do not store any user-provided key in plaintext, log it, or return its full value to the frontend after first save.
- Do not let per-site credentials leak into platform-level `.env` files or vice versa — they are stored and encrypted separately (Section 3).

---

## 9. Definition of Done for the MVP
- [ ] Three-wall security implemented and tested
- [ ] Guided credentials wizard: generate/paste JWT secret, guided ImageKit keys, category-conditional payment/email/AI keys, test-before-save, encrypted storage
- [ ] One site category built end-to-end using its category-specific section library
- [ ] AI chatbot grounded strictly in that site's own content
- [ ] One configurable 3D element, no code required
- [ ] Site publishes to a live subdomain URL, draft/published kept separate
- [ ] Per-site admin panel dynamically generated from the schema, distinct from the main dashboard
- [ ] README and demo script ready
- [ ] Startup roadmap (Phases 13–18) documented as future scope
