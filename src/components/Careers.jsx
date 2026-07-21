import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import { apiGet } from "../utils/api";
import "./Careers.css";

const TYPE_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: "12",
      });
      if (search.trim()) qs.set("search", search.trim());
      const res = await apiGet(`/careers/list?${qs}`, true);
      if (!res?.success) throw new Error(res?.message || "Failed to load");
      setJobs(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <Layout activePage="">
      <section className="bg-purple-100 py-10 md:py-14 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3">
            Careers
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Browse open positions at Mejoric.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 bg-purple-50/40">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles or skills…"
              className="w-full rounded-2xl border border-purple-100 bg-white px-5 py-3.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-600 py-12">Loading openings…</p>
          ) : error ? (
            <p className="text-center text-red-600 py-12">{error}</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
              <p className="text-xl font-bold text-gray-900 mb-2">
                No open roles right now
              </p>
              <p className="text-gray-600">
                Check back soon — we’re always growing the team.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/careers/${job.id}`}
                  className="block rounded-2xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl border border-purple-100/60"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">
                          {job.title}
                        </h2>
                        {job.isRemote && (
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                            Remote
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {[
                          job.department,
                          TYPE_LABELS[job.employmentType],
                          job.location,
                          job.experience,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {job.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 self-start rounded-xl border-2 border-purple-500 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50">
                      View role →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4 text-sm text-gray-600">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-purple-200 bg-white px-4 py-2 font-semibold text-gray-800 disabled:opacity-40"
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-purple-200 bg-white px-4 py-2 font-semibold text-gray-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
