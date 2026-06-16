import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isLocal = env.VITE_APP_ENV === "local";

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: "build",
      publicDir: "public",
    },
    server: {
      port: isLocal ? 6001 : 3000,
      cors: true,
      allowedHosts: ["mejoric.com", "www.mejoric.com"],
    },
  };
});
