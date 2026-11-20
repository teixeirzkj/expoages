import { isSupabaseConfigured } from "@/lib/server/env";
import { ParticipationProvider } from "@/components/forms/participation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PresenterDock } from "@/components/layout/presenter-dock";
import { Hero } from "@/components/sections/hero";
import { Program } from "@/components/sections/program";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Participate } from "@/components/sections/participate";
import { About } from "@/components/sections/about";

/**
 * Página pública em cinco áreas: Início, O programa, Como funciona,
 * Participe (ouvidoria, feedback, pesquisa e cursos em abas) e Sobre.
 * Rolagem 100% nativa; animações apenas de entrada, em CSS.
 */
export default function HomePage() {
  return (
    <ParticipationProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader demoForced={!isSupabaseConfigured()} />
      <main id="conteudo">
        <Hero />
        <Program />
        <HowItWorks />
        <Participate demoForced={!isSupabaseConfigured()} />
        <About />
      </main>
      <SiteFooter />
      <PresenterDock />
    </ParticipationProvider>
  );
}
