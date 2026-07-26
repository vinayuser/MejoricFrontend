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
import {
  fetchBookingSessionToken,
  markMentorBookingCompleted,
} from "../utils/mentorBooking";
import { capitalizeName } from "../utils/formatters";
import toast from "react-hot-toast";

function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) {
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completing, setCompleting] = useState(false);

  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteUserRef = useRef(null);
  const callStartedAtRef = useRef(null);

  const syncRemotePresence = (client) => {
    const count = (client?.remoteUsers || []).length;
    setRemotePresent(count > 0);
    if (count === 0) {
      remoteUserRef.current = null;
    }
  };

  const playRemote = async (remoteUser, mediaType) => {
    remoteUserRef.current = remoteUser;
    setRemotePresent(true);

    if (mediaType === "audio" && remoteUser.audioTrack) {
      try {
        await remoteUser.audioTrack.play();
      } catch {
        // autoplay may block until gesture
      }
    }
    if (mediaType === "video" && remoteUser.videoTrack && remoteVideoRef.current) {
      try {
        remoteUser.videoTrack.play(remoteVideoRef.current);
      } catch {
        // ignore
      }
    }
  };

  const subscribeExisting = async (client, isAudioOnly) => {
    for (const remoteUser of client.remoteUsers || []) {
      try {
        if (remoteUser.hasAudio) {
          await client.subscribe(remoteUser, "audio");
          await playRemote(remoteUser, "audio");
        }
        if (!isAudioOnly && remoteUser.hasVideo) {
          await client.subscribe(remoteUser, "video");
          await playRemote(remoteUser, "video");
        }
      } catch (err) {
        console.error("[MentorSession] subscribe existing failed", err);
      }
    }
    syncRemotePresence(client);
  };

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
          try {
            await client.subscribe(remoteUser, mediaType);
            await playRemote(remoteUser, mediaType);
          } catch (err) {
            console.error("[MentorSession] subscribe failed", err);
          }
        });

        // Mute/unmute must NOT clear presence — only leave does
        client.on("user-unpublished", () => {
          syncRemotePresence(client);
        });

        client.on("user-left", () => {
          syncRemotePresence(client);
        });

        client.on("user-joined", () => {
          syncRemotePresence(client);
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
        }

        localTracksRef.current = tracks;
        await client.publish(tracks);

        // Play local video after DOM tiles are mounted
        if (!isAudioOnly) {
          const cam = tracks.find((t) => t.trackMediaType === "video");
          // Small delay so the connected UI (and ref) is painted
          requestAnimationFrame(() => {
            if (!cancelled && cam && localVideoRef.current) {
              try {
                cam.play(localVideoRef.current);
              } catch {
                // ignore
              }
            }
          });
        }

        // Critical: subscribe to peer who already joined before us
        await subscribeExisting(client, isAudioOnly);

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

  // Re-attach tracks when UI becomes ready / remote joins
  useEffect(() => {
    if (!connected) return;
    const cam = localTracksRef.current.find((t) => t.trackMediaType === "video");
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
  }, [connected, remotePresent]);

  // Call duration — starts when both sides are present
  useEffect(() => {
    if (!connected || !remotePresent) return undefined;

    if (!callStartedAtRef.current) {
      callStartedAtRef.current = Date.now();
    }

    const tick = () => {
      const start = callStartedAtRef.current || Date.now();
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [connected, remotePresent]);

  const toggleAudio = async () => {
    const mic = localTracksRef.current.find((t) => t.trackMediaType === "audio");
    if (!mic) return;
    const next = !isAudioEnabled;
    await mic.setEnabled(next);
    setIsAudioEnabled(next);
  };

  const toggleVideo = async () => {
    const cam = localTracksRef.current.find((t) => t.trackMediaType === "video");
    if (!cam) return;
    const next = !isVideoEnabled;
    await cam.setEnabled(next);
    setIsVideoEnabled(next);
  };

  const cleanupCall = async () => {
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
  };

  const leaveSession = async () => {
    await cleanupCall();
    const role = sessionMeta?.role;
    navigate(role === "mentor" ? "/mentor-dashboard" : "/my-appointments");
  };

  const completeAndLeave = async () => {
    if (!bookingId || completing) return;
    const ok = window.confirm(
      "Mark this session as completed? Join will be disabled for you and the client.",
    );
    if (!ok) return;

    setCompleting(true);
    try {
      await markMentorBookingCompleted(bookingId);
      toast.success("Session marked as completed");
      await cleanupCall();
      navigate("/mentor-dashboard");
    } catch (err) {
      toast.error(err.message || "Could not complete session");
      setCompleting(false);
    }
  };

  const isAudioOnly = sessionMeta?.callType === "audio";
  const isMentor = sessionMeta?.role === "mentor";
  const peerName = isMentor
    ? capitalizeName(sessionMeta?.booking?.guestName || "Client")
    : capitalizeName(sessionMeta?.booking?.mentorName || "Mentor");
  const title = `Session with ${peerName}`;
  const remoteStatusLabel = remotePresent
    ? `${peerName} connected`
    : isMentor
      ? "Waiting for client…"
      : "Waiting for mentor…";

  if (!authInitialized || !isAuthenticated) return null;

  return (
    <Layout activePage="My Appointments">
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            type="button"
            onClick={() =>
              navigate(isMentor ? "/mentor-dashboard" : "/my-appointments")
            }
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-4"
          >
            <FaArrowLeft />
            Back to appointments
          </button>

          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {sessionMeta?.booking?.slotLabel && (
                <p className="text-slate-400 mt-1">
                  {sessionMeta.booking.slotLabel} ·{" "}
                  {isAudioOnly ? "Audio call" : "Video call"}
                </p>
              )}
            </div>

            {connected ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-center min-w-[7.5rem]">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  {remotePresent ? "Call duration" : "In room"}
                </p>
                <p className="text-xl font-semibold tabular-nums text-white">
                  {remotePresent ? formatElapsed(elapsedSeconds) : "00:00"}
                </p>
              </div>
            ) : null}
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
                onClick={() =>
                  navigate(isMentor ? "/mentor-dashboard" : "/my-appointments")
                }
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold"
              >
                Back to appointments
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 mb-6 ${
                  isAudioOnly
                    ? "grid-cols-1 max-w-xl mx-auto"
                    : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {!isAudioOnly && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                    <div ref={localVideoRef} className="w-full h-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
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
                  {!isAudioOnly && (
                    <div
                      ref={remoteVideoRef}
                      className="w-full h-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
                    />
                  )}
                  {isAudioOnly && (
                    <div className="text-center px-6">
                      <div className="w-20 h-20 rounded-full bg-purple-600/30 flex items-center justify-center mx-auto mb-4">
                        <FaMicrophone className="text-3xl text-purple-300" />
                      </div>
                      <p className="text-lg font-semibold">{remoteStatusLabel}</p>
                    </div>
                  )}
                  {!isAudioOnly && (
                    <span className="absolute bottom-3 left-3 text-xs bg-black/60 px-2 py-1 rounded">
                      {remoteStatusLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
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

                {isMentor ? (
                  <button
                    type="button"
                    disabled={completing}
                    onClick={completeAndLeave}
                    className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
                  >
                    {completing ? "Saving…" : "End & mark completed"}
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
