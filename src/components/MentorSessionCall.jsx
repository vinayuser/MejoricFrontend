import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  FaArrowLeft,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";
import { fetchBookingSessionToken } from "../utils/mentorBooking";
import { capitalizeName } from "../utils/formatters";
import toast from "react-hot-toast";

export default function MentorSessionCall() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authInitialized, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [sessionMeta, setSessionMeta] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remotePresent, setRemotePresent] = useState(false);

  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [authInitialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (!authInitialized || !isAuthenticated || !bookingId) return undefined;

    let cancelled = false;

    const joinSession = async () => {
      setLoading(true);
      setError("");
      try {
        const session = await fetchBookingSessionToken(bookingId);
        if (cancelled) return;

        setSessionMeta(session);
        const isAudioOnly = session.callType === "audio";
        setIsVideoEnabled(!isAudioOnly);

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

        client.on("user-unpublished", () => {
          setRemotePresent(false);
        });

        client.on("user-left", () => {
          setRemotePresent(false);
        });

        await client.join(
          session.appId,
          session.channelName,
          session.token,
          session.uid,
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
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not join session");
          setLoading(false);
          setConnecting(false);
        }
      }
    };

    joinSession();

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
  }, [authInitialized, isAuthenticated, bookingId]);

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

  const leaveSession = async () => {
    localTracksRef.current.forEach((track) => {
      track.stop();
      track.close();
    });
    localTracksRef.current = [];
    if (clientRef.current) {
      await clientRef.current.leave().catch(() => {});
      clientRef.current.removeAllListeners();
      clientRef.current = null;
    }
    navigate("/my-appointments");
  };

  const isAudioOnly = sessionMeta?.callType === "audio";
  const title = sessionMeta?.booking?.mentorName
    ? `Session with ${capitalizeName(sessionMeta.booking.mentorName)}`
    : "Mentor session";

  if (!authInitialized || !isAuthenticated) return null;

  return (
    <Layout activePage="My Appointments">
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            type="button"
            onClick={() => navigate("/my-appointments")}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-4"
          >
            <FaArrowLeft />
            Back to appointments
          </button>

          <div className="mb-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            {sessionMeta?.booking?.slotLabel && (
              <p className="text-slate-400 mt-1">
                {sessionMeta.booking.slotLabel} ·{" "}
                {isAudioOnly ? "Audio call" : "Video call"} · Powered by Agora
              </p>
            )}
          </div>

          {loading || connecting ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-16 text-center">
              <p className="text-lg text-slate-300">
                {loading ? "Preparing session…" : "Connecting…"}
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/40 p-10 text-center">
              <p className="text-red-200 mb-6">{error}</p>
              <button
                type="button"
                onClick={() => navigate("/my-appointments")}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold"
              >
                Back to appointments
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 mb-6 ${
                  isAudioOnly ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {!isAudioOnly && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                    <div ref={localVideoRef} className="w-full h-full" />
                    <span className="absolute bottom-3 left-3 text-xs bg-black/60 px-2 py-1 rounded">
                      You ({capitalizeName(user?.name || "Guest")})
                    </span>
                  </div>
                )}

                <div
                  className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center ${
                    isAudioOnly ? "py-20" : "aspect-video"
                  }`}
                >
                  {!isAudioOnly && <div ref={remoteVideoRef} className="w-full h-full" />}
                  {isAudioOnly && (
                    <div className="text-center px-6">
                      <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center mx-auto mb-4">
                        <FaMicrophone className="text-3xl text-purple-300" />
                      </div>
                      <p className="text-lg font-semibold">
                        {remotePresent ? "Connected" : "Waiting for mentor…"}
                      </p>
                    </div>
                  )}
                  {!isAudioOnly && (
                    <span className="absolute bottom-3 left-3 text-xs bg-black/60 px-2 py-1 rounded">
                      {remotePresent ? "Mentor connected" : "Waiting for mentor…"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`p-4 rounded-full ${
                    isAudioEnabled ? "bg-slate-800" : "bg-red-600"
                  }`}
                  aria-label="Toggle microphone"
                >
                  {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>
                {!isAudioOnly && (
                  <button
                    type="button"
                    onClick={toggleVideo}
                    className={`p-4 rounded-full ${
                      isVideoEnabled ? "bg-slate-800" : "bg-red-600"
                    }`}
                    aria-label="Toggle camera"
                  >
                    {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={leaveSession}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-700"
                  aria-label="Leave session"
                >
                  <FaPhoneSlash />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
