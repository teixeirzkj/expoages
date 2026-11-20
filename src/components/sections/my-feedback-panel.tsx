import Link from "next/link";
import { ArrowUpRight, FlaskConical, Sparkles, Sprout, Target } from "lucide-react";

/**
 * Conteúdo da aba "Meu Feedback". Não há formulário aqui: as avaliações são
 * escritas pela gestão e lidas pelo próprio colaborador, numa área privada.
 */
export function MyFeedbackPanel({ demo }: { demo: boolean }) {
  return (
    <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr] md:gap-8">
      {/* Prévia ilustrativa de um relatório (sem dados de ninguém) */}
      <figure aria-label="Exemplo ilustrativo de relatório" className="rounded-xl bg-cream p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <figcaption className="text-[0.8125rem] font-semibold text-navy">Exemplo ilustrativo</figcaption>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate">Relatório mensal</span>
        </div>
        <div className="mt-3 grid gap-2">
          {[
            { icon: Sparkles, t: "Pontos positivos", d: "Comportamentos e resultados reconhecidos" },
            { icon: Sprout, t: "Pontos de melhoria", d: "Orientações construtivas" },
            { icon: Target, t: "Metas para o próximo mês", d: "Até três ações de desenvolvimento" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-navy">
                <Icon className="size-4" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-sm font-semibold text-ink">{t}</span>
                <span className="text-[0.8125rem] text-slate">{d}</span>
              </span>
            </div>
          ))}
        </div>
      </figure>

      <div className="grid gap-3">
        <Link
          href={demo ? "/colaborador/demo" : "/colaborador/entrar"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-navy px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-blue"
        >
          Consultar meus feedbacks <ArrowUpRight className="size-4" />
        </Link>
        {!demo && (
          <Link
            href="/colaborador/demo"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-mist px-5 text-sm font-semibold text-navy hover:bg-cream-2"
          >
            <FlaskConical className="size-4" /> Ver demonstração
          </Link>
        )}
        <p className="text-[0.8125rem] leading-snug text-slate">
          {demo
            ? "Modo demonstração: você verá colaboradores e avaliações fictícios."
            : "Acesso com a conta criada pela gestão."}{" "}
          A ouvidoria continua anônima e não tem relação com esta área.
        </p>
      </div>
    </div>
  );
}
