/**
 * Colour behaves like navigation, not decoration.
 *
 * Every entity (a category, a collection, a site) owns one saturated colour
 * for as long as the user is inside it. The colour is derived from the entity's
 * slug so it is stable forever without a database column.
 */

export const ACCENTS = [
  "#c6f24e", // acid
  "#ff5c1a", // flare
  "#4b6dff", // ultra
  "#ff3d80", // hot
  "#00d08a", // jade
  "#ffb300", // amber
  "#9b5cff", // violet
  "#00cfe8", // cyan
] as const;

/** Home colour. Black is home; this is the light on it. */
export const HOME_ACCENT = ACCENTS[0];

/**
 * The catalog's own entities get an authored colour rather than a hashed one,
 * so no two neighbours in a grid ever land on the same hue by accident.
 * Anything outside this map falls back to the hash below.
 */
const ASSIGNED: Record<string, (typeof ACCENTS)[number]> = {
  // Collections
  "best-ai-websites": "#9b5cff",
  "best-student-websites": "#4b6dff",
  "best-productivity-websites": "#00cfe8",
  "best-free-websites": "#c6f24e",
  "best-developer-websites": "#ff5c1a",
  "best-design-websites": "#ff3d80",
  "best-startup-websites": "#00d08a",
  // Categories
  "pdf-tools": "#ff3d80",
  "image-editing": "#00cfe8",
  "video-tools": "#9b5cff",
  "resume-careers": "#c6f24e",
  "design-assets": "#ff5c1a",
  productivity: "#00d08a",
  "developer-tools": "#4b6dff",
  "writing-docs": "#ffb300",
  "security-privacy": "#ff3d80",
  utilities: "#00cfe8",
  "ai-tools": "#9b5cff",
  "audio-tools": "#c6f24e",
};

export function accentFor(key: string): string {
  const assigned = ASSIGNED[key];
  if (assigned) {
    return assigned;
  }

  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

/**
 * Hand this to any element's `style` prop and every descendant inherits the
 * entity's colour, buttons, rules, numerals, floods.
 */
export function accentStyle(key: string): React.CSSProperties {
  return { "--accent": accentFor(key) } as React.CSSProperties;
}
