"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ShieldAlert,
  Users,
  Image as ImageIcon,
  Settings,
  History,
  UserPlus,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Upload,
  Sparkles,
  MessageCircle,
  KeyRound,
  Edit3,
  Palette,
  Shirt,
  PauseCircle,
  PlayCircle,
  DollarSign,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Tag,
  X,
} from "lucide-react";
import { formatarDataHora, formatarFaixaPrecos, normalizarModelos } from "@/lib/utils";
import { InputDataBr } from "@/components/ui/input-data-br";
import { ModalCampanha } from "@/components/dashboard/modal-campanha";

export interface FotoComLabel {
  url: string;
  label?: string;
}

export function AdminPanelClient() {


  const [aba, setAba] = useState<
    "IDENTIDADE" | "LIDERANCA" | "CAMISETAS" | "PAUSAS" | "BANNERS" | "USUARIOS" | "CONFIG" | "AUDITORIA"
  >("IDENTIDADE");

  // Estados de Configurações, Branding e Liderança
  const [config, setConfig] = useState<any>({
    nomeGrupo: "Grupo Jovem",
    subtituloGrupo: "Paróquia ou Comunidade",
    paroquiaNome: "Paróquia",
    logoUrl: "/assets/logo-jusc.jpeg",
    mascoteUrl: "",
    corBase: "#FFC72C",
    descricaoGrupo: "Venha participar dos nossos encontros! Um grupo de oração, amizade verdadeira, música e missão.",

    coordenadorNome: "Brunão",
    coordenadorFotoUrl: "/assets/coordenador.jpg",
    coordenadorWhatsapp: "5545999068852",
    coordenadorMensagem: "Oii, vim pelo site e queria saber mais sobre o JUSCÃO",

    secretarioNome: "Foletto",
    secretarioFotoUrl: "/assets/secretario.jpg",
    secretarioWhatsapp: "5545991179727",
    secretarioMensagem: "Oii, vim pelo site e queria marcar um encontro no JUSC",

    tesoureiroNome: "Tesoureiro",
    tesoureiroWhatsapp: "5545991179727",
    tesoureiroChavePix: "",
    tesoureiroTipoChave: "ALEATORIA",
    tesoureiroCidadePix: "Foz do Iguacu",

    enderecoPadrao: "Salinha do JUSC — Paróquia Menino Jesus (Av. Pôr do Sol, 2200, Conjunto Libra)",
    horarioPadrao: "Domingos às 17h",
    linkGoogleMaps: "https://maps.google.com/?q=Avenida+P%C3%B4r+do+Sol,+2200,+Conjunto+Libra,+Foz+do+Igua%C3%A7u+-+PR",
    instagramUrl: "https://www.instagram.com/juscpmj?stkn=MWJhbGsyd2ZidHY1Mw==",

    encontrosPausados: false,
    pausadoEm: null,
    motivoPausa: null,

    limiteMesesAlertaAusencia: 2,
    limiteMesesInativacao: 12,
  });
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Estados de Usuários
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoLogin, setNovoLogin] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoPerfil, setNovoPerfil] = useState<"ADMIN" | "COLABORADOR" | "TESOUREIRO">("COLABORADOR");
  const [criandoUsuario, setCriandoUsuario] = useState(false);
  const [excluindoUsuarioId, setExcluindoUsuarioId] = useState<string | null>(null);

  // Estados de Redefinição de Senha
  const [usuarioResetSenha, setUsuarioResetSenha] = useState<any | null>(null);
  const [novaSenhaAdmin, setNovaSenhaAdmin] = useState("");
  const [salvandoReset, setSalvandoReset] = useState(false);

  // Estados de Banners de Avisos da Home
  const [banners, setBanners] = useState<any[]>([]);
  const [tipoBanner, setTipoBanner] = useState<"ALERTA" | "EVENTO">("ALERTA");
  const [tituloBanner, setTituloBanner] = useState("");
  const [resumoBanner, setResumoBanner] = useState("");
  const [descBanner, setDescBanner] = useState("");
  const [imagemBanner, setImagemBanner] = useState("");
  const [expiracaoBanner, setExpiracaoBanner] = useState("");
  const [criandoBanner, setCriandoBanner] = useState(false);
  const [uploadingBannerImg, setUploadingBannerImg] = useState(false);

  // Estados de Edição de Banner
  const [bannerEditando, setBannerEditando] = useState<any | null>(null);
  const [salvandoEditBanner, setSalvandoEditBanner] = useState(false);
  const [uploadingEditBannerImg, setUploadingEditBannerImg] = useState(false);

  // Estados de Campanhas de Camisetas
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [modalCampanhaAberto, setModalCampanhaAberto] = useState(false);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<any | null>(null);

  // Estados de Pausas / Férias
  const [pausas, setPausas] = useState<any[]>([]);
  const [motivoPausaInput, setMotivoPausaInput] = useState("");
  const [processandoPausa, setProcessandoPausa] = useState(false);

  // Estados de Auditoria
  const [logs, setLogs] = useState<any[]>([]);

  // Feedbacks e uploads
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [uploadingCoord, setUploadingCoord] = useState(false);
  const [uploadingSec, setUploadingSec] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingMascote, setUploadingMascote] = useState(false);

  const fileInputCoordRef = useRef<HTMLInputElement>(null);
  const fileInputSecRef = useRef<HTMLInputElement>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputMascoteRef = useRef<HTMLInputElement>(null);
  const fileInputBannerRef = useRef<HTMLInputElement>(null);
  const fileInputEditBannerRef = useRef<HTMLInputElement>(null);

  // Carregar dados conforme aba
  async function carregarDados() {
    try {
      const [resConf, resAuth] = await Promise.all([
        fetch("/api/admin/configuracoes"),
        fetch("/api/auth/me"),
      ]);

      if (resAuth.ok) {
        const authData = await resAuth.json();
        setUsuarioLogado(authData.usuario);
      }

      if (resConf.ok) {
        const d = await resConf.json();
        if (d.config) setConfig(d.config);
      }

      if (aba === "USUARIOS") {
        const res = await fetch("/api/admin/usuarios");
        if (res.ok) {
          const d = await res.json();
          setUsuarios(d.usuarios || []);
        }
      } else if (aba === "BANNERS") {
        const res = await fetch("/api/admin/banners");
        if (res.ok) {
          const d = await res.json();
          setBanners(d.banners || []);
        }
      } else if (aba === "CAMISETAS") {
        const res = await fetch("/api/campanhas?todas=true");
        if (res.ok) {
          const d = await res.json();
          setCampanhas(d.campanhas || []);
        }
      } else if (aba === "PAUSAS") {
        const res = await fetch("/api/admin/pausas");
        if (res.ok) {
          const d = await res.json();
          setPausas(d.pausas || []);
          if (d.encontrosPausados !== undefined) {
            setConfig((prev: any) => ({
              ...prev,
              encontrosPausados: d.encontrosPausados,
              pausadoEm: d.pausadoEm,
              motivoPausa: d.motivoPausa,
            }));
          }
        }
      } else if (aba === "AUDITORIA") {
        const res = await fetch("/api/admin/auditoria");
        if (res.ok) {
          const d = await res.json();
          setLogs(d.logs || []);
        }
      }
    } catch {
      // Falha ao carregar dados da aba
    }
  }

  useEffect(() => {
    carregarDados();
  }, [aba]);

  function dispararSucesso(msg: string) {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(null), 4000);
  }

  function dispararErro(msg: string) {
    setMensagemErro(msg);
    setTimeout(() => setMensagemErro(null), 5000);
  }

  // Upload genérico de imagens
  async function handleUploadImagem(file: File, tipo: "coord" | "sec" | "logo" | "mascote") {
    const formData = new FormData();
    formData.append("file", file);

    if (tipo === "coord") setUploadingCoord(true);
    else if (tipo === "sec") setUploadingSec(true);
    else if (tipo === "logo") setUploadingLogo(true);
    else if (tipo === "mascote") setUploadingMascote(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        if (tipo === "coord") {
          setConfig((prev: any) => ({ ...prev, coordenadorFotoUrl: data.url }));
        } else if (tipo === "sec") {
          setConfig((prev: any) => ({ ...prev, secretarioFotoUrl: data.url }));
        } else if (tipo === "logo") {
          setConfig((prev: any) => ({ ...prev, logoUrl: data.url }));
        } else if (tipo === "mascote") {
          setConfig((prev: any) => ({ ...prev, mascoteUrl: data.url }));
        }
        dispararSucesso("Imagem carregada com sucesso! Clique em salvar.");
      } else {
        dispararErro(data.error || "Erro ao carregar imagem.");
      }
    } catch {
      dispararErro("Erro de conexão no upload da imagem.");
    } finally {
      setUploadingCoord(false);
      setUploadingSec(false);
      setUploadingLogo(false);
      setUploadingMascote(false);
    }
  }

  function abrirCriarCampanha() {
    setCampanhaSelecionada(null);
    setModalCampanhaAberto(true);
  }

  function abrirEdicaoCampanha(camp: any) {
    setCampanhaSelecionada(camp);
    setModalCampanhaAberto(true);
  }

  // Salvar Configurações Gerais
  async function handleSalvarConfig(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoConfig(true);
    try {
      const res = await fetch("/api/admin/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        dispararSucesso("Configurações atualizadas com sucesso!");
      } else {
        dispararErro("Erro ao salvar configurações.");
      }
    } catch {
      dispararErro("Falha de conexão ao salvar.");
    } finally {
      setSalvandoConfig(false);
    }
  }

  // Pausar / Retomar Encontros
  async function handleAcaoPausa(acao: "PAUSAR" | "RETOMAR") {
    setProcessandoPausa(true);
    try {
      const res = await fetch("/api/admin/pausas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao,
          motivo: motivoPausaInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        dispararSucesso(
          acao === "PAUSAR"
            ? "Encontros pausados com sucesso! As ausências foram congeladas."
            : "Encontros retomados com sucesso!"
        );
        setMotivoPausaInput("");
        carregarDados();
      } else {
        dispararErro(data.error || "Erro ao atualizar pausa dos encontros.");
      }
    } catch {
      dispararErro("Erro de conexão ao processar pausa.");
    } finally {
      setProcessandoPausa(false);
    }
  }

  async function alternarStatusCampanha(id: string, ativaAtual: boolean) {
    try {
      const res = await fetch(`/api/campanhas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativa: !ativaAtual }),
      });
      if (res.ok) {
        dispararSucesso("Status da campanha atualizado.");
        carregarDados();
      }
    } catch {
      dispararErro("Erro ao alterar campanha.");
    }
  }

  async function excluirCampanha(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta campanha e seus pedidos?")) return;
    try {
      const res = await fetch(`/api/campanhas/${id}`, { method: "DELETE" });
      if (res.ok) {
        dispararSucesso("Campanha excluída com sucesso.");
        carregarDados();
      }
    } catch {
      dispararErro("Erro ao excluir campanha.");
    }
  }

  // Ações de Usuário
  async function handleCriarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setCriandoUsuario(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoNome,
          login: novoLogin,
          email: novoEmail || undefined,
          senha: novaSenha,
          perfil: novoPerfil,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNovoNome("");
        setNovoLogin("");
        setNovoEmail("");
        setNovaSenha("");
        dispararSucesso("Usuário criado com sucesso!");
        carregarDados();
      } else {
        dispararErro(data.error || "Erro ao criar usuário.");
      }
    } catch {
      dispararErro("Erro de conexão ao criar usuário.");
    } finally {
      setCriandoUsuario(false);
    }
  }

  async function alternarStatusUsuario(id: string, statusAtual: string) {
    try {
      const novoStatus = statusAtual === "ATIVO" ? "INATIVO" : "ATIVO";
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) {
        dispararSucesso(`Usuário ${novoStatus === "ATIVO" ? "ativado" : "desativado"}.`);
        carregarDados();
      }
    } catch {
      dispararErro("Falha ao alterar status do usuário.");
    }
  }

  async function handleRedefinirSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioResetSenha) return;
    if (novaSenhaAdmin.trim().length < 6) {
      dispararErro("A senha provisória deve ter no mínimo 6 caracteres.");
      return;
    }
    setSalvandoReset(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuarioResetSenha.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novaSenha: novaSenhaAdmin.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        dispararSucesso(`Senha de @${usuarioResetSenha.login} redefinida!`);
        setUsuarioResetSenha(null);
        setNovaSenhaAdmin("");
        carregarDados();
      } else {
        dispararErro(data.error || "Erro ao redefinir senha do usuário.");
      }
    } catch {
      dispararErro("Erro de conexão ao redefinir senha.");
    } finally {
      setSalvandoReset(false);
    }
  }

  async function handleExcluirUsuario(u: any) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${u.nome}" (@${u.login})? Esta ação é irreversível e apenas administradores podem executá-la.`)) {
      return;
    }

    setExcluindoUsuarioId(u.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        dispararSucesso(`Usuário "${u.nome}" excluído com sucesso.`);
        carregarDados();
      } else {
        dispararErro(data.error || "Erro ao excluir usuário.");
      }
    } catch {
      dispararErro("Erro de conexão ao excluir usuário.");
    } finally {
      setExcluindoUsuarioId(null);
    }
  }

  // Ações de Banner
  async function handleCriarBanner(e: React.FormEvent) {
    e.preventDefault();
    setCriandoBanner(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoBanner,
          titulo: tituloBanner,
          resumo: resumoBanner,
          descricaoCompleta: descBanner,
          imagemUrl: imagemBanner,
          dataExpiracao: expiracaoBanner,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTituloBanner("");
        setResumoBanner("");
        setDescBanner("");
        setImagemBanner("");
        setExpiracaoBanner("");
        dispararSucesso("Banner criado com sucesso!");
        carregarDados();
      } else {
        dispararErro(data.error || "Erro ao criar banner.");
      }
    } catch {
      dispararErro("Erro de conexão ao criar banner.");
    } finally {
      setCriandoBanner(false);
    }
  }

  async function handleUploadBannerImg(file: File, isEdit: boolean = false) {
    const formData = new FormData();
    formData.append("file", file);

    if (isEdit) setUploadingEditBannerImg(true);
    else setUploadingBannerImg(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (isEdit) {
          setBannerEditando((prev: any) => ({ ...prev, imagemUrl: data.url }));
        } else {
          setImagemBanner(data.url);
        }
        dispararSucesso("Imagem carregada com sucesso!");
      } else {
        dispararErro(data.error || "Erro ao carregar imagem.");
      }
    } catch {
      dispararErro("Erro de conexão ao enviar imagem.");
    } finally {
      if (isEdit) setUploadingEditBannerImg(false);
      else setUploadingBannerImg(false);
    }
  }

  function abrirEdicaoBanner(banner: any) {
    const d = new Date(banner.dataExpiracao);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const expiracaoFmt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setBannerEditando({
      ...banner,
      dataExpiracaoInput: expiracaoFmt,
    });
  }

  async function handleSalvarEdicaoBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!bannerEditando) return;

    setSalvandoEditBanner(true);
    try {
      const res = await fetch(`/api/admin/banners/${bannerEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: bannerEditando.titulo,
          resumo: bannerEditando.resumo,
          descricaoCompleta: bannerEditando.descricaoCompleta,
          imagemUrl: bannerEditando.imagemUrl || null,
          dataExpiracao: bannerEditando.dataExpiracaoInput
            ? new Date(bannerEditando.dataExpiracaoInput).toISOString()
            : undefined,
          ativo: bannerEditando.ativo,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispararSucesso("Banner atualizado com sucesso!");
        setBannerEditando(null);
        carregarDados();
      } else {
        dispararErro(data.error || "Erro ao atualizar banner.");
      }
    } catch {
      dispararErro("Erro de conexão ao atualizar banner.");
    } finally {
      setSalvandoEditBanner(false);
    }
  }

  async function alternarAtivoBanner(id: string, ativoAtual: boolean) {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativoAtual }),
      });
      if (res.ok) {
        carregarDados();
      }
    } catch {
      dispararErro("Erro ao alterar banner.");
    }
  }

  async function excluirBanner(id: string) {
    if (!confirm("Tem certeza que deseja excluir este banner permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        dispararSucesso("Banner excluído com sucesso.");
        carregarDados();
      }
    } catch {
      dispararErro("Erro ao excluir banner.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#FFC72C]" />
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Painel de Administração
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Identidade visual do grupo, coordenação, campanhas de camisetas, pausas de encontros e usuários
        </p>
      </div>

      {/* Feedbacks */}
      {mensagemSucesso && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}
      {mensagemErro && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="flex flex-wrap items-center gap-1.5 bg-neutral-200/70 dark:bg-[#15171e] p-1.5 rounded-2xl border border-neutral-300/60 dark:border-neutral-800">
        <button
          onClick={() => setAba("IDENTIDADE")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            aba === "IDENTIDADE"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Palette className="w-4 h-4" />
          Identidade & Replicação
        </button>

        <button
          onClick={() => setAba("LIDERANCA")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            aba === "LIDERANCA"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Coordenação & Tesouraria
        </button>

        <button
          onClick={() => setAba("CAMISETAS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            aba === "CAMISETAS"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Shirt className="w-4 h-4" />
          Camisetas & Pedidos
        </button>

        <button
          onClick={() => setAba("PAUSAS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            aba === "PAUSAS"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <PauseCircle className="w-4 h-4" />
          Pausar Encontros (Férias)
        </button>

        <button
          onClick={() => setAba("BANNERS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            aba === "BANNERS"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Banners da Home
        </button>

        <button
          onClick={() => setAba("USUARIOS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            aba === "USUARIOS"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários
        </button>

        <button
          onClick={() => setAba("CONFIG")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            aba === "CONFIG"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          Regras de Ausência
        </button>

        <button
          onClick={() => setAba("AUDITORIA")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            aba === "AUDITORIA"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          Auditoria
        </button>
      </div>

      {/* ABA 1: IDENTIDADE VISUAL & REPLICAÇÃO DO PROJETO */}
      {aba === "IDENTIDADE" && (
        <form onSubmit={handleSalvarConfig} className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-neutral-700 dark:text-neutral-300">
            <strong>Replicação por outros grupos e paróquias:</strong> Configure aqui o logotipo, o mascote, a cor base e os textos institucionais. O sistema se adaptará automaticamente a qualquer grupo jovem ou pastoral!
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo do Grupo */}
            <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#FFC72C]" />
                Logotipo do Grupo
              </h3>

              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-neutral-100 border-2 border-[#FFC72C] flex-shrink-0 shadow-sm">
                  {config.logoUrl ? (
                    <Image src={config.logoUrl} alt="Logo" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                      Sem logo
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputLogoRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleUploadImagem(e.target.files[0], "logo");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputLogoRef.current?.click()}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingLogo ? "Enviando..." : "Trocar Logotipo"}
                  </button>
                  <p className="text-[11px] text-neutral-500">
                    Aparece no cabeçalho e rodapé do site.
                  </p>
                </div>
              </div>
            </div>

            {/* Mascote do Grupo */}
            <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFC72C]" />
                Mascote do Grupo (Fundo transparente)
              </h3>

              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-dashed border-[#FFC72C]/40 flex items-center justify-center flex-shrink-0">
                  {config.mascoteUrl ? (
                    <Image src={config.mascoteUrl} alt="Mascote" fill className="object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                      Sem mascote
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputMascoteRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleUploadImagem(e.target.files[0], "mascote");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputMascoteRef.current?.click()}
                    disabled={uploadingMascote}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingMascote ? "Enviando..." : "Trocar Mascote"}
                  </button>
                  <p className="text-[11px] text-neutral-500">
                    Aparece no topo da página inicial e estados vazios (PNG transparente recomendado).
                  </p>
                </div>
              </div>
            </div>

            {/* Paleta Dinâmica do Grupo (1 a 3 cores de base) */}
            <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#FFC72C]" />
                    Paleta de Cores do Grupo (1 a 3 Cores Base)
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Defina as cores características da sua pastoral ou grupo para aplicar em todo o sistema.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      corBase: "#FFC72C",
                      corSecundaria: "#d97706",
                      corDestaque: "#f59e0b",
                    })
                  }
                  className="px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-colors self-start sm:self-auto"
                >
                  Restaurar Amarelo JUSC
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Cor 1: Primária */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                      1. Cor Principal (Botões e Destaques)
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: config.corBase || "#FFC72C" }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.corBase || "#FFC72C"}
                      onChange={(e) => setConfig({ ...config, corBase: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.corBase || "#FFC72C"}
                      onChange={(e) => setConfig({ ...config, corBase: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Cor 2: Secundária */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                      2. Cor Secundária (Bordas e Tons Escuros)
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: config.corSecundaria || "#d97706" }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.corSecundaria || "#d97706"}
                      onChange={(e) => setConfig({ ...config, corSecundaria: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.corSecundaria || "#d97706"}
                      onChange={(e) => setConfig({ ...config, corSecundaria: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Cor 3: Destaque / Apoio */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                      3. Cor de Destaque (Gradientes e Badges)
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ backgroundColor: config.corDestaque || "#f59e0b" }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.corDestaque || "#f59e0b"}
                      onChange={(e) => setConfig({ ...config, corDestaque: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.corDestaque || "#f59e0b"}
                      onChange={(e) => setConfig({ ...config, corDestaque: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#15171e] border border-neutral-300 dark:border-neutral-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nome do Grupo e Paróquia */}
            <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FFC72C]" />
                Nomes & Identificação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Sigla / Nome do Grupo *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.nomeGrupo || ""}
                    onChange={(e) => setConfig({ ...config, nomeGrupo: e.target.value })}
                    placeholder="Ex.: JUSC"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Paróquia / Comunidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.paroquiaNome || ""}
                    onChange={(e) => setConfig({ ...config, paroquiaNome: e.target.value })}
                    placeholder="Ex.: Paróquia Menino Jesus"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Significado da Sigla / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={config.subtituloGrupo || ""}
                    onChange={(e) => setConfig({ ...config, subtituloGrupo: e.target.value })}
                    placeholder="Ex.: Jovens Unidos Seguindo Cristo"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mensagem de Boas-Vindas da Home
                  </label>
                  <textarea
                    rows={2}
                    value={config.descricaoGrupo || ""}
                    onChange={(e) => setConfig({ ...config, descricaoGrupo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Endereço, Horário e Redes Sociais */}
            <div className="lg:col-span-2 bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFC72C]" />
                Encontros, Endereço e Redes Sociais
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Horário Padrão dos Encontros *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.horarioPadrao || ""}
                    onChange={(e) => setConfig({ ...config, horarioPadrao: e.target.value })}
                    placeholder="Ex.: Domingos às 17h"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Endereço Completo / Local *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.enderecoPadrao || ""}
                    onChange={(e) => setConfig({ ...config, enderecoPadrao: e.target.value })}
                    placeholder="Ex.: Salinha do JUSC — Paróquia Menino Jesus"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Link do Google Maps
                  </label>
                  <input
                    type="text"
                    value={config.linkGoogleMaps || ""}
                    onChange={(e) => setConfig({ ...config, linkGoogleMaps: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Link do Instagram do Grupo
                  </label>
                  <input
                    type="text"
                    value={config.instagramUrl || ""}
                    onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvandoConfig}
              className="px-8 py-3 rounded-2xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {salvandoConfig ? "Salvando..." : "Salvar Identidade & Replicação"}
            </button>
          </div>
        </form>
      )}

      {/* ABA 2: COORDENAÇÃO & TESOURARIA */}
      {aba === "LIDERANCA" && (
        <form onSubmit={handleSalvarConfig} className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-neutral-700 dark:text-neutral-300">
            <strong>Coordenação Anual & Dados da Tesouraria:</strong> Os dados do Coordenador e Secretário aparecem nos banners da página inicial pública. Já os dados do Tesoureiro são confidenciais e utilizados para receber pagamentos PIX e comprovantes.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card Coordenador */}
            <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border-2 border-amber-300 dark:border-amber-800/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-black text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FFC72C] text-black text-xs font-black">
                    COORDENADOR
                  </span>
                  {config.coordenadorNome}
                </h3>
              </div>

              {/* Preview e Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 border-2 border-amber-300 flex-shrink-0 shadow-sm">
                  {config.coordenadorFotoUrl ? (
                    <Image src={config.coordenadorFotoUrl} alt="Coordenador" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputCoordRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleUploadImagem(e.target.files[0], "coord");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputCoordRef.current?.click()}
                    disabled={uploadingCoord}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingCoord ? "Enviando..." : "Trocar Foto"}
                  </button>
                  <p className="text-[11px] text-neutral-500">Foto do coordenador atual.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nome do Coordenador *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.coordenadorNome}
                    onChange={(e) => setConfig({ ...config, coordenadorNome: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    WhatsApp do Coordenador * (somente números com DDD)
                  </label>
                  <input
                    type="text"
                    required
                    value={config.coordenadorWhatsapp}
                    onChange={(e) => setConfig({ ...config, coordenadorWhatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mensagem Padrão do WhatsApp
                  </label>
                  <input
                    type="text"
                    value={config.coordenadorMensagem}
                    onChange={(e) => setConfig({ ...config, coordenadorMensagem: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Card Secretário */}
            <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border-2 border-amber-300 dark:border-amber-800/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-black text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FFC72C] text-black text-xs font-black">
                    SECRETÁRIO
                  </span>
                  {config.secretarioNome}
                </h3>
              </div>

              {/* Preview e Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 border-2 border-amber-300 flex-shrink-0 shadow-sm">
                  {config.secretarioFotoUrl ? (
                    <Image src={config.secretarioFotoUrl} alt="Secretário" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputSecRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleUploadImagem(e.target.files[0], "sec");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputSecRef.current?.click()}
                    disabled={uploadingSec}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingSec ? "Enviando..." : "Trocar Foto"}
                  </button>
                  <p className="text-[11px] text-neutral-500">Foto do secretário atual.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nome do Secretário *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.secretarioNome}
                    onChange={(e) => setConfig({ ...config, secretarioNome: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    WhatsApp do Secretário * (somente números com DDD)
                  </label>
                  <input
                    type="text"
                    required
                    value={config.secretarioWhatsapp}
                    onChange={(e) => setConfig({ ...config, secretarioWhatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mensagem Padrão do WhatsApp
                  </label>
                  <input
                    type="text"
                    value={config.secretarioMensagem}
                    onChange={(e) => setConfig({ ...config, secretarioMensagem: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Card Tesouraria & Checkout Pix (Confidencial) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#15171e] rounded-3xl p-6 border-2 border-emerald-400 dark:border-emerald-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-black text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-white text-xs font-black">
                    TESOURARIA & PIX
                  </span>
                  Dados de Pagamento dos Pedidos
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  🔒 Confidencial (Não exibido na tela inicial)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-neutral-700 dark:text-neutral-300">
                Estes dados são utilizados exclusivamente para gerar o <strong>Pix Copia e Cola</strong> ao finalizar pedidos de camisetas e para gerar o link direto de envio do comprovante para o WhatsApp do tesoureiro.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nome do Tesoureiro *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.tesoureiroNome || ""}
                    onChange={(e) => setConfig({ ...config, tesoureiroNome: e.target.value })}
                    placeholder="Ex.: Foletto"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    WhatsApp do Tesoureiro * (com DDD)
                  </label>
                  <input
                    type="text"
                    required
                    value={config.tesoureiroWhatsapp || ""}
                    onChange={(e) => setConfig({ ...config, tesoureiroWhatsapp: e.target.value })}
                    placeholder="5545991179727"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Chave PIX da Tesouraria *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.tesoureiroChavePix || ""}
                    onChange={(e) => setConfig({ ...config, tesoureiroChavePix: e.target.value })}
                    placeholder="Ex.: 45991179727 ou chave aleatória"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Cidade do Titular Pix *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.tesoureiroCidadePix || ""}
                    onChange={(e) => setConfig({ ...config, tesoureiroCidadePix: e.target.value })}
                    placeholder="Ex.: Foz do Iguacu"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvandoConfig}
              className="px-8 py-3 rounded-2xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {salvandoConfig ? "Salvando..." : "Salvar Coordenação & Tesouraria"}
            </button>
          </div>
        </form>
      )}

      {/* ABA 3: CAMISETAS & PEDIDOS */}
      {aba === "CAMISETAS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header da Aba com Botão para Lançar Novo Pedido / Campanha */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-black text-neutral-900 dark:text-white">
                  Campanhas de Camisetas & Lançamento de Pedidos
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Cadastre ou edite campanhas com modelos, fotos, tabela de medidas e tamanhos dinâmicos.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirCriarCampanha}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Campanha / Lançar Pedido</span>
            </button>
          </div>

          {/* Listagem de Campanhas Existentes */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Campanhas Cadastradas ({campanhas.length})
            </h2>

            {campanhas.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">Nenhuma campanha de camisetas cadastrada.</p>
            ) : (
              <div className="space-y-4">
                {campanhas.map((camp) => {
                  const primeiraFoto = camp.fotos?.[0];
                  const urlFoto = typeof primeiraFoto === "object" && primeiraFoto ? primeiraFoto.url : primeiraFoto;
                  const modelosLista = normalizarModelos(camp.modelos, camp.precoUnitario);

                  return (
                    <div
                      key={camp.id}
                      className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {urlFoto ? (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-400 flex-shrink-0">
                            <Image src={urlFoto} alt={camp.titulo} fill unoptimized className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 flex-shrink-0">
                            Sem foto
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                camp.expirada
                                  ? "bg-neutral-200 text-neutral-600"
                                  : camp.ativa
                                  ? "bg-emerald-500 text-white"
                                  : "bg-neutral-200 text-neutral-600"
                              }`}
                            >
                              {camp.expirada ? "Expirada (oculta)" : camp.ativa ? "Ativa na Home" : "Pausada"}
                            </span>
                            <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                              {formatarFaixaPrecos(camp.modelos, camp.precoUnitario)}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white truncate">
                            {camp.titulo}
                          </h4>
                          <p className="text-neutral-500 truncate">
                            Modelos: {modelosLista.map((m) => m.nome).join(", ")}
                          </p>
                          <p className="text-neutral-500 truncate">
                            Tamanhos: {camp.tamanhosDisponiveis?.join(", ") || "—"}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            Disponível até: {formatarDataHora(camp.dataFim)} • {camp._count?.pedidos || 0} pedido(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => abrirEdicaoCampanha(camp)}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alternarStatusCampanha(camp.id, camp.ativa)}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                        >
                          {camp.ativa ? "Pausar" : "Ativar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => excluirCampanha(camp.id)}
                          className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Excluir campanha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Unificado de Criação e Edição de Campanha */}
          <ModalCampanha
            aberto={modalCampanhaAberto}
            onFechar={() => setModalCampanhaAberto(false)}
            campanha={campanhaSelecionada}
            onSalvo={async () => {
              dispararSucesso(
                campanhaSelecionada
                  ? "Campanha atualizada com sucesso!"
                  : "Campanha lançada com sucesso!"
              );
              await carregarDados();
            }}
            onErro={(msg) => dispararErro(msg)}
          />
        </div>
      )}

      {/* ABA 4: PAUSAS DOS ENCONTROS (FÉRIAS / RECESSO) */}
      {aba === "PAUSAS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Card de Controle da Pausa Atual */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <PauseCircle className="w-5 h-5 text-amber-500" />
                  Pausar Encontros (Férias Pastorais / Recesso)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Quando o grupo entra em férias ou recesso, pause os encontros para congelar o cálculo de ausência e evitar que os jovens sejam inativados indevidamente.
                </p>
              </div>

              <div>
                {config.encontrosPausados ? (
                  <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-300 flex items-center gap-1.5">
                    <PauseCircle className="w-4 h-4 text-amber-600" />
                    EM RECESSO PASTORAL
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4 text-emerald-600" />
                    EM ATIVIDADE NORMAL
                  </span>
                )}
              </div>
            </div>

            {config.encontrosPausados ? (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
                      Os encontros estão pausados atualmente
                    </h4>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300 mt-1">
                      Motivo registrado: <strong>&quot;{config.motivoPausa || "Férias"}&quot;</strong>
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      Pausado desde: {formatarDataHora(config.pausadoEm)}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={processandoPausa}
                    onClick={() => handleAcaoPausa("RETOMAR")}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {processandoPausa ? "Processando..." : "Retomar Encontros Agora"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Motivo da Pausa / Recesso (opcional)
                  </label>
                  <input
                    type="text"
                    value={motivoPausaInput}
                    onChange={(e) => setMotivoPausaInput(e.target.value)}
                    placeholder="Ex.: Férias de fim de ano, Recesso pastoral de Julho..."
                    className="w-full sm:w-96 px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium"
                  />
                </div>

                <button
                  type="button"
                  disabled={processandoPausa}
                  onClick={() => handleAcaoPausa("PAUSAR")}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <PauseCircle className="w-4 h-4" />
                  {processandoPausa ? "Processando..." : "Pausar Encontros Agora (Congelar Ausências)"}
                </button>
              </div>
            )}
          </div>

          {/* Histórico de Pausas */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Histórico de Pausas e Recessos
            </h3>

            {pausas.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">Nenhum registro histórico de pausas.</p>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {pausas.map((p) => (
                  <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {p.motivo}
                      </span>
                      <p className="text-neutral-500 text-[11px] mt-0.5">
                        Início: {formatarDataHora(p.dataInicio)} •{" "}
                        {p.dataFim ? `Término: ${formatarDataHora(p.dataFim)}` : "Ativa no momento"}
                      </p>
                    </div>
                    <div>
                      {p.dataFim ? (
                        <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 text-[10px] font-bold">
                          Encerrada
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Ativa
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 5: BANNERS & AVISOS */}
      {aba === "BANNERS" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Publicar Novo Banner / Comunicado
            </h2>

            <form onSubmit={handleCriarBanner} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tipo de Banner *
                  </label>
                  <select
                    value={tipoBanner}
                    onChange={(e: any) => setTipoBanner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  >
                    <option value="ALERTA">⚠️ Alerta Vermelho (Urgente - topo máximo)</option>
                    <option value="EVENTO">⭐ Evento / Ação (Amarelo comunitário)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Data de Expiração * (DD/MM/AAAA)
                  </label>
                  <div className="flex items-center gap-2">
                    <InputDataBr
                      value={expiracaoBanner ? expiracaoBanner.slice(0, 10) : ""}
                      onChange={(br, iso) => {
                        const hora = expiracaoBanner.includes("T") ? expiracaoBanner.split("T")[1] : "23:59";
                        setExpiracaoBanner(iso ? `${iso}T${hora}` : "");
                      }}
                      placeholder="DD/MM/AAAA"
                      required
                    />
                    <input
                      type="time"
                      value={expiracaoBanner.includes("T") ? expiracaoBanner.split("T")[1].slice(0, 5) : "23:59"}
                      onChange={(e) => {
                        const dataBase = expiracaoBanner.includes("T") ? expiracaoBanner.split("T")[0] : new Date().toISOString().slice(0, 10);
                        setExpiracaoBanner(`${dataBase}T${e.target.value}`);
                      }}
                      className="w-24 px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>


                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Título Curto *
                  </label>
                  <input
                    type="text"
                    required
                    value={tituloBanner}
                    onChange={(e) => setTituloBanner(e.target.value)}
                    placeholder="Ex.: Não haverá encontro neste domingo (14/09)"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Resumo / Justificativa Resumida *
                  </label>
                  <input
                    type="text"
                    required
                    value={resumoBanner}
                    onChange={(e) => setResumoBanner(e.target.value)}
                    placeholder="Ex.: Devido à celebração do Sacramento do Crisma na Matriz."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Descrição Completa * (Ao clicar/expandir)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={descBanner}
                    onChange={(e) => setDescBanner(e.target.value)}
                    placeholder="Detalhe o comunicado para os jovens e famílias..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Imagem do Banner (opcional — aparece em ambos os banners vermelho e amarelo)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputBannerRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUploadBannerImg(e.target.files[0], false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputBannerRef.current?.click()}
                      disabled={uploadingBannerImg}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#FFC72C]" />
                      {uploadingBannerImg ? "Enviando Imagem..." : imagemBanner ? "Trocar Imagem" : "Fazer Upload de Imagem"}
                    </button>
                    {imagemBanner && (
                      <button
                        type="button"
                        onClick={() => setImagemBanner("")}
                        className="text-xs text-red-500 hover:underline font-semibold"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                  {imagemBanner && (
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-amber-300 dark:border-amber-700 mt-2">
                      <Image src={imagemBanner} alt="Preview" fill unoptimized className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={criandoBanner}
                  className="px-5 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs shadow-sm transition-all"
                >
                  {criandoBanner ? "Publicando..." : "Publicar Banner"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Banners Existentes ({banners.length})
            </h2>

            {banners.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">Nenhum aviso publicado no momento.</p>
            ) : (
              <div className="space-y-3">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            b.tipo === "ALERTA"
                              ? "bg-red-500 text-white"
                              : "bg-[#FFC72C] text-black"
                          }`}
                        >
                          {b.tipo}
                        </span>
                        {b.expirado ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-500">
                            Expirado (oculto)
                          </span>
                        ) : b.ativo ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Visível na Home
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-600">
                            Pausado
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                        {b.titulo}
                      </h4>
                      <p className="text-neutral-500">{b.resumo}</p>
                      <p className="text-[11px] text-neutral-400">
                        Expira em: {formatarDataHora(b.dataExpiracao)} • Criado por: {b.criadoPor?.nome}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => abrirEdicaoBanner(b)}
                        className="px-3 py-1.5 rounded-xl bg-[#FFC72C]/20 text-neutral-950 dark:text-[#FFC72C] hover:bg-[#FFC72C]/30 font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => alternarAtivoBanner(b.id, b.ativo)}
                        className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {b.ativo ? "Pausar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => excluirBanner(b.id)}
                        className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Excluir Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Edição Banner */}
          {bannerEditando && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
                <h2 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#FFC72C]" />
                  Editar Banner ({bannerEditando.tipo})
                </h2>

                <form onSubmit={handleSalvarEdicaoBanner} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerEditando.titulo}
                      onChange={(e) =>
                        setBannerEditando({ ...bannerEditando, titulo: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Resumo *
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerEditando.resumo}
                      onChange={(e) =>
                        setBannerEditando({ ...bannerEditando, resumo: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Descrição Completa *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={bannerEditando.descricaoCompleta}
                      onChange={(e) =>
                        setBannerEditando({
                          ...bannerEditando,
                          descricaoCompleta: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>

                  {/* Imagem do Banner em Edição */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Foto do Banner (opcional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputEditBannerRef}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleUploadBannerImg(e.target.files[0], true);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputEditBannerRef.current?.click()}
                        disabled={uploadingEditBannerImg}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-900 dark:text-white transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#FFC72C]" />
                        {uploadingEditBannerImg
                          ? "Enviando Imagem..."
                          : bannerEditando.imagemUrl
                          ? "Trocar Imagem"
                          : "Adicionar Imagem"}
                      </button>
                      {bannerEditando.imagemUrl && (
                        <button
                          type="button"
                          onClick={() => setBannerEditando({ ...bannerEditando, imagemUrl: null })}
                          className="text-xs text-red-500 hover:underline font-semibold"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                    {bannerEditando.imagemUrl && (
                      <div className="relative w-36 h-20 rounded-xl overflow-hidden border border-amber-300 dark:border-amber-700 mt-2">
                        <Image src={bannerEditando.imagemUrl} alt="Preview Banner" fill unoptimized className="object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Data de Expiração (DD/MM/AAAA)
                    </label>
                    <div className="flex items-center gap-2">
                      <InputDataBr
                        value={bannerEditando.dataExpiracaoInput ? bannerEditando.dataExpiracaoInput.slice(0, 10) : ""}
                        onChange={(br, iso) => {
                          const hora = bannerEditando.dataExpiracaoInput?.includes("T")
                            ? bannerEditando.dataExpiracaoInput.split("T")[1]
                            : "23:59";
                          setBannerEditando({
                            ...bannerEditando,
                            dataExpiracaoInput: iso ? `${iso}T${hora}` : "",
                          });
                        }}
                        placeholder="DD/MM/AAAA"
                        required
                      />
                      <input
                        type="time"
                        value={
                          bannerEditando.dataExpiracaoInput?.includes("T")
                            ? bannerEditando.dataExpiracaoInput.split("T")[1].slice(0, 5)
                            : "23:59"
                        }
                        onChange={(e) => {
                          const dataBase = bannerEditando.dataExpiracaoInput?.includes("T")
                            ? bannerEditando.dataExpiracaoInput.split("T")[0]
                            : new Date().toISOString().slice(0, 10);
                          setBannerEditando({
                            ...bannerEditando,
                            dataExpiracaoInput: `${dataBase}T${e.target.value}`,
                          });
                        }}
                        className="w-24 px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                      />
                    </div>
                  </div>


                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBannerEditando(null)}
                      className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvandoEditBanner}
                      className="px-5 py-2 rounded-xl bg-[#FFC72C] text-neutral-950 font-black text-xs shadow-sm"
                    >
                      {salvandoEditBanner ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 6: USUÁRIOS (COM PERFIL TESOUREIRO) */}
      {aba === "USUARIOS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Formulário Novo Usuário */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Criar Novo Usuário de Acesso
            </h2>

            <form onSubmit={handleCriarUsuario} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex.: Lucas Tesoureiro"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Login / Usuário de Acesso * (único)
                  </label>
                  <input
                    type="text"
                    required
                    value={novoLogin}
                    onChange={(e) => setNovoLogin(e.target.value)}
                    placeholder="Ex.: lucas.tesouraria"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="lucas@exemplo.com"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Senha Provisória * (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Perfil de Acesso *
                  </label>
                  <select
                    value={novoPerfil}
                    onChange={(e: any) => setNovoPerfil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  >
                    <option value="COLABORADOR">Colaborador (Presenças, Integrantes e Relatórios)</option>
                    <option value="TESOUREIRO">Tesoureiro (Coordenação Geral + Baixa de Pedidos)</option>
                    <option value="ADMIN">Administrador Geral (Acesso Total)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={criandoUsuario}
                  className="px-5 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs shadow-sm transition-all"
                >
                  {criandoUsuario ? "Criando..." : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>

          {/* Listagem de Usuários */}
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Usuários do Sistema ({usuarios.length})
            </h2>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {usuarios.map((u) => (
                <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                        {u.nome}
                      </span>
                      <span className="text-neutral-400 font-mono">(@{u.login})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          u.perfil === "ADMIN"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            : u.perfil === "TESOUREIRO"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {u.perfil}
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px] mt-0.5">
                      {u.email || "Sem e-mail cadastrado"} • Status: <strong>{u.status}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUsuarioResetSenha(u)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-[11px]"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      Redefinir Senha
                    </button>
                    <button
                      onClick={() => alternarStatusUsuario(u.id, u.status)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-[11px]"
                    >
                      {u.status === "ATIVO" ? "Desativar" : "Ativar"}
                    </button>
                    {usuarioLogado?.id !== u.id && (
                      <button
                        onClick={() => handleExcluirUsuario(u)}
                        disabled={excluindoUsuarioId === u.id}
                        className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title={`Excluir usuário ${u.nome}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 7: REGRAS DE AUSÊNCIA */}
      {aba === "CONFIG" && (
        <form onSubmit={handleSalvarConfig} className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h3 className="font-black text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#FFC72C]" />
              Parâmetros de Alerta e Inativação Automática
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Meses para Alerta de Ausência Prolongada (mínimo de 2 meses)
                </label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={config.limiteMesesAlertaAusencia}
                  onChange={(e) =>
                    setConfig({ ...config, limiteMesesAlertaAusencia: Math.max(2, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Meses para Inativação Automática por Falta de Presença
                </label>
                <input
                  type="number"
                  min={3}
                  max={36}
                  value={config.limiteMesesInativacao}
                  onChange={(e) =>
                    setConfig({ ...config, limiteMesesInativacao: Math.max(3, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="submit"
                disabled={salvandoConfig}
                className="px-6 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs shadow-md transition-all"
              >
                {salvandoConfig ? "Salvando..." : "Salvar Regras de Ausência"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABA 8: AUDITORIA */}
      {aba === "AUDITORIA" && (
        <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 animate-fadeIn">
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#FFC72C]" />
            Histórico Recente de Ações no Sistema
          </h2>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px]">
                      {log.acao}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {log.usuario?.nome}
                    </span>
                  </div>
                  <p className="text-neutral-500 mt-1">{log.detalhes}</p>
                </div>
                <span className="text-neutral-400 text-[11px] whitespace-nowrap">
                  {formatarDataHora(log.criadoEm)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Redefinir Senha */}
      {usuarioResetSenha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-[#FFC72C]">
              <KeyRound className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
                  Redefinir Senha de Acesso
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {usuarioResetSenha.nome} (@{usuarioResetSenha.login})
                </p>
              </div>
            </div>

            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nova Senha Provisória * (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  minLength={6}
                  value={novaSenhaAdmin}
                  onChange={(e) => setNovaSenhaAdmin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUsuarioResetSenha(null);
                    setNovaSenhaAdmin("");
                  }}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoReset}
                  className="px-5 py-2 rounded-xl bg-[#FFC72C] text-neutral-950 text-xs font-black shadow-sm"
                >
                  {salvandoReset ? "Salvando..." : "Confirmar Nova Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
