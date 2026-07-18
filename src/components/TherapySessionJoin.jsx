import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiGet, getAuthToken } from "../utils/api";
import { appPath } from "../utils/basePath";
import Layout from "./Layout";

/**
 * Purchase-gated therapy join page.
 * Email links land here; API verifies enrollment before revealing meeting/Agora.
 */
export default function TherapySessionJoin() {
  const { enrollmentId } = useParams();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get("slot");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!getAuthToken()) {
      toast.error("Log in to join your group therapy session");
      navigate(appPath("login"));
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const qs = slotId ? `?slot=${encodeURIComponent(slotId)}` : "";
        const res = await apiGet(
          `/therapy/enrollments/${enrollmentId}/join${qs}`,
        );
        if (cancelled) return;
        if (!res?.success) {
          throw new Error(res?.message || "Unable to join session");
        }
        setSession(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to join session");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enrollmentId, slotId, navigate]);

  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1
          className="text-2xl font-semibold text-slate-900"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Group therapy session
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Access is verified against your purchase. Only enrolled members can
          join.
        </p>

        {loading && (
          <p className="mt-8 text-sm text-slate-600">Checking enrollment…</p>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-900">{error}</p>
            <Link
              to="/community"
              className="mt-4 inline-block text-sm font-medium text-purple-700 underline"
            >
              Back to Community
            </Link>
          </div>
        )}

        {!loading && session && (
          <div className="mt-8 space-y-4 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                {session.theme}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {session.slot?.label || "Session"}
              </p>
              {session.slot?.scheduledAt && (
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(session.slot.scheduledAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  IST
                </p>
              )}
            </div>

            {session.meetingUrl ? (
              <div className="space-y-2">
                {session.meetingPassword && (
                  <p className="text-sm text-slate-600">
                    Passcode:{" "}
                    <strong className="select-all">
                      {session.meetingPassword}
                    </strong>
                  </p>
                )}
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#7c6ba8] px-4 py-3 text-sm font-semibold text-white"
                >
                  Open meeting
                </a>
                <p className="text-xs text-slate-500">
                  Do not share this link. It is only shown after login and
                  purchase verification.
                </p>
              </div>
            ) : session.agora ? (
              <p className="text-sm text-slate-600">
                In-app video is ready for this cohort. Meeting credentials were
                issued for your account.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Meeting details will appear here when the host configures them.
              </p>
            )}

            <Link
              to="/community"
              className="inline-block text-sm font-medium text-slate-600 underline"
            >
              ← Community
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
