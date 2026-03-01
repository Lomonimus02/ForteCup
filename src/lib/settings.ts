import { prisma } from "@/lib/prisma";

/**
 * Fetch site settings from DB as a key→value map.
 * Can be called from any Server Component.
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}
