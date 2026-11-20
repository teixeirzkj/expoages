import Form from "next/form";
import Link from "next/link";
import { Download, Mail, Search, X } from "lucide-react";
import {
  COURSE_SHIFTS,
  COURSES,
  ENROLLMENT_STATUSES,
  type CourseKey,
  type DataMode,
  type EnrollmentStatus,
} from "@/lib/domain";
import { toQuery } from "@/lib/filters";
import { formatDateTime } from "@/lib/format";
import { basePath, loadRepo } from "@/lib/server/admin-data";
import { EnrollmentControls } from "../enrollment-controls";
import { EmptyState, MetricCard, PageHeader } from "../ui";

const control =
  "h-11 rounded-xl border border-navy/15 bg-card px-3 text-sm focus:border-navy focus:outline-none focus:ring-4 focus:ring-sky/20";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export async function CoursesScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const course = one(sp.curso) in COURSES ? (one(sp.curso) as CourseKey) : undefined;
  const status = one(sp.status) in ENROLLMENT_STATUSES ? (one(sp.status) as EnrollmentStatus) : undefined;
  const q = one(sp.q).slice(0, 60) || undefined;

  const repo = await loadRepo(mode);
  const [all, rows] = await Promise.all([repo.listEnrollments(), repo.listEnrollments({ course, status, q })]);
  const action = `${basePath(mode)}/cursos`;
  const exportHref = `/api/export${toQuery({ tipo: "cursos", modo: mode, curso: course, status, q })}`;
  const byCourse = (Object.keys(COURSES) as CourseKey[]).map((k) => ({
    key: k,
    total: all.filter((e) => e.course === k && e.status !== "cancelada").length,
  }));
  const pendingContact = all.filter((e) => e.status === "recebida").length;
  const hasFilters = Boolean(course || status || q);

  return (
    <div>
      <PageHeader
        eyebrow="Cursos profissionalizantes"
        title="Inscrições"
        description="Inscrições identificadas (nome e e-mail), guardadas separadamente dos canais anônimos. Use os dados apenas para o contato sobre o curso."
        actions={
          <a
            href={exportHref}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-navy ring-1 ring-navy/15 hover:bg-cream-2"
          >
            <Download className="size-4" /> CSV
          </a>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard tone="dark" label="Aguardando contato" value={pendingContact} hint={`${all.length} inscrições no total`} />
        {byCourse.map((c) => (
          <MetricCard key={c.key} label={COURSES[c.key].label} value={c.total} hint="inscrições ativas" />
        ))}
      </div>

      <Form action={action} className="mb-5 flex flex-wrap items-end gap-2.5">
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">Pesquisar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <input name="q" defaultValue={q} placeholder="Nome ou e-mail…" className={`${control} w-full pl-9`} />
        </label>
        <label>
          <span className="sr-only">Curso</span>
          <select name="curso" defaultValue={course ?? ""} className={control}>
            <option value="">Todos os cursos</option>
            {Object.entries(COURSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select name="status" defaultValue={status ?? ""} className={control}>
            <option value="">Todos os status</option>
            {Object.entries(ENROLLMENT_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-cream">
          Filtrar
        </button>
        {hasFilters && (
          <Link href={action} className="flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm text-ink/60 hover:bg-cream-2">
            <X className="size-4" /> Limpar
          </Link>
        )}
      </Form>

      {rows.length === 0 ? (
        <EmptyState title="Nenhuma inscrição encontrada" text="Ajuste os filtros ou aguarde novas inscrições. A lista se atualiza automaticamente." />
      ) : (
        <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-navy/8">
          <table className="hidden w-full text-left text-sm lg:table">
            <thead className="border-b border-navy/8 text-xs text-ink/55">
              <tr>
                <th className="px-5 py-3 font-medium">Pessoa</th>
                <th className="px-3 py-3 font-medium">Curso</th>
                <th className="px-3 py-3 font-medium">Turno</th>
                <th className="px-3 py-3 font-medium">Data</th>
                <th className="px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{e.fullName}</p>
                    <a href={`mailto:${e.email}`} className="mt-0.5 inline-flex items-center gap-1.5 text-ink/60 hover:text-navy">
                      <Mail className="size-3.5" aria-hidden /> {e.email}
                    </a>
                  </td>
                  <td className="px-3 py-3.5 text-ink/80">
                    {COURSES[e.course].label}
                    {e.area && <span className="block text-xs text-ink/50">{e.area}</span>}
                  </td>
                  <td className="px-3 py-3.5 text-ink/70">{COURSE_SHIFTS[e.shift]}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-ink/60">{formatDateTime(e.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <EnrollmentControls mode={mode} id={e.id} status={e.status} name={e.fullName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-navy/8 lg:hidden">
            {rows.map((e) => (
              <li key={e.id} className="p-4">
                <p className="font-medium text-ink">{e.fullName}</p>
                <a href={`mailto:${e.email}`} className="text-sm text-ink/60">
                  {e.email}
                </a>
                <p className="mt-2 text-sm text-ink/75">
                  {COURSES[e.course].label} · {COURSE_SHIFTS[e.shift]}
                </p>
                <p className="mt-1 text-xs text-ink/45">{formatDateTime(e.createdAt)}</p>
                <div className="mt-3">
                  <EnrollmentControls mode={mode} id={e.id} status={e.status} name={e.fullName} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-4 text-xs text-ink/50">
        O envio de e-mails não é automático nesta versão: use o endereço da inscrição (ou o CSV) para enviar datas, horários e local.
      </p>
    </div>
  );
}
