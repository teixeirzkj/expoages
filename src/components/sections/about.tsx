import { siteConfig } from "@/config/site";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";

const TOPICS = [
  { k: "Tema", v: siteConfig.academic.title },
  { k: "Disciplina", v: siteConfig.academic.course },
  {
    k: "Objetivo",
    v: "Propor um programa que una canais de escuta, feedback e reconhecimento para apoiar a saúde e a motivação dos funcionários de uma empresa.",
  },
  {
    k: "Psicologia Organizacional e do Trabalho",
    v: "Estuda como o trabalho afeta o bem-estar das pessoas e como as organizações podem favorecer ambientes mais saudáveis — base para compreender motivação, desgaste e reconhecimento.",
  },
  {
    k: "Papel da tecnologia",
    v: "A plataforma é uma ferramenta de apoio: facilita a escuta e a organização das informações, mas não substitui o diálogo, a liderança atenta nem o cuidado profissional.",
  },
];

function Placeholder({ value }: { value: string }) {
  return value ? <span>{value}</span> : <span className="italic text-ink/40">A definir</span>;
}

export function About() {
  const a = siteConfig.academic;
  const c = siteConfig.company;
  return (
    <section id="sobre" aria-label="Sobre o projeto" className="relative bg-ivory section-y">
      <div className="container-editorial">
        <div className="grid gap-8 lg:grid-cols-12">
          <p className="eyebrow text-terracotta-2 lg:col-span-3">08 — Sobre o trabalho</p>
          <AnimatedHeading
            lines={["Uma proposta acadêmica", "com um _cenário fictício._"]}
            accentClassName="text-terracotta-2"
            className="display-lg text-petrol lg:col-span-9"
          />
        </div>

        <div className="mt-16 grid gap-14 lg:grid-cols-12">
          <Reveal as="dl" className="divide-y divide-petrol/12 border-y border-petrol/12 lg:col-span-7">
            {TOPICS.map((t) => (
              <div key={t.k} data-reveal className="grid gap-2 py-6 md:grid-cols-[13rem_1fr] md:gap-8">
                <dt className="text-sm font-semibold text-petrol">{t.k}</dt>
                <dd className="text-ink/75">{t.v}</dd>
              </div>
            ))}
          </Reveal>

          <div className="space-y-5 lg:col-span-5">
            <Reveal variant="clip" className="rounded-[var(--radius-card)] bg-petrol p-8 text-ivory">
              <p className="eyebrow text-sage">Empresa estudada</p>
              <p className="mt-4 font-display text-2xl leading-snug">{c.name}</p>
              <p className="mt-1 text-sm text-ivory/60">{c.nature}</p>
              <dl className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs text-ivory/55">Colaboradores no cenário</dt>
                  <dd className="mt-1 font-display text-4xl"><Counter value={c.employees} /></dd>
                </div>
                <div>
                  <dt className="text-xs text-ivory/55">Fundação (fictícia)</dt>
                  <dd className="mt-1 font-display text-4xl">{c.founded}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-ivory/55">Atuação</dt>
                  <dd className="mt-1 text-ivory/85">{c.segment} · {c.location}</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal className="rounded-[var(--radius-card)] border border-petrol/15 p-8">
              <p data-reveal className="eyebrow text-terracotta-2">Ficha do projeto</p>
              <dl data-reveal className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-6"><dt className="text-ink/55">Instituição</dt><dd className="text-right font-medium"><Placeholder value={a.institution} /></dd></div>
                <div className="flex justify-between gap-6"><dt className="text-ink/55">Orientação</dt><dd className="text-right font-medium"><Placeholder value={a.advisor} /></dd></div>
                <div className="flex justify-between gap-6"><dt className="text-ink/55">Evento</dt><dd className="text-right font-medium"><Placeholder value={[a.event, a.year].filter(Boolean).join(" · ")} /></dd></div>
                <div className="flex justify-between gap-6">
                  <dt className="text-ink/55">Integrantes</dt>
                  <dd className="text-right font-medium">
                    {a.members.length ? (
                      <ul>{a.members.map((m) => <li key={m}>{m}</li>)}</ul>
                    ) : (
                      <Placeholder value="" />
                    )}
                  </dd>
                </div>
              </dl>
              {a.institutionLogoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img data-reveal src={a.institutionLogoSrc} alt={`Logo ${a.institution}`} className="mt-8 h-12 w-auto" />
              ) : null}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
