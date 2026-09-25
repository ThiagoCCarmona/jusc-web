import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { GeradorPix, gerarLinkComprovanteWhatsapp } from "@/lib/pix";
import { obterPrecoModelo } from "@/lib/utils";

// GET: Todos os usuários autenticados (Colaborador, Tesoureiro e Admin) podem visualizar pedidos para relatórios
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const campanhaId = searchParams.get("campanhaId");
    const statusPagamento = searchParams.get("statusPagamento");
    const busca = searchParams.get("busca")?.toLowerCase().trim();

    const where: any = {};
    if (campanhaId && campanhaId !== "TODAS") where.campanhaId = campanhaId;
    if (statusPagamento && statusPagamento !== "TODOS") where.statusPagamento = statusPagamento;

    const pedidos = await prisma.pedidoCamiseta.findMany({
      where,
      include: {
        campanha: {
          select: {
            id: true,
            titulo: true,
            precoUnitario: true,
            fotos: true,
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    const pedidosFiltrados = busca
      ? pedidos.filter(
          (p) =>
            p.codigoPedido.toLowerCase().includes(busca) ||
            p.nomeComprador.toLowerCase().includes(busca) ||
            p.telefoneComprador.includes(busca) ||
            p.modelo.toLowerCase().includes(busca)
        )
      : pedidos;

    return NextResponse.json({ pedidos: pedidosFiltrados });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 });
  }
}

// POST: Público - qualquer pessoa pode submeter um pedido de camiseta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      campanhaId,
      nomeComprador,
      telefoneComprador,
      modelo,
      tamanho,
      quantidade = 1,
      personalizacaoNome,
      personalizacaoNum,
      formaPagamento = "PIX",
      tipoQuitacao = "INTEGRAL",
    } = body;

    if (!campanhaId || !nomeComprador || !telefoneComprador || !modelo || !tamanho) {
      return NextResponse.json(
        { error: "Por favor, preencha todos os campos obrigatórios do pedido." },
        { status: 400 }
      );
    }

    const campanha = await prisma.campanhaCamiseta.findUnique({
      where: { id: campanhaId },
    });

    if (!campanha || !campanha.ativa || new Date(campanha.dataFim) <= new Date()) {
      return NextResponse.json(
        { error: "Esta campanha de camisetas não está mais disponível para pedidos." },
        { status: 400 }
      );
    }

    const qtd = Math.max(1, parseInt(String(quantidade), 10) || 1);
    const precoUnitarioModelo = obterPrecoModelo(
      modelo,
      campanha.modelos,
      campanha.precoUnitario
    );
    const valorTotal = precoUnitarioModelo * qtd;
    const valorPagoAgora = tipoQuitacao === "PARCELADO_50_50" ? valorTotal / 2 : valorTotal;
    const saldoRestante = tipoQuitacao === "PARCELADO_50_50" ? valorTotal / 2 : 0;

    // Gerar código único e sequencial do pedido, ex: PED-0001, PED-0002...
    const totalPedidos = await prisma.pedidoCamiseta.count();
    let proximoNumero = totalPedidos + 1;
    let codigoPedido = `PED-${String(proximoNumero).padStart(4, "0")}`;
    while (await prisma.pedidoCamiseta.findUnique({ where: { codigoPedido } })) {
      proximoNumero++;
      codigoPedido = `PED-${String(proximoNumero).padStart(4, "0")}`;
    }

    // Buscar dados do tesoureiro para Pix e WhatsApp
    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    const chavePix = config?.tesoureiroChavePix || config?.coordenadorWhatsapp || "45999068852";
    const nomeRecebedor = config?.tesoureiroNome || config?.nomeGrupo || "JUSC";
    const cidadeRecebedor = config?.tesoureiroCidadePix || "Foz do Iguacu";
    const telTesoureiro = config?.tesoureiroWhatsapp || config?.coordenadorWhatsapp || "5545991179727";

    // Gerar Código Pix Copia e Cola via gerador-pix (klimadev standard)
    let codigoPix = "";
    if (formaPagamento === "PIX" && chavePix) {
      try {
        const gerador = new GeradorPix({
          chave: chavePix,
          nomeRecebedor,
          cidadeRecebedor,
          valor: valorPagoAgora,
          identificador: codigoPedido.replace("-", ""),
          descricao: `Camiseta ${campanha.titulo}`.slice(0, 50),
        });
        codigoPix = gerador.gerarCodigo();
      } catch (err) {
        console.error("Erro ao gerar Pix Copia e Cola:", err);
      }
    }

    // Gerar Link de WhatsApp para envio do comprovante para o tesoureiro
    const linkWhatsapp = gerarLinkComprovanteWhatsapp({
      telefoneTesoureiro: telTesoureiro,
      codigoPedido,
      nomeComprador: nomeComprador.trim(),
      tituloCampanha: campanha.titulo,
      modelo,
      tamanho,
      quantidade: qtd,
      personalizacaoNome,
      personalizacaoNum,
      formaPagamento,
      tipoQuitacao,
      valorTotal,
      valorPagoAgora,
      saldoRestante,
    });

    const pedido = await prisma.pedidoCamiseta.create({
      data: {
        campanhaId: campanha.id,
        codigoPedido,
        nomeComprador: nomeComprador.trim(),
        telefoneComprador: telefoneComprador.trim(),
        modelo: modelo.trim(),
        tamanho: tamanho.trim(),
        quantidade: qtd,
        personalizacaoNome: personalizacaoNome?.trim() || null,
        personalizacaoNum: personalizacaoNum?.trim() || null,
        formaPagamento,
        tipoQuitacao,
        valorTotal,
        valorPago: 0,
        statusPagamento: "PENDENTE",
        entregue: false,
      },
    });

    return NextResponse.json({
      success: true,
      pedido,
      codigoPix,
      linkWhatsapp,
      valorTotal,
      valorPagoAgora,
      saldoRestante,
      tesoureiroNome: nomeRecebedor,
      tesoureiroWhatsapp: telTesoureiro,
    });
  } catch (error: any) {
    console.error("Erro ao registrar pedido de camiseta:", error);
    return NextResponse.json({ error: "Erro ao processar pedido." }, { status: 500 });
  }
}
