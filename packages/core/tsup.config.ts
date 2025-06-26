import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/jsx-dev-runtime.ts",
    "src/jsx-runtime.ts",
    "src/main.ts",
    "src/reactivity.ts",
    "src/runtime.ts",
    "src/util.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  minify: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: "/**\n * @license MPL-2.0\n * @copyright takuma-ru\n * @see https://github.com/takuma-ru\n */",
  },
});
