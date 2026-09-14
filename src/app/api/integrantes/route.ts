import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { calcularStatusPorAusencia, calcularIdade } from "@/lib/rules";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca")?.toLowerCase().trim();
    const filtroStatus = searchParams.get("status"); // "ATIVO", "INATIVO", "ALERTA"
    const filtroSacramento = searchParams.get("sacramento"); // "batismo", "eucaristia", "crisma"
    const filtroSexo = searchParams.get("sexo"); // "MASCULINO", "FEMININO"
    const filtroClj = searchParams.get("clj"); // "TODOS", "SIM", "NAO"
    const dataRefStr = searchParams.get("dataRefIdade");
    const dataReferencia = dataRefStr ? new Date(dataRefStr) : new Date();
    const idadeMin = searchParams.get("idadeMin") ? parseInt(searchParams.get("idadeMin")!, 10) : null;
    const idadeMax = searchParams.get("idadeMax") ? parseInt(searchParams.get("idadeMax")!, 10) : null;

    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    const limiteAlerta = config?.limiteMesesAlertaAusencia || 3;
    const limiteInativo = config?.limiteMesesInativacao || 12;
    const pausas = await prisma.pausaEncontro.findMany();

    const integrantes = await prisma.integrante.findMany({
      orderBy: { nomeCompleto: "asc" },
      include: {
        cadastradoPor: { select: { id: true, nome: true } },
        presencas: {
          include: {
            encontro: { select: { id: true, dataHora: true, tema: true } },
          },
          orderBy: { encontro: { dataHora: "desc" } },
        },
      },
    });

    const resultadoProcessado = integrantes
      .map((int) => {
        const statusInfo = calcularStatusPorAusencia(
          int.status,
          int.dataCadastro,
          int.presencas,
          limiteAlerta,
          limiteInativo,
          new Date(),
          pausas
        );

        const idadeCalculada = calcularIdade(int.dataNascimento, dataReferencia);

        return {
          ...int,
          statusCalculado: statusInfo.statusCalculado,
          temAlertaAusencia: statusInfo.temAlertaAusencia,
          ultimaPresencaData: statusInfo.ultimaPresencaData,
          mesesSemPresenca: statusInfo.mesesSemPresenca,
          idadeCalculada,
        };
      })
      .filter((int) => {
        // Filtro de busca textual por nome ou apelido
        if (busca) {
          const nomeMatch = int.nomeCompleto.toLowerCase().includes(busca);
          const apelidoMatch = int.apelido?.toLowerCase().includes(busca);
          if (!nomeMatch && !apelidoMatch) return false;
        }

        // Filtro de status
        if (filtroStatus === "ALERTA") {
          if (!int.temAlertaAusencia) return false;
        } else if (filtroStatus === "ATIVO") {
          if (int.statusCalculado !== "ATIVO" || int.temAlertaAusencia) return false;
        } else if (filtroStatus === "INATIVO") {
          if (int.statusCalculado !== "INATIVO") return false;
        }

        // Filtro de sacramentos
        if (filtroSacramento === "batismo" && !int.batismo) return false;
        if (filtroSacramento === "eucaristia" && !int.primeiraEucaristia) return false;
        if (filtroSacramento === "crisma" && !int.crisma) return false;

        // Filtro de sexo
        if (filtroSexo && filtroSexo !== "TODOS") {
          const sexoInt = int.sexo || "MASCULINO";
          if (sexoInt !== filtroSexo) return false;
        }

        // Filtro CLJ
        if (filtroClj === "SIM" && !int.fezClj) return false;
        if (filtroClj === "NAO" && int.fezClj) return false;

        // Filtro por idade
        if (idadeMin !== null && !isNaN(idadeMin) && int.idadeCalculada < idadeMin) return false;
        if (idadeMax !== null && !isNaN(idadeMax) && int.idadeCalculada > idadeMax) return false;

        return true;
      });

    return NextResponse.json({
      integrantes: resultadoProcessado,
      limiteAlerta,
      limiteInativo,
      encontrosPausados: Boolean(config?.encontrosPausados),
      nomeGrupo: config?.nomeGrupo || "JUSC",
      mascoteUrl: config?.mascoteUrl || "/assets/abelhudo.png",
    });

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao buscar integrantes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await requireAuth();
    const body = await req.json();

    const {
      nomeCompleto,
      apelido,
      sexo,
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
      fezClj,
      qualClj,
      possuiAlergia,
      descricaoAlergia,
      intoleranciaGluten,
      intoleranciaLactose,
      observacao,
      fotoUrl,
    } = body;

    if (!nomeCompleto || !telefone || !dataNascimento || !nomeResponsavel || !telefoneResponsavel) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios marcados com asterisco (*)." },
        { status: 400 }
      );
    }

    const novoIntegrante = await prisma.integrante.create({
      data: {
        nomeCompleto: nomeCompleto.trim(),
        apelido: apelido?.trim() || null,
        sexo: sexo === "FEMININO" ? "FEMININO" : "MASCULINO",
        telefone: telefone.trim(),
        dataNascimento: new Date(dataNascimento),
        nomeResponsavel: nomeResponsavel.trim(),
        telefoneResponsavel: telefoneResponsavel.trim(),
        tempoGrupoPrecisao: tempoGrupoPrecisao || "DESCONHECIDA",
        tempoGrupoDataCompleta:
          tempoGrupoPrecisao === "COMPLETA" && tempoGrupoDataCompleta
            ? new Date(tempoGrupoDataCompleta)
            : null,
        tempoGrupoMes:
          tempoGrupoPrecisao === "MES_ANO" && tempoGrupoMes
            ? parseInt(tempoGrupoMes, 10)
            : null,
        tempoGrupoAno:
          tempoGrupoPrecisao === "MES_ANO" && tempoGrupoAno
            ? parseInt(tempoGrupoAno, 10)
            : null,
        batismo: Boolean(batismo),
        primeiraEucaristia: Boolean(primeiraEucaristia),
        crisma: Boolean(crisma),
        fezClj: Boolean(fezClj),
        qualClj: fezClj ? (qualClj?.trim() || null) : null,
        noGrupoWhatsapp: Boolean(body.noGrupoWhatsapp),
        possuiAlergia: Boolean(possuiAlergia),
        descricaoAlergia: possuiAlergia ? (descricaoAlergia?.trim() || null) : null,
        intoleranciaGluten: Boolean(intoleranciaGluten),
        intoleranciaLactose: Boolean(intoleranciaLactose),
        observacao: observacao?.trim() || null,
        fotoUrl: fotoUrl?.trim() || null,
        status: "ATIVO",
        cadastradoPorId: usuario.id,
      },
    });

    // Auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "CRIAR_INTEGRANTE",
        detalhes: `Cadastrou o integrante "${novoIntegrante.nomeCompleto}" (ID: ${novoIntegrante.id})`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, integrante: novoIntegrante });
  } catch (error: any) {
    console.error("Erro ao cadastrar integrante:", error);
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno ao cadastrar integrante." }, { status: 500 });
  }
}
