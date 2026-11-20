import { isSupabaseConfigured } from "@/lib/server/env";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ParticipationProvider } from "@/components/forms/participation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemoModeBanner } from "@/components/layout/demo-banner";
import { PresenterDock } from "@/components/layout/presenter-dock";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { Program } from "@/components/sections/program";
import { HowItWorks } from "@/components/sections/how-it-works";
import { OuvidoriaSection } from "@/components/sections/ouvidoria";
import { Recognition } from "@/components/sections/recognition";
import { PulseSection } from "@/components/sections/pulse";
import { ActionFlow } from "@/components/sections/action-flow";
import { About } from "@/components/sections/about";
import { Faq } from "@/components/sections/faq";

export default function HomePage() {
  return (
    <SmoothScroll>
      <ParticipationProvider>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-petrol focus:px-5 focus:py-3 focus:text-ivory"
        >
          Pular para o conteúdo
        </a>
        <ScrollProgress />
        <SiteHeader />
        <main id="conteudo">
          <Hero />
          <Problem />
          <Program />
          <HowItWorks />
          <OuvidoriaSection />
          <Recognition />
          <PulseSection />
          <ActionFlow />
          <About />
          <Faq />
        </main>
        <SiteFooter />
        <DemoModeBanner forced={!isSupabaseConfigured()} />
        <PresenterDock />
      </ParticipationProvider>
    </SmoothScroll>
  );
}
