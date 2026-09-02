import { ImageResponse } from "next/og";

// Social share card (Open Graph + Twitter). 1200x630 is the standard large-card
// size used by X, Facebook, LinkedIn, Slack, iMessage, etc. Generated at build
// time via ImageResponse (satori) — flexbox + a subset of CSS only, no grid.
export const alt = "MillionDollar — pay your way to #1";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same crown mark as the favicon / header, drawn white so it reads on the
// brand-blue tile. Rendered as an <img> data-URI, which satori handles reliably.
const crown = `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l3.8 3.5L12 5l4.2 6.5L20 8l-1.6 9.5H5.6L4 8Z" fill="#ffffff"/><path d="M5.5 20.5h13"/></svg>`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          background: "linear-gradient(135deg, #0b1220 0%, #12203f 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 30,
            background: "#2563eb",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={84}
            height={84}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(crown)}`}
            alt=""
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: "#ffffff" }}>Million</span>
          <span style={{ color: "#3b82f6" }}>Dollar</span>
        </div>

        <div style={{ display: "flex", fontSize: 42, color: "#cbd5e1" }}>
          Pay your way to #1
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 10,
            background: "#f59e0b",
            color: "#241703",
            fontSize: 30,
            fontWeight: 700,
            padding: "14px 32px",
            borderRadius: 999,
          }}
        >
          $6 to climb · $1 to seize the crown
        </div>
      </div>
    ),
    { ...size },
  );
}
