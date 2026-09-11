import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const encontros = await prisma.encontro.findMany({
      orderBy: { dataHora: "desc" },
      include: {
        criadoPor: { select: { id: true, nome: true } },
        presencas: {
          include: {
            integrante: { select: { id: true, nomeCompleto: true, apelido: true } },
          },
        },
      },
    });

    return NextResponse.json({ encontros });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao buscar encontros." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await requireAuth();
    const body = await req.json();

    const {
      dataHora,
      local,
      conduzidoPor,
      tema,
      presencasIntegrantes, // Array<{ integranteId: string, presente: boolean }>
      visitantes,          // Array<string>
    } = body;

    if (!dataHora || !local || !conduzidoPor) {
      return NextResponse.json(
        { error: "Informe a data/hora, local e quem conduziu o encontro." },
        { status: 400 }
      );
    }

    // Criar o encontro e registrar presenças
    const novoEncontro = await prisma.encontro.create({
      data: {
        dataHora: new Date(dataHora),
        local: local.trim(),
        conduzidoPor: conduzidoPor.trim(),
        tema: tema?.trim() || null,
        criadoPorId: usuario.id,
        presencas: {
          create: [
            ...(presencasIntegrantes || []).map((p: any) => ({
              integranteId: p.integranteId,
              presente: Boolean(p.presente),
            })),
            ...(visitantes || []).map((nomeVis: string) => ({
              nomeVisitante: nomeVis.trim(),
              presente: true,
            })),
          ],
        },
      },
      include: {
        presencas: true,
      },
    });

    // Se algum integrante que estava inativo ou com alerta compareceu, reativa automaticamente (Regra 9.1)
    const presentesIds = (presencasIntegrantes || [])
      .filter((p: any) => p.presente)
      .map((p: any) => p.integranteId);

    if (presentesIds.length > 0) {
      await prisma.integrante.updateMany({
        where: {
          id: { in: presentesIds },
          status: "INATIVO",
        },
        data: {
          status: "ATIVO",
          motivoInativacao: null,
        },
      });
    }

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "CRIAR_ENCONTRO",
        detalhes: `Registrou encontro "${novoEncontro.tema || 'Sem tema'}" com ${novoEncontro.presencas.length} registros de presença`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, encontro: novoEncontro });
  } catch (error: any) {
    console.error("Erro ao registrar encontro:", error);
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao registrar encontro." }, { status: 500 });
  }
}
