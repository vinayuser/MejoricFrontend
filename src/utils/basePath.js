/** Router basename derived from Vite `base` (e.g. `/staging/` → `/staging`). */
export function getRouterBasename() {
  const base = import.meta.env.BASE_URL || "/";
  if (!base || base === "/") return undefined;
  return base.replace(/\/$/, "");
}

/** Build an app URL under the Vite base path, e.g. `/staging/login`. */
export function appPath(path = "/") {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  if (!normalized) {
    return base.endsWith("/") ? base : `${base}/`;
  }
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}${normalized}`.replace(/([^:])\/{2,}/g, "$1/");
}
