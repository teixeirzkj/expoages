import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

/**
 * Logotipo da plataforma.
 *  - "oficial": arte enviada pelo grupo (public/brand). Versão AZUL para fundos
 *    claros (tone="dark") e versão CREME para fundos azuis (tone="light").
 *  - "classico": a marca demonstrativa original em SVG (guardada a pedido do
 *    grupo). Troque em src/config/site.ts → logo.style.
 */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: Tone }) {
  if (siteConfig.logo.style === "classico") return <LogoClassic className={className} tone={tone} />;
  const src = tone === "dark" ? siteConfig.logo.onLight : siteConfig.logo.onDark;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={siteConfig.logo.alt}
      width={siteConfig.logo.width}
      height={siteConfig.logo.height}
      decoding="async"
      className={cn("h-10 w-auto select-none", className)}
      draggable={false}
    />
  );
}

/** Marca demonstrativa original (horizonte com um ponto de escuta). */
export function LogoClassic({ className, tone = "dark" }: { className?: string; tone?: Tone }) {
  const color = tone === "dark" ? "text-navy" : "text-cream";
  return (
    <span className={cn("inline-flex items-center gap-2.5", color, className)}>
      <LogoClassicMark tone={tone} className="size-8 shrink-0" />
      <span className="font-display text-[1.25rem] font-semibold leading-none tracking-[-0.01em]">{siteConfig.platformName}</span>
    </span>
  );
}

export function LogoClassicMark({ className, tone = "dark" }: { className?: string; tone?: Tone }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 24.5h26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 24.5a9 9 0 0 1 18 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="15" r="2.6" className={tone === "dark" ? "fill-blue" : "fill-sky"} />
    </svg>
  );
}
