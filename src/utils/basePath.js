/** Router basename: `/staging` when Vite base is `/staging/`. */
export function getRouterBasename() {
  return "/staging";
}

/** Build an app URL under the staging base path, e.g. `/staging/login`. */
export function appPath(path = "/") {
  const base = "/staging/";
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  if (!normalized) {
    return base;
  }
  return `${base}${normalized}`.replace(/([^:])\/{2,}/g, "$1/");
}
