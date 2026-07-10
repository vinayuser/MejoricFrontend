import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import stagingConfig, { viteEnvDefines } from "./staging.config.js";

function stagingBaseRedirectPlugin(basePath) {
  const base = (basePath || "/").replace(/\/$/, "") || "";
  if (!base || base === "/") return { name: "staging-base-redirect" };

  return {
    name: "staging-base-redirect",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || "/";
        const qIndex = raw.indexOf("?");
        const pathname = qIndex === -1 ? raw : raw.slice(0, qIndex);
        const query = qIndex === -1 ? "" : raw.slice(qIndex);

        if (pathname === base) {
          res.writeHead(301, { Location: `${base}/${query}` });
          res.end();
          return;
        }

        if (pathname === "/" || pathname === "") {
          res.writeHead(301, { Location: `${base}/${query}` });
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const defines = viteEnvDefines();
  const base = env.VITE_BASE || stagingConfig.base;

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
    plugins: [react(), tailwindcss(), stagingBaseRedirectPlugin(base)],

    base,

    define: defines,

    build: {
      outDir: "build",
    },

    server: {
      port: stagingConfig.devPort,
      cors: true,
      allowedHosts: ["mejoric.com", "www.mejoric.com", "localhost"],
      open: "/staging/",
      // Proxy API + sockets to local Server during `npm run dev`
      proxy: {
        "/mateandmentors": {
          target: "http://localhost:3002",
          changeOrigin: true,
        },
        "/staging-api": {
          target: "http://localhost:3002",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/staging-api/, ""),
        },
        "/socket.io": {
          target: "http://localhost:3002",
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
