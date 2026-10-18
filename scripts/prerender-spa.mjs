import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPublicDir = path.resolve(rootDir, ".output/public");
const distDir = path.resolve(rootDir, "dist");

const staticRoutes = [
  "/",
  "/catalogue",
  "/products",
  "/about",
  "/services",
  "/contact",
  "/testimonials",
  "/faqs",
  "/terms",
  "/privacy-policy",
  "/cookie-policy",
  "/categories",
  "/favorites",
];

const categorySlugs = [
  "2-in-1-gift-sets",
  "3-in-1-gift-sets",
  "4-in-1-gift-sets",
  "5-in-1-gift-sets",
  "6-in-1-gift-sets",
  "7-in-1-gift-sets",
  "premium-bigger-gift-sets",
  "employee-welcome-kits",
  "bottles-drinkware",
  "conference-folders",
  "backpacks",
  "leather-laptop-bags",
  "eco-friendly-laptop-bags",
  "duffle-bags",
  "jute-carry-bags",
  "felt-carry-bags",
];

const allRoutes = [...staticRoutes, ...categorySlugs.map((slug) => `/categories/${slug}`)];

async function run() {
  console.log("🚀 Starting local Nitro/TanStack server for static SPA prerendering...");

  // Set fixed port for prerendering
  process.env.PORT = "3099";
  process.env.NITRO_PORT = "3099";

  await import(pathToFileURL(path.resolve(rootDir, ".output/server/index.mjs")).href);

  // Small delay to ensure server listener is active
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Ensure clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Copy compiled static assets from .output/public into dist/
  if (fs.existsSync(outputPublicDir)) {
    fs.cpSync(outputPublicDir, distDir, { recursive: true });
    console.log(`📦 Copied compiled public assets to dist/`);
  }

  console.log(`📦 Prerendering ${allRoutes.length} static routes into dist/...`);

  for (const route of allRoutes) {
    try {
      const url = `http://localhost:3099${route}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`❌ Failed to fetch ${route} (status: ${res.status})`);
        continue;
      }
      const html = await res.text();

      if (route === "/") {
        fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");
        console.log(`  ✓ Prerendered / -> dist/index.html`);
      } else {
        const routeClean = route.replace(/^\/+/, "");
        const targetDirDist = path.join(distDir, routeClean);

        fs.mkdirSync(targetDirDist, { recursive: true });
        fs.writeFileSync(path.join(targetDirDist, "index.html"), html, "utf-8");
        fs.writeFileSync(path.join(distDir, `${routeClean}.html`), html, "utf-8");
        console.log(`  ✓ Prerendered ${route} -> dist/${routeClean}/index.html & ${routeClean}.html`);
      }
    } catch (err) {
      console.error(`❌ Error rendering route ${route}:`, err);
    }
  }

  const htaccessSrc = path.join(rootDir, "public/.htaccess");
  if (fs.existsSync(htaccessSrc)) {
    fs.copyFileSync(htaccessSrc, path.join(distDir, ".htaccess"));
    console.log("  ✓ Copied public/.htaccess to dist/.htaccess");
  }

  console.log("✨ All routes and static assets successfully prepared in dist/ for cPanel deployment!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error during static SPA prerender:", err);
  process.exit(1);
});
