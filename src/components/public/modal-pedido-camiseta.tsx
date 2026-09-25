"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Shirt,
  Sparkles,
  AlertCircle,
  CreditCard,
  Banknote,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { normalizarModelos, ModeloPrecoItem } from "@/lib/utils";

export interface FotoItemCampanha {
  url: string;
  label?: string;
}

export interface CampanhaModalData {
  id: string;
  titulo: string;
  descricao?: string | null;
  fotos: (string | FotoItemCampanha)[];
  modelos: (string | ModeloPrecoItem)[];
  tamanhosDisponiveis: string[];
  precoUnitario: number;
  permiteNome: boolean;
  permiteNumero: boolean;
  dataFim: string | Date;
}

interface ModalPedidoCamisetaProps {
  campanha: CampanhaModalData;
  aberto: boolean;
  onFechar: () => void;
}

export function ModalPedidoCamiseta({
  campanha,
  aberto,
  onFechar,
}: ModalPedidoCamisetaProps) {
  const [fotoAtiva, setFotoAtiva] = useState(0);

  const modelosNormalizados = normalizarModelos(
    campanha.modelos,
    campanha.precoUnitario || 0
  );

  // Form State
  const [nomeComprador, setNomeComprador] = useState("");
  const [telefoneComprador, setTelefoneComprador] = useState("");
  const [modelo, setModelo] = useState(modelosNormalizados[0]?.nome || "Padrão");
  const [tamanho, setTamanho] = useState(campanha.tamanhosDisponiveis[0] || "M");
  const [quantidade, setQuantidade] = useState(1);
  const [personalizacaoNome, setPersonalizacaoNome] = useState("");
  const [personalizacaoNum, setPersonalizacaoNum] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<"PIX" | "DINHEIRO">("PIX");
  const [tipoQuitacao, setTipoQuitacao] = useState<"INTEGRAL" | "PARCELADO_50_50">("INTEGRAL");

  // Flow State
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucessoData, setSucessoData] = useState<{
    pedido: any;
    codigoPix?: string;
    linkWhatsapp: string;
    valorTotal: number;
    valorPagoAgora: number;
    saldoRestante: number;
  } | null>(null);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const containerScrollRef = useRef<HTMLDivElement>(null);

  // Travar o scroll do body quando o modal estiver aberto e fechar com Escape
  useEffect(() => {
    if (!aberto) return;

    // Salvar overflow original
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleFechar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [aberto]);

  // Sempre garantir que o topo da tela seja exibido ao concluir o pedido ou ao abrir o modal
  useEffect(() => {
    if (containerScrollRef.current) {
      containerScrollRef.current.scrollTop = 0;
    }
  }, [sucessoData, aberto]);

  if (!aberto) return null;

  // Preço do modelo selecionado ou preço base da campanha
  const modeloObj = modelosNormalizados.find((m) => m.nome === modelo);
  const precoUnit = modeloObj?.preco !== undefined ? modeloObj.preco : (campanha.precoUnitario || 0);
  const valorTotal = precoUnit * quantidade;
  const valorAgora = tipoQuitacao === "PARCELADO_50_50" ? valorTotal / 2 : valorTotal;
  const valorRetirada = tipoQuitacao === "PARCELADO_50_50" ? valorTotal / 2 : 0;

  async function handleEnviarPedido(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nomeComprador.trim() || !telefoneComprador.trim()) {
      setErro("Por favor, preencha seu nome e WhatsApp.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campanhaId: campanha.id,
          nomeComprador: nomeComprador.trim(),
          telefoneComprador: telefoneComprador.trim(),
          modelo,
          tamanho,
          quantidade,
          personalizacaoNome: campanha.permiteNome ? personalizacaoNome.trim() : null,
          personalizacaoNum: campanha.permiteNumero ? personalizacaoNum.trim() : null,
          formaPagamento,
          tipoQuitacao,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao registrar seu pedido. Tente novamente.");
        return;
      }

      setSucessoData({
        pedido: data.pedido,
        codigoPix: data.codigoPix,
        linkWhatsapp: data.linkWhatsapp,
        valorTotal: data.valorTotal,
        valorPagoAgora: data.valorPagoAgora,
        saldoRestante: data.saldoRestante,
      });

      if (containerScrollRef.current) {
        containerScrollRef.current.scrollTop = 0;
      }
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function handleCopiarPix() {
    if (!sucessoData?.codigoPix) return;
    navigator.clipboard.writeText(sucessoData.codigoPix);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 3000);
  }

  function handleFechar() {
    setSucessoData(null);
    setErro("");
    onFechar();
  }

  return (
    <div
      onClick={handleFechar}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-[#12141a] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header Fixo do Modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md flex-shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFC72C]/20 text-neutral-950 dark:text-[#FFC72C]">
              <Shirt className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-neutral-900 dark:text-white leading-tight">
                {sucessoData ? "Pedido Realizado com Sucesso!" : campanha.titulo}
              </h3>
              <p className="text-xs text-neutral-500">
                {sucessoData ? "Siga os passos abaixo para confirmar" : "Faça seu pedido online oficial"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFechar}
            aria-label="Fechar janela"
            className="p-2.5 rounded-2xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll Suave */}
        <div ref={containerScrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        {sucessoData ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-neutral-900 dark:text-white">
                Pedido {sucessoData.pedido?.codigoPedido} Registrado!
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
                Obrigado, <strong className="text-neutral-900 dark:text-white">{nomeComprador}</strong>! Seu pedido foi gravado com sucesso.
              </p>
            </div>

            {/* Card de Resumo Financeiro */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#1c1a13] border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs text-neutral-800 dark:text-amber-200">
              <div className="flex justify-between font-medium">
                <span>Itens:</span>
                <span>{quantidade}x Modelo {modelo} ({tamanho})</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total do Pedido:</span>
                <span className="font-bold text-sm text-neutral-950 dark:text-white">
                  R$ {sucessoData.valorTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-amber-200/60 dark:border-amber-900/60">
                <span>Valor a pagar agora ({tipoQuitacao === "PARCELADO_50_50" ? "50%" : "100%"}):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  R$ {sucessoData.valorPagoAgora.toFixed(2).replace(".", ",")}
                </span>
              </div>
              {sucessoData.saldoRestante > 0 && (
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400 text-[11px]">
                  <span>Restante na retirada da camiseta (50%):</span>
                  <span>R$ {sucessoData.saldoRestante.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
            </div>

            {/* Se PIX: Exibir Código Pix Copia e Cola */}
            {formaPagamento === "PIX" && sucessoData.codigoPix && (
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Código Pix Copia e Cola (BR Code)
                </label>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[11px] font-mono break-all max-h-24 overflow-y-auto select-all text-neutral-800 dark:text-neutral-200">
                  {sucessoData.codigoPix}
                </div>
                <button
                  type="button"
                  onClick={handleCopiarPix}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    copiadoPix
                      ? "bg-emerald-600 text-white"
                      : "bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 shadow-sm"
                  }`}
                >
                  {copiadoPix ? (
                    <>
                      <Check className="w-4 h-4" />
                      Código Pix Copiado com Sucesso!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Código Pix para Pagar
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Se DINHEIRO: Aviso de pagamento com a liderança */}
            {formaPagamento === "DINHEIRO" && (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300">
                <p className="font-bold">Pagamento em Dinheiro Físico</p>
                <p className="text-[11px] mt-0.5">
                  Por favor, entregue o valor correspondente de R$ {sucessoData.valorPagoAgora.toFixed(2).replace(".", ",")} diretamente à liderança/tesouraria no próximo encontro para validação.
                </p>
              </div>
            )}

            {/* Ação Principal: Enviar comprovante pelo WhatsApp */}
            <div className="space-y-2 pt-2">
              <a
                href={sucessoData.linkWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-95 text-center"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>Enviar Comprovante no WhatsApp do Tesoureiro</span>
              </a>
              <p className="text-[11px] text-center text-neutral-500">
                O WhatsApp abrirá com todos os dados do pedido já preenchidos. Basta anexar o print do comprovante!
              </p>

              <button
                type="button"
                onClick={handleFechar}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs transition-colors mt-2"
              >
                Concluir e Fechar Janela
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEnviarPedido} className="p-6 space-y-5">
            {erro && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            {/* Galeria de Fotos (mínimo 2) */}
            {campanha.fotos && campanha.fotos.length > 0 && (() => {
              const fotosFormatadas: FotoItemCampanha[] = campanha.fotos.map((f) =>
                typeof f === "string" ? { url: f, label: "" } : f
              );
              const fotoAtual = fotosFormatadas[fotoAtiva] || fotosFormatadas[0];

              return (
                <div className="space-y-2">
                  <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-black/5">
                    <Image
                      src={fotoAtual.url}
                      alt={fotoAtual.label || `Foto ${fotoAtiva + 1} de ${campanha.titulo}`}
                      fill
                      unoptimized
                      className="object-contain"
                    />

                    {fotoAtual.label && (
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg border border-white/20">
                        {fotoAtual.label}
                      </div>
                    )}

                    {campanha.fotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setFotoAtiva((prev) => (prev > 0 ? prev - 1 : fotosFormatadas.length - 1))
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFotoAtiva((prev) => (prev < fotosFormatadas.length - 1 ? prev + 1 : 0))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Miniaturas com Label */}
                  {fotosFormatadas.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {fotosFormatadas.map((f, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFotoAtiva(idx)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all flex flex-col justify-end p-0.5 ${
                            fotoAtiva === idx
                              ? "border-[#FFC72C] scale-105 shadow-md"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <Image src={f.url} alt={`Thumb ${idx}`} fill unoptimized className="object-cover -z-10" />
                          {f.label && (
                            <span className="w-full text-center truncate bg-black/80 text-[9px] text-white font-bold px-1 rounded">
                              {f.label}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {campanha.descricao && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                {campanha.descricao}
              </p>
            )}

            {/* Dados do Comprador */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nomeComprador}
                  onChange={(e) => setNomeComprador(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seu WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={telefoneComprador}
                  onChange={(e) => setTelefoneComprador(e.target.value)}
                  placeholder="(45) 99999-9999"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
                />
              </div>
            </div>

            {/* Escolha de Modelo, Tamanho e Quantidade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Modelo *
                </label>
                <select
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
                >
                  {modelosNormalizados.map((m) => (
                    <option key={m.nome} value={m.nome}>
                      {m.nome} {m.preco !== undefined ? `(R$ ${m.preco.toFixed(2).replace(".", ",")})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tamanho *
                </label>
                <select
                  value={tamanho}
                  onChange={(e) => setTamanho(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
                >
                  {campanha.tamanhosDisponiveis.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantidade}
                  onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
                />
              </div>
            </div>

            {/* Personalização (Nome e/ou Número nas costas) */}
            {(campanha.permiteNome || campanha.permiteNumero) && (
              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-[#1c1a13] border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Personalização da Camiseta
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {campanha.permiteNome && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Nome nas Costas (opcional)
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        value={personalizacaoNome}
                        onChange={(e) => setPersonalizacaoNome(e.target.value)}
                        placeholder="Ex: BRUNÃO"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs uppercase focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
                      />
                    </div>
                  )}

                  {campanha.permiteNumero && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Número nas Costas (opcional)
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={personalizacaoNum}
                        onChange={(e) => setPersonalizacaoNum(e.target.value)}
                        placeholder="Ex: 10"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Opções de Pagamento */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Forma de Pagamento *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormaPagamento("PIX")}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      formaPagamento === "PIX"
                        ? "border-[#FFC72C] bg-[#FFC72C]/15 text-neutral-950 dark:text-white ring-2 ring-[#FFC72C]/30"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    PIX (Copia e Cola)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormaPagamento("DINHEIRO")}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      formaPagamento === "DINHEIRO"
                        ? "border-[#FFC72C] bg-[#FFC72C]/15 text-neutral-950 dark:text-white ring-2 ring-[#FFC72C]/30"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-amber-500" />
                    Dinheiro em Mãos
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Condição de Quitação *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTipoQuitacao("INTEGRAL")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      tipoQuitacao === "INTEGRAL"
                        ? "border-[#FFC72C] bg-[#FFC72C]/15 text-neutral-950 dark:text-white ring-2 ring-[#FFC72C]/30"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="font-bold text-xs">100% no Pedido</div>
                    <div className="text-[10px] opacity-75">Quitação total agora</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoQuitacao("PARCELADO_50_50")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      tipoQuitacao === "PARCELADO_50_50"
                        ? "border-[#FFC72C] bg-[#FFC72C]/15 text-neutral-950 dark:text-white ring-2 ring-[#FFC72C]/30"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="font-bold text-xs">50% + 50%</div>
                    <div className="text-[10px] opacity-75">Metade agora, metade ao retirar</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Totalizador */}
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-500 block">Total do Pedido ({quantidade}x R$ {precoUnit.toFixed(2)})</span>
                <span className="text-base font-black text-neutral-950 dark:text-white">
                  R$ {valorTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Pagar no Pedido:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  R$ {valorAgora.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={enviando}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enviando ? "Processando pedido..." : "Confirmar e Gerar Pagamento"}
              </button>

              <button
                type="button"
                onClick={handleFechar}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-xs transition-colors"
              >
                Cancelar / Voltar
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
