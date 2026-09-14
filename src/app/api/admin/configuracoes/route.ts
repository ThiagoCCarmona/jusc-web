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
        // Branding e Replicação
        nomeGrupo: body.nomeGrupo || "JUSC",
        subtituloGrupo: body.subtituloGrupo || "Jovens Unidos Seguindo Cristo",
        paroquiaNome: body.paroquiaNome || "Paróquia Menino Jesus",
        logoUrl: body.logoUrl !== undefined ? body.logoUrl : "/assets/logo-jusc.jpeg",
        mascoteUrl: body.mascoteUrl !== undefined ? body.mascoteUrl : null,
        corBase: body.corBase || "#FFC72C",
        corSecundaria: body.corSecundaria !== undefined ? body.corSecundaria : "#d97706",
        corDestaque: body.corDestaque !== undefined ? body.corDestaque : "#f59e0b",
        descricaoGrupo: body.descricaoGrupo,

        // Liderança
        coordenadorNome: body.coordenadorNome,
        coordenadorFotoUrl: body.coordenadorFotoUrl,
        coordenadorWhatsapp: body.coordenadorWhatsapp,
        coordenadorMensagem: body.coordenadorMensagem,

        secretarioNome: body.secretarioNome,
        secretarioFotoUrl: body.secretarioFotoUrl,
        secretarioWhatsapp: body.secretarioWhatsapp,
        secretarioMensagem: body.secretarioMensagem,

        // Tesouraria e Pix
        tesoureiroNome: body.tesoureiroNome || "Tesoureiro",
        tesoureiroWhatsapp: body.tesoureiroWhatsapp || "",
        tesoureiroChavePix: body.tesoureiroChavePix || "",
        tesoureiroTipoChave: body.tesoureiroTipoChave || "ALEATORIA",
        tesoureiroCidadePix: body.tesoureiroCidadePix || "Foz do Iguacu",

        // Local e Redes
        enderecoPadrao: body.enderecoPadrao,
        horarioPadrao: body.horarioPadrao,
        linkGoogleMaps: body.linkGoogleMaps,
        instagramUrl: body.instagramUrl,

        // Pausa de encontros
        encontrosPausados: body.encontrosPausados !== undefined ? Boolean(body.encontrosPausados) : undefined,
        pausadoEm: body.pausadoEm !== undefined ? (body.pausadoEm ? new Date(body.pausadoEm) : null) : undefined,
        motivoPausa: body.motivoPausa !== undefined ? body.motivoPausa : undefined,

        limiteMesesAlertaAusencia: Math.max(2, Number(body.limiteMesesAlertaAusencia) || 2),
        limiteMesesInativacao: Math.max(3, Number(body.limiteMesesInativacao) || 12),
      },
      create: {
        id: 1,
        nomeGrupo: body.nomeGrupo || "JUSC",
        subtituloGrupo: body.subtituloGrupo || "Jovens Unidos Seguindo Cristo",
        paroquiaNome: body.paroquiaNome || "Paróquia Menino Jesus",
        logoUrl: body.logoUrl || "/assets/logo-jusc.jpeg",
        mascoteUrl: body.mascoteUrl || null,
        corBase: body.corBase || "#FFC72C",
        corSecundaria: body.corSecundaria || "#d97706",
        corDestaque: body.corDestaque || "#f59e0b",
        descricaoGrupo: body.descricaoGrupo,

        coordenadorNome: body.coordenadorNome || "Brunão",
        coordenadorFotoUrl: body.coordenadorFotoUrl || "/assets/coordenador.jpg",
        coordenadorWhatsapp: body.coordenadorWhatsapp || "5545999068852",
        coordenadorMensagem: body.coordenadorMensagem || "Oii, vim pelo site e queria saber mais sobre o JUSCÃO",

        secretarioNome: body.secretarioNome || "Foletto",
        secretarioFotoUrl: body.secretarioFotoUrl || "/assets/secretario.jpg",
        secretarioWhatsapp: body.secretarioWhatsapp || "5545991179727",
        secretarioMensagem: body.secretarioMensagem || "Oii, vim pelo site e queria marcar um encontro no JUSC",

        tesoureiroNome: body.tesoureiroNome || "Tesoureiro",
        tesoureiroWhatsapp: body.tesoureiroWhatsapp || "",
        tesoureiroChavePix: body.tesoureiroChavePix || "",
        tesoureiroTipoChave: body.tesoureiroTipoChave || "ALEATORIA",
        tesoureiroCidadePix: body.tesoureiroCidadePix || "Foz do Iguacu",

        enderecoPadrao: body.enderecoPadrao || "Salinha do JUSC — Paróquia Menino Jesus",
        horarioPadrao: body.horarioPadrao || "Domingos às 17h",
        linkGoogleMaps: body.linkGoogleMaps || "",
        instagramUrl: body.instagramUrl || "",

        encontrosPausados: Boolean(body.encontrosPausados),
        pausadoEm: body.pausadoEm ? new Date(body.pausadoEm) : null,
        motivoPausa: body.motivoPausa || null,

        limiteMesesAlertaAusencia: Math.max(2, Number(body.limiteMesesAlertaAusencia) || 2),
        limiteMesesInativacao: Math.max(3, Number(body.limiteMesesInativacao) || 12),
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
