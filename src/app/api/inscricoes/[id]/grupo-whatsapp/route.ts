import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/inscricoes/[id]/grupo-whatsapp
// Rota pública acionada quando o participante clica no botão para entrar no grupo oficial
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID da inscrição inválido." }, { status: 400 });
    }

    const inscricao = await prisma.inscricaoEvento.update({
      where: { id },
      data: {
        entrouNoGrupoWhatsapp: true,
        clicouGrupoEm: new Date(),
      },
    });

    return NextResponse.json({ ok: true, inscricaoId: inscricao.id });
  } catch (error: any) {
    console.error("Erro ao registrar entrada no grupo de whatsapp:", error);
    return NextResponse.json(
      { error: "Erro ao registrar status do grupo de WhatsApp." },
      { status: 500 }
    );
  }
}
