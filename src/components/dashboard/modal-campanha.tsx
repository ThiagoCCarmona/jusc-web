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
  Check,
  Edit2,
  RotateCcw,
} from "lucide-react";
import { InputDataBr } from "@/components/ui/input-data-br";
import { normalizarModelos, ModeloPrecoItem } from "@/lib/utils";

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
}

interface ModalCampanhaProps {
  aberto: boolean;
  onFechar: () => void;
  campanha?: CampanhaModalInput | null;
  onSalvo: (mensagem: string) => void;
  onErro: (mensagem: string) => void;
}

const TAMANHOS_PADRAO = ["12", "14", "16", "PP", "P", "M", "G", "GG", "XGG", "G1", "G2"];

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
  const [modelos, setModelos] = useState<ModeloPrecoItem[]>([
    { nome: "Tradicional" },
    { nome: "Baby Look" },
  ]);
  const [novoModeloNome, setNovoModeloNome] = useState("");
  const [novoModeloPreco, setNovoModeloPreco] = useState("");

  // Gestão Dinâmica de Tamanhos (Criar, Editar e Selecionar)
  const [listaTamanhos, setListaTamanhos] = useState<string[]>(TAMANHOS_PADRAO);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>([
    "PP", "P", "M", "G", "GG", "XGG",
  ]);
  const [novoTamanhoInput, setNovoTamanhoInput] = useState("");
  const [tamanhoEditando, setTamanhoEditando] = useState<{ antigo: string; novo: string } | null>(null);

  const [permiteNome, setPermiteNome] = useState(true);
  const [permiteNumero, setPermiteNumero] = useState(true);
  const [dataFim, setDataFim] = useState("");
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
      setModelos(modelosNorm);

      const tams = Array.isArray(campanha.tamanhosDisponiveis)
        ? campanha.tamanhosDisponiveis
        : ["P", "M", "G"];
      setTamanhosSelecionados(tams);

      // Garante que todos os tamanhos da campanha estejam na lista visível
      const todosTams = Array.from(new Set([...TAMANHOS_PADRAO, ...tams]));
      setListaTamanhos(todosTams);

      setPermiteNome(Boolean(campanha.permiteNome));
      setPermiteNumero(Boolean(campanha.permiteNumero));

      const dataStr = campanha.dataFim ? new Date(campanha.dataFim).toISOString() : "";
      setDataFim(dataStr);

      const fotosFmt: FotoComLabel[] = (campanha.fotos || []).map((f) =>
        typeof f === "string" ? { url: f, label: "" } : f
      );
      setFotos(fotosFmt);
    } else {
      // Criação nova
      setTitulo("");
      setDescricao("");
      setPrecoBase("");
      setModelos([
        { nome: "Tradicional" },
        { nome: "Baby Look" },
      ]);
      setNovoModeloNome("");
      setNovoModeloPreco("");
      setListaTamanhos(TAMANHOS_PADRAO);
      setTamanhosSelecionados(["PP", "P", "M", "G", "GG", "XGG"]);
      setPermiteNome(true);
      setPermiteNumero(true);
      setDataFim("");
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

  // Adicionar tamanho personalizado
  function handleAdicionarTamanho() {
    const limpo = novoTamanhoInput.trim().toUpperCase();
    if (!limpo) return;

    if (!listaTamanhos.includes(limpo)) {
      setListaTamanhos([...listaTamanhos, limpo]);
    }
    if (!tamanhosSelecionados.includes(limpo)) {
      setTamanhosSelecionados([...tamanhosSelecionados, limpo]);
    }
    setNovoTamanhoInput("");
  }

  // Confirmar edição de um tamanho existente
  function handleConfirmarEditarTamanho() {
    if (!tamanhoEditando) return;
    const novo = tamanhoEditando.novo.trim().toUpperCase();
    const antigo = tamanhoEditando.antigo;
    if (!novo || novo === antigo) {
      setTamanhoEditando(null);
      return;
    }

    setListaTamanhos(listaTamanhos.map((t) => (t === antigo ? novo : t)));
    setTamanhosSelecionados(tamanhosSelecionados.map((t) => (t === antigo ? novo : t)));
    setTamanhoEditando(null);
  }

  // Remover tamanho da lista
  function handleRemoverTamanho(tam: string) {
    setListaTamanhos(listaTamanhos.filter((t) => t !== tam));
    setTamanhosSelecionados(tamanhosSelecionados.filter((t) => t !== tam));
  }

  function handleToggleTamanho(tam: string) {
    if (tamanhosSelecionados.includes(tam)) {
      if (tamanhosSelecionados.length <= 1) {
        onErro("A campanha deve disponibilizar ao menos um tamanho.");
        return;
      }
      setTamanhosSelecionados(tamanhosSelecionados.filter((t) => t !== tam));
    } else {
      setTamanhosSelecionados([...tamanhosSelecionados, tam]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titulo.trim() || !precoBase || !dataFim) {
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

    if (tamanhosSelecionados.length === 0) {
      onErro("Selecione pelo menos um tamanho para a camiseta.");
      return;
    }

    setSalvando(true);

    try {
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
        })),
        tamanhosDisponiveis: tamanhosSelecionados,
        permiteNome,
        permiteNumero,
        dataFim,
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
              <div className="space-y-2">
                {modelos.map((mod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white dark:bg-[#15171e] p-2 rounded-xl border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        placeholder="Nome do Modelo (ex: Tradicional)"
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
                ))}
              </div>

              {/* Adicionar Novo Modelo */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Novo modelo (ex: Regata, Moletom, Infantil)"
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
                        setModelos([...modelos, { nome: novoModeloNome.trim(), preco: p }]);
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
                    setModelos([...modelos, { nome: novoModeloNome.trim(), preco: p }]);
                    setNovoModeloNome("");
                    setNovoModeloPreco("");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs hover:opacity-90 flex items-center gap-1.5 flex-shrink-0 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* Data Limite */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Data Limite de Pedidos * (DD/MM/AAAA)
              </label>
              <div className="flex items-center gap-2">
                <InputDataBr
                  value={dataFim ? dataFim.slice(0, 10) : ""}
                  onChange={(br, iso) => {
                    const hora = dataFim.includes("T") ? dataFim.split("T")[1] : "23:59";
                    setDataFim(iso ? `${iso}T${hora}` : "");
                  }}
                  placeholder="DD/MM/AAAA"
                  required
                />
                <input
                  type="time"
                  value={dataFim.includes("T") ? dataFim.split("T")[1].slice(0, 5) : "23:59"}
                  onChange={(e) => {
                    const dataBase = dataFim.includes("T")
                      ? dataFim.split("T")[0]
                      : new Date().toISOString().slice(0, 10);
                    setDataFim(`${dataBase}T${e.target.value}`);
                  }}
                  className="w-24 px-2 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                />
              </div>
            </div>

            {/* Opções de Personalização */}
            <div className="flex items-center gap-6 p-3 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={permiteNome}
                  onChange={(e) => setPermiteNome(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                />
                <span>Permitir Nome</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={permiteNumero}
                  onChange={(e) => setPermiteNumero(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFC72C] focus:ring-[#FFC72C]"
                />
                <span>Permitir Número</span>
              </label>
            </div>

            {/* Gestão Dinâmica de Tamanhos (Criar, Editar e Selecionar) */}
            <div className="sm:col-span-2 space-y-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Tamanhos Permitidos na Campanha * ({tamanhosSelecionados.length} selecionados)
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Clique no tamanho para ativar/desativar. Você também pode criar tamanhos novos ou editar os existentes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setListaTamanhos(TAMANHOS_PADRAO);
                      setTamanhosSelecionados(["PP", "P", "M", "G", "GG", "XGG"]);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restaurar Padrão
                  </button>
                </div>
              </div>

              {/* Lista de Tamanhos com Pills Interativos */}
              <div className="flex flex-wrap gap-2 pt-1">
                {listaTamanhos.map((tam) => {
                  const selecionado = tamanhosSelecionados.includes(tam);
                  const isEditingThis = tamanhoEditando?.antigo === tam;

                  if (isEditingThis) {
                    return (
                      <div
                        key={tam}
                        className="inline-flex items-center gap-1 p-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-[#FFC72C]"
                      >
                        <input
                          type="text"
                          value={tamanhoEditando.novo}
                          onChange={(e) =>
                            setTamanhoEditando({ ...tamanhoEditando, novo: e.target.value })
                          }
                          className="w-16 px-1.5 py-0.5 rounded bg-white dark:bg-[#15171e] text-xs font-bold uppercase"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleConfirmarEditarTamanho();
                            } else if (e.key === "Escape") {
                              setTamanhoEditando(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleConfirmarEditarTamanho}
                          className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                          title="Confirmar"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTamanhoEditando(null)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
                          title="Cancelar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={tam}
                      className={`group relative inline-flex items-center rounded-xl text-xs font-bold border transition-all ${
                        selecionado
                          ? "bg-[#FFC72C] text-neutral-950 border-amber-400 shadow-xs"
                          : "bg-white dark:bg-[#15171e] border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 opacity-60"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTamanho(tam)}
                        className="px-3 py-1.5"
                      >
                        {tam}
                      </button>

                      <div className="hidden group-hover:flex items-center pr-1.5 gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTamanhoEditando({ antigo: tam, novo: tam });
                          }}
                          className="p-0.5 text-neutral-600 hover:text-neutral-950 dark:hover:text-white"
                          title="Editar nome do tamanho"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoverTamanho(tam);
                          }}
                          className="p-0.5 text-red-500 hover:text-red-700"
                          title="Excluir este tamanho"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input para Criar Novo Tamanho */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Criar novo tamanho (ex: 10, G3, Sob Medida)"
                  value={novoTamanhoInput}
                  onChange={(e) => setNovoTamanhoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdicionarTamanho();
                    }
                  }}
                  className="w-64 px-3 py-1.5 rounded-xl bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-xs font-medium uppercase"
                />
                <button
                  type="button"
                  onClick={handleAdicionarTamanho}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adicionar Tamanho</span>
                </button>
              </div>
            </div>

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
