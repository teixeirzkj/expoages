"use client";

import { LoaderCircle, LogIn } from "lucide-react";
import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/actions/auth";

const field =
  "h-13 w-full rounded-2xl border border-petrol/15 bg-card px-4 text-base focus:border-petrol focus:outline-none focus:ring-4 focus:ring-terracotta/20";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, undefined);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">E-mail</span>
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-petrol font-semibold text-ivory transition-colors hover:bg-charcoal disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Entrar
      </button>
    </form>
  );
}
