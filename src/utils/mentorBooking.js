const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 18;
const SLOT_INTERVAL_MINUTES = 15;

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "https://mejoric.com/mateandmentors";
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatSlotLabel(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatBookingDateTime(dateKey, slotLabel) {
  const date = parseDateKey(dateKey);
  const datePart = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${datePart} at ${slotLabel.toLowerCase()}`;
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
  const date = parseDateKey(dateKey);

  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);
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

export async function fetchAvailableDates(mentorId, viewDate) {
  try {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const response = await fetch(
      `${getApiBaseUrl()}/bookings/mentor/${mentorId}/available-dates?year=${year}&month=${month}`,
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

export async function createMentorBooking({ mentorId, slot, guestDetails }) {
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
