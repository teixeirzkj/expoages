"use client";

import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Reveal } from "@/components/motion/reveal";

const FAQ = [
  {
    q: "O que é o Programa de Reconhecimento e Valorização Profissional?",
    a: "É uma proposta acadêmica que combina canais de escuta, rotinas de feedback e práticas de reconhecimento para apoiar a motivação e a saúde dos funcionários. A plataforma é a parte prática dessa proposta, aplicada a uma empresa fictícia.",
  },
  {
    q: "Para que serve a ouvidoria?",
    a: "Para que colaboradores compartilhem sugestões, reclamações e dificuldades do ambiente de trabalho de forma segura, sem precisar se identificar, e acompanhem o retorno da gestão.",
  },
  {
    q: "Preciso me identificar?",
    a: "Não. Nenhum formulário pede nome, e-mail, telefone, CPF ou cadastro, e a aplicação não grava seu endereço de rede. Ainda assim, o anonimato depende também do conteúdo: detalhes muito específicos podem indicar quem escreveu. Além disso, serviços de hospedagem podem manter registros técnicos próprios de acesso, fora do controle desta aplicação.",
  },
  {
    q: "Quem pode visualizar minha mensagem?",
    a: "Somente administradores autorizados, por meio de um painel com login. O banco de dados bloqueia qualquer leitura pública das manifestações, e nada é publicado automaticamente no site.",
  },
  {
    q: "Como acompanho uma manifestação?",
    a: "Ao enviar, você recebe um protocolo no formato HZ-XXXX-XXXX-XXXX-XXXX. Use a opção “Acompanhar” e digite o código completo para ver o andamento e as devolutivas. Guarde-o bem: ele não pode ser recuperado.",
  },
  {
    q: "Como funcionam os feedbacks?",
    a: "Você pode enviar reconhecimentos (elogios a equipes e práticas) ou feedbacks construtivos (sugestões de melhoria). É possível indicar uma área de forma genérica, mas não avaliar uma pessoa pelo nome nesta versão.",
  },
  {
    q: "Como a empresa pode utilizar as sugestões?",
    a: "A gestão classifica os registros, identifica temas recorrentes, define prioridades e transforma o que foi recebido em um plano de ações com responsáveis e prazos — devolvendo à equipe o que foi decidido.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-label="Perguntas frequentes" className="relative bg-ivory-2 section-y">
      <div className="container-editorial grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow text-terracotta-2">09 — Perguntas frequentes</p>
          <AnimatedHeading lines={["Dúvidas", "_comuns._"]} accentClassName="text-terracotta-2" className="display-lg mt-6 text-petrol" />
        </div>
        <Reveal className="lg:col-span-8">
          <Accordion.Root className="border-t border-petrol/15">
            {FAQ.map((item, i) => (
              <Accordion.Item key={item.q} value={i} data-reveal className="border-b border-petrol/15">
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                    <span className="font-display text-[1.25rem] leading-snug text-petrol md:text-[1.5rem]">{item.q}</span>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-petrol/20 text-petrol transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)] group-data-[panel-open]:rotate-45 group-data-[panel-open]:bg-petrol group-data-[panel-open]:text-ivory">
                      <Plus className="size-4" />
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-500 ease-[var(--ease-out-expo)] data-[ending-style]:h-0 data-[starting-style]:h-0">
                  <p className="max-w-2xl pb-7 pr-12 text-ink/70">{item.a}</p>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Reveal>
      </div>
    </section>
  );
}
