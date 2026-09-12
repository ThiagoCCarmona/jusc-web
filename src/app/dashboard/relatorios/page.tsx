"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Download,
  Calendar,
  Phone,
  MessageCircle,
  Filter,
  UserCheck,
  UserMinus,
  Clock,
  ShieldAlert,
  HeartPulse,
  Utensils,
  Church,
  Cross,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { formatarData, formatarTelefone } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RelatoriosPage() {
  const [aba, setAba] = useState<
    "MATRIZ" | "SAUDE" | "SACRAMENTOS" | "RESPONSAVEIS" | "INDIVIDUAL" | "AUSENCIA"
  >("MATRIZ");
  const [encontros, setEncontros] = useState<any[]>([]);
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [relatorioResponsaveis, setRelatorioResponsaveis] = useState<any[]>([]);
  const [limiteAlerta, setLimiteAlerta] = useState<number>(2);
  const [limiteInativo, setLimiteInativo] = useState<number>(12);
  const [carregando, setCarregando] = useState(true);

  // Filtro de Sexo geral para relatórios
  const [filtroSexo, setFiltroSexo] = useState<string>("TODOS");

  // Filtros de Encontros (Período)
  // "GERAL" = Todos os encontros registrados
  // "ESTE_ANO" = Encontros que ocorreram no ano corrente
  // "5" = Últimos 5 encontros
  // "10" = Últimos 10 encontros
  // "20" = Últimos 20 encontros
  const [filtroPeriodoEncontros, setFiltroPeriodoEncontros] = useState<string>("10");

  // Filtros de Integrantes
  // "TODOS" = Todos os integrantes cadastrados
  // "ATIVOS" = Apenas ativos
  // "NOVOS_30" = Novos ingressados nos últimos 30 dias
  // "NOVOS_90" = Novos ingressados nos últimos 3 meses
  // "NOVOS_180" = Novos ingressados nos últimos 6 meses
  // "NOVOS_365" = Novos ingressados no último 1 ano
  // "INATIVOS_30" = Inativos / sem presença nos últimos 30 dias
  // "INATIVOS_90" = Inativos / sem presença nos últimos 3 meses
  // "INATIVOS_180" = Inativos / sem presença nos últimos 6 meses
  // "INATIVOS_365" = Inativos / sem presença no último 1 ano
  const [filtroMembros, setFiltroMembros] = useState<string>("TODOS");

  // Filtro específico para Aba de Saúde
  const [filtroSaude, setFiltroSaude] = useState<string>("TODAS_RESTRICOES");

  // Filtro específico para Aba de Sacramentos
  const [filtroSacramentoRelatorio, setFiltroSacramentoRelatorio] = useState<string>("TODOS");

  // Busca textual na Matriz, Responsáveis, Saúde e Sacramentos
  const [busca, setBusca] = useState<string>("");

  // Filtros individual
  const [integranteSelecionadoId, setIntegranteSelecionadoId] = useState<string>("");
  const [qtdEncontrosFrequencia, setQtdEncontrosFrequencia] = useState<number>(10);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch("/api/relatorios");
      if (res.ok) {
        const data = await res.json();
        setEncontros(data.encontros || []);
        setIntegrantes(data.integrantes || []);
        setRelatorioResponsaveis(data.relatorioResponsaveis || []);
        if (data.limiteAlerta) setLimiteAlerta(data.limiteAlerta);
        if (data.limiteInativo) setLimiteInativo(data.limiteInativo);
        if (data.integrantes?.length > 0) {
          setIntegranteSelecionadoId(data.integrantes[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  // 1. Filtragem dos Encontros selecionados pelo usuário
  const encontrosFiltrados = useMemo(() => {
    const anoAtual = new Date().getFullYear();
    if (filtroPeriodoEncontros === "ESTE_ANO") {
      return encontros.filter((e) => new Date(e.dataHora).getFullYear() === anoAtual);
    }
    if (filtroPeriodoEncontros === "GERAL") {
      return encontros;
    }
    const limiteQtd = Number(filtroPeriodoEncontros) || 10;
    return encontros.slice(0, limiteQtd);
  }, [encontros, filtroPeriodoEncontros]);

  // 2. Filtragem dos Integrantes de acordo com os filtros de membros, sexo e busca
  const integrantesFiltrados = useMemo(() => {
    return integrantes.filter((int) => {
      // Filtro de sexo
      if (filtroSexo !== "TODOS" && (int.sexo || "MASCULINO") !== filtroSexo) {
        return false;
      }

      // Busca textual por nome, apelido ou telefone
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nomeMatch = int.nomeCompleto.toLowerCase().includes(termo);
        const apelidoMatch = int.apelido?.toLowerCase().includes(termo);
        const telMatch = int.telefone.replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
        const respMatch = int.nomeResponsavel?.toLowerCase().includes(termo);
        if (!nomeMatch && !apelidoMatch && !telMatch && !respMatch) return false;
      }

      // Filtro de membros
      if (filtroMembros === "TODOS") return true;
      if (filtroMembros === "ATIVOS") return int.statusCalculado === "ATIVO";

      // Novos integrantes nos últimos X
      if (filtroMembros === "NOVOS_30") return (int.diasDesdeEntrada ?? 999) <= 30;
      if (filtroMembros === "NOVOS_90") return (int.diasDesdeEntrada ?? 999) <= 90;
      if (filtroMembros === "NOVOS_180") return (int.diasDesdeEntrada ?? 999) <= 180;
      if (filtroMembros === "NOVOS_365") return (int.diasDesdeEntrada ?? 999) <= 365;

      // Inativos no último X tempo
      if (filtroMembros === "INATIVOS_30") {
        return int.statusCalculado === "INATIVO" && (int.diasDesdeInativacao ?? 999) <= 30;
      }
      if (filtroMembros === "INATIVOS_90") {
        return int.statusCalculado === "INATIVO" && (int.diasDesdeInativacao ?? 999) <= 90;
      }
      if (filtroMembros === "INATIVOS_180") {
        return int.statusCalculado === "INATIVO" && (int.diasDesdeInativacao ?? 999) <= 180;
      }
      if (filtroMembros === "INATIVOS_365") {
        return int.statusCalculado === "INATIVO" && (int.diasDesdeInativacao ?? 999) <= 365;
      }

      // Restrições de Saúde / Alergias
      if (filtroMembros === "COM_ALERGIA") return Boolean(int.possuiAlergia);
      if (filtroMembros === "INTOLERANCIA_GLUTEN") return Boolean(int.intoleranciaGluten);
      if (filtroMembros === "INTOLERANCIA_LACTOSE") return Boolean(int.intoleranciaLactose);
      if (filtroMembros === "QUALQUER_RESTRICAO") {
        return (
          Boolean(int.possuiAlergia) ||
          Boolean(int.intoleranciaGluten) ||
          Boolean(int.intoleranciaLactose)
        );
      }

      return true;
    });
  }, [integrantes, busca, filtroMembros, filtroSexo]);

  // 3. Filtragem de Responsáveis com base na busca e sexo
  const responsaveisFiltrados = useMemo(() => {
    return relatorioResponsaveis.filter((r) => {
      if (filtroSexo !== "TODOS" && (r.integranteSexo || "MASCULINO") !== filtroSexo) {
        return false;
      }
      if (!busca.trim()) return true;
      const termo = busca.toLowerCase();
      return (
        r.nomeResponsavel.toLowerCase().includes(termo) ||
        r.integranteNome.toLowerCase().includes(termo) ||
        r.telefoneResponsavel.replace(/\D/g, "").includes(termo.replace(/\D/g, "")) ||
        r.integranteTelefone.replace(/\D/g, "").includes(termo.replace(/\D/g, ""))
      );
    });
  }, [relatorioResponsaveis, busca, filtroSexo]);

  // 4. Filtragem da Aba de Saúde e Restrições Alimentares
  const saudeFiltrados = useMemo(() => {
    return integrantes.filter((int) => {
      // Filtro de sexo
      if (filtroSexo !== "TODOS" && (int.sexo || "MASCULINO") !== filtroSexo) {
        return false;
      }

      // Busca textual
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nomeMatch = int.nomeCompleto.toLowerCase().includes(termo);
        const apelidoMatch = int.apelido?.toLowerCase().includes(termo);
        const telMatch = int.telefone.replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
        const descAlergiaMatch = int.descricaoAlergia?.toLowerCase().includes(termo);
        if (!nomeMatch && !apelidoMatch && !telMatch && !descAlergiaMatch) return false;
      }

      // Filtro de Saúde
      if (filtroSaude === "TODAS_RESTRICOES") {
        return (
          Boolean(int.possuiAlergia) ||
          Boolean(int.intoleranciaGluten) ||
          Boolean(int.intoleranciaLactose)
        );
      }
      if (filtroSaude === "COM_ALERGIA") return Boolean(int.possuiAlergia);
      if (filtroSaude === "INTOLERANCIA_GLUTEN") return Boolean(int.intoleranciaGluten);
      if (filtroSaude === "INTOLERANCIA_LACTOSE") return Boolean(int.intoleranciaLactose);
      if (filtroSaude === "TODOS_INTEGRANTES") return true;

      return true;
    });
  }, [integrantes, busca, filtroSaude, filtroSexo]);

  // 5. Filtragem da Aba de Sacramentos
  const sacramentosFiltrados = useMemo(() => {
    return integrantes.filter((int) => {
      // Filtro de sexo
      if (filtroSexo !== "TODOS" && (int.sexo || "MASCULINO") !== filtroSexo) {
        return false;
      }

      // Busca textual
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nomeMatch = int.nomeCompleto.toLowerCase().includes(termo);
        const apelidoMatch = int.apelido?.toLowerCase().includes(termo);
        const telMatch = int.telefone.replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
        if (!nomeMatch && !apelidoMatch && !telMatch) return false;
      }

      // Filtro de Sacramentos
      if (filtroSacramentoRelatorio === "TODOS") return true;
      if (filtroSacramentoRelatorio === "TODOS_INICIADOS") {
        return int.batismo && int.primeiraEucaristia && int.crisma;
      }
      if (filtroSacramentoRelatorio === "SEM_BATISMO") return !int.batismo;
      if (filtroSacramentoRelatorio === "SEM_EUCARISTIA") return !int.primeiraEucaristia;
      if (filtroSacramentoRelatorio === "SEM_CRISMA") return !int.crisma;
      if (filtroSacramentoRelatorio === "COM_BATISMO") return Boolean(int.batismo);
      if (filtroSacramentoRelatorio === "COM_EUCARISTIA") return Boolean(int.primeiraEucaristia);
      if (filtroSacramentoRelatorio === "COM_CRISMA") return Boolean(int.crisma);

      return true;
    });
  }, [integrantes, busca, filtroSacramentoRelatorio, filtroSexo]);

  // Exportar Matriz de Presenças para CSV (com telefones do jovem e do responsável)
  function exportarMatrizCSV() {
    const cabecalho = [
      "Nome Completo",
      "Telefone Jovem",
      "Status",
      "Nome Responsável",
      "Telefone Responsável",
      "No Grupo WhatsApp",
      "Possui Alergia",
      "Alergia A Quê",
      "Intolerância Glúten",
      "Intolerância Lactose",
      ...encontrosFiltrados.map((e) =>
        new Date(e.dataHora).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      ),
      "Presenças",
      "% Frequência",
    ];

    const linhas = integrantesFiltrados.map((int) => {
      const presencasConfirmadas = int.presencas || [];
      const totalEncontros = encontrosFiltrados.length;
      let count = 0;

      const presencasPorEncontro = encontrosFiltrados.map((e) => {
        const p = e.presencas?.find((pr: any) => pr.integranteId === int.id) ||
          presencasConfirmadas.find((pr: any) => pr.encontroId === e.id);
        if (p?.presente) {
          count++;
          return "Presente";
        }
        return "Ausente";
      });

      const perc = totalEncontros > 0 ? Math.round((count / totalEncontros) * 100) : 0;

      return [
        `"${int.nomeCompleto}"`,
        `"${int.telefone}"`,
        `"${int.statusCalculado}"`,
        `"${int.nomeResponsavel || ""}"`,
        `"${int.telefoneResponsavel || ""}"`,
        int.noGrupoWhatsapp ? "Sim" : "Não",
        int.possuiAlergia ? "Sim" : "Não",
        `"${int.descricaoAlergia || ""}"`,
        int.intoleranciaGluten ? "Sim" : "Não",
        int.intoleranciaLactose ? "Sim" : "Não",
        ...presencasPorEncontro,
        count,
        `${perc}%`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [cabecalho.join(";"), ...linhas.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `matriz-presencas-jusc-${filtroPeriodoEncontros}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar Alertas de Ausência para CSV
  function exportarAusentesCSV() {
    const ausentes = integrantes.filter((i) => i.temAlertaAusencia || i.statusCalculado === "INATIVO");
    const cabecalho = [
      "Nome do Integrante",
      "Telefone Integrante",
      "Status",
      "Meses sem Presença",
      "Última Presença",
      "Nome do Responsável",
      "Telefone do Responsável",
      "No Grupo WhatsApp",
    ];

    const linhas = ausentes.map((i) => [
      `"${i.nomeCompleto}"`,
      `"${i.telefone}"`,
      i.temAlertaAusencia ? "Alerta de Ausência" : "Inativo",
      i.mesesSemPresenca,
      i.ultimaPresencaData ? formatarData(i.ultimaPresencaData) : "Sem registro",
      `"${i.nomeResponsavel}"`,
      `"${i.telefoneResponsavel}"`,
      i.noGrupoWhatsapp ? "Sim" : "Não",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [cabecalho.join(";"), ...linhas.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio-ausencias-jusc-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar Relatório de Responsáveis para CSV
  function exportarResponsaveisCSV() {
    const cabecalho = [
      "Nome do Responsável",
      "Telefone do Responsável",
      "Nome do Jovem",
      "Apelido",
      "Telefone do Jovem",
      "Status Pastoral",
      "No Grupo WhatsApp",
    ];

    const linhas = responsaveisFiltrados.map((r) => [
      `"${r.nomeResponsavel}"`,
      `"${r.telefoneResponsavel}"`,
      `"${r.integranteNome}"`,
      `"${r.integranteApelido || ""}"`,
      `"${r.integranteTelefone}"`,
      `"${r.integranteStatus}"`,
      r.noGrupoWhatsapp ? "Sim" : "Não",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [cabecalho.join(";"), ...linhas.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `relatorio-responsaveis-jusc-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar Relatório de Saúde e Restrições Alimentares para CSV
  function exportarSaudeCSV() {
    const cabecalho = [
      "Nome Completo",
      "Apelido",
      "Telefone Jovem",
      "Possui Alergia",
      "Alergia A Quê",
      "Intolerância Glúten",
      "Intolerância Lactose",
      "Nome Responsável",
      "Telefone Responsável",
      "Status Pastoral",
      "No Grupo WhatsApp",
    ];

    const linhas = saudeFiltrados.map((s) => [
      `"${s.nomeCompleto}"`,
      `"${s.apelido || ""}"`,
      `"${s.telefone}"`,
      s.possuiAlergia ? "Sim" : "Não",
      `"${s.descricaoAlergia || ""}"`,
      s.intoleranciaGluten ? "Sim" : "Não",
      s.intoleranciaLactose ? "Sim" : "Não",
      `"${s.nomeResponsavel || ""}"`,
      `"${s.telefoneResponsavel || ""}"`,
      `"${s.statusCalculado}"`,
      s.noGrupoWhatsapp ? "Sim" : "Não",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [cabecalho.join(";"), ...linhas.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `relatorio-saude-alergias-jusc-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar Relatório de Sacramentos para CSV
  function exportarSacramentosCSV() {
    const cabecalho = [
      "Nome Completo",
      "Apelido",
      "Telefone Jovem",
      "Batismo",
      "1ª Eucaristia",
      "Crisma",
      "Iniciação Cristã Completa",
      "Nome Responsável",
      "Telefone Responsável",
      "Status Pastoral",
    ];

    const linhas = sacramentosFiltrados.map((sac) => {
      const iniciacaoCompleta = sac.batismo && sac.primeiraEucaristia && sac.crisma;
      return [
        `"${sac.nomeCompleto}"`,
        `"${sac.apelido || ""}"`,
        `"${sac.telefone}"`,
        sac.batismo ? "Sim" : "Não",
        sac.primeiraEucaristia ? "Sim" : "Não",
        sac.crisma ? "Sim" : "Não",
        iniciacaoCompleta ? "Sim" : "Pendente",
        `"${sac.nomeResponsavel || ""}"`,
        `"${sac.telefoneResponsavel || ""}"`,
        `"${sac.statusCalculado}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [cabecalho.join(";"), ...linhas.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `relatorio-sacramentos-jusc-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- EXPORTAÇÃO EM PDF (jsPDF + autoTable) ---

  // PDF 1: Matriz de Presenças (Paisagem)
  function exportarMatrizPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const dataHoraEmissao = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text("JUSC — Matriz de Presenças Pastoral", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHoraEmissao} | Período: ${filtroPeriodoEncontros} encontros | Total Integrantes: ${integrantesFiltrados.length}`,
      14,
      21
    );

    const headEncontros = encontrosFiltrados.map((e) =>
      new Date(e.dataHora).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    );

    const tableHead = [["Integrante", "Telefone", "Sexo", "Status", ...headEncontros, "Pres.", "%"]];

    const tableBody = integrantesFiltrados.map((int) => {
      const presencasConfirmadas = int.presencas || [];
      const totalEnc = encontrosFiltrados.length;
      let count = 0;

      const colunasPresenca = encontrosFiltrados.map((e) => {
        const p =
          e.presencas?.find((pr: any) => pr.integranteId === int.id) ||
          presencasConfirmadas.find((pr: any) => pr.encontroId === e.id);
        if (p?.presente) {
          count++;
          return "P";
        }
        return "-";
      });

      const perc = totalEnc > 0 ? Math.round((count / totalEnc) * 100) : 0;

      return [
        int.nomeCompleto + (int.apelido ? ` (${int.apelido})` : ""),
        int.telefone,
        int.sexo === "FEMININO" ? "F" : "M",
        int.temAlertaAusencia ? "Alerta" : int.statusCalculado === "ATIVO" ? "Ativo" : "Inativo",
        ...colunasPresenca,
        String(count),
        `${perc}%`,
      ];
    });

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 25,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [255, 199, 44], textColor: [20, 20, 20], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
    });

    doc.save(`matriz-presencas-jusc-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // PDF 2: Saúde e Restrições Alimentares
  function exportarSaudePDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataHoraEmissao = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text("JUSC — Relatório de Saúde e Restrições Alimentares", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHoraEmissao} | Total listado: ${saudeFiltrados.length} integrantes`,
      14,
      21
    );

    const tableHead = [
      ["Integrante", "Telefone", "Sexo", "Alergias Identificadas", "S/ Glúten", "S/ Lactose", "Responsável", "Tel. Resp."],
    ];

    const tableBody = saudeFiltrados.map((s) => [
      s.nomeCompleto + (s.apelido ? ` (${s.apelido})` : ""),
      s.telefone,
      s.sexo === "FEMININO" ? "F" : "M",
      s.possuiAlergia ? s.descricaoAlergia || "Possui alergia" : "Nenhuma",
      s.intoleranciaGluten ? "Sim" : "Não",
      s.intoleranciaLactose ? "Sim" : "Não",
      s.nomeResponsavel || "-",
      s.telefoneResponsavel || "-",
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });

    doc.save(`relatorio-saude-jusc-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // PDF 3: Sacramentos
  function exportarSacramentosPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataHoraEmissao = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text("JUSC — Relatório Pastoral de Sacramentos", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHoraEmissao} | Total listado: ${sacramentosFiltrados.length} integrantes`,
      14,
      21
    );

    const tableHead = [
      ["Integrante", "Telefone", "Sexo", "Batismo", "1ª Eucaristia", "Crisma", "Iniciação Cristã", "Status"],
    ];

    const tableBody = sacramentosFiltrados.map((sac) => {
      const iniciacaoCompleta = sac.batismo && sac.primeiraEucaristia && sac.crisma;
      return [
        sac.nomeCompleto + (sac.apelido ? ` (${sac.apelido})` : ""),
        sac.telefone,
        sac.sexo === "FEMININO" ? "F" : "M",
        sac.batismo ? "Sim" : "Pendente",
        sac.primeiraEucaristia ? "Sim" : "Pendente",
        sac.crisma ? "Sim" : "Pendente",
        iniciacaoCompleta ? "Completa" : "Em curso",
        sac.statusCalculado,
      ];
    });

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [255, 251, 235] },
    });

    doc.save(`relatorio-sacramentos-jusc-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // PDF 4: Responsáveis Legais
  function exportarResponsaveisPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataHoraEmissao = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text("JUSC — Relatório de Responsáveis Legais", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHoraEmissao} | Total listado: ${responsaveisFiltrados.length} responsáveis`,
      14,
      21
    );

    const tableHead = [
      ["Nome do Responsável", "Telefone Responsável", "Jovem Vinculado", "Sexo Jovem", "Telefone Jovem", "Status"],
    ];

    const tableBody = responsaveisFiltrados.map((r) => [
      r.nomeResponsavel,
      r.telefoneResponsavel,
      r.integranteNome + (r.integranteApelido ? ` (${r.integranteApelido})` : ""),
      r.integranteSexo === "FEMININO" ? "Feminino" : "Masculino",
      r.integranteTelefone,
      r.integranteStatus,
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [255, 199, 44], textColor: [20, 20, 20], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    doc.save(`relatorio-responsaveis-jusc-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // PDF 5: Ausências Prolongadas
  function exportarAusentesPDF() {
    const ausentes = integrantes.filter(
      (i) =>
        (filtroSexo === "TODOS" || (i.sexo || "MASCULINO") === filtroSexo) &&
        (i.temAlertaAusencia || i.statusCalculado === "INATIVO")
    );

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataHoraEmissao = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text("JUSC — Relatório de Ausências Prolongadas", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHoraEmissao} | Regra: Alerta > ${limiteAlerta} meses | Total: ${ausentes.length} integrantes`,
      14,
      21
    );

    const tableHead = [
      ["Integrante", "Telefone", "Sexo", "Situação", "Meses Ausente", "Última Presença", "Responsável", "Tel. Resp."],
    ];

    const tableBody = ausentes.map((i) => [
      i.nomeCompleto + (i.apelido ? ` (${i.apelido})` : ""),
      i.telefone,
      i.sexo === "FEMININO" ? "F" : "M",
      i.temAlertaAusencia ? `Alerta (>${limiteAlerta}m)` : "Inativo",
      `${i.mesesSemPresenca} meses`,
      i.ultimaPresencaData ? formatarData(i.ultimaPresencaData) : "Sem registro",
      i.nomeResponsavel || "-",
      i.telefoneResponsavel || "-",
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [245, 158, 11], textColor: [20, 20, 20], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [254, 243, 199] },
    });

    doc.save(`relatorio-ausencias-jusc-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // PDF 6: Frequência Individual
  function exportarIndividualPDF() {
    if (!integranteSel) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataHoraEmissao = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text(`JUSC — Ficha de Frequência: ${integranteSel.nomeCompleto}`, 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHoraEmissao} | Telefone: ${integranteSel.telefone} | Status: ${integranteSel.statusCalculado} | Aproveitamento: ${percIndividual}%`,
      14,
      21
    );

    const tableHead = [["Data do Encontro", "Tema do Encontro", "Presença"]];

    const tableBody = presencasIndividual.map((p) => [
      new Date(p.data).toLocaleDateString("pt-BR"),
      p.tema,
      p.presente ? "Presente" : "Ausente",
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 25,
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [255, 199, 44], textColor: [20, 20, 20], fontStyle: "bold" },
    });

    doc.save(`frequencia-${integranteSel.nomeCompleto.replace(/\s+/g, "_")}.pdf`);
  }
  const integranteSel = integrantes.find((i) => i.id === integranteSelecionadoId);
  const encontrosParaFrequencia = encontros.slice(0, qtdEncontrosFrequencia);
  const presencasIndividual = encontrosParaFrequencia.map((e) => {
    const p = e.presencas.find((pr: any) => pr.integranteId === integranteSelecionadoId);
    return {
      encontroId: e.id,
      data: e.dataHora,
      tema: e.tema || "Encontro Ordinário",
      presente: Boolean(p?.presente),
    };
  });
  const presencasTotalIndividual = presencasIndividual.filter((p) => p.presente).length;
  const percIndividual =
    encontrosParaFrequencia.length > 0
      ? Math.round((presencasTotalIndividual / encontrosParaFrequencia.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#FFC72C]" />
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
              Relatórios e Frequência Pastoral
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Assiduidade cruzada, filtros pastorais, alertas de ausência e contatos de responsáveis
          </p>
        </div>

        {/* 6 Abas Modernas */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-200/70 dark:bg-[#15171e] p-1 rounded-2xl border border-neutral-300/60 dark:border-neutral-800 print:hidden">
          <button
            onClick={() => setAba("MATRIZ")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              aba === "MATRIZ"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Matriz de Presenças
          </button>
          <button
            onClick={() => setAba("SAUDE")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              aba === "SAUDE"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            Saúde & Alergias
          </button>
          <button
            onClick={() => setAba("SACRAMENTOS")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              aba === "SACRAMENTOS"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Church className="w-3.5 h-3.5 text-amber-500" />
            Sacramentos
          </button>
          <button
            onClick={() => setAba("RESPONSAVEIS")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              aba === "RESPONSAVEIS"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Responsáveis
          </button>
          <button
            onClick={() => setAba("INDIVIDUAL")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              aba === "INDIVIDUAL"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Frequência Individual
          </button>
          <button
            onClick={() => setAba("AUSENCIA")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              aba === "AUSENCIA"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Alertas de Ausência
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="p-12 text-center bg-white dark:bg-[#15171e] rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Compilando dados pastorais...</p>
        </div>
      ) : aba === "MATRIZ" ? (
        /* Aba 1: Matriz de Presenças com Filtros Avançados */
        <div className="space-y-4">
          {/* Caixa de Filtros Avançados */}
          <div className="bg-white dark:bg-[#15171e] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3 print:hidden">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFC72C]">
              <Filter className="w-4 h-4" />
              <span>Filtros do Relatório de Presenças</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Filtro 1: Período / Encontros */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Encontros Avaliados
                </label>
                <select
                  value={filtroPeriodoEncontros}
                  onChange={(e) => setFiltroPeriodoEncontros(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value="5">Últimos 5 encontros</option>
                  <option value="10">Últimos 10 encontros (padrão)</option>
                  <option value="20">Últimos 20 encontros</option>
                  <option value="ESTE_ANO">Todos os encontros deste ano ({new Date().getFullYear()})</option>
                  <option value="GERAL">Presença Geral (histórico completo)</option>
                </select>
              </div>

              {/* Filtro 2: Integrantes */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Público de Integrantes
                </label>
                <select
                  value={filtroMembros}
                  onChange={(e) => setFiltroMembros(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value="TODOS">Todos os integrantes</option>
                  <option value="ATIVOS">Apenas Integrantes Ativos</option>
                  <option value="NOVOS_30">Novos integrantes (últimos 30 dias)</option>
                  <option value="NOVOS_90">Novos integrantes (últimos 3 meses)</option>
                  <option value="NOVOS_180">Novos integrantes (últimos 6 meses)</option>
                  <option value="NOVOS_365">Novos integrantes (último 1 ano)</option>
                  <option value="INATIVOS_30">Inativos recentes (últimos 30 dias)</option>
                  <option value="INATIVOS_90">Inativos (últimos 3 meses)</option>
                  <option value="INATIVOS_180">Inativos (últimos 6 meses)</option>
                  <option value="INATIVOS_365">Inativos (último 1 ano)</option>
                  <option value="QUALQUER_RESTRICAO">⚠️ Com Restrição Alimentar (qualquer)</option>
                  <option value="COM_ALERGIA">Com Alergia</option>
                  <option value="INTOLERANCIA_GLUTEN">Intolerância a Glúten</option>
                  <option value="INTOLERANCIA_LACTOSE">Intolerância a Lactose</option>
                </select>
              </div>

              {/* Filtro Sexo */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Sexo
                </label>
                <select
                  value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value="TODOS">Todos os sexos</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>

              {/* Filtro 3: Busca Textual */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Buscar Integrante ou Telefone
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, apelido, telefone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-neutral-500">
              <span>
                Exibindo <strong>{integrantesFiltrados.length}</strong> integrantes em{" "}
                <strong>{encontrosFiltrados.length}</strong> encontros avaliados.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportarMatrizPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 text-xs font-bold shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-neutral-950" />
                  Exportar PDF
                </button>
                <button
                  onClick={exportarMatrizCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Exportar CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  Imprimir Matriz
                </button>
              </div>
            </div>
          </div>

          {/* Tabela da Matriz */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 print:p-0 print:border-none print:shadow-none">
            <div className="hidden print:block mb-3">
              <h2 className="text-base font-black text-black">JUSC — Matriz de Presenças Pastoral</h2>
              <p className="text-[10px] text-neutral-600">
                Data de Emissão: {new Date().toLocaleDateString("pt-BR")} | Período: {filtroPeriodoEncontros} encontros | Integrantes listados: {integrantesFiltrados.length}
              </p>
            </div>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left text-xs border-collapse print:text-[10px]">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300 min-w-[200px]">
                      Integrante
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 min-w-[130px]">
                      Telefone
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 min-w-[50px] text-center">
                      Sexo
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 min-w-[70px]">
                      Status
                    </th>
                    {encontrosFiltrados.map((e) => (
                      <th
                        key={e.id}
                        className="py-3 px-2 text-center font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap"
                        title={e.tema || "Encontro"}
                      >
                        {new Date(e.dataHora).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-right font-extrabold text-neutral-700 dark:text-neutral-300 min-w-[90px]">
                      Frequência
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {integrantesFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5 + encontrosFiltrados.length}
                        className="py-8 text-center text-xs text-neutral-500"
                      >
                        Nenhum integrante encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    integrantesFiltrados.map((int) => {
                      const totalEnc = encontrosFiltrados.length;
                      let presencasCount = 0;

                      return (
                        <tr
                          key={int.id}
                          className="hover:bg-neutral-50 dark:hover:bg-[#1a1d26] transition-colors"
                        >
                          <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Link
                                href={`/dashboard/integrantes/${int.id}`}
                                className="hover:underline hover:text-[#FFC72C]"
                              >
                                {int.nomeCompleto}
                              </Link>
                              {int.apelido && (
                                <span className="text-[11px] text-neutral-400 font-normal">
                                  ({int.apelido})
                                </span>
                              )}
                              {int.possuiAlergia && (
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 cursor-help"
                                  title={`Alergia: ${int.descricaoAlergia || "Informada"}`}
                                >
                                  Alergia
                                </span>
                              )}
                              {int.intoleranciaGluten && (
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                  title="Intolerante a Glúten / Celíaco"
                                >
                                  S/Glúten
                                </span>
                              )}
                              {int.intoleranciaLactose && (
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                  title="Intolerante a Lactose"
                                >
                                  S/Lactose
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                            {int.telefone}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                int.sexo === "FEMININO"
                                  ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              }`}
                            >
                              {int.sexo === "FEMININO" ? "F" : "M"}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            {int.temAlertaAusencia ? (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                Alerta
                              </span>
                            ) : int.statusCalculado === "ATIVO" ? (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                Ativo
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                Inativo
                              </span>
                            )}
                          </td>
                          {encontrosFiltrados.map((e) => {
                            const p = e.presencas?.find(
                              (pr: any) => pr.integranteId === int.id
                            ) || int.presencas?.find((pr: any) => pr.encontroId === e.id);

                            if (p?.presente) presencasCount++;

                            return (
                              <td key={e.id} className="py-2.5 px-2 text-center">
                                {p?.presente ? (
                                  <span
                                    className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"
                                    title="Presente"
                                  />
                                ) : (
                                  <span
                                    className="inline-block w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"
                                    title="Ausente"
                                  />
                                )}
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-3 text-right font-black text-neutral-900 dark:text-white">
                            {totalEnc > 0
                              ? Math.round((presencasCount / totalEnc) * 100)
                              : 0}
                            %
                            <span className="text-[10px] text-neutral-400 font-normal ml-1">
                              ({presencasCount}/{totalEnc})
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : aba === "SAUDE" ? (
        /* Aba: Relatório Pastoral de Saúde e Restrições Alimentares */
        <div className="space-y-4">
          {/* Painel de Filtros e Busca de Saúde */}
          <div className="bg-white dark:bg-[#15171e] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-500">
              <HeartPulse className="w-4 h-4" />
              <span>Filtros do Relatório de Saúde & Restrições Alimentares</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Filtrar por Tipo de Restrição
                </label>
                <select
                  value={filtroSaude}
                  onChange={(e) => setFiltroSaude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value="TODAS_RESTRICOES">Qualquer Restrição (Alergias ou Intolerâncias)</option>
                  <option value="COM_ALERGIA">Apenas com Alergias</option>
                  <option value="INTOLERANCIA_GLUTEN">Apenas Intolerância a Glúten / Celíacos</option>
                  <option value="INTOLERANCIA_LACTOSE">Apenas Intolerância a Lactose</option>
                  <option value="TODOS_INTEGRANTES">Todos os Integrantes do Grupo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Filtrar por Sexo
                </label>
                <select
                  value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value="TODOS">Todos os sexos</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Buscar Jovem, Telefone ou Alergia
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, telefone, amendoim, dipirona..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-neutral-500">
              <span>
                Total listado: <strong>{saudeFiltrados.length}</strong> jovens com os filtros atuais.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportarSaudePDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  Exportar PDF
                </button>
                <button
                  onClick={exportarSaudeCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Cards Rápidos de Totais de Saúde */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Com Alergias</p>
                <p className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-0.5">
                  {integrantes.filter((i) => i.possuiAlergia).length}
                </p>
              </div>
              <HeartPulse className="w-8 h-8 text-rose-500/40" />
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Intolerantes a Glúten</p>
                <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-0.5">
                  {integrantes.filter((i) => i.intoleranciaGluten).length}
                </p>
              </div>
              <Utensils className="w-8 h-8 text-amber-500/40" />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Intolerantes a Lactose</p>
                <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-0.5">
                  {integrantes.filter((i) => i.intoleranciaLactose).length}
                </p>
              </div>
              <Utensils className="w-8 h-8 text-blue-500/40" />
            </div>
          </div>

          {/* Tabela do Relatório de Saúde */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                      Integrante
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      Sexo
                    </th>
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                      Telefone
                    </th>
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                      Alergias Identificadas
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      Sem Glúten
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      Sem Lactose
                    </th>
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                      Responsável / Contato
                    </th>
                    <th className="py-3 px-3 text-right font-extrabold text-neutral-700 dark:text-neutral-300">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {saudeFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-neutral-500">
                        Nenhum integrante com restrições alimentares encontrado para o filtro selecionado.
                      </td>
                    </tr>
                  ) : (
                    saudeFiltrados.map((s) => {
                      const linkWhatsapp = `https://api.whatsapp.com/send?phone=${s.telefone.replace(
                        /\D/g,
                        ""
                      )}`;

                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-neutral-50 dark:hover:bg-[#1a1d26] transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white">
                            <Link
                              href={`/dashboard/integrantes/${s.id}`}
                              className="hover:underline hover:text-[#FFC72C] flex items-center gap-1.5"
                            >
                              {s.nomeCompleto}
                              {s.apelido && (
                                <span className="text-[11px] text-neutral-400 font-normal">
                                  ({s.apelido})
                                </span>
                              )}
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                s.sexo === "FEMININO"
                                  ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              }`}
                            >
                              {s.sexo === "FEMININO" ? "F" : "M"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-300">
                            {s.telefone}
                          </td>
                          <td className="py-3 px-3">
                            {s.possuiAlergia ? (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
                                  Sim
                                </span>
                                <p className="text-[11px] text-rose-900 dark:text-rose-200 font-semibold mt-1">
                                  {s.descricaoAlergia || "Alergia informada"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-neutral-400">Nenhuma</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {s.intoleranciaGluten ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold text-[10px]">
                                <Check className="w-3 h-3" /> Sim
                              </span>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {s.intoleranciaLactose ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold text-[10px]">
                                <Check className="w-3 h-3" /> Sim
                              </span>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                            {s.nomeResponsavel ? (
                              <div>
                                <p className="font-semibold">{s.nomeResponsavel}</p>
                                <p className="font-mono text-[11px] text-neutral-400">
                                  {s.telefoneResponsavel}
                                </p>
                              </div>
                            ) : (
                              <span className="text-neutral-400">Não informado</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <a
                              href={linkWhatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition-all"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : aba === "SACRAMENTOS" ? (
        /* Aba: Relatório Pastoral de Sacramentos e Iniciação Cristã */
        <div className="space-y-4">
          {/* Painel de Filtros e Busca de Sacramentos */}
          <div className="bg-white dark:bg-[#15171e] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFC72C]">
              <Church className="w-4 h-4" />
              <span>Filtros do Relatório de Sacramentos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Filtrar por Sacramento / Situação
                </label>
                <select
                  value={filtroSacramentoRelatorio}
                  onChange={(e) => setFiltroSacramentoRelatorio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value="TODOS">Todos os Integrantes</option>
                  <option value="TODOS_INICIADOS">✨ Iniciação Cristã Completa (Batismo + Eucaristia + Crisma)</option>
                  <option value="SEM_CRISMA">⚠️ Pendente de Crisma</option>
                  <option value="SEM_EUCARISTIA">⚠️ Pendente de 1ª Eucaristia</option>
                  <option value="SEM_BATISMO">⚠️ Não Batizados</option>
                  <option value="COM_BATISMO">Com Batismo Realizado</option>
                  <option value="COM_EUCARISTIA">Com 1ª Eucaristia Realizada</option>
                  <option value="COM_CRISMA">Com Crisma Realizado</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Filtrar por Sexo
                </label>
                <select
                  value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value="TODOS">Todos os sexos</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Buscar Jovem ou Telefone
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, apelido, telefone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-neutral-500">
              <span>
                Total listado: <strong>{sacramentosFiltrados.length}</strong> integrantes.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportarSacramentosPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900 font-bold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Exportar PDF
                </button>
                <button
                  onClick={exportarSacramentosCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFC72C]" />
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Cards Rápidos de Estatísticas Sacramentais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Batizados</span>
              <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">
                {integrantes.filter((i) => i.batismo).length}
                <span className="text-xs text-neutral-400 font-normal ml-1">
                  ({integrantes.length > 0 ? Math.round((integrantes.filter((i) => i.batismo).length / integrantes.length) * 100) : 0}%)
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">1ª Eucaristia</span>
              <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">
                {integrantes.filter((i) => i.primeiraEucaristia).length}
                <span className="text-xs text-neutral-400 font-normal ml-1">
                  ({integrantes.length > 0 ? Math.round((integrantes.filter((i) => i.primeiraEucaristia).length / integrantes.length) * 100) : 0}%)
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Crismados</span>
              <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">
                {integrantes.filter((i) => i.crisma).length}
                <span className="text-xs text-neutral-400 font-normal ml-1">
                  ({integrantes.length > 0 ? Math.round((integrantes.filter((i) => i.crisma).length / integrantes.length) * 100) : 0}%)
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Iniciação Completa
              </span>
              <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                {integrantes.filter((i) => i.batismo && i.primeiraEucaristia && i.crisma).length}
                <span className="text-xs text-neutral-400 font-normal ml-1">
                  ({integrantes.length > 0 ? Math.round((integrantes.filter((i) => i.batismo && i.primeiraEucaristia && i.crisma).length / integrantes.length) * 100) : 0}%)
                </span>
              </p>
            </div>
          </div>

          {/* Tabela de Integrantes e Sacramentos */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                      Integrante
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      Sexo
                    </th>
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                      Telefone
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      Batismo
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      1ª Eucaristia
                    </th>
                    <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      Crisma
                    </th>
                    <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                      Status da Iniciação
                    </th>
                    <th className="py-3 px-3 text-right font-extrabold text-neutral-700 dark:text-neutral-300">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {sacramentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-neutral-500">
                        Nenhum integrante encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    sacramentosFiltrados.map((sac) => {
                      const iniciacaoCompleta = sac.batismo && sac.primeiraEucaristia && sac.crisma;
                      const linkWhatsapp = `https://api.whatsapp.com/send?phone=${sac.telefone.replace(
                        /\D/g,
                        ""
                      )}`;

                      return (
                        <tr
                          key={sac.id}
                          className="hover:bg-neutral-50 dark:hover:bg-[#1a1d26] transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white">
                            <Link
                              href={`/dashboard/integrantes/${sac.id}`}
                              className="hover:underline hover:text-[#FFC72C] flex items-center gap-1.5"
                            >
                              {sac.nomeCompleto}
                              {sac.apelido && (
                                <span className="text-[11px] text-neutral-400 font-normal">
                                  ({sac.apelido})
                                </span>
                              )}
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                sac.sexo === "FEMININO"
                                  ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              }`}
                            >
                              {sac.sexo === "FEMININO" ? "F" : "M"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-300">
                            {sac.telefone}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {sac.batismo ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                <Check className="w-3 h-3" /> Sim
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold text-[10px]">
                                <X className="w-3 h-3" /> Não
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {sac.primeiraEucaristia ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                <Check className="w-3 h-3" /> Sim
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold text-[10px]">
                                <X className="w-3 h-3" /> Não
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {sac.crisma ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                <Check className="w-3 h-3" /> Sim
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                                <X className="w-3 h-3" /> Pendente
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {iniciacaoCompleta ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">
                                <Sparkles className="w-3 h-3" /> Completa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                                Incompleta
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <a
                              href={linkWhatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition-all"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : aba === "RESPONSAVEIS" ? (
        /* Aba 2: Relatório de Responsáveis com Telefones e Jovens Vinculados */
        <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#FFC72C]" />
                Relatório de Responsáveis Legais
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Relação consolidada dos pais/responsáveis cadastrados, seus contatos e jovens vinculados
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportarResponsaveisPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900 text-xs font-bold transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                Exportar PDF
              </button>
              <button
                onClick={exportarResponsaveisCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Barra de busca e filtro de sexo de responsáveis */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por responsável, jovem ou telefone..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>
            <div className="w-full sm:w-56">
              <select
                value={filtroSexo}
                onChange={(e) => setFiltroSexo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              >
                <option value="TODOS">Todos os Jovens</option>
                <option value="MASCULINO">Jovens Masculino</option>
                <option value="FEMININO">Jovens Feminino</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                    Nome do Responsável
                  </th>
                  <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                    Telefone do Responsável
                  </th>
                  <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                    Jovem Vinculado
                  </th>
                  <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                    Sexo
                  </th>
                  <th className="py-3 px-3 font-extrabold text-neutral-700 dark:text-neutral-300">
                    Telefone do Jovem
                  </th>
                  <th className="py-3 px-2 font-extrabold text-neutral-700 dark:text-neutral-300 text-center">
                    Status do Jovem
                  </th>
                  <th className="py-3 px-3 text-right font-extrabold text-neutral-700 dark:text-neutral-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {responsaveisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-neutral-500">
                      Nenhum responsável encontrado.
                    </td>
                  </tr>
                ) : (
                  responsaveisFiltrados.map((r) => {
                    const linkWhatsappResp = `https://api.whatsapp.com/send?phone=${r.telefoneResponsavel.replace(
                      /\D/g,
                      ""
                    )}&text=${encodeURIComponent(
                      `Olá ${r.nomeResponsavel}! Somos da coordenação do grupo de jovens JUSC — Paróquia Menino Jesus.`
                    )}`;

                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-neutral-50 dark:hover:bg-[#1a1d26] transition-colors"
                      >
                        <td className="py-3 px-3 font-bold text-neutral-900 dark:text-white">
                          {r.nomeResponsavel}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-700 dark:text-neutral-300">
                          {r.telefoneResponsavel}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                          <Link
                            href={`/dashboard/integrantes/${r.integranteId}`}
                            className="hover:underline hover:text-[#FFC72C]"
                          >
                            {r.integranteNome}
                          </Link>
                          {r.integranteApelido && (
                            <span className="text-[11px] text-neutral-400 ml-1">
                              ({r.integranteApelido})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              r.integranteSexo === "FEMININO"
                                ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                                : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            }`}
                          >
                            {r.integranteSexo === "FEMININO" ? "F" : "M"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-400">
                          {r.integranteTelefone}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {r.integranteStatus === "ATIVO" ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              Ativo
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={linkWhatsappResp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition-all"
                            title="Conversar no WhatsApp com o Responsável"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : aba === "INDIVIDUAL" ? (
        /* Aba 3: Frequência Individual */
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Selecione o Integrante
                </label>
                <select
                  value={integranteSelecionadoId}
                  onChange={(e) => setIntegranteSelecionadoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  {integrantes.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nomeCompleto} {i.apelido ? `(${i.apelido})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Considerar os últimos X encontros
                </label>
                <select
                  value={qtdEncontrosFrequencia}
                  onChange={(e) => setQtdEncontrosFrequencia(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                >
                  <option value={5}>Últimos 5 encontros</option>
                  <option value={10}>Últimos 10 encontros (padrão)</option>
                  <option value={20}>Últimos 20 encontros</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-neutral-500">
                Acompanhamento detalhado da participação pessoal nos últimos encontros.
              </span>
              <button
                onClick={exportarIndividualPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 text-xs font-bold shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-950" />
                Exportar Frequência (PDF)
              </button>
            </div>

            {integranteSel && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                    Aproveitamento
                  </span>
                  <div className="text-3xl font-black text-amber-900 dark:text-amber-200 mt-1">
                    {percIndividual}%
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {presencasTotalIndividual} de {encontrosParaFrequencia.length} encontros
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-neutral-500">
                    Telefone do Jovem
                  </span>
                  <p className="font-bold text-sm text-neutral-900 dark:text-white mt-1">
                    {integranteSel.telefone}
                  </p>
                  <span className="text-xs text-neutral-500">
                    Responsável: {integranteSel.nomeResponsavel} ({integranteSel.telefoneResponsavel})
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-black uppercase text-neutral-500">
                    Status Pastoral
                  </span>
                  <p className="font-bold text-sm text-neutral-900 dark:text-white mt-1">
                    {integranteSel.statusCalculado === "ATIVO" ? "Ativo no grupo" : "Inativo"}
                  </p>
                  <span className="text-xs text-neutral-500">
                    {integranteSel.temAlertaAusencia
                      ? `Aviso: ausente há ${integranteSel.mesesSemPresenca} meses`
                      : "Frequência em dia"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Histórico dos Encontros Avaliados */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Histórico nos {encontrosParaFrequencia.length} encontros analisados
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {presencasIndividual.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {item.tema}
                    </span>
                    <span className="text-neutral-500 ml-2">
                      ({new Date(item.data).toLocaleDateString("pt-BR")})
                    </span>
                  </div>
                  <div>
                    {item.presente ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                        Presente
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold text-[11px]">
                        Ausente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Aba 4: Alertas de Ausência Prolongada */
        <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Integrantes com Ausência Prolongada
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Regra 9.1: &gt; {limiteAlerta} meses sem presença gera alerta pastoral; &gt; {limiteInativo} meses inativa automaticamente.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportarAusentesPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900 text-xs font-bold transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                Exportar PDF
              </button>
              <button
                onClick={exportarAusentesCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-neutral-500">
              Jovens que necessitam de acompanhamento ou contato pastoral fraterno
            </span>
            <div className="w-full sm:w-56">
              <select
                value={filtroSexo}
                onChange={(e) => setFiltroSexo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              >
                <option value="TODOS">Todos os sexos</option>
                <option value="MASCULINO">Apenas Masculino</option>
                <option value="FEMININO">Apenas Feminino</option>
              </select>
            </div>
          </div>

          {integrantes.filter((i) => i.temAlertaAusencia && (filtroSexo === "TODOS" || (i.sexo || "MASCULINO") === filtroSexo)).length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Nenhum integrante com alerta de ausência no momento. A assiduidade está ótima!
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {integrantes
                .filter((i) => i.temAlertaAusencia && (filtroSexo === "TODOS" || (i.sexo || "MASCULINO") === filtroSexo))
                .map((int) => {
                  const linkWhatsapp = `https://api.whatsapp.com/send?phone=${int.telefone.replace(
                    /\D/g,
                    ""
                  )}&text=${encodeURIComponent(
                    `Olá ${int.apelido || int.nomeCompleto}! 💛 Sentimos sua falta nos encontros do JUSC! Está tudo bem com você? O grupo está de portas abertas!`
                  )}`;

                  return (
                    <div
                      key={int.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-neutral-900 dark:text-white">
                            {int.nomeCompleto}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                            {int.mesesSemPresenca} meses sem vir
                          </span>
                        </div>
                        <p className="text-neutral-500 mt-1">
                          Telefone do Jovem: <strong>{int.telefone}</strong>
                        </p>
                        <p className="text-neutral-500 mt-0.5">
                          Última presença em:{" "}
                          <strong>
                            {int.ultimaPresencaData
                              ? formatarData(int.ultimaPresencaData)
                              : "Nunca participou de um encontro"}
                          </strong>
                        </p>
                        <p className="text-neutral-400 mt-0.5">
                          Responsável: {int.nomeResponsavel} ({int.telefoneResponsavel})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={linkWhatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Mandar Mensagem
                        </a>
                        <Link
                          href={`/dashboard/integrantes/${int.id}`}
                          className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-200"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
