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
      dataUpdate.senhaHash = await hashPassword(novaSenha);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dataUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: adminLogado.id,
        acao: "EDITAR_USUARIO",
        detalhes: `Atualizou usuário ${usuarioAtualizado.email} (Status: ${usuarioAtualizado.status})`,
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
