"use client";

import { ClipboardCheck, Inbox, MessageSquareText, Search } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { useParticipation } from "@/components/forms/participation";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Compartilhe sua experiência",
    text: "Pelo celular, computador ou tablet: ouvidoria ou pesquisa de percepção, sem cadastro e sem login. A gestão também publica avaliações individuais no Meu Feedback.",
    tags: ["Sem login", "Sem dados pessoais"],
  },
  {
    icon: Inbox,
    title: "A gestão recebe e analisa",
    text: "Somente administradores autorizados acessam o painel, classificam os registros e identificam os temas que mais se repetem.",
    tags: ["Acesso restrito", "Prioridades"],
  },
  {
    icon: ClipboardCheck,
    title: "Acompanhe o retorno e as melhorias",
    text: "Com o protocolo recebido no envio, você consulta o andamento e as devolutivas. O que é decidido vira ação com responsável e prazo.",
    tags: ["Protocolo", "Plano de ações"],
  },
];

const MANAGEMENT = [
  "Identificar temas recorrentes",
  "Organizar prioridades",
  "Planejar ações com responsável e prazo",
  "Devolver à equipe o que foi decidido",
];

export function HowItWorks() {
  const { openTracker } = useParticipation();

  return (
    <section id="como-funciona" aria-labelledby="como-title" className="section-y bg-white">
      <div className="container-editorial">
        <Reveal className="max-w-2xl">
          <p data-reveal className="eyebrow text-blue">Como funciona</p>
          <h2 data-reveal id="como-title" className="display-lg mt-3 text-navy">
            Da mensagem à devolutiva, em três etapas.
          </h2>
        </Reveal>

        <Reveal as="ol" className="relative mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          <span aria-hidden className="steps-line absolute left-[16.6%] right-[16.6%] top-7 hidden h-px bg-navy/15 md:block" />
          {STEPS.map(({ icon: Icon, title, text, tags }, i) => (
            <li key={title} data-reveal className="relative flex gap-4 rounded-[var(--radius-card)] bg-cream p-5 md:flex-col md:gap-0 md:bg-transparent md:p-0 md:text-center">
              <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-navy text-white ring-8 ring-cream md:mx-auto md:ring-white">
                <Icon className="size-6" strokeWidth={1.7} />
              </span>
              <div className="md:mt-5">
                <p className="text-xs font-semibold tabular-nums text-blue">Etapa {i + 1}</p>
                <h3 className="display-md mt-1 text-navy">{title}</h3>
                <p className="mt-2 text-[0.9375rem] text-slate md:mx-auto md:max-w-[19rem]">{text}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5 md:justify-center">
                  {tags.map((t) => (
                    <li key={t} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-navy">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </Reveal>

        <Reveal className="mt-10 grid gap-6 rounded-[var(--radius-card)] bg-navy p-6 text-cream md:mt-14 md:p-8 lg:grid-cols-12 lg:items-center surface-dark">
          <div data-reveal className="lg:col-span-4">
            <p className="font-display text-lg font-semibold text-white">Da escuta à ação</p>
            <p className="mt-1 text-sm text-cream/70">O que a gestão faz com o que recebe.</p>
          </div>
          <ol data-reveal className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
            {MANAGEMENT.map((m, i) => (
              <li key={m} className="flex items-start gap-2.5 text-sm text-cream/85">
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.6875rem] font-semibold tabular-nums text-sky">
                  {i + 1}
                </span>
                {m}
              </li>
            ))}
          </ol>
          <div data-reveal className="lg:col-span-3 lg:text-right">
            <button
              type="button"
              onClick={() => openTracker()}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:border-white/60"
            >
              <Search className="size-4" /> Acompanhar manifestação
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
