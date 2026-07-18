import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { apiGet, apiPost, getAuthToken } from "../utils/api";
import { ensureCommunityUnlocked } from "../utils/communityUnlockPayment";
import { enrollInTherapyCohort } from "../utils/therapyEnrollmentPayment";
import { appPath } from "../utils/basePath";
import "./Community.css";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || "https://mejoric.com";

const TABS = [
  { id: "communities", label: "🏡 Communities" },
  { id: "therapy", label: "🌱 Group Therapy", badge: "New" },
  { id: "feed", label: "💬 Community Feed" },
];

function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function CommunityCard({ community, joined, unlocking, onToggleJoin }) {
  return (
    <div className="community-card">
      <div
        className="community-cc-top"
        style={{ background: `${community.col}18` }}
      >
        <span className="community-cc-emoji">{community.emoji}</span>
        {joined && (
          <span className="community-cc-joined-mark">Joined</span>
        )}
      </div>
      <div className="community-cc-body">
        <div className="community-cc-name">{community.name}</div>
        <div className="community-cc-desc">{community.desc}</div>
        <div className="community-cc-who">
          <span className="community-cc-who-label">For you if:</span>
          {community.who}
        </div>
        <div className="community-cc-foot">
          <div className="community-cc-members">
            <div className="community-cc-avatars">
              {(community.avs || []).slice(0, 3).map((color) => (
                <div
                  key={color}
                  className="community-cc-av-mini"
                  style={{ background: color }}
                >
                  ·
                </div>
              ))}
            </div>
            {community.members === 1
              ? "1 member"
              : `${community.members || 0} members`}
          </div>
          <button
            type="button"
            className="community-cc-join-btn"
            disabled={unlocking}
            style={{
              background: joined ? "var(--warm3)" : community.col,
              color: joined ? "var(--muted)" : "#ffffff",
            }}
            onClick={() => onToggleJoin(community)}
          >
            {joined ? "Joined ✓" : unlocking ? "…" : "Join →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TherapyCard({ cohort, busy, onEnrol }) {
  const taken = cohort.taken ?? cohort.takenSeats ?? 0;
  const total = cohort.total ?? cohort.totalSeats ?? 8;
  const pct = Math.round((taken / Math.max(total, 1)) * 100);
  const full = taken >= total;
  const enrolled = Boolean(cohort.enrolled);
  const waitlisted = Boolean(cohort.waitlisted);
  const priceLabel =
    cohort.priceLabel ||
    (cohort.price != null ? `₹${cohort.price}` : cohort.price);

  return (
    <div className="community-therapy-card">
      <div
        className="community-tc-band"
        style={{ background: cohort.band }}
      />
      <div className="community-tc-body">
        <div
          className="community-tc-tag"
          style={{
            background: `${cohort.band}22`,
            color: cohort.band,
          }}
        >
          {cohort.tag}
        </div>
        <div className="community-tc-title">{cohort.theme}</div>
        <div className="community-tc-sub">
          {cohort.sub || cohort.description}
        </div>
        <div className="community-tc-stats">
          <div className="community-tc-stat">
            <div className="community-tc-sv">
              {cohort.sessions ?? cohort.sessionsCount}
            </div>
            <div className="community-tc-sl">Sessions</div>
          </div>
          <div className="community-tc-stat">
            <div className="community-tc-sv">{cohort.dur}</div>
            <div className="community-tc-sl">Each</div>
          </div>
          <div className="community-tc-stat">
            <div className="community-tc-sv">{cohort.day || cohort.dayLabel}</div>
            <div className="community-tc-sl">Day</div>
          </div>
        </div>
        <div className="community-tc-seats">
          <div className="community-tc-seats-lbl">
            <span>
              {full
                ? "Full — join waitlist"
                : `${total - taken} of ${total} seats left`}
            </span>
            <span>
              {taken}/{total}
            </span>
          </div>
          <div className="community-tc-seat-bar">
            <div
              className="community-tc-seat-fill"
              style={{ width: `${pct}%`, background: cohort.band }}
            />
          </div>
        </div>
        <div className="community-tc-who">
          <strong>Who it&apos;s for:</strong> {cohort.who}
        </div>
        <div className="community-tc-foot">
          <div>
            <div className="community-tc-price">{priceLabel}</div>
            <div className="community-tc-price-sub">
              Full cohort · join from Mejoric only
            </div>
          </div>
          {enrolled ? (
            <button
              type="button"
              className="community-tc-btn"
              style={{ background: cohort.band }}
              onClick={() =>
                onEnrol(cohort, { openSessions: true })
              }
            >
              My sessions →
            </button>
          ) : waitlisted ? (
            <button type="button" className="community-tc-waitlist" disabled>
              Waitlisted
            </button>
          ) : full ? (
            <button
              type="button"
              className="community-tc-waitlist"
              disabled={busy}
              onClick={() => onEnrol(cohort)}
            >
              {busy ? "…" : "Join Waitlist"}
            </button>
          ) : (
            <button
              type="button"
              className="community-tc-btn"
              style={{ background: cohort.band }}
              disabled={busy}
              onClick={() => onEnrol(cohort)}
            >
              {busy ? "…" : "Enrol Now →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedPost({ post, communityName, communityColor }) {
  const author = post.author || {};
  const isAnon = Boolean(author.isAnonymous);
  return (
    <div className="community-feed-post">
      <div className="community-fp-hdr">
        <div
          className="community-fp-av"
          style={{ background: communityColor || "#7c6ba8" }}
        >
          {author.avatarInitial || (isAnon ? "A" : "M")}
        </div>
        <div>
          <div className="community-fp-nm">
            {author.displayName || "Member"}{" "}
            {isAnon && (
              <span className="community-anon-badge">anon</span>
            )}
          </div>
          <div className="community-fp-time">{timeAgo(post.createdAt)}</div>
        </div>
        {communityName && (
          <div
            className="community-post-community-badge"
            style={{ color: communityColor }}
          >
            {communityName}
          </div>
        )}
      </div>
      <div className="community-fp-body">{post.content}</div>
    </div>
  );
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("communities");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCommunityId, setActiveCommunityId] = useState(null);
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [postText, setPostText] = useState("");
  const [chatText, setChatText] = useState("");

  const [communities, setCommunities] = useState([]);
  const [therapyCohorts, setTherapyCohorts] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockAmount, setUnlockAmount] = useState(100);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingTherapy, setLoadingTherapy] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [busyTherapyId, setBusyTherapyId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [onlineByCommunity, setOnlineByCommunity] = useState({});
  const [sendingChat, setSendingChat] = useState(false);

  const socketRef = useRef(null);
  const activeCommunityIdRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const loadCommunities = useCallback(async () => {
    setLoadingList(true);
    try {
      const token = getAuthToken();
      const res = await apiGet("/communities/list", !token);
      if (res?.success && res.data) {
        setCommunities(res.data.communities || []);
        setUnlocked(Boolean(res.data.unlocked));
        if (res.data.unlockAmount) {
          setUnlockAmount(res.data.unlockAmount);
        }
      }
      if (token) {
        try {
          const status = await apiGet("/communities/access/status");
          if (status?.success && status.data) {
            setUnlocked(Boolean(status.data.unlocked));
            if (status.data.unlockAmount) {
              setUnlockAmount(status.data.unlockAmount);
            }
          }
        } catch {
          /* ignore if unauthenticated edge */
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load communities");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadTherapy = useCallback(async () => {
    setLoadingTherapy(true);
    try {
      const token = getAuthToken();
      const res = await apiGet("/therapy/list", !token);
      if (res?.success) {
        setTherapyCohorts(res.data?.cohorts || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load therapy cohorts");
    } finally {
      setLoadingTherapy(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  useEffect(() => {
    loadTherapy();
  }, [loadTherapy]);

  const joinedCommunities = useMemo(
    () => communities.filter((c) => c.joined),
    [communities],
  );
  const discoverCommunities = useMemo(
    () => communities.filter((c) => !c.joined).slice(0, 8),
    [communities],
  );

  const activeCommunity = useMemo(() => {
    if (!activeCommunityId) return joinedCommunities[0] || communities[0] || null;
    return (
      communities.find((c) => c.id === activeCommunityId) ||
      joinedCommunities[0] ||
      null
    );
  }, [activeCommunityId, communities, joinedCommunities]);

  activeCommunityIdRef.current =
    activeTab === "feed" && activeCommunity?.joined
      ? activeCommunity.id
      : null;

  const currentUserId = useMemo(() => {
    const u = getStoredUser();
    return String(u?._id || u?.id || u?.user?._id || u?.user?.id || "");
  }, [unlocked, communities.length]);

  const loadFeedAndChat = useCallback(async (communityId) => {
    if (!communityId || !getAuthToken()) {
      setPosts([]);
      setMessages([]);
      return;
    }
    setLoadingFeed(true);
    try {
      const [postsRes, msgRes] = await Promise.all([
        apiGet(`/communities/${communityId}/posts?limit=30`),
        apiGet(`/communities/${communityId}/messages?limit=50`),
      ]);
      if (postsRes?.success) setPosts(postsRes.data?.data || []);
      if (msgRes?.success) setMessages(msgRes.data?.data || []);
    } catch (err) {
      if (err.status === 403 || err.status === 402) {
        setPosts([]);
        setMessages([]);
      } else {
        console.error(err);
      }
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "feed" && activeCommunity?.joined) {
      loadFeedAndChat(activeCommunity.id);
    }
  }, [activeTab, activeCommunity?.id, activeCommunity?.joined, loadFeedAndChat]);

  // Socket: connect once while logged in; watch joined communities for online counts
  useEffect(() => {
    if (!getAuthToken() || !currentUserId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setOnlineByCommunity({});
      return undefined;
    }

    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const joinActiveRoom = () => {
      const cid = activeCommunityIdRef.current;
      if (cid) {
        socket.emit("join_community", {
          communityId: cid,
          userId: currentUserId,
        });
        socket.__joinedCommunityId = String(cid);
      }
    };

    socket.on("connect", () => {
      socket.emit("register_user", currentUserId);
      const ids = joinedCommunities.map((c) => c.id);
      if (ids.length) socket.emit("community_watch", { communityIds: ids });
      joinActiveRoom();
    });

    socket.on("community_online_counts", (counts) => {
      if (counts && typeof counts === "object") {
        setOnlineByCommunity((prev) => ({ ...prev, ...counts }));
      }
    });

    socket.on("community_online", ({ communityId, online } = {}) => {
      if (!communityId) return;
      setOnlineByCommunity((prev) => ({
        ...prev,
        [String(communityId)]: Number(online) || 0,
      }));
    });

    socket.on("community_new_message", ({ communityId, message } = {}) => {
      if (!message?.id || !communityId) return;
      if (String(communityId) !== String(activeCommunityIdRef.current)) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        const isMine =
          String(message.authorId || "") === String(currentUserId);
        return [...prev, { ...message, isMine }];
      });
    });

    socket.on("community_error", ({ message } = {}) => {
      if (message) toast.error(message);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
    // Reconnect when user id changes; watch list updated in separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Keep watch rooms in sync with memberships
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    const ids = joinedCommunities.map((c) => c.id);
    socket.emit("community_watch", { communityIds: ids });
  }, [joinedCommunities]);

  // Join / leave community chat room when feed community changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !currentUserId) return;

    const prevId = socket.__joinedCommunityId;
    const nextId =
      activeTab === "feed" && activeCommunity?.joined
        ? String(activeCommunity.id)
        : null;

    if (prevId && prevId !== nextId) {
      socket.emit("leave_community", {
        communityId: prevId,
        userId: currentUserId,
      });
      socket.__joinedCommunityId = null;
    }

    if (nextId) {
      socket.emit("join_community", {
        communityId: nextId,
        userId: currentUserId,
      });
      socket.__joinedCommunityId = nextId;
    }
  }, [activeTab, activeCommunity?.id, activeCommunity?.joined, currentUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  const requireLogin = () => {
    toast.error("Please log in to continue");
    navigate(appPath("login"));
  };

  const handleTherapyEnrol = async (cohort, opts = {}) => {
    if (!getAuthToken()) {
      requireLogin();
      return;
    }

    if (opts.openSessions || cohort.enrolled) {
      if (cohort.enrollmentId) {
        const nextSlot = (cohort.slots || []).find(
          (s) => new Date(s.scheduledAt).getTime() > Date.now() - 2 * 60 * 60 * 1000,
        );
        const qs = nextSlot ? `?slot=${nextSlot.id}` : "";
        navigate(`/therapy-session/${cohort.enrollmentId}${qs}`);
        return;
      }
      toast("Open your confirmation email for join links");
      return;
    }

    setBusyTherapyId(cohort.id);
    try {
      const user = getStoredUser();
      toast.loading(`Enrolling in ${cohort.theme}…`, { id: "therapy-enrol" });
      const result = await enrollInTherapyCohort({
        cohortId: cohort.id,
        theme: cohort.theme,
        price: cohort.price,
        user,
      });
      toast.dismiss("therapy-enrol");
      if (result.waitlisted) {
        toast.success("Added to waitlist");
      } else {
        toast.success("Enrollment confirmed — check your email for join links");
      }
      await loadTherapy();
    } catch (err) {
      toast.dismiss("therapy-enrol");
      if (err.message === "Payment cancelled") toast.error("Payment cancelled");
      else toast.error(err.message || "Enrollment failed");
    } finally {
      setBusyTherapyId(null);
    }
  };

  const featuredTherapyPrice = therapyCohorts[0]?.priceLabel || "₹—";

  const currentUser = getStoredUser();
  const displayName =
    currentUser?.name?.trim() ||
    currentUser?.email?.trim() ||
    (getAuthToken() ? "Member" : "Guest");
  const displayInitial = String(displayName).charAt(0).toUpperCase() || "M";

  const showTab = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const toggleJoin = async (community) => {
    if (!getAuthToken()) {
      requireLogin();
      return;
    }

    const id = community.id;
    const wasJoined = community.joined;
    setBusyId(id);

    try {
      if (wasJoined) {
        const res = await apiPost(`/communities/${id}/leave`, {});
        if (!res?.success) throw new Error(res?.message || "Failed to leave");
        toast.success(`Left ${community.name}`);
        await loadCommunities();
        return;
      }

      if (!unlocked) {
        const user = getStoredUser();
        toast.loading(`Unlocking communities (₹${unlockAmount})…`, {
          id: "community-unlock",
        });
        await ensureCommunityUnlocked(user);
        toast.success("Community access unlocked!", { id: "community-unlock" });
        setUnlocked(true);
      }

      const joinRes = await apiPost(`/communities/${id}/join`, {});
      if (!joinRes?.success) {
        throw new Error(joinRes?.message || "Failed to join");
      }
      toast.success(`Joined ${community.name} ✓`);
      setActiveCommunityId(id);
      await loadCommunities();
    } catch (err) {
      toast.dismiss("community-unlock");
      if (err.message === "Payment cancelled") {
        toast.error("Payment cancelled");
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setBusyId(null);
    }
  };

  const handlePost = async () => {
    if (!postText.trim()) return;
    if (!getAuthToken()) {
      requireLogin();
      return;
    }
    if (!activeCommunity?.joined) {
      toast.error("Join a community first to post");
      return;
    }
    try {
      const res = await apiPost(`/communities/${activeCommunity.id}/posts`, {
        content: postText.trim(),
        isAnonymous: postAnonymous,
      });
      if (!res?.success) throw new Error(res?.message || "Failed to post");
      setPostText("");
      toast.success("Post shared ✓");
      setPosts((prev) => [res.data, ...prev]);
    } catch (err) {
      toast.error(err.message || "Failed to post");
    }
  };

  const handleSendChat = async () => {
    if (!chatText.trim() || sendingChat) return;
    if (!getAuthToken()) {
      requireLogin();
      return;
    }
    if (!activeCommunity?.joined) {
      toast.error("Join a community first to chat");
      return;
    }

    const text = chatText.trim();
    const communityId = activeCommunity.id;
    const socket = socketRef.current;

    setChatText("");
    setSendingChat(true);

    try {
      if (socket?.connected) {
        socket.emit("community_send_message", {
          communityId,
          userId: currentUserId,
          text,
          isAnonymous: false,
        });
        // Message arrives via community_new_message for everyone in the room
        return;
      }

      const res = await apiPost(`/communities/${communityId}/messages`, {
        text,
        isAnonymous: false,
      });
      if (!res?.success) throw new Error(res?.message || "Failed to send");
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data?.id)) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      setChatText(text);
      toast.error(err.message || "Failed to send");
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="community-page">
      <nav className="community-nav">
        <div className="community-nav-brand">
          <button
            type="button"
            className="community-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <Link to="/" className="community-nav-mark" style={{ textDecoration: "none" }}>
            M
          </Link>
          <Link
            to="/"
            className="community-nav-name"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Mejoric <span>Community</span>
          </Link>
        </div>
        <div className="community-nav-r">
          {!unlocked && (
            <span className="community-nav-pill" style={{ cursor: "default" }}>
              ₹{unlockAmount} one-time unlock
            </span>
          )}
          {unlocked && (
            <span className="community-nav-pill" style={{ cursor: "default" }}>
              Unlocked ✓
            </span>
          )}
          <button
            type="button"
            className="community-nav-pill"
            onClick={() => navigate("/mate")}
          >
            Sessions
          </button>
          <button
            type="button"
            className="community-nav-pill"
            onClick={() => navigate("/mentors")}
          >
            Mentors
          </button>
          <button
            type="button"
            className="community-nav-btn"
            onClick={() => navigate("/mate")}
          >
            Book a Session →
          </button>
        </div>
      </nav>

      <div className="community-layout">
        <div
          className={`community-sidebar-backdrop${sidebarOpen ? " open" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        <aside className={`community-sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="community-sb-me">
            <div className="community-sb-av">{displayInitial}</div>
            <div>
              <div className="community-sb-nm">{displayName}</div>
              <div className="community-sb-rl">
                {unlocked ? "Community member" : "Unlock to join"}
              </div>
            </div>
          </div>
          <div className="community-sb-divider" />

          <div className="community-sb-section">
            <span className="community-sb-lbl">My Communities</span>
            {joinedCommunities.length === 0 && (
              <div className="community-sb-i-name" style={{ padding: "8px 12px", opacity: 0.6 }}>
                None yet — join below
              </div>
            )}
            {joinedCommunities.map((item) => {
              const online = onlineByCommunity[String(item.id)] || 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`community-sb-item${activeCommunity?.id === item.id ? " on" : ""}`}
                  onClick={() => {
                    setActiveCommunityId(item.id);
                    showTab("feed");
                  }}
                >
                  <div
                    className="community-sb-i-dot"
                    style={{
                      background: online > 0 ? "#22c55e" : item.col,
                    }}
                  />
                  <span className="community-sb-i-name">{item.name}</span>
                  <span className="community-sb-i-count">
                    {online > 0 ? `${online} online` : `${item.members || 0}`}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="community-sb-section">
            <span className="community-sb-lbl">Discover</span>
            {discoverCommunities.map((item) => (
              <button
                key={`discover-${item.id}`}
                type="button"
                className={`community-sb-item${activeCommunity?.id === item.id ? " on" : ""}`}
                onClick={() => {
                  setActiveCommunityId(item.id);
                  showTab("communities");
                }}
              >
                <div
                  className="community-sb-i-dot"
                  style={{ background: item.col }}
                />
                <span className="community-sb-i-name">{item.name}</span>
                <span className="community-sb-i-count">
                  {item.members || 0}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="community-sb-join-cta"
            onClick={() => showTab("therapy")}
          >
            <div className="community-sb-jt">Group therapy cohorts ✦</div>
            <div className="community-sb-js">
              Enrol in a closed group with verified join access →
            </div>
          </button>
        </aside>

        <main className="community-main">
          <div className="community-tabbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`community-tab${activeTab === tab.id ? " on" : ""}`}
                onClick={() => showTab(tab.id)}
              >
                {tab.label}
                {tab.badge && (
                  <span className="community-tab-badge">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          <div
            className={`community-view${activeTab === "communities" ? " on" : ""}`}
          >
            <div className="community-funnel-strip">
              <div className="community-fs-item">
                <span className="community-fs-step">Step 1</span>
                <span className="community-fs-label">Unlock Communities</span>
                <span className="community-fs-paid">
                  ₹{unlockAmount} one-time
                </span>
              </div>
              <span className="community-fs-arrow">→</span>
              <div className="community-fs-item">
                <span className="community-fs-step">Step 2</span>
                <span className="community-fs-label">Join Group Therapy</span>
                <span className="community-fs-paid">₹2,400 / 6 weeks</span>
              </div>
              <span className="community-fs-arrow">→</span>
              <div className="community-fs-item">
                <span className="community-fs-step">Step 3</span>
                <span className="community-fs-label">1-to-1 Mate Session</span>
                <span className="community-fs-paid">₹199 first session</span>
              </div>
            </div>

            <div className="community-wed-banner">
              <div>
                <div className="community-wb-eyebrow">
                  PEER COMMUNITIES · FEED &amp; CHAT
                </div>
                <div className="community-wb-title">
                  Join communities that fit you
                </div>
                <div className="community-wb-sub">
                  Unlock once · join any community · feed &amp; chat included
                </div>
              </div>
              <button
                type="button"
                className="community-wb-btn"
                onClick={() => showTab("therapy")}
              >
                Explore group therapy →
              </button>
            </div>

            <div className="community-sec-hdr">
              <span className="community-sec-t">All Communities</span>
              <span className="community-sec-s">
                ₹{unlockAmount} one-time unlock · then join any · optional anonymous posts
              </span>
            </div>

            {loadingList ? (
              <p style={{ padding: 24, color: "var(--muted)" }}>Loading communities…</p>
            ) : communities.length === 0 ? (
              <p style={{ padding: 24, color: "var(--muted)" }}>
                No communities yet. Check back soon.
              </p>
            ) : (
              <div className="community-grid">
                {communities.map((c) => (
                  <CommunityCard
                    key={c.id}
                    community={c}
                    joined={c.joined}
                    unlocking={busyId === c.id}
                    onToggleJoin={toggleJoin}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            className={`community-view${activeTab === "therapy" ? " on" : ""}`}
          >
            <div className="community-wed-banner" style={{ marginBottom: 22 }}>
              <div>
                <div className="community-wb-eyebrow">
                  STRUCTURED · CLOSED GROUPS · PURCHASE GATED
                </div>
                <div className="community-wb-title">Group Therapy Cohorts</div>
                <div className="community-wb-sub">
                  Enrol on Mejoric · join from the platform only · meeting
                  access verified against your purchase
                </div>
              </div>
              <div className="community-therapy-price-block">
                <div className="community-therapy-price">
                  {featuredTherapyPrice}
                </div>
                <div className="community-therapy-price-sub">
                  Admin-set cohort price · seat limits enforced
                </div>
              </div>
            </div>

            <div className="community-sec-hdr">
              <span className="community-sec-t">Open Cohorts</span>
              <span className="community-sec-s">
                Login required · email with platform join links after payment
              </span>
            </div>

            {loadingTherapy ? (
              <p style={{ padding: 24, color: "var(--muted)" }}>
                Loading cohorts…
              </p>
            ) : therapyCohorts.length === 0 ? (
              <p style={{ padding: 24, color: "var(--muted)" }}>
                No open cohorts right now. Check back soon.
              </p>
            ) : (
              <div className="community-therapy-grid">
                {therapyCohorts.map((t) => (
                  <TherapyCard
                    key={t.id}
                    cohort={t}
                    busy={busyTherapyId === t.id}
                    onEnrol={handleTherapyEnrol}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            className={`community-view${activeTab === "feed" ? " on" : ""}`}
          >
            <div className="community-feed-layout">
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div className="community-feed-hdr-title">
                    {activeCommunity?.joined
                      ? activeCommunity.name
                      : "Community Feed"}
                  </div>
                  <div className="community-feed-hdr-sub">
                    {activeCommunity?.joined
                      ? "Feed & chat for members · anonymous posts available"
                      : "Join a community to read and post"}
                  </div>
                </div>

                {joinedCommunities.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    {joinedCommunities.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="community-nav-pill"
                        style={{
                          background:
                            activeCommunity?.id === c.id ? c.col : undefined,
                          color:
                            activeCommunity?.id === c.id ? "#fff" : undefined,
                        }}
                        onClick={() => setActiveCommunityId(c.id)}
                      >
                        {c.emoji} {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {activeCommunity?.joined ? (
                  <>
                    <div className="community-post-composer">
                      <div className="community-pc-top">
                        <div className="community-pc-av">{displayInitial}</div>
                        <textarea
                          className="community-pc-input"
                          placeholder="Share what's on your mind. No judgment here."
                          value={postText}
                          onChange={(e) => setPostText(e.target.value)}
                        />
                      </div>
                      <div className="community-pc-foot">
                        <label className="community-pc-anon">
                          <input
                            type="checkbox"
                            checked={postAnonymous}
                            onChange={(e) =>
                              setPostAnonymous(e.target.checked)
                            }
                          />
                          Post anonymously
                        </label>
                        <button
                          type="button"
                          className="community-pc-post"
                          onClick={handlePost}
                        >
                          Share →
                        </button>
                      </div>
                    </div>

                    <div className="community-post-composer" style={{ marginTop: 12 }}>
                      <div className="community-feed-hdr-sub" style={{ marginBottom: 8 }}>
                        Community chat
                      </div>
                      <div
                        style={{
                          maxHeight: 220,
                          overflowY: "auto",
                          marginBottom: 10,
                          padding: "8px 0",
                        }}
                      >
                        {loadingFeed && messages.length === 0 && (
                          <div className="community-feed-hdr-sub">Loading…</div>
                        )}
                        {!loadingFeed && messages.length === 0 && (
                          <div className="community-feed-hdr-sub">
                            No messages yet — say hello
                          </div>
                        )}
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            style={{
                              marginBottom: 8,
                              textAlign: m.isMine ? "right" : "left",
                            }}
                          >
                            <div
                              style={{
                                display: "inline-block",
                                maxWidth: "85%",
                                padding: "8px 12px",
                                borderRadius: 12,
                                background: m.isMine
                                  ? "rgba(144,67,181,0.15)"
                                  : "var(--warm3, #f5f0fa)",
                                fontSize: 13,
                              }}
                            >
                              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>
                                {m.author?.displayName || "Member"} · {timeAgo(m.createdAt)}
                              </div>
                              {m.text}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="community-pc-top">
                        <input
                          className="community-pc-input"
                          style={{ minHeight: 40, resize: "none" }}
                          placeholder="Write a message…"
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSendChat();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="community-pc-post"
                          onClick={handleSendChat}
                          disabled={sendingChat}
                        >
                          {sendingChat ? "…" : "Send"}
                        </button>
                      </div>
                    </div>

                    {loadingFeed && posts.length === 0 ? (
                      <p className="community-feed-hdr-sub">Loading posts…</p>
                    ) : posts.length === 0 ? (
                      <p className="community-feed-hdr-sub" style={{ marginTop: 16 }}>
                        No posts yet — be the first
                      </p>
                    ) : (
                      posts.map((post) => (
                        <FeedPost
                          key={post.id}
                          post={post}
                          communityName={activeCommunity.name}
                          communityColor={activeCommunity.col}
                        />
                      ))
                    )}
                  </>
                ) : (
                  <p className="community-feed-hdr-sub">
                    Join a community from the Communities tab
                    {!unlocked
                      ? ` (₹${unlockAmount} one-time unlock required first)`
                      : ""}
                    .
                  </p>
                )}
              </div>

              <div className="community-feed-sidebar">
                <div className="community-fa-card">
                  <div className="community-fa-title">Active now</div>
                  {joinedCommunities.length === 0 ? (
                    <div className="community-ac-cnt">
                      Join a community to see who&apos;s online
                    </div>
                  ) : (
                    joinedCommunities.map((item) => {
                      const online = onlineByCommunity[String(item.id)] || 0;
                      return (
                        <div
                          key={item.id}
                          className="community-ac-item"
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setActiveCommunityId(item.id);
                            setActiveTab("feed");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveCommunityId(item.id);
                              setActiveTab("feed");
                            }
                          }}
                        >
                          <span
                            className="community-ac-dot"
                            style={{
                              background:
                                online > 0
                                  ? "#22c55e"
                                  : "var(--muted, #c4c4c4)",
                            }}
                          />
                          <span className="community-ac-name">
                            {item.emoji} {item.name}
                          </span>
                          <span className="community-ac-cnt">
                            {online === 1
                              ? "1 online"
                              : `${online} online`}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="community-fa-card">
                  <div className="community-fa-title">How this works</div>
                  <div className="community-how-works">
                    ✦ ₹{unlockAmount} one-time unlock (wallet or Razorpay)
                    <br />
                    ✦ Welcome wallet balance cannot be used
                    <br />
                    ✦ Then join any community free
                    <br />
                    ✦ Your name shows unless you post anonymously
                    <br />✦ Moderated for safety
                  </div>
                </div>

                <div className="community-fa-card community-dark-cta-card">
                  <div className="community-dark-cta-title">
                    Need more than a post?
                  </div>
                  <div className="community-dark-cta-text">
                    Talk to a Mate 1-to-1.
                  </div>
                  <button
                    type="button"
                    className="community-dark-cta-btn"
                    onClick={() => {
                      navigate("/mate");
                      toast("Opening session booking...");
                    }}
                  >
                    Book a Mate Session →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
