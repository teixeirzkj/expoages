import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { isSupabaseConfigured } from "@/lib/server/env";
import { EmployeeLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar · Meu Feedback" };

export default function EmployeeLoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <main className="min-h-dvh bg-cream">
      <header className="surface-dark bg-navy">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Link href="/" aria-label="Voltar ao site">
            <Logo tone="light" />
          </Link>
          <Link href="/#participe" className="inline-flex items-center gap-2 text-sm text-cream/75 hover:text-white">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-4xl gap-8 px-5 py-10 md:grid-cols-2 md:py-16">
        <section>
          <p className="text-[0.8125rem] font-semibold text-blue">Meu Feedback</p>
          <h1 className="display-lg mt-1 text-navy">Seu desenvolvimento importa.</h1>
          <p className="mt-3 text-slate">
            Entre com a conta criada pela gestão para consultar suas avaliações, pontos fortes e oportunidades de evolução.
          </p>
          <p className="mt-6 flex gap-2.5 rounded-xl bg-white p-4 text-sm text-ink ring-1 ring-navy/8">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
            Cada colaborador vê somente as próprias avaliações publicadas. Esta área não tem relação com a ouvidoria anônima.
          </p>
        </section>
        <section className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-navy/8 sm:p-8">
          {configured ? (
            <EmployeeLoginForm />
          ) : (
            <div>
              <p className="font-semibold text-navy">Contas ainda não ativadas</p>
              <p className="mt-1 text-sm text-slate">
                O banco de dados real não foi configurado nesta versão. Use a demonstração com colaboradores fictícios.
              </p>
            </div>
          )}
          <div className="mt-6 border-t border-navy/8 pt-5">
            <Link
              href="/colaborador/demo"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-mist text-sm font-semibold text-navy hover:bg-cream-2"
            >
              <FlaskConical className="size-4" /> Ver demonstração (dados fictícios)
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
