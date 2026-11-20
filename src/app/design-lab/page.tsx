import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/hero";
import { ConceptB, ConceptC } from "@/components/design-lab/concepts";

export const metadata: Metadata = { title: "Design lab" };

const LABELS = [
  { id: "a", name: "Conceito A — Editorial humanizado", note: "Direção atual do site: marfim, Fraunces, sol no horizonte e ondas de escuta." },
  { id: "b", name: "Conceito B — Institucional contemporâneo", note: "Fundo escuro, sans-serif forte, grade geométrica e foco que segue o ponteiro." },
  { id: "c", name: "Conceito C — Experiência narrativa", note: "Palavras gigantes que deslizam com a rolagem e formas orgânicas sobrepostas." },
];

function Label({ i }: { i: number }) {
  const l = LABELS[i];
  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 bg-ink px-5 py-3 text-sm text-ivory">
      <strong>{l.name}</strong>
      <span className="text-ivory/60">{l.note}</span>
    </div>
  );
}

/** Pré-visualização dos três conceitos de abertura. Disponível apenas em desenvolvimento. */
export default function DesignLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main>
      <Label i={0} />
      <Hero />
      <div className="h-24 bg-petrol" />
      <Label i={1} />
      <ConceptB />
      <Label i={2} />
      <ConceptC />
    </main>
  );
}
