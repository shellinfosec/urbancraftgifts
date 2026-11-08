import { defineConfig, type PluginOption } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async ({ command }) => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "./src/server.ts" },
    }),
    viteReact(),
  ];

  if (command === "build") {
    try {
      const { nitro } = await import("nitro/vite");
      plugins.push(
        nitro({
          serverEntry: path.resolve(__dirname, "src/server.ts"),
          prerender: {
            crawlLinks: true,
            routes: [
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
              "/sitemap.xml",
            ],
          },
        }),
      );
    } catch {
      // nitro is optional if not available during client-only or custom builds
    }
  }

  return {
    plugins,
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3001",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
