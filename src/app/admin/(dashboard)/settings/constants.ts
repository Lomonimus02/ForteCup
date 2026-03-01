// ─── Keys we manage ──────────────────────

export const SETTINGS_KEYS = [
  "heroTitle",
  "heroSubtitle",
  "heroImageUrl",
  "marqueeText",
  "contactPhone",
  "contactEmail",
  "contactAddress",
  "instagramUrl",
  "telegramUrl",
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];
