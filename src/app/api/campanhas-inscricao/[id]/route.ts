import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campanha = await prisma.campanhaInscricao.findUnique({
      where: { id },
      include: {
        campanhaCamiseta: true,
        _count: {
          select: { inscricoes: true },
        },
      },
    });

    if (!campanha) {
      return NextResponse.json({ error: "Campanha de inscrição não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ campanha });
  } catch (error: any) {
    console.error("Erro ao buscar campanha:", error);
    return NextResponse.json({ error: "Erro ao buscar campanha." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    if (usuario.perfil !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar campanhas de inscrição." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const {
      titulo,
      descricao,
      fotoUrl,
      dataLimite,
      ativa,
      requerPagamento,
      valor,
      permiteParcelamento,
      campoNomeCompleto,
      campoCpf,
      campoTelefone,
      campoDataNascimento,
      campoNomeResponsavel,
      campoParentescoResponsavel,
      campoTelefoneResponsavel,
      campoAlergia,
      campoIntolerancia,
      campoRemedioContinuo,
      campoSexo,
      campoBatismo,
      campoPrimeiraEucaristia,
      campoCrisma,
      linkGrupoWhatsapp,
      permiteCamiseta,
      campanhaCamisetaId,
      camisetaInclusaNoValor,
    } = body;

    const data: any = {};
    if (titulo !== undefined) data.titulo = titulo.trim();
    if (descricao !== undefined) data.descricao = descricao ? descricao.trim() : null;
    if (fotoUrl !== undefined) data.fotoUrl = fotoUrl || null;
    if (dataLimite !== undefined) data.dataLimite = new Date(dataLimite);
    if (ativa !== undefined) data.ativa = Boolean(ativa);
    if (requerPagamento !== undefined) data.requerPagamento = Boolean(requerPagamento);
    if (valor !== undefined) data.valor = Number(valor) || 0;
    if (permiteParcelamento !== undefined) data.permiteParcelamento = Boolean(permiteParcelamento);
    if (campoNomeCompleto !== undefined) data.campoNomeCompleto = Boolean(campoNomeCompleto);
    if (campoCpf !== undefined) data.campoCpf = Boolean(campoCpf);
    if (campoTelefone !== undefined) data.campoTelefone = Boolean(campoTelefone);
    if (campoDataNascimento !== undefined) data.campoDataNascimento = Boolean(campoDataNascimento);
    if (campoNomeResponsavel !== undefined) data.campoNomeResponsavel = Boolean(campoNomeResponsavel);
    if (campoParentescoResponsavel !== undefined) data.campoParentescoResponsavel = Boolean(campoParentescoResponsavel);
    if (campoTelefoneResponsavel !== undefined) data.campoTelefoneResponsavel = Boolean(campoTelefoneResponsavel);
    if (campoAlergia !== undefined) data.campoAlergia = Boolean(campoAlergia);
    if (campoIntolerancia !== undefined) data.campoIntolerancia = Boolean(campoIntolerancia);
    if (campoRemedioContinuo !== undefined) data.campoRemedioContinuo = Boolean(campoRemedioContinuo);
    if (campoSexo !== undefined) data.campoSexo = Boolean(campoSexo);
    if (campoBatismo !== undefined) data.campoBatismo = Boolean(campoBatismo);
    if (campoPrimeiraEucaristia !== undefined) data.campoPrimeiraEucaristia = Boolean(campoPrimeiraEucaristia);
    if (campoCrisma !== undefined) data.campoCrisma = Boolean(campoCrisma);
    if (linkGrupoWhatsapp !== undefined) data.linkGrupoWhatsapp = linkGrupoWhatsapp ? linkGrupoWhatsapp.trim() : null;
    if (permiteCamiseta !== undefined) data.permiteCamiseta = Boolean(permiteCamiseta);
    if (campanhaCamisetaId !== undefined) data.campanhaCamisetaId = campanhaCamisetaId || null;
    if (camisetaInclusaNoValor !== undefined) data.camisetaInclusaNoValor = Boolean(camisetaInclusaNoValor);

    const campanhaAtualizada = await prisma.campanhaInscricao.update({
      where: { id },
      data,
      include: {
        campanhaCamiseta: true,
      },
    });

    return NextResponse.json({ campanha: campanhaAtualizada });
  } catch (error: any) {
    console.error("Erro ao atualizar campanha de inscrição:", error);
    return NextResponse.json({ error: "Erro ao atualizar campanha de inscrição." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    if (usuario.perfil !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir campanhas de inscrição." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await prisma.campanhaInscricao.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao excluir campanha de inscrição:", error);
    return NextResponse.json({ error: "Erro ao excluir campanha de inscrição." }, { status: 500 });
  }
}
