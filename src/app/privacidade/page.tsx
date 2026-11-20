import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Política de privacidade" };

const SECTIONS = [
  {
    h: "Natureza do projeto",
    p: `Esta plataforma é um protótipo acadêmico da disciplina de ${siteConfig.academic.course}, aplicado a uma empresa fictícia (${siteConfig.company.name}). Não deve ser usada para relatos reais sem uma revisão jurídica e institucional própria.`,
  },
  {
    h: "O que coletamos",
    p: "Na ouvidoria, no feedback e na pesquisa: somente o que você escreve nos formulários (tipo, tema, descrição e avaliações opcionais). Não pedimos nome, e-mail, telefone, CPF ou cadastro. As respostas da pesquisa guardam apenas a data (sem horário).",
  },
  {
    h: "Inscrição em cursos",
    p: "A inscrição em cursos profissionalizantes é o único formulário identificado: pede nome, e-mail, curso, turno e, opcionalmente, a área. Esses dados são usados apenas para o contato sobre o curso, mediante sua autorização, ficam em uma tabela separada das mensagens anônimas e só a gestão autorizada pode lê-los ou excluí-los. Para pedir a exclusão, fale com a coordenação do programa.",
  },
  {
    h: "Meu Feedback (avaliações da gestão)",
    p: "Colaboradores com conta criada pela gestão podem consultar as próprias avaliações profissionais. Cada pessoa vê apenas as avaliações publicadas para ela; rascunhos ficam visíveis só para a gestão. São registrados a data da primeira visualização e a confirmação de leitura, que indica ciência e não concordância. Essas contas e avaliações não têm nenhuma relação com a ouvidoria anônima nem com as inscrições em cursos.",
  },
  {
    h: "O que a aplicação não grava",
    p: "A aplicação não grava endereço IP, identificador do aparelho ou “fingerprint” do navegador. Para limitar abusos, o servidor mantém por alguns minutos, apenas em memória, um código derivado e embaralhado do endereço de rede, que é descartado automaticamente e nunca vai para o banco de dados.",
  },
  {
    h: "Limitações de infraestrutura",
    p: "Provedores de hospedagem e de banco de dados (por exemplo, Vercel e Supabase) podem manter registros técnicos próprios de acesso, como endereço IP e horário das requisições, fora do controle desta aplicação. Por isso, não prometemos anonimato absoluto. Além disso, detalhes muito específicos escritos na mensagem podem indicar quem a escreveu.",
  },
  {
    h: "Quem acessa",
    p: "Somente administradores autorizados, com login, por meio do painel de gestão. O banco aplica regras de segurança em nível de linha (RLS) que bloqueiam qualquer leitura pública. Mensagens nunca são publicadas automaticamente no site.",
  },
  {
    h: "Protocolo",
    p: "Cada envio gera um protocolo aleatório. O banco guarda apenas um resumo criptográfico (hash) da parte secreta, suficiente para validar consultas, mas não para reconstruir o código. Se o protocolo for perdido, não é possível recuperá-lo.",
  },
  {
    h: "Modo demonstração",
    p: "Na apresentação, os envios podem ir para um ambiente fictício que existe apenas na memória do servidor e é apagado ao reiniciar a demonstração ou o servidor.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-cream py-16">
      <article className="container-editorial max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="size-4" /> Voltar ao site
        </Link>
        <p className="eyebrow mt-12 text-blue">Privacidade</p>
        <h1 className="display-lg mt-4 text-navy">Como tratamos o que você compartilha</h1>
        <div className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
          {SECTIONS.map((s) => (
            <section key={s.h} className="grid gap-3 py-7 md:grid-cols-[12rem_1fr] md:gap-8">
              <h2 className="font-semibold text-navy">{s.h}</h2>
              <p className="leading-relaxed text-ink/75">{s.p}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
