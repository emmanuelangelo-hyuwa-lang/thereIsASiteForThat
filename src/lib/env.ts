function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export function getSearchConfidenceThreshold(): number {
  const raw = optional("SEARCH_CONFIDENCE_THRESHOLD");
  const parsed = raw ? Number.parseFloat(raw) : 0.78;
  return Number.isFinite(parsed) ? parsed : 0.78;
}

export function getAdminEmails(): string[] {
  const raw = optional("ADMIN_EMAILS") ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
