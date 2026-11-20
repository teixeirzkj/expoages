/**
 * DADOS FICTÍCIOS — usados exclusivamente no modo demonstração.
 * Nenhum texto abaixo foi escrito por pessoas reais; todos foram criados
 * para ilustrar o funcionamento da plataforma na apresentação acadêmica.
 */
import type {
  ActionPlan,
  CourseEnrollment,
  EmployeeNotification,
  EmployeeProfile,
  ReviewDetail,
  ReviewRevision,
  FeedbackRecord,
  OuvidoriaRecord,
  PulseResponse,
  SubmissionStatus,
  TimelineEntry,
} from "@/lib/domain";
import { MONTHS } from "@/lib/domain";

const periodMonth = (m: number) => MONTHS[m - 1] ?? "";

type SeedOuvidoria = Omit<OuvidoriaRecord, "id" | "reference" | "createdAt" | "updatedAt" | "kind">;
type SeedFeedback = Omit<FeedbackRecord, "id" | "reference" | "createdAt" | "updatedAt" | "kind">;

const OUVIDORIA: SeedOuvidoria[] = [
  { category: "condicoes", topic: "Pausas e descanso", description: "As pausas programadas costumam ser remarcadas em horários de pico e acabam não acontecendo. Seria importante garantir ao menos uma pausa fixa por turno.", impact: 4, status: "acao_planejada" },
  { category: "sugestao", topic: "Comunicação com a gestão", description: "Sugiro uma reunião rápida no início da semana para alinhar prioridades e mudanças de roteiro. Muitas vezes descobrimos alterações durante o atendimento.", impact: 3, status: "concluido" },
  { category: "reclamacao", topic: "Metas e pressão", description: "As metas diárias foram ajustadas sem explicação e a equipe ficou sem entender os critérios. A cobrança aumentou antes de qualquer conversa.", impact: 5, status: "em_analise" },
  { category: "dificuldade", topic: "Carga de trabalho", description: "Com dois colegas afastados, o volume da fila aumentou bastante e não houve redistribuição. O cansaço no fim do turno está muito alto.", impact: 5, status: "em_analise" },
  { category: "sugestao", topic: "Reconhecimento", description: "Seria bom ter um momento mensal para destacar boas práticas de atendimento, não apenas números. Muitas soluções criativas passam despercebidas.", impact: 2, status: "acao_planejada" },
  { category: "condicoes", topic: "Ambiente físico", description: "Os fones de algumas posições de atendimento estão com chiado e isso aumenta o esforço durante as ligações. Já foi informado mais de uma vez.", impact: 3, status: "concluido" },
  { category: "sugestao", topic: "Treinamento", description: "Proponho trilhas curtas de treinamento sobre atendimento a clientes em situação de conflito. Ajudaria quem está chegando agora.", impact: 3, status: "recebido" },
  { category: "dificuldade", topic: "Relação entre equipes", description: "Há pouca troca entre o atendimento e o back-office. Quando um caso precisa de retorno, não sabemos a quem recorrer.", impact: 4, status: "recebido" },
  { category: "outro", topic: "Horários e escalas", description: "A divulgação da escala acontece com pouca antecedência, o que dificulta organizar compromissos pessoais e familiares.", impact: 4, status: "em_analise" },
  { category: "reclamacao", topic: "Feedback das monitorias", description: "Recebemos as notas das monitorias, mas sem orientação sobre o que melhorar. Um retorno mais explicado ajudaria bastante.", impact: 3, status: "acao_planejada" },
  { category: "sugestao", topic: "Bem-estar", description: "Um espaço simples para descompressão, com água e cadeiras confortáveis, faria diferença nos intervalos.", impact: 2, status: "recebido" },
  { category: "condicoes", topic: "Sistemas lentos", description: "O sistema de registro trava com frequência no início da manhã, o que gera retrabalho e aumenta o tempo médio de atendimento.", impact: 4, status: "concluido" },
  { category: "dificuldade", topic: "Metas e pressão", description: "O painel de ranking exposto na sala gera comparação constante entre colegas. Talvez fosse melhor um acompanhamento individual.", impact: 4, status: "recebido" },
  { category: "sugestao", topic: "Comunicação com a gestão", description: "Um mural digital com as decisões tomadas a partir das sugestões ajudaria a perceber que elas são consideradas.", impact: 2, status: "em_analise" },
  { category: "outro", topic: "Integração de novos colegas", description: "Quem entra na empresa demora para entender os processos. Um padrinho ou madrinha nas primeiras semanas ajudaria.", impact: 3, status: "recebido" },
  { category: "reclamacao", topic: "Carga de trabalho", description: "Temos acumulado tarefas administrativas durante o atendimento, sem tempo reservado para elas.", impact: 4, status: "recebido" },
  { category: "condicoes", topic: "Ergonomia", description: "Algumas cadeiras não têm regulagem de altura e há relatos frequentes de dores nas costas ao final da jornada.", impact: 4, status: "acao_planejada" },
  { category: "sugestao", topic: "Reconhecimento", description: "Agradecimentos dos clientes poderiam ser compartilhados com a equipe responsável. Hoje eles ficam só no sistema.", impact: 2, status: "concluido" },
];

const FEEDBACK: SeedFeedback[] = [
  { feedbackKind: "reconhecimento", topic: "Colaboração", area: "Atendimento receptivo", message: "A equipe da manhã se organizou para cobrir a fila durante a instabilidade do sistema sem perder a calma com os clientes. Foi um ótimo exemplo de cooperação.", rating: 5, status: "concluido" },
  { feedbackKind: "reconhecimento", topic: "Treinamento", area: "Qualidade e monitoria", message: "O novo material de apoio para atendimentos difíceis ficou claro e prático. Ajudou muito nas primeiras semanas.", rating: 5, status: "em_analise" },
  { feedbackKind: "construtivo", topic: "Processos", area: "Back-office", message: "O fluxo de devolução de casos poderia ter um campo de prioridade. Hoje casos urgentes ficam misturados com rotineiros.", rating: 3, status: "acao_planejada" },
  { feedbackKind: "reconhecimento", topic: "Liderança", area: "Supervisão", message: "A supervisão passou a explicar o motivo das mudanças de roteiro antes de aplicá-las. Isso reduziu muita ansiedade na equipe.", rating: 5, status: "recebido" },
  { feedbackKind: "construtivo", topic: "Comunicação", area: null, message: "Os comunicados internos chegam por canais diferentes e é fácil perder informações. Centralizar em um só lugar ajudaria.", rating: 3, status: "em_analise" },
  { feedbackKind: "outro", topic: "Bem-estar", area: null, message: "A ação de ginástica laboral foi bem recebida. Seria interessante manter com regularidade.", rating: 4, status: "concluido" },
  { feedbackKind: "reconhecimento", topic: "Atendimento", area: "Atendimento ativo", message: "Parabéns à equipe pela forma respeitosa de conduzir as ligações de retenção, mesmo com metas desafiadoras.", rating: 5, status: "recebido" },
  { feedbackKind: "construtivo", topic: "Feedback e desenvolvimento", area: "Qualidade e monitoria", message: "As devolutivas de monitoria seriam mais úteis com exemplos práticos do que pode ser ajustado na próxima ligação.", rating: 3, status: "recebido" },
  { feedbackKind: "reconhecimento", topic: "Colaboração", area: "Tecnologia e suporte", message: "O suporte respondeu rapidamente à queda do sistema e manteve todos informados durante a correção.", rating: 4, status: "concluido" },
  { feedbackKind: "construtivo", topic: "Metas", area: null, message: "Seria bom combinar metas de qualidade junto com as de produtividade, para que o cuidado com o cliente também seja valorizado.", rating: 4, status: "em_analise" },
  { feedbackKind: "outro", topic: "Ambiente", area: null, message: "A reorganização das posições de atendimento melhorou a circulação e reduziu o barulho.", rating: 4, status: "recebido" },
  { feedbackKind: "reconhecimento", topic: "Integração", area: "Recursos Humanos", message: "O acolhimento dos novos colegas na última turma foi muito cuidadoso, com apresentação de todas as áreas.", rating: 5, status: "recebido" },
  { feedbackKind: "construtivo", topic: "Escalas", area: "Supervisão", message: "Publicar a escala com duas semanas de antecedência facilitaria a organização pessoal da equipe.", rating: 3, status: "acao_planejada" },
  { feedbackKind: "reconhecimento", topic: "Atendimento", area: "Atendimento receptivo", message: "Destaque para a paciência da equipe no atendimento a pessoas idosas, explicando cada etapa com clareza.", rating: 5, status: "em_analise" },
];

const ACTIONS: Omit<ActionPlan, "id" | "createdAt">[] = [
  { title: "Pausa fixa garantida por turno", description: "Definir janelas de pausa que não sejam remarcadas em horários de pico, com cobertura planejada pela supervisão.", category: "bem_estar", priority: "alta", owner: "Coordenação de operações", status: "em_andamento", dueDate: null, linkedReference: null },
  { title: "Momento mensal de reconhecimento", description: "Encontro de 20 minutos para compartilhar boas práticas e agradecimentos recebidos de clientes, com foco em comportamentos e não apenas em números.", category: "reconhecimento", priority: "media", owner: "Recursos Humanos", status: "planejada", dueDate: null, linkedReference: null },
  { title: "Critérios de metas explicados à equipe", description: "Publicar os critérios das metas e realizar uma conversa por equipe antes de cada ajuste.", category: "processos", priority: "alta", owner: "Gerência de operações", status: "planejada", dueDate: null, linkedReference: null },
  { title: "Devolutiva de monitoria com exemplos", description: "Padronizar devolutivas com um ponto forte, um ponto de melhoria e um exemplo prático.", category: "desenvolvimento", priority: "media", owner: "Qualidade e monitoria", status: "em_andamento", dueDate: null, linkedReference: null },
  { title: "Troca dos fones com defeito", description: "Levantamento e substituição dos equipamentos com falha nas posições de atendimento.", category: "condicoes", priority: "media", owner: "Tecnologia e suporte", status: "concluida", dueDate: null, linkedReference: null },
  { title: "Mural de decisões da ouvidoria", description: "Divulgar mensalmente quais sugestões foram analisadas e quais ações foram definidas.", category: "comunicacao", priority: "baixa", owner: "Comunicação interna", status: "planejada", dueDate: null, linkedReference: null },
];

const NOTES = [
  "Tema recorrente — verificar outras manifestações semelhantes.",
  "Encaminhado para análise conjunta com a coordenação.",
  "Avaliar impacto na escala antes de definir a ação.",
];
const RESPONSES = [
  "Obrigado pela contribuição. A situação foi analisada e uma ação de melhoria foi incluída no plano da gestão.",
  "Sua manifestação foi recebida e está em análise pela equipe responsável. Retornaremos por este protocolo.",
  "A sugestão foi implementada. Agradecemos por ajudar a melhorar o ambiente de trabalho.",
];

/** Gerador pseudoaleatório determinístico para que a demo seja reproduzível. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inscrições fictícias: nomes inventados e domínio reservado example.com. */
const ENROLLMENTS: Omit<CourseEnrollment, "id" | "createdAt">[] = [
  { fullName: "Pessoa Exemplo A", email: "pessoa.a@example.com", course: "informatica_basica", shift: "manha", area: "Atendimento receptivo", status: "confirmada" },
  { fullName: "Pessoa Exemplo B", email: "pessoa.b@example.com", course: "oratoria", shift: "tarde", area: "Supervisão", status: "contatado" },
  { fullName: "Pessoa Exemplo C", email: "pessoa.c@example.com", course: "ingles_basico", shift: "noite", area: null, status: "recebida" },
  { fullName: "Pessoa Exemplo D", email: "pessoa.d@example.com", course: "rotinas_administrativas", shift: "flexivel", area: "Back-office", status: "recebida" },
  { fullName: "Pessoa Exemplo E", email: "pessoa.e@example.com", course: "informatica_basica", shift: "tarde", area: "Atendimento ativo", status: "contatado" },
  { fullName: "Pessoa Exemplo F", email: "pessoa.f@example.com", course: "oratoria", shift: "manha", area: "Qualidade e monitoria", status: "recebida" },
];

/** Colaboradores e avaliações FICTÍCIOS (domínio reservado example.com). */
const EMPLOYEES: Omit<EmployeeProfile, "createdAt">[] = [
  { id: "demo-emp-lucas", fullName: "Lucas Almeida", email: "lucas.almeida@example.com", area: "Atendimento receptivo" },
  { id: "demo-emp-mariana", fullName: "Mariana Costa", email: "mariana.costa@example.com", area: "Qualidade e monitoria" },
  { id: "demo-emp-rafael", fullName: "Rafael Souza", email: "rafael.souza@example.com", area: "Atendimento ativo" },
  { id: "demo-emp-beatriz", fullName: "Beatriz Lima", email: "beatriz.lima@example.com", area: "Back-office" },
];

type SeedReview = Omit<ReviewDetail, "id" | "employeeName" | "createdAt" | "updatedAt" | "publishedAt" | "viewedAt" | "acknowledgedAt"> & {
  ageDays: number;
  read?: "none" | "viewed" | "acknowledged";
};

const REVIEWS: SeedReview[] = [
  {
    employeeId: "demo-emp-lucas", month: 11, year: 2026, status: "publicado", reviewerName: "Coordenação de Atendimento", ageDays: 1, read: "none",
    strengths: "Boa comunicação com a equipe.\nComprometimento com as atividades.\nOrganização no atendimento.",
    improvements: "Aprimorar a organização das prioridades.\nDesenvolver maior autonomia em situações específicas.",
    recommendations: "Participar de atividades de desenvolvimento.\nDefinir objetivos para o próximo mês.",
    goals: ["Planejar o início de cada turno listando as três prioridades do dia.", "Resolver um caso complexo por semana com autonomia, registrando o aprendizado."],
    suggestedCourse: "rotinas_administrativas",
    managerMessage: "Lucas, sua evolução neste mês foi visível. Conte com a coordenação para apoiar as próximas metas.",
  },
  {
    employeeId: "demo-emp-lucas", month: 10, year: 2026, status: "publicado", reviewerName: "Coordenação de Atendimento", ageDays: 31, read: "acknowledged",
    strengths: "Cordialidade constante com os clientes.\nPontualidade e assiduidade.",
    improvements: "Registrar os atendimentos com mais detalhes.\nPedir apoio mais cedo em casos difíceis.",
    recommendations: "Acompanhar um colega experiente em dois turnos.",
    goals: ["Revisar os registros do dia antes de encerrar o turno."],
    suggestedCourse: null,
    managerMessage: null,
  },
  {
    employeeId: "demo-emp-lucas", month: 9, year: 2026, status: "publicado", reviewerName: "Coordenação de Atendimento", ageDays: 61, read: "acknowledged",
    strengths: "Rápida adaptação aos novos roteiros.\nBoa relação com a equipe.",
    improvements: "Ganhar segurança ao explicar procedimentos técnicos.",
    recommendations: "Estudar a base de conhecimento dos produtos mais procurados.",
    goals: [],
    suggestedCourse: "informatica_basica",
    managerMessage: null,
  },
  {
    employeeId: "demo-emp-mariana", month: 11, year: 2026, status: "rascunho", reviewerName: "Gestão de Qualidade", ageDays: 0,
    strengths: "Análises de monitoria muito bem fundamentadas.\nEmpatia ao dar devolutivas à equipe.",
    improvements: "Apresentar os resultados em reuniões com mais confiança.",
    recommendations: "Conduzir a próxima reunião mensal de qualidade.",
    goals: ["Preparar uma apresentação curta com os destaques do mês."],
    suggestedCourse: "oratoria",
    managerMessage: null,
  },
  {
    employeeId: "demo-emp-mariana", month: 10, year: 2026, status: "publicado", reviewerName: "Gestão de Qualidade", ageDays: 30, read: "viewed",
    strengths: "Organização exemplar dos relatórios.\nIniciativa para propor melhorias no roteiro.",
    improvements: "Equilibrar o tempo entre análises e acompanhamento da equipe.",
    recommendations: "Reservar um horário fixo semanal para devolutivas individuais.",
    goals: [],
    suggestedCourse: null,
    managerMessage: null,
  },
  {
    employeeId: "demo-emp-rafael", month: 10, year: 2026, status: "publicado", reviewerName: "Coordenação de Atendimento Ativo", ageDays: 29, read: "none",
    strengths: "Persistência e foco nas metas da campanha.\nBom domínio dos argumentos de venda.",
    improvements: "Ouvir mais o cliente antes de apresentar a oferta.",
    recommendations: "Praticar escuta ativa em simulações com a supervisão.",
    goals: ["Aplicar perguntas abertas no início de cada ligação."],
    suggestedCourse: "oratoria",
    managerMessage: null,
  },
];

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export interface DemoState {
  ouvidoria: OuvidoriaRecord[];
  feedback: FeedbackRecord[];
  pulse: PulseResponse[];
  actions: ActionPlan[];
  timeline: Record<string, TimelineEntry[]>;
  enrollments: CourseEnrollment[];
  employees: EmployeeProfile[];
  reviews: ReviewDetail[];
  revisions: ReviewRevision[];
  notifications: (EmployeeNotification & { employeeId: string })[];
  secrets: Record<string, string>; // reference -> secretHash
}

export function buildDemoState(now = Date.now()): DemoState {
  const rand = mulberry32(2014);
  const DAY = 86_400_000;
  const chunk = () => Array.from({ length: 4 }, () => ALPHABET[Math.floor(rand() * 32)]).join("");
  const ref = () => `HZ-${chunk()}-${chunk()}`;
  const id = (prefix: string, i: number) => `demo-${prefix}-${String(i).padStart(3, "0")}`;
  const timeline: DemoState["timeline"] = {};

  const progress = (status: SubmissionStatus, key: string, created: number, i: number) => {
    const entries: TimelineEntry[] = [];
    const order: SubmissionStatus[] = ["em_analise", "acao_planejada", "concluido"];
    const until = order.indexOf(status as (typeof order)[number]);
    for (let s = 0; s <= until; s++) {
      entries.push({ id: `${key}-st-${s}`, type: "status", body: order[s], createdAt: new Date(created + (s + 1) * DAY * 1.5).toISOString() });
    }
    if (until >= 0 && i % 2 === 0) entries.push({ id: `${key}-n`, type: "note", body: NOTES[i % NOTES.length], createdAt: new Date(created + DAY).toISOString() });
    if (until >= 1) entries.push({ id: `${key}-r`, type: "response", body: RESPONSES[status === "concluido" ? 2 : 0], createdAt: new Date(created + DAY * 4).toISOString() });
    timeline[key] = entries;
  };

  const ouvidoria = OUVIDORIA.map((o, i): OuvidoriaRecord => {
    const created = now - Math.floor((2 + rand() * 54) * DAY);
    const key = id("ouv", i);
    progress(o.status, key, created, i);
    return { ...o, kind: "ouvidoria", id: key, reference: ref(), createdAt: new Date(created).toISOString(), updatedAt: new Date(Math.min(now, created + 5 * DAY)).toISOString() };
  });

  const feedback = FEEDBACK.map((f, i): FeedbackRecord => {
    const created = now - Math.floor((1 + rand() * 50) * DAY);
    const key = id("fb", i);
    progress(f.status, key, created, i + 1);
    return { ...f, kind: "feedback", id: key, reference: ref(), createdAt: new Date(created).toISOString(), updatedAt: new Date(Math.min(now, created + 4 * DAY)).toISOString() };
  });

  // Percepção levemente melhor nas semanas mais recentes (cenário ilustrativo).
  const pulse: PulseResponse[] = Array.from({ length: 64 }, (_, i) => {
    const ageDays = Math.floor(rand() * 56);
    const lift = (56 - ageDays) / 56; // 0..1
    const answer = (base: number) => Math.max(1, Math.min(5, Math.round(base + lift * 0.9 + (rand() - 0.5) * 2)));
    return {
      id: id("pulse", i),
      createdOn: new Date(now - ageDays * DAY).toISOString().slice(0, 10),
      answers: { valorizacao: answer(2.4), escuta: answer(2.7), bem_estar: answer(2.6), feedback: answer(2.3) },
    };
  });

  const linkable = ouvidoria.filter((o) => o.status === "acao_planejada" || o.status === "concluido");
  const actions = ACTIONS.map((a, i): ActionPlan => ({
    ...a,
    id: id("act", i),
    createdAt: new Date(now - (20 - i * 2) * DAY).toISOString(),
    dueDate: new Date(now + (7 + i * 6) * DAY).toISOString().slice(0, 10),
    linkedReference: linkable[i]?.reference ?? null,
  }));

  const enrollments = ENROLLMENTS.map((e, i): CourseEnrollment => ({
    ...e,
    id: id("cur", i),
    createdAt: new Date(now - (1 + i * 3) * DAY - Math.floor(rand() * DAY)).toISOString(),
  }));

  const employees = EMPLOYEES.map((e, i): EmployeeProfile => ({ ...e, createdAt: new Date(now - (120 - i * 7) * DAY).toISOString() }));
  const nameOf = (id: string) => employees.find((e) => e.id === id)?.fullName ?? "";
  const reviews = REVIEWS.map(({ ageDays, read, ...r }, i): ReviewDetail => {
    const created = now - (ageDays + 2) * DAY;
    const published = r.status === "publicado" ? new Date(now - ageDays * DAY).toISOString() : null;
    const viewed = published && read !== "none" ? new Date(now - ageDays * DAY + 6 * 3_600_000).toISOString() : null;
    return {
      ...r,
      id: id("rev", i),
      employeeName: nameOf(r.employeeId),
      createdAt: new Date(created).toISOString(),
      updatedAt: published ?? new Date(created).toISOString(),
      publishedAt: published,
      viewedAt: viewed,
      acknowledgedAt: read === "acknowledged" ? viewed : null,
    };
  });
  const notifications = reviews
    .filter((r) => r.status === "publicado")
    .map((r) => ({
      id: `notif-${r.id}`,
      employeeId: r.employeeId,
      title: `Seu feedback de ${periodMonth(r.month)} está disponível!`,
      body: "A gestão compartilhou uma nova avaliação sobre seu desenvolvimento profissional.",
      reviewId: r.id,
      createdAt: r.publishedAt!,
      readAt: r.viewedAt,
    }));

  return { ouvidoria, feedback, pulse, actions, timeline, enrollments, employees, reviews, revisions: [], notifications, secrets: {} };
}
