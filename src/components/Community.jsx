import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  COMMUNITIES,
  THERAPY_COHORTS,
  FEED_POSTS,
  CALLS,
  MY_COMMUNITIES,
  DISCOVER_COMMUNITIES,
  TABS,
} from "../data/communityData";
import "./Community.css";

const ONLINE_COUNTS = COMMUNITIES.slice(0, 5).map((c) => ({
  ...c,
  online: Math.floor(Math.random() * 12 + 2),
}));

function CommunityCard({ community, joined, onToggleJoin }) {
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
              {community.avs.map((color) => (
                <div
                  key={color}
                  className="community-cc-av-mini"
                  style={{ background: color }}
                >
                  ·
                </div>
              ))}
            </div>
            {(community.members / 1000).toFixed(1)}k members
          </div>
          <button
            type="button"
            className="community-cc-join-btn"
            style={{
              background: joined ? "var(--warm3)" : community.col,
              color: joined ? "var(--muted)" : "var(--warm)",
            }}
            onClick={() => onToggleJoin(community.id, community.name, joined)}
          >
            {joined ? "Joined ✓" : "Join →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TherapyCard({ cohort, onEnrol, onWaitlist }) {
  const pct = Math.round((cohort.taken / cohort.total) * 100);
  const full = cohort.taken >= cohort.total;

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
        <div className="community-tc-sub">{cohort.sub}</div>
        <div className="community-tc-stats">
          <div className="community-tc-stat">
            <div className="community-tc-sv">{cohort.sessions}</div>
            <div className="community-tc-sl">Sessions</div>
          </div>
          <div className="community-tc-stat">
            <div className="community-tc-sv">{cohort.dur}</div>
            <div className="community-tc-sl">Each</div>
          </div>
          <div className="community-tc-stat">
            <div className="community-tc-sv">{cohort.day}</div>
            <div className="community-tc-sl">Day</div>
          </div>
        </div>
        <div className="community-tc-seats">
          <div className="community-tc-seats-lbl">
            <span>
              {full
                ? "Full — join waitlist"
                : `${cohort.total - cohort.taken} of ${cohort.total} seats left`}
            </span>
            <span>
              {cohort.taken}/{cohort.total}
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
            <div className="community-tc-price">{cohort.price}</div>
            <div className="community-tc-price-sub">
              ₹400/session · 6 weeks
            </div>
          </div>
          {full ? (
            <button
              type="button"
              className="community-tc-waitlist"
              onClick={() => onWaitlist(cohort.theme)}
            >
              Join Waitlist
            </button>
          ) : (
            <button
              type="button"
              className="community-tc-btn"
              style={{ background: cohort.band }}
              onClick={() => onEnrol(cohort.theme)}
            >
              Enrol Now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedPost({ post, liked, onLike, onReply }) {
  return (
    <div className="community-feed-post">
      <div className="community-fp-hdr">
        <div
          className="community-fp-av"
          style={{ background: post.avcol }}
        >
          A
        </div>
        <div>
          <div className="community-fp-nm">
            Anonymous{" "}
            <span className="community-anon-badge">anon</span>
          </div>
          <div className="community-fp-time">{post.time}</div>
        </div>
        <div
          className="community-post-community-badge"
          style={{ color: post.ccol }}
        >
          {post.community}
        </div>
      </div>
      <div className="community-fp-body">{post.body}</div>
      <div className="community-fp-foot">
        <button
          type="button"
          className="community-fp-act"
          onClick={onLike}
        >
          {liked ? "❤️" : "🤍"} {liked ? post.hearts + 1 : post.hearts}
        </button>
        <button
          type="button"
          className="community-fp-act"
          onClick={onReply}
        >
          💬 Reply
        </button>
        <button type="button" className="community-fp-act">
          🔖 Save
        </button>
      </div>
      <div className="community-fp-replies">
        {post.replies.map((reply) => (
          <div key={`${reply.name}-${reply.body.slice(0, 20)}`} className="community-fp-reply">
            <div
              className="community-fp-reply-av"
              style={{ background: reply.avcol }}
            >
              {reply.name.slice(0, 2)}
            </div>
            <div className="community-fp-reply-body">
              <div className="community-fp-reply-name">
                {reply.name}
                {reply.mate && (
                  <span className="community-mate-badge"> Mate</span>
                )}
              </div>
              {reply.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CallCard({ call, onRegister }) {
  return (
    <div className="community-call-card">
      <div className="community-call-date">
        <div className="community-call-day">{call.date}</div>
        <div className="community-call-month">{call.month}</div>
      </div>
      <div className="community-call-body">
        <div
          className="community-call-community"
          style={{ color: call.ccol }}
        >
          {call.community}
        </div>
        <div className="community-call-title">{call.title}</div>
        <div className="community-call-meta">
          <span className="community-call-time">🕗 {call.time}</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            · {call.fac}
          </span>
        </div>
        <div className="community-call-desc">{call.desc}</div>
        <div className="community-call-foot">
          <span
            className={`community-call-spots${call.few ? " few" : ""}`}
          >
            {call.few
              ? `⚡ ${call.left} spots left`
              : `${call.left} spots available`}
          </span>
          <span className="community-call-free">Free</span>
          <button
            type="button"
            className="community-call-reg"
            onClick={() => onRegister(call.title)}
          >
            Register →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("communities");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("The Spiral Space");
  const [postAnonymous, setPostAnonymous] = useState(true);
  const [postText, setPostText] = useState("");

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const initialJoined = useMemo(
    () =>
      COMMUNITIES.reduce((acc, c) => {
        acc[c.id] = c.joined;
        return acc;
      }, {}),
    [],
  );
  const [joinedMap, setJoinedMap] = useState(initialJoined);
  const [likedPosts, setLikedPosts] = useState({});

  const showTab = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const toggleJoin = (id, name, wasJoined) => {
    setJoinedMap((prev) => {
      const next = { ...prev, [id]: !wasJoined };
      toast.success(
        wasJoined ? `Left ${name}` : `Joined ${name} ✓`,
      );
      return next;
    });
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    toast.success("Post shared anonymously ✓");
    setPostText("");
  };

  const toggleLike = (index) => {
    setLikedPosts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
          <span className="community-nav-name">
            Mejoric <span>Community</span>
          </span>
        </div>
        <div className="community-nav-r">
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
            <div className="community-sb-av">A</div>
            <div>
              <div className="community-sb-nm">Anonymous</div>
              <div className="community-sb-rl">Community member</div>
            </div>
          </div>
          <div className="community-sb-divider" />

          <div className="community-sb-section">
            <span className="community-sb-lbl">My Communities</span>
            {MY_COMMUNITIES.map((item) => (
              <button
                key={item.name}
                type="button"
                className={`community-sb-item${activeSidebar === item.name ? " on" : ""}`}
                onClick={() => {
                  setActiveSidebar(item.name);
                  showTab("communities");
                }}
              >
                <div
                  className="community-sb-i-dot"
                  style={{ background: item.col }}
                />
                <span className="community-sb-i-name">{item.name}</span>
                <span className="community-sb-i-count">{item.count}</span>
              </button>
            ))}
          </div>

          <div className="community-sb-section">
            <span className="community-sb-lbl">Discover</span>
            {DISCOVER_COMMUNITIES.map((item) => (
              <button
                key={`discover-${item.name}`}
                type="button"
                className={`community-sb-item${activeSidebar === item.name ? " on" : ""}`}
                onClick={() => {
                  setActiveSidebar(item.name);
                  showTab("communities");
                }}
              >
                <div
                  className="community-sb-i-dot"
                  style={{ background: item.col }}
                />
                <span className="community-sb-i-name">{item.name}</span>
                <span className="community-sb-i-count">{item.count}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="community-sb-join-cta"
            onClick={() => {
              showTab("calls");
              toast("Opening calls schedule");
            }}
          >
            <div className="community-sb-jt">Wednesday calls are free ✦</div>
            <div className="community-sb-js">
              Join your community call this week →
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

          {/* Communities */}
          <div
            className={`community-view${activeTab === "communities" ? " on" : ""}`}
          >
            <div className="community-funnel-strip">
              <div className="community-fs-item">
                <span className="community-fs-step">Step 1</span>
                <span className="community-fs-label">Join a Community</span>
                <span className="community-fs-free">Free forever</span>
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
                  <div className="community-wb-live-dot" />
                  THIS WEDNESDAY · 8PM IST
                </div>
                <div className="community-wb-title">
                  Weekly Community Calls — Free
                </div>
                <div className="community-wb-sub">
                  16 communities · 8 calls · every Wednesday · facilitated by
                  a Mate
                </div>
              </div>
              <button
                type="button"
                className="community-wb-btn"
                onClick={() => {
                  showTab("calls");
                  toast("Opening calls schedule");
                }}
              >
                See this week&apos;s calls →
              </button>
            </div>

            <div className="community-sec-hdr">
              <span className="community-sec-t">All Communities</span>
              <span className="community-sec-s">
                Free to join · Anonymous posting
              </span>
            </div>

            <div className="community-grid">
              {COMMUNITIES.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  joined={joinedMap[c.id]}
                  onToggleJoin={toggleJoin}
                />
              ))}
            </div>
          </div>

          {/* Therapy */}
          <div
            className={`community-view${activeTab === "therapy" ? " on" : ""}`}
          >
            <div className="community-wed-banner" style={{ marginBottom: 22 }}>
              <div>
                <div className="community-wb-eyebrow">
                  STRUCTURED · 6 WEEKS · MAX 8 PEOPLE
                </div>
                <div className="community-wb-title">Group Therapy Cohorts</div>
                <div className="community-wb-sub">
                  Led by MA/MPhil psychologists · Certified · Safe closed
                  groups
                </div>
              </div>
              <div className="community-therapy-price-block">
                <div className="community-therapy-price">₹400</div>
                <div className="community-therapy-price-sub">
                  per session · ₹2,400 full cohort
                </div>
              </div>
            </div>

            <div className="community-sec-hdr">
              <span className="community-sec-t">Open Cohorts</span>
              <span className="community-sec-s">
                Next cohorts start 1st &amp; 15th every month
              </span>
            </div>

            <div className="community-therapy-grid">
              {THERAPY_COHORTS.map((t) => (
                <TherapyCard
                  key={t.theme}
                  cohort={t}
                  onEnrol={(theme) => toast(`Enrolling in ${theme}...`)}
                  onWaitlist={(theme) =>
                    toast(`Added to waitlist for ${theme}`)
                  }
                />
              ))}
            </div>
          </div>

          {/* Feed */}
          <div
            className={`community-view${activeTab === "feed" ? " on" : ""}`}
          >
            <div className="community-feed-layout">
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div className="community-feed-hdr-title">
                    Community Feed
                  </div>
                  <div className="community-feed-hdr-sub">
                    Posts are anonymous by default · Mate responses are
                    badged
                  </div>
                </div>

                <div className="community-post-composer">
                  <div className="community-pc-top">
                    <div className="community-pc-av">A</div>
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

                {FEED_POSTS.map((post, i) => (
                  <FeedPost
                    key={`${post.community}-${post.time}`}
                    post={post}
                    liked={!!likedPosts[i]}
                    onLike={() => toggleLike(i)}
                    onReply={() => toast("Reply posted anonymously")}
                  />
                ))}
              </div>

              <div className="community-feed-sidebar">
                <div className="community-fa-card">
                  <div className="community-fa-title">Active now</div>
                  {ONLINE_COUNTS.map((c) => (
                    <div key={c.id} className="community-ac-item">
                      <div
                        className="community-ac-dot"
                        style={{ background: c.col }}
                      />
                      <span className="community-ac-name">{c.name}</span>
                      <span className="community-ac-cnt">
                        {c.online} online
                      </span>
                    </div>
                  ))}
                </div>

                <div className="community-fa-card">
                  <div
                    className="community-fa-title"
                    style={{ marginBottom: 8 }}
                  >
                    How this works
                  </div>
                  <div className="community-how-works">
                    ✦ Anonymous by default
                    <br />
                    ✦ Mates respond within 2 hours
                    <br />
                    ✦ No advice unless asked
                    <br />
                    ✦ No screenshots
                    <br />✦ Moderated for safety
                  </div>
                </div>

                <div className="community-fa-card community-dark-cta-card">
                  <div className="community-dark-cta-title">
                    Need more than a post?
                  </div>
                  <div className="community-dark-cta-text">
                    Talk to a Mate 1-to-1. First session ₹199.
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

          {/* Calls */}
          <div
            className={`community-view${activeTab === "calls" ? " on" : ""}`}
          >
            <div className="community-sec-hdr" style={{ marginBottom: 6 }}>
              <span className="community-sec-t">Wednesday Night Calls</span>
              <span className="community-sec-s">
                Free · Every Wednesday · 8PM IST
              </span>
            </div>
            <div className="community-calls-intro">
              Each call has a specific theme. A Mate facilitates. Max 20 people.
              Peer-led, not clinical. Safe and anonymous.
            </div>
            <div className="community-calls-grid">
              {CALLS.map((call) => (
                <CallCard
                  key={`${call.title}-${call.time}`}
                  call={call}
                  onRegister={(title) => toast(`Registered: ${title}`)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
