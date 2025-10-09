import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // 👇 All API requests starting with /api will be forwarded to your backend
      "/api": {
        target: "https://v67p2qfl-5000.uks1.devtunnels.ms/api", // ← change this to your backend base URL
        changeOrigin: true,              // required for virtual hosted sites
        secure: false,                   // allow self-signed certificates (https)
        rewrite: (path) => path.replace(/^\/api/, ""), // remove /api prefix when forwarding
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
