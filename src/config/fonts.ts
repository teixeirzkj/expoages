import { IBM_Plex_Sans, Inter } from "next/font/google";

/** Títulos: IBM Plex Sans — sóbria, técnica e humana, sem cara de template. */
export const fontDisplay = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

/** Textos e interface: Inter — alta legibilidade em telas pequenas. */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
