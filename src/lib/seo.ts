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
  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
  }
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
      url: BUSINESS.siteUrl,
      email: BUSINESS.email,
      telephone: BUSINESS.phoneE164,
      openingHours: BUSINESS.hoursSchema,
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
