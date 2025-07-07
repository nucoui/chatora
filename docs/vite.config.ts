import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 5320,
  },
  plugins: [tsConfigPaths(), tanstackStart({
    target: "cloudflare-module",
  })],
});
