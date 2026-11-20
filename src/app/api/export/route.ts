import type { NextRequest } from "next/server";
import { pulseSummary } from "@/lib/analytics";
import { toCsv } from "@/lib/csv";
import {
  ACTION_CATEGORIES,
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  COURSE_SHIFTS,
  COURSES,
  ENROLLMENT_STATUSES,
  type CourseKey,
  type EnrollmentStatus,
  FEEDBACK_KINDS,
  OUVIDORIA_CATEGORIES,
  SUBMISSION_STATUSES,
  type DataMode,
  type FeedbackRecord,
  type OuvidoriaRecord,
} from "@/lib/domain";
import { parseFilters, parsePeriod } from "@/lib/filters";
import { getAdmin } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repository";

/**
 * Exportação CSV. No modo live exige administrador autenticado; o banco
 * aplica RLS novamente em cada consulta. Nunca exporta o hash do protocolo.
 */
export async function GET(request: NextRequest) {
  const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
  const mode: DataMode = sp.modo === "live" ? "live" : "demo";
  const tipo = sp.tipo;

  if (mode === "live" && !(await getAdmin())) {
    return new Response("Não autorizado", { status: 401 });
  }

  try {
    const repo = getRepository(mode);
    let csv = "";
    if (tipo === "ouvidoria") {
      const rows = (await repo.listSubmissions("ouvidoria", parseFilters(sp, Object.keys(OUVIDORIA_CATEGORIES)))) as OuvidoriaRecord[];
      csv = toCsv(
        ["Protocolo", "Categoria", "Tema", "Descrição", "Impacto (1-5)", "Status", "Recebido em", "Atualizado em"],
        rows.map((r) => [r.reference, OUVIDORIA_CATEGORIES[r.category], r.topic, r.description, r.impact, SUBMISSION_STATUSES[r.status], r.createdAt, r.updatedAt]),
      );
    } else if (tipo === "feedback") {
      const rows = (await repo.listSubmissions("feedback", parseFilters(sp, Object.keys(FEEDBACK_KINDS)))) as FeedbackRecord[];
      csv = toCsv(
        ["Protocolo", "Tipo", "Tema", "Área", "Mensagem", "Avaliação (1-5)", "Status", "Recebido em"],
        rows.map((r) => [r.reference, FEEDBACK_KINDS[r.feedbackKind], r.topic, r.area, r.message, r.rating, SUBMISSION_STATUSES[r.status], r.createdAt]),
      );
    } else if (tipo === "acoes") {
      const rows = await repo.listActions();
      csv = toCsv(
        ["Título", "Descrição", "Categoria", "Prioridade", "Responsável", "Status", "Prazo", "Protocolo relacionado", "Criada em"],
        rows.map((a) => [a.title, a.description, ACTION_CATEGORIES[a.category], ACTION_PRIORITIES[a.priority], a.owner, ACTION_STATUSES[a.status], a.dueDate, a.linkedReference, a.createdAt]),
      );
    } else if (tipo === "cursos") {
      // Dados identificados: exportação apenas para a gestão organizar o contato.
      const course = sp.curso && sp.curso in COURSES ? (sp.curso as CourseKey) : undefined;
      const status = sp.status && sp.status in ENROLLMENT_STATUSES ? (sp.status as EnrollmentStatus) : undefined;
      const rows = await repo.listEnrollments({ course, status, q: sp.q?.slice(0, 60) });
      csv = toCsv(
        ["Nome", "E-mail", "Curso", "Turno", "Área", "Status", "Inscrito em"],
        rows.map((e) => [e.fullName, e.email, COURSES[e.course].label, COURSE_SHIFTS[e.shift], e.area, ENROLLMENT_STATUSES[e.status], e.createdAt]),
      );
    } else if (tipo === "pulso") {
      // Apenas agregados: respostas individuais nunca são exportadas.
      const s = pulseSummary(await repo.listPulse(parsePeriod(sp)));
      csv = s.enough
        ? toCsv(
            ["Dimensão", "Média (1-5)", "% favorável", "Respostas"],
            s.dimensions.map((d) => [d.label, d.average, d.favorable, s.sample]),
          )
        : toCsv(["Aviso"], [[`Amostra insuficiente (${s.sample} respostas; mínimo ${s.minSample}).`]]);
    } else {
      return new Response("Tipo inválido", { status: 400 });
    }

    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="horizonte-${tipo}-${mode === "demo" ? "demo-" : ""}${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[export]", error);
    return new Response("Não foi possível gerar o arquivo.", { status: 500 });
  }
}
