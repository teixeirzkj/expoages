/**
 * Configuração central do projeto.
 * Edite este arquivo para atualizar nome da plataforma, informações
 * acadêmicas e dados do grupo. Campos vazios aparecem como "A definir".
 */
export const siteConfig = {
  platformName: "Horizonte",
  platformTagline: "Programa de Reconhecimento e Valorização Profissional",
  centralMessage: "Valorizar pessoas começa por ouvi-las.",

  /**
   * Logotipo. style "oficial" usa as artes do grupo em public/brand;
   * "classico" volta à marca demonstrativa original em SVG.
   */
  logo: {
    style: "oficial" as "oficial" | "classico",
    onLight: "/brand/logo-horizonte-azul.webp", // logo azul → fundos claros (creme/branco)
    onDark: "/brand/logo-horizonte-creme.webp", // logo creme → fundos azul-marinho
    width: 860,
    height: 240,
    alt: "Horizonte — Reconhecimento & Valorização",
  },

  company: {
    name: "Horizonte Soluções Integradas Ltda.",
    nature: "Empresa fictícia criada para fins acadêmicos",
    location: "Bahia",
    founded: 2014,
    employees: 180,
    segment: "Terceirização, contact center e atendimento ao cliente",
  },

  academic: {
    title:
      "Programa de Reconhecimento e Valorização Profissional: Uma Sugestão para Melhorar a Saúde dos Funcionários da Empresa",
    course: "Gestão de Comportamento de Pessoas",
    institution: "Centro Universitário AGES",
    institutionLogoSrc: "",
    advisor: "Vanessa Fernandes e Rafael Ribeiro", // professores orientadores
    members: [
      "Alani da Silva",
      "Ana Clara",
      "Caroline Pires",
      "Eduarda Capim",
      "Ênila Gabriele",
      "Gabriel Santos",
      "Ionne Oliveira",
      "Kauan Lucas",
      "Sofia Vitória",
    ] as string[],
    event: "ExpoAGES",
    year: "2026",
  },

  /** Limite mínimo de respostas para exibir indicadores agregados. */
  minAggregateSample: 5,
} as const;

export type SiteConfig = typeof siteConfig;

export const navItems = [
  { id: "inicio", label: "Início" },
  { id: "programa", label: "O programa" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "participe", label: "Participe" },
  { id: "sobre", label: "Sobre o projeto" },
] as const;
