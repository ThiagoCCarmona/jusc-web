"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Calendar,
  DollarSign,
  AlertCircle,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Check,
  Shirt,
} from "lucide-react";
import { InputDataBr } from "@/components/ui/input-data-br";
import { isoParaBrasileiro, brasileiroParaIso } from "@/lib/utils";

export interface CampanhaInscricaoItem {
  id?: string;
  titulo: string;
  descricao?: string | null;
  fotoUrl?: string | null;
  dataLimite: string | Date;
  ativa: boolean;
  requerPagamento: boolean;
  valor: number;
  permiteParcelamento: boolean;
  permiteCamiseta?: boolean;
  campanhaCamisetaId?: string | null;
  camisetaInclusaNoValor?: boolean;
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

interface ModalCampanhaInscricaoProps {
  aberto: boolean;
  onFechar: () => void;
  onSalvo: () => void;
  campanha?: CampanhaInscricaoItem | null;
}

export function ModalCampanhaInscricao({
  aberto,
  onFechar,
  onSalvo,
  campanha,
}: ModalCampanhaInscricaoProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [dataLimiteBr, setDataLimiteBr] = useState("");
  const [dataLimiteIso, setDataLimiteIso] = useState<string | null>(null);
  const [ativa, setAtiva] = useState(true);

  // Financeiro
  const [requerPagamento, setRequerPagamento] = useState(false);
  const [valor, setValor] = useState("0");
  const [permiteParcelamento, setPermiteParcelamento] = useState(false);

  // Pedido de camiseta junto com a inscrição
  const [permiteCamiseta, setPermiteCamiseta] = useState(false);
  const [campanhaCamisetaId, setCampanhaCamisetaId] = useState("");
  const [camisetaInclusaNoValor, setCamisetaInclusaNoValor] = useState(false);
  const [listaCampanhasCamiseta, setListaCampanhasCamiseta] = useState<any[]>([]);

  // Campos modulares selecionáveis
  const [campoNomeCompleto, setCampoNomeCompleto] = useState(true);
  const [campoCpf, setCampoCpf] = useState(false);
  const [campoTelefone, setCampoTelefone] = useState(true);
  const [campoDataNascimento, setCampoDataNascimento] = useState(true);
  const [campoNomeResponsavel, setCampoNomeResponsavel] = useState(false);
  const [campoParentescoResponsavel, setCampoParentescoResponsavel] = useState(false);
  const [campoTelefoneResponsavel, setCampoTelefoneResponsavel] = useState(false);
  const [campoAlergia, setCampoAlergia] = useState(false);
  const [campoIntolerancia, setCampoIntolerancia] = useState(false);
  const [campoRemedioContinuo, setCampoRemedioContinuo] = useState(false);
  const [campoSexo, setCampoSexo] = useState(false);
  const [campoBatismo, setCampoBatismo] = useState(false);
  const [campoPrimeiraEucaristia, setCampoPrimeiraEucaristia] = useState(false);
  const [campoCrisma, setCampoCrisma] = useState(false);

  // Link do grupo de WhatsApp do evento
  const [linkGrupoWhatsapp, setLinkGrupoWhatsapp] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      fetch("/api/campanhas?todas=true")
        .then((res) => res.json())
        .then((data) => {
          if (data.campanhas) {
            setListaCampanhasCamiseta(data.campanhas);
          }
        })
        .catch((err) => console.error("Erro ao carregar campanhas de camiseta:", err));
    }
  }, [aberto]);

  useEffect(() => {
    if (campanha) {
      setTitulo(campanha.titulo || "");
      setDescricao(campanha.descricao || "");
      setFotoUrl(campanha.fotoUrl || "");
      if (campanha.dataLimite) {
        const iso = new Date(campanha.dataLimite).toISOString().slice(0, 10);
        setDataLimiteIso(iso);
        setDataLimiteBr(isoParaBrasileiro(iso));
      } else {
        setDataLimiteBr("");
        setDataLimiteIso(null);
      }
      setAtiva(campanha.ativa ?? true);
      setRequerPagamento(campanha.requerPagamento ?? false);
      setValor(String(campanha.valor || 0));
      setPermiteParcelamento(campanha.permiteParcelamento ?? false);

      setPermiteCamiseta(campanha.permiteCamiseta ?? false);
      setCampanhaCamisetaId(campanha.campanhaCamisetaId || "");
      setCamisetaInclusaNoValor(campanha.camisetaInclusaNoValor ?? false);

      setLinkGrupoWhatsapp(campanha.linkGrupoWhatsapp || "");

      setCampoNomeCompleto(campanha.campoNomeCompleto ?? true);
      setCampoCpf(campanha.campoCpf ?? false);
      setCampoTelefone(campanha.campoTelefone ?? true);
      setCampoDataNascimento(campanha.campoDataNascimento ?? true);
      setCampoNomeResponsavel(campanha.campoNomeResponsavel ?? false);
      setCampoParentescoResponsavel(campanha.campoParentescoResponsavel ?? false);
      setCampoTelefoneResponsavel(campanha.campoTelefoneResponsavel ?? false);
      setCampoAlergia(campanha.campoAlergia ?? false);
      setCampoIntolerancia(campanha.campoIntolerancia ?? false);
      setCampoRemedioContinuo(campanha.campoRemedioContinuo ?? false);
      setCampoSexo(campanha.campoSexo ?? false);
      setCampoBatismo(campanha.campoBatismo ?? false);
      setCampoPrimeiraEucaristia(campanha.campoPrimeiraEucaristia ?? false);
      setCampoCrisma(campanha.campoCrisma ?? false);
    } else {
      setTitulo("");
      setDescricao("");
      setFotoUrl("");
      setDataLimiteBr("");
      setDataLimiteIso(null);
      setAtiva(true);
      setRequerPagamento(false);
      setValor("0");
      setPermiteParcelamento(false);

      setPermiteCamiseta(false);
      setCampanhaCamisetaId("");
      setCamisetaInclusaNoValor(false);

      setLinkGrupoWhatsapp("");

      setCampoNomeCompleto(true);
      setCampoCpf(false);
      setCampoTelefone(true);
      setCampoDataNascimento(true);
      setCampoNomeResponsavel(false);
      setCampoParentescoResponsavel(false);
      setCampoTelefoneResponsavel(false);
      setCampoAlergia(false);
      setCampoIntolerancia(false);
      setCampoRemedioContinuo(false);
      setCampoSexo(false);
      setCampoBatismo(false);
      setCampoPrimeiraEucaristia(false);
      setCampoCrisma(false);
    }
    setErro("");
  }, [campanha, aberto]);

  if (!aberto) return null;

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFoto(true);
    setErro("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      setFotoUrl(data.url);
    } catch (err: any) {
      setErro(err.message || "Erro ao enviar imagem.");
    } finally {
      setUploadingFoto(false);
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim()) {
      setErro("O título do banner é obrigatório.");
      return;
    }

    if (!dataLimiteIso) {
      setErro("Informe uma data limite válida.");
      return;
    }

    setSalvando(true);
    try {
      const url = campanha?.id
        ? `/api/campanhas-inscricao/${campanha.id}`
        : "/api/campanhas-inscricao";
      const method = campanha?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          fotoUrl: fotoUrl || null,
          dataLimite: dataLimiteIso,
          ativa,
          requerPagamento,
          valor: requerPagamento ? parseFloat(valor.replace(",", ".")) || 0 : 0,
          permiteParcelamento: requerPagamento ? permiteParcelamento : false,
          permiteCamiseta,
          campanhaCamisetaId: permiteCamiseta && campanhaCamisetaId ? campanhaCamisetaId : null,
          camisetaInclusaNoValor: permiteCamiseta ? camisetaInclusaNoValor : false,
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
          linkGrupoWhatsapp: linkGrupoWhatsapp.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar campanha de inscrição.");
      }

      onSalvo();
      onFechar();
    } catch (err: any) {
      setErro(err.message || "Ocorreu um erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#111318] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#16181f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFC72C] text-neutral-950 flex items-center justify-center font-black">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-base">
                {campanha?.id ? "Editar Campanha de Inscrição" : "Publicar Abertura de Inscrição"}
              </h2>
              <p className="text-[11px] text-neutral-500">
                Configure o banner da homepage e os campos modulares do evento
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Rolável */}
        <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-6">
          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* DADOS BÁSICOS DO BANNER */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC72C]" />
              Visual e Banner da Homepage
            </h3>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                Título do Banner / Evento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Retiro de Jovens 2026 / Acampamento JUSC"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                Descrição Completa do Evento
              </label>
              <textarea
                rows={5}
                placeholder="Descreva todos os detalhes, datas, local e avisos do evento. Suporta quebras de linha e caracteres especiais. O texto será exibido na íntegra para o participante na ficha de inscrição..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C] leading-relaxed resize-y"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Suporta quebras de linha e caracteres especiais. Exibido na íntegra sem cortes.
              </p>
            </div>

            {/* Foto do Banner (Apenas Upload, sem link manual) */}
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                Foto do Banner
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {fotoUrl ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-neutral-300 dark:border-neutral-700 flex-shrink-0 shadow-sm">
                    <Image
                      src={fotoUrl}
                      alt="Banner"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFotoUrl("")}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/75 text-white hover:bg-black transition-colors"
                      title="Remover foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center text-neutral-400 flex-shrink-0 bg-neutral-50 dark:bg-[#16181f]">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Sem foto</span>
                  </div>
                )}

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadFoto}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingFoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold transition-colors flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>{uploadingFoto ? "Enviando imagem..." : fotoUrl ? "Substituir Foto do Banner" : "Selecionar Foto do Banner"}</span>
                  </button>
                  <p className="text-[11px] text-neutral-500">
                    Faça o upload direto da imagem do banner oficial para a homepage (JPG, PNG, WebP).
                  </p>
                </div>
              </div>
            </div>

            {/* Data Limite & Status Ativa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Data Limite para Inscrições *
                </label>
                <InputDataBr
                  value={dataLimiteBr}
                  onChange={(br, iso) => {
                    setDataLimiteBr(br);
                    setDataLimiteIso(iso);
                  }}
                  placeholder="DD/MM/AAAA"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="campanhaAtiva"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <label htmlFor="campanhaAtiva" className="text-xs font-bold cursor-pointer">
                  Publicação Ativa no Banner da Home
                </label>
              </div>
            </div>
          </div>

          {/* SUPORTE FINANCEIRO E PAGAMENTO */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Regras Financeiras (Igual a Camisetas)
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requerPagamento"
                checked={requerPagamento}
                onChange={(e) => setRequerPagamento(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
              />
              <label htmlFor="requerPagamento" className="text-xs font-bold cursor-pointer">
                Inscrição Paga (Gera Pix Copia e Cola e envio de comprovante ao Tesoureiro)
              </label>
            </div>

            {requerPagamento && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 animate-fadeIn">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Valor da Inscrição (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required={requerPagamento}
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="permiteParcelamento"
                    checked={permiteParcelamento}
                    onChange={(e) => setPermiteParcelamento(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                  />
                  <label htmlFor="permiteParcelamento" className="text-xs font-bold cursor-pointer">
                    Permitir quitação 50% Entrada + 50% no Evento
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SUPORTE A PEDIDO DE CAMISETA DENTRO DO EVENTO */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 flex items-center gap-2">
              <Shirt className="w-3.5 h-3.5 text-purple-500" />
              Camiseta Oficial do Evento
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="permiteCamiseta"
                checked={permiteCamiseta}
                onChange={(e) => setPermiteCamiseta(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
              />
              <label htmlFor="permiteCamiseta" className="text-xs font-bold cursor-pointer">
                Permitir pedido de camiseta oficial junto com a inscrição
              </label>
            </div>

            {permiteCamiseta && (
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 space-y-4 animate-fadeIn">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Vincular Campanha de Camiseta *
                  </label>
                  <select
                    value={campanhaCamisetaId}
                    onChange={(e) => setCampanhaCamisetaId(e.target.value)}
                    required={permiteCamiseta}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white"
                  >
                    <option value="">Selecione a campanha de camiseta...</option>
                    {listaCampanhasCamiseta.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.titulo} (R$ {Number(camp.precoUnitario || 0).toFixed(2).replace(".", ",")})
                      </option>
                    ))}
                  </select>
                  {listaCampanhasCamiseta.length === 0 && (
                    <p className="text-[11px] text-amber-500 mt-1">
                      Nenhuma campanha de camiseta ativa encontrada. Crie uma em Camisetas antes de vincular.
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="camisetaInclusaNoValor"
                    checked={camisetaInclusaNoValor}
                    onChange={(e) => setCamisetaInclusaNoValor(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-[#FFC72C]"
                  />
                  <div>
                    <label htmlFor="camisetaInclusaNoValor" className="text-xs font-bold cursor-pointer block">
                      Camiseta já inclusa no valor da inscrição
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Se desmarcado, o valor da camiseta será somado ao valor da inscrição quando o participante optar por pedir a camiseta.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SUPORTE A GRUPO DE WHATSAPP DO EVENTO */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <label className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Grupo Oficial de WhatsApp do Evento (Opcional)
              </label>
            </div>
            <p className="text-[11px] text-neutral-500">
              Cole o link de convite do grupo de WhatsApp do evento (ex.: https://chat.whatsapp.com/...). Ao concluir a inscrição, o participante verá um botão de destaque para entrar no grupo, e o sistema registrará se ele clicou ou não.
            </p>
            <input
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              value={linkGrupoWhatsapp}
              onChange={(e) => setLinkGrupoWhatsapp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111318] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            />
          </div>

          {/* CAMPOS MODULARES SELECIONÁVEIS */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
                Informações a Serem Preenchidas (100% Modular)
              </h3>
              <p className="text-[11px] text-neutral-400 mt-1">
                Marque exatamente os campos que você deseja exigir para os participantes deste evento:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoNomeCompleto}
                  onChange={(e) => setCampoNomeCompleto(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Nome Completo</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoSexo}
                  onChange={(e) => setCampoSexo(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Sexo (Masculino / Feminino)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoTelefone}
                  onChange={(e) => setCampoTelefone(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Telefone / WhatsApp</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoCpf}
                  onChange={(e) => setCampoCpf(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">CPF</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoDataNascimento}
                  onChange={(e) => setCampoDataNascimento(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Data de Nascimento (calcula idade)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoNomeResponsavel}
                  onChange={(e) => setCampoNomeResponsavel(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Nome do Responsável</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoParentescoResponsavel}
                  onChange={(e) => setCampoParentescoResponsavel(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">O que o responsável é (Parentesco)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoTelefoneResponsavel}
                  onChange={(e) => setCampoTelefoneResponsavel(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Telefone do Responsável</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoAlergia}
                  onChange={(e) => setCampoAlergia(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Alergia (com descrição)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoIntolerancia}
                  onChange={(e) => setCampoIntolerancia(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Intolerante a Glúten / Lactose</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoRemedioContinuo}
                  onChange={(e) => setCampoRemedioContinuo(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Remédio Contínuo (com descrição)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoBatismo}
                  onChange={(e) => setCampoBatismo(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Batismo</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoPrimeiraEucaristia}
                  onChange={(e) => setCampoPrimeiraEucaristia(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Primeira Eucaristia</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-[#16181f] border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={campoCrisma}
                  onChange={(e) => setCampoCrisma(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold">Crisma</span>
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{campanha?.id ? "Atualizar Campanha" : "Publicar Inscrições"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
