import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FEEDBACK_KINDS,
  OUVIDORIA_CATEGORIES,
  type ActionPlan,
  type FeedbackKind,
  type FeedbackRecord,
  type OuvidoriaCategory,
  type OuvidoriaRecord,
  type SubmissionFilters,
  type SubmissionKind,
  type SubmissionRecord,
  type SubmissionStatus,
  type TimelineEntry,
} from "@/lib/domain";
import { createAnonClient, createSessionClient } from "../supabase";
import { RepositoryError, type Repository } from "./types";

const OUV_COLS = "id, reference, category, topic, description, impact, status, created_at, updated_at";
const FB_COLS = "id, reference, kind, topic, area, message, rating, status, created_at, updated_at";
const ACTION_COLS = "id, title, description, category, priority, owner, status, due_date, linked_reference, created_at";

type Row = Record<string, unknown>;

function fail(context: string, error: unknown): never {
  // Detalhes ficam apenas no log do servidor; o usuário recebe mensagem genérica.
  console.error(`[supabase] ${context}`, error);
  throw new RepositoryError("Não foi possível concluir a operação. Tente novamente em instantes.", error);
}

function anon() {
  const c = createAnonClient();
  if (!c) throw new RepositoryError("Banco de dados não configurado.");
  return c;
}

async function session(): Promise<SupabaseClient> {
  const c = await createSessionClient();
  if (!c) throw new RepositoryError("Banco de dados não configurado.");
  return c;
}

const table = (kind: SubmissionKind) => (kind === "ouvidoria" ? "ouvidoria_submissions" : "feedback_submissions");
const fk = (kind: SubmissionKind) => (kind === "ouvidoria" ? "ouvidoria_id" : "feedback_id");

const toOuvidoria = (r: Row): OuvidoriaRecord => ({
  kind: "ouvidoria",
  id: String(r.id),
  reference: String(r.reference),
  category: r.category as OuvidoriaCategory,
  topic: String(r.topic),
  description: String(r.description),
  impact: (r.impact as number | null) ?? null,
  status: r.status as SubmissionStatus,
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
});

const toFeedback = (r: Row): FeedbackRecord => ({
  kind: "feedback",
  id: String(r.id),
  reference: String(r.reference),
  feedbackKind: r.kind as FeedbackKind,
  topic: String(r.topic),
  area: (r.area as string | null) ?? null,
  message: String(r.message),
  rating: (r.rating as number | null) ?? null,
  status: r.status as SubmissionStatus,
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
});

/** Escapa a busca para o filtro `or()` do PostgREST. */
function safeSearch(q: string) {
  return q.replace(/[%,()*\\:."']/g, " ").trim().slice(0, 60);
}

export const supabaseRepository: Repository = {
  mode: "live",

  async insertOuvidoria(input, protocol) {
    const { error } = await anon().from("ouvidoria_submissions").insert({
      reference: protocol.reference,
      access_hash: protocol.secretHash,
      category: input.category,
      topic: input.topic,
      description: input.description,
      impact: input.impact,
    });
    if (error) fail("insert ouvidoria", error);
  },

  async insertFeedback(input, protocol) {
    const { error } = await anon().from("feedback_submissions").insert({
      reference: protocol.reference,
      access_hash: protocol.secretHash,
      kind: input.feedbackKind,
      topic: input.topic,
      area: input.area,
      message: input.message,
      rating: input.rating,
    });
    if (error) fail("insert feedback", error);
  },

  async insertPulse(input) {
    const { error } = await anon().from("pulse_responses").insert(input);
    if (error) fail("insert pulse", error);
  },

  async track(reference, secretHash) {
    const { data, error } = await anon().rpc("track_submission", { p_reference: reference, p_hash: secretHash });
    if (error) fail("track", error);
    if (!data) return null;
    const d = data as Row & { responses: { body: string; created_at: string }[] };
    const kind = d.kind as SubmissionKind;
    return {
      reference: String(d.reference),
      kind,
      label:
        kind === "ouvidoria"
          ? OUVIDORIA_CATEGORIES[d.label as OuvidoriaCategory]
          : FEEDBACK_KINDS[d.label as FeedbackKind],
      status: d.status as SubmissionStatus,
      createdAt: String(d.created_at),
      updatedAt: String(d.updated_at),
      responses: (d.responses ?? []).map((r) => ({ body: r.body, createdAt: r.created_at })),
    };
  },

  async listSubmissions(kind, filters: SubmissionFilters = {}) {
    const db = await session();
    let query = db
      .from(table(kind))
      .select(kind === "ouvidoria" ? OUV_COLS : FB_COLS)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.category) query = query.eq(kind === "ouvidoria" ? "category" : "kind", filters.category);
    if (filters.from) query = query.gte("created_at", filters.from);
    if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
    const q = filters.q ? safeSearch(filters.q) : "";
    if (q) {
      const body = kind === "ouvidoria" ? "description" : "message";
      query = query.or(`reference.ilike.*${q}*,topic.ilike.*${q}*,${body}.ilike.*${q}*`);
    }
    const { data, error } = await query;
    if (error) fail("list submissions", error);
    const rows = (data ?? []) as unknown as Row[];
    return rows.map((r): SubmissionRecord => (kind === "ouvidoria" ? toOuvidoria(r) : toFeedback(r))) as never;
  },

  async getSubmission(kind, id) {
    const db = await session();
    const { data, error } = await db
      .from(table(kind))
      .select(kind === "ouvidoria" ? OUV_COLS : FB_COLS)
      .eq("id", id)
      .maybeSingle();
    if (error) fail("get submission", error);
    if (!data) return null;
    const row = data as unknown as Row;
    return kind === "ouvidoria" ? toOuvidoria(row) : toFeedback(row);
  },

  async getTimeline(kind, id) {
    const db = await session();
    const col = fk(kind);
    const [notes, responses, events] = await Promise.all([
      db.from("admin_notes").select("id, body, created_at").eq(col, id),
      db.from("admin_responses").select("id, body, created_at").eq(col, id),
      db.from("submission_events").select("id, to_status, created_at").eq(col, id),
    ]);
    const err = notes.error ?? responses.error ?? events.error;
    if (err) fail("timeline", err);
    const out: TimelineEntry[] = [
      ...(notes.data ?? []).map((n) => ({ id: n.id, type: "note" as const, body: n.body, createdAt: n.created_at })),
      ...(responses.data ?? []).map((n) => ({ id: n.id, type: "response" as const, body: n.body, createdAt: n.created_at })),
      ...(events.data ?? []).map((n) => ({ id: n.id, type: "status" as const, body: n.to_status, createdAt: n.created_at })),
    ];
    return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async setStatus(kind, id, status) {
    const db = await session();
    const { error } = await db.from(table(kind)).update({ status }).eq("id", id);
    if (error) fail("set status", error);
  },

  async addNote(kind, id, body) {
    const db = await session();
    const { error } = await db.from("admin_notes").insert({ [fk(kind)]: id, body });
    if (error) fail("add note", error);
  },

  async addResponse(kind, id, body) {
    const db = await session();
    const { error } = await db.from("admin_responses").insert({ [fk(kind)]: id, body });
    if (error) fail("add response", error);
    // Uma resposta registrada também atualiza o "atualizado em" da manifestação.
    const current = await this.getSubmission(kind, id);
    if (current) await db.from(table(kind)).update({ status: current.status }).eq("id", id);
  },

  async listPulse(filters = {}) {
    const db = await session();
    let query = db
      .from("pulse_responses")
      .select("id, created_on, valorizacao, escuta, bem_estar, feedback")
      .order("created_on", { ascending: false })
      .limit(5000);
    if (filters.from) query = query.gte("created_on", filters.from);
    if (filters.to) query = query.lte("created_on", filters.to);
    const { data, error } = await query;
    if (error) fail("list pulse", error);
    return (data ?? []).map((r) => ({
      id: r.id,
      createdOn: r.created_on,
      answers: { valorizacao: r.valorizacao, escuta: r.escuta, bem_estar: r.bem_estar, feedback: r.feedback },
    }));
  },

  async listActions() {
    const db = await session();
    const { data, error } = await db.from("action_plans").select(ACTION_COLS).order("created_at", { ascending: false });
    if (error) fail("list actions", error);
    return (data ?? []).map(
      (r): ActionPlan => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        priority: r.priority,
        owner: r.owner,
        status: r.status,
        dueDate: r.due_date,
        linkedReference: r.linked_reference,
        createdAt: r.created_at,
      }),
    );
  },

  async createAction(input) {
    const db = await session();
    const { error } = await db.from("action_plans").insert({
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      owner: input.owner,
      status: input.status,
      due_date: input.dueDate,
      linked_reference: input.linkedReference,
    });
    if (error) fail("create action", error);
  },

  async updateActionStatus(id, status) {
    const db = await session();
    const { error } = await db.from("action_plans").update({ status }).eq("id", id);
    if (error) fail("update action", error);
  },

  async deleteAction(id) {
    const db = await session();
    const { error } = await db.from("action_plans").delete().eq("id", id);
    if (error) fail("delete action", error);
  },
};
