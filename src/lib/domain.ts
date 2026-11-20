/** Vocabulário de domínio compartilhado entre interface, validação e banco. */

export const OUVIDORIA_CATEGORIES = {
  sugestao: "Sugestão",
  reclamacao: "Reclamação",
  dificuldade: "Dificuldade no ambiente de trabalho",
  condicoes: "Condições de trabalho",
  outro: "Outro",
} as const;
export type OuvidoriaCategory = keyof typeof OUVIDORIA_CATEGORIES;

export const FEEDBACK_KINDS = {
  reconhecimento: "Reconhecimento",
  construtivo: "Sugestão construtiva",
  outro: "Outro retorno",
} as const;
export type FeedbackKind = keyof typeof FEEDBACK_KINDS;

export const SUBMISSION_STATUSES = {
  recebido: "Recebido",
  em_analise: "Em análise",
  acao_planejada: "Ação planejada",
  concluido: "Concluído",
} as const;
export type SubmissionStatus = keyof typeof SUBMISSION_STATUSES;

export const ACTION_STATUSES = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
} as const;
export type ActionStatus = keyof typeof ACTION_STATUSES;

export const ACTION_PRIORITIES = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
} as const;
export type ActionPriority = keyof typeof ACTION_PRIORITIES;

export const ACTION_CATEGORIES = {
  reconhecimento: "Reconhecimento",
  comunicacao: "Comunicação",
  bem_estar: "Bem-estar",
  processos: "Processos e metas",
  desenvolvimento: "Feedback e desenvolvimento",
  condicoes: "Condições de trabalho",
} as const;
export type ActionCategory = keyof typeof ACTION_CATEGORIES;

/** Temas sugeridos (o tema é texto livre curto, estes são atalhos). */
export const TOPIC_SUGGESTIONS = [
  "Metas e pressão",
  "Carga de trabalho",
  "Comunicação com a gestão",
  "Reconhecimento",
  "Pausas e descanso",
  "Ambiente físico",
  "Treinamento",
  "Relação entre equipes",
] as const;

/** Áreas genéricas — escolha opcional, evitando texto livre identificável. */
export const AREAS = [
  "Atendimento receptivo",
  "Atendimento ativo",
  "Back-office",
  "Qualidade e monitoria",
  "Supervisão",
  "Recursos Humanos",
  "Tecnologia e suporte",
  "Outra área",
] as const;

export const PULSE_QUESTIONS = [
  {
    key: "valorizacao",
    dimension: "Reconhecimento",
    question: "Você sente que seu trabalho é valorizado?",
  },
  {
    key: "escuta",
    dimension: "Comunicação e escuta",
    question: "Você considera que existe espaço para ser ouvido?",
  },
  {
    key: "bem_estar",
    dimension: "Bem-estar",
    question: "O ambiente de trabalho favorece seu bem-estar?",
  },
  {
    key: "feedback",
    dimension: "Clareza de feedback",
    question: "Você recebe feedbacks que ajudam no seu desenvolvimento?",
  },
] as const;
export type PulseKey = (typeof PULSE_QUESTIONS)[number]["key"];

export const PULSE_SCALE = [
  { value: 1, label: "Nunca" },
  { value: 2, label: "Raramente" },
  { value: 3, label: "Às vezes" },
  { value: 4, label: "Frequentemente" },
  { value: 5, label: "Sempre" },
] as const;

export const LIMITS = {
  topic: 80,
  description: 2000,
  descriptionMin: 15,
  note: 1500,
  response: 1500,
  actionTitle: 120,
  actionDescription: 1500,
  owner: 80,
} as const;

export type SubmissionKind = "ouvidoria" | "feedback";
export type DataMode = "live" | "demo";

// ---------------------------------------------------------------------------
// Tipos de leitura (o que a interface administrativa consome)
// ---------------------------------------------------------------------------

export interface SubmissionBase {
  id: string;
  reference: string;
  topic: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OuvidoriaRecord extends SubmissionBase {
  kind: "ouvidoria";
  category: OuvidoriaCategory;
  description: string;
  impact: number | null;
}

export interface FeedbackRecord extends SubmissionBase {
  kind: "feedback";
  feedbackKind: FeedbackKind;
  area: string | null;
  message: string;
  rating: number | null;
}

export type SubmissionRecord = OuvidoriaRecord | FeedbackRecord;

export interface TimelineEntry {
  id: string;
  type: "note" | "response" | "status";
  body: string;
  createdAt: string;
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  priority: ActionPriority;
  owner: string;
  status: ActionStatus;
  dueDate: string | null;
  createdAt: string;
  linkedReference: string | null;
}

export interface PulseResponse {
  id: string;
  createdOn: string; // somente a data (sem horário) para reduzir reidentificação
  answers: Record<PulseKey, number>;
}

export interface TrackResult {
  reference: string;
  kind: SubmissionKind;
  label: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  responses: { body: string; createdAt: string }[];
}

export interface SubmissionFilters {
  q?: string;
  status?: SubmissionStatus;
  category?: string;
  from?: string;
  to?: string;
}

// ---------------------------------------------------------------------------
// Cursos profissionalizantes (inscrição IDENTIFICADA, separada dos canais anônimos)
// ---------------------------------------------------------------------------

export const COURSES = {
  rotinas_administrativas: {
    label: "Rotinas administrativas",
    description: "Organização de documentos, agenda, atendimento interno e processos de escritório.",
  },
  informatica_basica: {
    label: "Informática básica",
    description: "Computador, internet, e-mail, editores de texto e planilhas no dia a dia.",
  },
  ingles_basico: {
    label: "Língua inglesa — nível básico",
    description: "Vocabulário, leitura e conversação essenciais para começar.",
  },
  oratoria: {
    label: "Oratória",
    description: "Falar em público com clareza e segurança, em reuniões e atendimentos.",
  },
} as const;
export type CourseKey = keyof typeof COURSES;

export const COURSE_SHIFTS = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  flexivel: "Sem preferência",
} as const;
export type CourseShift = keyof typeof COURSE_SHIFTS;

export const ENROLLMENT_STATUSES = {
  recebida: "Recebida",
  contatado: "Contato enviado",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
} as const;
export type EnrollmentStatus = keyof typeof ENROLLMENT_STATUSES;

export interface CourseEnrollment {
  id: string;
  fullName: string;
  email: string;
  course: CourseKey;
  shift: CourseShift;
  area: string | null;
  status: EnrollmentStatus;
  createdAt: string;
}

export interface EnrollmentFilters {
  course?: CourseKey;
  status?: EnrollmentStatus;
  q?: string;
}

// ---------------------------------------------------------------------------
// Avaliações profissionais (feedback da GESTÃO para o colaborador)
// Identificadas e privadas — totalmente separadas da ouvidoria anônima.
// ---------------------------------------------------------------------------

export const REVIEW_STATUSES = {
  rascunho: "Rascunho",
  publicado: "Publicado",
} as const;
export type ReviewStatus = keyof typeof REVIEW_STATUSES;

export const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
] as const;

export const REVIEW_LIMITS = { section: 2000, message: 1500, goal: 160, goals: 3, name: 80 } as const;

export interface EmployeeProfile {
  id: string;
  fullName: string;
  email: string;
  area: string | null;
  createdAt: string;
}

export interface ReviewSummary {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number; // 1–12
  year: number;
  status: ReviewStatus;
  reviewerName: string | null;
  publishedAt: string | null;
  viewedAt: string | null;
  acknowledgedAt: string | null;
  updatedAt: string;
}

export interface ReviewDetail extends ReviewSummary {
  strengths: string;
  improvements: string;
  recommendations: string;
  goals: string[];
  suggestedCourse: CourseKey | null;
  managerMessage: string | null;
  createdAt: string;
}

export interface ReviewRevision {
  id: string;
  reviewId: string;
  note: string;
  snapshot: Pick<ReviewDetail, "strengths" | "improvements" | "recommendations" | "goals" | "managerMessage" | "suggestedCourse">;
  createdAt: string;
}

export interface EmployeeNotification {
  id: string;
  title: string;
  body: string;
  reviewId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface ReviewFilters {
  employeeId?: string;
  year?: number;
  month?: number;
  status?: ReviewStatus;
  q?: string;
}

export function periodLabel(month: number, year: number) {
  const m = MONTHS[month - 1] ?? "";
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} de ${year}`;
}
