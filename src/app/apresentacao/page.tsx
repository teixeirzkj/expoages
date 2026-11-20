import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, LayoutDashboard, Globe, Wifi } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/server/env";
import { Logo } from "@/components/brand/logo";
import { DemoControls } from "@/components/admin/demo-controls";

export const metadata: Metadata = { title: "Modo apresentação" };

const SCRIPT = [
  { t: "Abrir o site", d: "Comece pelo início: “Valorizar pessoas começa por ouvi-las.” Toque em “Conhecer o programa”." },
  { t: "Do problema ao pilar", d: "Em “O programa”, mostre cada desafio sendo riscado e o pilar correspondente: Escuta, Reconhecimento e Evolução. Abra o bloco de Herzberg se houver tempo." },
  { t: "Como funciona", d: "Três etapas: compartilhar, a gestão analisa, acompanhar o retorno pelo protocolo." },
  { t: "Acessar a ouvidoria", d: "Em “Participe”, aba Ouvidoria. Convide o visitante a escrever uma sugestão fictícia. As outras abas mostram feedback, pesquisa e cursos." },
  { t: "Enviar e receber o protocolo", d: "Ao enviar, aparece o protocolo HZ-…. Mostre o botão de copiar e o “Acompanhar agora”." },
  { t: "Abrir o painel demonstrativo", d: "No notebook (ou pela barra de atalhos), abra o Painel demo. O envio aparece sozinho em até ~12 segundos." },
  { t: "Mostrar a manifestação", d: "Em Ouvidoria, abra o registro recém-enviado: conteúdo anônimo, sem nome, e-mail ou telefone." },
  { t: "Alterar o status", d: "Avance para “Em análise” e depois “Ação planejada”. O histórico registra cada mudança." },
  { t: "Responder e criar uma ação", d: "Escreva uma resposta vinculada ao protocolo e use “Criar ação de melhoria”. Volte ao iPad e consulte o protocolo: a resposta aparece." },
  { t: "Meu Feedback (gestão → colaborador)", d: "Em Avaliações profissionais, abra o rascunho de Mariana Costa (ou crie um para Beatriz Lima) e toque em Publicar. Depois use “Ver como colaborador”: a notificação aparece, o relatório abre com pontos positivos, de melhoria, metas e curso recomendado, e o histórico fica abaixo." },
  { t: "Gráficos, ações e cursos", d: "Mostre Visão geral, Pulso, o Plano de ações em Kanban e as inscrições em Cursos. Finalize com: “Valorizar pessoas começa por ouvi-las.”" },
];

export default function PresentationPage() {
  const configured = isSupabaseConfigured();
  return (
    <main className="min-h-dvh bg-cream">
      <header className="surface-dark bg-navy text-cream">
        <div className="container-editorial flex flex-col gap-10 py-10 md:py-14">
          <div className="flex items-center justify-between gap-4">
            <Logo tone="light" />
            <span className="rounded-full bg-sky px-3 py-1 text-xs font-semibold text-navy">ExpoAGES</span>
          </div>
          <div className="max-w-3xl">
            <p className="eyebrow text-sky">Modo apresentação</p>
            <h1 className="display-lg mt-4">Roteiro para quem apresenta.</h1>
            <p className="lead mt-4 text-cream/70">
              Prepare cada aparelho, siga as etapas e reinicie a demonstração entre grupos de visitantes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/" className="group flex min-h-24 items-center justify-between gap-4 rounded-3xl bg-cream p-6 text-navy">
              <span className="flex items-center gap-3 text-lg font-semibold"><Globe className="size-6" /> Abrir o site</span>
              <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
            </Link>
            <Link href="/demo" className="group flex min-h-24 items-center justify-between gap-4 rounded-3xl bg-sky p-6 text-navy">
              <span className="flex items-center gap-3 text-lg font-semibold"><LayoutDashboard className="size-6" /> Painel demonstrativo</span>
              <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
            </Link>
            <Link href="/demo/ouvidoria" className="group flex min-h-24 items-center justify-between gap-4 rounded-3xl bg-cream/10 p-6 text-cream ring-1 ring-cream/15">
              <span className="text-lg font-semibold">Ir direto às manifestações</span>
              <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container-editorial grid gap-10 py-12 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-label="Roteiro">
          <h2 className="display-md text-navy">Roteiro de demonstração</h2>
          <ol className="mt-6 space-y-3">
            {SCRIPT.map((s, i) => (
              <li key={s.t} className="flex gap-5 rounded-3xl bg-card p-5 ring-1 ring-navy/8">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-base font-semibold text-white tabular-nums">{i + 1}</span>
                <div>
                  <p className="font-semibold text-ink">{s.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/65">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <section className="rounded-3xl bg-card p-6 ring-1 ring-navy/8">
            <h2 className="font-semibold text-ink">Preparar este aparelho</h2>
            <p className="mt-1 text-sm text-ink/55">Faça isso em cada aparelho usado no estande (iPad e notebook).</p>
            <div className="mt-5">
              <DemoControls supabaseConfigured={configured} />
            </div>
          </section>

          <section className="rounded-3xl bg-mist/70 p-6 text-navy">
            <h2 className="flex items-center gap-2 font-semibold"><Wifi className="size-5" /> iPad + notebook</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              <li>· Os dois aparelhos precisam acessar o <strong>mesmo servidor</strong>: o endereço publicado (Vercel) ou o notebook rodando o projeto na mesma rede Wi-Fi.</li>
              <li>· O ambiente demonstrativo vive na memória do servidor. Ele é compartilhado entre aparelhos ligados ao mesmo servidor e reinicia quando o servidor reinicia.</li>
              <li>· Em hospedagem serverless, instâncias diferentes podem não compartilhar a memória. Para a feira, prefira o notebook como servidor local ou o Supabase configurado.</li>
              <li>· {configured ? "Supabase configurado: desative o modo demonstração para gravar no banco real e use o painel /admin." : "Supabase não configurado: todos os envios vão para o ambiente fictício."}</li>
            </ul>
          </section>

          <section className="rounded-3xl bg-card p-6 text-sm text-ink/70 ring-1 ring-navy/8">
            <h2 className="font-semibold text-ink">Lembretes</h2>
            <ul className="mt-3 space-y-2">
              <li>· Peça aos visitantes que <strong>não escrevam dados reais</strong> nem nomes de pessoas.</li>
              <li>· Reinicie a demonstração entre grupos para manter o painel limpo.</li>
              <li>· Os números do painel demo são fictícios — diga isso ao mostrar os gráficos.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
