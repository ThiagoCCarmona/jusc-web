import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTesoureiroOrAdmin, getCurrentUser } from "@/lib/auth";
import { normalizarModelos } from "@/lib/utils";

// GET: público ou autenticado - retorna campanhas (se público, apenas ativas e não expiradas)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const todas = searchParams.get("todas") === "true";

    const agora = new Date();

    let whereClause: any = {};
    if (!todas || !user) {
      whereClause = {
        ativa: true,
        dataFim: { gt: agora },
      };
    }

    const campanhas = await prisma.campanhaCamiseta.findMany({
      where: whereClause,
      orderBy: { criadoEm: "desc" },
      include: {
        _count: { select: { pedidos: true } },
      },
    });

    const formatadas = campanhas.map((c) => {
      let fotosArr: any[] = [];
      let modelosArr: any[] = [];
      let tamanhosArr: string[] = [];

      try {
        fotosArr = JSON.parse(c.fotos);
      } catch {
        fotosArr = c.fotos ? [c.fotos] : [];
      }

      try {
        modelosArr = JSON.parse(c.modelos);
      } catch {
        modelosArr = c.modelos ? [c.modelos] : [];
      }

      try {
        tamanhosArr = JSON.parse(c.tamanhosDisponiveis);
      } catch {
        tamanhosArr = c.tamanhosDisponiveis ? [c.tamanhosDisponiveis] : [];
      }

      // Normalizar modelos com preço padrão
      const modelosNormalizados = normalizarModelos(modelosArr, c.precoUnitario);

      return {
        ...c,
        fotos: fotosArr,
        modelos: modelosNormalizados,
        tamanhosDisponiveis: tamanhosArr,
        expirada: new Date(c.dataFim) <= agora,
      };
    });

    return NextResponse.json({ campanhas: formatadas });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao buscar campanhas." }, { status: 500 });
  }
}

// POST: Admin ou Tesoureiro pode criar nova campanha
export async function POST(req: NextRequest) {
  try {
    const usuarioAuth = await requireTesoureiroOrAdmin();
    const body = await req.json();

    const {
      titulo,
      descricao,
      fotos,
      modelos,
      tamanhosDisponiveis,
      precoUnitario,
      permiteNome,
      permiteNumero,
      dataFim,
    } = body;

    if (!titulo || !precoUnitario || !dataFim) {
      return NextResponse.json(
        { error: "Título, valor unitário e data de encerramento são obrigatórios." },
        { status: 400 }
      );
    }

    // Validar mínimo de 2 fotos
    const fotosArr = Array.isArray(fotos) ? fotos.filter(Boolean) : [];
    if (fotosArr.length < 2) {
      return NextResponse.json(
        { error: "É obrigatório enviar pelo menos 2 fotos da camiseta." },
        { status: 400 }
      );
    }

    const precoBase = parseFloat(precoUnitario);
    const modelosNorm = normalizarModelos(modelos, precoBase);

    const tamanhosArr = Array.isArray(tamanhosDisponiveis) && tamanhosDisponiveis.length > 0
      ? tamanhosDisponiveis
      : ["P", "M", "G", "GG"];

    const campanha = await prisma.campanhaCamiseta.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao?.trim() || null,
        fotos: JSON.stringify(fotosArr),
        modelos: JSON.stringify(modelosNorm),
        tamanhosDisponiveis: JSON.stringify(tamanhosArr),
        precoUnitario: precoBase,
        permiteNome: Boolean(permiteNome),
        permiteNumero: Boolean(permiteNumero),
        dataFim: new Date(dataFim),
        ativa: true,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuarioAuth.id,
        acao: "CRIAR_CAMPANHA_CAMISETA",
        detalhes: `Lançou a campanha de camiseta "${campanha.titulo}" (R$ ${campanha.precoUnitario})`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, campanha });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito a Administradores e Tesoureiros." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao criar campanha de camiseta." }, { status: 500 });
  }
}

