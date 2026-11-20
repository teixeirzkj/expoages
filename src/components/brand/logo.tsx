import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Marca provisória: um horizonte com um ponto de escuta.
 * Para usar o logotipo oficial, defina `logoSrc` em src/config/site.ts
 * (coloque o arquivo em /public).
 */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const color = tone === "dark" ? "text-navy" : "text-cream";
  if (siteConfig.logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={siteConfig.logoSrc} alt={siteConfig.logoAlt} className={cn("h-8 w-auto", className)} />
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2.5", color, className)}>
      <svg viewBox="0 0 40 40" className="size-8 shrink-0" aria-hidden>
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 24.5h26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 24.5a9 9 0 0 1 18 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="15" r="2.6" className={tone === "dark" ? "fill-blue" : "fill-sky"} />
      </svg>
      <span className="font-display text-[1.25rem] font-semibold leading-none tracking-[-0.01em]">
        {siteConfig.platformName}
      </span>
    </span>
  );
}
