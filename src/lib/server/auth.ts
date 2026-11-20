import "server-only";
import { redirect } from "next/navigation";
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
 */
export async function getAdmin(): Promise<AdminUser | null> {
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
}

/** Uso em páginas e ações administrativas: redireciona se não autorizado. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
