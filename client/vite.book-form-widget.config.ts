import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  envDir: path.resolve(__dirname),
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      mode === "production" ? "production" : "development",
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
    emptyOutDir: false,
    outDir: "dist",
    cssCodeSplit: false,
    rollupOptions: {
      checks: { pluginTimings: false },
      output: {
        globals: {},
      }
    },
    lib: {
      entry: path.resolve(__dirname, 'src/book-form-widget/index.tsx'),
      name: 'BookingWidget',
      fileName: () => "book-form-widget.js",
      formats: ['iife'],           // Best for direct <script> tag
    },
  },
}))