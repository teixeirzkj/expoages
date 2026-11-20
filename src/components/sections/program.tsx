import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Disclosure } from "@/components/ui/disclosure";

const PAIRS = [
  {
    problem: "Comunicação insuficiente",
    problemText: "Decisões chegam sem contexto e não há um canal seguro para responder.",
    pillar: "Escuta",
    pillarText: "Canais para compreender necessidades, preocupações e sugestões — com retorno.",
  },
  {
    problem: "Falta de reconhecimento",
    problemText: "Quando o esforço só aparece em números, boas contribuições ficam invisíveis.",
    pillar: "Reconhecimento",
    pillarText: "Valorizar esforços, habilidades e atitudes, não apenas resultados.",
  },
  {
    problem: "Sobrecarga",
    problemText: "Metas, filas e pressão emocional constante desgastam a equipe.",
    pillar: "Evolução",
    pillarText: "Transformar o que é ouvido em ações de melhoria acompanhadas pela gestão.",
  },
];

const HYGIENE = ["Condições de trabalho", "Supervisão e comunicação", "Relações interpessoais", "Políticas e critérios claros"];
const MOTIVATORS = ["Reconhecimento", "Realização", "Crescimento e desenvolvimento", "Responsabilidade e autonomia"];

function Herzberg() {
  return (
    <div className="space-y-5 text-[0.9375rem]">
      <p>
        Frederick Herzberg (1959) distinguiu os fatores que <strong className="font-semibold text-ink">evitam a insatisfação</strong>{" "}
        daqueles que <strong className="font-semibold text-ink">de fato motivam</strong>. O programa atua sobre os dois: melhora as
        condições e a comunicação, e torna o reconhecimento e o desenvolvimento parte da rotina.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-5 ring-1 ring-navy/8">
          <p className="font-semibold text-navy">Fatores higiênicos</p>
          <p className="text-sm">Quando ausentes, geram insatisfação.</p>
          <ul className="mt-3 space-y-1.5 text-ink/85">
            {HYGIENE.map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-[0.7em] h-px w-3 shrink-0 bg-navy/40" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-navy p-5 text-cream">
          <p className="font-semibold text-white">Fatores motivacionais</p>
          <p className="text-sm text-cream/70">Quando presentes, geram satisfação.</p>
          <ul className="mt-3 space-y-1.5">
            {MOTIVATORS.map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-[0.7em] h-px w-3 shrink-0 bg-sky" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-sm">
        Base: Psicologia Organizacional e do Trabalho, que estuda como o trabalho afeta o bem-estar e como as organizações podem
        favorecer ambientes mais saudáveis.
      </p>
    </div>
  );
}

export function Program() {
  return (
    <section id="programa" aria-labelledby="programa-title" className="section-y bg-cream">
      <div className="container-editorial">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div data-reveal className="lg:col-span-7">
            <p className="eyebrow text-blue">O programa</p>
            <h2 id="programa-title" className="display-lg mt-3 max-w-[20ch] text-navy">
              Um programa para que cada contribuição seja vista.
            </h2>
          </div>
          <p data-reveal className="lead max-w-[36rem] text-slate lg:col-span-5">
            O Programa de Reconhecimento e Valorização Profissional une escuta, reconhecimento e feedback em um ciclo contínuo
            de cuidado com quem trabalha.
          </p>
        </Reveal>

        <div className="mt-10 overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-navy/8 md:mt-14">
          <div className="hidden grid-cols-[1fr_3rem_1fr] gap-6 border-b border-navy/8 px-8 py-3 text-xs font-semibold text-slate md:grid">
            <span>Desafio no cenário estudado</span>
            <span />
            <span>Pilar do programa</span>
          </div>
          <Reveal as="ol" className="divide-y divide-navy/8">
            {PAIRS.map((p, i) => (
              <li
                key={p.pillar}
                data-reveal
                className="pair grid gap-4 px-5 py-6 md:grid-cols-[1fr_3rem_1fr] md:items-center md:gap-6 md:px-8 md:py-7"
              >
                <div>
                  <p className="font-display text-[1.0625rem] font-semibold text-ink/70 md:text-lg">
                    <span className="strike relative inline-block">{p.problem}</span>
                  </p>
                  <p className="mt-1 text-[0.9375rem] text-slate">{p.problemText}</p>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full bg-mist text-navy max-md:rotate-90 md:size-10" aria-hidden>
                  <ArrowRight className="size-4" />
                </span>
                <div className="pair-target">
                  <p className="flex items-baseline gap-2.5">
                    <span className="text-xs font-semibold tabular-nums text-blue">0{i + 1}</span>
                    <span className="font-display text-xl font-semibold text-navy md:text-[1.375rem]">{p.pillar}</span>
                  </p>
                  <p className="mt-1 text-[0.9375rem] text-ink/80">{p.pillarText}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal className="mt-8 md:mt-10">
          <Disclosure
            size="lg"
            items={[{ title: "Fundamentação: a teoria dos dois fatores de Herzberg", content: <Herzberg /> }]}
          />
        </Reveal>
      </div>
    </section>
  );
}
