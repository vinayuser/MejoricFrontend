/**
 * Capitalizes the first letter of each word in a name.
 * Handles multiple spaces and names with hyphens/apostrophes if needed.
 * @param {string} name - The name to capitalize.
 * @returns {string} - The capitalized name.
 */
export const capitalizeName = (name) => {
  if (!name || typeof name !== "string") return name || "";
  
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/** Hide raw IPs from mate-facing UI — show "Guest" instead. */
export const displayChatSenderName = (name, fallback = "Guest") => {
  const raw = String(name || "").trim();
  if (!raw) return fallback;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(raw)) return fallback;
  if (raw.includes(":") && /^[0-9a-fA-F:.]+$/.test(raw)) return fallback;
  return capitalizeName(raw);
};

const INTERNAL_GUEST_EMAIL = /^guest_\d+_\d+@mejoric\.com$/i;

/**
 * Prefer display name, then real email, then fallback.
 */
export const getDisplayName = (entity, fallback = "User") => {
  const name = entity?.name?.trim();
  if (name) return capitalizeName(name);

  const email = entity?.email?.trim();
  if (email && !INTERNAL_GUEST_EMAIL.test(email)) return email;

  if (typeof entity === "string" && entity.trim()) return entity.trim();

  return fallback;
};

/** Format a resolved label for UI (do not title-case emails). */
export const formatDisplayLabel = (value, fallback = "User") => {
  const label =
    typeof value === "string"
      ? value.trim() || fallback
      : getDisplayName(value, fallback);
  if (!label || label === fallback) return fallback;
  if (label.includes("@")) return label;
  return capitalizeName(label);
};
