import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    preserveDirectives() as Plugin,
    dts({
      include: ["src"],
      outDir: "./dist/types",
      tsconfigPath: "./tsconfig.app.json",
    }),
    tsconfigPaths({
      configNames: ["tsconfig.app.json"],
    }),
  ],

  build: {
    outDir: "./dist",
    cssCodeSplit: true,
    lib: {
      entry: [
        "src/components/ChatoraWrapper.tsx",
        "src/main.tsx",
      ],
      name: "react",
      fileName: (format, entryName) => {
        if (format === "cjs") {
          return `${entryName}.cjs`;
        }

        if (format === "es") {
          return `${entryName}.js`;
        }

        return `${entryName}.${format}.js`;
      },
      formats: [
        "es",
        "cjs",
      ],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "react-dom/server",
        "chatora",
      ],
      output: {
        exports: "named",
        preserveModules: true,
        interop: "auto",
        globals: {
          "react": "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    commonjsOptions: {
      strictRequires: true,
    },
  },
});
