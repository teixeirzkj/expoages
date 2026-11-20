"use client";

import { useCallback, useRef, useTransition } from "react";

/**
 * Transição de envio que ignora cliques repetidos: a trava (ref) é ativada
 * de forma síncrona, antes mesmo de o estado `pending` chegar à tela.
 */
export function useSingleSubmit() {
  const [pending, start] = useTransition();
  const lock = useRef(false);
  const run = useCallback((fn: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    start(async () => {
      try {
        await fn();
      } finally {
        lock.current = false;
      }
    });
  }, []);
  return [pending, run] as const;
}
