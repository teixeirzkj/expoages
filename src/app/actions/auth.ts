"use server";

import { redirect } from "next/navigation";
import { getAdmin, getEmployeeUser } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { createSessionClient } from "@/lib/server/supabase";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: string } | undefined;

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Informe e-mail e senha válidos." };

  if (!(await checkRateLimit("login", 8, 15 * 60_000))) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const supabase = await createSessionClient();
  if (!supabase) return { error: "Autenticação indisponível: o Supabase ainda não foi configurado." };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Mensagem única para não revelar se o e-mail existe.
  if (error) return { error: "E-mail ou senha incorretos." };

  const admin = await getAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem permissão de administração." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Login do colaborador (área "Meu Feedback"). Mesmas regras do login da gestão. */
export async function signInEmployee(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Informe e-mail e senha válidos." };

  if (!(await checkRateLimit("login-employee", 8, 15 * 60_000))) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const supabase = await createSessionClient();
  if (!supabase) return { error: "Acesso indisponível: o Supabase ainda não foi configurado. Use a demonstração." };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "E-mail ou senha incorretos." };

  const employee = await getEmployeeUser();
  if (!employee) {
    await supabase.auth.signOut();
    return { error: "Esta conta ainda não está vinculada a um perfil de colaborador. Procure a gestão." };
  }
  redirect("/colaborador");
}

export async function signOutEmployee() {
  const supabase = await createSessionClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/colaborador/entrar");
}
