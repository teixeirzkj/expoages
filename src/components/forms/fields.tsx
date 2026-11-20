"use client";

import { TriangleAlert } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Bloco de campo: rótulo + (ajuda) + controle + erro.
 * `hintBelow` coloca a ajuda abaixo do controle, para que campos lado a lado
 * comecem exatamente na mesma altura.
 */
export function FieldShell({
  label,
  hint,
  hintBelow = false,
  error,
  optional,
  htmlFor,
  children,
  as = "div",
}: {
  label: string;
  hint?: ReactNode;
  hintBelow?: boolean;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  children: ReactNode;
  as?: "div" | "fieldset";
}) {
  const Tag = as;
  const LabelTag = as === "fieldset" ? "legend" : "label";
  const hintEl = hint ? <p className="text-sm leading-snug text-slate">{hint}</p> : null;
  return (
    <Tag className="flex min-w-0 flex-col gap-2">
      <LabelTag
        {...(LabelTag === "label" ? { htmlFor } : {})}
        className="flex w-full items-baseline justify-between gap-3 text-[0.9375rem] font-semibold leading-snug text-ink"
      >
        <span>{label}</span>
        {optional && <span className="text-[0.8125rem] font-medium text-slate">Opcional</span>}
      </LabelTag>
      {!hintBelow && hintEl}
      {children}
      {hintBelow && hintEl}
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </Tag>
  );
}

/** Cartões de opção (radio nativo): mesma altura, borda azul e fundo suave quando selecionados. */
export function ChoiceGroup<T extends string>({
  name,
  options,
  value,
  onChange,
  columns = "auto",
}: {
  name: string;
  options: { value: T; label: string; description?: string }[];
  value: T | "";
  onChange: (v: T) => void;
  columns?: "auto" | "2";
}) {
  return (
    <div className={cn("grid auto-rows-fr gap-2.5", columns === "2" ? "sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "relative flex h-full min-h-14 cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-3.5 transition-[border-color,background-color,box-shadow] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue",
              checked ? "border-blue bg-selected shadow-[inset_0_0_0_1px_var(--brand-blue)]" : "border-navy/15 hover:border-navy/40",
            )}
          >
            <input type="radio" name={name} value={opt.value} checked={checked} onChange={() => onChange(opt.value)} className="sr-only" />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
                checked ? "border-navy" : "border-navy/30",
              )}
            >
              <span className={cn("size-2.5 rounded-full bg-navy transition-transform duration-150", checked ? "scale-100" : "scale-0")} />
            </span>
            <span className="min-w-0 leading-snug">
              <span className="block text-[0.9375rem] font-semibold text-navy">{opt.label}</span>
              {opt.description && <span className="mt-0.5 block text-sm text-slate">{opt.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Grupo segmentado (radio nativo) com a mesma altura dos inputs. */
export function SegmentedChoice<T extends string>({
  name,
  options,
  value,
  onChange,
  className,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-sm font-medium leading-tight sm:text-[0.9375rem] transition-[border-color,background-color,color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue",
              checked ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-ink hover:border-navy/40",
            )}
          >
            <input type="radio" name={name} value={opt.value} checked={checked} onChange={() => onChange(opt.value)} className="sr-only" />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

/** Escala 1–5 em botões grandes, com rótulos nas extremidades. */
export function ScaleInput({
  name,
  value,
  onChange,
  labels,
  allowClear = true,
}: {
  name: string;
  value: number | null;
  onChange: (v: number | null) => void;
  labels: [string, string];
  allowClear?: boolean;
}) {
  return (
    <div>
      <div role="radiogroup" aria-label={name} className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const checked = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${n} de 5`}
              onClick={() => onChange(checked && allowClear ? null : n)}
              className={cn(
                "h-12 rounded-xl border text-lg font-semibold tabular-nums transition-[background-color,border-color,color,transform] duration-150 active:scale-95",
                checked ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy hover:border-navy/40",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[0.8125rem] text-slate">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  );
}

export const inputBase =
  "w-full rounded-xl border border-navy/15 bg-white px-4 text-base text-ink placeholder:text-slate/70 transition-[border-color,box-shadow] duration-150 hover:border-navy/30 focus:border-navy focus:outline-none focus:ring-4 focus:ring-blue/15 aria-invalid:border-destructive";

export function TextInput(props: React.ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={cn(inputBase, "h-12", props.className)} />;
}

export function SelectInput(props: React.ComponentPropsWithoutRef<"select">) {
  return <select {...props} className={cn(inputBase, "h-12 pr-10", props.className)} />;
}

export function TextArea({
  value,
  maxLength,
  ...props
}: React.ComponentPropsWithoutRef<"textarea"> & { value: string; maxLength: number }) {
  const id = useId();
  const near = value.length > maxLength * 0.9;
  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        maxLength={maxLength}
        aria-describedby={`${id}-count`}
        className={cn(inputBase, "min-h-40 resize-y py-4 leading-relaxed", props.className)}
      />
      <span id={`${id}-count`} className={cn("pointer-events-none absolute bottom-3 right-4 text-xs tabular-nums", near ? "text-destructive" : "text-slate")}>
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

/** Sugestões rápidas que preenchem um campo de texto. */
export function SuggestionChips({ items, onPick, current }: { items: readonly string[]; onPick: (v: string) => void; current: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPick(t)}
          className={cn(
            "rounded-full border px-3.5 py-2 text-sm transition-colors",
            current === t ? "border-blue bg-selected text-navy" : "border-navy/15 text-ink/80 hover:border-navy/40",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

const PII_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i, label: "um e-mail" },
  { re: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/, label: "um CPF" },
  { re: /(\(?\b\d{2}\)?\s?)?\b9?\d{4}[-\s]?\d{4}\b/, label: "um telefone" },
];

/** Aviso gentil quando o texto parece conter dados pessoais. Nada é bloqueado. */
export function PrivacyHint({ text }: { text: string }) {
  const found = PII_PATTERNS.find((p) => p.re.test(text));
  if (!found) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl bg-mist px-3.5 py-3 text-sm text-ink">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-blue" />
      Parece que o texto contém {found.label}. Para proteger sua privacidade e a de outras pessoas, considere removê-lo.
    </p>
  );
}

/** Campo-armadilha para robôs: invisível para pessoas e leitores de tela. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} name="website" />
      </label>
    </div>
  );
}
