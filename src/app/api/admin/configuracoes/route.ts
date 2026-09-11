import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar configurações." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const config = await prisma.configuracaoGeral.upsert({
      where: { id: 1 },
      update: {
        coordenadorNome: body.coordenadorNome,
        coordenadorFotoUrl: body.coordenadorFotoUrl,
        coordenadorWhatsapp: body.coordenadorWhatsapp,
        coordenadorMensagem: body.coordenadorMensagem,

        secretarioNome: body.secretarioNome,
        secretarioFotoUrl: body.secretarioFotoUrl,
        secretarioWhatsapp: body.secretarioWhatsapp,
        secretarioMensagem: body.secretarioMensagem,

        enderecoPadrao: body.enderecoPadrao,
        horarioPadrao: body.horarioPadrao,
        linkGoogleMaps: body.linkGoogleMaps,
        instagramUrl: body.instagramUrl,

        limiteMesesAlertaAusencia: Number(body.limiteMesesAlertaAusencia) || 3,
        limiteMesesInativacao: Number(body.limiteMesesInativacao) || 12,
      },
      create: {
        id: 1,
        coordenadorNome: body.coordenadorNome,
        coordenadorFotoUrl: body.coordenadorFotoUrl,
        coordenadorWhatsapp: body.coordenadorWhatsapp,
        coordenadorMensagem: body.coordenadorMensagem,

        secretarioNome: body.secretarioNome,
        secretarioFotoUrl: body.secretarioFotoUrl,
        secretarioWhatsapp: body.secretarioWhatsapp,
        secretarioMensagem: body.secretarioMensagem,

        enderecoPadrao: body.enderecoPadrao,
        horarioPadrao: body.horarioPadrao,
        linkGoogleMaps: body.linkGoogleMaps,
        instagramUrl: body.instagramUrl,

        limiteMesesAlertaAusencia: Number(body.limiteMesesAlertaAusencia) || 3,
        limiteMesesInativacao: Number(body.limiteMesesInativacao) || 12,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: admin.id,
        acao: "EDITAR_CONFIGURACOES",
        detalhes: "Atualizou configurações gerais do JUSC",
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao salvar configurações." }, { status: 500 });
  }
}
