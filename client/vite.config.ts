import { defineConfig } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import babel from "@rolldown/plugin-babel"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Crm App",
        short_name: "Crm App",
        description: "Crm App",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/images/powered-by-stripe.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return

          if (id.includes("react")) return "vendor-react"
          if (id.includes("@tanstack")) return "vendor-react-query"
          if (id.includes("@radix-ui")) return "vendor-radix"
          if (id.includes("date-fns") || id.includes("dayjs"))
            return "vendor-date"
          if (id.includes("zod")) return "vendor-zod"
          if (id.includes("sonner")) return "vendor-toast"

          return "vendor-misc"
        },
      },
    },
    chunkSizeWarningLimit: 600, // optional, increase warning threshold
  },
})
