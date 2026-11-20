"use client";

import Link from "next/link";
import { GraduationCap, MessageSquareText } from "lucide-react";
import { navItems, siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";
import { ActionButton } from "@/components/brand/action-button";
import { useParticipation } from "@/components/forms/participation";

export function SiteFooter() {
  const a = siteConfig.academic;
  const { selectTab } = useParticipation();

  return (
    <footer className="surface-dark bg-navy text-cream">
      <div className="container-editorial">
        {/* Chamada final */}
        <div className="flex flex-col gap-6 border-b border-white/10 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <p className="display-lg max-w-[18ch] text-white">
              Valorizar pessoas começa por <span className="text-sky">ouvi-las.</span>
            </p>
            <p className="mt-2 text-cream/70">Experimente os canais do programa agora mesmo.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ActionButton variant="accent" size="lg" onClick={() => selectTab("ouvidoria", { scroll: true })} icon={<MessageSquareText className="size-4" />}>
              Acessar a ouvidoria
            </ActionButton>
            <ActionButton
              variant="outline"
              size="lg"
              className="text-cream"
              onClick={() => selectTab("cursos", { scroll: true })}
              icon={<GraduationCap className="size-4" />}
            >
              Inscrever-se em um curso
            </ActionButton>
          </div>
        </div>

        <div className="grid gap-8 py-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo tone="light" />
            <p className="mt-3 max-w-xs text-sm text-cream/60">{siteConfig.platformTagline}.</p>
          </div>
          <nav aria-label="Rodapé" className="md:col-span-3">
            <p className="text-xs font-semibold text-cream/50">Navegação</p>
            <ul className="mt-3 space-y-2 text-sm">
              {navItems.map((n) => (
                <li key={n.id}>
                  <a href={`/#${n.id}`} className="text-cream/75 transition-colors hover:text-white">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm md:col-span-5">
            <p className="text-xs font-semibold text-cream/50">Projeto acadêmico</p>
            <p className="mt-3 leading-relaxed text-cream/70">
              Disciplina de {a.course}
              {a.institution ? ` · ${a.institution}` : ""}
              {a.event ? ` · ${a.event}` : ""}
              {a.year ? ` ${a.year}` : ""}.
            </p>
            <p className="mt-2 leading-relaxed text-cream/55">
              Empresa fictícia: {siteConfig.company.name}. Os dados de exemplo da plataforma são demonstrativos e não representam
              resultados reais.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pb-24 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>Projeto demonstrativo · sem fins comerciais</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2" data-secondary>
            <Link href="/privacidade" className="hover:text-white">
              Política de privacidade
            </Link>
            <Link href="/apresentacao" className="hover:text-white">
              Modo apresentação
            </Link>
            <Link href="/admin" className="hover:text-white" rel="nofollow">
              Área administrativa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
