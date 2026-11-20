import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renova a sessão do Supabase nas rotas da gestão e do colaborador e faz um
 * redirecionamento otimista para o login. A autorização definitiva acontece
 * no servidor (requireAdmin) e no banco (RLS) — o proxy não é a barreira.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isEmployeeArea = path.startsWith("/colaborador");
  const loginPath = isEmployeeArea ? "/colaborador/entrar" : "/admin/login";
  const isLogin = path.startsWith(loginPath);
  // A demonstração do colaborador usa apenas dados fictícios e não exige conta.
  if (path.startsWith("/colaborador/demo")) return NextResponse.next();
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getClaims valida o JWT localmente (chaves assimétricas) e renova a sessão quando preciso,
  // sem ida ao servidor de Auth a cada página. A autorização real continua no servidor + RLS.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && !isLogin) {
    const login = request.nextUrl.clone();
    login.pathname = loginPath;
    login.search = "";
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/colaborador/:path*"],
};
