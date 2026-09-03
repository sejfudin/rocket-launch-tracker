import { applyEnv, resolveConfigSync } from "@povio/resolve-config";
import tailwindCSS from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig as defineVitestConfig } from "vitest/config";

applyEnv((resolveConfigSync({ module: "spa" }) as any).default, "__");

const isInTestMode = process.env.VITEST === "true";

// https://vitejs.dev/config/
const viteConfig = defineViteConfig({
  plugins: [
    codeInspectorPlugin({
      bundler: "vite",
    }),
    tsconfigPaths(),
    !isInTestMode &&
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: "./src/pages",
      }),
    devtools(),
    viteReact(),
    tailwindCSS(),
    !isInTestMode && devtoolsJson(),

    /**
    // yarn add -D rollup-plugin-visualizer
    ...await (async () => {
      try {
        const { visualizer } = await import("rollup-plugin-visualizer");
        return [visualizer({ template: "sunburst", filename: "dist/bundle-stats.html" })];
      } catch {
        return [];
      }
    })()
    **/
  ],
  server: {
    open: false,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    entries: ["app/**/*.{ts,tsx}"],
  },
  worker: {
    format: "es",
  },
});

// https://vitest.dev/config/
const vitestConfig = defineVitestConfig({
  test: {
    root: "./",
    watch: false,
    globals: true,
    reporters: ["default"],
  },
});

export default mergeConfig(viteConfig, vitestConfig);
