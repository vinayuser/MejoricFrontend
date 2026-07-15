import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || (process.env.VITE_APP_ENV === "local" ? 6001 : 3000);

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
          "wss:",
          "http://localhost:*",
          "http://192.168.1.9:*",
          "ws://localhost:*",
          "wss://*.agora.io",
          "https://*.agora.io",
          "wss://*.sd-rtn.com",
          "https://*.sd-rtn.com",
          "https://lumberjack.razorpay.com",
          "https://www.google-analytics.com",
          "https://firebaseinstallations.googleapis.com",
          "https://fcmregistrations.googleapis.com",
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
        mediaSrc: [
          "'self'",
          "blob:",
          "mediastream:",
          "https://mejoric.com",
          "https://*.mejoric.com",
        ],
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

// 4. Static Files
app.use(express.static(path.join(__dirname, "build")));

// 5. Catch-all: serve index.html for all routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🛡️  Secure server running on port ${PORT}`);
});
