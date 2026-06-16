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
