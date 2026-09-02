import { ImageResponse } from "next/og";

// Apple touch icon (Home Screen). iOS applies its own rounded mask, so we
// render a full-bleed brand-blue tile with the white crown centered.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same crown mark as the header logo, drawn as a filled white shape so it
// reads cleanly at icon sizes.
const crown = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l3.8 3.5L12 5l4.2 6.5L20 8l-1.6 9.5H5.6L4 8Z" fill="#ffffff"/><path d="M5.5 20.5h13"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={112}
          height={112}
          src={`data:image/svg+xml;utf8,${encodeURIComponent(crown)}`}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
