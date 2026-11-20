"use client";

import { CircleCheck, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { acknowledgeReview, markReviewViewed } from "@/app/actions/reviews";
import type { DataMode } from "@/lib/domain";
import { formatDateTime } from "@/lib/format";

/** Registra a primeira abertura do relatório (uma vez por montagem). */
export function ViewTracker({ mode, reviewId, demoEmployee }: { mode: DataMode; reviewId: string; demoEmployee?: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void markReviewViewed(mode, reviewId, demoEmployee);
  }, [mode, reviewId, demoEmployee]);
  return null;
}

/** "Marcar como lido": registra ciência — não significa concordância. */
export function AcknowledgeButton({
  mode,
  reviewId,
  demoEmployee,
  acknowledgedAt,
}: {
  mode: DataMode;
  reviewId: string;
  demoEmployee?: string;
  acknowledgedAt: string | null;
}) {
  const [pending, start] = useTransition();
  const [doneAt, setDoneAt] = useState(acknowledgedAt);

  if (doneAt) {
    return (
      <p className="flex items-center gap-2 text-[0.9375rem] font-medium text-navy">
        <CircleCheck className="size-5 shrink-0 text-[#1b6447]" aria-hidden />
        Leitura registrada em {formatDateTime(doneAt)}.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await acknowledgeReview(mode, reviewId, demoEmployee);
          if (res.ok) {
            setDoneAt(new Date().toISOString());
            toast.success("Leitura registrada");
          } else toast.error(res.error);
        })
      }
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-navy px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-blue disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <CircleCheck className="size-4" />}
      Marcar como lido
    </button>
  );
}
