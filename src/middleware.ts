import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jusc_auth_token")?.value;

  // Rotas restritas que exigem login
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Se o usuário tenta ir para /login e já tem token válido, o login pode continuar acessível para trocar de usuário ou reautenticar
  // (Removido o bloqueio cego para evitar loops quando o cookie antigo existe no navegador)

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
