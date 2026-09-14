/**
 * Gerador de Pix Copia e Cola (BR Code) baseado na especificação EMV® QRCPS
 * e na implementação do repositório klimadev/gerador-pix.
 */

export interface PixConfig {
  chave: string;
  nomeRecebedor: string;
  cidadeRecebedor: string;
  valor?: number;
  identificador?: string; // TxID (máximo 25 caracteres alfanuméricos)
  descricao?: string;
}

export class GeradorPix {
  private chave: string;
  private nomeRecebedor: string;
  private cidadeRecebedor: string;
  private valor?: number;
  private identificador: string;
  private descricao?: string;

  constructor({
    chave,
    nomeRecebedor,
    cidadeRecebedor,
    valor,
    identificador = "***",
    descricao,
  }: PixConfig) {
    this.chave = chave.trim();
    this.nomeRecebedor = this.removerAcentos(nomeRecebedor.trim()).slice(0, 25);
    this.cidadeRecebedor = this.removerAcentos(cidadeRecebedor.trim()).slice(0, 15);
    this.valor = valor && valor > 0 ? Number(valor.toFixed(2)) : undefined;
    this.identificador = (identificador || "***").replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "***";
    this.descricao = descricao ? this.removerAcentos(descricao.trim()).slice(0, 50) : undefined;
  }

  private removerAcentos(texto: string): string {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, "");
  }

  private formatarCampo(id: string, valor: string): string {
    const tamanho = valor.length.toString().padStart(2, "0");
    return `${id}${tamanho}${valor}`;
  }

  private gerarMerchantAccountInformation(): string {
    const gui = this.formatarCampo("00", "br.gov.bcb.pix");
    const chavePix = this.formatarCampo("01", this.chave);
    const descricao = this.descricao ? this.formatarCampo("02", this.descricao) : "";
    return this.formatarCampo("26", `${gui}${chavePix}${descricao}`);
  }

  private gerarAdditionalDataField(): string {
    const txId = this.formatarCampo("05", this.identificador);
    return this.formatarCampo("62", txId);
  }

  /**
   * Calcula o CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF)
   */
  private calcularCRC16(payload: string): string {
    let crc = 0xffff;
    const polinomio = 0x1021;

    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polinomio) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  /**
   * Monta e retorna o código Pix Copia e Cola completo e validado
   */
  public gerarCodigo(): string {
    let payload = "";

    // 00 - Payload Format Indicator
    payload += this.formatarCampo("00", "01");

    // 26 - Merchant Account Information (Pix)
    payload += this.gerarMerchantAccountInformation();

    // 52 - Merchant Category Code
    payload += this.formatarCampo("52", "0000");

    // 53 - Transaction Currency (986 = BRL)
    payload += this.formatarCampo("53", "986");

    // 54 - Transaction Amount (se especificado)
    if (this.valor !== undefined) {
      payload += this.formatarCampo("54", this.valor.toFixed(2));
    }

    // 58 - Country Code
    payload += this.formatarCampo("58", "BR");

    // 59 - Merchant Name
    payload += this.formatarCampo("59", this.nomeRecebedor || "JUSC");

    // 60 - Merchant City
    payload += this.formatarCampo("60", this.cidadeRecebedor || "FOZ DO IGUACU");

    // 62 - Additional Data Field (TxID)
    payload += this.gerarAdditionalDataField();

    // 63 - CRC16 (Tag + Tamanho 04)
    payload += "6304";

    const crc = this.calcularCRC16(payload);
    return `${payload}${crc}`;
  }
}

/**
 * Cria o link de WhatsApp para envio do comprovante para o tesoureiro com relatório completo do pedido
 */
export function gerarLinkComprovanteWhatsapp({
  telefoneTesoureiro,
  codigoPedido,
  nomeComprador,
  tituloCampanha,
  modelo,
  tamanho,
  quantidade,
  personalizacaoNome,
  personalizacaoNum,
  formaPagamento,
  tipoQuitacao,
  valorTotal,
  valorPagoAgora,
  saldoRestante,
}: {
  telefoneTesoureiro: string;
  codigoPedido: string;
  nomeComprador: string;
  tituloCampanha: string;
  modelo: string;
  tamanho: string;
  quantidade: number;
  personalizacaoNome?: string | null;
  personalizacaoNum?: string | null;
  formaPagamento: string;
  tipoQuitacao: string;
  valorTotal: number;
  valorPagoAgora: number;
  saldoRestante: number;
}): string {
  const telLimpo = telefoneTesoureiro.replace(/\D/g, "");

  const personalizacaoTxt =
    personalizacaoNome || personalizacaoNum
      ? `\n✍️ *Personalização:* ${[personalizacaoNome ? `Nome: ${personalizacaoNome}` : "", personalizacaoNum ? `Nº: ${personalizacaoNum}` : ""].filter(Boolean).join(" | ")}`
      : "";

  const condicaoTxt =
    tipoQuitacao === "PARCELADO_50_50"
      ? `50% no pedido (R$ ${valorPagoAgora.toFixed(2).replace(".", ",")}) + 50% na retirada (R$ ${saldoRestante.toFixed(2).replace(".", ",")})`
      : `Valor integral (100% - R$ ${valorTotal.toFixed(2).replace(".", ",")})`;

  const mensagem = `Olá! Acabei de fazer meu pedido de camiseta pelo site do grupo:

📋 *Pedido:* ${codigoPedido}
👤 *Comprador:* ${nomeComprador}
👕 *Campanha:* ${tituloCampanha}
✨ *Modelo:* ${modelo}
📏 *Tamanho:* ${tamanho}
🔢 *Quantidade:* ${quantidade}${personalizacaoTxt}

💰 *Valor Total:* R$ ${valorTotal.toFixed(2).replace(".", ",")}
💳 *Pagamento:* ${formaPagamento} (${condicaoTxt})

📎 *Segue anexo o comprovante de pagamento para conferência!*`;

  return `https://api.whatsapp.com/send?phone=${telLimpo}&text=${encodeURIComponent(mensagem)}`;
}
