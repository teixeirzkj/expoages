"use client";

import {
  ChartColumn,
  EyeOff,
  GraduationCap,
  HandHeart,
  KeyRound,
  Lock,
  Mail,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/motion/reveal";
import { EnrollmentForm } from "@/components/forms/enrollment-form";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { OuvidoriaForm } from "@/components/forms/ouvidoria-form";
import { useParticipation, type ParticipeTab } from "@/components/forms/participation";
import { PulseForm } from "@/components/forms/pulse-form";
import { cn } from "@/lib/utils";

const TABS: {
  id: ParticipeTab;
  label: string;
  hint: string;
  icon: LucideIcon;
  title: string;
  text: string;
  points: { icon: LucideIcon; title: string; text: string }[];
}[] = [
  {
    id: "ouvidoria",
    label: "Ouvidoria",
    hint: "Anônima",
    icon: MessageSquareText,
    title: "Sua voz merece espaço.",
    text: "Compartilhe ideias, preocupações e oportunidades de melhoria do ambiente de trabalho.",
    points: [
      { icon: EyeOff, title: "Sem identificação", text: "Não pedimos nome, e-mail, telefone ou CPF." },
      { icon: KeyRound, title: "Protocolo seguro", text: "Um código aleatório permite acompanhar o retorno." },
      { icon: Lock, title: "Acesso restrito", text: "Só a gestão autorizada lê as mensagens." },
    ],
  },
  {
    id: "feedback",
    label: "Reconhecimento e feedback",
    hint: "Anônimo",
    icon: HandHeart,
    title: "Reconhecer também é cuidar.",
    text: "Valorize uma equipe ou prática, ou sugira uma melhoria de forma construtiva.",
    points: [
      { icon: Users, title: "Áreas, não pessoas", text: "Nesta versão não é possível avaliar alguém pelo nome." },
      { icon: ShieldCheck, title: "Nada é publicado", text: "A gestão decide como compartilhar um reconhecimento." },
      { icon: KeyRound, title: "Com protocolo", text: "Acompanhe a devolutiva sem se identificar." },
    ],
  },
  {
    id: "pulso",
    label: "Pesquisa de percepção",
    hint: "4 perguntas",
    icon: Activity,
    title: "Como você percebe seu ambiente de trabalho?",
    text: "Quatro perguntas rápidas, sem identificação e separadas das mensagens da ouvidoria.",
    points: [
      { icon: ChartColumn, title: "Somente agregados", text: "Nenhuma resposta individual é exibida." },
      {
        icon: Users,
        title: "Grupos pequenos não geram indicadores",
        text: `São necessárias ao menos ${siteConfig.minAggregateSample} respostas.`,
      },
      { icon: ShieldCheck, title: "Não é diagnóstico", text: "Não é um instrumento de avaliação psicológica." },
    ],
  },
  {
    id: "cursos",
    label: "Cursos",
    hint: "Inscrição",
    icon: GraduationCap,
    title: "Cursos profissionalizantes",
    text: "Inscreva-se em um dos cursos oferecidos. As próximas informações chegam pelo seu e-mail.",
    points: [
      { icon: Mail, title: "Contato por e-mail", text: "Datas, horários e local são enviados pela coordenação." },
      { icon: UserCheck, title: "Inscrição identificada", text: "Pedimos apenas nome e e-mail, com sua autorização." },
      { icon: Lock, title: "Dados separados", text: "Não se misturam às mensagens anônimas." },
    ],
  },
];

export function Participate() {
  const { tab, selectTab, openTracker } = useParticipation();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Remonta um formulário após o envio, para que o próximo visitante comece do zero.
  const [instances, setInstances] = useState({ ouvidoria: 0, feedback: 0 });
  const reset = useCallback((k: "ouvidoria" | "feedback") => setInstances((s) => ({ ...s, [k]: s[k] + 1 })), []);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    const edge = e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (!delta && edge === null) return;
    e.preventDefault();
    const next = edge ?? (i + delta + TABS.length) % TABS.length;
    selectTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="participe" aria-labelledby="participe-title" className="section-y relative bg-mist">
      <span id="participar" className="absolute top-0" aria-hidden />
      <span id="ouvidoria" className="absolute top-0" aria-hidden />
      <div className="container-editorial">
        <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div data-reveal className="max-w-2xl">
            <p className="eyebrow text-blue">Participe</p>
            <h2 id="participe-title" className="display-lg mt-3 text-navy">
              Escolha como você quer contribuir.
            </h2>
            <p className="mt-3 text-slate">Cada canal tem seu próprio formulário e suas próprias regras de privacidade.</p>
          </div>
          <button
            data-reveal
            type="button"
            onClick={() => openTracker()}
            className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 text-sm font-semibold text-navy ring-1 ring-navy/12 transition-colors hover:ring-navy/40 md:self-auto"
          >
            <Search className="size-4" /> Já enviou? Acompanhe pelo protocolo
          </button>
        </Reveal>

        <div role="tablist" aria-label="Formas de participar" className="mt-8 grid grid-cols-2 gap-2 md:mt-10 md:grid-cols-4">
          {TABS.map((t, i) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => selectTab(t.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-[background-color,color,box-shadow] duration-200 sm:px-4",
                  active ? "bg-navy text-white shadow-[0_8px_24px_-12px_rgba(19,25,54,0.6)]" : "bg-white text-navy ring-1 ring-navy/10 hover:ring-navy/30",
                )}
              >
                <Icon className={cn("size-5 shrink-0", active ? "text-sky" : "text-blue")} strokeWidth={1.8} aria-hidden />
                <span className="min-w-0 leading-tight">
                  <span className="block text-sm font-semibold sm:text-[0.9375rem]">{t.label}</span>
                  <span className={cn("mt-0.5 block text-xs", active ? "text-cream/70" : "text-slate")}>{t.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        {TABS.map((t) => (
          <div
            key={t.id}
            id={`panel-${t.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${t.id}`}
            hidden={tab !== t.id}
            className="mt-3 animate-panel-in rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-navy/8 sm:p-6 lg:p-8"
          >
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              <aside className="lg:col-span-4">
                <h3 className="display-md text-navy">{t.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-slate">{t.text}</p>
                <ul className="mt-6 hidden space-y-4 border-t border-navy/8 pt-6 sm:block">
                  {t.points.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mist text-navy">
                        <Icon className="size-4" strokeWidth={1.8} aria-hidden />
                      </span>
                      <span className="text-sm">
                        <span className="block font-semibold text-ink">{title}</span>
                        <span className="text-slate">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="min-w-0 lg:col-span-8">
                {t.id === "ouvidoria" && (
                  <OuvidoriaForm
                    key={instances.ouvidoria}
                    onTrack={openTracker}
                    onClose={() => reset("ouvidoria")}
                    closeLabel="Enviar outra mensagem"
                  />
                )}
                {t.id === "feedback" && (
                  <FeedbackForm
                    key={instances.feedback}
                    initialKind="reconhecimento"
                    onTrack={openTracker}
                    onClose={() => reset("feedback")}
                    closeLabel="Enviar outro feedback"
                  />
                )}
                {t.id === "pulso" && <PulseForm />}
                {t.id === "cursos" && <EnrollmentForm />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
