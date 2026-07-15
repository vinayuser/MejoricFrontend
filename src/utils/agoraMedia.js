/**
 * Request mic/camera permission on a user gesture, then release the stream.
 * AgoraCallUI creates its own live tracks after join (avoids Strict Mode closing shared tracks).
 */
export async function ensureCallMediaPermission(callType = "video") {
  const isAudioOnly = String(callType || "").toLowerCase() === "audio";
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
}

/** @deprecated Prefer ensureCallMediaPermission — kept for any leftover imports */
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
