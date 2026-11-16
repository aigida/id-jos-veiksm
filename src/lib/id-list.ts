const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Parses a comma-separated `ids` search value into unique, well-formed ids (max 12). */
export function parseIdList(value: string | undefined): string[] {
  if (!value) return [];
  const ids = value.split(",").map((s) => s.trim()).filter((s) => UUID.test(s));
  return [...new Set(ids)].slice(0, 12);
}
