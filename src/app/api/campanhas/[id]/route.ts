import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTesoureiroOrAdmin } from "@/lib/auth";
import { normalizarModelos } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campanha = await prisma.campanhaCamiseta.findUnique({
      where: { id },
      include: {
        pedidos: {
          orderBy: { criadoEm: "desc" },
        },
      },
    });

    if (!campanha) {
      return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
    }

    const modelosParsed = JSON.parse(campanha.modelos || "[]");

    return NextResponse.json({
      campanha: {
        ...campanha,
        fotos: JSON.parse(campanha.fotos || "[]"),
        modelos: normalizarModelos(modelosParsed, campanha.precoUnitario),
        tamanhosDisponiveis: JSON.parse(campanha.tamanhosDisponiveis || "[]"),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao buscar campanha." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuarioAuth = await requireTesoureiroOrAdmin();
    const { id } = await params;
    const body = await req.json();

    const dataUpdate: any = {};
    if (body.titulo !== undefined) dataUpdate.titulo = body.titulo.trim();
    if (body.descricao !== undefined) dataUpdate.descricao = body.descricao?.trim() || null;
    if (body.precoUnitario !== undefined) dataUpdate.precoUnitario = parseFloat(body.precoUnitario);
    if (body.permiteNome !== undefined) dataUpdate.permiteNome = Boolean(body.permiteNome);
    if (body.permiteNumero !== undefined) dataUpdate.permiteNumero = Boolean(body.permiteNumero);
    if (body.dataFim !== undefined) dataUpdate.dataFim = new Date(body.dataFim);
    if (body.ativa !== undefined) dataUpdate.ativa = Boolean(body.ativa);
    if (Array.isArray(body.fotos)) dataUpdate.fotos = JSON.stringify(body.fotos);
    if (body.modelos !== undefined) {
      const precoRef = dataUpdate.precoUnitario !== undefined ? dataUpdate.precoUnitario : 0;
      dataUpdate.modelos = JSON.stringify(normalizarModelos(body.modelos, precoRef));
    }
    if (Array.isArray(body.tamanhosDisponiveis)) dataUpdate.tamanhosDisponiveis = JSON.stringify(body.tamanhosDisponiveis);

    const campanha = await prisma.campanhaCamiseta.update({
      where: { id },
      data: dataUpdate,
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuarioAuth.id,
        acao: "EDITAR_CAMPANHA_CAMISETA",
        detalhes: `Atualizou a campanha de camiseta "${campanha.titulo}"`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, campanha });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito a Administradores e Tesoureiros." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao atualizar campanha." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuarioAuth = await requireTesoureiroOrAdmin();
    const { id } = await params;

    const campanha = await prisma.campanhaCamiseta.delete({ where: { id } });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuarioAuth.id,
        acao: "EXCLUIR_CAMPANHA_CAMISETA",
        detalhes: `Excluiu a campanha de camiseta "${campanha.titulo}"`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito a Administradores e Tesoureiros." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao excluir campanha." }, { status: 500 });
  }
}

