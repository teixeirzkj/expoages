import "server-only";

/**
 * Variáveis de ambiente lidas SOMENTE no servidor. Nenhuma chave do Supabase
 * é enviada ao navegador: todas as operações passam por Server Actions e
 * Route Handlers. A chave publicável (anon) é suficiente porque a segurança é
 * garantida por RLS; a service role key NÃO é usada pela aplicação.
 */
export function supabaseEnv() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY)?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export const isSupabaseConfigured = () => supabaseEnv() !== null;
