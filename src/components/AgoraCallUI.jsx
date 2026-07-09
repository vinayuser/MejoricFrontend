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

/**
 * In-app Agora RTC call UI for mate instant audio/video calls.
 * @param {{ appId: string, channelName: string, token: string, uid: string|number }} agoraSession
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
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType !== "audio");
  const [remotePresent, setRemotePresent] = useState(false);

  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const onLeaveRef = useRef(onLeave);
  const onConnectedRef = useRef(onConnected);
  const onErrorRef = useRef(onError);

  const isAudioOnly = callType === "audio";

  useEffect(() => {
    onLeaveRef.current = onLeave;
    onConnectedRef.current = onConnected;
    onErrorRef.current = onError;
  }, [onLeave, onConnected, onError]);

  useEffect(() => {
    if (!agoraSession?.appId || !agoraSession?.channelName || !agoraSession?.token) {
      setError("Missing Agora session credentials");
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const joinChannel = async () => {
      setLoading(true);
      setError("");
      try {
        setConnecting(true);
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          setRemotePresent(true);
          if (mediaType === "video" && remoteVideoRef.current) {
            remoteUser.videoTrack?.play(remoteVideoRef.current);
          }
          if (mediaType === "audio") {
            remoteUser.audioTrack?.play();
          }
        });

        client.on("user-unpublished", () => setRemotePresent(false));
        client.on("user-left", () => setRemotePresent(false));

        await client.join(
          agoraSession.appId,
          agoraSession.channelName,
          agoraSession.token,
          agoraSession.uid,
        );

        const tracks = [];
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        tracks.push(micTrack);

        if (!isAudioOnly) {
          const camTrack = await AgoraRTC.createCameraVideoTrack();
          tracks.push(camTrack);
          if (localVideoRef.current) {
            camTrack.play(localVideoRef.current);
          }
        }

        localTracksRef.current = tracks;
        await client.publish(tracks);

        if (!cancelled) {
          setConnected(true);
          setConnecting(false);
          setLoading(false);
          onConnectedRef.current?.();
        }
      } catch (err) {
        if (!cancelled) {
          const message = err?.message || "Could not join call";
          setError(message);
          setLoading(false);
          setConnecting(false);
          onErrorRef.current?.(err);
        }
      }
    };

    joinChannel();

    return () => {
      cancelled = true;
      localTracksRef.current.forEach((track) => {
        track.stop();
        track.close();
      });
      localTracksRef.current = [];
      if (clientRef.current) {
        clientRef.current.leave().catch(() => {});
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
    };
  }, [
    agoraSession?.appId,
    agoraSession?.channelName,
    agoraSession?.token,
    agoraSession?.uid,
    isAudioOnly,
  ]);

  const toggleAudio = async () => {
    const mic = localTracksRef.current.find((t) => t.trackMediaType === "audio");
    if (!mic) return;
    await mic.setEnabled(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = async () => {
    const cam = localTracksRef.current.find((t) => t.trackMediaType === "video");
    if (!cam) return;
    await cam.setEnabled(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleLeave = () => {
    localTracksRef.current.forEach((track) => {
      track.stop();
      track.close();
    });
    localTracksRef.current = [];
    if (clientRef.current) {
      clientRef.current.leave().catch(() => {});
      clientRef.current.removeAllListeners();
      clientRef.current = null;
    }
    onLeaveRef.current?.();
  };

  if (loading || connecting) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-950 text-white ${className}`}>
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300">{loading ? "Preparing call…" : "Connecting…"}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-950 text-white p-8 ${className}`}>
        <p className="text-red-300 mb-6 text-center">{error}</p>
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
    <div className={`flex flex-col bg-slate-950 text-white ${className}`}>
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
                  {remotePresent ? capitalizeName(remoteLabel) : `Waiting for ${capitalizeName(remoteLabel)}…`}
                </p>
                {connected && (
                  <p className="text-sm text-slate-400 mt-2">Audio call · Agora</p>
                )}
              </div>
            )}
            {!isAudioOnly && (
              <span className="absolute bottom-3 left-3 text-xs bg-black/60 px-2 py-1 rounded">
                {remotePresent ? capitalizeName(remoteLabel) : `Waiting for ${capitalizeName(remoteLabel)}…`}
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
        >
          {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        {!isAudioOnly && (
          <button
            type="button"
            onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoEnabled ? "bg-slate-800" : "bg-red-600"}`}
            aria-label="Toggle camera"
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
