import { Suspense, type ReactNode } from "react";
import { FlaskConical, LogOut } from "lucide-react";
import Link from "next/link";
import type { DataMode } from "@/lib/domain";
import { signOut } from "@/app/actions/auth";
import { getAdmin } from "@/lib/server/auth";
import { AdminSidebar } from "./admin-sidebar";
import { ScreenSkeleton } from "./ui";

async function AdminUserBadge() {
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <div className="space-y-2">
      <p className="truncate text-sm font-semibold text-ivory">{admin.displayName}</p>
      <p className="truncate text-xs text-ivory/50">{admin.email}</p>
      <form action={signOut}>
        <button type="submit" className="mt-1 inline-flex items-center gap-2 text-sm text-ivory/60 hover:text-ivory">
          <LogOut className="size-4" /> Sair
        </button>
      </form>
    </div>
  );
}

function DemoFooter() {
  return (
    <Link href="/apresentacao" className="block rounded-xl bg-terracotta/15 p-3 text-xs leading-relaxed text-ivory/80 hover:bg-terracotta/25">
      <span className="mb-1 flex items-center gap-1.5 font-semibold text-terracotta">
        <FlaskConical className="size-3.5" /> Dados fictícios
      </span>
      Ambiente de demonstração separado do painel real. Abrir roteiro →
    </Link>
  );
}

/** Estrutura do painel: sidebar + conteúdo. O conteúdo de cada tela carrega em streaming. */
export function AdminShell({ mode, children }: { mode: DataMode; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-ivory lg:flex">
      <AdminSidebar
        mode={mode}
        footer={
          mode === "live" ? (
            <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-ivory/5" />}>
              <AdminUserBadge />
            </Suspense>
          ) : (
            <DemoFooter />
          )
        }
      />
      <div className="min-w-0 flex-1">
        {mode === "demo" && (
          <div role="status" className="flex items-center justify-center gap-2 bg-terracotta/20 px-4 py-2 text-center text-xs font-medium text-ink">
            <FlaskConical className="size-3.5 shrink-0" />
            Visualização demonstrativa · todos os registros são fictícios e ficam apenas na memória do servidor
          </div>
        )}
        <main className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <Suspense fallback={<ScreenSkeleton />}>{children}</Suspense>;
}
