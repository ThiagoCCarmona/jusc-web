import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  processarAniversariantesNascimento,
  processarAniversariantesGrupo,
} from "@/lib/rules";

export async function GET() {
  try {
    await requireAuth();

    const integrantes = await prisma.integrante.findMany({
      where: { status: "ATIVO" },
      orderBy: { nomeCompleto: "asc" },
    });

    const nascimento = processarAniversariantesNascimento(integrantes);
    const grupo = processarAniversariantesGrupo(integrantes);

    return NextResponse.json({ nascimento, grupo });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao buscar aniversariantes." }, { status: 500 });
  }
}
