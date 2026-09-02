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
  /**
   * A background color to sit behind the logo, set ONLY when the logo would be
   * invisible on our white card (it's near-white / very pale). Null means the
   * logo renders on the default white tile.
   */
  brandColor: string | null;
};

const EMPTY: SiteMetadata = {
  title: null,
  description: null,
  logoUrl: null,
  brandColor: null,
};

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
  const brandColor = logoUrl
    ? await deriveLogoBacking(logoUrl, extractThemeColor(html))
    : null;
  return {
    title: clean(title, 120),
    description: clean(description, 240),
    logoUrl,
    brandColor,
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

/** The site's own declared brand color, if any (used to back a pale logo). */
function extractThemeColor(html: string): string | null {
  return (
    metaContent(html, "name", "theme-color") ??
    metaContent(html, "name", "msapplication-TileColor")
  );
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

/* ---------- Logo backing ----------
   A white or very pale logo vanishes on our white card. When we detect one we
   return a dark color to sit behind it so it stays visible — preferring the
   site's own declared brand color, falling back to our brand navy. Every step
   is best-effort: any failure yields null (logo just renders on white). */

/** Our brand navy — a safe dark backing any pale logo reads well on. */
const FALLBACK_BACKING = "#0f172a";
/** Logos are small; cap the download so a huge og:image can't blow memory. */
const LOGO_MAX_BYTES = 3 * 1024 * 1024;

/**
 * Decide whether a logo needs a colored tile behind it, and if so which color.
 * Downloads the image and inspects its brightness with sharp; returns null when
 * the logo already shows on white, or when anything goes wrong.
 */
async function deriveLogoBacking(
  logoUrl: string,
  themeColor: string | null,
): Promise<string | null> {
  const bytes = await fetchBytes(logoUrl, LOGO_MAX_BYTES);
  if (!bytes) return null;

  let visibleInk: number;
  try {
    // sharp ships with Next.js; import it lazily so a missing native binary can
    // never break the paid-order webhook — we just skip the backing instead.
    const sharp = (await import("sharp")).default;
    // Shrink, composite onto white (our card color), and read greyscale pixels,
    // then measure how much of the tile carries clearly-visible ink. A logo that
    // leaves the tile essentially white — white or transparent artwork — is
    // invisible on our card and needs a dark backing behind it.
    const { data } = await sharp(Buffer.from(bytes))
      .resize(64, 64, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let ink = 0;
    for (const v of data) if (v < 210) ink++;
    visibleInk = data.length ? ink / data.length : 0;
  } catch {
    return null;
  }

  // Enough visible ink → the logo shows fine on white, so leave it be.
  if (visibleInk >= 0.02) return null;

  // Invisible on white: back it with the site's own declared brand color when
  // that's dark enough for a pale logo to read against, else our brand navy.
  const themed = parseColor(themeColor);
  if (themed && luminance(themed) < 0.5) return toHex(themed);
  return FALLBACK_BACKING;
}

/** Fetch up to `max` bytes of a URL as raw bytes, or null on any failure. */
async function fetchBytes(
  url: string,
  max: number,
): Promise<Uint8Array | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          // Browser-like headers: some CDNs serve a challenge page (or nothing)
          // to unknown agents, and we want the same rendition the browser sees.
          // AVIF is intentionally left out — our decoder can't read it.
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          accept: "image/webp,image/png,image/jpeg,image/svg+xml,image/*;q=0.8",
        },
      });
      if (!res.ok || !res.body) return null;
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.byteLength;
        if (total >= max) {
          await reader.cancel();
          break;
        }
      }
      const out = new Uint8Array(total);
      let offset = 0;
      for (const c of chunks) {
        out.set(c, offset);
        offset += c.byteLength;
      }
      return out;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

type RGB = { r: number; g: number; b: number };

/** Parse "#rgb", "#rrggbb", or "rgb(r,g,b)" into channels, else null. */
function parseColor(value: string | null): RGB | null {
  if (!value) return null;
  const v = value.trim();
  const hex = v.replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return null;
}

/** Relative luminance 0..1 (sRGB coefficients), for a "dark enough" test. */
function luminance({ r, g, b }: RGB): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function toHex({ r, g, b }: RGB): string {
  const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
