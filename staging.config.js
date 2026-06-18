/** Staging branch defaults — no .env updates required. */
const stagingConfig = {
  base: "/staging/",
  basePath: "/staging",
  port: 3004,
  devPort: 6001,
  apiBaseUrl: "https://mejoric.com/mateandmentors",
  pixelId: "1282059983369638",
  gaId: "G-T3VEG8DTC8",
  trialChatDuration: 600,
  freeWalletRecharge: 100,
  appEnv: "production",
  socketServerUrl: "https://mejoric.com",
  chatPricePerMin: 8,
  audioCallPricePerMin: 12,
  videoCallPricePerMin: 15,
  videoCallBaseUrl: "https://mateandmentors.yourvideo.live/host/",
  audioCallBaseUrl: "https://matenmentor.yourvideo.live/host/",
};

export function viteEnvDefines() {
  return {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(stagingConfig.apiBaseUrl),
    "import.meta.env.VITE_PIXEL_ID": JSON.stringify(stagingConfig.pixelId),
    "import.meta.env.VITE_GA_ID": JSON.stringify(stagingConfig.gaId),
    "import.meta.env.VITE_TRIAL_CHAT_DURATION": JSON.stringify(
      String(stagingConfig.trialChatDuration),
    ),
    "import.meta.env.VITE_FREE_WALLET_RECHARGE": JSON.stringify(
      String(stagingConfig.freeWalletRecharge),
    ),
    "import.meta.env.VITE_APP_ENV": JSON.stringify(stagingConfig.appEnv),
    "import.meta.env.VITE_SOCKET_SERVER_URL": JSON.stringify(
      stagingConfig.socketServerUrl,
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
