const brandImagesRecord = import.meta.glob<string>(
  "/src/assets/media/brand-media/Urban_Craft_Co_Logo_Package/Urban_Craft_Co_Logo_Package/**/*.{png,ico,svg}",
  { eager: true, import: "default" },
);

const BRAND_IMAGE_MAP = new Map<string, string>();
for (const [key, value] of Object.entries(brandImagesRecord)) {
  const normalized = key.replace(
    /.*\/Urban_Craft_Co_Logo_Package\/Urban_Craft_Co_Logo_Package\//,
    "",
  );
  BRAND_IMAGE_MAP.set(normalized, value);
}

const getBrandUrl = (subPath: string) => {
  const clean = subPath.replace(/^\/+/, "");
  return BRAND_IMAGE_MAP.get(clean) || clean;
};

export const HEADER_LOGO_ASSETS = {
  icon: getBrandUrl("06_Icon_Only/UrbanCraft_Icon_transparent.png"),
  wordmark: getBrandUrl("05_Wordmark_Tagline/UrbanCraft_Wordmark_Tagline_transparent.png"),
};

/** Supplied logo artwork, keyed by intended usage. Never recreate the logo in CSS/text. */
export const LOGO_ASSETS = {
  horizontal: {
    src: getBrandUrl("02_Primary_Horizontal_Lockup/UrbanCraft_Horizontal_Lockup_transparent.png"),
    ratio: 3.6,
  },
  horizontalReversed: {
    src: getBrandUrl(
      "17_Horizontal_Reversed_Lockup/UrbanCraft_Horizontal_Reversed_transparent.png",
    ),
    ratio: 3.6,
  },
  stacked: {
    src: getBrandUrl("01_Primary_Stacked/UrbanCraft_Primary_Stacked_transparent.png"),
    ratio: 1,
  },
  compactStacked: {
    src: getBrandUrl("03_Compact_Stacked/UrbanCraft_Compact_Stacked_transparent.png"),
    ratio: 1,
  },
  wordmark: {
    src: getBrandUrl("04_Wordmark_Only/UrbanCraft_Wordmark_transparent.png"),
    ratio: 4,
  },
  wordmarkTagline: {
    src: getBrandUrl("05_Wordmark_Tagline/UrbanCraft_Wordmark_Tagline_transparent.png"),
    ratio: 4,
  },
  icon: {
    src: getBrandUrl("06_Icon_Only/UrbanCraft_Icon_transparent.png"),
    ratio: 1,
  },
  monogram: {
    src: getBrandUrl("07_Monogram_Seal/UrbanCraft_Monogram_Seal_transparent.png"),
    ratio: 1,
  },
  outline: {
    src: getBrandUrl("14_Outline_LineArt_Icon/UrbanCraft_Outline_Icon_transparent.png"),
    ratio: 1,
  },
  goldStacked: {
    src: getBrandUrl("13_Single_Color_Gold/UrbanCraft_SingleColor_Gold_Stacked_transparent.png"),
    ratio: 1,
  },
  brownStacked: {
    src: getBrandUrl("12_Single_Color_Brown/UrbanCraft_SingleColor_Brown_Stacked_transparent.png"),
    ratio: 1,
  },
  tagline: {
    src: getBrandUrl("18_Standalone_Tagline/UrbanCraft_Tagline_transparent.png"),
    ratio: 6,
  },
} as const;

export type LogoVariant = keyof typeof LOGO_ASSETS;

export const FAVICONS = {
  ico: getBrandUrl("08_Favicon_App_Icon/favicon.ico"),
  png16: getBrandUrl("08_Favicon_App_Icon/sizes/UrbanCraft_Favicon_16x16.png"),
  png32: getBrandUrl("08_Favicon_App_Icon/sizes/UrbanCraft_Favicon_32x32.png"),
  apple180: getBrandUrl("08_Favicon_App_Icon/sizes/UrbanCraft_Favicon_180x180.png"),
  icon192: getBrandUrl("08_Favicon_App_Icon/sizes/UrbanCraft_Favicon_192x192.png"),
  icon512: getBrandUrl("08_Favicon_App_Icon/sizes/UrbanCraft_Favicon_512x512.png"),
} as const;

export const THEME_COLOR = "#2F3A2E";
