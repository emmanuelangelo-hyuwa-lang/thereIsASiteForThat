/**
 * A tab that has clicked through to a site is "waiting on a verdict".
 *
 * Eligibility to vote is computed on the server, from a cookie, at render time.
 * The Visit link opens a new tab, so the original tab keeps the HTML it already
 * had: the cookie is set correctly and the question still never appears, in
 * every browser, until a manual reload. This marker is how the page knows to
 * re-render when the visitor comes back.
 */
const PENDING_KEY = "tias_pending_verdict";

export function markVerdictPending(siteId: string): void {
  try {
    sessionStorage.setItem(PENDING_KEY, siteId);
  } catch {
    // Private modes can refuse storage. The refresh is a nicety, not a
    // requirement, and reloading by hand still works.
  }
}

/** Reads the marker and clears it, so a return can only refresh once. */
export function takeVerdictPending(siteId: string): boolean {
  try {
    if (sessionStorage.getItem(PENDING_KEY) !== siteId) {
      return false;
    }
    sessionStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}
