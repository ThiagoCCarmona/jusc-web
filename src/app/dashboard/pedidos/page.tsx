"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Shirt,
  Search,
  CheckCircle2,
  Clock,
  Check,
  PackageCheck,
  AlertCircle,
  ExternalLink,
  Filter,
  DollarSign,
  TrendingUp,
  CreditCard,
  MessageCircle,
  XCircle,
  PlusCircle,
  Upload,
  Trash2,
  X,
  FileSpreadsheet,
  FileText,
  Download,
  RotateCcw,
  Edit3,
  Tag,
} from "lucide-react";
import { formatarData, normalizarModelos, ModeloPrecoItem, formatarFaixaPrecos } from "@/lib/utils";
import { InputDataBr } from "@/components/ui/input-data-br";
import { ModalCampanha } from "@/components/dashboard/modal-campanha";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface FotoComLabel {
  url: string;
  label?: string;
}

interface CampanhaItem {
  id: string;
  titulo: string;
  descricao?: string | null;
  precoUnitario: number;
  modelos: (string | ModeloPrecoItem)[];
  tamanhosDisponiveis: string[];
  permiteNome: boolean;
  permiteNumero: boolean;
  dataFim: string;
  ativa: boolean;
  fotos: (string | FotoComLabel)[];
  _count?: { pedidos: number };
}

interface PedidoItem {
  id: string;
  codigoPedido: string;
  nomeComprador: string;
  telefoneComprador: string;
  modelo: string;
  tamanho: string;
  quantidade: number;
  personalizacaoNome?: string | null;
  personalizacaoNum?: string | null;
  formaPagamento: string;
  tipoQuitacao: string;
  valorTotal: number;
  valorPago: number;
  statusPagamento: "PENDENTE" | "PAGO_PARCIAL" | "PAGO_TOTAL" | "CANCELADO";
  entregue: boolean;
  observacao?: string | null;
  criadoEm: string;
  campanha: {
    id: string;
    titulo: string;
    precoUnitario: number;
    fotos: string;
  };
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoItem[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  // Modal de Estorno / Desfazer Baixa
  const [pedidoEstorno, setPedidoEstorno] = useState<PedidoItem | null>(null);
  const [processandoEstorno, setProcessandoEstorno] = useState(false);

  // Modal de Criar / Editar Campanha
  const [modalCampanhaAberto, setModalCampanhaAberto] = useState(false);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<CampanhaItem | null>(null);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [resPed, resCamp] = await Promise.all([
        fetch("/api/pedidos"),
        fetch("/api/campanhas?todas=true"),
      ]);

      if (resPed.ok) {
        const dataPed = await resPed.json();
        setPedidos(dataPed.pedidos || []);
      }
      if (resCamp.ok) {
        const dataCamp = await resCamp.json();
        setCampanhas(dataCamp.campanhas || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function abrirCriarCampanha() {
    setCampanhaSelecionada(null);
    setModalCampanhaAberto(true);
  }

  function abrirEditarCampanha(camp: CampanhaItem) {
    setCampanhaSelecionada(camp);
    setModalCampanhaAberto(true);
  }

  // Ações nos Pedidos (Baixa 50%, 100%, Entregue)
  async function executarAcao(
    id: string,
    acao: "BAIXA_50" | "BAIXA_100" | "MARCAR_ENTREGUE" | "CANCELAR"
  ) {
    setProcessandoId(id);
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });

      if (res.ok) {
        setMensagemSucesso("Pedido atualizado com sucesso!");
        setTimeout(() => setMensagemSucesso(""), 3000);
        await carregarDados();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessandoId(null);
    }
  }

  // Ação de Desfazer Baixa (Estorno)
  async function handleConfirmarDesfazerBaixa(reverterPara?: "PAGO_PARCIAL" | "PENDENTE") {
    if (!pedidoEstorno) return;
    setProcessandoEstorno(true);
    try {
      const res = await fetch(`/api/pedidos/${pedidoEstorno.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "DESFAZER_BAIXA",
          reverterPara,
        }),
      });

      if (res.ok) {
        setMensagemSucesso(`Baixa do pedido ${pedidoEstorno.codigoPedido} revertida com sucesso!`);
        setTimeout(() => setMensagemSucesso(""), 4000);
        setPedidoEstorno(null);
        await carregarDados();
      } else {
        const data = await res.json();
        setMensagemErro(data.error || "Erro ao desfazer baixa.");
      }
    } catch {
      setMensagemErro("Erro de conexão ao desfazer baixa.");
    } finally {
      setProcessandoEstorno(false);
    }
  }

  // Filtragem dos pedidos
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtroStatus !== "TODOS" && p.statusPagamento !== filtroStatus) {
        return false;
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const codMatch = p.codigoPedido.toLowerCase().includes(termo);
        const nomeMatch = p.nomeComprador.toLowerCase().includes(termo);
        const telMatch = p.telefoneComprador.replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
        const modMatch = p.modelo.toLowerCase().includes(termo);
        const persMatch =
          p.personalizacaoNome?.toLowerCase().includes(termo) ||
          p.personalizacaoNum?.toLowerCase().includes(termo);
        if (!codMatch && !nomeMatch && !telMatch && !modMatch && !persMatch) return false;
      }
      return true;
    });
  }, [pedidos, busca, filtroStatus]);

  // ==========================================
  // RELATÓRIO DO FORNECEDOR (SEM VALORES / PAGAMENTO)
  // Agrupado por Modelo & Tamanho + Relação com Personalizações
  // ==========================================
  function exportarFornecedorPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataHora = new Date().toLocaleString("pt-BR");

    const pedidosValidos = pedidosFiltrados.filter((p) => p.statusPagamento !== "CANCELADO");

    // 1. Agrupamento por Modelo e Tamanho
    const grade: Record<string, number> = {};
    let totalPecas = 0;

    pedidosValidos.forEach((p) => {
      const chave = `${p.modelo} — Tam. ${p.tamanho}`;
      grade[chave] = (grade[chave] || 0) + p.quantidade;
      totalPecas += p.quantidade;
    });

    doc.setFontSize(14);
    doc.text("Relatório de Produção para Fornecedor / Estamparia", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHora} | Total Geral de Camisetas: ${totalPecas} peça(s) | Pedidos: ${pedidosValidos.length}`,
      14,
      21
    );

    // Tabela 1: Resumo da Grade
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("1. Resumo da Grade de Confecção (Quantidades por Modelo e Tamanho)", 14, 28);

    const gradeHead = [["Modelo / Especificação", "Tamanho", "Quantidade (Peças)"]];
    const gradeBody = Object.entries(grade).map(([chave, qtd]) => {
      const [mod, tam] = chave.split(" — Tam. ");
      return [mod, tam || "-", `${qtd} un.`];
    });

    autoTable(doc, {
      head: gradeHead,
      body: gradeBody,
      startY: 32,
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Tabela 2: Relação Nominal & Personalizações
    const finalYGrade = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 90;

    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("2. Detalhamento de Itens e Personalizações de Nome/Número", 14, finalYGrade);

    const itensHead = [["Cód. Pedido", "Modelo", "Tam.", "Qtd", "Nome na Camiseta", "Nº na Camiseta"]];
    const itensBody = pedidosValidos.map((p) => [
      p.codigoPedido,
      p.modelo,
      p.tamanho,
      `${p.quantidade}`,
      p.personalizacaoNome ? p.personalizacaoNome.toUpperCase() : "—",
      p.personalizacaoNum ? `${p.personalizacaoNum}` : "—",
    ]);

    autoTable(doc, {
      head: itensHead,
      body: itensBody,
      startY: finalYGrade + 4,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`fornecedor-camisetas-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function exportarFornecedorCSV() {
    const pedidosValidos = pedidosFiltrados.filter((p) => p.statusPagamento !== "CANCELADO");

    const cabecalho = [
      "Código do Pedido",
      "Modelo",
      "Tamanho",
      "Quantidade",
      "Nome Estampado",
      "Número Estampado",
      "Data do Pedido",
    ];

    const linhas = pedidosValidos.map((p) => [
      `"${p.codigoPedido}"`,
      `"${p.modelo}"`,
      `"${p.tamanho}"`,
      p.quantidade,
      `"${p.personalizacaoNome ? p.personalizacaoNome.toUpperCase() : ""}"`,
      `"${p.personalizacaoNum || ""}"`,
      formatarData(p.criadoEm),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [cabecalho.join(";"), ...linhas.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fornecedor-camisetas-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==========================================
  // RELATÓRIO FINANCEIRO GERAL (COM VALORES)
  // ==========================================
  function exportarFinanceiroPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const dataHora = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text("Relatório Financeiro de Pedidos de Camisetas", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHora} | Total: ${pedidosFiltrados.length} pedidos | Confirmado: R$ ${totalArrecadado.toFixed(2)} | Pendente: R$ ${totalPendente.toFixed(2)}`,
      14,
      21
    );

    const tableHead = [
      ["Cód.", "Data", "Comprador", "Telefone", "Item/Tam.", "Personalização", "Total", "Pago", "Status", "Entregue"],
    ];

    const tableBody = pedidosFiltrados.map((p) => {
      const pers = [p.personalizacaoNome ? `Nome: ${p.personalizacaoNome}` : "", p.personalizacaoNum ? `Nº ${p.personalizacaoNum}` : ""].filter(Boolean).join(" | ") || "—";
      return [
        p.codigoPedido,
        new Date(p.criadoEm).toLocaleDateString("pt-BR"),
        p.nomeComprador,
        p.telefoneComprador,
        `${p.quantidade}x ${p.modelo} (${p.tamanho})`,
        pers,
        `R$ ${p.valorTotal.toFixed(2)}`,
        `R$ ${p.valorPago.toFixed(2)}`,
        p.statusPagamento,
        p.entregue ? "Sim" : "Não",
      ];
    });

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [254, 243, 199] },
    });

    doc.save(`pedidos-financeiro-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // Estatísticas
  const totalArrecadado = useMemo(() => {
    return pedidos
      .filter((p) => p.statusPagamento !== "CANCELADO")
      .reduce((acc, p) => acc + (p.valorPago || 0), 0);
  }, [pedidos]);

  const totalPendente = useMemo(() => {
    return pedidos
      .filter((p) => p.statusPagamento !== "CANCELADO")
      .reduce((acc, p) => acc + Math.max(0, p.valorTotal - p.valorPago), 0);
  }, [pedidos]);

  const totalCamisetas = useMemo(() => {
    return pedidos
      .filter((p) => p.statusPagamento !== "CANCELADO")
      .reduce((acc, p) => acc + p.quantidade, 0);
  }, [pedidos]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shirt className="w-6 h-6 text-[#FFC72C]" />
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
              Gestão de Pedidos de Camisetas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Painel da Tesouraria e Administração para controle de baixas, relatórios para fornecedores e entregas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={abrirCriarCampanha}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Campanha
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {mensagemErro && (
        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-800 dark:text-red-300 animate-fadeIn flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
            <span>Total Confirmado em Caixa</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            R$ {totalArrecadado.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-[11px] text-neutral-400">Valores com baixa aprovada</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
            <span>Saldo a Receber / Pendente</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            R$ {totalPendente.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-[11px] text-neutral-400">Valores pendentes ou saldo na entrega</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
            <span>Total de Camisetas</span>
            <Shirt className="w-4 h-4 text-[#FFC72C]" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">
            {totalCamisetas} <span className="text-xs font-normal text-neutral-500">peças</span>
          </p>
          <p className="text-[11px] text-neutral-400">Em {pedidos.length} pedido(s) ativos</p>
        </div>
      </div>

      {/* Campanhas Ativas com Opção de Edição */}
      {campanhas.length > 0 && (
        <div className="bg-white dark:bg-[#13151c] rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span>Campanhas de Camiseta Cadastradas ({campanhas.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campanhas.map((c) => {
              const primeiraFoto = c.fotos?.[0];
              const urlFoto = typeof primeiraFoto === "object" && primeiraFoto ? primeiraFoto.url : primeiraFoto;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {urlFoto ? (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 flex-shrink-0">
                        <Image src={urlFoto} alt={c.titulo} fill unoptimized className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400">
                        Sem foto
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-extrabold text-neutral-900 dark:text-white truncate">{c.titulo}</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatarFaixaPrecos(c.modelos, c.precoUnitario)}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate">
                        Modelos: {normalizarModelos(c.modelos, c.precoUnitario).map((m) => m.nome).join(", ")}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Encerra em: {formatarData(c.dataFim)} • {c.fotos?.length || 0} foto(s)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirEditarCampanha(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#13151c] border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-amber-500 transition-colors flex-shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Editar</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de Filtros e Exportação de Relatórios */}
      <div className="bg-white dark:bg-[#13151c] rounded-3xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por código, comprador, modelo ou personalização..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold focus:ring-2 focus:ring-[#FFC72C] focus:outline-none"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="PAGO_PARCIAL">Pago 50% (Sinal)</option>
              <option value="PAGO_TOTAL">Quitado 100%</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Botões de Relatório Direto */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="text-neutral-500 font-medium">
            Listando <strong>{pedidosFiltrados.length}</strong> pedidos
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {/* Relatório Fornecedor (Sem Valores) */}
            <button
              type="button"
              onClick={exportarFornecedorPDF}
              title="Gera PDF com quantidades por modelo/tamanho e personalizações (sem preços)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-black text-xs hover:opacity-90 shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#FFC72C]" />
              <span>Fornecedor (PDF)</span>
            </button>

            <button
              type="button"
              onClick={exportarFornecedorCSV}
              title="Gera planilha CSV para a fábrica ou estamparia"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fornecedor (Excel/CSV)</span>
            </button>

            {/* Relatório Financeiro */}
            <button
              type="button"
              onClick={exportarFinanceiroPDF}
              title="Relatório financeiro com valores arrecadados e baixas"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Financeiro (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white dark:bg-[#13151c] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        {carregando ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-neutral-500">Carregando pedidos de camisetas...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-2">
            <Shirt className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs font-medium">Nenhum pedido encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Cód. / Data</th>
                  <th className="py-3.5 px-4">Comprador</th>
                  <th className="py-3.5 px-4">Item & Personalização</th>
                  <th className="py-3.5 px-4">Financeiro</th>
                  <th className="py-3.5 px-4">Status & Entrega</th>
                  <th className="py-3.5 px-4 text-right">Ações da Tesouraria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {pedidosFiltrados.map((p) => {
                  const saldoAPagar = Math.max(0, p.valorTotal - p.valorPago);
                  const isProcessing = processandoId === p.id;
                  const telLimpo = p.telefoneComprador.replace(/\D/g, "");

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      {/* Código e Data */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-neutral-900 dark:text-white block">
                          {p.codigoPedido}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {formatarData(p.criadoEm)}
                        </span>
                      </td>

                      {/* Comprador & WhatsApp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-neutral-900 dark:text-white block">
                          {p.nomeComprador}
                        </span>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${telLimpo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          {p.telefoneComprador}
                        </a>
                      </td>

                      {/* Item & Personalização */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                          {p.quantidade}x Modelo {p.modelo} — Tam. {p.tamanho}
                        </span>
                        {(p.personalizacaoNome || p.personalizacaoNum) && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                            {[
                              p.personalizacaoNome ? `Nome: ${p.personalizacaoNome}` : "",
                              p.personalizacaoNum ? `Nº: ${p.personalizacaoNum}` : "",
                            ]
                              .filter(Boolean)
                              .join(" | ")}
                          </span>
                        )}
                      </td>

                      {/* Financeiro */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-neutral-900 dark:text-white">
                          Total: R$ {p.valorTotal.toFixed(2).replace(".", ",")}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Pago:{" "}
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            R$ {p.valorPago.toFixed(2).replace(".", ",")}
                          </span>
                          {saldoAPagar > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 block font-semibold">
                              Resta: R$ {saldoAPagar.toFixed(2).replace(".", ",")}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 uppercase">
                          {p.formaPagamento} ({p.tipoQuitacao === "PARCELADO_50_50" ? "50/50" : "Integral"})
                        </span>
                      </td>

                      {/* Status & Entrega */}
                      <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                        <div>
                          {p.statusPagamento === "PAGO_TOTAL" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Quitado 100%
                            </span>
                          ) : p.statusPagamento === "PAGO_PARCIAL" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                              <Clock className="w-3 h-3" />
                              Sinal Pago (50%)
                            </span>
                          ) : p.statusPagamento === "CANCELADO" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-[10px]">
                              <XCircle className="w-3 h-3" />
                              Cancelado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[10px]">
                              <Clock className="w-3 h-3" />
                              Pendente
                            </span>
                          )}
                        </div>

                        <div>
                          {p.entregue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
                              <PackageCheck className="w-3 h-3" />
                              Entregue
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 font-medium">
                              Não entregue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ações da Tesouraria */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {p.statusPagamento !== "PAGO_TOTAL" && p.statusPagamento !== "CANCELADO" && (
                          <>
                            {p.tipoQuitacao === "PARCELADO_50_50" && p.statusPagamento === "PENDENTE" && (
                              <button
                                disabled={isProcessing}
                                onClick={() => executarAcao(p.id, "BAIXA_50")}
                                title="Confirmar recebimento do sinal de 50%"
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm transition-all"
                              >
                                Baixa 50%
                              </button>
                            )}

                            <button
                              disabled={isProcessing}
                              onClick={() => executarAcao(p.id, "BAIXA_100")}
                              title="Confirmar quitação total do pedido"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                            >
                              Baixa 100%
                            </button>
                          </>
                        )}

                        {/* Botão DESFAZER BAIXA (caso tenha sido pago por engano) */}
                        {p.statusPagamento !== "PENDENTE" && p.statusPagamento !== "CANCELADO" && (
                          <button
                            disabled={isProcessing}
                            onClick={() => setPedidoEstorno(p)}
                            title="Desfazer baixa de pagamento"
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold text-[11px] transition-all inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Desfazer Baixa
                          </button>
                        )}

                        <button
                          disabled={isProcessing}
                          onClick={() => executarAcao(p.id, "MARCAR_ENTREGUE")}
                          title={p.entregue ? "Desmarcar entrega" : "Marcar como camiseta entregue"}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
                            p.entregue
                              ? "border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
                              : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {p.entregue ? "Desfazer Entrega" : "Entregue"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Desfazer Baixa de Pagamento */}
      {pedidoEstorno && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600">
              <RotateCcw className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Desfazer Baixa de Pagamento
              </h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Você deseja reverter a confirmação de pagamento do pedido{" "}
              <strong>{pedidoEstorno.codigoPedido}</strong> ({pedidoEstorno.nomeComprador})?
            </p>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs space-y-1">
              <p>Total do Pedido: <strong>R$ {pedidoEstorno.valorTotal.toFixed(2)}</strong></p>
              <p>Valor Pago Registrado: <strong>R$ {pedidoEstorno.valorPago.toFixed(2)}</strong></p>
              <p>Status Atual: <strong>{pedidoEstorno.statusPagamento}</strong></p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {pedidoEstorno.statusPagamento === "PAGO_TOTAL" && pedidoEstorno.tipoQuitacao === "PARCELADO_50_50" && (
                <button
                  type="button"
                  disabled={processandoEstorno}
                  onClick={() => handleConfirmarDesfazerBaixa("PAGO_PARCIAL")}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Voltar para 50% (Sinal Pago)
                </button>
              )}

              <button
                type="button"
                disabled={processandoEstorno}
                onClick={() => handleConfirmarDesfazerBaixa("PENDENTE")}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Reverter Totalmente para Pendente (0% Pago)
              </button>

              <button
                type="button"
                onClick={() => setPedidoEstorno(null)}
                className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Iniciar / Editar Campanha */}
      <ModalCampanha
        aberto={modalCampanhaAberto}
        onFechar={() => setModalCampanhaAberto(false)}
        campanha={campanhaSelecionada}
        onSalvo={(msg) => {
          setMensagemSucesso(msg);
          setTimeout(() => setMensagemSucesso(""), 4000);
          carregarDados();
        }}
        onErro={(err) => setMensagemErro(err)}
      />
    </div>
  );
}

