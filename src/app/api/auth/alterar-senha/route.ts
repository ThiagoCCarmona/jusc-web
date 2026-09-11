import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }

    const { novaSenha, confirmacaoSenha } = await req.json();

    if (!novaSenha || novaSenha.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    if (novaSenha !== confirmacaoSenha) {
      return NextResponse.json(
        { error: "A confirmação de senha não coincide com a nova senha digitada." },
        { status: 400 }
      );
    }

    const senhaHash = await hashPassword(novaSenha);

    const atualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senhaHash,
        primeiroAcesso: false, // Marca primeiro acesso como concluído
      },
    });

    // Atualiza o token na sessão
    const novoToken = signToken({
      userId: atualizado.id,
      login: atualizado.login,
      email: atualizado.email,
      nome: atualizado.nome,
      perfil: atualizado.perfil as "ADMIN" | "COLABORADOR",
      primeiroAcesso: false,
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: atualizado.id,
        acao: "ALTERAR_SENHA",
        detalhes: "Alterou sua senha de acesso com sucesso (primeiro acesso concluído).",
      },
    }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso!",
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: novoToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar a senha." },
      { status: 500 }
    );
  }
}
