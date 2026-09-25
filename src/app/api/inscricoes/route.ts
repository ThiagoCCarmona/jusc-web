import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentUser } from "@/lib/auth";
import { GeradorPix } from "@/lib/pix";
import { calcularIdade } from "@/lib/rules";

// GET: Toda a coordenação (Colaborador, Tesoureiro e Admin) pode visualizar as inscrições e exportar relatórios
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const campanhaId = searchParams.get("campanhaId");
    const statusPagamento = searchParams.get("statusPagamento");
    const status = searchParams.get("status");
    const busca = searchParams.get("busca")?.toLowerCase().trim();

    const where: any = {};
    if (campanhaId && campanhaId !== "TODAS") where.campanhaId = campanhaId;
    if (statusPagamento && statusPagamento !== "TODOS") where.statusPagamento = statusPagamento;
    if (status && status !== "TODOS") where.status = status;

    const inscricoes = await prisma.inscricaoEvento.findMany({
      where,
      include: {
        campanha: {
          select: {
            id: true,
            titulo: true,
            requerPagamento: true,
            valor: true,
            fotoUrl: true,
            dataLimite: true,
            dataLimitePagamento: true,
            linkGrupoWhatsapp: true,
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    const inscricoesFiltradas = busca
      ? inscricoes.filter(
          (i) =>
            i.codigoInscricao.toLowerCase().includes(busca) ||
            i.nomeCompleto.toLowerCase().includes(busca) ||
            i.telefone.includes(busca) ||
            (i.cpf && i.cpf.includes(busca)) ||
            (i.nomeResponsavel && i.nomeResponsavel.toLowerCase().includes(busca))
        )
      : inscricoes;

    return NextResponse.json({ inscricoes: inscricoesFiltradas });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }
    console.error("Erro ao listar inscrições:", error);
    return NextResponse.json({ error: "Erro ao buscar inscrições." }, { status: 500 });
  }
}

// POST: Submissão de inscrição (Pública ou via Admin manual)
export async function POST(req: NextRequest) {
  try {
    const usuario = await getCurrentUser();
    const body = await req.json();

    const {
      campanhaId,
      origemAdmin = false,
      nomeCompleto,
      cpf,
      telefone,
      dataNascimento,
      nomeResponsavel,
      parentescoResponsavel,
      telefoneResponsavel,
      possuiAlergia = false,
      descricaoAlergia,
      intoleranciaGluten = false,
      intoleranciaLactose = false,
      usaRemedioContinuo = false,
      descricaoRemedioContinuo,
      sexo,
      batismo = false,
      primeiraEucaristia = false,
      crisma = false,
      entrouNoGrupoWhatsapp = false,
      formaPagamento = "PIX",
      tipoQuitacao = "INTEGRAL",
      statusPagamentoManual,
      statusManual,
      observacao,
      // Pedido de camiseta junto com a inscrição
      pediuCamiseta = false,
      camisetaModelo,
      camisetaTamanho,
      camisetaNomePersonalizado,
      camisetaNumeroPersonalizado,
      camisetaValor = 0,
    } = body;

    // Se estiver sendo criado diretamente pelo painel com override
    if (origemAdmin) {
      if (!usuario) {
        return NextResponse.json(
          { error: "Acesso não autorizado." },
          { status: 401 }
        );
      }
    }

    if (!campanhaId) {
      return NextResponse.json({ error: "Campanha de inscrição não informada." }, { status: 400 });
    }

    const campanha = await prisma.campanhaInscricao.findUnique({
      where: { id: campanhaId },
      include: { campanhaCamiseta: true },
    });

    if (!campanha) {
      return NextResponse.json({ error: "Campanha de inscrição não encontrada." }, { status: 404 });
    }

    // Se não for admin inserindo manualmente, valida se a campanha ainda está aberta
    if (!origemAdmin) {
      if (!campanha.ativa || new Date(campanha.dataLimite) <= new Date()) {
        return NextResponse.json(
          { error: "As inscrições para este evento já foram encerradas." },
          { status: 400 }
        );
      }
    }

    // Validação de campos obrigatórios conforme o admin marcou como preenchíveis
    if (campanha.campoNomeCompleto && !nomeCompleto?.trim()) {
      return NextResponse.json(
        { error: "O Nome Completo é obrigatório para a inscrição neste evento." },
        { status: 400 }
      );
    }

    if (campanha.campoTelefone && !telefone?.trim()) {
      return NextResponse.json(
        { error: "O Telefone/WhatsApp é obrigatório para a inscrição neste evento." },
        { status: 400 }
      );
    }

    if (campanha.campoCpf && !cpf?.trim()) {
      return NextResponse.json(
        { error: "O CPF é obrigatório para a inscrição neste evento." },
        { status: 400 }
      );
    }

    if (campanha.campoDataNascimento && !dataNascimento) {
      return NextResponse.json(
        { error: "A Data de Nascimento é obrigatória para a inscrição neste evento." },
        { status: 400 }
      );
    }

    if (campanha.campoNomeResponsavel && !nomeResponsavel?.trim()) {
      return NextResponse.json(
        { error: "O Nome do Responsável é obrigatório para este evento." },
        { status: 400 }
      );
    }

    if (campanha.campoParentescoResponsavel && !parentescoResponsavel?.trim()) {
      return NextResponse.json(
        { error: "O Grau de Parentesco do Responsável é obrigatório para este evento." },
        { status: 400 }
      );
    }

    if (campanha.campoTelefoneResponsavel && !telefoneResponsavel?.trim()) {
      return NextResponse.json(
        { error: "O Telefone do Responsável é obrigatório para este evento." },
        { status: 400 }
      );
    }

    if (campanha.campoSexo && (!sexo || !["MASCULINO", "FEMININO"].includes(sexo))) {
      return NextResponse.json(
        { error: "Por favor, informe o seu sexo (Masculino ou Feminino)." },
        { status: 400 }
      );
    }

    if (campanha.campoAlergia && possuiAlergia && !descricaoAlergia?.trim()) {
      return NextResponse.json(
        { error: "Por favor, especifique qual alergia você possui para podermos tomar os devidos cuidados." },
        { status: 400 }
      );
    }

    if (campanha.campoRemedioContinuo && usaRemedioContinuo && !descricaoRemedioContinuo?.trim()) {
      return NextResponse.json(
        { error: "Por favor, especifique qual medicamento de uso contínuo você utiliza." },
        { status: 400 }
      );
    }

    // Se pediu camiseta, validar modelo e tamanho
    if (pediuCamiseta && (!camisetaModelo || !camisetaTamanho)) {
      return NextResponse.json(
        { error: "Por favor, selecione o modelo e o tamanho da camiseta desejada." },
        { status: 400 }
      );
    }

    // Gerar código único e sequencial da inscrição, ex: INS-0001, INS-0002...
    const totalInscricoes = await prisma.inscricaoEvento.count();
    let proximoNumero = totalInscricoes + 1;
    let codigoInscricao = `INS-${String(proximoNumero).padStart(4, "0")}`;
    while (await prisma.inscricaoEvento.findUnique({ where: { codigoInscricao } })) {
      proximoNumero++;
      codigoInscricao = `INS-${String(proximoNumero).padStart(4, "0")}`;
    }

    // Configurações financeiras (Inscrição + Camiseta se houver)
    const valorInscricao = campanha.requerPagamento ? campanha.valor : 0;
    const valorCamiseta = pediuCamiseta
      ? (campanha.camisetaInclusaNoValor ? 0 : Number(camisetaValor) || 0)
      : 0;
    const valorTotal = valorInscricao + valorCamiseta;
    const requerPagamento = valorTotal > 0;

    const valorPagoAgora = requerPagamento
      ? (tipoQuitacao === "PARCELADO_50_50" ? valorTotal / 2 : valorTotal)
      : 0;

    let statusPag = "ISENTO";
    let formaPag = "ISENTO";
    if (requerPagamento) {
      statusPag = statusPagamentoManual || "PENDENTE";
      formaPag = formaPagamento || "PIX";
    }

    const inscricao = await prisma.inscricaoEvento.create({
      data: {
        campanhaId: campanha.id,
        codigoInscricao,
        nomeCompleto: nomeCompleto.trim(),
        cpf: cpf ? cpf.trim() : null,
        telefone: telefone.trim(),
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        sexo: sexo || null,
        nomeResponsavel: nomeResponsavel ? nomeResponsavel.trim() : null,
        parentescoResponsavel: parentescoResponsavel ? parentescoResponsavel.trim() : null,
        telefoneResponsavel: telefoneResponsavel ? telefoneResponsavel.trim() : null,
        possuiAlergia: Boolean(possuiAlergia),
        descricaoAlergia: possuiAlergia && descricaoAlergia ? descricaoAlergia.trim() : null,
        intoleranciaGluten: Boolean(intoleranciaGluten),
        intoleranciaLactose: Boolean(intoleranciaLactose),
        usaRemedioContinuo: Boolean(usaRemedioContinuo),
        descricaoRemedioContinuo: usaRemedioContinuo && descricaoRemedioContinuo ? descricaoRemedioContinuo.trim() : null,
        batismo: Boolean(batismo),
        primeiraEucaristia: Boolean(primeiraEucaristia),
        crisma: Boolean(crisma),
        entrouNoGrupoWhatsapp: Boolean(entrouNoGrupoWhatsapp),
        clicouGrupoEm: Boolean(entrouNoGrupoWhatsapp) ? new Date() : null,
        pediuCamiseta: Boolean(pediuCamiseta),
        camisetaModelo: pediuCamiseta ? camisetaModelo : null,
        camisetaTamanho: pediuCamiseta ? camisetaTamanho : null,
        camisetaNomePersonalizado: pediuCamiseta && camisetaNomePersonalizado ? camisetaNomePersonalizado.trim() : null,
        camisetaNumeroPersonalizado: pediuCamiseta && camisetaNumeroPersonalizado ? camisetaNumeroPersonalizado.trim() : null,
        camisetaValor: valorCamiseta,
        formaPagamento: formaPag,
        tipoQuitacao: requerPagamento ? tipoQuitacao : null,
        valorTotal,
        valorPago: statusPag === "PAGO_TOTAL" ? valorTotal : (statusPag === "PAGO_PARCIAL" ? valorPagoAgora : 0),
        statusPagamento: statusPag,
        status: statusManual || "CONFIRMADA",
        observacao: observacao ? observacao.trim() : null,
      },
      include: {
        campanha: true,
      },
    });

    // Se pediu camiseta no evento, registrar automaticamente na campanha de camisetas como pedido normal
    if (pediuCamiseta && camisetaModelo && camisetaTamanho) {
      try {
        const campanhaCamisetaAlvo = campanha.campanhaCamisetaId
          ? await prisma.campanhaCamiseta.findUnique({ where: { id: campanha.campanhaCamisetaId } })
          : await prisma.campanhaCamiseta.findFirst({ where: { ativa: true }, orderBy: { criadoEm: "desc" } });

        if (campanhaCamisetaAlvo) {
          const codPedidoRandom = randomInt(1000, 10000);
          const codigoPedido = `PED-${codPedidoRandom}`;

          const statusPagCamiseta = campanha.camisetaInclusaNoValor
            ? "PAGO_TOTAL"
            : (statusPag === "PAGO_TOTAL" ? "PAGO_TOTAL" : statusPag === "PAGO_PARCIAL" ? "PAGO_PARCIAL" : "PENDENTE");

          const valorCamisetaCalculado = campanha.camisetaInclusaNoValor ? 0 : (Number(camisetaValor) || 0);
          const valorPagoCamiseta = statusPagCamiseta === "PAGO_TOTAL"
            ? valorCamisetaCalculado
            : statusPagCamiseta === "PAGO_PARCIAL"
            ? valorCamisetaCalculado / 2
            : 0;

          await prisma.pedidoCamiseta.create({
            data: {
              campanhaId: campanhaCamisetaAlvo.id,
              codigoPedido,
              nomeComprador: nomeCompleto.trim(),
              telefoneComprador: telefone.trim(),
              modelo: camisetaModelo.trim(),
              tamanho: camisetaTamanho.trim(),
              quantidade: 1,
              personalizacaoNome: camisetaNomePersonalizado ? camisetaNomePersonalizado.trim() : null,
              personalizacaoNum: camisetaNumeroPersonalizado ? camisetaNumeroPersonalizado.trim() : null,
              formaPagamento: formaPag === "ISENTO" ? "PIX" : formaPag,
              tipoQuitacao: tipoQuitacao || "INTEGRAL",
              valorTotal: valorCamisetaCalculado,
              valorPago: valorPagoCamiseta,
              statusPagamento: statusPagCamiseta,
              entregue: false,
              observacao: `Pedido realizado via Inscrição no Evento: ${campanha.titulo} (${codigoInscricao})`,
            },
          });
        }
      } catch (errCamiseta) {
        console.error("Erro ao sincronizar pedido de camiseta da inscrição:", errCamiseta);
      }
    }

    // Buscar configurações da liderança (Secretário e Tesoureiro)
    const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    const secretarioNome = config?.secretarioNome || "Secretário";
    const secretarioTel = config?.secretarioWhatsapp || config?.coordenadorWhatsapp || "5545991179727";
    const telSecretarioLimpo = secretarioTel.replace(/\D/g, "");

    const tesoureiroNome = config?.tesoureiroNome || "Tesoureiro";
    const tesoureiroTel = config?.tesoureiroWhatsapp || config?.coordenadorWhatsapp || "5545991179727";
    const telTesoureiroLimpo = tesoureiroTel.replace(/\D/g, "");

    // Calcular idade para a mensagem
    const idadeTxt = dataNascimento ? ` (${calcularIdade(dataNascimento)} anos)` : "";

    // Informações de Camiseta (se pediu)
    const camisetaTxt = pediuCamiseta
      ? `👕 *Camiseta:* Modelo ${camisetaModelo} — Tam. ${camisetaTamanho}` +
        (camisetaNomePersonalizado || camisetaNumeroPersonalizado
          ? ` (${[camisetaNomePersonalizado ? `Nome: ${camisetaNomePersonalizado}` : "", camisetaNumeroPersonalizado ? `Nº ${camisetaNumeroPersonalizado}` : ""].filter(Boolean).join(" | ")})`
          : "") +
        (campanha.camisetaInclusaNoValor ? ` [Inclusa no Evento]\n` : ` [R$ ${valorCamiseta.toFixed(2).replace(".", ",")}]\n`)
      : "";

    // 1. Link de confirmação para o WhatsApp do SECRETÁRIO
    const msgSecretario =
      `Olá, ${secretarioNome}! Meu nome é *${nomeCompleto.trim()}*${idadeTxt} e confirmo minha inscrição para o evento *${campanha.titulo}*.\n\n` +
      `📋 *Código da Inscrição:* ${codigoInscricao}\n` +
      `📱 *Telefone/WhatsApp:* ${telefone.trim()}\n` +
      (nomeResponsavel ? `👨‍👩‍👧 *Responsável:* ${nomeResponsavel} (${parentescoResponsavel || "Responsável"})\n` : "") +
      camisetaTxt +
      (requerPagamento ? `💰 *Valor:* R$ ${valorTotal.toFixed(2).replace(".", ",")} (${formaPag})\n` : `✨ *Inscrição Gratuita*\n`) +
      `\nFico no aguardo de mais instruções. Deus abençoe! 🙏`;

    const linkWhatsappSecretario = `https://api.whatsapp.com/send?phone=${telSecretarioLimpo}&text=${encodeURIComponent(msgSecretario)}`;

    // 2. Pix Copia e Cola e Link do TESOUREIRO (se houver pagamento)
    let codigoPix = "";
    let linkWhatsappTesoureiro = "";

    if (requerPagamento) {
      const chavePix = config?.tesoureiroChavePix || config?.coordenadorWhatsapp || "45999068852";
      const nomeRecebedor = config?.tesoureiroNome || config?.nomeGrupo || "JUSC";
      const cidadeRecebedor = config?.tesoureiroCidadePix || "Foz do Iguacu";

      if (formaPag === "PIX" && chavePix) {
        try {
          const gerador = new GeradorPix({
            chave: chavePix,
            nomeRecebedor,
            cidadeRecebedor,
            valor: valorPagoAgora,
            identificador: codigoInscricao.replace("-", ""),
            descricao: `Inscricao ${campanha.titulo}`.slice(0, 50),
          });
          codigoPix = gerador.gerarCodigo();
        } catch (err) {
          console.error("Erro ao gerar Pix Copia e Cola da inscrição:", err);
        }
      }

      const dataLimiteTxt = campanha.dataLimitePagamento
        ? `⏳ *Data Limite para Pagamento:* ${new Date(campanha.dataLimitePagamento).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}\n`
        : "";

      const msgTesoureiro = formaPag === "DINHEIRO"
        ? `Olá, ${tesoureiroNome}! Gostaria de combinar o pagamento em dinheiro da minha inscrição no evento *${campanha.titulo}*.\n\n` +
          `📋 *Código da Inscrição:* ${codigoInscricao}\n` +
          `👤 *Participante:* ${nomeCompleto.trim()}\n` +
          camisetaTxt +
          `💵 *Valor a Pagar:* R$ ${valorPagoAgora.toFixed(2).replace(".", ",")}` +
          (tipoQuitacao === "PARCELADO_50_50" ? " (50% Entrada)\n" : "\n") +
          dataLimiteTxt +
          (tipoQuitacao === "PARCELADO_50_50" ? `⏳ *Saldo Restante no Evento:* R$ ${valorPagoAgora.toFixed(2).replace(".", ",")}\n` : "") +
          `\nPodemos combinar a entrega do valor? Aguardo seu retorno! Obrigado.`
        : `Olá, ${tesoureiroNome}! Segue o comprovante de pagamento da minha inscrição no evento *${campanha.titulo}*.\n\n` +
          `📋 *Código da Inscrição:* ${codigoInscricao}\n` +
          `👤 *Participante:* ${nomeCompleto.trim()}\n` +
          camisetaTxt +
          `💳 *Forma:* PIX (${tipoQuitacao === "PARCELADO_50_50" ? "50% Entrada" : "Valor Integral"})\n` +
          `💵 *Valor Pago:* R$ ${valorPagoAgora.toFixed(2).replace(".", ",")}\n` +
          dataLimiteTxt +
          (tipoQuitacao === "PARCELADO_50_50" ? `⏳ *Saldo Restante no Evento:* R$ ${valorPagoAgora.toFixed(2).replace(".", ",")}\n` : "") +
          `\nPor gentileza, confirme o recebimento. Obrigado!`;

      linkWhatsappTesoureiro = `https://api.whatsapp.com/send?phone=${telTesoureiroLimpo}&text=${encodeURIComponent(msgTesoureiro)}`;
    }

    return NextResponse.json(
      {
        inscricao,
        codigoPix,
        linkWhatsappSecretario,
        linkWhatsappTesoureiro,
        linkGrupoWhatsapp: campanha.linkGrupoWhatsapp || null,
        dataLimitePagamento: campanha.dataLimitePagamento || null,
        valorTotal,
        valorPagoAgora,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao registrar inscrição:", error);
    return NextResponse.json({ error: "Erro ao registrar inscrição." }, { status: 500 });
  }
}
