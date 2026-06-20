import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import stagingConfig, { viteEnvDefines } from "./staging.config.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const defines = viteEnvDefines();

  // Allow front/.env to override staging defaults during local dev
  if (env.VITE_API_BASE_URL) {
    defines["import.meta.env.VITE_API_BASE_URL"] = JSON.stringify(env.VITE_API_BASE_URL);
  }
  if (env.VITE_SOCKET_SERVER_URL) {
    defines["import.meta.env.VITE_SOCKET_SERVER_URL"] = JSON.stringify(
      env.VITE_SOCKET_SERVER_URL,
    );
  }

  return {
    plugins: [react(), tailwindcss()],

    base: env.VITE_BASE || stagingConfig.base,

    define: defines,

    build: {
      outDir: "build",
    },

    server: {
      port: stagingConfig.devPort,
      cors: true,
      allowedHosts: ["mejoric.com", "www.mejoric.com", "localhost"],
    },
  };
});
