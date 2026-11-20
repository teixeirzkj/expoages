"use client";

import { useSyncExternalStore } from "react";

/** Lê um cookie não sensível no cliente (sem afetar a renderização no servidor). */
export function useCookieFlag(name: string) {
  return useSyncExternalStore(
    (cb) => {
      const id = window.setInterval(cb, 1500);
      window.addEventListener("focus", cb);
      return () => {
        window.clearInterval(id);
        window.removeEventListener("focus", cb);
      };
    },
    () => document.cookie.split("; ").some((c) => c === `${name}=1`),
    () => false,
  );
}
