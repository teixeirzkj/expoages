"use client";

import { Menu, MessageSquareText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navItems, siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";
import { useParticipation } from "@/components/forms/participation";
import { scrollToTarget } from "@/components/motion/scroll-to";
import { cn } from "@/lib/utils";

/** Seção ativa via IntersectionObserver (sem listener de scroll). */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** Verdadeiro enquanto o topo da página (hero escuro) está sob o header. */
function useOverHero() {
  const [over, setOver] = useState(true);
  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    // A "raiz" é só a faixa do header (topo da janela, 64px de altura).
    const observer = new IntersectionObserver(([e]) => setOver(e.isIntersecting), {
      rootMargin: `0px 0px -${Math.max(0, window.innerHeight - 64)}px 0px`,
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return over;
}

const IDS = navItems.map((n) => n.id);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(IDS);
  const overHero = useOverHero();
  const { selectTab } = useParticipation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLButtonElement>(null);
  const dark = overHero && !open;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const button = menuButton.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // Espera o menu fechar (e liberar o scroll do body) antes de rolar.
    requestAnimationFrame(() => scrollToTarget(`#${id}`));
  };
  const toOuvidoria = () => {
    setOpen(false);
    requestAnimationFrame(() => selectTab("ouvidoria", { scroll: true }));
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b transition-colors duration-200",
        dark ? "surface-dark border-transparent bg-navy text-cream" : "border-navy/8 bg-cream text-navy",
      )}
    >
      <div className="container-editorial flex h-full items-center justify-between gap-4">
        <button type="button" onClick={() => go("inicio")} aria-label={`${siteConfig.platformName} — voltar ao início`} className="rounded-md">
          <Logo tone={dark ? "light" : "dark"} />
        </button>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative rounded-md px-3 py-2 text-[0.9375rem] font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:transition-transform after:duration-300",
                      dark ? "after:bg-sky" : "after:bg-navy",
                      isActive
                        ? cn(dark ? "text-white" : "text-navy", "after:scale-x-100")
                        : cn(dark ? "text-cream/70 hover:text-white" : "text-slate hover:text-navy", "after:scale-x-0"),
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toOuvidoria}
            className={cn(
              "hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:inline-flex",
              dark ? "bg-white text-navy hover:bg-sky" : "bg-navy text-white hover:bg-blue",
            )}
          >
            <MessageSquareText className="size-4" /> Ouvidoria
          </button>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full transition-colors lg:hidden",
              dark ? "bg-white/10 text-white" : "bg-navy text-white",
            )}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu do celular/tablet: painel simples logo abaixo do header */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-cream animate-panel-in lg:hidden"
      >
        <nav aria-label="Menu" className="container-editorial flex min-h-full flex-col py-4">
          <ul className="divide-y divide-navy/8">
            {navItems.map((item, i) => (
              <li key={item.id}>
                <button
                  ref={i === 0 ? firstLink : undefined}
                  type="button"
                  onClick={() => go(item.id)}
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className={cn("font-display text-xl font-semibold", active === item.id ? "text-navy" : "text-navy/75")}>
                    {item.label}
                  </span>
                  <span className="text-xs tabular-nums text-slate">0{i + 1}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={toOuvidoria}
            className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy text-[0.9375rem] font-semibold text-white"
          >
            <MessageSquareText className="size-4" /> Acessar a ouvidoria
          </button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </header>
  );
}
