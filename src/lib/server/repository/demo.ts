import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import {
  FEEDBACK_KINDS,
  OUVIDORIA_CATEGORIES,
  type FeedbackRecord,
  type OuvidoriaRecord,
  type SubmissionFilters,
  type SubmissionKind,
  type SubmissionRecord,
  type TimelineEntry,
} from "@/lib/domain";
import { buildDemoState, type DemoState } from "@/lib/demo/seed";
import type { Repository } from "./types";

/**
 * Armazenamento demonstrativo em MEMÓRIA DO SERVIDOR.
 * - Compartilhado entre todos os aparelhos conectados ao mesmo servidor
 *   (ex.: notebook rodando `npm start` e iPad na mesma rede).
 * - Reiniciado ao reiniciar o servidor ou pelo botão "Reiniciar demonstração".
 * - Não é persistência real: em hospedagem serverless cada instância tem sua
 *   própria memória. Para a apresentação entre aparelhos, veja o README.
 */
const MAX_ITEMS = 400;

const g = globalThis as unknown as { __horizonteDemo?: DemoState };
function state(): DemoState {
  if (!g.__horizonteDemo) g.__horizonteDemo = buildDemoState();
  return g.__horizonteDemo;
}

export function resetDemoState() {
  g.__horizonteDemo = buildDemoState();
}

const nowIso = () => new Date().toISOString();

function matches(record: SubmissionRecord, f: SubmissionFilters = {}) {
  if (f.status && record.status !== f.status) return false;
  if (f.category) {
    const cat = record.kind === "ouvidoria" ? record.category : record.feedbackKind;
    if (cat !== f.category) return false;
  }
  if (f.from && record.createdAt < f.from) return false;
  if (f.to && record.createdAt > `${f.to}T23:59:59.999Z`) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const body = record.kind === "ouvidoria" ? record.description : record.message;
    if (![record.reference, record.topic, body].some((v) => v.toLowerCase().includes(q))) return false;
  }
  return true;
}

function collection(kind: SubmissionKind): SubmissionRecord[] {
  return kind === "ouvidoria" ? state().ouvidoria : state().feedback;
}

function push(key: string, entry: Omit<TimelineEntry, "id" | "createdAt">) {
  const s = state();
  (s.timeline[key] ??= []).push({ ...entry, id: randomUUID(), createdAt: nowIso() });
}

function touch(kind: SubmissionKind, id: string) {
  const rec = collection(kind).find((r) => r.id === id);
  if (rec) rec.updatedAt = nowIso();
  return rec;
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const demoRepository: Repository = {
  mode: "demo",

  async insertOuvidoria(input, protocol) {
    const s = state();
    const rec: OuvidoriaRecord = {
      kind: "ouvidoria",
      id: randomUUID(),
      reference: protocol.reference,
      category: input.category,
      topic: input.topic,
      description: input.description,
      impact: input.impact,
      status: "recebido",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    s.ouvidoria.unshift(rec);
    s.ouvidoria.length = Math.min(s.ouvidoria.length, MAX_ITEMS);
    s.secrets[protocol.reference] = protocol.secretHash;
  },

  async insertFeedback(input, protocol) {
    const s = state();
    const rec: FeedbackRecord = {
      kind: "feedback",
      id: randomUUID(),
      reference: protocol.reference,
      feedbackKind: input.feedbackKind,
      topic: input.topic,
      area: input.area,
      message: input.message,
      rating: input.rating,
      status: "recebido",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    s.feedback.unshift(rec);
    s.feedback.length = Math.min(s.feedback.length, MAX_ITEMS);
    s.secrets[protocol.reference] = protocol.secretHash;
  },

  async insertPulse(input) {
    const s = state();
    s.pulse.unshift({ id: randomUUID(), createdOn: nowIso().slice(0, 10), answers: input });
    s.pulse.length = Math.min(s.pulse.length, MAX_ITEMS * 2);
  },

  async track(reference, secretHash) {
    const s = state();
    const stored = s.secrets[reference];
    if (!stored || !safeEqual(stored, secretHash)) return null;
    const rec = [...s.ouvidoria, ...s.feedback].find((r) => r.reference === reference);
    if (!rec) return null;
    const responses = (s.timeline[rec.id] ?? [])
      .filter((t) => t.type === "response")
      .map((t) => ({ body: t.body, createdAt: t.createdAt }));
    return {
      reference: rec.reference,
      kind: rec.kind,
      label: rec.kind === "ouvidoria" ? OUVIDORIA_CATEGORIES[rec.category] : FEEDBACK_KINDS[rec.feedbackKind],
      status: rec.status,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
      responses,
    };
  },

  async listSubmissions(kind, filters) {
    return collection(kind)
      .filter((r) => matches(r, filters))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({ ...r })) as never;
  },

  async getSubmission(kind, id) {
    const rec = collection(kind).find((r) => r.id === id);
    return rec ? { ...rec } : null;
  },

  async getTimeline(_kind, id) {
    return [...(state().timeline[id] ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async setStatus(kind, id, status) {
    const rec = touch(kind, id);
    if (!rec || rec.status === status) return;
    rec.status = status;
    push(id, { type: "status", body: status });
  },

  async addNote(kind, id, body) {
    if (touch(kind, id)) push(id, { type: "note", body });
  },

  async addResponse(kind, id, body) {
    if (touch(kind, id)) push(id, { type: "response", body });
  },

  async listPulse(filters = {}) {
    return state().pulse.filter(
      (p) => (!filters.from || p.createdOn >= filters.from) && (!filters.to || p.createdOn <= filters.to),
    );
  },

  async listActions() {
    return [...state().actions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createAction(input) {
    state().actions.unshift({
      id: randomUUID(),
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      owner: input.owner,
      status: input.status,
      dueDate: input.dueDate,
      linkedReference: input.linkedReference,
      createdAt: nowIso(),
    });
  },

  async updateActionStatus(id, status) {
    const a = state().actions.find((x) => x.id === id);
    if (a) a.status = status;
  },

  async deleteAction(id) {
    const s = state();
    s.actions = s.actions.filter((a) => a.id !== id);
  },
};
