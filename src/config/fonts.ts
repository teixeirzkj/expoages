import { Fraunces, Manrope } from "next/font/google";

/** Tipografia editorial para títulos (eixos ópticos e "suavidade"). */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Tipografia de leitura e interface. */
export const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
