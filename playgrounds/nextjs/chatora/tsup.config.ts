import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/main.ts",
  ],
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "react-dom/server",
    "react-dom/client",
    "chatora",
    "@chatora/react",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
