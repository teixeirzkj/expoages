import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/server/env";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Acesso administrativo" };

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-cream lg:flex lg:flex-col lg:justify-between surface-dark">
        <Logo tone="light" />
        <div aria-hidden className="absolute -bottom-40 -right-40 size-[34rem] rounded-full border border-cream/10" />
        <div aria-hidden className="absolute -bottom-20 -right-20 size-[24rem] rounded-full bg-cream/[0.04]" />
        <div>
          <p className="font-display text-5xl leading-[1.05] tracking-tight">
            Cada registro é <em className="text-sky">alguém</em> pedindo para ser ouvido.
          </p>
          <p className="mt-6 max-w-md text-cream/65">
            Área restrita à gestão autorizada. Trate as informações com cuidado, confidencialidade e respeito.
          </p>
        </div>
      </section>

      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
            <ArrowLeft className="size-4" /> Voltar ao site
          </Link>
          <h1 className="font-display text-4xl text-navy">Acesso da gestão</h1>
          <p className="mt-2 text-ink/60">Entre com a conta de administrador fornecida pelo responsável do projeto.</p>

          {configured ? (
            <LoginForm />
          ) : (
            <div className="mt-8 rounded-2xl bg-mist p-5 text-sm text-ink">
              <p className="font-semibold">Banco de dados ainda não configurado.</p>
              <p className="mt-1 text-ink/70">
                Defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY (veja o README). Enquanto isso, use o painel demonstrativo com
                dados fictícios.
              </p>
            </div>
          )}

          <Link href="/demo" className="mt-8 flex items-center gap-3 rounded-2xl bg-mist p-4 text-sm text-navy hover:bg-sky/60">
            <FlaskConical className="size-5 shrink-0" />
            <span>
              <strong className="block">Abrir painel demonstrativo</strong>
              Sem login, apenas com dados fictícios — ideal para a apresentação.
            </span>
          </Link>
          <p className="mt-8 text-xs text-ink/45">Não há cadastro público de administradores.</p>
        </div>
      </section>
    </main>
  );
}
