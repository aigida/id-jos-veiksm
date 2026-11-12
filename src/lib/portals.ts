export type Portal = {
  id: string;
  name: string;
  domain: string;
  aliases: string[];
};

/** Initial set of Lithuanian portals the tool compares. */
export const PORTALS: Portal[] = [
  { id: "delfi", name: "DELFI", domain: "delfi.lt", aliases: ["delfi", "delfi.lt", "www.delfi.lt"] },
  { id: "15min", name: "15min", domain: "15min.lt", aliases: ["15min", "15min.lt", "15 min"] },
  { id: "lrt", name: "LRT", domain: "lrt.lt", aliases: ["lrt", "lrt.lt"] },
  { id: "tv3", name: "TV3", domain: "tv3.lt", aliases: ["tv3", "tv3.lt"] },
  {
    id: "lrytas",
    name: "Lietuvos rytas",
    domain: "lrytas.lt",
    aliases: ["lrytas", "lrytas.lt", "lietuvos rytas"],
  },
  {
    id: "vz",
    name: "Verslo žinios",
    domain: "vz.lt",
    aliases: ["vz", "vz.lt", "verslo žinios", "verslo zinios"],
  },
];

export function findPortal(value: string): Portal | undefined {
  const v = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!v) return undefined;
  return PORTALS.find(
    (p) => p.aliases.includes(v) || v === p.domain || v.endsWith(`.${p.domain}`),
  );
}

export function portalFromUrl(url: string): Portal | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PORTALS.find((p) => host === p.domain || host.endsWith(`.${p.domain}`));
  } catch {
    return undefined;
  }
}
