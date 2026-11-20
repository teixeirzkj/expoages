"use client";

import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DisclosureItem {
  title: ReactNode;
  content: ReactNode;
}

/** Lista expansível acessível (Base UI Accordion), usada para conteúdo complementar. */
export function Disclosure({
  items,
  className,
  tone = "light",
  size = "md",
}: {
  items: DisclosureItem[];
  className?: string;
  tone?: "light" | "dark";
  size?: "md" | "lg";
}) {
  const dark = tone === "dark";
  return (
    <Accordion.Root className={cn("border-t", dark ? "border-white/12" : "border-navy/12", className)}>
      {items.map((item, i) => (
        <Accordion.Item key={i} value={i} className={cn("border-b", dark ? "border-white/12" : "border-navy/12")}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-5 py-4 text-left md:py-5">
              <span
                className={cn(
                  "font-display font-semibold leading-snug",
                  size === "lg" ? "text-[1.0625rem] md:text-[1.1875rem]" : "text-base md:text-[1.0625rem]",
                  dark ? "text-white" : "text-navy",
                )}
              >
                {item.title}
              </span>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,color] duration-300 group-data-[panel-open]:rotate-45",
                  dark
                    ? "border-white/20 text-cream group-data-[panel-open]:bg-white group-data-[panel-open]:text-navy"
                    : "border-navy/20 text-navy group-data-[panel-open]:bg-navy group-data-[panel-open]:text-white",
                )}
              >
                <Plus className="size-4" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-300 ease-[var(--ease-out-quart)] data-[ending-style]:h-0 data-[starting-style]:h-0">
            <div className={cn("pb-5 pr-2 md:pr-12", dark ? "text-cream/75" : "text-slate")}>{item.content}</div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
