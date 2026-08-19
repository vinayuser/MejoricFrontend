/** Frontend defaults — production https://mejoric.com , staging https://dev.mejoric.com */
const stagingConfig = {
  base: "/",
  basePath: "",
  port: 3004,
  devPort: 6001,

  /** Staging API (front at https://dev.mejoric.com) */
  apiBaseUrl: "https://mejoric.com/staging-api/mateandmentors",
  socketServerUrl: "https://mejoric.com/staging-api",

  /** Production API (front at https://mejoric.com) */
  productionApiBaseUrl: "https://mejoric.com/mateandmentors",
  productionSocketServerUrl: "https://mejoric.com",

  /** Local `npm run dev` — set in front/.env */
  localApiBaseUrl: "http://localhost:3002/mateandmentors",
  localSocketServerUrl: "http://localhost:3002",

  pixelId: "1282059983369638",
  gaId: "G-T3VEG8DTC8",
  trialChatDuration: 600,
  freeWalletRecharge: 100,
  appEnv: "production",
  allowMockPayments: false,
  isStaging: false,
  chatPricePerMin: 8,
  audioCallPricePerMin: 12,
  videoCallPricePerMin: 15,
  videoCallBaseUrl: "https://mateandmentors.yourvideo.live/host/",
  audioCallBaseUrl: "https://matenmentor.yourvideo.live/host/",
};

export function viteEnvDefines() {
  return {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(stagingConfig.apiBaseUrl),
    "import.meta.env.VITE_PRODUCTION_API_BASE_URL": JSON.stringify(
      stagingConfig.productionApiBaseUrl,
    ),
    "import.meta.env.VITE_PIXEL_ID": JSON.stringify(stagingConfig.pixelId),
    "import.meta.env.VITE_GA_ID": JSON.stringify(stagingConfig.gaId),
    "import.meta.env.VITE_TRIAL_CHAT_DURATION": JSON.stringify(
      String(stagingConfig.trialChatDuration),
    ),
    "import.meta.env.VITE_FREE_WALLET_RECHARGE": JSON.stringify(
      String(stagingConfig.freeWalletRecharge),
    ),
    "import.meta.env.VITE_APP_ENV": JSON.stringify(stagingConfig.appEnv),
    "import.meta.env.VITE_ALLOW_MOCK_PAYMENTS": JSON.stringify(
      String(stagingConfig.allowMockPayments),
    ),
    "import.meta.env.VITE_IS_STAGING": JSON.stringify(
      String(stagingConfig.isStaging),
    ),
    "import.meta.env.VITE_SOCKET_SERVER_URL": JSON.stringify(
      stagingConfig.socketServerUrl,
    ),
    "import.meta.env.VITE_PRODUCTION_SOCKET_SERVER_URL": JSON.stringify(
      stagingConfig.productionSocketServerUrl,
    ),
    "import.meta.env.VITE_CHAT_PRICE_PER_MIN": JSON.stringify(
      String(stagingConfig.chatPricePerMin),
    ),
    "import.meta.env.VITE_AUDIO_CALL_PRICE_PER_MIN": JSON.stringify(
      String(stagingConfig.audioCallPricePerMin),
    ),
    "import.meta.env.VITE_VIDEO_CALL_PRICE_PER_MIN": JSON.stringify(
      String(stagingConfig.videoCallPricePerMin),
    ),
    "import.meta.env.VITE_VIDEO_CALL_BASE_URL": JSON.stringify(
      stagingConfig.videoCallBaseUrl,
    ),
    "import.meta.env.VITE_AUDIO_CALL_BASE_URL": JSON.stringify(
      stagingConfig.audioCallBaseUrl,
    ),
  };
}

export default stagingConfig;
