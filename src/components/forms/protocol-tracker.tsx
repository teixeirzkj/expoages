"use client";

import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, MessageSquareText, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { trackProtocol } from "@/app/actions/public";
import { SUBMISSION_STATUSES, type SubmissionStatus, type TrackResult } from "@/lib/domain";
import { formatDate, formatDateTime } from "@/lib/format";
import { ActionButton } from "@/components/brand/action-button";
import { cn } from "@/lib/utils";
import { TextInput } from "./fields";

const ORDER: SubmissionStatus[] = ["recebido", "em_analise", "acao_planejada", "concluido"];

export function ProtocolTracker({ initialProtocol = "" }: { initialProtocol?: string }) {
  const [value, setValue] = useState(initialProtocol);
  const [data, setData] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const apply = (res: Awaited<ReturnType<typeof trackProtocol>>) => {
    if (res.ok) {
      setData(res.data);
      setError(null);
    } else {
      setData(null);
      setError(res.error);
    }
  };

  const search = (protocol: string) => {
    startTransition(async () => apply(await trackProtocol(protocol)));
  };

  // Consulta automática quando o painel abre com um protocolo recém-gerado.
  useEffect(() => {
    if (!initialProtocol) return;
    let alive = true;
    trackProtocol(initialProtocol).then((res) => alive && apply(res));
    return () => {
      alive = false;
    };
  }, [initialProtocol]);

  const stepIndex = data ? ORDER.indexOf(data.status) : -1;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(value);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="track-protocol" className="sr-only">
          Protocolo
        </label>
        <TextInput
          id="track-protocol"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="HZ-XXXX-XXXX-XXXX-XXXX"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="font-mono tracking-wider"
          aria-invalid={!!error}
          aria-describedby={error ? "track-error" : undefined}
        />
        <ActionButton type="submit" size="lg" className="shrink-0" disabled={pending || value.trim().length < 10}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
          Consultar
        </ActionButton>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="err"
            id="track-error"
            role="alert"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
        {data && (
          <motion.div
            key={data.reference + data.status + data.responses.length}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 space-y-8"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-2xl text-navy">{data.label}</p>
              <p className="text-sm text-slate">Enviado em {formatDate(data.createdAt)}</p>
            </div>

            <ol className="grid grid-cols-4 gap-2" aria-label="Andamento">
              {ORDER.map((s, i) => (
                <li key={s} className="space-y-2" aria-current={i === stepIndex ? "step" : undefined}>
                  <span className={cn("block h-1.5 rounded-full", i <= stepIndex ? "bg-navy" : "bg-navy/12")} />
                  <span className={cn("block text-xs leading-tight", i <= stepIndex ? "font-semibold text-navy" : "text-slate")}>
                    {SUBMISSION_STATUSES[s]}
                  </span>
                </li>
              ))}
            </ol>

            <div>
              <p className="text-sm font-semibold text-ink">Devolutivas da gestão</p>
              {data.responses.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-navy/20 px-4 py-5 text-sm text-slate">
                  Ainda não há uma devolutiva registrada. Volte a consultar com o mesmo protocolo.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {data.responses.map((r, i) => (
                    <li key={i} className="rounded-xl bg-mist/70 p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold text-navy">
                        <MessageSquareText className="size-4" /> {formatDateTime(r.createdAt)}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-[0.95rem] text-ink">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
