"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChartColumn,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquareHeart,
  Settings,
  SquareKanban,
  Inbox,
  X,
} from "lucide-react";
import { Suspense, useState, type ReactNode } from "react";
import type { DataMode } from "@/lib/domain";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "", label: "Visão geral", icon: LayoutDashboard },
  { href: "/ouvidoria", label: "Ouvidoria", icon: Inbox },
  { href: "/avaliacoes", label: "Avaliações profissionais", icon: ClipboardCheck },
  { href: "/feedbacks", label: "Feedbacks anônimos", icon: MessageSquareHeart },
  { href: "/pulso", label: "Pulso organizacional", icon: Activity },
  { href: "/acoes", label: "Plano de ações", icon: SquareKanban },
  { href: "/cursos", label: "Cursos", icon: GraduationCap },
  { href: "/relatorios", label: "Relatórios", icon: ChartColumn },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function NavList({ base, onNavigate, pathname }: { base: string; onNavigate?: () => void; pathname: string }) {
  return (
    <ul className="space-y-1">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const full = `${base}${href}`;
        const active = href === "" ? pathname === base : pathname.startsWith(full);
        return (
          <li key={href}>
            <Link
              href={full}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active ? "bg-sky text-navy" : "text-cream/70 hover:bg-cream/[0.07] hover:text-cream",
              )}
            >
              <Icon className="size-[1.1rem]" strokeWidth={1.8} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveNavList(props: { base: string; onNavigate?: () => void }) {
  return <NavList {...props} pathname={usePathname()} />;
}

function SidebarBody({ mode, base, footer, onNavigate }: { mode: DataMode; base: string; footer?: ReactNode; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <div>
        <Logo tone="light" />
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-cream/[0.07] px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-sky">
          <span className={cn("size-1.5 rounded-full", mode === "demo" ? "bg-sky" : "bg-sky")} />
          {mode === "demo" ? "Demonstração" : "Gestão"}
        </p>
      </div>
      <nav aria-label="Painel" className="flex-1">
        <Suspense fallback={<NavList base={base} pathname="" />}>
          <ActiveNavList base={base} onNavigate={onNavigate} />
        </Suspense>
      </nav>
      <div className="space-y-3 border-t border-cream/10 pt-5">
        <Link href="/" className="flex items-center gap-2 text-sm text-cream/60 hover:text-cream">
          <ExternalLink className="size-4" /> Ver site público
        </Link>
        {footer}
      </div>
    </div>
  );
}

/** AdminSidebar: fixa no desktop, gaveta no iPad retrato e no celular. */
export function AdminSidebar({ mode, footer }: { mode: DataMode; footer?: ReactNode }) {
  const base = mode === "live" ? "/admin" : "/demo";
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 bg-sidebar text-sidebar-foreground lg:block">
        <SidebarBody mode={mode} base={base} footer={footer} />
      </aside>

      <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-sidebar px-4 text-cream lg:hidden">
        <Logo tone="light" />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="flex size-11 items-center justify-center rounded-full bg-cream/10" aria-label="Abrir menu do painel">
            <Menu className="size-5" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-40 bg-navy/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <Dialog.Popup className="fixed inset-y-0 left-0 z-50 w-[min(20rem,86vw)] bg-sidebar text-cream transition-transform duration-300 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full">
              <Dialog.Title className="sr-only">Menu do painel</Dialog.Title>
              <Dialog.Close className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-cream/10" aria-label="Fechar">
                <X className="size-4" />
              </Dialog.Close>
              <SidebarBody mode={mode} base={base} footer={footer} onNavigate={() => setOpen(false)} />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}
