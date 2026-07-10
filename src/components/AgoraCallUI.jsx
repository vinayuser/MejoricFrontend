import React, { useCallback, useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { capitalizeName } from "../utils/formatters";
import { releaseLocalTracks } from "../utils/agoraMedia";

/**
 * In-app Agora RTC call UI for mate instant audio/video calls.
 * Pass `initialTracks` from a click handler so mic/camera keep browser permission.
 */
export default function AgoraCallUI({
  agoraSession,
  callType = "video",
  initialTracks = null,
  localLabel = "You",
  remoteLabel = "Mate",
  onLeave,
  onConnected,
  onError,
  onRemoteLeave,
  className = "",
}) {
  const [connecting, setConnecting] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType !== "audio");
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [remoteAudioOn, setRemoteAudioOn] = useState(false);

  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const onLeaveRef = useRef(onLeave);
  const onConnectedRef = useRef(onConnected);
  const onErrorRef = useRef(onError);
  const onRemoteLeaveRef = useRef(onRemoteLeave);
  const initialTracksRef = useRef(initialTracks);

  const isAudioOnly = callType === "audio";
  const remotePresent = isAudioOnly ? remoteAudioOn : remoteVideoOn || remoteAudioOn;

  useEffect(() => {
    onLeaveRef.current = onLeave;
    onConnectedRef.current = onConnected;
    onErrorRef.current = onError;
    onRemoteLeaveRef.current = onRemoteLeave;
  }, [onLeave, onConnected, onError, onRemoteLeave]);

  const playLocalVideo = useCallback(() => {
    const cam = localTracksRef.current.find((t) => t.trackMediaType === "video");
    if (cam && localVideoRef.current) {
      cam.play(localVideoRef.current);
    }
  }, []);

  const playRemoteUser = useCallback((remoteUser) => {
    if (remoteUser.videoTrack && remoteVideoRef.current) {
      remoteUser.videoTrack.play(remoteVideoRef.current);
      setRemoteVideoOn(true);
    }
    if (remoteUser.audioTrack) {
      remoteUser.audioTrack.play();
      setRemoteAudioOn(true);
    }
  }, []);

  const playAllRemoteUsers = useCallback(
    (client) => {
      (client?.remoteUsers || []).forEach((remoteUser) => {
        playRemoteUser(remoteUser);
      });
    },
    [playRemoteUser],
  );

  useEffect(() => {
    if (!connecting && connected) {
      playLocalVideo();
      playAllRemoteUsers(clientRef.current);
    }
  }, [connecting, connected, playLocalVideo, playAllRemoteUsers]);

  useEffect(() => {
    initialTracksRef.current = initialTracks;
  }, [initialTracks]);

  useEffect(() => {
    if (!agoraSession?.appId || !agoraSession?.channelName || !agoraSession?.token) {
      setError("Missing Agora session credentials");
      setConnecting(false);
      return undefined;
    }

    let cancelled = false;

    const joinChannel = async () => {
      setConnecting(true);
      setError("");
      try {
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === "video") {
            playRemoteUser(remoteUser);
          }
          if (mediaType === "audio") {
            remoteUser.audioTrack?.play();
            setRemoteAudioOn(true);
          }
        });

        client.on("user-unpublished", (_remoteUser, mediaType) => {
          if (mediaType === "video") setRemoteVideoOn(false);
          if (mediaType === "audio") setRemoteAudioOn(false);
        });

        client.on("user-left", () => {
          setRemoteVideoOn(false);
          setRemoteAudioOn(false);
          onRemoteLeaveRef.current?.();
        });

        await client.join(
          agoraSession.appId,
          agoraSession.channelName,
          agoraSession.token,
          agoraSession.uid,
        );

        let tracks = Array.isArray(initialTracksRef.current)
          ? initialTracksRef.current.filter(Boolean)
          : [];

        if (tracks.length === 0) {
          const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
          tracks = [micTrack];
          if (!isAudioOnly) {
            tracks.push(await AgoraRTC.createCameraVideoTrack());
          }
        }

        localTracksRef.current = tracks;
        await client.publish(tracks);

        if (!cancelled) {
          setConnected(true);
          setConnecting(false);
          playLocalVideo();
          playAllRemoteUsers(client);
          onConnectedRef.current?.();
        }
      } catch (err) {
        if (!cancelled) {
          const message = err?.message || "Could not join call";
          setError(message);
          setConnecting(false);
          onErrorRef.current?.(err);
        }
      }
    };

    joinChannel();

    return () => {
      cancelled = true;
      releaseLocalTracks(localTracksRef.current);
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
    playAllRemoteUsers,
    playLocalVideo,
    playRemoteUser,
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
    if (!isVideoEnabled) {
      playLocalVideo();
    }
  };

  const handleLeave = () => {
    releaseLocalTracks(localTracksRef.current);
    localTracksRef.current = [];
    if (clientRef.current) {
      clientRef.current.leave().catch(() => {});
      clientRef.current.removeAllListeners();
      clientRef.current = null;
    }
    onLeaveRef.current?.();
  };

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
    <div className={`relative flex flex-col bg-slate-950 text-white ${className}`}>
      {connecting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-300">Connecting…</p>
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
