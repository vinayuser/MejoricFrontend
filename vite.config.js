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
  const isStagingBase =
    base.includes("/staging") || base.replace(/\/$/, "").endsWith("staging");

  // front/.env overrides staging.config defaults (critical for production builds)
  const envOverrides = [
    "VITE_API_BASE_URL",
    "VITE_SOCKET_SERVER_URL",
    "VITE_APP_ENV",
    "VITE_ALLOW_MOCK_PAYMENTS",
    "VITE_IS_STAGING",
    "VITE_PIXEL_ID",
    "VITE_GA_ID",
    "VITE_TRIAL_CHAT_DURATION",
    "VITE_FREE_WALLET_RECHARGE",
    "VITE_CHAT_PRICE_PER_MIN",
    "VITE_AUDIO_CALL_PRICE_PER_MIN",
    "VITE_VIDEO_CALL_PRICE_PER_MIN",
    "VITE_VIDEO_CALL_BASE_URL",
    "VITE_AUDIO_CALL_BASE_URL",
    "VITE_RAZORPAY_KEY_ID",
    "VITE_AGORA_APP_ID",
    "VITE_AGORA_APP_CERTIFICATE",
    "VITE_AGORA_TOKEN_TTL_SECONDS",
    "VITE_FCM_VAPID_KEY",
  ];
  for (const key of envOverrides) {
    if (env[key] !== undefined && env[key] !== "") {
      defines[`import.meta.env.${key}`] = JSON.stringify(env[key]);
    }
  }

  // Production base (/) must not inherit staging mock-payment defaults
  if (env.VITE_ALLOW_MOCK_PAYMENTS === undefined) {
    defines["import.meta.env.VITE_ALLOW_MOCK_PAYMENTS"] = JSON.stringify(
      String(isStagingBase),
    );
  }
  if (env.VITE_IS_STAGING === undefined) {
    defines["import.meta.env.VITE_IS_STAGING"] = JSON.stringify(
      String(isStagingBase),
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
      allowedHosts: [
        "mejoric.com",
        "www.mejoric.com",
        "dev.mejoric.com",
        "localhost",
      ],
      open: base === "/" || base === "" ? "/" : base,
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
