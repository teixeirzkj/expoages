"use client";

import { useEffect, useRef, useState } from "react";

/** Metadados anti-abuso: instante de abertura do formulário e honeypot. */
export function useAntiAbuse() {
  const startedAt = useRef(0);
  const [website, setWebsite] = useState("");
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  return {
    website,
    setWebsite,
    meta: () => ({ startedAt: startedAt.current || Date.now(), website }),
    reset: () => {
      startedAt.current = Date.now();
      setWebsite("");
    },
  };
}
