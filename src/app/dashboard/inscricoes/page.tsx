"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  Filter,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Trash2,
  X,
  FileSpreadsheet,
  Download,
  Edit3,
  PlusCircle,
  User,
  Heart,
  ShieldCheck,
  Phone,
  Eye,
  Calendar,
  Sparkles,
  RotateCcw,
  Shirt,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { formatarData, formatarTelefone, formatarCpf } from "@/lib/utils";
import { calcularIdade } from "@/lib/rules";
import { InputDataBr } from "@/components/ui/input-data-br";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CampanhaItem {
  id: string;
  titulo: string;
  requerPagamento: boolean;
  valor: number;
  fotoUrl?: string | null;
  dataLimite: string;
  linkGrupoWhatsapp?: string | null;
  campoNomeCompleto?: boolean;
  campoCpf?: boolean;
  campoTelefone?: boolean;
  campoDataNascimento?: boolean;
  campoNomeResponsavel?: boolean;
  campoParentescoResponsavel?: boolean;
  campoTelefoneResponsavel?: boolean;
  campoAlergia?: boolean;
  campoIntolerancia?: boolean;
  campoRemedioContinuo?: boolean;
  campoSexo?: boolean;
  campoBatismo?: boolean;
  campoPrimeiraEucaristia?: boolean;
  campoCrisma?: boolean;
  permiteCamiseta?: boolean;
  campanhaCamisetaId?: string | null;
}

interface InscricaoItem {
  id: string;
  campanhaId: string;
  codigoInscricao: string;
  nomeCompleto: string;
  cpf?: string | null;
  telefone: string;
  dataNascimento?: string | null;
  sexo?: string | null;
  nomeResponsavel?: string | null;
  parentescoResponsavel?: string | null;
  telefoneResponsavel?: string | null;
  possuiAlergia: boolean;
  descricaoAlergia?: string | null;
  intoleranciaGluten: boolean;
  intoleranciaLactose: boolean;
  usaRemedioContinuo?: boolean;
  descricaoRemedioContinuo?: string | null;
  batismo: boolean;
  primeiraEucaristia: boolean;
  crisma: boolean;
  entrouNoGrupoWhatsapp?: boolean;
  clicouGrupoEm?: string | null;
  pediuCamiseta?: boolean;
  camisetaModelo?: string | null;
  camisetaTamanho?: string | null;
  camisetaNomePersonalizado?: string | null;
  camisetaNumeroPersonalizado?: string | null;
  camisetaValor?: number;
  formaPagamento?: string | null;
  tipoQuitacao?: string | null;
  valorTotal: number;
  valorPago: number;
  statusPagamento: string;
  status: string;
  observacao?: string | null;
  criadoEm: string;
  campanha: CampanhaItem;
}

export default function InscricoesPage() {
  const [inscricoes, setInscricoes] = useState<InscricaoItem[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaItem[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // Filtros Básicos
  const [busca, setBusca] = useState("");
  const [filtroCampanha, setFiltroCampanha] = useState("TODAS");
  const [filtroStatusPag, setFiltroStatusPag] = useState("TODOS");

  // Filtros Avançados
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);
  const [filtroSexo, setFiltroSexo] = useState("TODOS");
  const [filtroFaixaEtaria, setFiltroFaixaEtaria] = useState("TODOS"); // "TODOS" | "MENOR" | "MAIOR"
  const [filtroAlergia, setFiltroAlergia] = useState("TODOS"); // "TODOS" | "SIM" | "NAO"
  const [filtroIntolerancia, setFiltroIntolerancia] = useState("TODOS"); // "TODOS" | "GLUTEN" | "LACTOSE" | "QUALQUER" | "NENHUMA"
  const [filtroRemedio, setFiltroRemedio] = useState("TODOS"); // "TODOS" | "SIM" | "NAO"
  const [filtroSacramento, setFiltroSacramento] = useState("TODOS"); // "TODOS" | "FALTA_BATISMO" | "FALTA_EUCARISTIA" | "FALTA_CRISMA" | "TODOS_CONCLUIDOS"
  const [filtroGrupoWhatsapp, setFiltroGrupoWhatsapp] = useState("TODOS"); // "TODOS" | "NO_GRUPO" | "FORA_DO_GRUPO"

  // Modal de Exportar Telefones
  const [modalExportarTelefones, setModalExportarTelefones] = useState(false);
  const [abaTelefone, setAbaTelefone] = useState<"INSCRITOS" | "RESPONSAVEIS" | "MENORES">("INSCRITOS");
  const [apenasDigitosTelefone, setApenasDigitosTelefone] = useState(false);
  const [copiadoTelefones, setCopiadoTelefones] = useState(false);

  // Modais de Ação
  const [inscricaoDetalhes, setInscricaoDetalhes] = useState<InscricaoItem | null>(null);
  const [inscricaoEditando, setInscricaoEditando] = useState<InscricaoItem | null>(null);
  const [inscricaoBaixa, setInscricaoBaixa] = useState<InscricaoItem | null>(null);
  const [modalNovaInscricao, setModalNovaInscricao] = useState(false);

  // Estados de Processamento
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [processandoGrupoId, setProcessandoGrupoId] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const isSuperAdmin = usuarioLogado?.perfil === "ADMIN";

  async function handleToggleGrupoWhatsapp(inscricao: InscricaoItem) {
    const novoStatus = !inscricao.entrouNoGrupoWhatsapp;
    setProcessandoGrupoId(inscricao.id);

    // Atualização otimista
    setInscricoes((prev) =>
      prev.map((item) =>
        item.id === inscricao.id ? { ...item, entrouNoGrupoWhatsapp: novoStatus } : item
      )
    );
    if (inscricaoDetalhes?.id === inscricao.id) {
      setInscricaoDetalhes((prev) => (prev ? { ...prev, entrouNoGrupoWhatsapp: novoStatus } : null));
    }

    try {
      const res = await fetch(`/api/inscricoes/${inscricao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entrouNoGrupoWhatsapp: novoStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Reverter em caso de erro
        setInscricoes((prev) =>
          prev.map((item) =>
            item.id === inscricao.id ? { ...item, entrouNoGrupoWhatsapp: inscricao.entrouNoGrupoWhatsapp } : item
          )
        );
        if (inscricaoDetalhes?.id === inscricao.id) {
          setInscricaoDetalhes((prev) => (prev ? { ...prev, entrouNoGrupoWhatsapp: inscricao.entrouNoGrupoWhatsapp } : null));
        }
        alert(data.error || "Erro ao atualizar status do grupo WhatsApp.");
        return;
      }

      const data = await res.json();
      setInscricoes((prev) =>
        prev.map((item) => (item.id === inscricao.id ? data.inscricao : item))
      );
      if (inscricaoDetalhes?.id === inscricao.id) {
        setInscricaoDetalhes(data.inscricao);
      }
    } catch {
      setInscricoes((prev) =>
        prev.map((item) =>
          item.id === inscricao.id ? { ...item, entrouNoGrupoWhatsapp: inscricao.entrouNoGrupoWhatsapp } : item
        )
      );
      if (inscricaoDetalhes?.id === inscricao.id) {
        setInscricaoDetalhes((prev) => (prev ? { ...prev, entrouNoGrupoWhatsapp: inscricao.entrouNoGrupoWhatsapp } : null));
      }
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setProcessandoGrupoId(null);
    }
  }

  async function carregarDados() {
    setCarregando(true);
    try {
      const [resIns, resCamp, resMe] = await Promise.all([
        fetch("/api/inscricoes"),
        fetch("/api/campanhas-inscricao?todas=true"),
        fetch("/api/auth/me"),
      ]);

      if (resIns.ok) {
        const dataIns = await resIns.json();
        setInscricoes(dataIns.inscricoes || []);
      }
      if (resCamp.ok) {
        const dataCamp = await resCamp.json();
        setCampanhas(dataCamp.campanhas || []);
      }
      if (resMe.ok) {
        const dataMe = await resMe.json();
        setUsuarioLogado(dataMe.usuario);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // Filtragem dos inscritos
  const inscricoesFiltradas = useMemo(() => {
    return inscricoes.filter((i) => {
      if (filtroCampanha !== "TODAS" && i.campanhaId !== filtroCampanha) {
        return false;
      }
      if (filtroStatusPag !== "TODOS" && i.statusPagamento !== filtroStatusPag) {
        return false;
      }

      // Filtro Sexo
      if (filtroSexo !== "TODOS" && i.sexo !== filtroSexo) {
        return false;
      }

      // Filtro Faixa Etária / Idade
      if (filtroFaixaEtaria !== "TODOS") {
        const idade = i.dataNascimento ? calcularIdade(i.dataNascimento) : null;
        if (filtroFaixaEtaria === "MENOR" && (idade === null || idade >= 18)) return false;
        if (filtroFaixaEtaria === "MAIOR" && (idade === null || idade < 18)) return false;
      }

      // Filtro Alergia
      if (filtroAlergia === "SIM" && !i.possuiAlergia) return false;
      if (filtroAlergia === "NAO" && i.possuiAlergia) return false;

      // Filtro Intolerância
      if (filtroIntolerancia === "GLUTEN" && !i.intoleranciaGluten) return false;
      if (filtroIntolerancia === "LACTOSE" && !i.intoleranciaLactose) return false;
      if (filtroIntolerancia === "QUALQUER" && !i.intoleranciaGluten && !i.intoleranciaLactose) return false;
      if (filtroIntolerancia === "NENHUMA" && (i.intoleranciaGluten || i.intoleranciaLactose)) return false;

      // Filtro Remédio Contínuo
      if (filtroRemedio === "SIM" && !i.usaRemedioContinuo) return false;
      if (filtroRemedio === "NAO" && i.usaRemedioContinuo) return false;

      // Filtro Sacramentos
      if (filtroSacramento === "FALTA_BATISMO" && i.batismo) return false;
      if (filtroSacramento === "FALTA_EUCARISTIA" && i.primeiraEucaristia) return false;
      if (filtroSacramento === "FALTA_CRISMA" && i.crisma) return false;
      if (filtroSacramento === "TODOS_CONCLUIDOS" && (!i.batismo || !i.primeiraEucaristia || !i.crisma)) return false;

      // Filtro Grupo de WhatsApp
      if (filtroGrupoWhatsapp === "NO_GRUPO" && !i.entrouNoGrupoWhatsapp) return false;
      if (filtroGrupoWhatsapp === "FORA_DO_GRUPO" && i.entrouNoGrupoWhatsapp) return false;

      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const codMatch = i.codigoInscricao.toLowerCase().includes(termo);
        const nomeMatch = i.nomeCompleto.toLowerCase().includes(termo);
        const telMatch = i.telefone.replace(/\D/g, "").includes(termo.replace(/\D/g, ""));
        const cpfMatch = i.cpf ? i.cpf.replace(/\D/g, "").includes(termo.replace(/\D/g, "")) : false;
        const respMatch = i.nomeResponsavel ? i.nomeResponsavel.toLowerCase().includes(termo) : false;
        if (!codMatch && !nomeMatch && !telMatch && !cpfMatch && !respMatch) return false;
      }
      return true;
    });
  }, [
    inscricoes,
    busca,
    filtroCampanha,
    filtroStatusPag,
    filtroSexo,
    filtroFaixaEtaria,
    filtroAlergia,
    filtroIntolerancia,
    filtroRemedio,
    filtroSacramento,
    filtroGrupoWhatsapp,
  ]);

  // Estatísticas calculadas dinamicamente
  const stats = useMemo(() => {
    const total = inscricoesFiltradas.length;
    let pagas = 0;
    let pendentes = 0;
    let somaIdades = 0;
    let idadesContadas = 0;
    let totalArrecadado = 0;
    let totalEsperado = 0;

    inscricoesFiltradas.forEach((i) => {
      if (i.statusPagamento === "PAGO_TOTAL" || i.statusPagamento === "ISENTO") {
        pagas++;
      } else if (i.statusPagamento === "PENDENTE" || i.statusPagamento === "PAGO_PARCIAL") {
        pendentes++;
      }

      if (i.dataNascimento) {
        const idade = calcularIdade(i.dataNascimento);
        somaIdades += idade;
        idadesContadas++;
      }

      totalArrecadado += i.valorPago || 0;
      totalEsperado += i.valorTotal || 0;
    });

    const mediaIdade = idadesContadas > 0 ? (somaIdades / idadesContadas).toFixed(1) : "-";

    return {
      total,
      pagas,
      pendentes,
      mediaIdade,
      totalArrecadado,
      totalEsperado,
    };
  }, [inscricoesFiltradas]);

  // Listas de Telefones para Exportação Rápida
  const listaTelefonesInscritos = useMemo(() => {
    return inscricoesFiltradas
      .filter((i) => i.telefone)
      .map((i) => {
        const num = apenasDigitosTelefone ? i.telefone.replace(/\D/g, "") : i.telefone;
        return `${num} - ${i.nomeCompleto}`;
      });
  }, [inscricoesFiltradas, apenasDigitosTelefone]);

  const listaTelefonesResponsaveis = useMemo(() => {
    return inscricoesFiltradas
      .filter((i) => i.telefoneResponsavel)
      .map((i) => {
        const num = apenasDigitosTelefone ? (i.telefoneResponsavel || "").replace(/\D/g, "") : i.telefoneResponsavel;
        return `${num} - ${i.nomeResponsavel || "Responsável"} (Resp. de ${i.nomeCompleto})`;
      });
  }, [inscricoesFiltradas, apenasDigitosTelefone]);

  const listaTelefonesMenores = useMemo(() => {
    return inscricoesFiltradas
      .filter((i) => {
        const idade = i.dataNascimento ? calcularIdade(i.dataNascimento) : null;
        return idade !== null && idade < 18 && i.telefoneResponsavel;
      })
      .map((i) => {
        const idade = i.dataNascimento ? calcularIdade(i.dataNascimento) : "";
        const num = apenasDigitosTelefone ? (i.telefoneResponsavel || "").replace(/\D/g, "") : i.telefoneResponsavel;
        return `${num} - ${i.nomeResponsavel || "Responsável"} (Resp. de ${i.nomeCompleto} - ${idade} anos)`;
      });
  }, [inscricoesFiltradas, apenasDigitosTelefone]);

  function getTelefonesAtuais() {
    if (abaTelefone === "INSCRITOS") return listaTelefonesInscritos;
    if (abaTelefone === "RESPONSAVEIS") return listaTelefonesResponsaveis;
    return listaTelefonesMenores;
  }

  function handleCopiarTelefones() {
    const lista = getTelefonesAtuais();
    if (lista.length === 0) return;
    navigator.clipboard.writeText(lista.join("\r\n"));
    setCopiadoTelefones(true);
    setTimeout(() => setCopiadoTelefones(false), 2500);
  }

  function handleBaixarTelefonesTxt() {
    const lista = getTelefonesAtuais();
    if (lista.length === 0) return;
    const nomeArquivo =
      abaTelefone === "INSCRITOS"
        ? "telefones-inscritos.txt"
        : abaTelefone === "RESPONSAVEIS"
        ? "telefones-responsaveis.txt"
        : "telefones-responsaveis-menores.txt";
    const blob = new Blob([lista.join("\r\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==========================================
  // EXPORTAÇÃO: PLANILHA (EXCEL / CSV COM UTF-8 BOM)
  // ==========================================
  function exportarPlanilha() {
    // Determinar quais campos foram necessários / presentes no conjunto de inscrições filtradas
    const temCpf = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoCpf || i.cpf);
    });

    const temSexo = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoSexo || i.sexo);
    });

    const temDataNascimento = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoDataNascimento || i.dataNascimento);
    });

    const temResponsavel = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(
        c?.campoNomeResponsavel ||
        c?.campoParentescoResponsavel ||
        c?.campoTelefoneResponsavel ||
        i.nomeResponsavel ||
        i.telefoneResponsavel
      );
    });

    const temAlergia = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoAlergia || i.possuiAlergia);
    });

    const temIntolerancia = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoIntolerancia || i.intoleranciaGluten || i.intoleranciaLactose);
    });

    const temRemedio = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoRemedioContinuo || i.usaRemedioContinuo);
    });

    const temBatismo = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoBatismo || i.batismo);
    });

    const temPrimeiraEucaristia = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoPrimeiraEucaristia || i.primeiraEucaristia);
    });

    const temCrisma = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoCrisma || i.crisma);
    });

    const temGrupo = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.linkGrupoWhatsapp || i.entrouNoGrupoWhatsapp);
    });

    const temCamiseta = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.permiteCamiseta || c?.campanhaCamisetaId || i.pediuCamiseta);
    });

    const temFinanceiro = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.requerPagamento || i.valorTotal > 0);
    });

    const temObservacao = inscricoesFiltradas.some((i) => Boolean(i.observacao && i.observacao.trim()));

    type ColunaDef = {
      titulo: string;
      ativo: boolean;
      valor: (i: InscricaoItem, camp?: CampanhaItem) => string;
    };

    const definicaoColunas: ColunaDef[] = [
      { titulo: "Código", ativo: true, valor: (i) => i.codigoInscricao },
      { titulo: "Evento", ativo: true, valor: (i, c) => c?.titulo || i.campanha?.titulo || "" },
      { titulo: "Data Inscrição", ativo: true, valor: (i) => formatarData(i.criadoEm) },
      { titulo: "Nome Completo", ativo: true, valor: (i) => i.nomeCompleto },
      { titulo: "CPF", ativo: temCpf, valor: (i) => (i.cpf ? formatarCpf(i.cpf) : "") },
      { titulo: "Sexo", ativo: temSexo, valor: (i) => i.sexo || "" },
      { titulo: "Telefone", ativo: true, valor: (i) => i.telefone },
      {
        titulo: "Data Nascimento",
        ativo: temDataNascimento,
        valor: (i) => (i.dataNascimento ? formatarData(i.dataNascimento) : ""),
      },
      {
        titulo: "Idade (Anos)",
        ativo: temDataNascimento,
        valor: (i) => (i.dataNascimento ? String(calcularIdade(i.dataNascimento)) : ""),
      },
      {
        titulo: "Nome Responsável",
        ativo: temResponsavel,
        valor: (i) => i.nomeResponsavel || "",
      },
      {
        titulo: "Parentesco",
        ativo: temResponsavel,
        valor: (i) => i.parentescoResponsavel || "",
      },
      {
        titulo: "Telefone Responsável",
        ativo: temResponsavel,
        valor: (i) => (i.telefoneResponsavel ? formatarTelefone(i.telefoneResponsavel) : ""),
      },
      {
        titulo: "Alergia?",
        ativo: temAlergia,
        valor: (i, c) => (c?.campoAlergia ? (i.possuiAlergia ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Descrição da Alergia",
        ativo: temAlergia,
        valor: (i) => i.descricaoAlergia || "",
      },
      {
        titulo: "Intolerante a Glúten",
        ativo: temIntolerancia,
        valor: (i, c) => (c?.campoIntolerancia ? (i.intoleranciaGluten ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Intolerante a Lactose",
        ativo: temIntolerancia,
        valor: (i, c) => (c?.campoIntolerancia ? (i.intoleranciaLactose ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Usa Remédio Contínuo?",
        ativo: temRemedio,
        valor: (i, c) => (c?.campoRemedioContinuo ? (i.usaRemedioContinuo ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Descrição Remédio Contínuo",
        ativo: temRemedio,
        valor: (i) => i.descricaoRemedioContinuo || "",
      },
      {
        titulo: "Batismo",
        ativo: temBatismo,
        valor: (i, c) => (c?.campoBatismo ? (i.batismo ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Primeira Eucaristia",
        ativo: temPrimeiraEucaristia,
        valor: (i, c) => (c?.campoPrimeiraEucaristia ? (i.primeiraEucaristia ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Crisma",
        ativo: temCrisma,
        valor: (i, c) => (c?.campoCrisma ? (i.crisma ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Entrou no Grupo WhatsApp?",
        ativo: temGrupo,
        valor: (i, c) => (c?.linkGrupoWhatsapp ? (i.entrouNoGrupoWhatsapp ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Pediu Camiseta?",
        ativo: temCamiseta,
        valor: (i, c) => (c?.permiteCamiseta ? (i.pediuCamiseta ? "SIM" : "NÃO") : ""),
      },
      {
        titulo: "Modelo Camiseta",
        ativo: temCamiseta,
        valor: (i) => (i.pediuCamiseta ? i.camisetaModelo || "" : ""),
      },
      {
        titulo: "Tamanho Camiseta",
        ativo: temCamiseta,
        valor: (i) => (i.pediuCamiseta ? i.camisetaTamanho || "" : ""),
      },
      {
        titulo: "Nome na Camiseta",
        ativo: temCamiseta,
        valor: (i) => (i.pediuCamiseta ? i.camisetaNomePersonalizado || "" : ""),
      },
      {
        titulo: "Número na Camiseta",
        ativo: temCamiseta,
        valor: (i) => (i.pediuCamiseta ? i.camisetaNumeroPersonalizado || "" : ""),
      },
      {
        titulo: "Valor Camiseta (R$)",
        ativo: temCamiseta,
        valor: (i) => (i.pediuCamiseta ? Number(i.camisetaValor || 0).toFixed(2).replace(".", ",") : ""),
      },
      {
        titulo: "Forma Pagamento",
        ativo: temFinanceiro,
        valor: (i) => i.formaPagamento || (i.valorTotal > 0 ? "PENDENTE" : "ISENTO"),
      },
      {
        titulo: "Valor Total (R$)",
        ativo: temFinanceiro,
        valor: (i) => i.valorTotal.toFixed(2).replace(".", ","),
      },
      {
        titulo: "Valor Pago (R$)",
        ativo: temFinanceiro,
        valor: (i) => i.valorPago.toFixed(2).replace(".", ","),
      },
      {
        titulo: "Status Pagamento",
        ativo: temFinanceiro,
        valor: (i) => i.statusPagamento,
      },
      { titulo: "Status Inscrição", ativo: true, valor: (i) => i.status },
      { titulo: "Observação", ativo: temObservacao, valor: (i) => i.observacao || "" },
    ];

    const colunasAtivas = definicaoColunas.filter((col) => col.ativo);
    const cabecalho = colunasAtivas.map((col) => col.titulo);

    const linhas = inscricoesFiltradas.map((i) => {
      const camp = i.campanha || campanhas.find((c) => c.id === i.campanhaId);
      return colunasAtivas
        .map((col) => `"${col.valor(i, camp).replace(/"/g, '""')}"`)
        .join(";");
    });

    const csvContent = "\uFEFF" + [cabecalho.join(";"), ...linhas].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio-inscricoes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==========================================
  // EXPORTAÇÃO: PDF COMPLETO COM IDADE
  // ==========================================
  function exportarPDFCompleto() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const dataHora = new Date().toLocaleString("pt-BR");

    doc.setFontSize(14);
    doc.text("Relatório Geral de Inscrições — JUSC", 14, 15);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Gerado em: ${dataHora} | Total de Inscritos: ${stats.total} | Idade Média: ${stats.mediaIdade} anos | Total Arrecadado: R$ ${stats.totalArrecadado.toFixed(2).replace(".", ",")}`,
      14,
      21
    );

    const temCpf = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoCpf || i.cpf);
    });

    const temSexo = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoSexo || i.sexo);
    });

    const temDataNascimento = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoDataNascimento || i.dataNascimento);
    });

    const temCamiseta = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.permiteCamiseta || c?.campanhaCamisetaId || i.pediuCamiseta);
    });

    const temResponsavel = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(
        c?.campoNomeResponsavel ||
        c?.campoParentescoResponsavel ||
        c?.campoTelefoneResponsavel ||
        i.nomeResponsavel ||
        i.telefoneResponsavel
      );
    });

    const temAlergia = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoAlergia || i.possuiAlergia);
    });

    const temIntolerancia = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoIntolerancia || i.intoleranciaGluten || i.intoleranciaLactose);
    });

    const temRemedio = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoRemedioContinuo || i.usaRemedioContinuo);
    });
    const temSaude = temAlergia || temIntolerancia || temRemedio;

    const temBatismo = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoBatismo || i.batismo);
    });

    const temPrimeiraEucaristia = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoPrimeiraEucaristia || i.primeiraEucaristia);
    });

    const temCrisma = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoCrisma || i.crisma);
    });
    const temSacramentos = temBatismo || temPrimeiraEucaristia || temCrisma;

    const temGrupo = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.linkGrupoWhatsapp || i.entrouNoGrupoWhatsapp);
    });

    const temFinanceiro = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.requerPagamento || i.valorTotal > 0);
    });

    type ColunaPdf = {
      titulo: string;
      ativo: boolean;
      valor: (i: InscricaoItem, camp?: CampanhaItem) => string;
    };

    const definicaoPdf: ColunaPdf[] = [
      { titulo: "Cód.", ativo: true, valor: (i) => i.codigoInscricao },
      { titulo: "Participante", ativo: true, valor: (i) => i.nomeCompleto },
      { titulo: "CPF", ativo: temCpf, valor: (i) => (i.cpf ? formatarCpf(i.cpf) : "-") },
      { titulo: "Sexo", ativo: temSexo, valor: (i) => i.sexo || "-" },
      {
        titulo: "Idade",
        ativo: temDataNascimento,
        valor: (i) => (i.dataNascimento ? `${calcularIdade(i.dataNascimento)} anos` : "-"),
      },
      { titulo: "Telefone", ativo: true, valor: (i) => i.telefone },
      {
        titulo: "Camiseta",
        ativo: temCamiseta,
        valor: (i) =>
          i.pediuCamiseta
            ? `${i.camisetaModelo || "Cam."} (${i.camisetaTamanho || ""})${i.camisetaNomePersonalizado ? ` - ${i.camisetaNomePersonalizado}` : ""}`
            : "-",
      },
      {
        titulo: "Responsável",
        ativo: temResponsavel,
        valor: (i) =>
          i.nomeResponsavel
            ? `${i.nomeResponsavel} (${i.parentescoResponsavel || "Resp."})`
            : "-",
      },
      {
        titulo: "Alimentação / Saúde",
        ativo: temSaude,
        valor: (i, c) => {
          if (!c?.campoAlergia && !c?.campoIntolerancia && !c?.campoRemedioContinuo) {
            return "-";
          }
          const saude = [
            i.possuiAlergia ? `Alergia: ${i.descricaoAlergia || "Sim"}` : "",
            i.intoleranciaGluten ? "Glúten" : "",
            i.intoleranciaLactose ? "Lactose" : "",
            i.usaRemedioContinuo ? `Remédio: ${i.descricaoRemedioContinuo || "Sim"}` : "",
          ]
            .filter(Boolean)
            .join(" | ");
          return saude || "Sem restrições";
        },
      },
      {
        titulo: "Sacramentos",
        ativo: temSacramentos,
        valor: (i, c) => {
          if (!c?.campoBatismo && !c?.campoPrimeiraEucaristia && !c?.campoCrisma) {
            return "-";
          }
          const sacramentos = [
            c?.campoBatismo && i.batismo ? "Bat." : "",
            c?.campoPrimeiraEucaristia && i.primeiraEucaristia ? "1ª Euc." : "",
            c?.campoCrisma && i.crisma ? "Crisma" : "",
          ]
            .filter(Boolean)
            .join(", ");
          return sacramentos || "-";
        },
      },
      {
        titulo: "WhatsApp Grupo",
        ativo: temGrupo,
        valor: (i, c) =>
          c?.linkGrupoWhatsapp
            ? i.entrouNoGrupoWhatsapp
              ? "No Grupo"
              : "Não Entrou"
            : "-",
      },
      {
        titulo: "Financeiro",
        ativo: temFinanceiro,
        valor: (i) =>
          i.valorTotal > 0
            ? `R$ ${i.valorPago.toFixed(0)} / ${i.valorTotal.toFixed(0)} (${i.statusPagamento})`
            : "Isento",
      },
      { titulo: "Status", ativo: true, valor: (i) => i.status },
    ];

    const colunasPdfAtivas = definicaoPdf.filter((col) => col.ativo);
    const head = [colunasPdfAtivas.map((c) => c.titulo)];
    const body = inscricoesFiltradas.map((i) => {
      const camp = i.campanha || campanhas.find((c) => c.id === i.campanhaId);
      return colunasPdfAtivas.map((c) => c.valor(i, camp));
    });

    autoTable(doc, {
      head,
      body,
      startY: 26,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`relatorio-inscricoes-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ==========================================
  // EXPORTAÇÃO: LISTA DE CHAMADA / PRESENÇA (PDF)
  // ==========================================
  function exportarListaPresencaPDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const dataHora = new Date().toLocaleDateString("pt-BR");

    doc.setFontSize(14);
    doc.text("Lista de Presença & Credenciamento de Evento", 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Evento: ${filtroCampanha !== "TODAS" ? (campanhas.find((c) => c.id === filtroCampanha)?.titulo || "JUSC") : "Geral"} | Data: ${dataHora} | Total: ${stats.total} participante(s)`,
      14,
      21
    );

    const temCpf = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoCpf || i.cpf);
    });

    const temDataNascimento = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.campoDataNascimento || i.dataNascimento);
    });

    const temResponsavel = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(
        c?.campoNomeResponsavel ||
        c?.campoParentescoResponsavel ||
        c?.campoTelefoneResponsavel ||
        i.nomeResponsavel ||
        i.telefoneResponsavel
      );
    });

    const temCamiseta = inscricoesFiltradas.some((i) => {
      const c = i.campanha || campanhas.find((camp) => camp.id === i.campanhaId);
      return Boolean(c?.permiteCamiseta || c?.campanhaCamisetaId || i.pediuCamiseta);
    });

    type ColunaPresenca = {
      titulo: string;
      ativo: boolean;
      valor: (i: InscricaoItem, idx: number) => string;
    };

    const definicaoPresenca: ColunaPresenca[] = [
      { titulo: "Nº", ativo: true, valor: (_, idx) => `${idx + 1}` },
      { titulo: "Nome do Participante", ativo: true, valor: (i) => i.nomeCompleto },
      { titulo: "CPF", ativo: temCpf, valor: (i) => (i.cpf ? formatarCpf(i.cpf) : "-") },
      { titulo: "Idade", ativo: temDataNascimento, valor: (i) => (i.dataNascimento ? `${calcularIdade(i.dataNascimento)} anos` : "-") },
      { titulo: "Telefone", ativo: true, valor: (i) => i.telefone },
      { titulo: "Tel. Responsável", ativo: temResponsavel, valor: (i) => i.telefoneResponsavel || "-" },
      {
        titulo: "Nome do Responsável",
        ativo: temResponsavel,
        valor: (i) =>
          i.nomeResponsavel
            ? `${i.nomeResponsavel} (${i.parentescoResponsavel || "Resp."})`
            : "-",
      },
      {
        titulo: "Camiseta",
        ativo: temCamiseta,
        valor: (i) =>
          i.pediuCamiseta
            ? `${i.camisetaModelo || "Cam."} (${i.camisetaTamanho || ""})`
            : "Não pediu",
      },
      {
        titulo: "Assinatura do Participante / Responsável",
        ativo: true,
        valor: () => "_______________________________",
      },
    ];

    const colunasPresencaAtivas = definicaoPresenca.filter((col) => col.ativo);
    const head = [colunasPresencaAtivas.map((c) => c.titulo)];
    const body = inscricoesFiltradas.map((i, idx) => {
      return colunasPresencaAtivas.map((c) => c.valor(i, idx));
    });

    autoTable(doc, {
      head,
      body,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    doc.save(`lista-presenca-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // AÇÕES CRUD (EXCLUSIVAS PARA ADMIN)
  async function handleExcluirInscricao(id: string) {
    if (!confirm("Tem certeza de que deseja excluir esta inscrição? Esta ação não pode ser desfeita.")) {
      return;
    }

    setProcessandoId(id);
    try {
      const res = await fetch(`/api/inscricoes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao excluir inscrição.");
        return;
      }
      setInscricoes((prev) => prev.filter((i) => i.id !== id));
      setMensagemSucesso("Inscrição excluída com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 3000);
    } catch {
      alert("Erro na requisição.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleSalvarStatusPagamento(e: React.FormEvent) {
    e.preventDefault();
    if (!inscricaoBaixa) return;

    setProcessandoId(inscricaoBaixa.id);
    try {
      const res = await fetch(`/api/inscricoes/${inscricaoBaixa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusPagamento: inscricaoBaixa.statusPagamento,
          valorPago: inscricaoBaixa.valorPago,
          status: inscricaoBaixa.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao atualizar pagamento.");
        return;
      }

      setInscricoes((prev) =>
        prev.map((item) => (item.id === inscricaoBaixa.id ? data.inscricao : item))
      );
      setInscricaoBaixa(null);
      setMensagemSucesso("Status de pagamento atualizado com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 3000);
    } catch {
      alert("Erro na requisição.");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#FFC72C] text-black">
              Módulo de Inscrição
            </span>
            <span className="text-xs text-neutral-400">
              Gestão Completa de Inscrições
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight mt-1">
            Inscrições dos Eventos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Acompanhe inscritos, idades calculadas, restrições e relatórios
          </p>
        </div>

        {/* Botão de Nova Inscrição Manual */}
        <button
          onClick={() => setModalNovaInscricao(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#FFC72C] hover:bg-amber-400 active:scale-95 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Inscrição Manual</span>
        </button>
      </div>

      {mensagemSucesso && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* CARDS COM MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Inscritos</span>
            <ClipboardList className="w-4 h-4 text-[#FFC72C]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
            {stats.total}
          </div>
          <span className="text-[11px] text-neutral-400">participantes listados</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Idade Média</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
            {stats.mediaIdade} {stats.mediaIdade !== "-" ? "anos" : ""}
          </div>
          <span className="text-[11px] text-neutral-400">cálculo automático de idade</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Confirmados / Isentos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.pagas}
          </div>
          <span className="text-[11px] text-neutral-400">vagas 100% garantidas</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Financeiro / Pix</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
            R$ {stats.totalArrecadado.toFixed(2).replace(".", ",")}
          </div>
          <span className="text-[11px] text-neutral-400">
            de R$ {stats.totalEsperado.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* FILTROS E EXPORTAÇÃO */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#13151c] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Busca por texto */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, telefone ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
            />
          </div>

          {/* Seletores de Filtro */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={filtroCampanha}
              onChange={(e) => setFiltroCampanha(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white"
            >
              <option value="TODAS">Todos os Eventos</option>
              {campanhas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>

            <select
              value={filtroStatusPag}
              onChange={(e) => setFiltroStatusPag(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white"
            >
              <option value="TODOS">Todos os Pagamentos</option>
              <option value="ISENTO">Isento (Gratuito)</option>
              <option value="PAGO_TOTAL">Pago Total</option>
              <option value="PAGO_PARCIAL">Pago Parcial (50%)</option>
              <option value="PENDENTE">Pendente</option>
            </select>

            <button
              onClick={() => setFiltrosAvancadosAbertos(!filtrosAvancadosAbertos)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                filtrosAvancadosAbertos ||
                filtroSexo !== "TODOS" ||
                filtroFaixaEtaria !== "TODOS" ||
                filtroAlergia !== "TODOS" ||
                filtroIntolerancia !== "TODOS" ||
                filtroRemedio !== "TODOS" ||
                filtroSacramento !== "TODOS" ||
                filtroGrupoWhatsapp !== "TODOS"
                  ? "bg-[#FFC72C]/15 border-[#FFC72C] text-amber-700 dark:text-amber-400"
                  : "bg-neutral-50 dark:bg-[#1c202a] border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros Avançados</span>
              {[
                filtroSexo !== "TODOS",
                filtroFaixaEtaria !== "TODOS",
                filtroAlergia !== "TODOS",
                filtroIntolerancia !== "TODOS",
                filtroRemedio !== "TODOS",
                filtroSacramento !== "TODOS",
                filtroGrupoWhatsapp !== "TODOS",
              ].filter(Boolean).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FFC72C] text-black font-black text-[10px] flex items-center justify-center">
                  {[
                    filtroSexo !== "TODOS",
                    filtroFaixaEtaria !== "TODOS",
                    filtroAlergia !== "TODOS",
                    filtroIntolerancia !== "TODOS",
                    filtroRemedio !== "TODOS",
                    filtroSacramento !== "TODOS",
                    filtroGrupoWhatsapp !== "TODOS",
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* PAINEL EXPANSÍVEL DE FILTROS AVANÇADOS */}
        {filtrosAvancadosAbertos && (
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#FFC72C]" />
                Filtros específicos:
              </span>
              {(filtroSexo !== "TODOS" ||
                filtroFaixaEtaria !== "TODOS" ||
                filtroAlergia !== "TODOS" ||
                filtroIntolerancia !== "TODOS" ||
                filtroRemedio !== "TODOS" ||
                filtroSacramento !== "TODOS" ||
                filtroGrupoWhatsapp !== "TODOS") && (
                <button
                  onClick={() => {
                    setFiltroSexo("TODOS");
                    setFiltroFaixaEtaria("TODOS");
                    setFiltroAlergia("TODOS");
                    setFiltroIntolerancia("TODOS");
                    setFiltroRemedio("TODOS");
                    setFiltroSacramento("TODOS");
                    setFiltroGrupoWhatsapp("TODOS");
                  }}
                  className="text-neutral-400 hover:text-rose-500 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar Filtros Avançados</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
              {/* Filtro Sexo */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">Sexo</label>
                <select
                  value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="TODOS">Todos os sexos</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>

              {/* Filtro Idade */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">Faixa Etária</label>
                <select
                  value={filtroFaixaEtaria}
                  onChange={(e) => setFiltroFaixaEtaria(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="TODOS">Todas as idades</option>
                  <option value="MENOR">Menores de 18 anos</option>
                  <option value="MAIOR">Maiores de 18 anos</option>
                </select>
              </div>

              {/* Filtro Alergia */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">Alergias</label>
                <select
                  value={filtroAlergia}
                  onChange={(e) => setFiltroAlergia(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="TODOS">Todas (Alergia)</option>
                  <option value="SIM">Com Alergia</option>
                  <option value="NAO">Sem Alergia</option>
                </select>
              </div>

              {/* Filtro Intolerâncias */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">Intolerâncias</label>
                <select
                  value={filtroIntolerancia}
                  onChange={(e) => setFiltroIntolerancia(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="TODOS">Todas (Intolerâncias)</option>
                  <option value="GLUTEN">Glúten</option>
                  <option value="LACTOSE">Lactose</option>
                  <option value="QUALQUER">Glúten ou Lactose</option>
                  <option value="NENHUMA">Sem Intolerância</option>
                </select>
              </div>

              {/* Filtro Remédio Contínuo */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">Remédio Contínuo</label>
                <select
                  value={filtroRemedio}
                  onChange={(e) => setFiltroRemedio(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="TODOS">Todos (Remédios)</option>
                  <option value="SIM">Usa Remédio</option>
                  <option value="NAO">Não Usa Remédio</option>
                </select>
              </div>

              {/* Filtro Sacramentos */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">Sacramentos</label>
                <select
                  value={filtroSacramento}
                  onChange={(e) => setFiltroSacramento(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="TODOS">Todos (Sacramentos)</option>
                  <option value="TODOS_CONCLUIDOS">Todos os 3</option>
                  <option value="FALTA_BATISMO">Falta Batismo</option>
                  <option value="FALTA_EUCARISTIA">Falta 1ª Eucaristia</option>
                  <option value="FALTA_CRISMA">Falta Crisma</option>
                </select>
              </div>

              {/* Filtro Grupo WhatsApp */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">Grupo WhatsApp</label>
                <select
                  value={filtroGrupoWhatsapp}
                  onChange={(e) => setFiltroGrupoWhatsapp(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="NO_GRUPO">No Grupo</option>
                  <option value="FORA_DO_GRUPO">Não Entrou</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Exportação */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="text-neutral-400 font-medium">
            Exibindo <strong>{inscricoesFiltradas.length}</strong> de {inscricoes.length} inscrição(ões)
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalExportarTelefones(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>Exportar Telefones</span>
            </button>

            <button
              onClick={exportarPlanilha}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Planilha (Excel/CSV)</span>
            </button>

            <button
              onClick={exportarPDFCompleto}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Relatório Completo (PDF)</span>
            </button>

            <button
              onClick={exportarListaPresencaPDF}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Lista de Chamada (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABELA DE INSCRIÇÕES */}
      <div className="bg-white dark:bg-[#13151c] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-neutral-500">Carregando inscrições...</p>
          </div>
        ) : inscricoesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-2">
            <ClipboardList className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs font-medium">Nenhuma inscrição encontrada para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Cód. / Data</th>
                  <th className="py-3.5 px-4">Participante</th>
                  <th className="py-3.5 px-4">Idade</th>
                  <th className="py-3.5 px-4">Evento</th>
                  <th className="py-3.5 px-4">Saúde / Restrições</th>
                  <th className="py-3.5 px-4">Financeiro</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {inscricoesFiltradas.map((i) => {
                  const idade = i.dataNascimento ? calcularIdade(i.dataNascimento) : null;
                  const telLimpo = i.telefone.replace(/\D/g, "");

                  return (
                    <tr
                      key={i.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      {/* Código e Data */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-neutral-900 dark:text-white block">
                          {i.codigoInscricao}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {formatarData(i.criadoEm)}
                        </span>
                      </td>

                      {/* Participante & Telefone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {i.nomeCompleto}
                          </span>
                          {i.sexo && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
                              {i.sexo === "MASCULINO" ? "Masc" : "Fem"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`https://api.whatsapp.com/send?phone=${telLimpo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {i.telefone}
                          </a>

                          {/* Botão de Adicionado ao grupo / Não entrou no grupo */}
                          {Boolean(i.campanha?.linkGrupoWhatsapp || campanhas.find((c) => c.id === i.campanhaId)?.linkGrupoWhatsapp) && (
                            <button
                              type="button"
                              onClick={() => handleToggleGrupoWhatsapp(i)}
                              disabled={processandoGrupoId === i.id}
                              title={
                                i.entrouNoGrupoWhatsapp
                                  ? "Adicionado ao grupo. Clique para alternar caso necessário."
                                  : "Não entrou no grupo. Clique para marcar como adicionado ao grupo."
                              }
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-xs cursor-pointer ${
                                i.entrouNoGrupoWhatsapp
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-rose-600 hover:bg-rose-700 text-white"
                              } ${processandoGrupoId === i.id ? "opacity-50 cursor-wait" : "active:scale-95"}`}
                            >
                              {i.entrouNoGrupoWhatsapp ? (
                                <>
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>Adicionado ao grupo</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>Não entrou no grupo</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {i.pediuCamiseta && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                            <Shirt className="w-3 h-3" />
                            <span>
                              {i.camisetaModelo} ({i.camisetaTamanho})
                              {i.camisetaNomePersonalizado ? ` • ${i.camisetaNomePersonalizado}` : ""}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Idade Calculada */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {idade !== null ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-black text-[11px] ${
                              idade < 18
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            {idade} {idade === 1 ? "ano" : "anos"}
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>

                      {/* Evento */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                          {i.campanha?.titulo || "Evento"}
                        </span>
                      </td>

                      {/* Saúde / Restrições */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {i.possuiAlergia || i.intoleranciaGluten || i.intoleranciaLactose ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] border border-rose-500/20">
                              <Heart className="w-3 h-3" />
                              {[
                                i.possuiAlergia ? "Alergia" : "",
                                i.intoleranciaGluten ? "Glúten" : "",
                                i.intoleranciaLactose ? "Lactose" : "",
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          ) : null}

                          {i.usaRemedioContinuo ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-500/20">
                              <span>Remédio: {i.descricaoRemedioContinuo || "Sim"}</span>
                            </div>
                          ) : null}

                          {!i.possuiAlergia &&
                            !i.intoleranciaGluten &&
                            !i.intoleranciaLactose &&
                            !i.usaRemedioContinuo && (
                              <span className="text-[11px] text-neutral-400">Nenhuma</span>
                            )}
                        </div>
                      </td>

                      {/* Financeiro */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {i.valorTotal > 0 ? (
                          <div>
                            <span className="font-black text-neutral-900 dark:text-white block">
                              R$ {i.valorPago.toFixed(2).replace(".", ",")} / {i.valorTotal.toFixed(2).replace(".", ",")}
                            </span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                i.statusPagamento === "PAGO_TOTAL"
                                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                  : i.statusPagamento === "PAGO_PARCIAL"
                                  ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                                  : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {i.statusPagamento.replace("_", " ")}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-[10px]">
                            Gratuito
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                        {/* Ver Detalhes (Coordenação e Admin) */}
                        <button
                          onClick={() => setInscricaoDetalhes(i)}
                          title="Visualizar ficha completa"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Ações do CRUD */}
                        {i.valorTotal > 0 && (
                          <button
                            onClick={() => setInscricaoBaixa(i)}
                            title="Dar baixa ou alterar pagamento"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setInscricaoEditando(i)}
                          title="Editar inscrição"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          disabled={processandoId === i.id}
                          onClick={() => handleExcluirInscricao(i.id)}
                          title="Excluir inscrição"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* MODAL: VER DETALHES COMPLETOS (COORDENAÇÃO & ADMIN) */}
      {inscricaoDetalhes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFC72C] text-black flex items-center justify-center font-black">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base">{inscricaoDetalhes.nomeCompleto}</h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Cód: {inscricaoDetalhes.codigoInscricao} • {formatarData(inscricaoDetalhes.criadoEm)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInscricaoDetalhes(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Evento:</span>
                  <span className="font-bold">{inscricaoDetalhes.campanha?.titulo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Telefone:</span>
                  <span className="font-bold">{inscricaoDetalhes.telefone}</span>
                </div>
                {inscricaoDetalhes.sexo && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Sexo:</span>
                    <span className="font-bold">
                      {inscricaoDetalhes.sexo === "MASCULINO" ? "Masculino" : "Feminino"}
                    </span>
                  </div>
                )}
                {inscricaoDetalhes.cpf && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">CPF:</span>
                    <span className="font-mono">{inscricaoDetalhes.cpf}</span>
                  </div>
                )}
                {inscricaoDetalhes.dataNascimento && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Data de Nascimento:</span>
                    <span className="font-bold">
                      {formatarData(inscricaoDetalhes.dataNascimento)} (
                      {calcularIdade(inscricaoDetalhes.dataNascimento)} anos)
                    </span>
                  </div>
                )}
              </div>

              {/* Responsável */}
              {(inscricaoDetalhes.nomeResponsavel || inscricaoDetalhes.telefoneResponsavel) && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <span className="font-black uppercase text-[10px] text-amber-700 dark:text-amber-300 block">
                    Dados do Responsável
                  </span>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Nome:</span>
                    <span className="font-bold">{inscricaoDetalhes.nomeResponsavel || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Parentesco:</span>
                    <span>{inscricaoDetalhes.parentescoResponsavel || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Telefone:</span>
                    <span>{inscricaoDetalhes.telefoneResponsavel || "-"}</span>
                  </div>
                </div>
              )}

              {/* Restrições Alimentares & Saúde */}
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="font-black uppercase text-[10px] text-rose-600 dark:text-rose-400 block">
                  Saúde & Restrições
                </span>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Alergia:</span>
                  <span className="font-bold">
                    {inscricaoDetalhes.possuiAlergia
                      ? inscricaoDetalhes.descricaoAlergia || "Sim (Sem detalhes)"
                      : "Não"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Intolerante a Glúten:</span>
                  <span>{inscricaoDetalhes.intoleranciaGluten ? "Sim" : "Não"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Intolerante a Lactose:</span>
                  <span>{inscricaoDetalhes.intoleranciaLactose ? "Sim" : "Não"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Uso de Remédio Contínuo:</span>
                  <span className="font-bold">
                    {inscricaoDetalhes.usaRemedioContinuo
                      ? inscricaoDetalhes.descricaoRemedioContinuo || "Sim"
                      : "Não"}
                  </span>
                </div>
              </div>

              {/* Status no Grupo Oficial do WhatsApp */}
              {inscricaoDetalhes.campanha?.linkGrupoWhatsapp && (
                <div
                  className={`p-3 rounded-2xl border space-y-1.5 ${
                    inscricaoDetalhes.entrouNoGrupoWhatsapp
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  <span className="font-black uppercase text-[10px] block">
                    Grupo Oficial do WhatsApp do Evento
                  </span>
                  <div className="flex items-center gap-2">
                    {inscricaoDetalhes.entrouNoGrupoWhatsapp ? (
                      <span className="font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Participante clicou e acessou o grupo
                        {inscricaoDetalhes.clicouGrupoEm && (
                          <span className="text-[10px] text-neutral-400 font-normal">
                            (em {new Date(inscricaoDetalhes.clicouGrupoEm).toLocaleString("pt-BR")})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        ⚠️ Provavelmente não está no grupo do WhatsApp (ainda não clicou no link)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Sacramentos */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 space-y-1.5">
                <span className="font-black uppercase text-[10px] text-neutral-500 block">
                  Sacramentos Recebidos
                </span>
                <div className="flex gap-4">
                  <span className={inscricaoDetalhes.batismo ? "font-bold text-emerald-500" : "text-neutral-400"}>
                    Batismo: {inscricaoDetalhes.batismo ? "Sim" : "Não"}
                  </span>
                  <span className={inscricaoDetalhes.primeiraEucaristia ? "font-bold text-emerald-500" : "text-neutral-400"}>
                    1ª Eucaristia: {inscricaoDetalhes.primeiraEucaristia ? "Sim" : "Não"}
                  </span>
                  <span className={inscricaoDetalhes.crisma ? "font-bold text-emerald-500" : "text-neutral-400"}>
                    Crisma: {inscricaoDetalhes.crisma ? "Sim" : "Não"}
                  </span>
                </div>
              </div>

              {/* Camiseta do Evento */}
              {inscricaoDetalhes.pediuCamiseta && (
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                  <span className="font-black uppercase text-[10px] text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-purple-500" />
                    Camiseta Oficial Pedida
                  </span>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Modelo:</span>
                    <span className="font-bold">{inscricaoDetalhes.camisetaModelo || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tamanho:</span>
                    <span className="font-black">{inscricaoDetalhes.camisetaTamanho || "-"}</span>
                  </div>
                  {inscricaoDetalhes.camisetaNomePersonalizado && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Nome na Camiseta:</span>
                      <span className="font-bold">{inscricaoDetalhes.camisetaNomePersonalizado}</span>
                    </div>
                  )}
                  {inscricaoDetalhes.camisetaNumeroPersonalizado && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Número na Camiseta:</span>
                      <span className="font-bold">{inscricaoDetalhes.camisetaNumeroPersonalizado}</span>
                    </div>
                  )}
                  {Number(inscricaoDetalhes.camisetaValor || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Valor Adicional da Camiseta:</span>
                      <span className="font-bold">
                        R$ {Number(inscricaoDetalhes.camisetaValor).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Financeiro */}
              {inscricaoDetalhes.valorTotal > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <span className="font-black uppercase text-[10px] text-emerald-600 dark:text-emerald-400 block">
                    Financeiro
                  </span>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Valor Total:</span>
                    <span className="font-black">R$ {inscricaoDetalhes.valorTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Valor Pago:</span>
                    <span className="font-bold text-emerald-600">
                      R$ {inscricaoDetalhes.valorPago.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Status do Pagamento:</span>
                    <span className="font-bold">{inscricaoDetalhes.statusPagamento}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setInscricaoDetalhes(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: BAIXA / ALTERAR PAGAMENTO (ADMIN) */}
      {inscricaoBaixa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-black text-base">Controle Financeiro da Inscrição</h3>
              <button
                onClick={() => setInscricaoBaixa(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Inscrição: <strong>{inscricaoBaixa.nomeCompleto}</strong> ({inscricaoBaixa.codigoInscricao})
            </p>

            <form onSubmit={handleSalvarStatusPagamento} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Status do Pagamento</label>
                <select
                  value={inscricaoBaixa.statusPagamento}
                  onChange={(e) =>
                    setInscricaoBaixa({
                      ...inscricaoBaixa,
                      statusPagamento: e.target.value,
                      valorPago:
                        e.target.value === "PAGO_TOTAL"
                          ? inscricaoBaixa.valorTotal
                          : e.target.value === "PAGO_PARCIAL"
                          ? inscricaoBaixa.valorTotal / 2
                          : 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 font-semibold"
                >
                  <option value="PENDENTE">Pendente (R$ 0,00)</option>
                  <option value="PAGO_PARCIAL">Pago Parcial 50% (R$ {(inscricaoBaixa.valorTotal / 2).toFixed(2)})</option>
                  <option value="PAGO_TOTAL">Pago Total 100% (R$ {inscricaoBaixa.valorTotal.toFixed(2)})</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Valor Efetivamente Pago (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inscricaoBaixa.valorPago}
                  onChange={(e) =>
                    setInscricaoBaixa({
                      ...inscricaoBaixa,
                      valorPago: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInscricaoBaixa(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC72C] text-black font-black text-xs shadow"
                >
                  Salvar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR INSCRIÇÃO (ADMIN) */}
      {inscricaoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-black text-base">Editar Inscrição (Admin)</h3>
              <button
                onClick={() => setInscricaoEditando(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setProcessandoId(inscricaoEditando.id);
                try {
                  const res = await fetch(`/api/inscricoes/${inscricaoEditando.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(inscricaoEditando),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);
                  setInscricoes((prev) =>
                    prev.map((i) => (i.id === inscricaoEditando.id ? data.inscricao : i))
                  );
                  setInscricaoEditando(null);
                  setMensagemSucesso("Inscrição atualizada com sucesso!");
                  setTimeout(() => setMensagemSucesso(""), 3000);
                } catch (err: any) {
                  alert(err.message || "Erro ao salvar alterações.");
                } finally {
                  setProcessandoId(null);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={inscricaoEditando.nomeCompleto}
                  onChange={(e) =>
                    setInscricaoEditando({ ...inscricaoEditando, nomeCompleto: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Telefone *</label>
                  <input
                    type="text"
                    required
                    value={inscricaoEditando.telefone}
                    onChange={(e) =>
                      setInscricaoEditando({
                        ...inscricaoEditando,
                        telefone: formatarTelefone(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">CPF</label>
                  <input
                    type="text"
                    value={inscricaoEditando.cpf || ""}
                    onChange={(e) =>
                      setInscricaoEditando({
                        ...inscricaoEditando,
                        cpf: formatarCpf(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                  />
                </div>
              </div>

              {/* Data de Nascimento e Sexo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={
                      inscricaoEditando.dataNascimento
                        ? new Date(inscricaoEditando.dataNascimento).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setInscricaoEditando({
                        ...inscricaoEditando,
                        dataNascimento: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Sexo</label>
                  <select
                    value={inscricaoEditando.sexo || ""}
                    onChange={(e) =>
                      setInscricaoEditando({
                        ...inscricaoEditando,
                        sexo: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 font-semibold"
                  >
                    <option value="">Não informado</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
              </div>

              {/* Dados do Responsável */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                <div>
                  <label className="font-bold block mb-1">Nome do Responsável</label>
                  <input
                    type="text"
                    value={inscricaoEditando.nomeResponsavel || ""}
                    onChange={(e) =>
                      setInscricaoEditando({
                        ...inscricaoEditando,
                        nomeResponsavel: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Parentesco</label>
                    <input
                      type="text"
                      value={inscricaoEditando.parentescoResponsavel || ""}
                      onChange={(e) =>
                        setInscricaoEditando({
                          ...inscricaoEditando,
                          parentescoResponsavel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tel. Responsável</label>
                    <input
                      type="text"
                      value={inscricaoEditando.telefoneResponsavel || ""}
                      onChange={(e) =>
                        setInscricaoEditando({
                          ...inscricaoEditando,
                          telefoneResponsavel: formatarTelefone(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              {/* Saúde e Restrições */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                <span className="font-black text-[11px] uppercase tracking-wider text-rose-600 block">
                  Saúde & Restrições
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(inscricaoEditando.possuiAlergia)}
                        onChange={(e) =>
                          setInscricaoEditando({
                            ...inscricaoEditando,
                            possuiAlergia: e.target.checked,
                            descricaoAlergia: e.target.checked ? inscricaoEditando.descricaoAlergia || "" : "",
                          })
                        }
                        className="w-4 h-4 rounded text-rose-600"
                      />
                      <span>Possui Alergia</span>
                    </label>
                    {inscricaoEditando.possuiAlergia && (
                      <input
                        type="text"
                        placeholder="Ex: Amendoim, Dipirona..."
                        value={inscricaoEditando.descricaoAlergia || ""}
                        onChange={(e) =>
                          setInscricaoEditando({ ...inscricaoEditando, descricaoAlergia: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border text-xs"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold block text-neutral-600 dark:text-neutral-400">Intolerâncias</span>
                    <div className="flex gap-4 pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(inscricaoEditando.intoleranciaGluten)}
                          onChange={(e) =>
                            setInscricaoEditando({ ...inscricaoEditando, intoleranciaGluten: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-amber-600"
                        />
                        <span>Glúten</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(inscricaoEditando.intoleranciaLactose)}
                          onChange={(e) =>
                            setInscricaoEditando({ ...inscricaoEditando, intoleranciaLactose: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-amber-600"
                        />
                        <span>Lactose</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inscricaoEditando.usaRemedioContinuo)}
                      onChange={(e) =>
                        setInscricaoEditando({
                          ...inscricaoEditando,
                          usaRemedioContinuo: e.target.checked,
                          descricaoRemedioContinuo: e.target.checked
                            ? inscricaoEditando.descricaoRemedioContinuo || ""
                            : "",
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Uso de Remédio Contínuo</span>
                  </label>
                  {inscricaoEditando.usaRemedioContinuo && (
                    <input
                      type="text"
                      placeholder="Ex: Insulina 10UI manhã, Ritalina 10mg..."
                      value={inscricaoEditando.descricaoRemedioContinuo || ""}
                      onChange={(e) =>
                        setInscricaoEditando({
                          ...inscricaoEditando,
                          descricaoRemedioContinuo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Sacramentos */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-black text-[11px] uppercase tracking-wider text-blue-600 block">
                  Sacramentos Recebidos
                </span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inscricaoEditando.batismo)}
                      onChange={(e) =>
                        setInscricaoEditando({ ...inscricaoEditando, batismo: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Batismo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inscricaoEditando.primeiraEucaristia)}
                      onChange={(e) =>
                        setInscricaoEditando({
                          ...inscricaoEditando,
                          primeiraEucaristia: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>1ª Eucaristia</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inscricaoEditando.crisma)}
                      onChange={(e) =>
                        setInscricaoEditando({ ...inscricaoEditando, crisma: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Crisma</span>
                  </label>
                </div>
              </div>

              {/* Status no Grupo do WhatsApp */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(inscricaoEditando.entrouNoGrupoWhatsapp)}
                    onChange={(e) =>
                      setInscricaoEditando({
                        ...inscricaoEditando,
                        entrouNoGrupoWhatsapp: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Adicionado ao grupo do WhatsApp</span>
                </label>
                <p className="text-[11px] text-neutral-500">
                  Marque para definir como presente no grupo oficial do WhatsApp do evento.
                </p>
              </div>

              {/* Seção Camiseta */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(inscricaoEditando.pediuCamiseta)}
                    onChange={(e) =>
                      setInscricaoEditando({
                        ...inscricaoEditando,
                        pediuCamiseta: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Pediu Camiseta do Evento</span>
                </label>

                {inscricaoEditando.pediuCamiseta && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div>
                      <label className="font-bold block mb-1">Modelo</label>
                      <input
                        type="text"
                        value={inscricaoEditando.camisetaModelo || ""}
                        onChange={(e) =>
                          setInscricaoEditando({
                            ...inscricaoEditando,
                            camisetaModelo: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Tamanho</label>
                      <input
                        type="text"
                        value={inscricaoEditando.camisetaTamanho || ""}
                        onChange={(e) =>
                          setInscricaoEditando({
                            ...inscricaoEditando,
                            camisetaTamanho: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Nome Camiseta</label>
                      <input
                        type="text"
                        value={inscricaoEditando.camisetaNomePersonalizado || ""}
                        onChange={(e) =>
                          setInscricaoEditando({
                            ...inscricaoEditando,
                            camisetaNomePersonalizado: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Número Camiseta</label>
                      <input
                        type="text"
                        value={inscricaoEditando.camisetaNumeroPersonalizado || ""}
                        onChange={(e) =>
                          setInscricaoEditando({
                            ...inscricaoEditando,
                            camisetaNumeroPersonalizado: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Geral e Financeiro */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                <span className="font-black text-[11px] uppercase tracking-wider text-emerald-600 block">
                  Status & Financeiro
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Status da Inscrição</label>
                    <select
                      value={inscricaoEditando.status || "CONFIRMADA"}
                      onChange={(e) =>
                        setInscricaoEditando({ ...inscricaoEditando, status: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border font-bold"
                    >
                      <option value="CONFIRMADA">Confirmada</option>
                      <option value="PENDENTE">Pendente</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Status Pagamento</label>
                    <select
                      value={inscricaoEditando.statusPagamento || "ISENTO"}
                      onChange={(e) =>
                        setInscricaoEditando({
                          ...inscricaoEditando,
                          statusPagamento: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border font-bold"
                    >
                      <option value="ISENTO">Isento (Gratuito)</option>
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO_PARCIAL">Pago Parcial</option>
                      <option value="PAGO_TOTAL">Pago Total</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Valor Pago (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inscricaoEditando.valorPago ?? 0}
                      onChange={(e) =>
                        setInscricaoEditando({
                          ...inscricaoEditando,
                          valorPago: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={inscricaoEditando.observacao || ""}
                    onChange={(e) =>
                      setInscricaoEditando({ ...inscricaoEditando, observacao: e.target.value })
                    }
                    placeholder="Observações da coordenação sobre este participante..."
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setInscricaoEditando(null)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC72C] text-black font-black shadow"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPORTAR APENAS TELEFONES */}
      {modalExportarTelefones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base">Exportar Lista de Telefones</h3>
                  <p className="text-[11px] text-neutral-400">
                    Contatos filtrados para listas de transmissão e avisos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalExportarTelefones(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas de Seleção */}
            <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAbaTelefone("INSCRITOS")}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  abaTelefone === "INSCRITOS"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm font-black"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Inscritos ({listaTelefonesInscritos.length})
              </button>
              <button
                type="button"
                onClick={() => setAbaTelefone("RESPONSAVEIS")}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  abaTelefone === "RESPONSAVEIS"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm font-black"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Responsáveis ({listaTelefonesResponsaveis.length})
              </button>
              <button
                type="button"
                onClick={() => setAbaTelefone("MENORES")}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  abaTelefone === "MENORES"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm font-black"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Resp. Menores ({listaTelefonesMenores.length})
              </button>
            </div>

            {/* Caixa com a lista de telefones */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-medium">
                  {abaTelefone === "INSCRITOS" && `Telefones dos inscritos (${listaTelefonesInscritos.length}):`}
                  {abaTelefone === "RESPONSAVEIS" && `Telefones dos responsáveis (${listaTelefonesResponsaveis.length}):`}
                  {abaTelefone === "MENORES" && `Telefones dos responsáveis de menores de 18 anos (${listaTelefonesMenores.length}):`}
                </span>
                {copiadoTelefones && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] animate-fadeIn">
                    ✓ Copiado para a área de transferência!
                  </span>
                )}
              </div>

              <textarea
                readOnly
                rows={8}
                value={
                  abaTelefone === "INSCRITOS"
                    ? listaTelefonesInscritos.join("\n")
                    : abaTelefone === "RESPONSAVEIS"
                    ? listaTelefonesResponsaveis.join("\n")
                    : listaTelefonesMenores.join("\n")
                }
                placeholder="Nenhum telefone encontrado para esta seleção."
                className="w-full p-3 font-mono text-xs rounded-2xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none resize-none"
              />
            </div>

            {/* Ações: Copiar, Baixar TXT, Fechar */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleCopiarTelefones}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#FFC72C] text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-amber-400 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Todos</span>
              </button>

              <button
                type="button"
                onClick={handleBaixarTelefonesTxt}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar .TXT</span>
              </button>

              <button
                type="button"
                onClick={() => setModalExportarTelefones(false)}
                className="py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-bold text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA INSCRIÇÃO MANUAL (ADMIN) */}
      {modalNovaInscricao && (
        <ModalCadastroManualInscricao
          campanhas={campanhas}
          aberto={modalNovaInscricao}
          onFechar={() => setModalNovaInscricao(false)}
          onCadastrado={(nova) => {
            setInscricoes([nova, ...inscricoes]);
            setMensagemSucesso("Inscrição manual registrada com sucesso!");
            setTimeout(() => setMensagemSucesso(""), 3000);
          }}
        />
      )}
    </div>
  );
}

// SUB-COMPONENTE: CADASTRO MANUAL DE INSCRIÇÃO
function ModalCadastroManualInscricao({
  campanhas,
  aberto,
  onFechar,
  onCadastrado,
}: {
  campanhas: CampanhaItem[];
  aberto: boolean;
  onFechar: () => void;
  onCadastrado: (inscricao: any) => void;
}) {
  const [campanhaId, setCampanhaId] = useState(campanhas[0]?.id || "");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascBr, setDataNascBr] = useState("");
  const [dataNascIso, setDataNascIso] = useState<string | null>(null);
  const [sexo, setSexo] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [parentescoResponsavel, setParentescoResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
  const [possuiAlergia, setPossuiAlergia] = useState(false);
  const [descricaoAlergia, setDescricaoAlergia] = useState("");
  const [intoleranciaGluten, setIntoleranciaGluten] = useState(false);
  const [intoleranciaLactose, setIntoleranciaLactose] = useState(false);
  const [usaRemedioContinuo, setUsaRemedioContinuo] = useState(false);
  const [descricaoRemedioContinuo, setDescricaoRemedioContinuo] = useState("");
  const [batismo, setBatismo] = useState(false);
  const [primeiraEucaristia, setPrimeiraEucaristia] = useState(false);
  const [crisma, setCrisma] = useState(false);
  const [entrouNoGrupoWhatsapp, setEntrouNoGrupoWhatsapp] = useState(false);
  const [statusPag, setStatusPag] = useState("ISENTO");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  if (!aberto) return null;

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campanhaId,
          origemAdmin: true,
          nomeCompleto,
          telefone,
          cpf,
          dataNascimento: dataNascIso,
          sexo: sexo || null,
          nomeResponsavel: nomeResponsavel || null,
          parentescoResponsavel: parentescoResponsavel || null,
          telefoneResponsavel: telefoneResponsavel || null,
          possuiAlergia,
          descricaoAlergia: possuiAlergia ? descricaoAlergia : null,
          intoleranciaGluten,
          intoleranciaLactose,
          usaRemedioContinuo,
          descricaoRemedioContinuo: usaRemedioContinuo ? descricaoRemedioContinuo : null,
          batismo,
          primeiraEucaristia,
          crisma,
          entrouNoGrupoWhatsapp,
          statusPagamentoManual: statusPag,
          observacao: observacao || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onCadastrado(data.inscricao);
      onFechar();
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#111318] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-black text-base">Nova Inscrição Manual</h3>
          <button onClick={onFechar} className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold block mb-1">Evento *</label>
            <select
              value={campanhaId}
              onChange={(e) => setCampanhaId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border font-bold"
            >
              {campanhas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold block mb-1">Telefone *</label>
              <input
                type="text"
                required
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatarCpf(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold block mb-1">Data de Nascimento</label>
              <InputDataBr
                value={dataNascBr}
                onChange={(br, iso) => {
                  setDataNascBr(br);
                  setDataNascIso(iso);
                }}
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Sexo</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border font-semibold"
              >
                <option value="">Não informado</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
              </select>
            </div>
          </div>

          {/* Responsável */}
          <div className="pt-2 border-t space-y-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-500 block">
              Responsável (se menor ou informado)
            </span>
            <div>
              <label className="font-bold block mb-1">Nome do Responsável</label>
              <input
                type="text"
                value={nomeResponsavel}
                onChange={(e) => setNomeResponsavel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold block mb-1">Parentesco</label>
                <input
                  type="text"
                  placeholder="Ex: Mãe, Pai, Tio"
                  value={parentescoResponsavel}
                  onChange={(e) => setParentescoResponsavel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Tel. Responsável</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={telefoneResponsavel}
                  onChange={(e) => setTelefoneResponsavel(formatarTelefone(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
                />
              </div>
            </div>
          </div>

          {/* Saúde e Restrições */}
          <div className="pt-2 border-t space-y-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-rose-600 block">
              Saúde & Restrições
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={possuiAlergia}
                    onChange={(e) => setPossuiAlergia(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <span>Possui Alergia</span>
                </label>
                {possuiAlergia && (
                  <input
                    type="text"
                    placeholder="Descrição da alergia..."
                    value={descricaoAlergia}
                    onChange={(e) => setDescricaoAlergia(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
                  />
                )}
              </div>

              <div className="space-y-1">
                <span className="font-bold block text-neutral-500">Intolerâncias</span>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intoleranciaGluten}
                      onChange={(e) => setIntoleranciaGluten(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600"
                    />
                    <span>Glúten</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intoleranciaLactose}
                      onChange={(e) => setIntoleranciaLactose(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600"
                    />
                    <span>Lactose</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={usaRemedioContinuo}
                  onChange={(e) => setUsaRemedioContinuo(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Uso de Remédio Contínuo</span>
              </label>
              {usaRemedioContinuo && (
                <input
                  type="text"
                  placeholder="Qual remédio / dosagem..."
                  value={descricaoRemedioContinuo}
                  onChange={(e) => setDescricaoRemedioContinuo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
                />
              )}
            </div>
          </div>

          {/* Sacramentos */}
          <div className="pt-2 border-t space-y-1.5">
            <span className="font-bold text-[11px] uppercase tracking-wider text-blue-600 block">
              Sacramentos
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={batismo}
                  onChange={(e) => setBatismo(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Batismo</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={primeiraEucaristia}
                  onChange={(e) => setPrimeiraEucaristia(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>1ª Eucaristia</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={crisma}
                  onChange={(e) => setCrisma(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Crisma</span>
              </label>
            </div>
          </div>

          {/* Status do Grupo WhatsApp e Pagamento */}
          <div className="pt-2 border-t grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold block mb-1">Status de Pagamento</label>
              <select
                value={statusPag}
                onChange={(e) => setStatusPag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border font-bold"
              >
                <option value="ISENTO">Isento (Gratuito)</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO_PARCIAL">Pago Parcial</option>
                <option value="PAGO_TOTAL">Pago Total</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={entrouNoGrupoWhatsapp}
                  onChange={(e) => setEntrouNoGrupoWhatsapp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>Já está no grupo WhatsApp</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Observações Internas</label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Pagou em mãos, padrinho autorizou..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={onFechar} className="px-4 py-2 rounded-xl border font-bold">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 rounded-xl bg-[#FFC72C] text-black font-black shadow"
            >
              {salvando ? "Cadastrando..." : "Cadastrar Inscrição"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
