import Link from "next/link";
import { navItems, siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";
import { AnimatedHeading } from "@/components/motion/animated-heading";

export function SiteFooter() {
  const a = siteConfig.academic;
  return (
    <footer className="relative overflow-hidden bg-charcoal text-ivory grain">
      <div className="container-editorial pt-[var(--section-y)]">
        <AnimatedHeading
          as="p"
          lines={["Valorizar pessoas", "começa por _ouvi-las._"]}
          accentClassName="text-terracotta"
          className="font-display text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.04em]"
        />

        <div className="mt-20 grid gap-12 border-t border-ivory/12 pt-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm text-ivory/60">{siteConfig.platformTagline}.</p>
          </div>
          <nav aria-label="Rodapé" className="md:col-span-3">
            <p className="eyebrow text-ivory/45">Navegação</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navItems.map((n) => (
                <li key={n.id}>
                  <a href={`/#${n.id}`} className="text-ivory/75 transition-colors hover:text-ivory">{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-5">
            <p className="eyebrow text-ivory/45">Projeto acadêmico</p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">
              Disciplina de {a.course}
              {a.institution ? ` · ${a.institution}` : ""}
              {a.event ? ` · ${a.event}` : ""}
              {a.year ? ` ${a.year}` : ""}.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ivory/50">
              Empresa fictícia: {siteConfig.company.name}. Dados de exemplo exibidos na plataforma são demonstrativos e
              não representam resultados reais.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ivory/12 pb-28 pt-8 text-xs text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Projeto demonstrativo · sem fins comerciais</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2" data-secondary>
            <Link href="/privacidade" className="hover:text-ivory">Política de privacidade</Link>
            <Link href="/apresentacao" className="hover:text-ivory">Modo apresentação</Link>
            <Link href="/admin" className="hover:text-ivory" rel="nofollow">Área administrativa</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
