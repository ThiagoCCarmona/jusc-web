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
