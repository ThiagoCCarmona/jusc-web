import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const encontro = await prisma.encontro.findUnique({
      where: { id },
      include: {
        criadoPor: { select: { id: true, nome: true } },
        presencas: {
          include: {
            integrante: true,
          },
        },
      },
    });

    if (!encontro) {
      return NextResponse.json({ error: "Encontro não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ encontro });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao buscar detalhes do encontro." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await requireAuth();
    if (usuario.perfil !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar encontros." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { dataHora, local, conduzidoPor, tema, observacao, presencasIntegrantes, visitantes } = body;

    const encontroAtual = await prisma.encontro.findUnique({
      where: { id },
      include: { presencas: true },
    });

    if (!encontroAtual) {
      return NextResponse.json({ error: "Encontro não encontrado." }, { status: 404 });
    }

    // Se presencasIntegrantes ou visitantes foram fornecidos, atualiza presenças
    if (presencasIntegrantes !== undefined || visitantes !== undefined) {
      await prisma.presenca.deleteMany({
        where: { encontroId: id },
      });

      const novasPresencas = [
        ...(presencasIntegrantes || []).map((p: any) => ({
          encontroId: id,
          integranteId: p.integranteId,
          presente: Boolean(p.presente),
        })),
        ...(visitantes || []).map((nomeVis: string) => ({
          encontroId: id,
          nomeVisitante: nomeVis.trim(),
          presente: true,
        })),
      ];

      if (novasPresencas.length > 0) {
        await prisma.presenca.createMany({
          data: novasPresencas,
        });
      }
    }

    const encontroAtualizado = await prisma.encontro.update({
      where: { id },
      data: {
        dataHora: dataHora ? new Date(dataHora) : encontroAtual.dataHora,
        local: local ? local.trim() : encontroAtual.local,
        conduzidoPor: conduzidoPor ? conduzidoPor.trim() : encontroAtual.conduzidoPor,
        tema: tema !== undefined ? (tema ? tema.trim() : null) : encontroAtual.tema,
        observacao: observacao !== undefined ? (observacao ? observacao.trim() : null) : encontroAtual.observacao,
      },
      include: {
        presencas: {
          include: { integrante: true },
        },
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "EDITAR_ENCONTRO",
        detalhes: `Editou encontro ID "${id}" (${encontroAtualizado.tema || "Sem tema"})`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, encontro: encontroAtualizado });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao editar encontro." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await requireAuth();
    if (usuario.perfil !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir encontros." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const encontro = await prisma.encontro.findUnique({
      where: { id },
    });

    if (!encontro) {
      return NextResponse.json({ error: "Encontro não encontrado." }, { status: 404 });
    }

    // Exclui presenças vinculadas e depois o encontro
    await prisma.presenca.deleteMany({
      where: { encontroId: id },
    });

    await prisma.encontro.delete({
      where: { id },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "EXCLUIR_ENCONTRO",
        detalhes: `Excluiu encontro ID "${id}" (${encontro.tema || "Sem tema"}) realizado em ${encontro.dataHora.toISOString()}`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "Encontro excluído com sucesso." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao excluir encontro." }, { status: 500 });
  }
}
