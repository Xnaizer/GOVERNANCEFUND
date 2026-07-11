import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { port: 3000, allowedHosts: ["7e34-202-150-75-56.ngrok-free.app"] },
  optimizeDeps: { include: ["@repo/shared"] },
});
