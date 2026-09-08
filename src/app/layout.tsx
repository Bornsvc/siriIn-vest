import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Noto_Sans_Lao,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

/* Display + numerals: engineered, distinctive figures for prices. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

/* UI + body: built for data-dense institutional interfaces. */
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Tickers, order ids, the rate rail. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* Lao script — reached by per-glyph fallback from --font-sans. */
const notoLao = Noto_Sans_Lao({
  variable: "--font-noto-lao",
  subsets: ["lao"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SiriInvest — ລົງທຶນທົ່ວໂລກ ເຕີບໂຕໄປນຳກັນ",
    template: "%s · SiriInvest",
  },
  description:
    "Buy U.S. stocks and ETFs from Laos. Fund in kip, trade in dollars, settle to your local bank.",
};

export const viewport: Viewport = {
  themeColor: "#106e52",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="lo"
      className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable} ${notoLao.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
