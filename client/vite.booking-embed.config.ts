import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// Single-file IIFE for pasting into static / marketing pages (custom element self-registers).
export default defineConfig(({ mode }) => ({
  // Dependencies compare process.env.NODE_ENV; browsers have no `process` unless inlined here.
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      mode === "production" ? "production" : "development"
    ),
  },
  publicDir: false,
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: "dist-embed",
    cssCodeSplit: false,
    rollupOptions: {
      checks: { pluginTimings: false },
    },
    lib: {
      entry: path.resolve(__dirname, "src/embed/booking-form-embed.tsx"),
      name: "BookingFormEmbed",
      formats: ["iife"],
      fileName: () => "booking-form.js",
    },
  },
}))
