export type CategoryGroupId = "gift-sets" | "bags" | "eco" | "office";
export type StageTone = "ivory" | "sand" | "sage" | "rose" | "gold" | "stone";

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  group: CategoryGroupId;
  banner: string;
  intro: string;
  seoDescription: string;
  tone: StageTone;
  related: string[];
  /** Number of items in a gift set, where it applies. */
  setSize?: number;
}

const bannerImagesRecord = import.meta.glob<string>(
  "/src/assets/media/banners/*.{png,jpg,jpeg,webp,svg}",
  { eager: true, import: "default" },
);

const BANNER_IMAGE_MAP = new Map<string, string>();
for (const [key, value] of Object.entries(bannerImagesRecord)) {
  const normalized = key.replace(/.*\/banners\//, "");
  BANNER_IMAGE_MAP.set(normalized, value);
}

const getBannerUrl = (file: string) => {
  const clean = file.replace(/^\/+/, "");
  return BANNER_IMAGE_MAP.get(clean) || clean;
};

export const CATEGORY_GROUPS: { id: CategoryGroupId; label: string; blurb: string }[] = [
  {
    id: "gift-sets",
    label: "Gift Sets",
    blurb: "Boxed combinations for teams, clients and events",
  },
  { id: "bags", label: "Bags for Work & Travel", blurb: "Laptop bags, backpacks and duffles" },
  { id: "eco", label: "Jute & Felt", blurb: "Natural-fibre and felt carry bags" },
  { id: "office", label: "Office & Onboarding", blurb: "Welcome kits, drinkware and folders" },
];

const giftSet = (
  n: number,
  slug: string,
  banner: string,
  intro: string,
  tone: StageTone,
): Category => ({
  slug,
  name: `${n}-in-1 Gift Sets`,
  shortName: `${n}-in-1 Sets`,
  group: "gift-sets",
  banner: getBannerUrl(banner),
  intro,
  seoDescription: `Browse ${n}-in-1 corporate gift sets from Urban Craft & Co. Enquire for logo branding and bulk orders for employees, clients and events.`,
  tone,
  related: [
    "2-in-1-gift-sets",
    "3-in-1-gift-sets",
    "4-in-1-gift-sets",
    "5-in-1-gift-sets",
    "6-in-1-gift-sets",
    "7-in-1-gift-sets",
  ]
    .filter((s) => s !== slug)
    .slice(0, 4),
  setSize: n,
});

export const CATEGORIES: Category[] = [
  giftSet(
    2,
    "2-in-1-gift-sets",
    "2-in-one-gift-sets-banner.png",
    "Compact pairings - a pen with a diary, a bottle with a tumbler, a charger with a desk piece. Easy to brand and simple to distribute at scale.",
    "ivory",
  ),
  giftSet(
    3,
    "3-in-1-gift-sets",
    "3-in-one-gift-sets-banner.png",
    "Our widest range of sets. Three well-matched pieces, boxed together, that work for client thank-yous, festive gifting and team milestones.",
    "sand",
  ),
  giftSet(
    4,
    "4-in-1-gift-sets",
    "4-in-one-gift-sets-banner.png",
    "Four-piece sets with more room for a desk, travel or wellness theme. A good fit when the gift needs to feel complete.",
    "stone",
  ),
  giftSet(
    5,
    "5-in-1-gift-sets",
    "5-in-one-gift-sets-banner.png",
    "Five-piece sets for senior teams, key clients and occasions where the unboxing matters as much as the items.",
    "gold",
  ),
  giftSet(
    6,
    "6-in-1-gift-sets",
    "6-in-one-gift-sets-banner.png",
    "Six-piece collections that cover the working day - writing, drinkware, tech and travel - in one presentation box.",
    "sage",
  ),
  giftSet(
    7,
    "7-in-1-gift-sets",
    "7-in-one-gift-sets-banner.png",
    "Our most comprehensive boxed sets, for leadership gifting, landmark anniversaries and flagship client relationships.",
    "rose",
  ),
  {
    slug: "premium-bigger-gift-sets",
    name: "Premium Bigger Gift Sets",
    shortName: "Premium Sets",
    group: "gift-sets",
    banner: getBannerUrl("bigger-gift-sets-banner.png"),
    intro: "Larger hampers and statement sets for occasions that call for something more generous.",
    seoDescription:
      "Premium large corporate gift sets and hampers from Urban Craft & Co. Enquire for customisation and bulk orders.",
    tone: "gold",
    related: [
      "7-in-1-gift-sets",
      "6-in-1-gift-sets",
      "employee-welcome-kits",
      "leather-laptop-bags",
    ],
  },
  {
    slug: "employee-welcome-kits",
    name: "Employee Welcome Kits",
    shortName: "Welcome Kits",
    group: "office",
    banner: getBannerUrl("customized-employee-welcome-kits-banner.png"),
    intro:
      "Onboarding kits that give new joiners the essentials on day one - and carry your brand from the first handshake.",
    seoDescription:
      "Customised employee welcome and onboarding kits from Urban Craft & Co. Plan branded kits for new hires.",
    tone: "sage",
    related: ["bottles-drinkware", "backpacks", "conference-folders", "3-in-1-gift-sets"],
  },
  {
    slug: "bottles-drinkware",
    name: "Bottles & Drinkware",
    shortName: "Drinkware",
    group: "office",
    banner: getBannerUrl("bottles-banner.png"),
    intro:
      "Bottles, flasks and tumblers that get used every day, which makes them a reliable surface for your logo.",
    seoDescription:
      "Corporate bottles and drinkware for branding from Urban Craft & Co. Enquire for bulk orders.",
    tone: "stone",
    related: ["employee-welcome-kits", "2-in-1-gift-sets", "backpacks", "3-in-1-gift-sets"],
  },
  {
    slug: "conference-folders",
    name: "Conference Folders",
    shortName: "Folders",
    group: "office",
    banner: getBannerUrl("conference-folders-banner.png"),
    intro: "Folders and portfolios for conferences, board meetings and client presentations.",
    seoDescription:
      "Branded conference folders and portfolios from Urban Craft & Co. for events and meetings.",
    tone: "sand",
    related: [
      "employee-welcome-kits",
      "leather-laptop-bags",
      "2-in-1-gift-sets",
      "bottles-drinkware",
    ],
  },
  {
    slug: "backpacks",
    name: "Backpacks",
    shortName: "Backpacks",
    group: "bags",
    banner: getBannerUrl("backlpacks-banner.png"),
    intro:
      "Laptop backpacks for commuting, travel and offsites - practical gifts that see daily use.",
    seoDescription:
      "Corporate laptop backpacks from Urban Craft & Co. Enquire for logo branding and bulk orders.",
    tone: "stone",
    related: [
      "leather-laptop-bags",
      "eco-friendly-laptop-bags",
      "duffle-bags",
      "employee-welcome-kits",
    ],
  },
  {
    slug: "leather-laptop-bags",
    name: "Leather Laptop Bags",
    shortName: "Leather Laptop Bags",
    group: "bags",
    banner: getBannerUrl("leather-laptop-bags-banner.png"),
    intro:
      "Structured laptop bags and messengers in leather finishes, suited to leadership and client gifting.",
    seoDescription:
      "Leather laptop bags for corporate gifting from Urban Craft & Co. Enquire for embossing and bulk orders.",
    tone: "sand",
    related: ["backpacks", "eco-friendly-laptop-bags", "duffle-bags", "premium-bigger-gift-sets"],
  },
  {
    slug: "eco-friendly-laptop-bags",
    name: "Eco-Friendly Laptop Bags",
    shortName: "Eco Laptop Bags",
    group: "bags",
    banner: getBannerUrl("eco-friendly-laptop-bags.png"),
    intro:
      "Laptop bags in jute, canvas and other natural-look materials for teams that prefer a lighter, earthier style.",
    seoDescription:
      "Eco-friendly laptop bags in natural materials from Urban Craft & Co. Enquire for branding and bulk orders.",
    tone: "sage",
    related: ["jute-carry-bags", "felt-carry-bags", "backpacks", "leather-laptop-bags"],
  },
  {
    slug: "duffle-bags",
    name: "Duffle Bags",
    shortName: "Duffles",
    group: "bags",
    banner: getBannerUrl("duffle-bags-banner.png"),
    intro: "Weekend and gym duffles for offsites, sports days and travel-heavy teams.",
    seoDescription:
      "Corporate duffle bags from Urban Craft & Co. Enquire for logo branding and bulk orders.",
    tone: "stone",
    related: [
      "backpacks",
      "leather-laptop-bags",
      "eco-friendly-laptop-bags",
      "employee-welcome-kits",
    ],
  },
  {
    slug: "jute-carry-bags",
    name: "Jute Carry Bags",
    shortName: "Jute Bags",
    group: "eco",
    banner: getBannerUrl("jute-bags-banner.png"),
    intro:
      "Jute totes and carry bags with a natural texture - useful at events, exhibitions and as gift packaging.",
    seoDescription:
      "Jute carry bags for corporate events and gifting from Urban Craft & Co. Enquire for printing and bulk orders.",
    tone: "sand",
    related: [
      "felt-carry-bags",
      "eco-friendly-laptop-bags",
      "conference-folders",
      "2-in-1-gift-sets",
    ],
  },
  {
    slug: "felt-carry-bags",
    name: "Felt Carry Bags",
    shortName: "Felt Bags",
    group: "eco",
    banner: getBannerUrl("felt-bags-banner.png"),
    intro:
      "Soft, structured felt bags and organisers in muted tones - light to carry and easy to brand.",
    seoDescription:
      "Felt carry bags for corporate gifting from Urban Craft & Co. Enquire for branding and bulk orders.",
    tone: "rose",
    related: ["jute-carry-bags", "eco-friendly-laptop-bags", "backpacks", "employee-welcome-kits"],
  },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export const getCategory = (slug: string): Category | undefined => CATEGORY_MAP[slug];

export const categoriesInGroup = (g: CategoryGroupId) => CATEGORIES.filter((c) => c.group === g);

/** For slugs known at build time (config-driven sections). Throws loudly if config drifts. */
export function requireCategory(slug: string): Category {
  const c = CATEGORY_MAP[slug];
  if (!c) throw new Error(`Unknown category: ${slug}`);
  return c;
}
