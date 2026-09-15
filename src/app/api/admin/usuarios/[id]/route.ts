import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminLogado = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const { status, perfil, novaSenha, nome } = body;

    const dataUpdate: any = {};
    if (status) dataUpdate.status = status;
    if (perfil) dataUpdate.perfil = perfil;
    if (nome) dataUpdate.nome = nome.trim();
    if (novaSenha) {
      if (typeof novaSenha !== "string" || novaSenha.trim().length < 6) {
        return NextResponse.json(
          { error: "A nova senha deve ter no mínimo 6 caracteres." },
          { status: 400 }
        );
      }
      dataUpdate.senhaHash = await hashPassword(novaSenha.trim());
      dataUpdate.primeiroAcesso = true;
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dataUpdate,
      select: {
        id: true,
        nome: true,
        login: true,
        email: true,
        perfil: true,
        status: true,
        primeiroAcesso: true,
      },
    });

    const acaoAuditoria = novaSenha ? "REDEFINIR_SENHA_USUARIO" : "EDITAR_USUARIO";
    const detalheAuditoria = novaSenha
      ? `Redefiniu a senha do usuário ${usuarioAtualizado.nome} (@${usuarioAtualizado.login})`
      : `Atualizou usuário ${usuarioAtualizado.nome} (Status: ${usuarioAtualizado.status})`;

    await prisma.logAuditoria.create({
      data: {
        usuarioId: adminLogado.id,
        acao: acaoAuditoria,
        detalhes: detalheAuditoria,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, usuario: usuarioAtualizado });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminLogado = await requireAdmin();
    const { id } = await params;

    if (id === adminLogado.id) {
      return NextResponse.json(
        { error: "Você não pode excluir seu próprio usuário." },
        { status: 400 }
      );
    }

    const usuarioAlvo = await prisma.usuario.findUnique({ where: { id } });
    if (!usuarioAlvo) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Reatribuir referências de FK para o admin logado para evitar violação de integridade referencial
    await prisma.$transaction([
      prisma.integrante.updateMany({
        where: { cadastradoPorId: id },
        data: { cadastradoPorId: adminLogado.id },
      }),
      prisma.encontro.updateMany({
        where: { criadoPorId: id },
        data: { criadoPorId: adminLogado.id },
      }),
      prisma.banner.updateMany({
        where: { criadoPorId: id },
        data: { criadoPorId: adminLogado.id },
      }),
      prisma.logAuditoria.updateMany({
        where: { usuarioId: id },
        data: { usuarioId: adminLogado.id },
      }),
      prisma.usuario.delete({
        where: { id },
      }),
    ]);

    await prisma.logAuditoria.create({
      data: {
        usuarioId: adminLogado.id,
        acao: "EXCLUIR_USUARIO",
        detalhes: `Excluiu o usuário "${usuarioAlvo.nome}" (@${usuarioAlvo.login})`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "Usuário excluído com sucesso." });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: "Erro ao excluir usuário." }, { status: 500 });
  }
}
