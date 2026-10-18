export const PRIMARY_NAV = [
  { to: "/products", label: "All Products" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/faqs", label: "FAQs" },
  { to: "/catalogue", label: "Catalogue" },
] as const;

export const HEADER_CATEGORIES_LABEL = "Categories";
export const HEADER_SECONDARY_LINKS = [
  { to: "/catalogue", label: "Catalogue", icon: "book" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/faqs", label: "FAQs" },
] as const;
export const HEADER_CATEGORY_SLUGS = [
  "3-in-1-gift-sets",
  "employee-welcome-kits",
  "premium-bigger-gift-sets",
  "backpacks",
  "bottles-drinkware",
  "leather-laptop-bags",
  "jute-carry-bags",
  "duffle-bags",
] as const;

export const HEADER_SEARCH_SUGGESTIONS = [
  "gift sets",
  "welcome kits",
  "backpacks",
  "bottles & drinkware",
] as const;

export const COMPANY_LINKS = [
  { to: "/catalogue", label: "Corporate Catalogue (PDF)" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact Us" },
] as const;

export const LEGAL_LINKS = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/cookie-policy", label: "Cookie Policy" },
] as const;
