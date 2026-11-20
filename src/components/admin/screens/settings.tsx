import { siteConfig } from "@/config/site";
import type { DataMode } from "@/lib/domain";
import { loadRepo } from "@/lib/server/admin-data";
import { isSupabaseConfigured } from "@/lib/server/env";
import { createSessionClient } from "@/lib/server/supabase";
import { DemoControls } from "../demo-controls";
import { PageHeader, Panel } from "../ui";

async function listAdmins(): Promise<{ name: string; since: string }[]> {
  const db = await createSessionClient();
  if (!db) return [];
  const { data } = await db.from("admin_profiles").select("display_name, created_at").order("created_at");
  return (data ?? []).map((a) => ({ name: a.display_name, since: a.created_at }));
}

const SWATCHES = [
  ["--brand-navy", "Azul-marinho"],
  ["--brand-blue", "Azul secundário"],
  ["--brand-cream", "Branco-creme"],
  ["--brand-mist", "Cinza claro"],
  ["--brand-slate", "Texto secundário"],
  ["--brand-sky", "Azul claro"],
];

export async function SettingsScreen({ mode }: { mode: DataMode }) {
  await loadRepo(mode);
  const admins = mode === "live" ? await listAdmins() : [];
  const a = siteConfig.academic;

  return (
    <div>
      <PageHeader
        eyebrow="Configurações"
        title="Plataforma e apresentação"
        description="Nesta versão, identidade e conteúdos são editados em arquivos de configuração versionados — sem construtor visual."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Identidade visual" description="Edite os tokens em src/app/globals.css e o logotipo em src/config/site.ts.">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {SWATCHES.map(([v, label]) => (
              <li key={v} className="text-center">
                <span className="mx-auto block size-12 rounded-2xl ring-1 ring-navy/10" style={{ background: `var(${v})` }} />
                <span className="mt-2 block text-[0.7rem] text-ink/60">{label}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-ink/55">Nome da plataforma</dt><dd className="font-medium">{siteConfig.platformName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/55">Logotipo</dt><dd className="font-medium">{siteConfig.logo.style === "oficial" ? "Logo oficial do grupo" : "Marca clássica (SVG)"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/55">Tipografia</dt><dd className="font-medium">Fraunces + Manrope</dd></div>
          </dl>
        </Panel>

        <Panel title="Informações do projeto" description="Edite em src/config/site.ts (campo academic).">
          <dl className="space-y-2 text-sm">
            {[
              ["Disciplina", a.course],
              ["Instituição", a.institution || "A definir"],
              ["Orientação", a.advisor || "A definir"],
              ["Integrantes", a.members.length ? a.members.join(", ") : "A definir"],
              ["Evento", [a.event, a.year].filter(Boolean).join(" · ") || "A definir"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-navy/5 pb-2">
                <dt className="text-ink/55">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel
          title="Administradores autorizados"
          description="Não existe cadastro público. Novos administradores são criados no Supabase (Auth) e autorizados pela tabela admin_profiles — veja o README."
        >
          {mode === "demo" ? (
            <p className="text-sm text-ink/60">No modo demonstração não há contas: o painel é aberto e contém apenas dados fictícios.</p>
          ) : admins.length ? (
            <ul className="divide-y divide-navy/8 text-sm">
              {admins.map((ad) => (
                <li key={ad.since + ad.name} className="flex justify-between py-2.5">
                  <span className="font-medium">{ad.name}</span>
                  <span className="text-ink/50">desde {new Date(ad.since).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">Nenhum administrador listado.</p>
          )}
        </Panel>

        <Panel title="Preferências de demonstração" description="Afetam somente o ambiente fictício — nunca o banco real.">
          <DemoControls supabaseConfigured={isSupabaseConfigured()} />
        </Panel>
      </div>
    </div>
  );
}
