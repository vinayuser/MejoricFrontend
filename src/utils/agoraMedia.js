/**
 * Request mic/camera permission on a user gesture, then release the stream.
 * AgoraCallUI creates its own live tracks after join.
 *
 * Skip is ONLY for local/dev testing via VITE_SKIP_MEDIA_PERMISSION.
 * Never skip in production builds — otherwise both sides join with no
 * published tracks and stay on "Waiting for the other user".
 */
export function shouldSkipMediaPermission() {
  if (import.meta.env.PROD) return false;
  return (
    import.meta.env.VITE_SKIP_MEDIA_PERMISSION === "true" ||
    import.meta.env.VITE_SKIP_MEDIA_PERMISSION === "1"
  );
}

/**
 * @returns {Promise<boolean>} true if devices ok, false if skipped/failed
 */
export async function ensureCallMediaPermission(callType = "video") {
  if (shouldSkipMediaPermission()) {
    console.warn(
      "[Call] Skipping camera/mic permission (VITE_SKIP_MEDIA_PERMISSION)",
    );
    return false;
  }
  try {
    const isAudioOnly = String(callType || "").toLowerCase() === "audio";
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error("Camera/microphone API is not available in this browser");
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isAudioOnly ? false : true,
    });
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // ignore
      }
    });
    return true;
  } catch (err) {
    // In production, surface the error to the caller (do not silently continue)
    if (import.meta.env.PROD) {
      throw err;
    }
    console.warn(
      "[Call] Media permission failed — continuing without devices (dev only):",
      err?.message || err,
    );
    return false;
  }
}

/** @deprecated Prefer ensureCallMediaPermission */
export async function createLocalCallTracks(callType = "video") {
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
  const isAudioOnly = String(callType || "").toLowerCase() === "audio";
  const tracks = [];
  tracks.push(await AgoraRTC.createMicrophoneAudioTrack());
  if (!isAudioOnly) {
    tracks.push(await AgoraRTC.createCameraVideoTrack());
  }
  return tracks;
}

export function releaseLocalTracks(tracks = []) {
  (tracks || []).forEach((track) => {
    try {
      track.stop();
      track.close();
    } catch {
      // ignore
    }
  });
}
