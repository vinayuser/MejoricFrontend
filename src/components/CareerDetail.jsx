import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "./Layout";
import { apiGet } from "../utils/api";
import "./Careers.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000/mateandmentors";

const TYPE_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const emptyApply = {
  name: "",
  email: "",
  mobile: "",
  whyApplying: "",
  cv: null,
};

export default function CareerDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState(emptyApply);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiGet(`/careers/get/${id}`, true);
        if (!res?.success) throw new Error(res?.message || "Not found");
        if (!cancelled) setJob(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Job not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onApplySubmit = async (e) => {
    e.preventDefault();
    if (!form.cv) {
      toast.error("Please upload your CV");
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("email", form.email.trim());
      data.append("mobile", form.mobile.trim());
      data.append("whyApplying", form.whyApplying.trim());
      data.append("cv", form.cv);

      const response = await fetch(`${API_BASE_URL}/careers/${id}/apply`, {
        method: "POST",
        body: data,
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to submit application");
      }
      toast.success("Application submitted — thank you!");
      setApplyOpen(false);
      setForm(emptyApply);
    } catch (err) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout activePage="">
      <section className="bg-purple-100 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link
            to="/careers"
            className="inline-block text-sm font-semibold text-purple-700 hover:text-purple-800 mb-4"
          >
            ← All openings
          </Link>

          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : error || !job ? (
            <p className="text-red-600">{error || "Job not found"}</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  {job.isRemote && (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                      Remote
                    </span>
                  )}
                </div>
                <p className="text-gray-700">
                  {[
                    job.department,
                    TYPE_LABELS[job.employmentType],
                    job.location,
                    job.experience,
                    job.salaryRange,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyOpen(true)}
                className="shrink-0 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
              >
                Apply now
              </button>
            </div>
          )}
        </div>
      </section>

      {!loading && job && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            {job.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <article
              className="careers-prose bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-purple-100/60"
              dangerouslySetInnerHTML={{ __html: job.description || "" }}
            />

            <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-purple-50 p-6 border border-purple-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Ready to join?
                </h3>
                <p className="text-gray-600 text-sm">
                  {job.isRemote ? "Remote role · " : ""}
                  Apply with your CV in a few minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyOpen(true)}
                className="shrink-0 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
              >
                Apply for this role
              </button>
            </div>
          </div>
        </section>
      )}

      {applyOpen && job && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !submitting && setApplyOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="careers-apply-title"
          >
            <div className="flex items-start justify-between gap-3 border-b border-purple-100 px-5 py-4">
              <div>
                <h2
                  id="careers-apply-title"
                  className="text-lg font-bold text-gray-900"
                >
                  Apply — {job.title}
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Tell us a bit about yourself and attach your CV.
                </p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xl text-gray-500 hover:bg-purple-100"
                onClick={() => !submitting && setApplyOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="flex flex-col gap-4 p-5" onSubmit={onApplySubmit}>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
                Full name *
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 font-normal focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
                Email *
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 font-normal focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
                Mobile
                <input
                  value={form.mobile}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, mobile: e.target.value }))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2.5 font-normal focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
                Why are you applying for this role? *
                <textarea
                  required
                  rows={4}
                  value={form.whyApplying}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, whyApplying: e.target.value }))
                  }
                  placeholder="Share your motivation and fit for this role…"
                  className="rounded-xl border border-gray-200 px-3 py-2.5 font-normal focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
                Upload CV (PDF or Word) *
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      cv: e.target.files?.[0] || null,
                    }))
                  }
                  className="font-normal text-sm"
                />
              </label>

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setApplyOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-65"
                >
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
