import AgoraRTC from "agora-rtc-sdk-ng";

/** Create mic (+ camera for video) inside a user-gesture handler before async API calls. */
export async function createLocalCallTracks(callType = "video") {
  const tracks = [];
  const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
  tracks.push(micTrack);

  if (callType !== "audio") {
    const camTrack = await AgoraRTC.createCameraVideoTrack();
    tracks.push(camTrack);
  }

  return tracks;
}

export function releaseLocalTracks(tracks = []) {
  tracks.forEach((track) => {
    try {
      track.stop();
      track.close();
    } catch {
      // ignore cleanup errors
    }
  });
}
