import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { capitalizeName } from "../utils/formatters";
import { releaseLocalTracks, shouldSkipMediaPermission } from "../utils/agoraMedia";

const JOIN_TIMEOUT_MS = 20000;

function withTimeout(promise, ms, message) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}

function friendlyCallError(err) {
  const raw = String(err?.message || err?.code || err || "");
  const lower = raw.toLowerCase();
  if (lower.includes("uid_conflict") || lower.includes("uid conflict")) {
    return "Could not connect to the call. Please close other call tabs and try again.";
  }
  if (
    lower.includes("permission") ||
    lower.includes("notallowed") ||
    lower.includes("device")
  ) {
    return "Microphone/camera permission is required. Please allow access and try again.";
  }
  if (
    lower.includes("timeout") ||
    lower.includes("network") ||
    lower.includes("gateway")
  ) {
    return "Could not connect to the call. Please check your network and try again.";
  }
  return (
    raw
      .replace(/^AgoraRTCError\s*/i, "")
      .replace(/^RTCError\s*/i, "")
      .replace(/_/g, " ")
      .trim() || "Could not join the call. Please try again."
  );
}

/**
 * Simple 1:1 call UI — join once, publish mic/camera, subscribe to peer.
 */
export default function AgoraCallUI({
  agoraSession,
  callType = "video",
  localLabel = "You",
  remoteLabel = "Mate",
  onLeave,
  onConnected,
  onError,
  className = "",
}) {
  const isAudioOnly = String(callType || "video").toLowerCase() === "audio";

  const [connecting, setConnecting] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("Connecting…");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!isAudioOnly);
  const [remoteJoined, setRemoteJoined] = useState(false);

  const clientRef = useRef(null);
  const tracksRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteUserRef = useRef(null);
  const onLeaveRef = useRef(onLeave);
  const onConnectedRef = useRef(onConnected);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLeaveRef.current = onLeave;
    onConnectedRef.current = onConnected;
    onErrorRef.current = onError;
  }, [onLeave, onConnected, onError]);

  useEffect(() => {
    const appId = agoraSession?.appId;
    const channelName = agoraSession?.channelName;
    const token = agoraSession?.token;
    const uid = Number(agoraSession?.uid);

    if (!appId || !channelName || !token) {
      setError("Missing call session credentials");
      setConnecting(false);
      return undefined;
    }
    if (token === "mock_agora_token") {
      setError("Voice/video calling is not configured on the server.");
      setConnecting(false);
      return undefined;
    }
    if (!Number.isFinite(uid) || uid <= 0) {
      setError("Invalid call session. Please try again.");
      setConnecting(false);
      return undefined;
    }

    let cancelled = false;
    let client = null;

    const playLocalVideo = () => {
      const cam = tracksRef.current.find((t) => t.trackMediaType === "video");
      if (cam && localVideoRef.current) {
        try {
          cam.play(localVideoRef.current);
        } catch {
          // ignore
        }
      }
    };

    const playRemote = async (user, mediaType) => {
      remoteUserRef.current = user;
      if (!cancelled) setRemoteJoined(true);

      if (mediaType === "audio" && user.audioTrack) {
        try {
          await user.audioTrack.play();
        } catch {
          // autoplay may require a click; still mark joined
        }
      }
      if (mediaType === "video" && user.videoTrack && remoteVideoRef.current) {
        try {
          user.videoTrack.play(remoteVideoRef.current);
        } catch {
          // ignore
        }
      }
    };

    const subscribeExisting = async (rtc) => {
      for (const user of rtc.remoteUsers || []) {
        try {
          if (user.hasAudio) {
            await rtc.subscribe(user, "audio");
            await playRemote(user, "audio");
          }
          if (!isAudioOnly && user.hasVideo) {
            await rtc.subscribe(user, "video");
            await playRemote(user, "video");
          }
        } catch (err) {
          console.error("[Call] subscribe existing failed", err);
        }
      }
    };

    const teardown = async () => {
      const tracks = tracksRef.current;
      tracksRef.current = [];
      releaseLocalTracks(tracks);

      const rtc = client || clientRef.current;
      client = null;
      clientRef.current = null;
      if (!rtc) return;
      try {
        rtc.removeAllListeners();
      } catch {
        // ignore
      }
      try {
        await rtc.leave();
      } catch {
        // ignore
      }
    };

    const start = async () => {
      setConnecting(true);
      setConnected(false);
      setRemoteJoined(false);
      setError("");
      setStatusText("Connecting…");

      try {
        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType);
            await playRemote(user, mediaType);
          } catch (err) {
            console.error("[Call] subscribe failed", err);
          }
        });

        client.on("user-joined", (user) => {
          console.log("[Call] Remote user joined channel:", user?.uid);
          if (!cancelled) setRemoteJoined(true);
        });

        client.on("user-left", (user) => {
          if (remoteUserRef.current?.uid === user.uid) {
            remoteUserRef.current = null;
          }
          if ((client?.remoteUsers || []).length === 0 && !cancelled) {
            setRemoteJoined(false);
          }
        });

        setStatusText("Joining…");
        const joinOnce = () =>
          withTimeout(
            client.join(appId, channelName, token, uid),
            JOIN_TIMEOUT_MS,
            "Could not connect to the call. Please check your network and try again.",
          );

        try {
          await joinOnce();
        } catch (joinErr) {
          const msg = String(joinErr?.message || joinErr || "").toLowerCase();
          if (msg.includes("uid_conflict") || msg.includes("uid conflict")) {
            try {
              await client.leave();
            } catch {
              // ignore
            }
            await new Promise((r) => setTimeout(r, 400));
            await joinOnce();
          } else {
            throw joinErr;
          }
        }

        if (cancelled) return;

        // Must publish local tracks or the other side stays on "Waiting…"
        setStatusText(isAudioOnly ? "Starting microphone…" : "Starting camera…");
        let tracks = [];
        try {
          if (shouldSkipMediaPermission()) {
            console.warn(
              "[Call] Dev skip: joining without local media (peers will keep waiting)",
            );
          } else {
            tracks = [await AgoraRTC.createMicrophoneAudioTrack()];
            if (!isAudioOnly) {
              tracks.push(await AgoraRTC.createCameraVideoTrack());
            }
          }
        } catch (mediaErr) {
          console.error("[Call] Local media failed:", mediaErr);
          throw new Error(
            isAudioOnly
              ? "Microphone access is required for audio calls. Please allow permission and try again."
              : "Camera and microphone access are required for video calls. Please allow permission and try again.",
          );
        }

        if (cancelled) {
          releaseLocalTracks(tracks);
          return;
        }

        tracksRef.current = tracks;
        if (tracks.length) {
          setStatusText("Connecting…");
          await client.publish(tracks);
          playLocalVideo();
        }

        if (cancelled) return;

        setConnected(true);
        setConnecting(false);
        setStatusText("");
        await subscribeExisting(client);
        // Mark remote present if they already joined before we finished publishing
        if ((client.remoteUsers || []).length > 0) {
          setRemoteJoined(true);
        }
        onConnectedRef.current?.();
      } catch (err) {
        console.error("[Call] failed", err);
        if (!cancelled) {
          setError(friendlyCallError(err));
          setConnecting(false);
          onErrorRef.current?.(err);
        }
        await teardown();
      }
    };

    start();

    return () => {
      cancelled = true;
      void teardown();
    };
  }, [
    agoraSession?.appId,
    agoraSession?.channelName,
    agoraSession?.token,
    agoraSession?.uid,
    isAudioOnly,
  ]);

  useEffect(() => {
    if (!connected || connecting) return;
    const cam = tracksRef.current.find((t) => t.trackMediaType === "video");
    if (cam && localVideoRef.current) {
      try {
        cam.play(localVideoRef.current);
      } catch {
        // ignore
      }
    }
    const remote = remoteUserRef.current;
    if (remote?.videoTrack && remoteVideoRef.current) {
      try {
        remote.videoTrack.play(remoteVideoRef.current);
      } catch {
        // ignore
      }
    }
  }, [connected, connecting, remoteJoined]);

  const toggleAudio = async () => {
    const mic = tracksRef.current.find((t) => t.trackMediaType === "audio");
    if (!mic) return;
    const next = !isAudioEnabled;
    await mic.setEnabled(next);
    setIsAudioEnabled(next);
  };

  const toggleVideo = async () => {
    const cam = tracksRef.current.find((t) => t.trackMediaType === "video");
    if (!cam) return;
    const next = !isVideoEnabled;
    await cam.setEnabled(next);
    setIsVideoEnabled(next);
    if (next && localVideoRef.current) {
      try {
        cam.play(localVideoRef.current);
      } catch {
        // ignore
      }
    }
  };

  const handleLeave = () => {
    releaseLocalTracks(tracksRef.current);
    tracksRef.current = [];
    const client = clientRef.current;
    clientRef.current = null;
    if (client) {
      try {
        client.removeAllListeners();
      } catch {
        // ignore
      }
      client.leave().catch(() => {});
    }
    onLeaveRef.current?.();
  };

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-950 text-white p-8 ${className}`}
      >
        <p className="text-red-300 mb-6 text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={handleLeave}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col bg-slate-950 text-white ${className}`}>
      {connecting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-300">{statusText || "Connecting…"}</p>
        </div>
      )}

      <div className="flex-1 p-4 overflow-hidden">
        <div
          className={`grid gap-4 h-full ${
            isAudioOnly ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          {!isAudioOnly && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[200px]">
              <div ref={localVideoRef} className="w-full h-full" />
              <span className="absolute bottom-3 left-3 text-xs bg-black/60 px-2 py-1 rounded">
                {capitalizeName(localLabel)}
              </span>
            </div>
          )}

          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center ${
              isAudioOnly ? "py-16" : "aspect-video min-h-[200px]"
            }`}
          >
            {!isAudioOnly && <div ref={remoteVideoRef} className="w-full h-full" />}
            {isAudioOnly && (
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center mx-auto mb-4">
                  <FaMicrophone className="text-3xl text-purple-300" />
                </div>
                <p className="text-lg font-semibold">
                  {remoteJoined
                    ? capitalizeName(remoteLabel)
                    : connected
                      ? `Waiting for ${capitalizeName(remoteLabel)}…`
                      : "Connecting…"}
                </p>
                {connected && (
                  <p className="text-sm text-slate-400 mt-2">
                    {remoteJoined ? "Connected" : "Audio call"}
                  </p>
                )}
              </div>
            )}
            {!isAudioOnly && (
              <span className="absolute bottom-3 left-3 text-xs bg-black/60 px-2 py-1 rounded">
                {remoteJoined
                  ? capitalizeName(remoteLabel)
                  : `Waiting for ${capitalizeName(remoteLabel)}…`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={toggleAudio}
          className={`p-4 rounded-full ${isAudioEnabled ? "bg-slate-800" : "bg-red-600"}`}
          aria-label="Toggle microphone"
          disabled={connecting}
        >
          {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        {!isAudioOnly && (
          <button
            type="button"
            onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoEnabled ? "bg-slate-800" : "bg-red-600"}`}
            aria-label="Toggle camera"
            disabled={connecting}
          >
            {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </button>
        )}
        <button
          type="button"
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700"
          aria-label="End call"
        >
          <FaPhoneSlash />
        </button>
      </div>
    </div>
  );
}
