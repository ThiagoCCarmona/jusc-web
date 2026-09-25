import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentUser } from "@/lib/auth";

// GET: Retorna campanhas de inscrição
// Se ?todas=true e for ADMIN/coordenação, retorna todas. Caso contrário, retorna apenas ativas e não expiradas.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const todas = searchParams.get("todas") === "true";

    const agora = new Date();

    if (todas) {
      await requireAuth(); // exige estar logado para ver todas (inclusive inativas/expiradas)
      const campanhas = await prisma.campanhaInscricao.findMany({
        orderBy: { criadoEm: "desc" },
        include: {
          campanhaCamiseta: true,
          _count: {
            select: { inscricoes: true },
          },
        },
      });
      const formatadas = campanhas.map((c) => ({
        ...c,
        expirada: new Date(c.dataLimite) <= agora,
      }));
      return NextResponse.json({ campanhas: formatadas });
    }

    // Listagem pública para a homepage
    const campanhas = await prisma.campanhaInscricao.findMany({
      where: {
        ativa: true,
        dataLimite: { gt: agora },
      },
      include: {
        campanhaCamiseta: true,
      },
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json({ campanhas });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }
    console.error("Erro ao buscar campanhas de inscrição:", error);
    return NextResponse.json({ error: "Erro ao buscar campanhas de inscrição." }, { status: 500 });
  }
}

// POST: Criação de nova campanha de inscrição - EXCLUSIVO PARA ADMIN
export async function POST(req: NextRequest) {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    if (usuario.perfil !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem publicar a abertura de inscrições." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      titulo,
      descricao,
      fotoUrl,
      dataLimite,
      dataLimitePagamento,
      ativa = true,
      requerPagamento = false,
      valor = 0,
      permiteParcelamento = false,
      campoNomeCompleto = true,
      campoCpf = false,
      campoTelefone = true,
      campoDataNascimento = true,
      campoNomeResponsavel = false,
      campoParentescoResponsavel = false,
      campoTelefoneResponsavel = false,
      campoAlergia = false,
      campoIntolerancia = false,
      campoRemedioContinuo = false,
      campoSexo = false,
      campoBatismo = false,
      campoPrimeiraEucaristia = false,
      campoCrisma = false,
      linkGrupoWhatsapp = null,
      permiteCamiseta = false,
      campanhaCamisetaId = null,
      camisetaInclusaNoValor = false,
    } = body;

    if (!titulo || !dataLimite) {
      return NextResponse.json(
        { error: "Título do banner e Data Limite são obrigatórios." },
        { status: 400 }
      );
    }

    const campanha = await prisma.campanhaInscricao.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao?.trim() || null,
        fotoUrl: fotoUrl || null,
        dataLimite: new Date(dataLimite),
        dataLimitePagamento: dataLimitePagamento ? new Date(dataLimitePagamento) : null,
        ativa: Boolean(ativa),
        requerPagamento: Boolean(requerPagamento),
        valor: Number(valor) || 0,
        permiteParcelamento: Boolean(permiteParcelamento),
        campoNomeCompleto: Boolean(campoNomeCompleto),
        campoCpf: Boolean(campoCpf),
        campoTelefone: Boolean(campoTelefone),
        campoDataNascimento: Boolean(campoDataNascimento),
        campoNomeResponsavel: Boolean(campoNomeResponsavel),
        campoParentescoResponsavel: Boolean(campoParentescoResponsavel),
        campoTelefoneResponsavel: Boolean(campoTelefoneResponsavel),
        campoAlergia: Boolean(campoAlergia),
        campoIntolerancia: Boolean(campoIntolerancia),
        campoRemedioContinuo: Boolean(campoRemedioContinuo),
        campoSexo: Boolean(campoSexo),
        campoBatismo: Boolean(campoBatismo),
        campoPrimeiraEucaristia: Boolean(campoPrimeiraEucaristia),
        campoCrisma: Boolean(campoCrisma),
        linkGrupoWhatsapp: linkGrupoWhatsapp?.trim() || null,
        permiteCamiseta: Boolean(permiteCamiseta),
        campanhaCamisetaId: permiteCamiseta && campanhaCamisetaId ? campanhaCamisetaId : null,
        camisetaInclusaNoValor: Boolean(camisetaInclusaNoValor),
      },
    });

    return NextResponse.json({ campanha }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar campanha de inscrição:", error);
    return NextResponse.json({ error: "Erro ao criar campanha de inscrição." }, { status: 500 });
  }
}
