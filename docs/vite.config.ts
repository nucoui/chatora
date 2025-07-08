import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 5320,
  },
  plugins: [tsConfigPaths(), tanstackStart({
    target: "cloudflare-module",
    sitemap: {
      host: "https://chatora.takumaru.dev",
      enabled: true,
      outputPath: "sitemap.xml",
    },
    pages: [{
      sitemap: { priority: 1.0, changefreq: "always" },
      path: "/",
    }],
  })],
});
