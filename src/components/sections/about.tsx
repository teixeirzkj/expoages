import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/motion/reveal";
import { Disclosure } from "@/components/ui/disclosure";

const PROJECT = [
  {
    title: "Tema do trabalho",
    content: <p>{siteConfig.academic.title}.</p>,
  },
  {
    title: "Psicologia Organizacional e do Trabalho",
    content: (
      <p>
        Estuda como o trabalho afeta o bem-estar das pessoas e como as organizações podem favorecer ambientes mais saudáveis — a
        base para compreender motivação, desgaste e reconhecimento.
      </p>
    ),
  },
  {
    title: "Papel da tecnologia",
    content: (
      <p>
        A plataforma é uma ferramenta de apoio: facilita a escuta e a organização das informações, mas não substitui o diálogo, a
        liderança atenta nem o cuidado profissional.
      </p>
    ),
  },
];

const FAQ = [
  {
    title: "Preciso me identificar para usar a ouvidoria?",
    content: (
      <p>
        Não. Ouvidoria, feedback e pesquisa não pedem nome, e-mail, telefone, CPF ou cadastro, e a aplicação não grava seu
        endereço de rede. Ainda assim, detalhes muito específicos no texto podem indicar quem escreveu, e serviços de hospedagem
        podem manter registros técnicos próprios.
      </p>
    ),
  },
  {
    title: "Quem pode ver minha mensagem?",
    content: (
      <p>
        Somente administradores autorizados, por um painel com login. O banco de dados bloqueia qualquer leitura pública, e nada é
        publicado automaticamente no site.
      </p>
    ),
  },
  {
    title: "Como acompanho uma manifestação?",
    content: (
      <p>
        Ao enviar, você recebe um protocolo no formato HZ-XXXX-XXXX-XXXX-XXXX. Use “Acompanhe pelo protocolo” e digite o código
        completo para ver o andamento e as devolutivas. Guarde-o: ele não pode ser recuperado.
      </p>
    ),
  },
  {
    title: "Como funciona o Meu Feedback?",
    content: (
      <p>
        Todo mês, a gestão pode preparar uma avaliação para cada colaborador, com pontos positivos, pontos de melhoria,
        recomendações e metas para o próximo período. Depois de publicada, só o próprio colaborador a vê, entrando com a
        conta criada pela gestão. Marcar como lido registra apenas a ciência, não concordância. É uma área identificada e
        totalmente separada da ouvidoria anônima.
      </p>
    ),
  },
  {
    title: "Por que a inscrição nos cursos pede nome e e-mail?",
    content: (
      <p>
        Porque a coordenação precisa entrar em contato para enviar datas, horários e local. Esses dados são usados apenas para
        isso, ficam separados das mensagens anônimas e só a gestão autorizada tem acesso.
      </p>
    ),
  },
  {
    title: "Como a empresa usa as sugestões?",
    content: (
      <p>
        A gestão classifica os registros, identifica temas recorrentes, define prioridades e transforma o que foi recebido em um
        plano de ações com responsáveis e prazos — devolvendo à equipe o que foi decidido.
      </p>
    ),
  },
];

function Value({ value }: { value: string }) {
  return value ? <>{value}</> : <span className="italic text-slate">A definir</span>;
}

export function About() {
  const a = siteConfig.academic;
  const c = siteConfig.company;
  const facts = [
    { k: "Disciplina", v: a.course },
    { k: "Instituição", v: a.institution },
    { k: "Orientação", v: a.advisor },
    { k: "Integrantes", v: a.members.join(", ") },
    { k: "Evento", v: [a.event, a.year].filter(Boolean).join(" · ") },
  ];

  return (
    <section id="sobre" aria-labelledby="sobre-title" className="section-y bg-cream">
      <div className="container-editorial grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-5">
          <p data-reveal className="eyebrow text-blue">Sobre o projeto</p>
          <h2 data-reveal id="sobre-title" className="display-lg mt-3 text-navy">
            Uma proposta acadêmica com um cenário fictício.
          </h2>
          <p data-reveal className="mt-4 text-slate">
            O objetivo é propor um programa que una escuta, feedback e reconhecimento para apoiar a saúde e a motivação dos
            funcionários de uma empresa.
          </p>

          <dl data-reveal className="mt-8 divide-y divide-navy/8 rounded-[var(--radius-card)] bg-white px-5 ring-1 ring-navy/8">
            {facts.map((f) => (
              <div key={f.k} className="flex justify-between gap-6 py-3 text-sm">
                <dt className="text-slate">{f.k}</dt>
                <dd className="text-right font-medium text-ink">
                  <Value value={f.v} />
                </dd>
              </div>
            ))}
          </dl>
          {a.institutionLogoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.institutionLogoSrc} alt={`Logo ${a.institution}`} className="mt-6 h-10 w-auto" />
          ) : null}

          <div data-reveal className="mt-4 rounded-[var(--radius-card)] bg-navy p-5 text-cream">
            <p className="text-xs font-semibold text-sky">Empresa do cenário (fictícia)</p>
            <p className="mt-1.5 font-display text-lg font-semibold text-white">{c.name}</p>
            <p className="mt-1 text-sm text-cream/70">
              {c.employees} colaboradores · desde {c.founded} · {c.segment.toLowerCase()} · {c.location}
            </p>
          </div>
        </Reveal>

        <Reveal className="space-y-10 lg:col-span-7">
          <div data-reveal>
            <h3 className="text-sm font-semibold text-slate">O trabalho</h3>
            <Disclosure className="mt-3" items={PROJECT} />
          </div>
          <div data-reveal>
            <h3 className="text-sm font-semibold text-slate">Perguntas frequentes</h3>
            <Disclosure className="mt-3" items={FAQ} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
