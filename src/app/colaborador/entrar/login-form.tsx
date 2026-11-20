"use client";

import { LoaderCircle, LogIn } from "lucide-react";
import { useActionState } from "react";
import { signInEmployee, type LoginState } from "@/app/actions/auth";
import { inputBase } from "@/components/forms/fields";
import { cn } from "@/lib/utils";

export function EmployeeLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInEmployee, undefined);
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-[0.9375rem] font-semibold text-ink">E-mail</span>
        <input name="email" type="email" required autoComplete="username" className={cn(inputBase, "h-12")} />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.9375rem] font-semibold text-ink">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className={cn(inputBase, "h-12")} />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy font-semibold text-white transition-colors hover:bg-blue disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Consultar meus feedbacks
      </button>
    </form>
  );
}
