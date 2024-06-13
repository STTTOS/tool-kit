import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target =
  // 'https://wwww.wishufree.com'
  "http://localhost:7500";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target,
        changeOrigin: true,
        cookieDomainRewrite: {
          // 'wishufree.com': 'localhost'
        },
      },
      "/static": {
        changeOrigin: true,
        target,
      },
      "/xuan": {
        changeOrigin: true,
        target,
      },
    },
  },
});
