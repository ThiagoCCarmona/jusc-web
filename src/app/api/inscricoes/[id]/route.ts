import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentUser } from "@/lib/auth";

// GET: Detalhes da inscrição (Coordenação autenticada)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const inscricao = await prisma.inscricaoEvento.findUnique({
      where: { id },
      include: {
        campanha: true,
      },
    });

    if (!inscricao) {
      return NextResponse.json({ error: "Inscrição não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ inscricao });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }
    console.error("Erro ao buscar inscrição:", error);
    return NextResponse.json({ error: "Erro ao buscar inscrição." }, { status: 500 });
  }
}

// PUT: Atualização da inscrição / Baixa de pagamento - EXCLUSIVO PARA ADMIN
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const {
      nomeCompleto,
      cpf,
      telefone,
      dataNascimento,
      sexo,
      nomeResponsavel,
      parentescoResponsavel,
      telefoneResponsavel,
      possuiAlergia,
      descricaoAlergia,
      intoleranciaGluten,
      intoleranciaLactose,
      usaRemedioContinuo,
      descricaoRemedioContinuo,
      batismo,
      primeiraEucaristia,
      crisma,
      entrouNoGrupoWhatsapp,
      pediuCamiseta,
      camisetaModelo,
      camisetaTamanho,
      camisetaNomePersonalizado,
      camisetaNumeroPersonalizado,
      camisetaValor,
      statusPagamento,
      valorPago,
      status,
      observacao,
    } = body;

    const data: any = {};
    if (nomeCompleto !== undefined) data.nomeCompleto = nomeCompleto.trim();
    if (cpf !== undefined) data.cpf = cpf ? cpf.trim() : null;
    if (telefone !== undefined) data.telefone = telefone.trim();
    if (dataNascimento !== undefined) {
      data.dataNascimento = dataNascimento ? new Date(dataNascimento) : null;
    }
    if (sexo !== undefined) data.sexo = sexo ? sexo.trim() : null;
    if (nomeResponsavel !== undefined) {
      data.nomeResponsavel = nomeResponsavel ? nomeResponsavel.trim() : null;
    }
    if (parentescoResponsavel !== undefined) {
      data.parentescoResponsavel = parentescoResponsavel ? parentescoResponsavel.trim() : null;
    }
    if (telefoneResponsavel !== undefined) {
      data.telefoneResponsavel = telefoneResponsavel ? telefoneResponsavel.trim() : null;
    }
    if (possuiAlergia !== undefined) data.possuiAlergia = Boolean(possuiAlergia);
    if (descricaoAlergia !== undefined) {
      data.descricaoAlergia = descricaoAlergia ? descricaoAlergia.trim() : null;
    }
    if (intoleranciaGluten !== undefined) data.intoleranciaGluten = Boolean(intoleranciaGluten);
    if (intoleranciaLactose !== undefined) data.intoleranciaLactose = Boolean(intoleranciaLactose);
    if (usaRemedioContinuo !== undefined) data.usaRemedioContinuo = Boolean(usaRemedioContinuo);
    if (descricaoRemedioContinuo !== undefined) {
      data.descricaoRemedioContinuo = descricaoRemedioContinuo ? descricaoRemedioContinuo.trim() : null;
    }
    if (batismo !== undefined) data.batismo = Boolean(batismo);
    if (primeiraEucaristia !== undefined) data.primeiraEucaristia = Boolean(primeiraEucaristia);
    if (crisma !== undefined) data.crisma = Boolean(crisma);
    if (entrouNoGrupoWhatsapp !== undefined) {
      data.entrouNoGrupoWhatsapp = Boolean(entrouNoGrupoWhatsapp);
      if (Boolean(entrouNoGrupoWhatsapp)) {
        data.clicouGrupoEm = new Date();
      }
    }
    if (camisetaModelo !== undefined) data.camisetaModelo = camisetaModelo ? camisetaModelo.trim() : null;
    if (camisetaTamanho !== undefined) data.camisetaTamanho = camisetaTamanho ? camisetaTamanho.trim() : null;
    if (camisetaNomePersonalizado !== undefined) data.camisetaNomePersonalizado = camisetaNomePersonalizado ? camisetaNomePersonalizado.trim() : null;
    if (camisetaNumeroPersonalizado !== undefined) data.camisetaNumeroPersonalizado = camisetaNumeroPersonalizado ? camisetaNumeroPersonalizado.trim() : null;
    if (camisetaValor !== undefined) data.camisetaValor = Number(camisetaValor) || 0;

    if (statusPagamento !== undefined) data.statusPagamento = statusPagamento;
    if (valorPago !== undefined) data.valorPago = Number(valorPago) || 0;
    if (status !== undefined) data.status = status;
    if (observacao !== undefined) data.observacao = observacao ? observacao.trim() : null;

    const inscricaoAtualizada = await prisma.inscricaoEvento.update({
      where: { id },
      data,
      include: {
        campanha: true,
      },
    });

    return NextResponse.json({ inscricao: inscricaoAtualizada });
  } catch (error: any) {
    console.error("Erro ao atualizar inscrição:", error);
    return NextResponse.json({ error: "Erro ao atualizar inscrição." }, { status: 500 });
  }
}

// DELETE: Exclusão da inscrição - EXCLUSIVO PARA ADMIN
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    await prisma.inscricaoEvento.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao excluir inscrição:", error);
    return NextResponse.json({ error: "Erro ao excluir inscrição." }, { status: 500 });
  }
}
