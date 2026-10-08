"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Shirt,
  X,
  Upload,
  Trash2,
  Tag,
  PlusCircle,
  Link2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { InputDataBr } from "@/components/ui/input-data-br";
import {
  normalizarModelos,
  ModeloPrecoItem,
  isoParaBrasileiro,
  GRADE_TAMANHOS_BASE,
  TAMANHOS_PADRAO_INICIAIS,
  ordenarTamanhosCatalogo,
} from "@/lib/utils";

export interface FotoComLabel {
  url: string;
  label?: string;
}

export interface CampanhaModalInput {
  id?: string;
  titulo: string;
  descricao?: string | null;
  precoUnitario: number;
  modelos: (string | ModeloPrecoItem)[];
  tamanhosDisponiveis: string[];
  permiteNome: boolean;
  permiteNumero: boolean;
  dataFim: string | Date;
  fotos: (string | FotoComLabel)[];
  ativa?: boolean;
  ocultoNaHome?: boolean;
}

interface ModalCampanhaProps {
  aberto: boolean;
  onFechar: () => void;
  campanha?: CampanhaModalInput | null;
  onSalvo: (mensagem: string) => void;
  onErro: (mensagem: string) => void;
}

export function ModalCampanha({
  aberto,
  onFechar,
  campanha,
  onSalvo,
  onErro,
}: ModalCampanhaProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoBase, setPrecoBase] = useState("");
  const [ocultoNaHome, setOcultoNaHome] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [modelos, setModelos] = useState<ModeloPrecoItem[]>([
    { nome: "Tradicional", tamanhos: [...TAMANHOS_PADRAO_INICIAIS] },
    { nome: "Baby Look", tamanhos: [...TAMANHOS_PADRAO_INICIAIS] },
  ]);
  const [novoModeloNome, setNovoModeloNome] = useState("");
  const [novoModeloPreco, setNovoModeloPreco] = useState("");

  // Grade/Régua de tamanhos e novo tamanho customizado
  const [reguaTamanhos, setReguaTamanhos] = useState<string[]>(GRADE_TAMANHOS_BASE);
  const [novoTamanhoExtra, setNovoTamanhoExtra] = useState("");

  const [permiteNome, setPermiteNome] = useState(true);
  const [permiteNumero, setPermiteNumero] = useState(true);
  const [dataFimBr, setDataFimBr] = useState("");
  const [dataFimIso, setDataFimIso] = useState<string | null>(null);
  const [horaFim, setHoraFim] = useState("23:59");
  const [fotos, setFotos] = useState<FotoComLabel[]>([]);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberto) return;

    if (campanha) {
      setTitulo(campanha.titulo || "");
      setDescricao(campanha.descricao || "");
      setPrecoBase(campanha.precoUnitario ? campanha.precoUnitario.toString() : "");

      const modelosNorm = normalizarModelos(campanha.modelos, campanha.precoUnitario);
      const tamsCampanha = Array.isArray(campanha.tamanhosDisponiveis) && campanha.tamanhosDisponiveis.length > 0
        ? campanha.tamanhosDisponiveis
        : TAMANHOS_PADRAO_INICIAIS;

      const modelosConfigurados = modelosNorm.map((m) => {
        const tams = m.tamanhos && m.tamanhos.length > 0 ? m.tamanhos : [...tamsCampanha];
        const tamsShort = m.ehConjunto
          ? (m.tamanhosShort && m.tamanhosShort.length > 0 ? m.tamanhosShort : [...tams])
          : undefined;
        return {
          ...m,
          tamanhos: tams,
          tamanhosShort: tamsShort,
        };
      });
      setModelos(modelosConfigurados);

      // Atualiza a régua com a base e quaisquer tamanhos da campanha e dos modelos
      const todosTams = new Set([
        ...GRADE_TAMANHOS_BASE,
        ...tamsCampanha,
        ...modelosConfigurados.flatMap((m) => [...(m.tamanhos || []), ...(m.tamanhosShort || [])]),
      ]);
      setReguaTamanhos(ordenarTamanhosCatalogo(Array.from(todosTams)));

      setPermiteNome(Boolean(campanha.permiteNome));
      setPermiteNumero(Boolean(campanha.permiteNumero));
      setOcultoNaHome(Boolean(campanha.ocultoNaHome));

      if (campanha.dataFim) {
        const d = new Date(campanha.dataFim);
        const iso = d.toISOString().slice(0, 10);
        const hora = String(d.getHours()).padStart(2, "0");
        const minuto = String(d.getMinutes()).padStart(2, "0");
        setDataFimIso(iso);
        setDataFimBr(isoParaBrasileiro(iso));
        setHoraFim(`${hora}:${minuto}`);
      } else {
        setDataFimBr("");
        setDataFimIso(null);
        setHoraFim("23:59");
      }

      const fotosFmt: FotoComLabel[] = (campanha.fotos || []).map((f) =>
        typeof f === "string" ? { url: f, label: "" } : f
      );
      setFotos(fotosFmt);
    } else {
      // Criação nova
      setTitulo("");
      setDescricao("");
      setPrecoBase("");
      setOcultoNaHome(false);
      setModelos([
        { nome: "Tradicional", tamanhos: [...TAMANHOS_PADRAO_INICIAIS] },
        { nome: "Baby Look", tamanhos: [...TAMANHOS_PADRAO_INICIAIS] },
      ]);
      setNovoModeloNome("");
      setNovoModeloPreco("");
      setReguaTamanhos(GRADE_TAMANHOS_BASE);
      setNovoTamanhoExtra("");
      setPermiteNome(true);
      setPermiteNumero(true);
      setDataFimBr("");
      setDataFimIso(null);
      setHoraFim("23:59");
      setFotos([]);
    }
  }, [aberto, campanha]);

  if (!aberto) return null;

  async function handleUploadFoto(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setUploadingFoto(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setFotos((prev) => [...prev, { url: data.url, label: "" }]);
      } else {
        onErro(data.error || "Erro no upload da foto.");
      }
    } catch {
      onErro("Erro de conexão no envio da foto.");
    } finally {
      setUploadingFoto(false);
    }
  }

  // Alternar tamanho específico de um modelo (camiseta ou short)
  function handleToggleTamanhoModelo(idx: number, tam: string, ehShort = false) {
    setModelos((prev) => {
      const novos = [...prev];
      const mod = { ...novos[idx] };
      if (ehShort) {
        const atuais = mod.tamanhosShort || [...TAMANHOS_PADRAO_INICIAIS];
        if (atuais.includes(tam)) {
          if (atuais.length <= 1) {
            onErro("O short deve ter ao menos um tamanho selecionado.");
            return prev;
          }
          mod.tamanhosShort = atuais.filter((t) => t !== tam);
        } else {
          mod.tamanhosShort = ordenarTamanhosCatalogo([...atuais, tam]);
        }
      } else {
        const atuais = mod.tamanhos || [...TAMANHOS_PADRAO_INICIAIS];
        if (atuais.includes(tam)) {
          if (atuais.length <= 1) {
            onErro("O modelo deve ter ao menos um tamanho selecionado.");
            return prev;
          }
          mod.tamanhos = atuais.filter((t) => t !== tam);
        } else {
          mod.tamanhos = ordenarTamanhosCatalogo([...atuais, tam]);
        }
      }
      novos[idx] = mod;
      return novos;
    });
  }

  // Atalhos rápidos para o modelo (Padrão PP-XGG, Todos da régua)
  function handleDefinirGradeModelo(idx: number, tipo: "PADRAO" | "TODOS", ehShort = false) {
    setModelos((prev) => {
      const novos = [...prev];
      const mod = { ...novos[idx] };
      const selecionados = tipo === "PADRAO" ? [...TAMANHOS_PADRAO_INICIAIS] : [...reguaTamanhos];
      if (ehShort) {
        mod.tamanhosShort = selecionados;
      } else {
        mod.tamanhos = selecionados;
      }
      novos[idx] = mod;
      return novos;
    });
  }

  // Adicionar tamanho extra à régua
  function handleAdicionarTamanhoRegua() {
    const limpo = novoTamanhoExtra.trim().toUpperCase();
    if (!limpo) return;
    if (!reguaTamanhos.includes(limpo)) {
      setReguaTamanhos(ordenarTamanhosCatalogo([...reguaTamanhos, limpo]));
    }
    setNovoTamanhoExtra("");
  }

  function handleCopiarLinkDireto() {
    if (!campanha?.id) return;
    const url = `${window.location.origin}/?camiseta=${campanha.id}`;
    navigator.clipboard.writeText(url);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titulo.trim() || !precoBase || !dataFimIso) {
      onErro("Preencha título, valor unitário base e data de encerramento.");
      return;
    }

    if (fotos.length < 2) {
      onErro("Adicione no mínimo 2 fotos da camiseta (frente e verso/modelos).");
      return;
    }

    if (modelos.length === 0) {
      onErro("Adicione pelo menos um modelo de camiseta.");
      return;
    }

    // Validar tamanhos de cada modelo
    for (const mod of modelos) {
      const tams = mod.tamanhos || [];
      if (tams.length === 0) {
        onErro(`Selecione ao menos um tamanho para o modelo "${mod.nome || "sem nome"}".`);
        return;
      }
      if (mod.ehConjunto) {
        const tamsShort = mod.tamanhosShort || [];
        if (tamsShort.length === 0) {
          onErro(`Selecione ao menos um tamanho de short para o conjunto "${mod.nome || "sem nome"}".`);
          return;
        }
      }
    }

    const todosTamanhosCampanha = Array.from(
      new Set(
        modelos.flatMap((m) => [
          ...(m.tamanhos || []),
          ...(m.ehConjunto && m.tamanhosShort ? m.tamanhosShort : []),
        ])
      )
    );

    if (todosTamanhosCampanha.length === 0) {
      onErro("Selecione pelo menos um tamanho nos modelos.");
      return;
    }

    setSalvando(true);

    try {
      const [horaF, minF] = (horaFim || "23:59").split(":");
      const [aF, mF, dF] = dataFimIso.split("-");
      const dataFimFinal = new Date(
        Number(aF),
        Number(mF) - 1,
        Number(dF),
        Number(horaF || 23),
        Number(minF || 59)
      ).toISOString();

      const precoBaseNum = parseFloat(precoBase);
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        precoUnitario: precoBaseNum,
        modelos: modelos.map((m) => ({
          nome: m.nome.trim(),
          preco:
            m.preco !== undefined && !isNaN(m.preco) && m.preco > 0
              ? m.preco
              : precoBaseNum,
          ehConjunto: Boolean(m.ehConjunto),
          tamanhos: ordenarTamanhosCatalogo(m.tamanhos || []),
          tamanhosShort: m.ehConjunto && m.tamanhosShort ? ordenarTamanhosCatalogo(m.tamanhosShort) : undefined,
        })),
        tamanhosDisponiveis: ordenarTamanhosCatalogo(todosTamanhosCampanha),
        permiteNome,
        permiteNumero,
        ocultoNaHome,
        dataFim: dataFimFinal,
        fotos,
      };


      const url = campanha?.id ? `/api/campanhas/${campanha.id}` : "/api/campanhas";
      const method = campanha?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        onSalvo(
          campanha?.id
            ? "Campanha de camisetas atualizada com sucesso!"
            : "Nova campanha de camisetas publicada com sucesso!"
        );
        onFechar();
      } else {
        onErro(data.error || "Falha ao salvar campanha.");
      }
    } catch {
      onErro("Erro de conexão ao salvar campanha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Shirt className="w-5 h-5 text-[#FFC72C]" />
            {campanha?.id
              ? "Editar Campanha / Pedido de Camisetas"
              : "Lançar Novo Pedido / Campanha de Camisetas"}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Título da Camiseta / Campanha *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Camiseta Oficial JUSC 2026"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Valor Unitário Base (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={precoBase}
                onChange={(e) => setPrecoBase(e.target.value)}
                placeholder="45.00"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              />
              <span className="text-[10px] text-neutral-400">
                Preço padrão caso o modelo não tenha valor customizado
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Descrição e Regras de Retirada
              </label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: Malha 100% algodão penteado. Retirada prevista para os encontros..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
              />
            </div>

            {/* Modelos e Valores Personalizados */}
            <div className="sm:col-span-2 space-y-2.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Modelos & Valores Diferenciados *
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Defina os modelos disponíveis e informe um valor específico se houver (ex: Tradicional R$ 40, Moletom R$ 85).
                  </p>
                </div>
              </div>

              {/* Lista de Modelos */}
              <div className="space-y-3">
                {modelos.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-[#15171e] rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Nome do Modelo (ex: Tradicional, Conjunto Short e Camiseta)"
                          value={mod.nome}
                          onChange={(e) => {
                            const novos = [...modelos];
                            novos[idx] = { ...novos[idx], nome: e.target.value };
                            setModelos(novos);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                        />
                      </div>

                      <div className="w-32">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-bold">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={precoBase || "45.00"}
                            value={mod.preco !== undefined ? mod.preco : ""}
                            onChange={(e) => {
                              const novos = [...modelos];
                              const val = e.target.value ? parseFloat(e.target.value) : undefined;
                              novos[idx] = { ...novos[idx], preco: val };
                              setModelos(novos);
                            }}
                            className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (modelos.length <= 1) {
                            onErro("A campanha deve conter pelo menos um modelo.");
                            return;
                          }
                          setModelos(modelos.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Remover modelo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Opção de Conjunto (Short + Camiseta) */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] border-t border-neutral-100 dark:border-neutral-800/80">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-neutral-700 dark:text-neutral-300 select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(mod.ehConjunto)}
                          onChange={(e) => {
                            const novos = [...modelos];
                            const ehConj = e.target.checked;
                            novos[idx] = {
                              ...novos[idx],
                              ehConjunto: ehConj,
                              tamanhosShort: ehConj
                                ? (novos[idx].tamanhosShort || [...(novos[idx].tamanhos || TAMANHOS_PADRAO_INICIAIS)])
                                : undefined,
                            };
                            setModelos(novos);
                          }}
                          className="rounded border-neutral-300 text-amber-500 focus:ring-[#FFC72C]"
                        />
                        <span>🩳 É Conjunto (Camiseta + Short)</span>
                      </label>
                      <span className="text-[10px] text-neutral-400">
                        (O cliente selecionará o tamanho da camiseta e do short separadamente no pedido)
                      </span>
                    </div>

                    {/* Tamanhos da Camiseta deste modelo */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">
                          Tamanhos da camiseta deste modelo ({(mod.tamanhos || []).length} ativo{(mod.tamanhos || []).length === 1 ? "" : "s"}):
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDefinirGradeModelo(idx, "PADRAO", false)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-[#FFC72C] hover:text-neutral-950 transition-colors cursor-pointer"
                          >
                            Padrão (PP-XGG)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDefinirGradeModelo(idx, "TODOS", false)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-[#FFC72C] hover:text-neutral-950 transition-colors cursor-pointer"
                          >
                            Todos da grade
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {reguaTamanhos.map((tam) => {
                          const selecionado = (mod.tamanhos || TAMANHOS_PADRAO_INICIAIS).includes(tam);
                          return (
                            <button
                              key={tam}
                              type="button"
                              onClick={() => handleToggleTamanhoModelo(idx, tam, false)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                selecionado
                                  ? "bg-[#FFC72C] text-neutral-950 shadow-xs border border-amber-400 font-black"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                              }`}
                            >
                              {tam}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Se for Conjunto: Tamanhos do Short deste modelo */}
                    {mod.ehConjunto && (
                      <div className="pt-2 border-t border-dashed border-amber-300/50 dark:border-amber-900/50 space-y-1.5 bg-amber-500/5 -mx-3 px-3 pb-2 rounded-b-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                          <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                            <span>🩳</span> Tamanhos do short deste modelo ({(mod.tamanhosShort || []).length} ativo{(mod.tamanhosShort || []).length === 1 ? "" : "s"}):
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDefinirGradeModelo(idx, "PADRAO", true)}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 transition-colors cursor-pointer"
                            >
                              Padrão (PP-XGG)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDefinirGradeModelo(idx, "TODOS", true)}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 transition-colors cursor-pointer"
                            >
                              Todos da grade
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {reguaTamanhos.map((tam) => {
                            const selecionado = (mod.tamanhosShort || mod.tamanhos || TAMANHOS_PADRAO_INICIAIS).includes(tam);
                            return (
                              <button
                                key={tam}
                                type="button"
                                onClick={() => handleToggleTamanhoModelo(idx, tam, true)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  selecionado
                                    ? "bg-amber-500 text-white shadow-xs border border-amber-600 font-black"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                                }`}
                              >
                                {tam}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Adicionar Novo Modelo */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Novo modelo (ex: Regata, Moletom, Conjunto)"
                  value={novoModeloNome}
                  onChange={(e) => setNovoModeloNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (novoModeloNome.trim()) {
                        const p = novoModeloPreco
                          ? parseFloat(novoModeloPreco)
                          : precoBase
                          ? parseFloat(precoBase)
                          : undefined;
                        const ehConj = novoModeloNome.toLowerCase().includes("conjunto");
                        setModelos([
                          ...modelos,
                          {
                            nome: novoModeloNome.trim(),
                            preco: p,
                            ehConjunto: ehConj,
                            tamanhos: [...TAMANHOS_PADRAO_INICIAIS],
                            tamanhosShort: ehConj ? [...TAMANHOS_PADRAO_INICIAIS] : undefined,
                          },
                        ]);
                        setNovoModeloNome("");
                        setNovoModeloPreco("");
                      }
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-xs font-medium"
                />

                <div className="w-32 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Valor (opcional)"
                    value={novoModeloPreco}
                    onChange={(e) => setNovoModeloPreco(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 rounded-xl bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!novoModeloNome.trim()) {
                      onErro("Informe o nome do modelo.");
                      return;
                    }
                    const p = novoModeloPreco
                      ? parseFloat(novoModeloPreco)
                      : precoBase
                      ? parseFloat(precoBase)
                      : undefined;
                    const ehConj = novoModeloNome.toLowerCase().includes("conjunto");
                    setModelos([
                      ...modelos,
                      {
                        nome: novoModeloNome.trim(),
                        preco: p,
                        ehConjunto: ehConj,
                        tamanhos: [...TAMANHOS_PADRAO_INICIAIS],
                        tamanhosShort: ehConj ? [...TAMANHOS_PADRAO_INICIAIS] : undefined,
                      },
                    ]);
                    setNovoModeloNome("");
                    setNovoModeloPreco("");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs hover:opacity-90 flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Adicionar tamanho personalizado à grade */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700/80">
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>Deseja adicionar outro tamanho maior ou menor à grade? (ex: 4G, RN)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Novo tam (ex: 4G)"
                    value={novoTamanhoExtra}
                    onChange={(e) => setNovoTamanhoExtra(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdicionarTamanhoRegua();
                      }
                    }}
                    className="w-28 px-2.5 py-1 rounded-lg bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-xs font-bold uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleAdicionarTamanhoRegua}
                    className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-[#FFC72C] hover:text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Adicionar à grade
                  </button>
                </div>
              </div>

            </div>

            {/* Data Limite */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Data e Horário Limite de Pedidos * (DD/MM/AAAA)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <InputDataBr
                    value={dataFimBr}
                    onChange={(br, iso) => {
                      setDataFimBr(br);
                      setDataFimIso(iso);
                    }}
                    placeholder="DD/MM/AAAA"
                    required
                  />
                </div>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-24 px-2.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white"
                  title="Horário limite de encerramento dos pedidos"
                />
              </div>
            </div>

            {/* Opções de Personalização e Visibilidade */}
            <div className="space-y-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                  <input
                    type="checkbox"
                    checked={permiteNome}
                    onChange={(e) => setPermiteNome(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                  />
                  <span>Permitir Nome</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                  <input
                    type="checkbox"
                    checked={permiteNumero}
                    onChange={(e) => setPermiteNumero(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                  />
                  <span>Permitir Número</span>
                </label>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                  <input
                    type="checkbox"
                    checked={ocultoNaHome}
                    onChange={(e) => setOcultoNaHome(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-[#FFC72C]"
                  />
                  <span>Ocultar do banner da Home (Disponível apenas por link direto)</span>
                </label>
                <p className="text-[10px] text-neutral-500 mt-0.5 pl-6">
                  Se marcado, o banner não aparece na página inicial, mas quem acessar pelo link direto faz o pedido normalmente.
                </p>
              </div>
            </div>

            {/* Bloco de Link Direto (quando a campanha já existe) */}
            {campanha?.id && (
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    <Link2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Link Direto para Pedidos de Camisetas</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate font-mono select-all">
                    {typeof window !== "undefined" ? `${window.location.origin}/?camiseta=${campanha.id}` : `/?camiseta=${campanha.id}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopiarLinkDireto}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex-shrink-0 cursor-pointer"
                >
                  {copiadoLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link Direto</span>
                    </>
                  )}
                </button>
              </div>
            )}


            {/* Upload de Fotos com Legenda e Capa */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Fotos da Camiseta * (mínimo 2 fotos obrigatórias)
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Adicione legendas aos modelos (ex: "Frente", "Costas", "Baby Look", "Tabela de Medidas"). A primeira foto será a capa.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleUploadFoto(e.target.files[0]);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFoto}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FFC72C]" />
                    {uploadingFoto ? "Enviando..." : "Adicionar Foto"}
                  </button>
                </div>
              </div>

              {fotos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {fotos.map((foto, idx) => {
                    const ehCapa = idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border-2 transition-all group bg-neutral-50 dark:bg-[#1a1d26] flex items-center gap-3 ${
                          ehCapa
                            ? "border-[#FFC72C] ring-2 ring-[#FFC72C]/30"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/10 flex-shrink-0">
                          <Image
                            src={foto.url}
                            alt={`Foto ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            {ehCapa ? (
                              <span className="px-2 py-0.5 rounded-md bg-[#FFC72C] text-neutral-950 text-[10px] font-black">
                                ⭐ Foto de Capa
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const reordenadas = [
                                    foto,
                                    ...fotos.filter((_, i) => i !== idx),
                                  ];
                                  setFotos(reordenadas);
                                }}
                                className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
                              >
                                Definir como Capa
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setFotos(fotos.filter((_, i) => i !== idx))}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                              title="Remover foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="relative">
                            <Tag className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text"
                              placeholder="Legenda (ex: Frente, Baby Look)"
                              value={foto.label || ""}
                              onChange={(e) => {
                                const novas = [...fotos];
                                novas[idx] = { ...novas[idx], label: e.target.value };
                                setFotos(novas);
                              }}
                              className="w-full pl-7 pr-2 py-1 rounded-lg bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-[11px] font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-black text-xs shadow-sm transition-all"
            >
              {salvando
                ? "Salvando..."
                : campanha?.id
                ? "Salvar Alterações"
                : "Publicar Campanha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
