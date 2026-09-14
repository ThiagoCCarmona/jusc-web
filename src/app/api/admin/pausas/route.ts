import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const pausas = await prisma.pausaEncontro.findMany({
      orderBy: { dataInicio: "desc" },
    });
    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });

    return NextResponse.json({
      pausas,
      encontrosPausados: Boolean(config?.encontrosPausados),
      pausadoEm: config?.pausadoEm,
      motivoPausa: config?.motivoPausa,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao buscar pausas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { acao, motivo } = body; // acao: "PAUSAR" | "RETOMAR"

    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });

    if (acao === "PAUSAR") {
      const motivoFormatado = motivo?.trim() || "Férias / Recesso pastoral";
      const agora = new Date();

      // Cria registro de pausa aberto (sem dataFim)
      await prisma.pausaEncontro.create({
        data: {
          dataInicio: agora,
          motivo: motivoFormatado,
          criadoPorId: admin.id,
        },
      });

      await prisma.configuracaoGeral.update({
        where: { id: 1 },
        data: {
          encontrosPausados: true,
          pausadoEm: agora,
          motivoPausa: motivoFormatado,
        },
      });

      await prisma.logAuditoria.create({
        data: {
          usuarioId: admin.id,
          acao: "PAUSAR_ENCONTROS",
          detalhes: `Encontros pausados por: "${motivoFormatado}". Ausências congeladas.`,
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, status: "PAUSADO" });
    } else if (acao === "RETOMAR") {
      const agora = new Date();

      // Fecha todas as pausas que estejam com dataFim nula
      await prisma.pausaEncontro.updateMany({
        where: { dataFim: null },
        data: { dataFim: agora },
      });

      await prisma.configuracaoGeral.update({
        where: { id: 1 },
        data: {
          encontrosPausados: false,
          pausadoEm: null,
          motivoPausa: null,
        },
      });

      await prisma.logAuditoria.create({
        data: {
          usuarioId: admin.id,
          acao: "RETOMAR_ENCONTROS",
          detalhes: "Encontros retomados. Contagem de ausência reativada.",
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, status: "ATIVO" });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito ao Administrador." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao processar pausa dos encontros." }, { status: 500 });
  }
}
