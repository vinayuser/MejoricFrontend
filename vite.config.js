import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],

    base: env.VITE_BASE || "/staging/",

    build: {
      outDir: "build",
    },

    server: {
      port: 3004,
      cors: true,
      allowedHosts: ["mejoric.com", "www.mejoric.com"],
    },
  };
});