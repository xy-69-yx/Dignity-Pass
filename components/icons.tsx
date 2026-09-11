import type { CSSProperties } from "react";
export function Icon({
  name,
  size = 20,
  style,
}: {
  name:
    | "arrow"
    | "pass"
    | "lock"
    | "grid"
    | "check"
    | "activity"
    | "settings"
    | "refresh"
    | "wallet"
    | "external"
    | "download";
  size?: number;
  style?: CSSProperties;
}) {
  const paths = {
    arrow: "M4 12h15m-6-6 6 6-6 6",
    pass: "M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Zm12 0v3m0 3v2m0 3v3",
    lock: "M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4m-3 4v3",
    grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
    check: "m5 12 4 4L19 6",
    activity: "M3 12h4l3-8 4 16 3-8h4",
    settings: "M4 7h16M4 17h16M9 4v6m6 4v6",
    refresh:
      "M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 3M4 16l2 3a8 8 0 0 0 13-3",
    wallet: "M3 6h17v15H3V6Zm0 0V3h14v3m-2 6h5v5h-5v-5Z",
    external: "M14 3h7v7m0-7L10 14m0-11H3v18h18v-7",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
