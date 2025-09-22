// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8788", // <--- IMPORTANT: Ensure this is 8788
        changeOrigin: true,
        // The rewrite rule is often not strictly needed if the target already has /api,
        // but including it is harmless:
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
