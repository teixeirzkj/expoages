"use client";

import { TriangleAlert } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldShell({
  label,
  hint,
  error,
  optional,
  htmlFor,
  children,
  as = "div",
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  children: ReactNode;
  as?: "div" | "fieldset";
}) {
  const Tag = as;
  const LabelTag = as === "fieldset" ? "legend" : "label";
  return (
    <Tag className="min-w-0 space-y-3">
      <LabelTag {...(LabelTag === "label" ? { htmlFor } : {})} className="flex items-baseline justify-between gap-3 text-[0.95rem] font-semibold text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-medium text-ink/45">Opcional</span>}
      </LabelTag>
      {hint && <p className="-mt-1.5 text-sm text-ink/55">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </Tag>
  );
}

/** Grupo de opções em "chips" grandes, navegável por teclado (radio nativo). */
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
    <div className={cn("grid gap-2.5", columns === "2" ? "sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "relative flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[0.95rem] transition-[border-color,background-color,color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue",
              checked ? "border-navy bg-navy text-cream" : "border-navy/15 bg-card hover:border-navy/40",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                checked ? "border-cream" : "border-navy/30",
              )}
            >
              <span className={cn("size-2.5 rounded-full transition-transform", checked ? "scale-100 bg-sky" : "scale-0")} />
            </span>
            <span className="leading-snug">
              <span className="font-medium">{opt.label}</span>
              {opt.description && (
                <span className={cn("block text-xs", checked ? "text-cream/70" : "text-ink/50")}>{opt.description}</span>
              )}
            </span>
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
                "h-12 rounded-xl border text-lg font-semibold tabular-nums transition-[background-color,border-color,color,transform] duration-200 active:scale-95",
                checked ? "border-navy bg-navy text-cream" : "border-navy/15 bg-card text-navy hover:border-navy/40",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink/50">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-navy/15 bg-card px-4 text-base text-ink placeholder:text-ink/35 transition-[border-color,box-shadow] focus:border-navy focus:outline-none focus:ring-4 focus:ring-blue/15 aria-invalid:border-destructive";

export function TextInput(props: React.ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={cn(inputBase, "h-12", props.className)} />;
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
      <span id={`${id}-count`} className={cn("pointer-events-none absolute bottom-3 right-4 text-xs tabular-nums", near ? "text-destructive" : "text-ink/40")}>
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
            current === t ? "border-blue bg-mist text-ink" : "border-navy/15 text-ink/70 hover:border-navy/40",
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
    <p className="flex items-start gap-2 rounded-xl bg-mist px-3.5 py-3 text-sm text-ink/80">
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
