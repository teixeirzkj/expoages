import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Reveal } from "@/components/motion/reveal";
import { PulseForm } from "@/components/forms/pulse-form";

export function PulseSection() {
  return (
    <section id="pulso" aria-label="Pulso organizacional" className="relative overflow-hidden bg-sage-2 section-y">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full border border-petrol/10" />
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-[28rem] rounded-full border border-petrol/10" />
      <div className="container-editorial grid items-start gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:pt-6">
          <p className="eyebrow text-petrol/70">06 — Pulso organizacional</p>
          <AnimatedHeading
            lines={["Como você percebe", "seu ambiente", "de _trabalho?_"]}
            accentClassName="text-terracotta-2"
            className="display-lg mt-6 text-petrol"
          />
          <Reveal>
            <p data-reveal className="mt-6 max-w-md text-petrol/75">
              Quatro perguntas rápidas, sem identificação. As respostas alimentam somente indicadores agregados no painel
              da gestão e ficam separadas das mensagens da ouvidoria.
            </p>
            <ul data-reveal className="mt-8 space-y-2 text-sm text-petrol/70">
              <li>· Nenhuma resposta individual é exibida.</li>
              <li>· Grupos pequenos não geram indicadores.</li>
              <li>· Não é um instrumento de diagnóstico psicológico.</li>
            </ul>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <PulseForm />
        </div>
      </div>
    </section>
  );
}
