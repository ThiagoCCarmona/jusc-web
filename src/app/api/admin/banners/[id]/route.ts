import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(body.ativo !== undefined && { ativo: Boolean(body.ativo) }),
        ...(body.titulo && { titulo: body.titulo.trim() }),
        ...(body.resumo && { resumo: body.resumo.trim() }),
        ...(body.descricaoCompleta && { descricaoCompleta: body.descricaoCompleta.trim() }),
        ...(body.dataExpiracao && { dataExpiracao: new Date(body.dataExpiracao) }),
        ...(body.imagemUrl !== undefined && { imagemUrl: body.imagemUrl }),
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: admin.id,
        acao: "EDITAR_BANNER",
        detalhes: `Atualizou banner: "${banner.titulo}" (Ativo: ${banner.ativo})`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao atualizar banner." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const banner = await prisma.banner.delete({ where: { id } });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: admin.id,
        acao: "EXCLUIR_BANNER",
        detalhes: `Excluiu o banner: "${banner.titulo}"`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao excluir banner." }, { status: 500 });
  }
}
