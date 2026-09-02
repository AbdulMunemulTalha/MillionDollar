import "server-only";

/**
 * Metadata scraped from a product's homepage, used to decorate its board card.
 * Every field is optional — a site may have no usable tags, and scraping must
 * never block a paid entry from going live.
 */
export type SiteMetadata = {
  title: string | null;
  description: string | null;
  logoUrl: string | null;
};

const EMPTY: SiteMetadata = { title: null, description: null, logoUrl: null };

/** Cap how long we wait on a stranger's server so a slow site can't hang us. */
const FETCH_TIMEOUT_MS = 6000;
/** Only read the head-ish start of the document; tags we want live up top. */
const MAX_BYTES = 512 * 1024;

/**
 * Fetch a product URL and pull its title, description, and a logo image.
 * Best-effort and defensive: any failure yields empty fields, never throws.
 * Runs server-side only (called from the paid-order webhook).
 */
export async function fetchSiteMetadata(url: string): Promise<SiteMetadata> {
  let html: string;
  let finalUrl: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          // Some sites serve a bare/blocked page to unknown agents.
          "user-agent":
            "Mozilla/5.0 (compatible; MillionDollarBot/1.0; +https://millliondollar.com)",
          accept: "text/html,application/xhtml+xml",
        },
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return EMPTY;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) return EMPTY;
    finalUrl = res.url || url;
    html = await readCapped(res, MAX_BYTES);
  } catch {
    return EMPTY;
  }

  const title = extractTitle(html);
  const description = extractDescription(html);
  const logoUrl = extractLogo(html, finalUrl);
  return {
    title: clean(title, 120),
    description: clean(description, 240),
    logoUrl,
  };
}

/** Read at most `max` bytes of a response body, then stop. */
async function readCapped(res: Response, max: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();
  const decoder = new TextDecoder();
  let out = "";
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (total >= max) {
      await reader.cancel();
      break;
    }
  }
  return out;
}

function extractTitle(html: string): string | null {
  return (
    metaContent(html, "property", "og:title") ??
    metaContent(html, "name", "twitter:title") ??
    match(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  );
}

function extractDescription(html: string): string | null {
  return (
    metaContent(html, "property", "og:description") ??
    metaContent(html, "name", "description") ??
    metaContent(html, "name", "twitter:description")
  );
}

/**
 * Pick the best logo for a small square slot: the site's own icon first
 * (apple-touch-icon / <link rel="icon"> are square brand marks), then the
 * social preview image, finally /favicon.ico. Resolved against the final
 * (post-redirect) URL.
 */
function extractLogo(html: string, baseUrl: string): string | null {
  const candidate =
    linkHref(html, "apple-touch-icon") ??
    linkHref(html, "icon") ??
    metaContent(html, "property", "og:image") ??
    metaContent(html, "name", "twitter:image") ??
    "/favicon.ico";
  // Attribute values are HTML-encoded, so a URL's "&" arrives as "&amp;".
  return resolveUrl(decodeEntities(candidate), baseUrl);
}

/** Read the `content` of a <meta> whose `attr` equals `value` (either order). */
function metaContent(
  html: string,
  attr: string,
  value: string,
): string | null {
  const v = escapeRegex(value);
  const contentFirst = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${v}["']`,
    "i",
  );
  const attrFirst = new RegExp(
    `<meta[^>]*${attr}=["']${v}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  return match(html, attrFirst) ?? match(html, contentFirst);
}

/** Read the `href` of a <link rel="..."> containing `rel` (either order). */
function linkHref(html: string, rel: string): string | null {
  const r = escapeRegex(rel);
  const hrefFirst = new RegExp(
    `<link[^>]*href=["']([^"']*)["'][^>]*rel=["'][^"']*${r}[^"']*["']`,
    "i",
  );
  const relFirst = new RegExp(
    `<link[^>]*rel=["'][^"']*${r}[^"']*["'][^>]*href=["']([^"']*)["']`,
    "i",
  );
  return match(html, relFirst) ?? match(html, hrefFirst);
}

function match(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m && m[1] ? m[1] : null;
}

function resolveUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Decode common HTML entities (named + numeric) back to plain characters. */
function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => safeCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCodePoint(parseInt(h, 16)));
}

function safeCodePoint(code: number): string {
  try {
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  } catch {
    return "";
  }
}

/** Decode entities, collapse whitespace, then length-cap with an ellipsis. */
function clean(value: string | null, max: number): string | null {
  if (!value) return null;
  const text = decodeEntities(value).replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
