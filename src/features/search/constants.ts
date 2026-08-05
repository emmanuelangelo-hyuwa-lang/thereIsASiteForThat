export const EXAMPLE_QUERIES = [
  "compress a pdf",
  "remove background",
  "make a resume",
  "color palette",
  "qr code generator",
  "temporary email",
  "json formatter",
  "find internships",
] as const;

/**
 * The hero headline completes the sentence "There is a site for ___", so these
 * read as phrases rather than as search queries. Each one still carries the
 * query it links to, so the wording can stay grammatical without breaking the
 * search page it points at.
 */
export const HEADLINE_PHRASES = [
  { phrase: "that.", query: null },
  { phrase: "compressing a PDF", query: "compress a pdf" },
  { phrase: "removing backgrounds", query: "remove background" },
  { phrase: "making a resume", query: "make a resume" },
  { phrase: "color palettes", query: "color palette" },
  { phrase: "QR codes", query: "qr code generator" },
  { phrase: "temporary email", query: "temporary email" },
  { phrase: "formatting JSON", query: "json formatter" },
  { phrase: "finding internships", query: "find internships" },
] as const;
