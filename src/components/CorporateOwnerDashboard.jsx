import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaComments,
  FaPhone,
  FaSignOutAlt,
  FaUsers,
  FaVideo,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../utils/api";
import logo from "../img/logo.png";
import "./CorporateOwnerDashboard.css";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_STYLES = {
  pending: "corp-owner-badge-pending",
  partially_paid: "corp-owner-badge-partial",
  paid: "corp-owner-badge-paid",
  overdue: "corp-owner-badge-overdue",
  cancelled: "corp-owner-badge-muted",
};

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="corp-owner-stat">
      {Icon && (
        <div className="corp-owner-stat-icon">
          <Icon />
        </div>
      )}
      <div>
        <p className="corp-owner-stat-label">{label}</p>
        <p className="corp-owner-stat-value">{value}</p>
        {sub && <p className="corp-owner-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

function MinuteBar({ label, used, total, remaining, color }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div className="corp-owner-minute">
      <div className="corp-owner-minute-head">
        <span>{label}</span>
        <span>
          {remaining} / {total} min left
        </span>
      </div>
      <div className="corp-owner-minute-track">
        <div
          className="corp-owner-minute-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function CorporateOwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout, isCorporateOwner, authInitialized } = useAuth();
  const [tab, setTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [membersData, setMembersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("/corporate/owner/dashboard");
      if (res?.success) {
        setDashboard(res.data);
      } else {
        setError(res?.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsage = useCallback(async () => {
    setTabLoading(true);
    try {
      const res = await apiGet("/corporate/owner/usage?limit=50");
      if (res?.success) setUsageData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    setTabLoading(true);
    try {
      const res = await apiGet("/corporate/owner/members?limit=50");
      if (res?.success) setMembersData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authInitialized) return;
    if (!isCorporateOwner) {
      navigate("/corporate/owner/login", { replace: true });
      return;
    }
    loadDashboard();
  }, [authInitialized, isCorporateOwner, loadDashboard, navigate]);

  useEffect(() => {
    if (!isCorporateOwner) return;
    if (tab === "usage" && !usageData) loadUsage();
    if (tab === "members" && !membersData) loadMembers();
  }, [tab, isCorporateOwner, usageData, membersData, loadUsage, loadMembers]);

  const handleLogout = () => {
    logout();
    navigate("/corporate/owner/login", { replace: true });
  };

  if (!authInitialized || loading) {
    return (
      <div className="corp-owner-page">
        <div className="corp-owner-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !dashboard?.corporate) {
    return (
      <div className="corp-owner-page">
        <div className="corp-owner-error">
          <p>{error || "Dashboard unavailable"}</p>
          <button type="button" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const corp = dashboard.corporate;
  const billing = dashboard.billing || {};
  const usageStats = dashboard.usageStats || {};
  const recentUsage = dashboard.recentUsage || [];
  const invoices = dashboard.invoices || [];

  return (
    <div className="corp-owner-page">
      <header className="corp-owner-header">
        <div className="corp-owner-header-brand">
          <img src={logo} alt="Mejoric" />
          <div>
            <p className="corp-owner-header-title">{corp.name}</p>
            <p className="corp-owner-header-sub">Company admin dashboard</p>
          </div>
        </div>
        <div className="corp-owner-header-actions">
          <span className="corp-owner-user">{user?.email}</span>
          <button type="button" onClick={handleLogout} className="corp-owner-logout">
            <FaSignOutAlt />
            Sign out
          </button>
        </div>
      </header>

      <main className="corp-owner-main">
        <section className="corp-owner-stats">
          <StatCard
            icon={FaUsers}
            label="Employees"
            value={corp.memberCount ?? 0}
            sub="Registered on platform"
          />
          <StatCard
            icon={FaChartBar}
            label="Outstanding"
            value={money(billing.totalOutstanding)}
            sub={`${billing.overdueCount || 0} overdue invoice(s)`}
          />
          <StatCard
            label="Platform fee"
            value={money(billing.monthlyPlatformFee)}
            sub={billing.billingCycle || "monthly"}
          />
          <StatCard
            label="Total paid"
            value={money(billing.totalPaid)}
            sub={`${billing.invoiceCount || 0} invoice(s)`}
          />
        </section>

        <section className="corp-owner-pools">
          <h2>Minute pools</h2>
          <div className="corp-owner-pools-grid">
            <MinuteBar
              label="Audio"
              used={corp.audioMinutesUsed || 0}
              total={corp.audioMinutesTotal || 0}
              remaining={corp.audioMinutesRemaining || 0}
              color="#7c3aed"
            />
            <MinuteBar
              label="Video"
              used={corp.videoMinutesUsed || 0}
              total={corp.videoMinutesTotal || 0}
              remaining={corp.videoMinutesRemaining || 0}
              color="#2563eb"
            />
            <MinuteBar
              label="Chat"
              used={corp.chatMinutesUsed || 0}
              total={corp.chatMinutesTotal || 0}
              remaining={corp.chatMinutesRemaining || 0}
              color="#059669"
            />
          </div>
        </section>

        <section className="corp-owner-usage-summary">
          <h2>Usage summary</h2>
          <div className="corp-owner-usage-cards">
            <div className="corp-owner-usage-card">
              <FaPhone />
              <p>Audio</p>
              <strong>{usageStats.audio?.totalMinutes || 0} min</strong>
              <span>{usageStats.audio?.sessions || 0} sessions</span>
            </div>
            <div className="corp-owner-usage-card">
              <FaVideo />
              <p>Video</p>
              <strong>{usageStats.video?.totalMinutes || 0} min</strong>
              <span>{usageStats.video?.sessions || 0} sessions</span>
            </div>
            <div className="corp-owner-usage-card">
              <FaComments />
              <p>Chat</p>
              <strong>{usageStats.chat?.totalMinutes || 0} min</strong>
              <span>{usageStats.chat?.sessions || 0} sessions</span>
            </div>
          </div>
        </section>

        <section className="corp-owner-tabs-section">
          <div className="corp-owner-tabs">
            {[
              ["overview", "Recent activity"],
              ["usage", "Usage log"],
              ["members", "Employees"],
              ["invoices", "Invoices"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="corp-owner-panel">
            {tab === "overview" && (
              <div className="corp-owner-table-wrap">
                <table className="corp-owner-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsage.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="corp-owner-empty">
                          No usage recorded yet
                        </td>
                      </tr>
                    ) : (
                      recentUsage.map((row) => (
                        <tr key={row._id}>
                          <td>{formatDateTime(row.createdAt)}</td>
                          <td>{row.userId?.name || row.userId?.email || "—"}</td>
                          <td>{row.usageType?.toUpperCase()}</td>
                          <td>{row.minutesUsed}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "usage" && (
              <div className="corp-owner-table-wrap">
                {tabLoading ? (
                  <p className="corp-owner-empty">Loading usage...</p>
                ) : (
                  <table className="corp-owner-table">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Minutes</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(usageData?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="corp-owner-empty">
                            No usage logs found
                          </td>
                        </tr>
                      ) : (
                        usageData.data.map((row) => (
                          <tr key={row._id}>
                            <td>{formatDateTime(row.createdAt)}</td>
                            <td>{row.userId?.name || row.userId?.email || "—"}</td>
                            <td>{row.usageType?.toUpperCase()}</td>
                            <td>{row.minutesUsed}</td>
                            <td>{row.source || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "members" && (
              <div className="corp-owner-table-wrap">
                {tabLoading ? (
                  <p className="corp-owner-empty">Loading employees...</p>
                ) : (
                  <table className="corp-owner-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Joined</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(membersData?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="corp-owner-empty">
                            No employees registered yet
                          </td>
                        </tr>
                      ) : (
                        membersData.data.map((row) => (
                          <tr key={row._id}>
                            <td>{row.name || "—"}</td>
                            <td>{row.email}</td>
                            <td>{row.city || "—"}</td>
                            <td>{formatDate(row.createdAt)}</td>
                            <td>
                              <span
                                className={
                                  row.isActive !== false
                                    ? "corp-owner-active"
                                    : "corp-owner-inactive"
                                }
                              >
                                {row.isActive !== false ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "invoices" && (
              <div className="corp-owner-table-wrap">
                <table className="corp-owner-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Period</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="corp-owner-empty">
                          No invoices yet
                        </td>
                      </tr>
                    ) : (
                      invoices.map((row) => (
                        <tr key={row._id}>
                          <td>{row.invoiceNumber}</td>
                          <td>
                            {formatDate(row.periodStart)} – {formatDate(row.periodEnd)}
                          </td>
                          <td>{money(row.totalAmount)}</td>
                          <td>{money(row.amountPaid)}</td>
                          <td>{money(row.balanceDue)}</td>
                          <td>
                            <span
                              className={`corp-owner-badge ${
                                STATUS_STYLES[row.status] || STATUS_STYLES.pending
                              }`}
                            >
                              {(row.status || "pending").replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <p className="corp-owner-footer-note">
          Employee wellness access?{" "}
          <Link to="/corporate/login">Go to employee login</Link>
        </p>
      </main>
    </div>
  );
}
