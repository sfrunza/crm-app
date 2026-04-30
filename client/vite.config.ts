import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  base: "/",
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
  // server: {
  //   port: 3000,
  //   proxy: {
  //     "/api/v1": {
  //       target: process.env.VITE_API_URL,
  //       changeOrigin: true,
  //     },
  //   },
  // },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react")) return "vendor-react";
          if (id.includes("@tanstack")) return "vendor-react-query";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("date-fns") || id.includes("dayjs")) return "vendor-date";
          if (id.includes("zod")) return "vendor-zod";
          if (id.includes("sonner")) return "vendor-toast";

          return "vendor-misc";
        },
      },
    },
    chunkSizeWarningLimit: 600, // optional, increase warning threshold
  },
})
