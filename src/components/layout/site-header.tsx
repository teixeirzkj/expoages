"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navItems, siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";
import { ActionButton } from "@/components/brand/action-button";
import { useScrollTo } from "@/components/motion/smooth-scroll";
import { cn } from "@/lib/utils";

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const ids = navItems.map((n) => n.id);
  const active = useActiveSection(ids);
  const firstLink = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // Aguarda o menu fechar antes de rolar (evita salto no iOS).
    window.setTimeout(() => scrollTo(`#${id}`), open ? 280 : 0);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[var(--ease-out-expo)]",
          scrolled ? "pt-3" : "pt-5",
        )}
      >
        <div className="container-editorial">
          <div
            className={cn(
              "flex h-[3.75rem] items-center justify-between gap-4 rounded-full pl-4 pr-2 transition-[background-color,box-shadow,backdrop-filter] duration-500",
              scrolled
                ? "bg-ivory/88 shadow-[0_1px_0_rgba(23,58,60,0.08),0_12px_40px_-24px_rgba(20,36,43,0.45)] backdrop-blur-md"
                : "bg-transparent",
            )}
          >
            <button type="button" onClick={() => go("inicio")} aria-label={`${siteConfig.platformName} — voltar ao início`} className="rounded-full">
              <Logo />
            </button>

            <nav aria-label="Navegação principal" className="hidden xl:block">
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
                          "relative rounded-full px-3.5 py-2 text-[0.9rem] font-medium transition-colors",
                          isActive ? "text-petrol" : "text-ink/60 hover:text-petrol",
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 -z-0 rounded-full bg-sage-2"
                            transition={{ type: "spring", stiffness: 380, damping: 34 }}
                          />
                        )}
                        <span className="relative">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <ActionButton
                size="sm"
                className="hidden h-11 px-5 sm:inline-flex"
                icon={<ArrowUpRight className="size-4" />}
                onClick={() => go("participar")}
              >
                Quero participar
              </ActionButton>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex size-11 items-center justify-center rounded-full bg-petrol text-ivory xl:hidden"
                aria-label="Abrir menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[70] flex flex-col bg-petrol text-ivory grain"
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="container-editorial flex h-[5.25rem] items-center justify-between pt-5">
              <Logo tone="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-full bg-ivory text-petrol"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="Navegação" className="container-editorial flex flex-1 flex-col justify-center">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button
                      ref={i === 0 ? firstLink : undefined}
                      type="button"
                      onClick={() => go(item.id)}
                      className="group flex w-full items-baseline gap-4 py-2 text-left"
                    >
                      <span className="w-6 text-xs tabular-nums text-sage">0{i + 1}</span>
                      <span className={cn("font-display text-[2.4rem] leading-tight sm:text-5xl", active === item.id ? "text-terracotta" : "")}>
                        {item.label}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="container-editorial pb-[max(2rem,env(safe-area-inset-bottom))]">
              <ActionButton variant="terracotta" size="lg" className="w-full" onClick={() => go("participar")} icon={<ArrowUpRight className="size-4" />}>
                Quero participar
              </ActionButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
