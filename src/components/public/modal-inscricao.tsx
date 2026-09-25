"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  AlertCircle,
  CreditCard,
  Banknote,
  Calendar,
  User,
  Phone,
  ShieldCheck,
  Heart,
  AlertTriangle,
  ClipboardList,
  Shirt,
} from "lucide-react";
import { formatarCpf, formatarTelefone, normalizarModelos, formatarDataHoraLimite } from "@/lib/utils";
import { calcularIdade } from "@/lib/rules";
import { InputDataBr } from "@/components/ui/input-data-br";

export interface CampanhaCamisetaVinculada {
  id: string;
  titulo: string;
  descricao?: string | null;
  fotos?: any;
  modelos?: any;
  tamanhosDisponiveis?: any;
  precoUnitario: number;
  permiteNome?: boolean;
  permiteNumero?: boolean;
}

export interface CampanhaInscricaoData {
  id: string;
  titulo: string;
  descricao?: string | null;
  fotoUrl?: string | null;
  dataLimite: string | Date;
  dataLimitePagamento?: string | Date | null;
  ativa: boolean;
  requerPagamento: boolean;
  valor: number;
  permiteParcelamento: boolean;
  permiteCamiseta?: boolean;
  campanhaCamisetaId?: string | null;
  camisetaInclusaNoValor?: boolean;
  campanhaCamiseta?: CampanhaCamisetaVinculada | null;
  linkGrupoWhatsapp?: string | null;
  campoNomeCompleto: boolean;
  campoCpf: boolean;
  campoTelefone: boolean;
  campoDataNascimento: boolean;
  campoNomeResponsavel: boolean;
  campoParentescoResponsavel: boolean;
  campoTelefoneResponsavel: boolean;
  campoAlergia: boolean;
  campoIntolerancia: boolean;
  campoRemedioContinuo?: boolean;
  campoSexo?: boolean;
  campoBatismo: boolean;
  campoPrimeiraEucaristia: boolean;
  campoCrisma: boolean;
}

interface ModalInscricaoProps {
  campanha: CampanhaInscricaoData;
  aberto: boolean;
  onFechar: () => void;
}

export function ModalInscricao({
  campanha,
  aberto,
  onFechar,
}: ModalInscricaoProps) {
  // Form State
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [sexo, setSexo] = useState<"MASCULINO" | "FEMININO" | "">("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimentoBr, setDataNascimentoBr] = useState("");
  const [dataNascimentoIso, setDataNascimentoIso] = useState<string | null>(null);

  // Responsável
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [parentescoResponsavel, setParentescoResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");

  // Saúde & Alimentação
  const [possuiAlergia, setPossuiAlergia] = useState(false);
  const [descricaoAlergia, setDescricaoAlergia] = useState("");
  const [intoleranciaGluten, setIntoleranciaGluten] = useState(false);
  const [intoleranciaLactose, setIntoleranciaLactose] = useState(false);
  const [usaRemedioContinuo, setUsaRemedioContinuo] = useState(false);
  const [descricaoRemedioContinuo, setDescricaoRemedioContinuo] = useState("");

  // Sacramentos
  const [batismo, setBatismo] = useState(false);
  const [primeiraEucaristia, setPrimeiraEucaristia] = useState(false);
  const [crisma, setCrisma] = useState(false);

  // Pedido de camiseta junto com a inscrição
  const [pediuCamiseta, setPediuCamiseta] = useState(false);
  const [camisetaModelo, setCamisetaModelo] = useState("");
  const [camisetaTamanho, setCamisetaTamanho] = useState("");
  const [camisetaNomePersonalizado, setCamisetaNomePersonalizado] = useState("");
  const [camisetaNumeroPersonalizado, setCamisetaNumeroPersonalizado] = useState("");

  // Normalização da camiseta vinculada
  const camCamiseta = campanha.campanhaCamiseta;
  const modelosCamiseta = camCamiseta
    ? normalizarModelos(camCamiseta.modelos, camCamiseta.precoUnitario)
    : [];

  let tamanhosCamiseta: string[] = [];
  if (camCamiseta?.tamanhosDisponiveis) {
    if (Array.isArray(camCamiseta.tamanhosDisponiveis)) {
      tamanhosCamiseta = camCamiseta.tamanhosDisponiveis;
    } else {
      try {
        tamanhosCamiseta = JSON.parse(camCamiseta.tamanhosDisponiveis);
      } catch {
        tamanhosCamiseta = [String(camCamiseta.tamanhosDisponiveis)];
      }
    }
  }
  if (tamanhosCamiseta.length === 0 && camCamiseta) {
    tamanhosCamiseta = ["PP", "P", "M", "G", "GG", "XG"];
  }

  // Preencher defaults de camiseta ao abrir
  useEffect(() => {
    if (campanha.permiteCamiseta && camCamiseta) {
      if (campanha.camisetaInclusaNoValor) {
        setPediuCamiseta(true);
      }
      if (modelosCamiseta.length > 0 && !camisetaModelo) {
        setCamisetaModelo(modelosCamiseta[0].nome);
      }
      if (tamanhosCamiseta.length > 0 && !camisetaTamanho) {
        setCamisetaTamanho(tamanhosCamiseta[0]);
      }
    }
  }, [campanha, camCamiseta]);

  // Financeiro
  const [formaPagamento, setFormaPagamento] = useState<"PIX" | "DINHEIRO">("PIX");
  const [tipoQuitacao, setTipoQuitacao] = useState<"INTEGRAL" | "PARCELADO_50_50">("INTEGRAL");

  // Flow State
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucessoData, setSucessoData] = useState<{
    inscricao: any;
    codigoPix?: string;
    linkWhatsappSecretario: string;
    linkWhatsappTesoureiro?: string;
    linkGrupoWhatsapp?: string | null;
    dataLimitePagamento?: string | Date | null;
    valorTotal: number;
    valorPagoAgora: number;
  } | null>(null);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [clicouGrupoWhatsapp, setClicouGrupoWhatsapp] = useState(false);

  // Cálculo dinâmico de idade
  const idadeCalculada = dataNascimentoIso ? calcularIdade(dataNascimentoIso) : null;

  // Travar o scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (!aberto) return;

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

  if (!aberto) return null;

  const modeloSelecionadoObj = modelosCamiseta.find((m) => m.nome === camisetaModelo);
  const precoCamiseta = modeloSelecionadoObj?.preco ?? (camCamiseta?.precoUnitario || 0);

  const valorCamisetaCalculado = pediuCamiseta
    ? (campanha.camisetaInclusaNoValor ? 0 : precoCamiseta)
    : 0;

  const valorBaseInscricao = campanha.requerPagamento ? Number(campanha.valor) || 0 : 0;
  const valorTotal = valorBaseInscricao + valorCamisetaCalculado;
  const requerPagamento = valorTotal > 0;
  const valorAgora = tipoQuitacao === "PARCELADO_50_50" ? valorTotal / 2 : valorTotal;
  const saldoRestante = tipoQuitacao === "PARCELADO_50_50" ? valorTotal / 2 : 0;

  async function handleEnviarInscricao(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (campanha.campoNomeCompleto && !nomeCompleto.trim()) {
      setErro("Por favor, preencha seu nome completo.");
      return;
    }

    if (campanha.campoSexo && !sexo) {
      setErro("Por favor, selecione seu sexo (Masculino ou Feminino).");
      return;
    }

    if (campanha.campoTelefone && !telefone.trim()) {
      setErro("Por favor, preencha seu telefone/WhatsApp de contato.");
      return;
    }

    if (campanha.campoCpf && !cpf.trim()) {
      setErro("Por favor, preencha seu CPF.");
      return;
    }

    if (campanha.campoDataNascimento && (!dataNascimentoBr || !dataNascimentoIso)) {
      setErro("Por favor, informe uma data de nascimento válida.");
      return;
    }

    if (campanha.campoNomeResponsavel && !nomeResponsavel.trim()) {
      setErro("Por favor, preencha o nome do responsável.");
      return;
    }

    if (campanha.campoParentescoResponsavel && !parentescoResponsavel.trim()) {
      setErro("Por favor, informe o grau de parentesco do responsável.");
      return;
    }

    if (campanha.campoTelefoneResponsavel && !telefoneResponsavel.trim()) {
      setErro("Por favor, preencha o telefone do responsável.");
      return;
    }

    if (possuiAlergia && !descricaoAlergia.trim()) {
      setErro("Por favor, descreva qual alergia possui para tomarmos os devidos cuidados.");
      return;
    }

    if (usaRemedioContinuo && !descricaoRemedioContinuo.trim()) {
      setErro("Por favor, descreva qual remédio contínuo e dosagem você utiliza.");
      return;
    }

    if (pediuCamiseta && (!camisetaModelo || !camisetaTamanho)) {
      setErro("Por favor, escolha o modelo e o tamanho da camiseta desejada.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campanhaId: campanha.id,
          nomeCompleto: nomeCompleto.trim(),
          sexo: campanha.campoSexo ? sexo : null,
          cpf: campanha.campoCpf ? cpf.trim() : null,
          telefone: telefone.trim(),
          dataNascimento: campanha.campoDataNascimento ? dataNascimentoIso : null,
          nomeResponsavel: campanha.campoNomeResponsavel ? nomeResponsavel.trim() : null,
          parentescoResponsavel: campanha.campoParentescoResponsavel ? parentescoResponsavel.trim() : null,
          telefoneResponsavel: campanha.campoTelefoneResponsavel ? telefoneResponsavel.trim() : null,
          possuiAlergia: campanha.campoAlergia ? possuiAlergia : false,
          descricaoAlergia: campanha.campoAlergia && possuiAlergia ? descricaoAlergia.trim() : null,
          intoleranciaGluten: campanha.campoIntolerancia ? intoleranciaGluten : false,
          intoleranciaLactose: campanha.campoIntolerancia ? intoleranciaLactose : false,
          usaRemedioContinuo: campanha.campoRemedioContinuo ? usaRemedioContinuo : false,
          descricaoRemedioContinuo: campanha.campoRemedioContinuo && usaRemedioContinuo ? descricaoRemedioContinuo.trim() : null,
          batismo: campanha.campoBatismo ? batismo : false,
          primeiraEucaristia: campanha.campoPrimeiraEucaristia ? primeiraEucaristia : false,
          crisma: campanha.campoCrisma ? crisma : false,
          pediuCamiseta: Boolean(pediuCamiseta),
          camisetaModelo: pediuCamiseta ? camisetaModelo : null,
          camisetaTamanho: pediuCamiseta ? camisetaTamanho : null,
          camisetaNomePersonalizado: pediuCamiseta && camisetaNomePersonalizado ? camisetaNomePersonalizado.trim() : null,
          camisetaNumeroPersonalizado: pediuCamiseta && camisetaNumeroPersonalizado ? camisetaNumeroPersonalizado.trim() : null,
          camisetaValor: valorCamisetaCalculado,
          formaPagamento: requerPagamento ? formaPagamento : "ISENTO",
          tipoQuitacao: requerPagamento ? tipoQuitacao : "INTEGRAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao registrar sua inscrição. Tente novamente.");
        return;
      }

      setSucessoData({
        inscricao: data.inscricao,
        codigoPix: data.codigoPix,
        linkWhatsappSecretario: data.linkWhatsappSecretario,
        linkWhatsappTesoureiro: data.linkWhatsappTesoureiro,
        linkGrupoWhatsapp: data.linkGrupoWhatsapp || campanha.linkGrupoWhatsapp || null,
        dataLimitePagamento: data.dataLimitePagamento || campanha.dataLimitePagamento || null,
        valorTotal: data.valorTotal,
        valorPagoAgora: data.valorPagoAgora,
      });
    } catch (err) {
      console.error(err);
      setErro("Falha na comunicação com o servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function handleEntrarNoGrupoWhatsapp() {
    setClicouGrupoWhatsapp(true);
    if (sucessoData?.inscricao?.id) {
      fetch(`/api/inscricoes/${sucessoData.inscricao.id}/grupo-whatsapp`, {
        method: "POST",
      }).catch((err) => console.error("Erro ao registrar entrada no grupo:", err));
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
    setClicouGrupoWhatsapp(false);
    setErro("");
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-white dark:bg-[#111318] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#16181f]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFC72C] text-neutral-950 flex items-center justify-center font-black shadow-sm">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base leading-tight">
                {sucessoData ? "Inscrição Concluída!" : campanha.titulo}
              </h2>
              <span className="text-[11px] font-bold text-amber-600 dark:text-[#FFC72C]">
                {sucessoData ? "Tudo pronto!" : "Ficha Oficial de Inscrição"}
              </span>
            </div>
          </div>
          <button
            onClick={handleFechar}
            className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TELA DE SUCESSO */}
          {sucessoData ? (
            <div className="text-center space-y-6 animate-fadeIn py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg border-2 border-emerald-400/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Inscrição Registrada com Sucesso
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white mt-1">
                  Oba, {sucessoData.inscricao.nomeCompleto.split(" ")[0]}! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1 max-w-md mx-auto">
                  Sua inscrição para o evento <strong>{campanha.titulo}</strong> foi gerada.
                </p>
                <div className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono font-black text-sm text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700">
                  Código: {sucessoData.inscricao.codigoInscricao}
                </div>
              </div>

              {/* BLOCOS DE CONCLUSÃO DE INSCRIÇÃO CONFORME A FORMA DE PAGAMENTO E GRUPO DE WHATSAPP */}
              {(() => {
                const temGrupo = Boolean(sucessoData.linkGrupoWhatsapp);
                const isPix = sucessoData.valorTotal > 0 && sucessoData.inscricao?.formaPagamento === "PIX";
                const isDinheiro = sucessoData.valorTotal > 0 && sucessoData.inscricao?.formaPagamento === "DINHEIRO";

                const renderCardSecretario = () => (
                  <div key="card-secretario" className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-[#FFC72C] text-left space-y-3">
                    <div className="flex items-center gap-2 text-neutral-950 dark:text-amber-300 font-black text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Confirme com o Secretário</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Para validar sua vaga na lista oficial, envie a confirmação instantânea para o WhatsApp do nosso secretário. Já preparamos a mensagem para você!
                    </p>
                    <a
                      href={sucessoData.linkWhatsappSecretario}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span>Confirmar no WhatsApp do Secretário</span>
                    </a>
                  </div>
                );

                const renderCardGrupoWhatsapp = () => {
                  if (!sucessoData.linkGrupoWhatsapp) return null;
                  return (
                    <div key="card-grupo" className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-left space-y-3">
                      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-xs sm:text-sm">
                        <MessageCircle className="w-4 h-4 text-emerald-500" />
                        <span>Grupo Oficial de WhatsApp do Evento</span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        Entre agora no grupo de WhatsApp oficial para não perder comunicados, caronas, programação e orientações deste encontro.
                      </p>
                      <a
                        href={sucessoData.linkGrupoWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleEntrarNoGrupoWhatsapp}
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        <MessageCircle className="w-5 h-5 fill-white" />
                        <span>{clicouGrupoWhatsapp ? "Acessar Grupo Novamente" : "Entrar no Grupo de WhatsApp"}</span>
                      </a>
                      {clicouGrupoWhatsapp && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 pt-0.5">
                          <Check className="w-3.5 h-3.5" />
                          Seu acesso ao grupo foi registrado com sucesso!
                        </p>
                      )}
                    </div>
                  );
                };

                const renderCardPix = () => {
                  if (sucessoData.valorTotal <= 0) return null;
                  return (
                    <div key="card-pix" className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                          Pagamento via PIX {sucessoData.inscricao.pediuCamiseta ? "+ Camiseta" : ""}
                        </span>
                        <span className="text-xs font-black text-neutral-900 dark:text-white">
                          R$ {sucessoData.valorPagoAgora.toFixed(2).replace(".", ",")}
                        </span>
                      </div>

                      {sucessoData.dataLimitePagamento && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            <strong>Data Limite para Pagamento:</strong> {formatarDataHoraLimite(sucessoData.dataLimitePagamento)}
                          </span>
                        </div>
                      )}

                      {sucessoData.inscricao.pediuCamiseta && (
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-300">
                          <span className="font-black flex items-center gap-1.5">
                            <Shirt className="w-3.5 h-3.5 text-purple-500" />
                            Camiseta incluída no pedido:
                          </span>
                          <span className="text-[11px] block mt-0.5">
                            Modelo: <strong>{sucessoData.inscricao.camisetaModelo}</strong> | Tamanho: <strong>{sucessoData.inscricao.camisetaTamanho}</strong>
                            {sucessoData.inscricao.camisetaNomePersonalizado && ` | Nome: ${sucessoData.inscricao.camisetaNomePersonalizado}`}
                            {sucessoData.inscricao.camisetaNumeroPersonalizado && ` | Nº ${sucessoData.inscricao.camisetaNumeroPersonalizado}`}
                          </span>
                        </div>
                      )}

                      {sucessoData.codigoPix && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                            Pix Copia e Cola:
                          </label>
                          <div className="relative">
                            <textarea
                              readOnly
                              value={sucessoData.codigoPix}
                              className="w-full text-[11px] font-mono p-2.5 pr-24 rounded-xl bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 h-16 resize-none focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleCopiarPix}
                              className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-black flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                            >
                              {copiadoPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiadoPix ? "Copiado!" : "Copiar"}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {sucessoData.linkWhatsappTesoureiro && (
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                            Após pagar, envie o comprovante diretamente para a tesouraria:
                          </p>
                          <a
                            href={sucessoData.linkWhatsappTesoureiro}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-400" />
                            <span>Enviar Comprovante ao Tesoureiro</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                };

                const renderCardDinheiro = () => {
                  if (sucessoData.valorTotal <= 0) return null;
                  return (
                    <div key="card-dinheiro" className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                          Pagamento em Dinheiro {sucessoData.inscricao.pediuCamiseta ? "+ Camiseta" : ""}
                        </span>
                        <span className="text-xs font-black text-neutral-900 dark:text-white">
                          R$ {sucessoData.valorPagoAgora.toFixed(2).replace(".", ",")}
                        </span>
                      </div>

                      {sucessoData.dataLimitePagamento && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            <strong>Data Limite para Pagamento:</strong> {formatarDataHoraLimite(sucessoData.dataLimitePagamento)}
                          </span>
                        </div>
                      )}

                      {sucessoData.inscricao.pediuCamiseta && (
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-300">
                          <span className="font-black flex items-center gap-1.5">
                            <Shirt className="w-3.5 h-3.5 text-purple-500" />
                            Camiseta incluída no pedido:
                          </span>
                          <span className="text-[11px] block mt-0.5">
                            Modelo: <strong>{sucessoData.inscricao.camisetaModelo}</strong> | Tamanho: <strong>{sucessoData.inscricao.camisetaTamanho}</strong>
                            {sucessoData.inscricao.camisetaNomePersonalizado && ` | Nome: ${sucessoData.inscricao.camisetaNomePersonalizado}`}
                            {sucessoData.inscricao.camisetaNumeroPersonalizado && ` | Nº ${sucessoData.inscricao.camisetaNumeroPersonalizado}`}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        Você optou por pagar em dinheiro. Fale com o nosso tesoureiro para acertar o pagamento presencialmente e confirmar sua inscrição.
                      </p>

                      {sucessoData.linkWhatsappTesoureiro && (
                        <a
                          href={sucessoData.linkWhatsappTesoureiro}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <MessageCircle className="w-5 h-5 fill-white" />
                          <span>Falar com o Tesoureiro sobre o Pagamento</span>
                        </a>
                      )}
                    </div>
                  );
                };

                // Regra 1: Se grupo no whatsapp e pagamento por pix:
                // - PIX e enviar comprovante pro tesoureiro
                // - Grupo do whatsapp
                // - Confirmação com o secretário
                if (temGrupo && isPix) {
                  return (
                    <>
                      {renderCardPix()}
                      {renderCardGrupoWhatsapp()}
                      {renderCardSecretario()}
                    </>
                  );
                }

                // Regra 2: Se grupo no whatsapp e pagamento por dinheiro:
                // - Grupo do whatsapp
                // - Confirmação com secretário
                // - Falar com o tesoureiro sobre o pagamento
                if (temGrupo && isDinheiro) {
                  return (
                    <>
                      {renderCardGrupoWhatsapp()}
                      {renderCardSecretario()}
                      {renderCardDinheiro()}
                    </>
                  );
                }

                // Regra 3: Se grupo no whatsapp e não pagamento:
                // - Grupo do whatsapp
                // - Confirmação com secretário
                if (temGrupo && !isPix && !isDinheiro) {
                  return (
                    <>
                      {renderCardGrupoWhatsapp()}
                      {renderCardSecretario()}
                    </>
                  );
                }

                // Regra 4: Se não grupo no Whatsapp e pagamento no PIX:
                // - PIX e enviar comprovante pro tesoureiro
                // - Confirmação com o secretário
                if (!temGrupo && isPix) {
                  return (
                    <>
                      {renderCardPix()}
                      {renderCardSecretario()}
                    </>
                  );
                }

                // Regra 5: Se não grupo no Whatsapp e pagamento por dinheiro:
                // - Confirmação com secretário
                // - Falar com o tesoureiro sobre o pagamento
                if (!temGrupo && isDinheiro) {
                  return (
                    <>
                      {renderCardSecretario()}
                      {renderCardDinheiro()}
                    </>
                  );
                }

                // Regra 6: Se não grupo no Whatsapp e não pagamento:
                // - Confirmação com secretário
                return (
                  <>
                    {renderCardSecretario()}
                  </>
                );
              })()}

              <button
                onClick={handleFechar}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline pt-2"
              >
                Fechar janela
              </button>
            </div>
          ) : (
            /* FORMULÁRIO DE INSCRIÇÃO */
            <form onSubmit={handleEnviarInscricao} className="space-y-5">
              {/* Foto ou Capa da Inscrição (se houver) */}
              {campanha.fotoUrl && (
                <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg bg-neutral-950 flex items-center justify-center min-h-[190px] max-h-[380px]">
                  {/* Fundo desfocado para preenchimento harmônico */}
                  <Image
                    src={campanha.fotoUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover opacity-25 blur-md scale-105 pointer-events-none"
                  />
                  {/* Imagem real nítida e 100% visível sem cortes */}
                  <div className="relative z-10 w-full h-52 sm:h-64 md:h-72 flex items-center justify-center p-2">
                    <Image
                      src={campanha.fotoUrl}
                      alt={campanha.titulo}
                      fill
                      unoptimized
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-20" />
                  <div className="absolute bottom-3 left-3 right-3 text-white z-30 flex items-center justify-between gap-2">
                    <h3 className="font-black text-sm sm:text-base drop-shadow-md truncate">
                      {campanha.titulo}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FFC72C] text-black shadow-md flex-shrink-0">
                      {campanha.requerPagamento
                        ? `Valor: R$ ${Number(campanha.valor || 0).toFixed(2).replace(".", ",")}`
                        : "Inscrição Gratuita"}
                    </span>
                  </div>
                </div>
              )}

              {/* Descrição do Evento (Exibida integralmente com suporte a quebras de linha e caracteres especiais) */}
              {campanha.descricao && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal whitespace-pre-wrap">
                  {campanha.descricao}
                </div>
              )}

              {erro && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{erro}</span>
                </div>
              )}

              {/* SEÇÃO: DADOS DO PARTICIPANTE */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <User className="w-3.5 h-3.5 text-[#FFC72C]" />
                  Dados Pessoais
                </h4>

                {campanha.campoNomeCompleto && (
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex.: João da Silva"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                    />
                  </div>
                )}

                {campanha.campoSexo && (
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Sexo *
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSexo("MASCULINO")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          sexo === "MASCULINO"
                            ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400"
                            : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <span>Masculino</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSexo("FEMININO")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          sexo === "FEMININO"
                            ? "border-pink-500 bg-pink-500/15 text-pink-700 dark:text-pink-300 ring-2 ring-pink-400"
                            : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <span>Feminino</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {campanha.campoTelefone && (
                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                      />
                    </div>
                  )}

                  {campanha.campoCpf && (
                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        CPF *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(formatarCpf(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                      />
                    </div>
                  )}
                </div>

                {/* Data de Nascimento com CÁLCULO DE IDADE EM TEMPO REAL */}
                {campanha.campoDataNascimento && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Data de Nascimento *
                      </label>
                      {idadeCalculada !== null && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 animate-fadeIn">
                          Idade: {idadeCalculada} {idadeCalculada === 1 ? "ano" : "anos"}
                        </span>
                      )}
                    </div>
                    <InputDataBr
                      value={dataNascimentoBr}
                      onChange={(br, iso) => {
                        setDataNascimentoBr(br);
                        setDataNascimentoIso(iso);
                      }}
                      placeholder="DD/MM/AAAA"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Digite ou selecione no calendário. A idade é calculada automaticamente.
                    </p>
                  </div>
                )}
              </div>

              {/* SEÇÃO: DADOS DO RESPONSÁVEL */}
              {(campanha.campoNomeResponsavel ||
                campanha.campoParentescoResponsavel ||
                campanha.campoTelefoneResponsavel) && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <Phone className="w-3.5 h-3.5 text-[#FFC72C]" />
                    Dados do Responsável {idadeCalculada !== null && idadeCalculada < 18 ? "(Obrigatório para menores)" : ""}
                  </h4>

                  {campanha.campoNomeResponsavel && (
                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Nome do Responsável *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex.: Maria da Silva"
                        value={nomeResponsavel}
                        onChange={(e) => setNomeResponsavel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {campanha.campoParentescoResponsavel && (
                      <div>
                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                          Grau de Parentesco *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex.: Mãe, Pai, Avó, Tutor"
                          value={parentescoResponsavel}
                          onChange={(e) => setParentescoResponsavel(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                        />
                      </div>
                    )}

                    {campanha.campoTelefoneResponsavel && (
                      <div>
                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                          Telefone do Responsável *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="(00) 00000-0000"
                          value={telefoneResponsavel}
                          onChange={(e) => setTelefoneResponsavel(formatarTelefone(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SEÇÃO: SAÚDE E ALIMENTAÇÃO */}
              {(campanha.campoAlergia || campanha.campoIntolerancia || campanha.campoRemedioContinuo) && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Saúde & Cuidados Médicos (Opcional)
                  </h4>

                  {campanha.campoAlergia && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={possuiAlergia}
                          onChange={(e) => setPossuiAlergia(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Possui alguma alergia?
                        </span>
                      </label>

                      {possuiAlergia && (
                        <input
                          type="text"
                          required
                          placeholder="Especifique a alergia (medicamento, alimento, picada...)"
                          value={descricaoAlergia}
                          onChange={(e) => setDescricaoAlergia(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C] animate-fadeIn"
                        />
                      )}
                    </div>
                  )}

                  {campanha.campoIntolerancia && (
                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={intoleranciaGluten}
                          onChange={(e) => setIntoleranciaGluten(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Intolerante a Glúten
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={intoleranciaLactose}
                          onChange={(e) => setIntoleranciaLactose(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Intolerante a Lactose
                        </span>
                      </label>
                    </div>
                  )}

                  {campanha.campoRemedioContinuo && (
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usaRemedioContinuo}
                          onChange={(e) => setUsaRemedioContinuo(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Faz uso de algum medicamento contínuo?
                        </span>
                      </label>

                      {usaRemedioContinuo && (
                        <input
                          type="text"
                          required
                          placeholder="Informe o medicamento, dosagem e horário"
                          value={descricaoRemedioContinuo}
                          onChange={(e) => setDescricaoRemedioContinuo(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C] animate-fadeIn"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO: SACRAMENTOS */}
              {(campanha.campoBatismo || campanha.campoPrimeiraEucaristia || campanha.campoCrisma) && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    Sacramentos Recebidos (Opcional)
                  </h4>

                  <div className="flex flex-wrap gap-4 pt-1">
                    {campanha.campoBatismo && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={batismo}
                          onChange={(e) => setBatismo(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Batismo
                        </span>
                      </label>
                    )}

                    {campanha.campoPrimeiraEucaristia && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={primeiraEucaristia}
                          onChange={(e) => setPrimeiraEucaristia(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Primeira Eucaristia
                        </span>
                      </label>
                    )}

                    {campanha.campoCrisma && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={crisma}
                          onChange={(e) => setCrisma(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Crisma
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* SEÇÃO: CAMISETA DO EVENTO */}
              {campanha.permiteCamiseta && camCamiseta && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <Shirt className="w-3.5 h-3.5 text-purple-500" />
                    Camiseta Oficial do Evento ({camCamiseta.titulo})
                  </h4>

                  {/* Toggle ou Banner de Inclusão */}
                  {campanha.camisetaInclusaNoValor ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="font-bold">
                        A camiseta oficial está inclusa no valor da sua inscrição! Escolha seu modelo e tamanho abaixo:
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pediuCamiseta}
                          onChange={(e) => setPediuCamiseta(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-black text-neutral-900 dark:text-white block">
                            Quero incluir a camiseta oficial do evento no meu pedido
                          </span>
                          <span className="text-[11px] text-amber-600 dark:text-[#FFC72C] font-bold">
                            + R$ {precoCamiseta.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                  {(campanha.camisetaInclusaNoValor || pediuCamiseta) && (
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 space-y-4 animate-fadeIn">
                      {/* Seleção de Modelo */}
                      {modelosCamiseta.length > 0 && (
                        <div>
                          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                            Modelo da Camiseta *
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {modelosCamiseta.map((mod) => (
                              <button
                                key={mod.nome}
                                type="button"
                                onClick={() => setCamisetaModelo(mod.nome)}
                                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                                  camisetaModelo === mod.nome
                                    ? "border-[#FFC72C] bg-[#FFC72C]/15 text-neutral-950 dark:text-white ring-2 ring-[#FFC72C]"
                                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                }`}
                              >
                                <span className="block font-black">{mod.nome}</span>
                                {!campanha.camisetaInclusaNoValor && (
                                  <span className="text-[10px] text-neutral-500">
                                    R$ {(mod.preco ?? camCamiseta?.precoUnitario ?? 0).toFixed(2).replace(".", ",")}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Seleção de Tamanho */}
                      <div>
                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                          Tamanho da Camiseta *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {tamanhosCamiseta.map((tam) => (
                            <button
                              key={tam}
                              type="button"
                              onClick={() => setCamisetaTamanho(tam)}
                              className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                                camisetaTamanho === tam
                                  ? "border-[#FFC72C] bg-[#FFC72C] text-neutral-950 shadow-sm"
                                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                              }`}
                            >
                              {tam}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Personalização (se a campanha permitir nome ou número) */}
                      {(camCamiseta.permiteNome || camCamiseta.permiteNumero) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          {camCamiseta.permiteNome && (
                            <div>
                              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                                Nome na Camiseta (Opcional)
                              </label>
                              <input
                                type="text"
                                placeholder="Ex.: Lucas"
                                value={camisetaNomePersonalizado}
                                onChange={(e) => setCamisetaNomePersonalizado(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white"
                              />
                            </div>
                          )}

                          {camCamiseta.permiteNumero && (
                            <div>
                              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                                Número na Camiseta (Opcional)
                              </label>
                              <input
                                type="text"
                                placeholder="Ex.: 10"
                                value={camisetaNumeroPersonalizado}
                                onChange={(e) => setCamisetaNumeroPersonalizado(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO: PAGAMENTO (SE HOUVER VALOR TOTAL > 0) */}
              {requerPagamento && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                    Forma de Pagamento
                  </h4>

                  {/* Forma de Pagamento */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormaPagamento("PIX")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        formaPagamento === "PIX"
                          ? "border-[#FFC72C] bg-amber-500/10 text-neutral-950 dark:text-white font-bold ring-2 ring-[#FFC72C]"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 opacity-70"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="text-xs block">PIX (Instantâneo)</span>
                        <span className="text-[10px] text-neutral-500">Copia e Cola</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormaPagamento("DINHEIRO")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        formaPagamento === "DINHEIRO"
                          ? "border-[#FFC72C] bg-amber-500/10 text-neutral-950 dark:text-white font-bold ring-2 ring-[#FFC72C]"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 opacity-70"
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="text-xs block">Dinheiro Físico</span>
                        <span className="text-[10px] text-neutral-500">Com a Tesouraria</span>
                      </div>
                    </button>
                  </div>

                  {/* Quitação: Integral ou 50/50 */}
                  {campanha.permiteParcelamento && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setTipoQuitacao("INTEGRAL")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          tipoQuitacao === "INTEGRAL"
                            ? "border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-black font-black"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <span className="text-xs block">Valor Integral (100%)</span>
                        <span className="text-[10px] opacity-80">
                          R$ {valorTotal.toFixed(2).replace(".", ",")}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTipoQuitacao("PARCELADO_50_50")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          tipoQuitacao === "PARCELADO_50_50"
                            ? "border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-black font-black"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <span className="text-xs block">50% Agora + 50% no Evento</span>
                        <span className="text-[10px] opacity-80">
                          2x R$ {(valorTotal / 2).toFixed(2).replace(".", ",")}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Resumo Financeiro */}
                  <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        {tipoQuitacao === "PARCELADO_50_50" ? "Valor a pagar agora (50%)" : "Total do Pedido"}
                      </span>
                      <span className="text-base font-black text-neutral-950 dark:text-white">
                        R$ {valorAgora.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    {tipoQuitacao === "PARCELADO_50_50" && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                          Restante no evento
                        </span>
                        <span className="text-xs font-black text-amber-600 dark:text-[#FFC72C]">
                          R$ {saldoRestante.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botão de Envio */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 rounded-2xl bg-[#FFC72C] hover:bg-amber-400 active:scale-98 text-neutral-950 font-black text-sm shadow-xl shadow-[#FFC72C]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Registrando sua Inscrição...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir e Confirmar Inscrição</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
