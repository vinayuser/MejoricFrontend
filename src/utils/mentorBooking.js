const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 18;
const SLOT_INTERVAL_MINUTES = 15;
const IST_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "https://mejoric.com/mateandmentors";
}

/** Today / any date → YYYY-MM-DD in IST. */
export function toDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey || "")
    .split("-")
    .map(Number);
  // Keep calendar widgets using a local Date at noon to avoid DST edge flips
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function istWallClockToDate(dateKey, hour, minute) {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const date = new Date(`${dateKey}T${hh}:${mm}:00${IST_OFFSET}`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatLongDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: IST_TIMEZONE,
  });
}

export function formatSlotLabel(date) {
  return new Date(date).toLocaleTimeString("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatBookingDateTime(dateKey, slotLabel) {
  const date = istWallClockToDate(dateKey, 12, 0) || parseDateKey(dateKey);
  const datePart = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: IST_TIMEZONE,
  });
  return `${datePart} at ${String(slotLabel || "").toLowerCase()} (IST)`;
}

export function getMonthMatrix(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function buildAllSlotsForDate(dateKey) {
  const slots = [];

  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
      const slotDate = istWallClockToDate(dateKey, hour, minute);
      if (!slotDate) continue;
      slots.push({
        id: `${dateKey}-${hour}-${minute}`,
        dateKey,
        startsAt: slotDate.toISOString(),
        label: formatSlotLabel(slotDate),
      });
    }
  }

  return slots;
}

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchAvailableDates(mentorId, viewDate) {
  try {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const response = await fetch(
      `${getApiBaseUrl()}/bookings/mentor/${mentorId}/available-dates?year=${year}&month=${month}`,
      { headers: getAuthHeaders() },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data?.data?.dates || [];
  } catch {
    return [];
  }
}

export async function fetchAvailableSlots(mentorId, dateKey) {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/bookings/mentor/${mentorId}/availability?dateKey=${dateKey}`,
      { headers: getAuthHeaders() },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data?.data?.slots || [];
  } catch {
    return [];
  }
}

/** @deprecated use fetchAvailableDates */
export async function getAvailableDates(mentorId, viewDate) {
  return fetchAvailableDates(mentorId, viewDate);
}

/** @deprecated use fetchAvailableSlots */
export async function getAvailableSlots(mentorId, dateKey) {
  return fetchAvailableSlots(mentorId, dateKey);
}

/** @deprecated */
export async function fetchBookedSlotIds() {
  return [];
}

export async function createMentorBooking({
  mentorId,
  slot,
  guestDetails,
  sessionFormat = "video",
  sessionPrice,
}) {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}/bookings/create`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      mentorId,
      scheduledAt: slot.startsAt,
      slotLabel: slot.label,
      dateKey: slot.dateKey,
      slotId: slot.id,
      sessionFormat,
      sessionPrice,
      guestDetails: {
        fullName: guestDetails.fullName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        gender: guestDetails.gender,
        age: guestDetails.age,
        budget: guestDetails.budget,
        referral: guestDetails.referral,
        supportNeeds: guestDetails.supportNeeds || "",
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not create booking");
  }

  return data.data;
}

export async function fetchMyAvailability(dateKey) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    `${getApiBaseUrl()}/bookings/mentor/me/availability?dateKey=${dateKey}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load availability");
  }
  return data.data;
}

export async function saveMyAvailability(dateKey, slotIds) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${getApiBaseUrl()}/bookings/mentor/me/availability`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dateKey, slotIds }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to save availability");
  }
  return data.data;
}

export async function fetchMyAppointments(tab = "upcoming", page = 1) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    `${getApiBaseUrl()}/bookings/mentor/me/appointments?tab=${tab}&page=${page}&limit=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load appointments");
  }
  return data.data;
}

/** Join opens 15 min before start; stays available until purchased session end. */
export function getSessionJoinWindow(booking) {
  const start = new Date(booking?.scheduledAt).getTime();
  const durationMs = (booking?.durationMinutes || 45) * 60 * 1000;
  const openAt = start - 15 * 60 * 1000;
  const closeAt = start + durationMs;
  return { start, openAt, closeAt, durationMs };
}

export function getSessionJoinOpensAt(booking) {
  return new Date(getSessionJoinWindow(booking).openAt);
}

export function getSessionJoinEndsAt(booking) {
  return new Date(getSessionJoinWindow(booking).closeAt);
}

/**
 * Join for the full purchased duration while session is still open.
 * Once mentor marks completed (or cancelled / no_show), Join is hidden.
 */
export function canJoinMentorSession(booking) {
  if (
    !booking ||
    ["cancelled", "no_show", "completed"].includes(booking.status)
  ) {
    return false;
  }
  const now = Date.now();
  const { openAt, closeAt } = getSessionJoinWindow(booking);
  return now >= openAt && now <= closeAt;
}

export async function markMentorBookingCompleted(bookingId) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    `${getApiBaseUrl()}/bookings/${bookingId}/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not mark session completed");
  }
  return data.data;
}

export function formatJoinTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export async function fetchBookingSessionToken(bookingId) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    `${getApiBaseUrl()}/bookings/${bookingId}/session-token`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not join session");
  }
  return data.data;
}

export async function fetchMyBookings(tab = "upcoming", page = 1) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(
    `${getApiBaseUrl()}/bookings/me?tab=${tab}&page=${page}&limit=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load bookings");
  }
  return data.data;
}

export function formatDuration(seconds) {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
