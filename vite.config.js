import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import stagingConfig, { viteEnvDefines } from "./staging.config.js";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: stagingConfig.base,

  define: viteEnvDefines(),

  build: {
    outDir: "build",
  },

  server: {
    port: stagingConfig.devPort,
    cors: true,
    allowedHosts: ["mejoric.com", "www.mejoric.com", "localhost"],
  },
});
