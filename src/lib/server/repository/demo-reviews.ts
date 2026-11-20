import "server-only";
import { randomUUID } from "node:crypto";
import { MONTHS, type ReviewDetail, type ReviewSummary } from "@/lib/domain";
import type { DemoState } from "@/lib/demo/seed";
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

const nowIso = () => new Date().toISOString();
const byPeriodDesc = (a: ReviewSummary, b: ReviewSummary) => b.year - a.year || b.month - a.month;

function summary(r: ReviewDetail): ReviewSummary {
  return {
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employeeName,
    month: r.month,
    year: r.year,
    status: r.status,
    reviewerName: r.reviewerName,
    publishedAt: r.publishedAt,
    viewedAt: r.viewedAt,
    acknowledgedAt: r.acknowledgedAt,
    updatedAt: r.updatedAt,
  };
}

/** Avaliações profissionais no ambiente de demonstração (memória, dados fictícios). */
export function demoReviewMethods(state: () => DemoState): ReviewMethods {
  /** Regra central do lado do colaborador: só a PRÓPRIA avaliação e só se PUBLICADA. */
  const ownPublished = (employeeId: string, reviewId: string) =>
    state().reviews.find((r) => r.id === reviewId && r.employeeId === employeeId && r.status === "publicado");

  return {
    async listEmployees() {
      return [...state().employees].sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"));
    },

    async registerEmployee(input) {
      const s = state();
      if (s.employees.some((e) => e.email === input.email)) {
        throw new RepositoryError("Já existe um colaborador com este e-mail.");
      }
      s.employees.push({ id: `demo-emp-${randomUUID().slice(0, 8)}`, fullName: input.fullName, email: input.email, area: input.area, createdAt: nowIso() });
    },

    async listReviews(f = {}) {
      const q = f.q?.toLowerCase();
      return state()
        .reviews.filter(
          (r) =>
            (!f.employeeId || r.employeeId === f.employeeId) &&
            (!f.year || r.year === f.year) &&
            (!f.month || r.month === f.month) &&
            (!f.status || r.status === f.status) &&
            (!q || r.employeeName.toLowerCase().includes(q) || [r.strengths, r.improvements, r.recommendations].some((t) => t.toLowerCase().includes(q))),
        )
        .map(summary)
        .sort(byPeriodDesc);
    },

    async getReview(id) {
      const r = state().reviews.find((x) => x.id === id);
      return r ? { ...r, goals: [...r.goals] } : null;
    },

    async saveReview(input, id) {
      const s = state();
      const employee = s.employees.find((e) => e.id === input.employeeId);
      if (!employee) throw new RepositoryError("Colaborador não encontrado.");
      const clash = s.reviews.find((r) => r.employeeId === input.employeeId && r.year === input.year && r.month === input.month && r.id !== id);
      if (clash) throw new RepositoryError("Já existe uma avaliação deste colaborador para este período.");

      const content = {
        strengths: input.strengths,
        improvements: input.improvements,
        recommendations: input.recommendations,
        goals: input.goals,
        suggestedCourse: input.suggestedCourse,
        managerMessage: input.managerMessage,
      };

      if (id) {
        const r = s.reviews.find((x) => x.id === id);
        if (!r) throw new RepositoryError("Avaliação não encontrada.");
        if (r.status === "publicado") {
          // Correção de avaliação publicada: guarda o conteúdo anterior no histórico.
          s.revisions.unshift({
            id: randomUUID(),
            reviewId: r.id,
            note: input.revisionNote || "Correção sem descrição",
            snapshot: {
              strengths: r.strengths,
              improvements: r.improvements,
              recommendations: r.recommendations,
              goals: [...r.goals],
              suggestedCourse: r.suggestedCourse,
              managerMessage: r.managerMessage,
            },
            createdAt: nowIso(),
          });
        }
        Object.assign(r, content, {
          employeeId: employee.id,
          employeeName: employee.fullName,
          month: input.month,
          year: input.year,
          reviewerName: input.reviewerName,
          updatedAt: nowIso(),
        });
        return r.id;
      }

      const created: ReviewDetail = {
        ...content,
        id: randomUUID(),
        employeeId: employee.id,
        employeeName: employee.fullName,
        month: input.month,
        year: input.year,
        status: "rascunho",
        reviewerName: input.reviewerName,
        publishedAt: null,
        viewedAt: null,
        acknowledgedAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      s.reviews.unshift(created);
      return created.id;
    },

    async publishReview(id) {
      const s = state();
      const r = s.reviews.find((x) => x.id === id);
      if (!r) throw new RepositoryError("Avaliação não encontrada.");
      if (r.status === "publicado") return;
      r.status = "publicado";
      r.publishedAt = nowIso();
      r.updatedAt = r.publishedAt;
      s.notifications.unshift({
        id: randomUUID(),
        employeeId: r.employeeId,
        title: `Seu feedback de ${MONTHS[r.month - 1]} está disponível!`,
        body: "A gestão compartilhou uma nova avaliação sobre seu desenvolvimento profissional.",
        reviewId: r.id,
        createdAt: r.publishedAt,
        readAt: null,
      });
    },

    async listRevisions(reviewId) {
      return state().revisions.filter((v) => v.reviewId === reviewId);
    },

    async getEmployee(employeeId) {
      return state().employees.find((e) => e.id === employeeId) ?? null;
    },

    async listMyReviews(employeeId) {
      return state()
        .reviews.filter((r) => r.employeeId === employeeId && r.status === "publicado")
        .map(summary)
        .sort(byPeriodDesc);
    },

    async getMyReview(employeeId, reviewId) {
      const r = ownPublished(employeeId, reviewId);
      return r ? { ...r, goals: [...r.goals] } : null;
    },

    async markReviewViewed(employeeId, reviewId) {
      const r = ownPublished(employeeId, reviewId);
      if (r && !r.viewedAt) r.viewedAt = nowIso();
      for (const n of state().notifications) if (n.employeeId === employeeId && n.reviewId === reviewId && !n.readAt) n.readAt = nowIso();
    },

    async acknowledgeReview(employeeId, reviewId) {
      const r = ownPublished(employeeId, reviewId);
      if (!r) return;
      r.viewedAt ??= nowIso();
      r.acknowledgedAt ??= nowIso();
    },

    async listNotifications(employeeId) {
      return state()
        .notifications.filter((n) => n.employeeId === employeeId)
        .map((n) => ({ id: n.id, title: n.title, body: n.body, reviewId: n.reviewId, createdAt: n.createdAt, readAt: n.readAt }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async markNotificationRead(employeeId, notificationId) {
      const n = state().notifications.find((x) => x.id === notificationId && x.employeeId === employeeId);
      if (n && !n.readAt) n.readAt = nowIso();
    },
  };
}
