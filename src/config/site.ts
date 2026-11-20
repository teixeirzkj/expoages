/**
 * Configuração central do projeto.
 * Edite este arquivo para atualizar nome da plataforma, informações
 * acadêmicas e dados do grupo. Campos vazios aparecem como "A definir".
 */
export const siteConfig = {
  platformName: "Horizonte",
  platformTagline: "Programa de Reconhecimento e Valorização Profissional",
  centralMessage: "Valorizar pessoas começa por ouvi-las.",

  /** Logo: deixe `logoSrc` vazio para usar a marca provisória em SVG. */
  logoSrc: "",
  logoAlt: "Logotipo do projeto",

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
    institution: "", // ex.: "Nome da Instituição"
    institutionLogoSrc: "",
    advisor: "", // professor(a) orientador(a)
    members: [] as string[], // ["Integrante 1", "Integrante 2"]
    event: "ExpoAgro",
    year: "",
  },

  /** Limite mínimo de respostas para exibir indicadores agregados. */
  minAggregateSample: 5,
} as const;

export type SiteConfig = typeof siteConfig;

export const navItems = [
  { id: "inicio", label: "Início" },
  { id: "programa", label: "O Programa" },
  { id: "como-funciona", label: "Como Funciona" },
  { id: "ouvidoria", label: "Ouvidoria" },
  { id: "reconhecimento", label: "Reconhecimento" },
  { id: "sobre", label: "Sobre o Projeto" },
] as const;
