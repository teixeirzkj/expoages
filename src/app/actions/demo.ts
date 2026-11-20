"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { DEMO_COOKIE, PRESENT_COOKIE } from "@/lib/demo/constants";
import { resetDemoState } from "@/lib/server/repository/demo";

const cookieOpts = { path: "/", sameSite: "lax" as const, maxAge: 60 * 60 * 12 };

/** Ativa/desativa o modo demonstração NESTE aparelho (envios vão para a memória demo). */
export async function setDemoMode(enabled: boolean) {
  const store = await cookies();
  if (enabled) store.set(DEMO_COOKIE, "1", cookieOpts);
  else store.delete(DEMO_COOKIE);
  refresh();
}

export async function setPresentationMode(enabled: boolean) {
  const store = await cookies();
  if (enabled) store.set(PRESENT_COOKIE, "1", cookieOpts);
  else store.delete(PRESENT_COOKIE);
  refresh();
}

/** Restaura os dados fictícios iniciais. Afeta apenas a memória demonstrativa. */
export async function resetDemo() {
  resetDemoState();
  refresh();
}
