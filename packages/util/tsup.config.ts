import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/propValidator/main.ts",
    "src/converter/stringToHast.ts",
    "src/main.ts",
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
