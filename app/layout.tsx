import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Manrope({ variable: "--font-display", subsets: ["latin"] });
const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "Dignity Pass — Private Aid Network",
  description:
    "Issue and verify one-time aid coupons with privacy-preserving proofs on Midnight.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
