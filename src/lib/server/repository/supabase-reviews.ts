import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MONTHS, type CourseKey, type ReviewDetail, type ReviewStatus, type ReviewSummary } from "@/lib/domain";
import { createSessionClient } from "../supabase";
import { RepositoryError, type Repository } from "./types";

type ReviewMethods = Pick<
  Repository,
  | "listEmployees"
  | "registerEmployee"
  | "listReviews"
  | "getReview"
  | "saveReview"
  | "publishReview"
  | "listRevisions"
  | "getEmployee"
  | "listMyReviews"
  | "getMyReview"
  | "markReviewViewed"
  | "acknowledgeReview"
  | "listNotifications"
  | "markNotificationRead"
>;

type Row = Record<string, unknown>;

const SUMMARY_COLS =
  "id, employee_id, period_month, period_year, status, reviewer_name, published_at, viewed_at, acknowledged_at, updated_at, employee:employee_profiles(full_name)";
const DETAIL_COLS = `${SUMMARY_COLS}, strengths, improvements, recommendations, goals, suggested_course, manager_message, created_at`;

function fail(context: string, error: unknown): never {
  console.error(`[supabase:reviews] ${context}`, error);
  throw new RepositoryError("Não foi possível concluir a operação. Tente novamente em instantes.", error);
}

async function db(): Promise<SupabaseClient> {
  const c = await createSessionClient();
  if (!c) throw new RepositoryError("Banco de dados não configurado.");
  return c;
}

function toSummary(r: Row): ReviewSummary {
  const employee = (Array.isArray(r.employee) ? r.employee[0] : r.employee) as { full_name?: string } | null;
  return {
    id: String(r.id),
    employeeId: String(r.employee_id),
    employeeName: employee?.full_name ?? "",
    month: Number(r.period_month),
    year: Number(r.period_year),
    status: r.status as ReviewStatus,
    reviewerName: (r.reviewer_name as string | null) ?? null,
    publishedAt: (r.published_at as string | null) ?? null,
    viewedAt: (r.viewed_at as string | null) ?? null,
    acknowledgedAt: (r.acknowledged_at as string | null) ?? null,
    updatedAt: String(r.updated_at),
  };
}

function toDetail(r: Row): ReviewDetail {
  return {
    ...toSummary(r),
    strengths: String(r.strengths ?? ""),
    improvements: String(r.improvements ?? ""),
    recommendations: String(r.recommendations ?? ""),
    goals: (r.goals as string[] | null) ?? [],
    suggestedCourse: (r.suggested_course as CourseKey | null) ?? null,
    managerMessage: (r.manager_message as string | null) ?? null,
    createdAt: String(r.created_at),
  };
}

const safeSearch = (q: string) => q.replace(/[%,()*\\:."']/g, " ").trim().slice(0, 60);

/**
 * Avaliações profissionais no Supabase. Todas as consultas usam a sessão do
 * usuário: o RLS garante que o colaborador só lê as próprias avaliações
 * publicadas e que só administradores escrevem. Os filtros por employee_id
 * abaixo são uma segunda camada (defesa em profundidade).
 */
export const supabaseReviewMethods: ReviewMethods = {
  async listEmployees() {
    const { data, error } = await (await db())
      .from("employee_profiles")
      .select("user_id, full_name, email, area, created_at")
      .order("full_name");
    if (error) fail("list employees", error);
    return (data ?? []).map((e) => ({ id: e.user_id, fullName: e.full_name, email: e.email, area: e.area, createdAt: e.created_at }));
  },

  async registerEmployee(input) {
    const { error } = await (await db()).rpc("register_employee", {
      p_email: input.email,
      p_full_name: input.fullName,
      p_area: input.area ?? "",
    });
    if (error) {
      if (error.code === "P0002" || error.message.includes("user_not_found")) {
        throw new RepositoryError("Nenhuma conta encontrada com este e-mail. Crie o usuário no Supabase Auth antes de vinculá-lo.");
      }
      fail("register employee", error);
    }
  },

  async listReviews(f = {}) {
    let query = (await db())
      .from("performance_reviews")
      .select(SUMMARY_COLS)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false })
      .limit(1000);
    if (f.employeeId) query = query.eq("employee_id", f.employeeId);
    if (f.year) query = query.eq("period_year", f.year);
    if (f.month) query = query.eq("period_month", f.month);
    if (f.status) query = query.eq("status", f.status);
    const q = f.q ? safeSearch(f.q) : "";
    if (q) query = query.or(`strengths.ilike.*${q}*,improvements.ilike.*${q}*,recommendations.ilike.*${q}*`);
    const { data, error } = await query;
    if (error) fail("list reviews", error);
    return ((data ?? []) as unknown as Row[]).map(toSummary);
  },

  async getReview(id) {
    const { data, error } = await (await db()).from("performance_reviews").select(DETAIL_COLS).eq("id", id).maybeSingle();
    if (error) fail("get review", error);
    return data ? toDetail(data as unknown as Row) : null;
  },

  async saveReview(input, id) {
    const client = await db();
    const content = {
      employee_id: input.employeeId,
      period_month: input.month,
      period_year: input.year,
      strengths: input.strengths,
      improvements: input.improvements,
      recommendations: input.recommendations,
      goals: input.goals,
      suggested_course: input.suggestedCourse,
      manager_message: input.managerMessage,
      reviewer_name: input.reviewerName,
    };

    if (id) {
      const current = await this.getReview(id);
      if (!current) throw new RepositoryError("Avaliação não encontrada.");
      if (current.status === "publicado") {
        // Nunca sobrescrever em silêncio: guarda o conteúdo anterior.
        const { error: revError } = await client.from("review_revisions").insert({
          review_id: id,
          note: input.revisionNote || "Correção sem descrição",
          snapshot: {
            strengths: current.strengths,
            improvements: current.improvements,
            recommendations: current.recommendations,
            goals: current.goals,
            suggestedCourse: current.suggestedCourse,
            managerMessage: current.managerMessage,
          },
        });
        if (revError) fail("insert revision", revError);
      }
      const { error } = await client.from("performance_reviews").update(content).eq("id", id);
      if (error) {
        if (error.code === "23505") throw new RepositoryError("Já existe uma avaliação deste colaborador para este período.");
        fail("update review", error);
      }
      return id;
    }

    const { data, error } = await client.from("performance_reviews").insert(content).select("id").single();
    if (error) {
      if (error.code === "23505") throw new RepositoryError("Já existe uma avaliação deste colaborador para este período.");
      fail("insert review", error);
    }
    return String(data.id);
  },

  async publishReview(id) {
    const client = await db();
    const current = await this.getReview(id);
    if (!current) throw new RepositoryError("Avaliação não encontrada.");
    if (current.status === "publicado") return;
    const { error } = await client
      .from("performance_reviews")
      .update({ status: "publicado", published_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "rascunho");
    if (error) fail("publish review", error);
    // Notificação interna (e-mail fica para uma integração futura: coluna email_sent_at).
    const { error: notifError } = await client.from("employee_notifications").insert({
      user_id: current.employeeId,
      title: `Seu feedback de ${MONTHS[current.month - 1]} está disponível!`,
      body: "A gestão compartilhou uma nova avaliação sobre seu desenvolvimento profissional.",
      review_id: id,
    });
    if (notifError) fail("insert notification", notifError);
  },

  async listRevisions(reviewId) {
    const { data, error } = await (await db())
      .from("review_revisions")
      .select("id, review_id, note, snapshot, created_at")
      .eq("review_id", reviewId)
      .order("created_at", { ascending: false });
    if (error) fail("list revisions", error);
    return (data ?? []).map((v) => ({ id: v.id, reviewId: v.review_id, note: v.note, snapshot: v.snapshot, createdAt: v.created_at }));
  },

  async getEmployee(employeeId) {
    const { data, error } = await (await db())
      .from("employee_profiles")
      .select("user_id, full_name, email, area, created_at")
      .eq("user_id", employeeId)
      .maybeSingle();
    if (error) fail("get employee", error);
    return data ? { id: data.user_id, fullName: data.full_name, email: data.email, area: data.area, createdAt: data.created_at } : null;
  },

  async listMyReviews(employeeId) {
    const { data, error } = await (await db())
      .from("performance_reviews")
      .select(SUMMARY_COLS)
      .eq("employee_id", employeeId)
      .eq("status", "publicado")
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false });
    if (error) fail("list my reviews", error);
    return ((data ?? []) as unknown as Row[]).map(toSummary);
  },

  async getMyReview(employeeId, reviewId) {
    const { data, error } = await (await db())
      .from("performance_reviews")
      .select(DETAIL_COLS)
      .eq("id", reviewId)
      .eq("employee_id", employeeId)
      .eq("status", "publicado")
      .maybeSingle();
    if (error) fail("get my review", error);
    return data ? toDetail(data as unknown as Row) : null;
  },

  async markReviewViewed(_employeeId, reviewId) {
    const client = await db();
    const { error } = await client.rpc("mark_review_viewed", { p_review: reviewId });
    if (error) fail("mark viewed", error);
    // Notificações ligadas a esta avaliação passam a lidas.
    const { data } = await client.from("employee_notifications").select("id").eq("review_id", reviewId).is("read_at", null);
    for (const n of data ?? []) await client.rpc("mark_notification_read", { p_notification: n.id });
  },

  async acknowledgeReview(_employeeId, reviewId) {
    const { error } = await (await db()).rpc("acknowledge_review", { p_review: reviewId });
    if (error) fail("acknowledge", error);
  },

  async listNotifications(employeeId) {
    const { data, error } = await (await db())
      .from("employee_notifications")
      .select("id, title, body, review_id, created_at, read_at")
      .eq("user_id", employeeId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) fail("list notifications", error);
    return (data ?? []).map((n) => ({ id: n.id, title: n.title, body: n.body, reviewId: n.review_id, createdAt: n.created_at, readAt: n.read_at }));
  },

  async markNotificationRead(_employeeId, notificationId) {
    const { error } = await (await db()).rpc("mark_notification_read", { p_notification: notificationId });
    if (error) fail("mark notification", error);
  },
};
