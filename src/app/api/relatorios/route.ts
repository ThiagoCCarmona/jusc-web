import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { calcularStatusPorAusencia } from "@/lib/rules";
import { differenceInDays, differenceInMonths } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    const limiteAlerta = config?.limiteMesesAlertaAusencia || 3;
    const limiteInativo = config?.limiteMesesInativacao || 12;

    // Buscar todos os encontros ordenados cronologicamente decrescente
    const todosEncontros = await prisma.encontro.findMany({
      orderBy: { dataHora: "desc" },
      include: {
        presencas: true,
      },
    });

    // Buscar todos os integrantes com histórico de presenças e cadastro
    const integrantes = await prisma.integrante.findMany({
      orderBy: { nomeCompleto: "asc" },
      include: {
        presencas: {
          include: {
            encontro: { select: { id: true, dataHora: true, tema: true } },
          },
        },
      },
    });

    const hoje = new Date();

    // Processar integrantes com status, alertas, data de entrada e inativação
    const integrantesProcessados = integrantes.map((int) => {
      const statusInfo = calcularStatusPorAusencia(
        int.status,
        int.dataCadastro,
        int.presencas,
        limiteAlerta,
        limiteInativo
      );

      // Determinar data de entrada (se completa ou dataCadastro)
      let dataEntradaEfetiva: Date = new Date(int.dataCadastro);
      if (int.tempoGrupoPrecisao === "COMPLETA" && int.tempoGrupoDataCompleta) {
        dataEntradaEfetiva = new Date(int.tempoGrupoDataCompleta);
      } else if (int.tempoGrupoPrecisao === "MES_ANO" && int.tempoGrupoMes && int.tempoGrupoAno) {
        dataEntradaEfetiva = new Date(int.tempoGrupoAno, int.tempoGrupoMes - 1, 1);
      }

      const diasDesdeEntrada = differenceInDays(hoje, dataEntradaEfetiva);
      const mesesDesdeEntrada = differenceInMonths(hoje, dataEntradaEfetiva);

      // Data de inativação (atualizadoEm quando status é inativo, ou calculada)
      const diasDesdeInativacao =
        statusInfo.statusCalculado === "INATIVO"
          ? differenceInDays(hoje, new Date(int.atualizadoEm))
          : null;
      const mesesDesdeInativacao =
        statusInfo.statusCalculado === "INATIVO"
          ? Math.max(statusInfo.mesesSemPresenca, differenceInMonths(hoje, new Date(int.atualizadoEm)))
          : null;

      return {
        id: int.id,
        nomeCompleto: int.nomeCompleto,
        apelido: int.apelido,
        telefone: int.telefone,
        dataNascimento: int.dataNascimento,
        nomeResponsavel: int.nomeResponsavel,
        telefoneResponsavel: int.telefoneResponsavel,
        fotoUrl: int.fotoUrl,
        noGrupoWhatsapp: int.noGrupoWhatsapp,
        batismo: int.batismo,
        primeiraEucaristia: int.primeiraEucaristia,
        crisma: int.crisma,
        possuiAlergia: int.possuiAlergia,
        descricaoAlergia: int.descricaoAlergia,
        intoleranciaGluten: int.intoleranciaGluten,
        intoleranciaLactose: int.intoleranciaLactose,
        dataCadastro: int.dataCadastro,
        dataEntradaEfetiva,
        diasDesdeEntrada,
        mesesDesdeEntrada,
        statusManual: int.status,
        statusCalculado: statusInfo.statusCalculado,
        temAlertaAusencia: statusInfo.temAlertaAusencia,
        ultimaPresencaData: statusInfo.ultimaPresencaData,
        mesesSemPresenca: statusInfo.mesesSemPresenca,
        diasDesdeInativacao,
        mesesDesdeInativacao,
        motivoInativacao: int.motivoInativacao,
        presencas: int.presencas,
      };
    });

    // Relatório consolidado de Responsáveis
    const relatorioResponsaveis = integrantesProcessados
      .filter((int) => int.nomeResponsavel && int.nomeResponsavel.trim().length > 0)
      .map((int) => ({
        id: int.id,
        nomeResponsavel: int.nomeResponsavel.trim(),
        telefoneResponsavel: int.telefoneResponsavel.trim(),
        integranteId: int.id,
        integranteNome: int.nomeCompleto,
        integranteApelido: int.apelido,
        integranteTelefone: int.telefone,
        integranteStatus: int.statusCalculado,
        noGrupoWhatsapp: int.noGrupoWhatsapp,
      }));

    return NextResponse.json({
      encontros: todosEncontros,
      integrantes: integrantesProcessados,
      relatorioResponsaveis,
      limiteAlerta,
      limiteInativo,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("Erro em /api/relatorios:", error);
    return NextResponse.json({ error: "Erro ao gerar dados do relatório." }, { status: 500 });
  }
}
