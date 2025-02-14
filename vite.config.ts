import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  css: {
    postcss: './postcss.config.ts',
  },
  plugins: [react(), tailwindcss()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,  // Change this to a different port if needed
    proxy: {
      "/api": {
        target: "http://localhost:3001",  // Backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
