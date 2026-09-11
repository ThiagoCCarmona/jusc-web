import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identificador = (body.login || body.email || "").trim();
    const senha = body.senha || "";

    if (!identificador || !senha) {
      return NextResponse.json(
        { error: "Informe seu nome de usuário (login) e sua senha." },
        { status: 400 }
      );
    }

    // Busca por login (nome de usuário) ou e-mail
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { login: identificador.toLowerCase() },
          { email: identificador.toLowerCase() },
        ],
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos. Verifique suas credenciais." },
        { status: 401 }
      );
    }

    if (usuario.status !== "ATIVO") {
      return NextResponse.json(
        { error: "Sua conta está desativada. Fale com a coordenação." },
        { status: 403 }
      );
    }

    const senhaCorreta = await verifyPassword(senha, usuario.senhaHash);
    if (!senhaCorreta) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos. Verifique suas credenciais." },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: usuario.id,
      login: usuario.login,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil as "ADMIN" | "COLABORADOR",
      primeiroAcesso: usuario.primeiroAcesso,
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "LOGIN",
        detalhes: `Login realizado por @${usuario.login} (primeiroAcesso: ${usuario.primeiroAcesso})`,
      },
    }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        email: usuario.email,
        perfil: usuario.perfil,
        primeiroAcesso: usuario.primeiroAcesso,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar o login." },
      { status: 500 }
    );
  }
}
