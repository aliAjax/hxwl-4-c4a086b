import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6104,
    strictPort: true
  },
  preview: {
    port: 6104,
    strictPort: true
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts"]
  }
});
