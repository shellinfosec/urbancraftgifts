## Urban Craft & Co. architecture

- Business facts, brand assets, categories, nav and copy live in `src/config/*`; never hardcode them in components (single source of truth for approved facts).
- Product data is `src/data/products.json`, a slimmed build of the supplied normalized catalogue; regenerate it from the source rather than hand-editing (keeps 366 canonical images grouped by SKU).
- Logos render only via `<Logo variant>` using supplied artwork; the header variant combines transparently trimmed supplied assets, other light surfaces use `horizontal`, and dark surfaces `horizontalReversed` (brand governance).
- Quick view, inquiry, favourites drawer and search are global overlays in `OverlayProvider`; products have no standalone route (phase-1 spec).
- Catalogue filter/sort/page state lives in validated URL search params (`lib/catalog-search.ts`) so results are shareable.
- Inquiry submission goes through `lib/inquiry-service.ts`; without `VITE_INQUIRY_ENDPOINT` the UI must not claim the enquiry was sent.
- Product quote context replaces stale draft selections; a shared InquiryProducts panel follows current form selections across steps, so the visible shortlist and submitted products stay aligned.
- No service worker: manifest-only installability, to avoid stale caches in preview.
- Desktop category shortcuts are config-driven and measured with ResizeObserver; show whole links only so navigation never clips or wraps.
- Header search suggestions animate only their decorative text and open the shared search overlay; never inject suggested text as the user's query.
- Render the route Outlet without a pathname-keyed animation wrapper and use instant scroll restoration; location updates precede route commits, so keyed wrappers remount the outgoing page.
- Content images use BrandImage with reserved dimensions and delayed contextual BrandLoader; cached images stay visible and errors terminate loading rather than trapping a spinner.
- Footer copy and location URLs come from config; lazy-load the map so browsing never waits on a third-party embed.
- Page introductions use a shared EditorialHero fed by page-intros config with generated transparent showcase artwork; keeps branded layouts consistent while canonical catalogue imagery stays untouched.
- FAQ groups live in content config and feed both the grouped FAQ page and flattened home preview to avoid conflicting answers.
- Reviews use a shared Swiper carousel with one row, touch navigation and reduced-motion-aware autoplay to keep presentation consistent.
- Observe the sticky header height into --header-h so catalogue filters and scroll targets track the complete current header stack.
- Product-card image dots are sibling buttons, not decorative spans or nested image buttons; desktop, keyboard and touch all select actual image views.
