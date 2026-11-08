import { BUSINESS } from "@/config/business";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
}

/** Route-level head helper: unique title/description/OG/Twitter + canonical. */
export function pageHead({ title, description, path, image, type = "website" }: PageMetaInput) {
  const fullTitle = title.includes(BUSINESS.name) ? title : `${title} | ${BUSINESS.name}`;
  const url = `${BUSINESS.siteUrl}${path}`;

  // Ensure absolute URL for OpenGraph and Twitter sharing
  const defaultImage = `${BUSINESS.siteUrl}/brand/urbancraft-logo.png`;
  let resolvedImage = defaultImage;
  if (image) {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      resolvedImage = image;
    } else {
      resolvedImage = `${BUSINESS.siteUrl}${image.startsWith("/") ? "" : "/"}${image}`;
    }
  }

  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:site_name", content: BUSINESS.name },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: resolvedImage },
    { property: "og:image:secure_url", content: resolvedImage },
    { property: "og:image:alt", content: `${fullTitle} - Urban Craft & Co.` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: resolvedImage },
    { name: "twitter:image:alt", content: `${fullTitle} - Urban Craft & Co.` },
  ];
  return { meta, links: [{ rel: "canonical", href: url }] };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: `${BUSINESS.siteUrl}${it.path}`,
      })),
    }),
  };
}

export function localBusinessJsonLd() {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: BUSINESS.name,
      image: `${BUSINESS.siteUrl}/brand/urbancraft-logo.png`,
      url: BUSINESS.siteUrl,
      email: BUSINESS.email,
      telephone: BUSINESS.phoneE164,
      openingHours: BUSINESS.hoursSchema,
      priceRange: "$$",
      hasMap: BUSINESS.mapLinkUrl,
      geo: {
        "@type": "GeoCoordinates",
        latitude: BUSINESS.coordinates.lat,
        longitude: BUSINESS.coordinates.lng,
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.address.street,
        addressLocality: BUSINESS.address.city,
        postalCode: BUSINESS.address.postalCode,
        addressRegion: BUSINESS.address.region,
        addressCountry: BUSINESS.address.country,
      },
    }),
  };
}

export function organizationJsonLd() {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BUSINESS.name,
      url: BUSINESS.siteUrl,
      logo: `${BUSINESS.siteUrl}/brand/urbancraft-logo.png`,
      email: BUSINESS.email,
      telephone: BUSINESS.phoneE164,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: BUSINESS.phoneE164,
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.address.street,
        addressLocality: BUSINESS.address.city,
        postalCode: BUSINESS.address.postalCode,
        addressRegion: BUSINESS.address.region,
        addressCountry: BUSINESS.address.country,
      },
    }),
  };
}

export function websiteJsonLd() {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BUSINESS.name,
      url: BUSINESS.siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${BUSINESS.siteUrl}/products?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }),
  };
}

export function faqPageJsonLd(faqs: { q: string; a: string }[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    }),
  };
}
