"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  Phone,
  User,
  Shield,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  HeartPulse,
  Utensils,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import {
  formatarTelefone,
  formatarDataDigitacao,
  brasileiroParaIso,
  isoParaBrasileiro,
} from "@/lib/utils";

export default function NovoIntegrantePage() {
  const router = useRouter();

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [apelido, setApelido] = useState("");
  const [sexo, setSexo] = useState<"MASCULINO" | "FEMININO">("MASCULINO");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState(""); // Formato DD/MM/AAAA
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");

  const datePickerNascRef = useRef<HTMLInputElement>(null);
  const datePickerEntradaRef = useRef<HTMLInputElement>(null);

  // Lógica de tempo de grupo com 3 níveis de precisão
  const [tempoGrupoPrecisao, setTempoGrupoPrecisao] = useState<
    "COMPLETA" | "MES_ANO" | "DESCONHECIDA"
  >("COMPLETA");
  const [tempoGrupoDataCompleta, setTempoGrupoDataCompleta] = useState(""); // Formato DD/MM/AAAA
  const [tempoGrupoMes, setTempoGrupoMes] = useState(new Date().getMonth() + 1);
  const [tempoGrupoAno, setTempoGrupoAno] = useState(new Date().getFullYear());

  // Sacramentos
  const [batismo, setBatismo] = useState(false);
  const [primeiraEucaristia, setPrimeiraEucaristia] = useState(false);
  const [crisma, setCrisma] = useState(false);

  // WhatsApp
  const [noGrupoWhatsapp, setNoGrupoWhatsapp] = useState(false);

  // Saúde e Restrições Alimentares (Alergias e Intolerâncias)
  const [possuiAlergia, setPossuiAlergia] = useState(false);
  const [descricaoAlergia, setDescricaoAlergia] = useState("");
  const [intoleranciaGluten, setIntoleranciaGluten] = useState(false);
  const [intoleranciaLactose, setIntoleranciaLactose] = useState(false);

  const [observacao, setObservacao] = useState("");
  const [consentimentoLGPD, setConsentimentoLGPD] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const anosDisponiveis = Array.from(
    { length: 15 },
    (_, i) => new Date().getFullYear() - i
  );

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErro("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErro("A imagem selecionada deve ter no máximo 5MB.");
      return;
    }

    setUploadingFoto(true);
    setErro(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao fazer upload da imagem.");
      } else {
        setFotoUrl(data.url);
      }
    } catch {
      setErro("Erro de comunicação ao enviar a foto.");
    } finally {
      setUploadingFoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    // Converte e valida data de nascimento DD/MM/AAAA
    const dataNascIso = brasileiroParaIso(dataNascimento);
    if (!dataNascIso) {
      setErro("Informe uma data de nascimento válida no padrão brasileiro (DD/MM/AAAA).");
      return;
    }

    let dataEntradaIso: string | null = null;
    if (tempoGrupoPrecisao === "COMPLETA") {
      dataEntradaIso = brasileiroParaIso(tempoGrupoDataCompleta);
      if (!dataEntradaIso) {
        setErro("Informe uma data de entrada válida no padrão brasileiro (DD/MM/AAAA).");
        return;
      }
    }

    if (possuiAlergia && !descricaoAlergia.trim()) {
      setErro("Você indicou que possui alergia. Por favor, especifique a que tem alergia.");
      return;
    }

    if (!consentimentoLGPD) {
      setErro("É necessário confirmar o termo de consentimento LGPD para prosseguir.");
      return;
    }

    setSalvando(true);

    try {
      const res = await fetch("/api/integrantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fotoUrl,
          nomeCompleto,
          apelido,
          sexo,
          telefone,
          dataNascimento: dataNascIso,
          nomeResponsavel,
          telefoneResponsavel,
          tempoGrupoPrecisao,
          tempoGrupoDataCompleta: dataEntradaIso,
          tempoGrupoMes:
            tempoGrupoPrecisao === "MES_ANO" ? Number(tempoGrupoMes) : null,
          tempoGrupoAno:
            tempoGrupoPrecisao === "MES_ANO" ? Number(tempoGrupoAno) : null,
          batismo,
          primeiraEucaristia,
          crisma,
          noGrupoWhatsapp,
          possuiAlergia,
          descricaoAlergia: possuiAlergia ? descricaoAlergia.trim() : null,
          intoleranciaGluten,
          intoleranciaLactose,
          observacao,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao salvar integrante.");
        setSalvando(false);
        return;
      }

      router.push("/dashboard/integrantes");
      router.refresh();
    } catch {
      setErro("Erro de conexão com o servidor ao cadastrar integrante.");
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Botão Voltar */}
      <Link
        href="/dashboard/integrantes"
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a lista de integrantes
      </Link>

      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFC72C]/20 text-[#FFC72C]">
              <UserPlus className="w-6 h-6 text-neutral-950 dark:text-[#FFC72C]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Cadastrar Novo Integrante
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Preencha os dados do jovem para inclusão na pastoral e acompanhamento
              </p>
            </div>
          </div>
        </div>

        {erro && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção Foto de Perfil */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-24 h-24 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border-2 border-dashed border-amber-500/40 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt="Foto do integrante"
                  fill
                  className="object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-amber-500/60" />
              )}
              {uploadingFoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                  <div className="w-6 h-6 border-2 border-[#FFC72C] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  Foto de Perfil do Integrante (opcional)
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Envie uma foto nítida do jovem (JPG, PNG ou WebP de até 5MB).
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold cursor-pointer transition-all active:scale-95">
                  <Upload className="w-3.5 h-3.5" />
                  {fotoUrl ? "Trocar Foto" : "Selecionar Foto"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingFoto}
                    onChange={handleFotoUpload}
                    className="hidden"
                  />
                </label>

                {fotoUrl && (
                  <button
                    type="button"
                    onClick={() => setFotoUrl(null)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Seção 1: Dados Pessoais do Jovem */}
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <User className="w-4 h-4" />
              1. Dados do Integrante
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Ex.: Gabriel Santos de Oliveira"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Apelido (como gosta de ser chamado)
                </label>
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  placeholder="Ex.: Biel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  placeholder="(45) 99999-9999"
                  maxLength={15}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Sexo *
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer select-none text-xs font-bold transition-all ${
                      sexo === "MASCULINO"
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/20"
                        : "bg-neutral-50 dark:bg-[#1c202a] border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexo"
                      value="MASCULINO"
                      checked={sexo === "MASCULINO"}
                      onChange={() => setSexo("MASCULINO")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 accent-blue-600"
                    />
                    <span>Masculino</span>
                  </label>

                  <label
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer select-none text-xs font-bold transition-all ${
                      sexo === "FEMININO"
                        ? "bg-pink-50 dark:bg-pink-950/40 border-pink-400 dark:border-pink-600 text-pink-700 dark:text-pink-300 ring-2 ring-pink-400/20"
                        : "bg-neutral-50 dark:bg-[#1c202a] border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexo"
                      value="FEMININO"
                      checked={sexo === "FEMININO"}
                      onChange={() => setSexo("FEMININO")}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 accent-pink-600"
                    />
                    <span>Feminino</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Data de Nascimento * (DD/MM/AAAA)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (datePickerNascRef.current) {
                        if (typeof datePickerNascRef.current.showPicker === "function") {
                          datePickerNascRef.current.showPicker();
                        } else {
                          datePickerNascRef.current.click();
                        }
                      }
                    }}
                    title="Clique para abrir o calendário"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer z-10"
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                  </button>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(formatarDataDigitacao(e.target.value))}
                    placeholder="DD/MM/AAAA (ex.: 15/04/2006)"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                  {/* Input invisível nativo acionado pelo clique no ícone */}
                  <input
                    type="date"
                    ref={datePickerNascRef}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDataNascimento(isoParaBrasileiro(e.target.value));
                      }
                    }}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Responsável Legal */}
          <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              2. Dados do Responsável Legal (obrigatório para menores)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  placeholder="Ex.: Sandra Santos (mãe)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Telefone do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={telefoneResponsavel}
                  onChange={(e) =>
                    setTelefoneResponsavel(formatarTelefone(e.target.value))
                  }
                  placeholder="(45) 99999-9999"
                  maxLength={15}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Tempo de Grupo (com 3 níveis de precisão) */}
          <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                3. Tempo de Grupo (Caminhada no JUSC)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Selecione o nível de precisão com que o integrante recorda sua entrada no grupo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex flex-col cursor-pointer transition-all ${
                  tempoGrupoPrecisao === "COMPLETA"
                    ? "bg-[#FFC72C]/10 border-[#FFC72C] dark:border-[#FFC72C]"
                    : "bg-neutral-50 dark:bg-[#1c202a] border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="precisao"
                  checked={tempoGrupoPrecisao === "COMPLETA"}
                  onChange={() => setTempoGrupoPrecisao("COMPLETA")}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Data Completa
                </span>
                <span className="text-[11px] text-neutral-500 mt-1">
                  Sabe o dia, mês e ano exatos
                </span>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex flex-col cursor-pointer transition-all ${
                  tempoGrupoPrecisao === "MES_ANO"
                    ? "bg-[#FFC72C]/10 border-[#FFC72C] dark:border-[#FFC72C]"
                    : "bg-neutral-50 dark:bg-[#1c202a] border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="precisao"
                  checked={tempoGrupoPrecisao === "MES_ANO"}
                  onChange={() => setTempoGrupoPrecisao("MES_ANO")}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Apenas Mês/Ano
                </span>
                <span className="text-[11px] text-neutral-500 mt-1">
                  Sabe o período aproximado
                </span>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex flex-col cursor-pointer transition-all ${
                  tempoGrupoPrecisao === "DESCONHECIDA"
                    ? "bg-[#FFC72C]/10 border-[#FFC72C] dark:border-[#FFC72C]"
                    : "bg-neutral-50 dark:bg-[#1c202a] border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="precisao"
                  checked={tempoGrupoPrecisao === "DESCONHECIDA"}
                  onChange={() => setTempoGrupoPrecisao("DESCONHECIDA")}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Desconhecido
                </span>
                <span className="text-[11px] text-neutral-500 mt-1">
                  Não recorda a data de início
                </span>
              </label>
            </div>

            {/* Campos condicionais de acordo com a precisão */}
            {tempoGrupoPrecisao === "COMPLETA" && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Data de Entrada no JUSC * (DD/MM/AAAA)
                </label>
                <div className="relative w-full sm:w-64">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={tempoGrupoDataCompleta}
                    onChange={(e) => setTempoGrupoDataCompleta(formatarDataDigitacao(e.target.value))}
                    placeholder="DD/MM/AAAA (ex.: 05/03/2023)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>
              </div>
            )}

            {tempoGrupoPrecisao === "MES_ANO" && (
              <div className="grid grid-cols-2 gap-4 sm:w-80 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mês de Entrada *
                  </label>
                  <select
                    value={tempoGrupoMes}
                    onChange={(e) => setTempoGrupoMes(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  >
                    {[
                      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                    ].map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ano de Entrada *
                  </label>
                  <select
                    value={tempoGrupoAno}
                    onChange={(e) => setTempoGrupoAno(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  >
                    {anosDisponiveis.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Seção 4: Sacramentos */}
          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              4. Sacramentos da Igreja Católica
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-[#232834] transition-colors">
                <input
                  type="checkbox"
                  checked={batismo}
                  onChange={(e) => setBatismo(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Batismo
                </span>
              </label>

              <label className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-[#232834] transition-colors">
                <input
                  type="checkbox"
                  checked={primeiraEucaristia}
                  onChange={(e) => setPrimeiraEucaristia(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  1ª Eucaristia
                </span>
              </label>

              <label className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-[#232834] transition-colors">
                <input
                  type="checkbox"
                  checked={crisma}
                  onChange={(e) => setCrisma(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Crisma
                </span>
              </label>
            </div>
          </div>

          {/* Seção 5: Saúde e Restrições Alimentares (Alergias e Intolerâncias) */}
          <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                5. Saúde e Restrições Alimentares (opcional)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Informações para os lanches e retiros do JUSC, garantindo a segurança alimentar de todos.
              </p>
            </div>

            <div className="space-y-3">
              {/* Alergias */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={possuiAlergia}
                    onChange={(e) => {
                      setPossuiAlergia(e.target.checked);
                      if (!e.target.checked) setDescricaoAlergia("");
                    }}
                    className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      Possui alguma alergia?
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      Marque se o integrante tiver alergia alimentar, medicamentosa ou respiratória
                    </span>
                  </div>
                </label>

                {possuiAlergia && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 animate-fadeIn">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Alergia a quê? *
                    </label>
                    <input
                      type="text"
                      required={possuiAlergia}
                      value={descricaoAlergia}
                      onChange={(e) => setDescricaoAlergia(e.target.value)}
                      placeholder="Ex.: Amendoim, frutos do mar, dipirona, picada de abelha..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                    />
                  </div>
                )}
              </div>

              {/* Intolerâncias Alimentares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-[#232834] transition-colors">
                  <input
                    type="checkbox"
                    checked={intoleranciaGluten}
                    onChange={(e) => setIntoleranciaGluten(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      Intolerância a Glúten / Celíaco
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Necessita de alimentos sem trigo/glúten
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-[#232834] transition-colors">
                  <input
                    type="checkbox"
                    checked={intoleranciaLactose}
                    onChange={(e) => setIntoleranciaLactose(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      Intolerância a Lactose
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Necessita de produtos sem lactose / derivados
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Seção 6: Comunicação e Redes */}
          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              6. Comunicação e Redes
            </h2>

            <label className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-emerald-950/30 transition-colors">
              <input
                type="checkbox"
                checked={noGrupoWhatsapp}
                onChange={(e) => setNoGrupoWhatsapp(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  Já adicionado ao Grupo Oficial de WhatsApp do JUSC
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Marque para controle da coordenação sobre quais jovens já estão inseridos no grupo da colmeia.
                </p>
              </div>
            </label>
          </div>

          {/* Seção 7: Observações */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              7. Observações Pastorais (opcional)
            </label>
            <textarea
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: Toca violão, tem interesse em ministério de teatro ou acolhida..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            />
          </div>

          {/* Consentimento LGPD */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentimentoLGPD}
                onChange={(e) => setConsentimentoLGPD(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-[#FFC72C] focus:ring-[#FFC72C] flex-shrink-0"
              />
              <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <strong>Termo de Consentimento Pastoral (LGPD):</strong> Confirmo que os dados pessoais e de contato do responsável legal foram informados com ciência e autorização expressa do jovem e de seus pais/responsáveis para uso exclusivo nas atividades do JUSC — Paróquia Menino Jesus.
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              href="/dashboard/integrantes"
              className="px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-sm text-center transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {salvando ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {salvando ? "Salvando..." : "Cadastrar Integrante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
