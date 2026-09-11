import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const banners = await prisma.banner.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        criadoPor: { select: { id: true, nome: true } },
      },
    });

    const agora = new Date();
    const processados = banners.map((b) => ({
      ...b,
      expirado: new Date(b.dataExpiracao) <= agora,
    }));

    return NextResponse.json({ banners: processados });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      tipo,
      titulo,
      resumo,
      descricaoCompleta,
      imagemUrl,
      dataExpiracao,
    } = body;

    if (!tipo || !titulo || !resumo || !descricaoCompleta || !dataExpiracao) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios do banner." },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        tipo: tipo === "ALERTA" ? "ALERTA" : "EVENTO",
        titulo: titulo.trim(),
        resumo: resumo.trim(),
        descricaoCompleta: descricaoCompleta.trim(),
        imagemUrl: imagemUrl?.trim() || null,
        dataExpiracao: new Date(dataExpiracao),
        ativo: true,
        criadoPorId: admin.id,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: admin.id,
        acao: "CRIAR_BANNER",
        detalhes: `Criou banner (${banner.tipo}): "${banner.titulo}"`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }
    return NextResponse.json({ error: "Erro ao criar banner." }, { status: 500 });
  }
}
