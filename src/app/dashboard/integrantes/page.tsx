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

interface IntegranteItem {
  id: string;
  nomeCompleto: string;
  apelido: string | null;
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
  possuiAlergia?: boolean;
  descricaoAlergia?: string | null;
  intoleranciaGluten?: boolean;
  intoleranciaLactose?: boolean;
  status: string;
  statusCalculado: "ATIVO" | "INATIVO";
  temAlertaAusencia: boolean;
  mesesSemPresenca: number;
  fotoUrl: string | null;
  presencas: any[];
}

export default function IntegrantesPage() {
  const [integrantes, setIntegrantes] = useState<IntegranteItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroSacramento, setFiltroSacramento] = useState("TODOS");

  async function carregarIntegrantes() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (filtroStatus !== "TODOS") params.set("status", filtroStatus);
      if (filtroSacramento !== "TODOS") params.set("sacramento", filtroSacramento);

      const res = await fetch(`/api/integrantes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setIntegrantes(data.integrantes || []);
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
  }, [busca, filtroStatus, filtroSacramento]);

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
              Integrantes do JUSC
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gestão pastoral de jovens, histórico de presenças e sacramentos
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

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-[#15171e] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
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
              <option value="ALERTA">⚠️ Alerta de Ausência (&gt; 3 meses)</option>
              <option value="INATIVO">Inativos</option>
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

        {/* Contador */}
        <div className="text-[11px] text-neutral-500 font-medium px-1 flex items-center justify-between">
          <span>
            {carregando
              ? "Buscando..."
              : `${integrantes.length} integrante(s) encontrado(s)`}
          </span>
          {filtroStatus === "ALERTA" && (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              Exibindo apenas jovens sem presença há mais de 3 meses
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
        /* Estado Vazio com Mascote Abelhudo */
        <div className="text-center bg-white dark:bg-[#15171e] rounded-3xl p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src="/assets/abelhudo.png"
              alt="Mascote Abelhudo"
              fill
              className="object-contain"
            />
          </div>
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
                      {int.apelido && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                          &quot;{int.apelido}&quot;
                        </span>
                      )}
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
                <div className="flex items-center gap-1.5">
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
