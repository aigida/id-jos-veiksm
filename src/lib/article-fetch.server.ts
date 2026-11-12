export type FetchedArticle =
  | { ok: true; title: string; text: string; date: string; portal: string; url: string }
  | { ok: false; error: string };

const BLOCKED_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$|metadata)/i;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&bdquo;/g, "„")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function meta(html: string, prop: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m = html.match(re);
  return m ? decodeEntities((m[1] ?? m[2] ?? "").trim()) : "";
}

/** Best-effort extraction of headline, date and body paragraphs from an article page. */
export function extractArticle(html: string) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  const title =
    meta(cleaned, "og:title") || stripTags(cleaned.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") ||
    stripTags(cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const date = meta(cleaned, "article:published_time") || meta(cleaned, "date") || "";
  const scope = cleaned.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? cleaned;
  const paragraphs = [...scope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1] ?? ""))
    .filter((p) => p.length > 40);
  return { title, date: date.slice(0, 10), text: paragraphs.join("\n\n") };
}

export async function fetchArticleFromUrl(rawUrl: string): Promise<FetchedArticle> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, error: "Netinkama nuoroda." };
  }
  if (!/^https?:$/.test(url.protocol) || BLOCKED_HOST.test(url.hostname)) {
    return { ok: false, error: "Ši nuoroda nepalaikoma." };
  }
  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PERSPEKTYVA/0.1; +analysis prototype)",
        Accept: "text/html",
        "Accept-Language": "lt,en;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) return { ok: false, error: `Portalas grąžino klaidą (${res.status}). Įklijuokite tekstą rankiniu būdu.` };
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) return { ok: false, error: "Nuoroda neveda į straipsnio puslapį." };
    const html = (await res.text()).slice(0, 2_000_000);
    const { title, date, text } = extractArticle(html);
    if (text.length < 200) {
      return {
        ok: false,
        error: "Nepavyko automatiškai ištraukti straipsnio teksto (gali būti mokamas turinys ar apsauga). Įklijuokite tekstą rankiniu būdu.",
      };
    }
    return { ok: true, title, date, text: text.slice(0, 40000), portal: url.hostname.replace(/^www\./, ""), url: url.toString() };
  } catch {
    return { ok: false, error: "Nepavyko pasiekti puslapio. Įklijuokite tekstą rankiniu būdu." };
  }
}
