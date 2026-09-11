"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  MapPin,
  Clock,
  User,
  CheckSquare,
  Square,
  Search,
  UserPlus,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface IntegranteItem {
  id: string;
  nomeCompleto: string;
  apelido: string | null;
  status: string;
}

export default function NovoEncontroPage() {
  const router = useRouter();

  const [dataHora, setDataHora] = useState("");
  const [local, setLocal] = useState("Salão Paroquial Menino Jesus");
  const [conduzidoPor, setConduzidoPor] = useState("");
  const [tema, setTema] = useState("");

  const [integrantes, setIntegrantes] = useState<IntegranteItem[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState("");

  const [visitantes, setVisitantes] = useState<string[]>([]);
  const [novoVisitante, setNovoVisitante] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Definir data e hora atual no formato YYYY-MM-DDTHH:mm
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    setDataHora(agora.toISOString().slice(0, 16));

    // Carregar integrantes ativos e configurações
    async function init() {
      try {
        const [resInt, resConf] = await Promise.all([
          fetch("/api/integrantes?status=ATIVO"),
          fetch("/api/admin/configuracoes"),
        ]);

        if (resInt.ok) {
          const data = await resInt.json();
          const lista: IntegranteItem[] = data.integrantes || [];
          setIntegrantes(lista);

          // Inicializa todos como desmarcados por padrão
          const inicial: Record<string, boolean> = {};
          lista.forEach((i) => {
            inicial[i.id] = false;
          });
          setPresencas(inicial);
        }

        if (resConf.ok) {
          const dataConf = await resConf.json();
          if (dataConf.config?.enderecoPadrao) {
            setLocal(dataConf.config.enderecoPadrao);
          }
        }
      } catch (e) {
        console.error("Erro ao inicializar:", e);
      } finally {
        setCarregando(false);
      }
    }

    init();
  }, []);

  function togglePresenca(id: string) {
    setPresencas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function marcarTodos(marcar: boolean) {
    const atualizado: Record<string, boolean> = {};
    integrantes.forEach((i) => {
      atualizado[i.id] = marcar;
    });
    setPresencas(atualizado);
  }

  function adicionarVisitante(e: React.FormEvent) {
    e.preventDefault();
    if (!novoVisitante.trim()) return;
    setVisitantes([...visitantes, novoVisitante.trim()]);
    setNovoVisitante("");
  }

  function removerVisitante(idx: number) {
    setVisitantes(visitantes.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!dataHora || !local || !conduzidoPor) {
      setErro("Por favor, preencha os campos obrigatórios marcados com asterisco (*).");
      return;
    }

    setSalvando(true);

    try {
      const presencasIntegrantes = integrantes.map((int) => ({
        integranteId: int.id,
        presente: Boolean(presencas[int.id]),
      }));

      const res = await fetch("/api/encontros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataHora,
          local,
          conduzidoPor,
          tema,
          presencasIntegrantes,
          visitantes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao registrar encontro.");
        setSalvando(false);
        return;
      }

      router.push("/dashboard/encontros");
      router.refresh();
    } catch {
      setErro("Erro de conexão ao salvar o encontro.");
      setSalvando(false);
    }
  }

  const integrantesFiltrados = integrantes.filter(
    (int) =>
      int.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
      int.apelido?.toLowerCase().includes(busca.toLowerCase())
  );

  const totalPresentes =
    Object.values(presencas).filter(Boolean).length + visitantes.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/encontros"
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a lista de encontros
      </Link>

      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Registrar Encontro e Chamada
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Preencha os dados do encontro e marque as presenças dos jovens
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
          {/* Informações Básicas do Encontro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Data e Horário *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Local do Encontro *
              </label>
              <input
                type="text"
                required
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex.: Salão Paroquial Menino Jesus"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Quem conduziu/passou o encontro? *
              </label>
              <input
                type="text"
                required
                value={conduzidoPor}
                onChange={(e) => setConduzidoPor(e.target.value)}
                placeholder="Ex.: João Victor e Pe. Fulano"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Tema / Assunto do Encontro (opcional)
              </label>
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex.: Chamado à Santidade e Fraternidade"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>
          </div>

          {/* Chamada Interativa dos Integrantes */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  Lista de Presença dos Integrantes
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Clique para alternar entre Presente e Ausente
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => marcarTodos(true)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  Marcar Todos
                </button>
                <button
                  type="button"
                  onClick={() => marcarTodos(false)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            {/* Busca Rápida na Chamada */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar jovem na lista para chamada rápida..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>

            {/* Grade de Integrantes */}
            {carregando ? (
              <p className="text-xs text-neutral-500 py-4 text-center">
                Carregando lista de integrantes...
              </p>
            ) : integrantesFiltrados.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">
                Nenhum integrante ativo encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                {integrantesFiltrados.map((int) => {
                  const presente = Boolean(presencas[int.id]);
                  return (
                    <div
                      key={int.id}
                      onClick={() => togglePresenca(int.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                        presente
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-950 dark:text-emerald-200 font-bold"
                          : "bg-neutral-50 dark:bg-[#1a1d26] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {presente ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                        )}
                        <span className="text-xs truncate">{int.nomeCompleto}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                        {presente ? "Presente" : "Ausente"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Registro de Visitantes Avulsos */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                Visitantes no Encontro (novos amigos)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Registre quem participou sem necessidade de cadastro completo agora.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={novoVisitante}
                onChange={(e) => setNovoVisitante(e.target.value)}
                placeholder="Nome do visitante (ex: Marcos, amigo da Bia)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (novoVisitante.trim()) {
                      setVisitantes([...visitantes, novoVisitante.trim()]);
                      setNovoVisitante("");
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={adicionarVisitante}
                className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-bold transition-colors"
              >
                Adicionar
              </button>
            </div>

            {visitantes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {visitantes.map((vis, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC72C]/20 text-neutral-950 dark:text-[#FFC72C] text-xs font-bold"
                  >
                    <span>{vis}</span>
                    <button
                      type="button"
                      onClick={() => removerVisitante(idx)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Resumo e Botão Salvar */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Total de Presentes:{" "}
              <span className="text-base text-emerald-600 dark:text-emerald-400 font-extrabold">
                {totalPresentes}
              </span>{" "}
              ({Object.values(presencas).filter(Boolean).length} integrantes +{" "}
              {visitantes.length} visitantes)
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard/encontros"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {salvando ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {salvando ? "Salvando..." : "Salvar Encontro e Ata"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
