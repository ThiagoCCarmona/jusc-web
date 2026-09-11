import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { calcularStatusPorAusencia } from "@/lib/rules";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const integrante = await prisma.integrante.findUnique({
      where: { id },
      include: {
        cadastradoPor: { select: { id: true, nome: true, email: true } },
        presencas: {
          include: {
            encontro: true,
          },
          orderBy: { encontro: { dataHora: "desc" } },
        },
      },
    });

    if (!integrante) {
      return NextResponse.json({ error: "Integrante não encontrado." }, { status: 404 });
    }

    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    const limiteAlerta = config?.limiteMesesAlertaAusencia || 3;
    const limiteInativo = config?.limiteMesesInativacao || 12;

    const statusInfo = calcularStatusPorAusencia(
      integrante.status,
      integrante.dataCadastro,
      integrante.presencas,
      limiteAlerta,
      limiteInativo
    );

    return NextResponse.json({
      integrante: {
        ...integrante,
        statusCalculado: statusInfo.statusCalculado,
        temAlertaAusencia: statusInfo.temAlertaAusencia,
        ultimaPresencaData: statusInfo.ultimaPresencaData,
        mesesSemPresenca: statusInfo.mesesSemPresenca,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const {
      nomeCompleto,
      apelido,
      telefone,
      dataNascimento,
      nomeResponsavel,
      telefoneResponsavel,
      tempoGrupoPrecisao,
      tempoGrupoDataCompleta,
      tempoGrupoMes,
      tempoGrupoAno,
      batismo,
      primeiraEucaristia,
      crisma,
      observacao,
      fotoUrl,
      status,
      motivoInativacao,
    } = body;

    const integranteAtual = await prisma.integrante.findUnique({ where: { id } });
    if (!integranteAtual) {
      return NextResponse.json({ error: "Integrante não encontrado." }, { status: 404 });
    }

    const atualizado = await prisma.integrante.update({
      where: { id },
      data: {
        nomeCompleto: nomeCompleto ? nomeCompleto.trim() : integranteAtual.nomeCompleto,
        apelido: apelido !== undefined ? (apelido ? apelido.trim() : null) : integranteAtual.apelido,
        telefone: telefone ? telefone.trim() : integranteAtual.telefone,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : integranteAtual.dataNascimento,
        nomeResponsavel: nomeResponsavel ? nomeResponsavel.trim() : integranteAtual.nomeResponsavel,
        telefoneResponsavel: telefoneResponsavel ? telefoneResponsavel.trim() : integranteAtual.telefoneResponsavel,
        tempoGrupoPrecisao: tempoGrupoPrecisao || integranteAtual.tempoGrupoPrecisao,
        tempoGrupoDataCompleta:
          tempoGrupoPrecisao === "COMPLETA" && tempoGrupoDataCompleta
            ? new Date(tempoGrupoDataCompleta)
            : tempoGrupoPrecisao === "COMPLETA"
            ? integranteAtual.tempoGrupoDataCompleta
            : null,
        tempoGrupoMes:
          tempoGrupoPrecisao === "MES_ANO" && tempoGrupoMes
            ? parseInt(tempoGrupoMes, 10)
            : tempoGrupoPrecisao === "MES_ANO"
            ? integranteAtual.tempoGrupoMes
            : null,
        tempoGrupoAno:
          tempoGrupoPrecisao === "MES_ANO" && tempoGrupoAno
            ? parseInt(tempoGrupoAno, 10)
            : tempoGrupoPrecisao === "MES_ANO"
            ? integranteAtual.tempoGrupoAno
            : null,
        batismo: batismo !== undefined ? Boolean(batismo) : integranteAtual.batismo,
        primeiraEucaristia: primeiraEucaristia !== undefined ? Boolean(primeiraEucaristia) : integranteAtual.primeiraEucaristia,
        crisma: crisma !== undefined ? Boolean(crisma) : integranteAtual.crisma,
        noGrupoWhatsapp: body.noGrupoWhatsapp !== undefined ? Boolean(body.noGrupoWhatsapp) : integranteAtual.noGrupoWhatsapp,
        possuiAlergia: body.possuiAlergia !== undefined ? Boolean(body.possuiAlergia) : integranteAtual.possuiAlergia,
        descricaoAlergia:
          body.possuiAlergia !== undefined
            ? (body.possuiAlergia ? (body.descricaoAlergia ? body.descricaoAlergia.trim() : null) : null)
            : integranteAtual.descricaoAlergia,
        intoleranciaGluten:
          body.intoleranciaGluten !== undefined ? Boolean(body.intoleranciaGluten) : integranteAtual.intoleranciaGluten,
        intoleranciaLactose:
          body.intoleranciaLactose !== undefined ? Boolean(body.intoleranciaLactose) : integranteAtual.intoleranciaLactose,
        observacao: observacao !== undefined ? (observacao ? observacao.trim() : null) : integranteAtual.observacao,
        fotoUrl: fotoUrl !== undefined ? (fotoUrl ? fotoUrl.trim() : null) : integranteAtual.fotoUrl,
        status: status || integranteAtual.status,
        motivoInativacao: status === "INATIVO" ? motivoInativacao || null : null,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "EDITAR_INTEGRANTE",
        detalhes: `Atualizou dados do integrante "${atualizado.nomeCompleto}" (Status: ${atualizado.status})`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, integrante: atualizado });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao atualizar integrante." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await requireAuth();
    const { id } = await params;

    const integrante = await prisma.integrante.findUnique({ where: { id } });
    if (!integrante) {
      return NextResponse.json({ error: "Integrante não encontrado." }, { status: 404 });
    }

    await prisma.integrante.delete({ where: { id } });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "EXCLUIR_INTEGRANTE",
        detalhes: `Exclusão definitiva LGPD do integrante "${integrante.nomeCompleto}"`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "Integrante excluído com sucesso." });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao excluir integrante." }, { status: 500 });
  }
}
