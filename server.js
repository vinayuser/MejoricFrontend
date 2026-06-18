import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import stagingConfig from "./staging.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || stagingConfig.port;
const BASE_PATH = stagingConfig.basePath;

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.razorpay.com",
          "https://cdn.razorpay.com",
          "https://connect.facebook.net",
          "https://www.googletagmanager.com",
          "https://www.gstatic.com", // Firebase scripts
        ],
        workerSrc: ["'self'", "blob:", "https://www.gstatic.com"], // 🛡️ Allow Service Workers
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://www.facebook.com",
          "https://i.ytimg.com",
        ],
        connectSrc: [
          "'self'",
          "https:",
          "http://localhost:*",
          "http://192.168.1.9:*",
          "ws://localhost:*",
          "https://lumberjack.razorpay.com",
          "https://www.google-analytics.com",
          "https://firebaseinstallations.googleapis.com", // Firebase API
          "https://fcmregistrations.googleapis.com", // FCM API
        ],
        frameSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://tds.razorpay.com",
          "https://www.youtube.com",
          "https://youtube.com",
          "https://mateandmentors.yourvideo.live",
          "https://matenmentor.yourvideo.live",
        ],
        mediaSrc: ["'self'", "https://mejoric.com", "https://*.mejoric.com"], // 🛡️ Allow audio/video files
        upgradeInsecureRequests: null,
      },
    },
    hsts: false,
  }),
);

// 2. Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: "Too many requests from this IP, please try again after 15 minutes",
// });
// app.use(limiter);

// 3. Compression
app.use(compression());

// 4. Static Files + SPA fallback (supports subpath deploy e.g. /staging)
const buildDir = path.join(__dirname, "build");

if (BASE_PATH) {
  app.use(BASE_PATH, express.static(buildDir));
  app.get(`${BASE_PATH}/*`, (req, res) => {
    res.sendFile(path.join(buildDir, "index.html"));
  });
  app.get("/", (req, res) => {
    res.redirect(`${BASE_PATH}/`);
  });
} else {
  app.use(express.static(buildDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🛡️  Secure server running on port ${PORT}`);
});
