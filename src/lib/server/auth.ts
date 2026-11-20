import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionClient } from "./supabase";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
}

/**
 * Data Access Layer de autenticação. Valida a sessão no servidor de Auth
 * (getUser, não apenas o cookie) e confirma que o usuário está em
 * admin_profiles. Retorna null quando não autorizado.
 * Memorizado por requisição (cache): layout, menu e tela não repetem a consulta.
 */
export const getAdmin = cache(async function getAdmin(): Promise<AdminUser | null> {
  const supabase = await createSessionClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("display_name")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!profile) return null;
  return { id: data.user.id, email: data.user.email ?? "", displayName: profile.display_name };
});

/** Uso em páginas e ações administrativas: redireciona se não autorizado. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export interface EmployeeUser {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Colaborador autenticado: sessão válida no Supabase Auth + perfil em
 * employee_profiles (lido com a própria sessão, sob RLS). Null se não for.
 */
export const getEmployeeUser = cache(async function getEmployeeUser(): Promise<EmployeeUser | null> {
  const supabase = await createSessionClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("employee_profiles")
    .select("full_name")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!profile) return null;
  return { id: data.user.id, email: data.user.email ?? "", fullName: profile.full_name };
});

export async function requireEmployee(): Promise<EmployeeUser> {
  const employee = await getEmployeeUser();
  if (!employee) redirect("/colaborador/entrar");
  return employee;
}
