import type { Metadata, Viewport } from "next";
import { fontDisplay, fontSans } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.platformName} — ${siteConfig.platformTagline}`,
    template: `%s · ${siteConfig.platformName}`,
  },
  description:
    "Proposta acadêmica de um programa de escuta, reconhecimento e feedback para um ambiente de trabalho mais saudável. Projeto demonstrativo com empresa fictícia.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#131936",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Aplica o modo apresentação antes da primeira pintura (cookie não sensível).
const presentationScript = `try{if(document.cookie.indexOf("hz_present=1")>-1)document.documentElement.dataset.presentation="true"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: presentationScript }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
