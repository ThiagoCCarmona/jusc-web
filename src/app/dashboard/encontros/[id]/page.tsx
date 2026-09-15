"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Edit3,
  Trash2,
  AlertCircle,
  CheckSquare,
  Square,
  Search,
  UserPlus,
  Plus,
  X,
  FileText,
} from "lucide-react";
import { formatarDataHora } from "@/lib/utils";
import { InputDataBr } from "@/components/ui/input-data-br";
import { EditorBasico } from "@/components/ui/editor-basico";


interface IntegranteOption {
  id: string;
  nomeCompleto: string;
  apelido?: string | null;
  status: string;
}

export default function DetalhesEncontroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;

  const [encontro, setEncontro] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);

  // Lista de todos os integrantes para edição de chamada
  const [todosIntegrantes, setTodosIntegrantes] = useState<IntegranteOption[]>([]);

  // Estados de edição
  const [modalEditar, setModalEditar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Form de edição
  const [temaEdit, setTemaEdit] = useState("");
  const [localEdit, setLocalEdit] = useState("");
  const [conduzidoPorEdit, setConduzidoPorEdit] = useState("");
  const [dataHoraEdit, setDataHoraEdit] = useState("");
  const [observacaoEdit, setObservacaoEdit] = useState("");

  // Presenças e visitantes em edição
  const [presencasEdit, setPresencasEdit] = useState<Record<string, boolean>>({});
  const [visitantesEdit, setVisitantesEdit] = useState<string[]>([]);
  const [novoVisitanteEdit, setNovoVisitanteEdit] = useState("");
  const [buscaIntegranteEdit, setBuscaIntegranteEdit] = useState("");

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUsuario(data.usuario);
        }
      } catch {
        // Falha silenciosa ao carregar usuário atual
      }
    }
    carregarUsuario();
  }, []);

  async function carregarTodosIntegrantes() {
    try {
      const res = await fetch("/api/integrantes?limite=1000");
      if (res.ok) {
        const data = await res.json();
        setTodosIntegrantes(data.integrantes || []);
      }
    } catch {
      // Falha silenciosa ao carregar integrantes
    }
  }

  async function carregarEncontro() {
    try {
      const res = await fetch(`/api/encontros/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEncontro(data.encontro);
        setTemaEdit(data.encontro.tema || "");
        setLocalEdit(data.encontro.local || "");
        setConduzidoPorEdit(data.encontro.conduzidoPor || "");
        setObservacaoEdit(data.encontro.observacao || "");
        // Format ISO date to YYYY-MM-DDTHH:mm for datetime-local input
        const d = new Date(data.encontro.dataHora);
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDataHoraEdit(formattedDate);

        // Preencher presenças atuais do encontro
        const mapPresencas: Record<string, boolean> = {};
        const listaVisitantes: string[] = [];
        data.encontro.presencas?.forEach((p: any) => {
          if (p.integranteId) {
            mapPresencas[p.integranteId] = Boolean(p.presente);
          } else if (p.nomeVisitante) {
            listaVisitantes.push(p.nomeVisitante);
          }
        });
        setPresencasEdit(mapPresencas);
        setVisitantesEdit(listaVisitantes);
      } else {
        router.push("/dashboard/encontros");
      }
    } catch {
      router.push("/dashboard/encontros");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEncontro();
    carregarTodosIntegrantes();
  }, [id]);

  // Lista unificada de integrantes para a chamada (todos os integrantes do banco + integrantes que já estavam na chamada)
  const listaIntegrantesEdicao = useMemo(() => {
    const mapa = new Map<string, IntegranteOption>();
    todosIntegrantes.forEach((i) => mapa.set(i.id, i));
    if (encontro?.presencas) {
      encontro.presencas.forEach((p: any) => {
        if (p.integranteId && p.integrante && !mapa.has(p.integranteId)) {
          mapa.set(p.integranteId, {
            id: p.integrante.id,
            nomeCompleto: p.integrante.nomeCompleto,
            apelido: p.integrante.apelido,
            status: p.integrante.status,
          });
        }
      });
    }
    return Array.from(mapa.values()).sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
  }, [todosIntegrantes, encontro]);

  const integrantesFiltradosEdicao = useMemo(() => {
    if (!buscaIntegranteEdit.trim()) return listaIntegrantesEdicao;
    const termo = buscaIntegranteEdit.toLowerCase();
    return listaIntegrantesEdicao.filter(
      (i) =>
        i.nomeCompleto.toLowerCase().includes(termo) ||
        i.apelido?.toLowerCase().includes(termo)
    );
  }, [listaIntegrantesEdicao, buscaIntegranteEdit]);

  function togglePresencaEdit(integranteId: string) {
    setPresencasEdit((prev) => ({
      ...prev,
      [integranteId]: !prev[integranteId],
    }));
  }

  function marcarTodosEdit(presente: boolean) {
    const novo: Record<string, boolean> = { ...presencasEdit };
    listaIntegrantesEdicao.forEach((i) => {
      novo[i.id] = presente;
    });
    setPresencasEdit(novo);
  }

  function adicionarVisitanteEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!novoVisitanteEdit.trim()) return;
    setVisitantesEdit((prev) => [...prev, novoVisitanteEdit.trim()]);
    setNovoVisitanteEdit("");
  }

  function removerVisitanteEdit(index: number) {
    setVisitantesEdit((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErroAcao(null);

    try {
      const presencasPayload = listaIntegrantesEdicao.map((int) => ({
        integranteId: int.id,
        presente: Boolean(presencasEdit[int.id]),
      }));

      const res = await fetch(`/api/encontros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: temaEdit,
          local: localEdit,
          conduzidoPor: conduzidoPorEdit,
          observacao: observacaoEdit,
          dataHora: dataHoraEdit ? new Date(dataHoraEdit).toISOString() : undefined,
          presencasIntegrantes: presencasPayload,
          visitantes: visitantesEdit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErroAcao(data.error || "Erro ao salvar alterações.");
        setSalvando(false);
        return;
      }

      setModalEditar(false);
      await carregarEncontro();
    } catch {
      setErroAcao("Falha ao se conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleAlternarPresencaRapida(integranteId: string, atualPresente: boolean) {
    if (usuario?.perfil !== "ADMIN") return;
    try {
      // Monta nova lista a partir das presenças salvas no encontro
      const presencasPayload = listaIntegrantesEdicao.map((int) => {
        if (int.id === integranteId) {
          return { integranteId: int.id, presente: !atualPresente };
        }
        return { integranteId: int.id, presente: Boolean(presencasEdit[int.id]) };
      });

      const res = await fetch(`/api/encontros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presencasIntegrantes: presencasPayload,
          visitantes: visitantesEdit,
        }),
      });

      if (res.ok) {
        setPresencasEdit((prev) => ({
          ...prev,
          [integranteId]: !atualPresente,
        }));
        await carregarEncontro();
      }
    } catch {
      // Falha de conexão ao alternar presença
    }
  }

  async function handleExcluirEncontro() {
    setExcluindo(true);
    setErroAcao(null);

    try {
      const res = await fetch(`/api/encontros/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErroAcao(data.error || "Erro ao excluir o encontro.");
        setExcluindo(false);
        return;
      }

      router.push("/dashboard/encontros");
      router.refresh();
    } catch {
      setErroAcao("Falha ao se conectar com o servidor.");
      setExcluindo(false);
    }
  }

  if (carregando || !encontro) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#15171e] rounded-3xl border border-neutral-200 dark:border-neutral-800">
        <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Carregando ata do encontro...</p>
      </div>
    );
  }

  const membrosPresentes = encontro.presencas.filter(
    (p: any) => p.presente && p.integranteId
  );
  const visitantes = encontro.presencas.filter((p: any) => p.nomeVisitante);
  const membrosAusentes = encontro.presencas.filter(
    (p: any) => !p.presente && p.integranteId
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/encontros"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a lista de encontros
        </Link>

        {/* Botões de Ação do Administrador */}
        {usuario?.perfil === "ADMIN" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setErroAcao(null);
                setModalEditar(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar Encontro Completo
            </button>
            <button
              type="button"
              onClick={() => {
                setErroAcao(null);
                setModalExcluir(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-xs border border-red-300 dark:border-red-800 shadow-sm transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Cabeçalho do Encontro */}
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFC72C]">
          <Calendar className="w-4 h-4" />
          <span>{formatarDataHora(encontro.dataHora)}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
          {encontro.tema || "Encontro Ordinário JUSC"}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>{encontro.local}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>Conduzido por: <strong>{encontro.conduzidoPor}</strong></span>
          </div>
        </div>

        {/* Indicadores de Presença */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
              Total Presentes
            </span>
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">
              {membrosPresentes.length + visitantes.length}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
              Visitantes
            </span>
            <p className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-0.5">
              {visitantes.length}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400">
              Ausentes
            </span>
            <p className="text-2xl font-black text-neutral-800 dark:text-neutral-200 mt-0.5">
              {membrosAusentes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Chamada: Integrantes Presentes e Visitantes */}
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Integrantes Presentes ({membrosPresentes.length})
          </h2>
          {usuario?.perfil === "ADMIN" && (
            <span className="text-[10px] text-neutral-400">Clique na tag para alternar presença</span>
          )}
        </div>

        {membrosPresentes.length === 0 ? (
          <p className="text-xs text-neutral-500">Nenhum integrante marcado como presente.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {membrosPresentes.map((p: any) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200/60 dark:border-neutral-800 text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between transition-colors"
              >
                <Link
                  href={`/dashboard/integrantes/${p.integrante?.id}`}
                  className="truncate hover:underline"
                >
                  {p.integrante?.nomeCompleto}
                </Link>
                {usuario?.perfil === "ADMIN" ? (
                  <button
                    type="button"
                    onClick={() => handleAlternarPresencaRapida(p.integrante?.id, true)}
                    title="Alternar para ausente"
                    className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300 transition-colors"
                  >
                    Presente
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-extrabold">Presente</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Visitantes */}
        {visitantes.length > 0 && (
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Visitantes no Encontro ({visitantes.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {visitantes.map((v: any) => (
                <span
                  key={v.id}
                  className="px-3 py-1 rounded-full bg-[#FFC72C]/20 text-neutral-900 dark:text-[#FFC72C] text-xs font-bold"
                >
                  {v.nomeVisitante}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Ausentes */}
      {membrosAusentes.length > 0 && (
        <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-neutral-400" />
              Integrantes Ausentes ({membrosAusentes.length})
            </h2>
            {usuario?.perfil === "ADMIN" && (
              <span className="text-[10px] text-neutral-400">Clique na tag para alternar presença</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {membrosAusentes.map((p: any) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between transition-colors"
              >
                <Link
                  href={`/dashboard/integrantes/${p.integrante?.id}`}
                  className="truncate hover:underline"
                >
                  {p.integrante?.nomeCompleto}
                </Link>
                {usuario?.perfil === "ADMIN" ? (
                  <button
                    type="button"
                    onClick={() => handleAlternarPresencaRapida(p.integrante?.id, false)}
                    title="Alternar para presente"
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-extrabold hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 transition-colors"
                  >
                    Ausente
                  </button>
                ) : (
                  <span className="text-[10px] text-neutral-400">Ausente</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card de Observações e Ata do Encontro (Abaixo de tudo) */}
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            Observações, Reflexões e Anotações do Encontro
          </h2>
        </div>

        {encontro.observacao && encontro.observacao.trim() ? (
          <div
            className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-[#1a1d26] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 [&_h3]:text-sm [&_h3]:font-black [&_h3]:my-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-500"
            dangerouslySetInnerHTML={{ __html: encontro.observacao }}
          />
        ) : (
          <p className="text-xs text-neutral-400 italic py-1">
            Nenhuma observação ou anotação registrada para este encontro.
          </p>
        )}
      </div>

      {/* Modal de Edição Completa para Administrador */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#FFC72C]" />
                Edição Completa do Encontro
              </h2>
              <button
                type="button"
                onClick={() => setModalEditar(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroAcao && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{erroAcao}</span>
              </div>
            )}

            <form onSubmit={handleSalvarEdicao} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tema do Encontro
                  </label>
                  <input
                    type="text"
                    value={temaEdit}
                    onChange={(e) => setTemaEdit(e.target.value)}
                    placeholder="Ex.: Juventude e Oração"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Data do Encontro * (DD/MM/AAAA) e Horário
                  </label>
                  <div className="flex items-center gap-2">
                    <InputDataBr
                      value={dataHoraEdit ? dataHoraEdit.slice(0, 10) : ""}
                      onChange={(br, iso) => {
                        const hora = dataHoraEdit.includes("T") ? dataHoraEdit.split("T")[1] : "17:00";
                        setDataHoraEdit(iso ? `${iso}T${hora}` : "");
                      }}
                      placeholder="DD/MM/AAAA"
                      required
                    />
                    <input
                      type="time"
                      value={dataHoraEdit.includes("T") ? dataHoraEdit.split("T")[1].slice(0, 5) : "17:00"}
                      onChange={(e) => {
                        const dataBase = dataHoraEdit.includes("T") ? dataHoraEdit.split("T")[0] : new Date().toISOString().slice(0, 10);
                        setDataHoraEdit(`${dataBase}T${e.target.value}`);
                      }}
                      className="w-28 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Local *
                  </label>
                  <input
                    type="text"
                    required
                    value={localEdit}
                    onChange={(e) => setLocalEdit(e.target.value)}
                    placeholder="Ex.: Salão Paroquial"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Conduzido Por *
                  </label>
                  <input
                    type="text"
                    required
                    value={conduzidoPorEdit}
                    onChange={(e) => setConduzidoPorEdit(e.target.value)}
                    placeholder="Ex.: Liderança de Jovens"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>
              </div>

              {/* Seção de Edição da Lista de Presença */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4" />
                      Edição de Presença dos Integrantes
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Marque quem participou deste encontro
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => marcarTodosEdit(true)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                    >
                      Marcar Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => marcarTodosEdit(false)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                {/* Busca rápida */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={buscaIntegranteEdit}
                    onChange={(e) => setBuscaIntegranteEdit(e.target.value)}
                    placeholder="Filtrar integrantes pelo nome..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {integrantesFiltradosEdicao.map((int) => {
                    const presente = Boolean(presencasEdit[int.id]);
                    return (
                      <div
                        key={int.id}
                        onClick={() => togglePresencaEdit(int.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                          presente
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-950 dark:text-emerald-200 font-bold"
                            : "bg-neutral-50 dark:bg-[#1a1d26] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {presente ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400 flex-shrink-0" />
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
              </div>

              {/* Seção de Visitantes */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Visitantes no Encontro
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoVisitanteEdit}
                    onChange={(e) => setNovoVisitanteEdit(e.target.value)}
                    placeholder="Nome do visitante para adicionar..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        adicionarVisitanteEdit();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => adicionarVisitanteEdit()}
                    className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-bold transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                {visitantesEdit.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {visitantesEdit.map((vis, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFC72C]/20 text-neutral-900 dark:text-[#FFC72C] text-xs font-semibold"
                      >
                        {vis}
                        <button
                          type="button"
                          onClick={() => removerVisitanteEdit(idx)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações e Anotações no Modal de Edição */}
              <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Observações, Reflexões e Anotações do Encontro
                </label>
                <EditorBasico
                  value={observacaoEdit}
                  onChange={setObservacaoEdit}
                  placeholder="Edite aqui as anotações do encontro, reflexão, avisos..."
                  minHeight="120px"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
                  disabled={salvando}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {salvando ? "Salvando Alterações..." : "Salvar Encontro Completo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalExcluir && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Excluir Registro de Encontro
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Tem certeza de que deseja excluir este encontro? Esta ação excluirá os registros de chamada vinculados e não pode ser desfeita.
            </p>

            {erroAcao && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{erroAcao}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setModalExcluir(false)}
                disabled={excluindo}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExcluirEncontro}
                disabled={excluindo}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                {excluindo ? "Excluindo..." : "Sim, Excluir Encontro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
