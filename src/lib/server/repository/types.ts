import type {
  ActionPlan,
  ActionStatus,
  CourseEnrollment,
  EmployeeNotification,
  EmployeeProfile,
  ReviewDetail,
  ReviewFilters,
  ReviewRevision,
  ReviewSummary,
  EnrollmentFilters,
  EnrollmentStatus,
  FeedbackRecord,
  OuvidoriaRecord,
  PulseResponse,
  SubmissionFilters,
  SubmissionKind,
  SubmissionRecord,
  SubmissionStatus,
  TimelineEntry,
  TrackResult,
} from "@/lib/domain";
export type RecordByKind = { ouvidoria: OuvidoriaRecord; feedback: FeedbackRecord };
import type {
  ActionInput,
  EmployeeInput,
  EnrollmentInput,
  FeedbackInput,
  OuvidoriaInput,
  PulseInput,
  ReviewInput,
} from "@/lib/validation";

export interface ProtocolData {
  reference: string;
  secretHash: string;
}

/**
 * Contrato único de acesso a dados. Existem duas implementações:
 *  - SupabaseRepository: banco real, com RLS (modo "live").
 *  - DemoRepository: memória do servidor com dados fictícios (modo "demo").
 * A interface nunca sabe qual implementação está ativa.
 */
export interface Repository {
  readonly mode: "live" | "demo";

  // Público
  insertOuvidoria(input: Omit<OuvidoriaInput, "confirm">, protocol: ProtocolData): Promise<void>;
  insertFeedback(input: FeedbackInput, protocol: ProtocolData): Promise<void>;
  insertPulse(input: PulseInput): Promise<void>;
  insertEnrollment(input: Omit<EnrollmentInput, "consent">): Promise<void>;
  track(reference: string, secretHash: string): Promise<TrackResult | null>;

  // Administrativo
  listSubmissions<K extends SubmissionKind>(kind: K, filters?: SubmissionFilters): Promise<RecordByKind[K][]>;
  getSubmission(kind: SubmissionKind, id: string): Promise<SubmissionRecord | null>;
  getTimeline(kind: SubmissionKind, id: string): Promise<TimelineEntry[]>;
  setStatus(kind: SubmissionKind, id: string, status: SubmissionStatus): Promise<void>;
  addNote(kind: SubmissionKind, id: string, body: string): Promise<void>;
  addResponse(kind: SubmissionKind, id: string, body: string): Promise<void>;
  listPulse(filters?: { from?: string; to?: string }): Promise<PulseResponse[]>;
  listActions(): Promise<ActionPlan[]>;
  createAction(input: ActionInput): Promise<void>;
  updateActionStatus(id: string, status: ActionStatus): Promise<void>;
  deleteAction(id: string): Promise<void>;
  listEnrollments(filters?: EnrollmentFilters): Promise<CourseEnrollment[]>;
  updateEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<void>;
  deleteEnrollment(id: string): Promise<void>;

  // Avaliações profissionais — gestão
  listEmployees(): Promise<EmployeeProfile[]>;
  registerEmployee(input: EmployeeInput): Promise<void>;
  listReviews(filters?: ReviewFilters): Promise<ReviewSummary[]>;
  getReview(id: string): Promise<ReviewDetail | null>;
  /** Cria (id null) ou atualiza. Se a avaliação já estiver publicada, registra revisão. */
  saveReview(input: ReviewInput, id: string | null): Promise<string>;
  /** Publica e cria a notificação interna do colaborador. */
  publishReview(id: string): Promise<void>;
  listRevisions(reviewId: string): Promise<ReviewRevision[]>;

  // Avaliações profissionais — colaborador (sempre filtrado pelo próprio id; só publicadas)
  getEmployee(employeeId: string): Promise<EmployeeProfile | null>;
  listMyReviews(employeeId: string): Promise<ReviewSummary[]>;
  getMyReview(employeeId: string, reviewId: string): Promise<ReviewDetail | null>;
  markReviewViewed(employeeId: string, reviewId: string): Promise<void>;
  acknowledgeReview(employeeId: string, reviewId: string): Promise<void>;
  listNotifications(employeeId: string): Promise<EmployeeNotification[]>;
  markNotificationRead(employeeId: string, notificationId: string): Promise<void>;
}

export class RepositoryError extends Error {
  constructor(public readonly publicMessage: string, cause?: unknown) {
    super(publicMessage, { cause });
  }
}
