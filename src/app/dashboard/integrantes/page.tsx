"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { InputDataBr } from "@/components/ui/input-data-br";

interface IntegranteItem {

  id: string;
  nomeCompleto: string;
  apelido: string | null;
  sexo?: string | null;
  telefone: string;
  dataNascimento: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  tempoGrupoPrecisao: string;
  tempoGrupoDataCompleta: string | null;
  tempoGrupoMes: number | null;
  tempoGrupoAno: number | null;
  batismo: boolean;
  primeiraEucaristia: boolean;
  crisma: boolean;
  fezClj?: boolean;
  qualClj?: string | null;
  possuiAlergia?: boolean;
  descricaoAlergia?: string | null;
  intoleranciaGluten?: boolean;
  intoleranciaLactose?: boolean;
  status: string;
  statusCalculado: "ATIVO" | "INATIVO";
  temAlertaAusencia: boolean;
  mesesSemPresenca: number;
  idadeCalculada?: number;
  fotoUrl: string | null;
  presencas: any[];
}

export default function IntegrantesPage() {
  const [integrantes, setIntegrantes] = useState<IntegranteItem[]>([]);
  const [limiteAlerta, setLimiteAlerta] = useState<number>(3);
  const [encontrosPausados, setEncontrosPausados] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroSacramento, setFiltroSacramento] = useState("TODOS");
  const [filtroSexo, setFiltroSexo] = useState("TODOS");
  const [filtroClj, setFiltroClj] = useState("TODOS"); // "TODOS" | "SIM" | "NAO"
  const [nomeGrupo, setNomeGrupo] = useState("JUSC");
  const [mascoteUrl, setMascoteUrl] = useState<string | null>(null);

  // Filtro de Idade
  const [tipoDataIdade, setTipoDataIdade] = useState<"ATUAL" | "MANUAL">("ATUAL");
  const [dataManualIdade, setDataManualIdade] = useState("");
  const [idadeMin, setIdadeMin] = useState("");
  const [idadeMax, setIdadeMax] = useState("");

  async function carregarIntegrantes() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (filtroStatus !== "TODOS") params.set("status", filtroStatus);
      if (filtroSacramento !== "TODOS") params.set("sacramento", filtroSacramento);
      if (filtroSexo !== "TODOS") params.set("sexo", filtroSexo);
      if (filtroClj !== "TODOS") params.set("clj", filtroClj);
      if (tipoDataIdade === "MANUAL" && dataManualIdade) {
        params.set("dataRefIdade", dataManualIdade);
      }
      if (idadeMin) params.set("idadeMin", idadeMin);
      if (idadeMax) params.set("idadeMax", idadeMax);

      const res = await fetch(`/api/integrantes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setIntegrantes(data.integrantes || []);
        if (data.limiteAlerta) setLimiteAlerta(data.limiteAlerta);
        if (data.encontrosPausados !== undefined) setEncontrosPausados(data.encontrosPausados);
        if (data.nomeGrupo) setNomeGrupo(data.nomeGrupo);
        if (data.mascoteUrl) setMascoteUrl(data.mascoteUrl);
      }
    } catch (e) {
      console.error("Erro ao carregar integrantes:", e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarIntegrantes();
    }, 300);
    return () => clearTimeout(timer);
  }, [busca, filtroStatus, filtroSacramento, filtroSexo, filtroClj, tipoDataIdade, dataManualIdade, idadeMin, idadeMax]);

  function formatarTempoGrupo(int: IntegranteItem) {
    if (int.tempoGrupoPrecisao === "COMPLETA" && int.tempoGrupoDataCompleta) {
      const d = new Date(int.tempoGrupoDataCompleta);
      return `Desde ${d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`;
    }
    if (int.tempoGrupoPrecisao === "MES_ANO" && int.tempoGrupoMes && int.tempoGrupoAno) {
      return `Desde ${int.tempoGrupoMes.toString().padStart(2, "0")}/${int.tempoGrupoAno}`;
    }
    return "Tempo não informado";
  }

  return (
    <div className="space-y-6">
      {/* Top Header com Título e Botão Novo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FFC72C]" />
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
              Integrantes do {nomeGrupo}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gestão pastoral de jovens, histórico de presenças, CLJ e sacramentos
          </p>
        </div>


        <Link
          href="/dashboard/integrantes/novo"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Novo Integrante
        </Link>
      </div>

      {/* Alerta de Encontros Pausados */}
      {encontrosPausados && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Encontros em Pausa / Recesso Pastoral:</strong> A contagem de tempo de ausência está pausada para que nenhum integrante seja inativado durante as férias.
          </span>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-[#15171e] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Busca textual */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome completo ou apelido..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            />
          </div>

          {/* Filtro Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="py-2 px-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Apenas Ativos</option>
              <option value="ALERTA">⚠️ Alerta de Ausência (&gt; {limiteAlerta} meses)</option>
              <option value="INATIVO">Inativos</option>
            </select>
          </div>

          {/* Filtro Sexo */}
          <div>
            <select
              value={filtroSexo}
              onChange={(e) => setFiltroSexo(e.target.value)}
              className="py-2 px-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            >
              <option value="TODOS">Todos os Sexos</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>

          {/* Filtro CLJ */}
          <div>
            <select
              value={filtroClj}
              onChange={(e) => setFiltroClj(e.target.value)}
              className="py-2 px-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            >
              <option value="TODOS">Todos (CLJ)</option>
              <option value="SIM">🌹 Fez o CLJ</option>
              <option value="NAO">Não fez o CLJ</option>
            </select>
          </div>

          {/* Filtro Sacramentos */}
          <div>
            <select
              value={filtroSacramento}
              onChange={(e) => setFiltroSacramento(e.target.value)}
              className="py-2 px-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            >
              <option value="TODOS">Todos os Sacramentos</option>
              <option value="batismo">Com Batismo</option>
              <option value="eucaristia">Com 1ª Eucaristia</option>
              <option value="crisma">Com Crisma</option>
            </select>
          </div>
        </div>

        {/* Linha de Filtro de Idade (Data Atual ou Manual) */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
            <Calendar className="w-3.5 h-3.5 text-[#FFC72C]" />
            <span>Calcular Idade:</span>
          </div>

          <div className="inline-flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
            <button
              type="button"
              onClick={() => {
                setTipoDataIdade("ATUAL");
                setDataManualIdade("");
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                tipoDataIdade === "ATUAL"
                  ? "bg-[#FFC72C] text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              Até Hoje
            </button>
            <button
              type="button"
              onClick={() => setTipoDataIdade("MANUAL")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                tipoDataIdade === "MANUAL"
                  ? "bg-[#FFC72C] text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              Data Manual
            </button>
          </div>

          {tipoDataIdade === "MANUAL" && (
            <div className="w-36">
              <InputDataBr
                value={dataManualIdade}
                onChange={(br, iso) => setDataManualIdade(iso || "")}
                placeholder="DD/MM/AAAA"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Faixa:</span>
            <input
              type="number"
              min={0}
              max={120}
              placeholder="Min"
              value={idadeMin}
              onChange={(e) => setIdadeMin(e.target.value)}
              className="w-16 px-2 py-1 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-300 dark:border-neutral-700 text-xs text-center"
            />
            <span className="text-neutral-500">a</span>
            <input
              type="number"
              min={0}
              max={120}
              placeholder="Max"
              value={idadeMax}
              onChange={(e) => setIdadeMax(e.target.value)}
              className="w-16 px-2 py-1 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-300 dark:border-neutral-700 text-xs text-center"
            />
            <span className="text-neutral-500">anos</span>
          </div>

          {(idadeMin || idadeMax || dataManualIdade) && (
            <button
              type="button"
              onClick={() => {
                setIdadeMin("");
                setIdadeMax("");
                setDataManualIdade("");
                setTipoDataIdade("ATUAL");
              }}
              className="text-[11px] text-amber-600 hover:underline font-bold"
            >
              Limpar Idade
            </button>
          )}
        </div>

        {/* Contador */}
        <div className="text-[11px] text-neutral-500 font-medium px-1 flex items-center justify-between">
          <span>
            {carregando
              ? "Buscando..."
              : `${integrantes.length} integrante(s) encontrado(s)`}
          </span>
          {filtroStatus === "ALERTA" && (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              Exibindo apenas jovens sem presença há mais de {limiteAlerta} meses
            </span>
          )}
        </div>
      </div>

      {/* Lista de Integrantes */}
      {carregando ? (
        <div className="p-12 text-center bg-white dark:bg-[#15171e] rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Carregando integrantes...</p>
        </div>
      ) : integrantes.length === 0 ? (
        /* Estado Vazio de Integrantes */
        <div className="text-center bg-white dark:bg-[#15171e] rounded-3xl p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          {mascoteUrl ? (
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={mascoteUrl}
                alt="Mascote"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
              <Users className="w-10 h-10" />
            </div>
          )}
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
            Nenhum integrante encontrado
          </h3>

          <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
            Não encontramos nenhum jovem com os filtros selecionados. Tente ajustar os termos da busca ou cadastre um novo integrante!
          </p>
          <Link
            href="/dashboard/integrantes/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFC72C] text-neutral-950 font-bold text-xs shadow-sm hover:bg-[#e5b220] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Novo Integrante
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrantes.map((int) => (
            <Link
              key={int.id}
              href={`/dashboard/integrantes/${int.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-[#15171e] border border-neutral-200 dark:border-neutral-800 hover:border-[#FFC72C] dark:hover:border-[#FFC72C] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-[#FFC72C] flex items-center justify-center font-black text-base border border-amber-500/20 flex-shrink-0 relative overflow-hidden shadow-inner">
                      {int.fotoUrl ? (
                        <Image
                          src={int.fotoUrl}
                          alt={int.nomeCompleto}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        int.nomeCompleto.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-[#FFC72C] transition-colors leading-tight">
                        {int.nomeCompleto}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {int.apelido && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            &quot;{int.apelido}&quot;
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            int.sexo === "FEMININO"
                              ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                              : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {int.sexo === "FEMININO" ? "Feminino" : "Masculino"}
                        </span>
                        {int.idadeCalculada !== undefined && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                            {int.idadeCalculada} anos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {int.temAlertaAusencia ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-300 dark:border-amber-700 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Ausente ({int.mesesSemPresenca}m)
                      </span>
                    ) : int.statusCalculado === "ATIVO" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-[10px]">
                        <XCircle className="w-3 h-3" />
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                {/* Dados de Contato e Tempo */}
                <div className="mt-3.5 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{int.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatarTempoGrupo(int)}</span>
                  </div>
                </div>
              </div>

              {/* Badges de Sacramentos e Ação */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    title="Batismo"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      int.batismo
                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : "bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 line-through"
                    }`}
                  >
                    Batismo
                  </span>
                  <span
                    title="Primeira Eucaristia"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      int.primeiraEucaristia
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        : "bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 line-through"
                    }`}
                  >
                    1ª Eucaristia
                  </span>
                  <span
                    title="Crisma"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      int.crisma
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 line-through"
                    }`}
                  >
                    Crisma
                  </span>
                  {int.fezClj && (
                    <span
                      title={int.qualClj ? `Fez o CLJ: ${int.qualClj}` : "Fez o CLJ (Curso de Liderança Juvenil)"}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                    >
                      <span>🌹</span> CLJ
                    </span>
                  )}

                  {int.possuiAlergia && (
                    <span
                      title={`Alergia: ${int.descricaoAlergia || "Informada"}`}
                      className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                    >
                      Alergia
                    </span>
                  )}
                  {int.intoleranciaGluten && (
                    <span
                      title="Intolerante a Glúten / Celíaco"
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                    >
                      S/Glúten
                    </span>
                  )}
                  {int.intoleranciaLactose && (
                    <span
                      title="Intolerante a Lactose"
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                    >
                      S/Lactose
                    </span>
                  )}
                </div>

                <div className="flex items-center text-xs font-semibold text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-[#FFC72C]">
                  Detalhes <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
