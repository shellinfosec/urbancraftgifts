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
  "/shipping-policy",
  "/cancellation-returns",
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

const webmcpBootstrapScript = `<script id="webmcp-bootstrap">(function(){try{function r(mc){if(!mc||typeof mc.registerTool!=="function")return;mc.registerTool({name:"search_catalogue",description:"Search corporate gifting collections across 16 categories, keywords, and specifications.",inputSchema:{type:"object",properties:{query:{type:"string",description:"Search keyword"},category:{type:"string",description:"Category slug"}}},execute:function(p){var q=(p&&p.query)?encodeURIComponent(p.query):"";window.location.href="/catalogue?q="+q;return Promise.resolve({status:"redirecting",query:q});}});mc.registerTool({name:"get_business_info",description:"Retrieve Urban Craft & Co. verified business contact details, address, and operational hours.",inputSchema:{type:"object",properties:{}},execute:function(){return Promise.resolve({name:"Urban Craft & Co.",phone:"+91 92661 29456",email:"info@urbancraftgifts.com",address:"Ground Floor, 724, Shivaji Rd, Azad Market, Sadar Bazar, New Delhi 110006, India",website:"https://urbancraftgifts.com"});}});mc.registerTool({name:"submit_inquiry",description:"Submit corporate bulk gifting inquiries, required quantities, and target delivery dates.",inputSchema:{type:"object",required:["name","email","phone"],properties:{name:{type:"string",description:"Client contact name"},email:{type:"string",description:"Work email address"},phone:{type:"string",description:"Phone / WhatsApp number"},quantity:{type:"string",description:"Estimated order quantity"},date:{type:"string",description:"Target delivery date in YYYY-MM-DD format"},notes:{type:"string",description:"Gifting requirements, logo customization details"}}},execute:function(p){return fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}).then(function(res){return res.json();});}});}if(typeof document!=="undefined"){if(!document.modelContext&&typeof window!=="undefined"&&window.modelContext){document.modelContext=window.modelContext;}if(!document.modelContext){var t=new Map();document.modelContext={registerTool:function(tool,opts){t.set(tool.name,tool);if(opts&&opts.signal){opts.signal.addEventListener("abort",function(){t.delete(tool.name);});}return Promise.resolve();},unregisterTool:function(n){t.delete(n);return Promise.resolve();},tools:t,listTools:function(){return Array.from(t.values());}};if(typeof window!=="undefined")window.modelContext=document.modelContext;}r(document.modelContext);}}catch(e){console.warn("WebMCP init:",e);}})();</script>`;

async function run() {
  console.log("🚀 Starting local Nitro/TanStack server for static SPA prerendering...");

  // Step 1: Ensure real TanStack Start production manifest is loaded by Nitro
  const serverDir = path.resolve(rootDir, ".output/server");
  if (fs.existsSync(serverDir)) {
    const manifestFiles = fs
      .readdirSync(serverDir)
      .filter((f) => f.startsWith("_tanstack-start-manifest_v-") && f.endsWith(".mjs"));
    if (manifestFiles.length > 0) {
      const realManifestSource = path.join(serverDir, manifestFiles[0]);
      const dummyManifestTarget = path.join(serverDir, "_tanstack-start-manifest_v.mjs");
      fs.copyFileSync(realManifestSource, dummyManifestTarget);
      console.log(
        `  ✓ Patched TanStack Start manifest: ${manifestFiles[0]} -> _tanstack-start-manifest_v.mjs`,
      );
    } else {
      console.warn(
        "  ⚠️ Warning: No hashed _tanstack-start-manifest_v-*.mjs found in .output/server",
      );
    }
  }

  // Find the production client entry script in .output/public/assets
  let clientEntryScript = null;
  const assetsDir = path.resolve(rootDir, ".output/public/assets");
  if (fs.existsSync(assetsDir)) {
    const entryFiles = fs
      .readdirSync(assetsDir)
      .filter((f) => f.startsWith("index-") && f.endsWith(".js"));
    if (entryFiles.length > 0) {
      clientEntryScript = `/assets/${entryFiles[0]}`;
      console.log(`  ✓ Detected production client entry script: ${clientEntryScript}`);
    }
  }

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

  // Ensure all static assets, manifests, and discovery files from public/ are synchronized
  const publicSrcDir = path.resolve(rootDir, "public");
  if (fs.existsSync(publicSrcDir)) {
    fs.cpSync(publicSrcDir, distDir, { recursive: true });
    console.log("  ✓ Synchronized all public/ assets, sitemaps, and .well-known files to dist/");
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
      let html = await res.text();

      // Guard: replace any virtual dev client entry that could have leaked
      if (html.includes("virtual:tanstack-start-dev-client-entry")) {
        console.warn(
          `  ⚠️ Found virtual dev script in route ${route}, replacing with production bundle...`,
        );
        if (clientEntryScript) {
          html = html.replace(
            /(["'])\/@id\/virtual:tanstack-start-dev-client-entry(["'])/g,
            `$1${clientEntryScript}$2`,
          );
          html = html.replace(
            /(["'])virtual:tanstack-start-dev-client-entry(["'])/g,
            `$1${clientEntryScript}$2`,
          );
        }
      }

      // Assert zero virtual dev script references
      if (html.includes("virtual:tanstack-start-dev-client-entry")) {
        throw new Error(`Fatal Error: Route ${route} contains virtual dev client entry!`);
      }

      // Ensure WebMCP browser tools bootstrap script is in the HTML head
      if (!html.includes("search_catalogue") && html.includes("</head>")) {
        html = html.replace("</head>", `${webmcpBootstrapScript}\n</head>`);
      }

      if (route === "/") {
        fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");
        console.log(`  ✓ Prerendered / -> dist/index.html`);
      } else {
        const routeClean = route.replace(/^\/+/, "");
        const targetDirDist = path.join(distDir, routeClean);

        fs.mkdirSync(targetDirDist, { recursive: true });
        fs.writeFileSync(path.join(targetDirDist, "index.html"), html, "utf-8");
        fs.writeFileSync(path.join(distDir, `${routeClean}.html`), html, "utf-8");
        console.log(
          `  ✓ Prerendered ${route} -> dist/${routeClean}/index.html & ${routeClean}.html`,
        );
      }
    } catch (err) {
      console.error(`❌ Error rendering route ${route}:`, err);
      process.exit(1);
    }
  }

  const htaccessSrc = path.join(rootDir, "public/.htaccess");
  if (fs.existsSync(htaccessSrc)) {
    fs.copyFileSync(htaccessSrc, path.join(distDir, ".htaccess"));
    console.log("  ✓ Copied public/.htaccess to dist/.htaccess");
  }

  console.log(
    "✨ All routes and static assets successfully prepared in dist/ for cPanel deployment!",
  );
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error during static SPA prerender:", err);
  process.exit(1);
});
