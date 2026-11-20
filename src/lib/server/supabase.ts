import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/**
 * Cliente anônimo, sem sessão. Usado para os envios públicos (insert
 * permitido por RLS) e para a função de consulta por protocolo.
 */
export function createAnonClient() {
  const env = supabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * Cliente com a sessão do administrador (cookies httpOnly gerenciados pelo
 * @supabase/ssr). Todas as leituras administrativas passam por RLS.
 */
export async function createSessionClient() {
  const env = supabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Chamado durante a renderização de um Server Component: o proxy
          // se encarrega de renovar a sessão nesses casos.
        }
      },
    },
  });
}
