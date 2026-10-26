# Urban Craft & Co. - System Architecture & Memory File

> **Project Identity:** Official corporate gifting digital catalogue and inquiry platform for **Urban Craft & Co.** (Sadar Bazar, New Delhi).  
> **Core Mission:** Enable corporate HR, admin, procurement, and leadership teams to browse over 360 curated corporate gifts, customize with logos, manage shortlists, and submit guided bulk enquiries via WhatsApp or web forms.

---

## 1. Executive Architecture & Engineering Principles

1. **Config-Driven Single Source of Truth**: All business facts (address, phone, hours, maps), brand artwork assets, category taxonomies, navigation trees, and marketing copy live strictly inside `src/config/*`. Components never hardcode contact info, URLs, or business facts.
2. **Normalized Static Catalogue**: Product data is stored in `src/data/products.json`, maintaining 366+ SKUs with canonical remote images on `https://urbancraftgifts.com/`. Product data is never mutated arbitrarily.
3. **Overlays Architecture**: Products do not use isolated standalone page routes (e.g. `/products/123`). Instead, product inspection happens inside a high-performance `ProductQuickView` modal managed via `OverlayProvider`, supporting deep linking via `?p=<sku>` URL search parameter.
4. **URL-First Catalogue State**: All catalog filtering (category, color family, customization technique, query keyword, sorting, pagination) is synchronized with URL search parameters (`lib/catalog-search.ts`). This makes filter results shareable, bookmarkable, and back-button safe.
5. **Brand Governance**: Logos are rendered strictly through `<Logo variant="..." />` using official vector/high-res PNG assets. Light surfaces use `horizontal`, dark surfaces use `horizontalReversed`, compact navigation uses `header` lockup or `compactStacked`.
6. **Zero-Friction Inquiry Engine**: 5-step inquiry wizard retains state in session storage, supports product and category prefilling from any CTA button, validates via Zod, and outputs formatted WhatsApp messages, mailto fallbacks, and optional backend API submissions via `VITE_INQUIRY_ENDPOINT`.
7. **Accessibility & Responsive Polish**: Touch-screen gestures (swipes), responsive ResizeObserver-measured navigation rails, focus visible rings, semantic ARIA landmarks, `prefers-reduced-motion` fallbacks, and instantaneous scroll restoration.

---

## 2. Technology Stack & Runtime

| Layer             | Technology                                                                      | Version                | Purpose                                                     |
| :---------------- | :------------------------------------------------------------------------------ | :--------------------- | :---------------------------------------------------------- |
| **Framework**     | [TanStack Start](https://tanstack.com/start)                                    | `1.168.60`             | Full-stack React SSR framework                              |
| **Routing**       | [TanStack Router](https://tanstack.com/router)                                  | `1.170.41`             | Type-safe, file-based router with auto-generated route tree |
| **Data Fetching** | [TanStack React Query](https://tanstack.com/query)                              | `^5.101.1`             | Client caching and query client provider                    |
| **Bundler**       | [Vite](https://vitejs.dev/)                                                     | `8.1.5`                | Next-generation frontend tooling and HMR                    |
| **Server Engine** | [Nitro](https://nitro.unjs.io/)                                                 | `3.0.260603-beta`      | Universal deployment engine (Cloudflare, Vercel, Node)      |
| **Language**      | [TypeScript](https://www.typescriptlang.org/)                                   | `^5.8.3`               | Strict type checking and safety                             |
| **Styling**       | [Tailwind CSS v4](https://tailwindcss.com/)                                     | `^4.2.1`               | Modern `@theme` CSS-first styling with OKLCH tokens         |
| **Animation**     | [Framer Motion](https://www.framer.com/motion/)                                 | `^14.3.0`              | Viewport reveals, parallax, layout animations               |
| **Carousel**      | [Swiper](https://swiperjs.com/)                                                 | `^14.3.0`              | Touch-enabled carousels for curated picks and reviews       |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/)                                           | Various                | Accessible dialogs, drawers, accordions, dropdowns          |
| **Icons**         | [Lucide React](https://lucide.dev/)                                             | `^0.575.0`             | Clean, modern iconography                                   |
| **Forms & Zod**   | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)       | `^7.71.2` / `^3.25.76` | Type-safe multi-step form validation                        |
| **Testing**       | [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/) | `^4.1.10` / `^16.0.0`  | Fast DOM and routing test runner                            |

---

## 3. Complete File-by-File Manifest & Functionality

### Root Configuration & Build Files

- **`package.json`**: Defines dependencies, type module, overrides (`rolldown: 1.2.1`), and npm scripts (`dev`, `build`, `build:dev`, `preview`, `lint`, `format`, `test`, `test:watch`).
- **`vite.config.ts`**: Configures Vite plugins:
  - `tailwindcss()`: Tailwind CSS v4 compiler integration.
  - `tsConfigPaths()`: Resolves `@/*` path alias to `./src/*`.
  - `tanstackStart({ server: { entry: "server" } })`: TanStack Start SSR plugin using `src/server.ts` entry.
  - `viteReact()`: React Fast Refresh and JSX transformation.
  - `nitro()`: Build-time server bundle packaging for Cloudflare/edge runtimes.
- **`tsconfig.json`**: TypeScript compiler configuration targeting `ES2022`, `Bundler` module resolution, strict mode, and `@/*` path mapping.
- **`components.json`**: shadcn/ui configuration mapping aliases to `@/components`, `@/lib`, `@/hooks`, and `@/components/ui`.
- **`eslint.config.js`**: Flat ESLint configuration with Prettier, React Hooks, React Refresh, and TypeScript lint rules (plus restricting Next.js-specific `server-only` import in favor of TanStack Start patterns).
- **`vitest.config.ts`**: Test runner configuration using `jsdom`, `@vitejs/plugin-react`, and `./src/test/setup.ts`.
- **`bunfig.toml`**: Package manager configuration for Bun with 24-hour supply chain security release age guard.
- **`AGENTS.md`**: Architectural invariants, rules, and guidelines for AI and human pair programmers.
- **`roadmap.md`**: Completed milestones and backlog items (header tone refinement, image backgrounds).
- **`README.md`**: Developer onboarding, architectural synopsis, command cheat-sheet, and project structure.

---

### Public Assets (`/public`)

- **`public/favicon.ico`**: Standard browser favicon icon.
- **`public/manifest.webmanifest`**: Progressive Web App manifest defining standalone display mode, background color (`#F8F6EE`), theme color (`#2F3A2E`), and icon references.
- **`public/robots.txt`**: Crawl directives allowing all user-agents and linking to `https://urbancraftgifts.com/sitemap.xml`.

---

### Source Code (`/src`)

#### App Shell & Server Entries

- **`src/start.ts`**: TanStack Start server instance creation (`createStart`). Installs custom `errorMiddleware` (catching unhandled SSR exceptions and returning a styled 500 HTML response) and `csrfMiddleware` (protecting server functions from cross-site requests).
- **`src/server.ts`**: Nitro server entry point. Exports `{ fetch(request, env, ctx) }` handler. Normalizes catastrophic SSR failures and unhandled h3 exceptions, recovering error stacks via `lib/error-capture.ts`.
- **`src/router.tsx`**: Initializes TanStack Router with `QueryClient`, instant scroll restoration (`scrollRestorationBehavior: "instant"`), and default preload times.
- **`src/routeTree.gen.ts`**: Auto-generated route tree definitions generated by TanStack Router compiler.
- **`src/styles.css`**: Tailwind CSS v4 design system:
  - `@theme inline`: Semantic OKLCH tokens (`--color-olive`, `--color-olive-deep`, `--color-brown`, `--color-sand`, `--color-ivory`, `--color-terracotta`, `--color-sage`, `--color-gold`, `--color-charcoal`, `--color-whatsapp`).
  - Product stage background tints (`--color-stage-ivory`, `--color-stage-sand`, `--color-stage-sage`, `--color-stage-rose`, `--color-stage-gold`, `--color-stage-stone`).
  - Custom utility classes: `.container-site`, `.section-y`, `.eyebrow`, `.font-display`, `.shadow-soft`, `.shadow-lift`, `.card-hover`, `.link-underline`, `.stage-glow`, `.skeleton-shimmer`.
  - Keyframe animations: `uc-loader-in`, `uc-loader-ring`, `uc-navigation-progress`, `uc-shimmer`, `uc-pulse-mark`.
  - Base styles: Typography typography smoothing, custom minimal scrollbar, selection highlight.

---

#### Configuration (`src/config/`)

- **`src/config/business.ts`**: Canonical business data: company name ("Urban Craft & Co."), tagline, phone numbers (`+91 92661 29456`), email (`info@urbancraftgifts.com`), street address in Sadar Bazar, New Delhi (Plus code `M676+4Q New Delhi, Delhi`), opening hours, Google Maps embed & link URLs, Google Review link.
- **`src/config/brand.ts`**: Brand asset configuration:
  - `LOGO_ASSETS`: Object mapping logo variants (`horizontal`, `horizontalReversed`, `stacked`, `compactStacked`, `wordmark`, `wordmarkTagline`, `icon`, `monogram`, `outline`, `goldStacked`, `brownStacked`, `tagline`) with their dimensions and official remote URLs.
  - `HEADER_LOGO_ASSETS`: Combined icon and wordmark asset URLs for the sticky desktop header.
  - `FAVICONS`: 16x16, 32x32, 180x180, 192x192, 512x512 icon URLs.
  - `THEME_COLOR`: Olive green brand color `#2F3A2E`.
- **`src/config/categories.ts`**: Catalogue category taxonomy:
  - 4 Category Groups: `gift-sets`, `bags`, `eco`, `office`.
  - 16 Specific Categories: 2-in-1 through 7-in-1 gift sets, premium bigger gift sets, employee welcome kits, bottles & drinkware, conference folders, backpacks, leather laptop bags, eco-friendly laptop bags, duffle bags, jute carry bags, felt carry bags.
  - Helper functions: `getCategory(slug)`, `categoriesInGroup(group)`, `requireCategory(slug)`.
- **`src/config/content.ts`**: Marketing and static copy:
  - `SERVICES`: Corporate gifting, onboarding kits, event gifting, custom branding, bulk orders.
  - `PROCESS_STEPS`: 4-step workflow (Browse & shortlist -> Share your brief -> Review options -> Approve & dispatch).
  - `VALUE_PROPS`: 4 core value propositions displayed in the homepage trust strip.
  - `WHY_US`: Reasons teams choose Urban Craft & Co.
  - `FAQ_GROUPS`: 5 categorized FAQ sections (selection, branding, quotes, delivery, enquiries).
  - `TESTIMONIALS`: Client reviews and ratings.
- **`src/config/navigation.ts`**: Navigation structure: `PRIMARY_NAV`, `HEADER_SECONDARY_LINKS`, `HEADER_CATEGORY_SLUGS`, `HEADER_SEARCH_SUGGESTIONS`, `COMPANY_LINKS`, `LEGAL_LINKS`.
- **`src/config/page-intros.ts`**: Header metadata and showcase graphics for `/about`, `/contact`, and `/services`.

---

#### Data Layer (`src/data/`)

- **`src/data/products.json`**: 366+ product records. Each record adheres to the schema:
  - `sku`: Unique product SKU code (e.g., `gs-2io-1`, `cb-eco-1`).
  - `category`: Matching category slug from `config/categories.ts`.
  - `name`: Human-readable product name.
  - `summary`: One-paragraph description of contents and packaging.
  - `color`: Primary color (e.g. "White", "Tan", "Olive", "Black").
  - `materials`: Array of material tags (e.g., `["Plastic", "Metal", "Cardboard"]`).
  - `customization`: Supported branding techniques (`["Laser Engraving", "Screen Printing", "UV Print", "Debossing"]`).
  - `useCases`: Corporate use scenarios.
  - `occasions`: Gifting events (e.g., "Holiday Gifting", "Executive Summit").
  - `tags`: Search keywords.
  - `alt`: Descriptive accessibility alt text.
  - `images`: Relative image filenames hosted on the product media CDN.

---

#### Core Libraries (`src/lib/`)

- **`src/lib/catalog.ts`**: Product catalogue processing:
  - Normalizes remote image URLs with `productImageUrl()`.
  - Deterministically sorts products by category order and source order into `PRODUCTS`.
  - Provides `PRODUCT_MAP`, `getProduct(sku)`, `productsInCategory(slug)`.
  - Color normalization via `colorFamily(color)` into 8 discrete facets: Black & Charcoal, White & Grey, Brown & Tan, Natural & Beige, Blue, Green, Red & Warm, Other.
  - Swatch lookup `colorSwatch(color)` returning hex values for facet filters.
  - Full-text search engine `searchProducts()` with weighted scoring: Name matches (+3), SKU matches (+5), category and tags (+1).
  - Query filtering `queryCatalog()` handling keyword, category filters, color family filters, customization method filters, and sorting (`featured`, `name-asc`, `name-desc`, `category`).
  - Facet counter `facetCounts()`.
- **`src/lib/catalog-search.ts`**: Validates URL query string parameters (`q`, `cat`, `color`, `custom`, `sort`, `page`, `p`). Keeps URL clean, shareable, and resilient against invalid values.
- **`src/lib/favorites.ts`**: Reactive localStorage synchronization using React 18/19's `useSyncExternalStore`. Enables saving products to a device-stored shortlist across tabs without context re-renders.
- **`src/lib/inquiry-context.ts`**: Pure helper `applyInquiryContext(draft, prefill)` to merge product/category CTA intent into an ongoing session draft without losing user contact info.
- **`src/lib/inquiry-service.ts`**: Inquiry submission handling:
  - Zod validation schema `inquirySchema` enforcing name, email, phone regex, intent, quantity.
  - `inquiryToText()` formatter transforming structured form data into clean bulleted text.
  - `submitInquiry()` submitting JSON payloads to `VITE_INQUIRY_ENDPOINT` if configured.
- **`src/lib/whatsapp.ts`**: Generates prefilled WhatsApp click-to-chat links (`wa.me/919266129456?text=...`) for general questions, specific products (including SKU and page link), category advice, or corporate services.
- **`src/lib/seo.ts`**: Generates metadata arrays, OpenGraph tags, Twitter cards, canonical link headers, Breadcrumb structured data (`breadcrumbJsonLd`), and Schema.org `LocalBusiness` JSON-LD (`localBusinessJsonLd`).
- **`src/lib/error-capture.ts`**: Captures unhandled SSR exceptions and error cause chains before h3 swallows them.
- **`src/lib/error-page.ts`**: Generates a self-contained, inline-styled fallback HTML error document when SSR crashes catastrophically.
- **`src/lib/error-reporting.ts`**: Client-side runtime error logger. Logs caught boundary errors to the console with route context.
- **`src/lib/utils.ts`**: Standard `cn()` class merge utility wrapping `clsx` and `tailwind-merge`.

---

#### Custom Hooks (`src/hooks/`)

- **`src/hooks/use-mobile.tsx`**: Uses `window.matchMedia("(max-width: 767px)")` to detect mobile viewport with dynamic resize event listeners.

---

#### Routes (`src/routes/`)

- **`src/routes/__root.tsx`**: Root application shell wrapping every route. Injects HTML `<head>` meta tags, Google Fonts (Montserrat & Merriweather), global stylesheet, favicons, LocalBusiness JSON-LD, `OverlayProvider`, navigation progress bar, skip-to-content link, `SiteHeader`, `SiteFooter`, `MobileBottomNav`, `FloatingActions`, `CookieConsent`, and Sonner `Toaster`. Defines root `NotFoundComponent` and `ErrorComponent`.
- **`src/routes/index.tsx`**: Homepage assembling `HomeHero`, `TrustStrip`, `ShopByCategory`, `GiftSetShowcase`, `ProcessStory`, `CuratedRail`, `WelcomeKitsFeature`, `BagsMosaic`, `EcoSection`, `ServicesSection`, `TestimonialsSection`, `WhyUsSection`, `FaqPreview`, `InlineInquiry`, and `ContactCTA`.
- **`src/routes/products.tsx`**: Catalogue route `/products`. Renders `PageHeader`, `CatalogView` with all categories and filters active, and `ContactCTA`.
- **`src/routes/categories.index.tsx`**: Category hub `/categories`. Groups all 16 categories by their 4 parent groups, showcasing image previews and product counts.
- **`src/routes/categories.$slug.tsx`**: Dynamic category route `/categories/:slug`. Validates category existence via `loader` (returning 404 if invalid), renders `CategoryBanner`, filtered `CatalogView`, related category recommendations, and prefilled inquiry CTAs.
- **`src/routes/about.tsx`**: About Us page featuring brand story, New Delhi studio location, how Urban Craft works, and company facts.
- **`src/routes/services.tsx`**: Corporate services directory detailing gifting, onboarding, event gifts, branding, and bulk orders.
- **`src/routes/contact.tsx`**: Contact page featuring phone, WhatsApp, email, physical Sadar Bazar address with Plus code, working hours, interactive Google Maps iframe, and `InlineInquiry` form.
- **`src/routes/faqs.tsx`**: Interactive FAQ page with sticky side navigation rail linking to grouped FAQ sections.
- **`src/routes/testimonials.tsx`**: Client reviews page with Google Reviews link and `TestimonialsBlock`.
- **`src/routes/favorites.tsx`**: Shortlist management page displaying saved products with one-click "Enquire about shortlist" and "Clear" actions.
- **`src/routes/cookie-policy.tsx`**: Information on essential browser storage usage (favourites, inquiry draft, cookie consent).
- **`src/routes/privacy-policy.tsx`**: Privacy statement regarding enquiry details and contact data.
- **`src/routes/terms.tsx`**: Terms & Conditions clarifying that the website is a catalogue for enquiry and quoting, not a direct checkout store.
- **`src/routes/sitemap[.]xml.tsx`**: Server GET handler returning dynamic XML sitemap containing all static routes and 16 category URLs.

---

#### Components Architecture (`src/components/`)

##### Brand Components (`src/components/brand/`)

- **`Logo.tsx`**: Renders brand logos according to surface requirements. Variant `"header"` renders the side-by-side icon and wordmark/tagline lockup scaled up by 30% (`h-[42px] md:h-[52px]` for the icon, `h-[31px] md:h-[39px]` for wordmark/tagline) for crisp readability; other variants (`horizontal`, `horizontalReversed`, `outline`, etc.) use pre-measured PNG artwork. Includes `MarkLoader`.
- **`BrandLoader.tsx`**: Smooth SVG circular track and spinning arc surrounding the brand outline icon.
- **`WhatsAppIcon.tsx`**: Official inline SVG WhatsApp glyph with `currentColor` fill.

##### Common Components (`src/components/common/`)

- **`BrandImage.tsx`**: High-performance image component. Reserves aspect ratio, delays showing loading spinners for 180ms to avoid flicker on fast/cached loads, and gracefully handles network failure with an `ImageOff` fallback icon.
- **`EditorialHero.tsx`**: Full-bleed hero banner used on `/about`, `/contact`, and `/services` with showcase photography, breadcrumbs, and CTAs.
- **`PageParts.tsx`**: Shared UI building blocks: `Breadcrumbs`, `PageHeader`, `SectionHeader`, `CategoryBanner`, `EmptyState`, `ContactCTA`, `FaqList`, `Prose`.
- **`Reveal.tsx`**: Framer Motion scroll reveal wrapper triggering subtle fade-and-slide up transitions, disabled when `prefers-reduced-motion` is active.

##### Catalog Components (`src/components/catalog/`)

- **`CatalogView.tsx`**: Complete interactive catalogue view. Manages keyword search, category facet, color family swatches, customization checkboxes, sort dropdown, active filter chip tags, pagination controls (24 items per page), and responsive mobile filter sheet.

##### Home Components (`src/components/home/`)

- **`HomeHero.tsx`**: Dual-column homepage hero with instant first-paint typography (headline, subtitle, CTAs, featured set badge, and brand seal), smooth scroll parallax transforms, and `TrustStrip`.
- **`HomeMerch.tsx`**: Visual merchandise showcases: `ShopByCategory` grid, `GiftSetShowcase` tabbed set switcher (2-in-1 to 7-in-1), `ProcessStory` step cards, `CuratedRail` horizontal Swiper carousel, `WelcomeKitsFeature`, `BagsMosaic`, and `EcoSection`.
- **`HomeTrust.tsx`**: Trust building blocks: `ServicesGrid`, `TestimonialCard`, `WhyUsSection`, and `FaqPreview`.
- **`InlineInquiry.tsx`**: Inline, zero-popup quick inquiry form with pre-filled WhatsApp and mailto actions.
- **`ReviewCarousel.tsx`**: Swiper carousel for client testimonials with touch swiping and reduced-motion-aware autoplay.

##### Inquiry Components (`src/components/inquiry/`)

- **`InquiryDialog.tsx`**: 5-step modal quote wizard (Purpose -> Products -> Details -> Contact -> Review). Supports editing quantities, customization preferences, target dates, delivery locations, and notes.
- **`InquiryProducts.tsx`**: Shortlist sidebar inside the inquiry wizard displaying currently selected product images, titles, and remove buttons.

##### Layout Components (`src/components/layout/`)

- **`SiteHeader.tsx`**: Sticky header stack measuring its own height dynamically into CSS variable `--header-h`. Contains announcement bar, mobile drawer button, brand logo, desktop primary navigation, animated search input, favorites heart badge, WhatsApp shortcut, and "Enquire now" CTA.
- **`DesktopCategoryNav.tsx`**: Secondary header bar with "Categories" mega menu trigger and category shortcuts initialized to full count for immediate render on first paint, dynamically measured with `ResizeObserver` to prevent wrapping.
- **`MegaMenu.tsx`**: Two-pane dropdown menu grouping categories by type with live thumbnails.
- **`MobileBottomNav.tsx`**: Fixed mobile bottom bar with Home, Categories, Enquire, Search, and Favourites tabs.
- **`MobileNavDrawer.tsx`**: Slide-out navigation drawer for mobile screens.
- **`NavigationProgress.tsx`**: Thin top-edge progress bar indicating pending router navigation.
- **`SiteChrome.tsx`**: Global chrome elements: `FloatingActions` (scroll-to-top button + floating WhatsApp pill) and `CookieConsent` banner.
- **`SiteFooter.tsx`**: Comprehensive footer with brand lockup, category links, company links, contact details, opening hours, directions link, and embedded map.

##### Product Components (`src/components/product/`)

- **`ProductCard.tsx`**: Reusable product card with image gallery, favorite toggle button, category eyebrow, SKU code, material tags, and quick view / WhatsApp buttons. Includes `ProductGrid` and `ProductCardSkeleton`.
- **`ProductCardGallery.tsx`**: Card image gallery supporting touch swipe and interactive dot indicators without prematurely opening quick view.
- **`ProductImageStage.tsx`**: Square stage container applying curated pastel stage tints (`STAGE_TONE`) and radial highlight glow.
- **`ProductQuickView.tsx`**: Modal dialog for deep inspection of a product: multi-view gallery thumbnails, full specs, materials, use cases, occasions, native Web Share / copy link, and inquiry trigger.
- **`FavoriteButton.tsx`**: Heart icon button connected to `useFavorites()` with Sonner toast feedback.
- **`FavoritesDrawer.tsx`**: Slide-out drawer listing saved items with thumbnail, remove action, and shortlist enquiry CTA.

##### Providers & Search (`src/components/providers/`, `src/components/search/`)

- **`OverlayProvider.tsx`**: Central context managing modal overlays (`ProductQuickView`, `InquiryDialog`, `SearchCommand`, `FavoritesDrawer`) using `React.lazy` and `Suspense` for minimal bundle impact.
- **`DesktopHeaderSearch.tsx`**: Search button in header featuring animated typewriter placeholder suggestions.
- **`SearchCommand.tsx`**: Keyboard-navigable (`Cmd+K` / `Ctrl+K`) search command palette showing live product matches, popular searches, and category quick-jumps.

##### UI Primitives (`src/components/ui/`)

- Production-grade accessible primitives (Accordion, Alert, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Checkbox, Command, Dialog, Drawer, Dropdown Menu, Form, Input, Popover, Progress, Radio Group, Select, Sheet, Sonner, Table, Tabs, Textarea, Tooltip) following shadcn/ui and Radix standards.

---

#### Tests (`src/test/`)

- **`src/test/setup.ts`**: Configures test environment with Jest-DOM matchers and mocks for `window.scrollTo` and `window.matchMedia`.
- **`src/test/app-routing.test.tsx`**: Asserts that TanStack Router correctly matches root route `/` without falling back to 404.
- **`src/test/brand-image.test.tsx`**: Tests `BrandImage` delayed loading state (180ms delay) and image error handling.
- **`src/test/inquiry-context.test.ts`**: Verifies quote context isolation when opening product-specific inquiries versus previous drafts.
- **`src/test/product-gallery.test.tsx`**: Tests desktop pagination on product cards, verifying that selecting image dots changes images without accidentally triggering modal quick view.

---

## 4. Key Workflows & State Flows

### 1. Catalog Search & Filter Flow

```
User interacts with filter / search
       │
       ▼
CatalogView.tsx updates URL search params (e.g. ?cat=backpacks&color=Green&q=leather)
       │
       ▼
validateCatalogSearch() validates params against allowed schemas
       │
       ▼
queryCatalog() runs in-memory:
   1. Filters by Category
   2. Filters by Color Family
   3. Filters by Customization technique
   4. Runs searchProducts() with weighted keyword scoring
   5. Applies sort criteria (Recommended / Name / Category)
   6. Paginates results (24 items/page)
       │
       ▼
ProductGrid renders cards with stagger animation
```

### 2. Inquiry & Quote Submission Flow

```
User clicks "Enquire" on Product / Category / Header / Cart
       │
       ▼
OverlayProvider.openInquiry({ products: [sku], intent: "..." })
       │
       ▼
applyInquiryContext() merges incoming context with existing session draft
       │
       ▼
InquiryDialog 5-step Wizard:
   Step 0: Purpose (Employee, Client, Onboarding, Event, Festive)
   Step 1: Products (Shortlist thumbnails, ability to remove)
   Step 2: Details (Quantity, Needed Date, Logo Customization, Delivery City)
   Step 3: Contact (Name, Company, Email, Phone)
   Step 4: Review (Notes, confirmation summary)
       │
       ▼
Submit Action:
   ├─ If VITE_INQUIRY_ENDPOINT exists: POST JSON payload to endpoint
   └─ Always offers WhatsApp button: Pre-formatted text message opening wa.me
```

### 3. Favourites & Shortlist Flow

```
User clicks Heart on ProductCard or QuickView
       │
       ▼
useFavorites.toggle(sku)
       │
       ▼
Updates memory cache + writes to localStorage ("uc:favorites:v1")
       │
       ▼
Broadcasts to listeners via useSyncExternalStore + storage event
       │
       ▼
Badge in SiteHeader & MobileBottomNav updates count instantly
       │
       ▼
FavoritesDrawer / FavoritesPage enables "Enquire about shortlist"
```

---

## 5. Build, Lint & Test Verification Commands

```bash
# Install dependencies cleanly
npm install

# Run automated tests
npm run test

# Run code linter
npm run lint

# Compile production bundle and prerender all static SPA pages into dist/
npm run build
```

---

## 6. cPanel Static SPA Deployment Architecture

- **Domain**: `demo.urbancraftgifts.com`
- **GitHub Repository**: `https://github.com/shellinfosec/urbancraft-demo` (`main` branch)
- **Deployment Mode**: Pure Static SPA on Apache (`dist/` folder) without Phusion Passenger or Node.js runtime overhead.
- **Prerender Pipeline**: `npm run build` runs `vite build` followed by `scripts/prerender-spa.mjs`, which prerenders 29+ static routes (`/`, `/catalogue`, `/products`, `/categories/*`, etc.) and packages them into `dist/` along with `dist/.htaccess` and all asset bundles.
- **cPanel Deployment**: `.cpanel.yml` deploys the committed `dist/` folder to `/home/urbancraftgifts/demo.urbancraftgifts.com` via `/bin/cp -R dist/. $DEPLOYPATH/`.
- **Apache Rewrite**: `dist/.htaccess` routes existing files/directories directly and fallbacks all client routes to `/index.html` for instant TanStack Router hydration.

This file serves as the definitive reference for the Urban Craft & Co. architecture, component relationships, data flow, and codebase conventions.
