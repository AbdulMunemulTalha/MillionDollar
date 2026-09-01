import type { SVGProps } from "react";

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type IconProps = SVGProps<SVGSVGElement>;

export function Crown(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M4 8l3.8 3.5L12 5l4.2 6.5L20 8l-1.6 9.5H5.6L4 8Z" />
      <path d="M5.5 20.5h13" />
    </svg>
  );
}

export function Trophy(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" />
      <path d="M6 6H3v1.5A3.5 3.5 0 0 0 6.5 11" />
      <path d="M18 6h3v1.5A3.5 3.5 0 0 1 17.5 11" />
      <path d="M10 14.5h4l-.5 3.5h-3l-.5-3.5Z" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Bolt(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function Dollar(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M12 2v20" />
      <path d="M17 6.5C17 4.6 14.8 4 12 4S7 4.8 7 7s2.4 3 5 3.5 5 1.1 5 3.5-2.2 3-5 3-5-.6-5-2.6" />
    </svg>
  );
}

export function Globe(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  );
}

export function CursorClick(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M9 3v4" />
      <path d="M5 5l2.5 2.5" />
      <path d="M3 9h4" />
      <path d="M11 9l9 4-4 2-2 4-3-10Z" />
    </svg>
  );
}
