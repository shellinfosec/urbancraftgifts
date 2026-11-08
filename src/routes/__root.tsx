import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { FAVICONS, THEME_COLOR } from "@/config/brand";
import { BUSINESS } from "@/config/business";
import { OverlayProvider } from "@/components/providers/OverlayProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CookieConsent, FloatingActions } from "@/components/layout/SiteChrome";
import { Logo } from "@/components/brand/Logo";
import { Toaster } from "@/components/ui/sonner";
import { localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { initWebMCP } from "@/lib/webmcp";

function NotFoundComponent() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Logo variant="outline" height={72} decorative />
      <p className="eyebrow mt-6 text-brown">Page not found</p>
      <h1 className="mt-2 font-display text-3xl text-olive md:text-4xl">
        This page isn't in our catalogue
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate">
        The link may be out of date. You can browse all products or head back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/products"
          className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Browse products
        </Link>
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-xl border border-primary/30 px-5 text-sm font-semibold text-primary"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl text-olive">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: THEME_COLOR },
      { name: "author", content: BUSINESS.name },
      { property: "og:site_name", content: BUSINESS.name },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: FAVICONS.png32 },
      { rel: "icon", type: "image/png", sizes: "16x16", href: FAVICONS.png16 },
      { rel: "apple-touch-icon", sizes: "180x180", href: FAVICONS.apple180 },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "api-catalog", href: "/.well-known/api-catalog" },
      { rel: "service-desc", href: "/.well-known/ai-catalog.json", type: "application/json" },
      {
        rel: "agent-skills",
        href: "/.well-known/agent-skills/index.json",
        type: "application/json",
      },
      {
        rel: "mcp-server-card",
        href: "/.well-known/mcp/server-card.json",
        type: "application/json",
      },
      { rel: "author-doc", href: "/auth.md", type: "text/markdown" },
    ],
    scripts: [localBusinessJsonLd(), organizationJsonLd(), websiteJsonLd()],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initWebMCP();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <NavigationProgress />
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          <Outlet />
        </main>
        <SiteFooter />
        <MobileBottomNav />
        <FloatingActions />
        <CookieConsent />
        <Toaster position="top-center" />
      </OverlayProvider>
    </QueryClientProvider>
  );
}
