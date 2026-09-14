import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTesoureiroOrAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await requireTesoureiroOrAdmin();
    const { id } = await params;
    const body = await req.json();

    const pedidoAtual = await prisma.pedidoCamiseta.findUnique({ where: { id } });
    if (!pedidoAtual) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const { acao, observacao } = body;
    // acao: "BAIXA_50" | "BAIXA_100" | "MARCAR_ENTREGUE" | "CANCELAR" | "EDITAR"

    let valorPago = pedidoAtual.valorPago;
    let statusPagamento = pedidoAtual.statusPagamento;
    let entregue = pedidoAtual.entregue;

    if (acao === "BAIXA_50") {
      valorPago = pedidoAtual.valorTotal / 2;
      statusPagamento = "PAGO_PARCIAL";
    } else if (acao === "BAIXA_100") {
      valorPago = pedidoAtual.valorTotal;
      statusPagamento = "PAGO_TOTAL";
    } else if (acao === "MARCAR_ENTREGUE") {
      entregue = !pedidoAtual.entregue;
    } else if (acao === "CANCELAR") {
      statusPagamento = "CANCELADO";
    } else if (acao === "DESFAZER_BAIXA") {
      // Se estava em PAGO_TOTAL com 50/50 e foi pedido para voltar um nível, ou se quer estorno completo
      if (body.reverterPara === "PAGO_PARCIAL" && pedidoAtual.tipoQuitacao === "PARCELADO_50_50") {
        valorPago = pedidoAtual.valorTotal / 2;
        statusPagamento = "PAGO_PARCIAL";
      } else {
        // Volta para PENDENTE com valorPago = 0
        valorPago = 0;
        statusPagamento = "PENDENTE";
      }
    } else if (acao === "EDITAR") {
      if (body.valorPago !== undefined) valorPago = parseFloat(body.valorPago);
      if (body.statusPagamento !== undefined) statusPagamento = body.statusPagamento;
      if (body.entregue !== undefined) entregue = Boolean(body.entregue);
    }

    const pedidoAtualizado = await prisma.pedidoCamiseta.update({
      where: { id },
      data: {
        valorPago,
        statusPagamento,
        entregue,
        observacao: observacao !== undefined ? observacao : pedidoAtual.observacao,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "BAIXA_PEDIDO_CAMISETA",
        detalhes: `${usuario.perfil === "ADMIN" ? "Administrador" : "Tesoureiro"} ${usuario.nome} atualizou pedido ${pedidoAtualizado.codigoPedido} para status: ${statusPagamento} (Pago: R$ ${valorPago.toFixed(2)})`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, pedido: pedidoAtualizado });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Acesso restrito ao Tesoureiro ou Administrador." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Erro ao atualizar pedido." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = await requireTesoureiroOrAdmin();
    const { id } = await params;

    const pedido = await prisma.pedidoCamiseta.delete({ where: { id } });

    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: "EXCLUIR_PEDIDO_CAMISETA",
        detalhes: `${usuario.perfil} ${usuario.nome} excluiu o pedido ${pedido.codigoPedido}`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Acesso restrito ao Tesoureiro ou Administrador." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Erro ao excluir pedido." }, { status: 500 });
  }
}
