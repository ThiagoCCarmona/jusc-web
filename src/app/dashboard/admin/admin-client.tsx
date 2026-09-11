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
} from "lucide-react";
import { formatarDataHora } from "@/lib/utils";

export function AdminPanelClient() {
  const [aba, setAba] = useState<"LIDERANCA" | "BANNERS" | "USUARIOS" | "CONFIG" | "AUDITORIA">(
    "LIDERANCA"
  );

  // Estados de Configurações e Liderança
  const [config, setConfig] = useState<any>({
    coordenadorNome: "Brunão",
    coordenadorFotoUrl: "/assets/coordenador.jpg",
    coordenadorWhatsapp: "5545999068852",
    coordenadorMensagem: "Oii, vim pelo site e queria saber mais sobre o JUSCÃO",
    secretarioNome: "Foletto",
    secretarioFotoUrl: "/assets/secretario.jpg",
    secretarioWhatsapp: "5545991179727",
    secretarioMensagem: "Oii, vim pelo site e queria marcar um encontro no JUSC",
    enderecoPadrao: "Salinha do JUSC — Paróquia Menino Jesus (Av. Pôr do Sol, 2200, Conjunto Libra)",
    horarioPadrao: "Domingos às 17h",
    linkGoogleMaps: "https://maps.google.com/?q=Avenida+P%C3%B4r+do+Sol,+2200,+Conjunto+Libra,+Foz+do+Igua%C3%A7u+-+PR",
    instagramUrl: "https://www.instagram.com/juscpmj?stkn=MWJhbGsyd2ZidHY1Mw==",
    limiteMesesAlertaAusencia: 3,
    limiteMesesInativacao: 12,
  });
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Estados de Usuários
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoLogin, setNovoLogin] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoPerfil, setNovoPerfil] = useState<"ADMIN" | "COLABORADOR">("COLABORADOR");
  const [criandoUsuario, setCriandoUsuario] = useState(false);

  // Estados de Banners
  const [banners, setBanners] = useState<any[]>([]);
  const [tipoBanner, setTipoBanner] = useState<"ALERTA" | "EVENTO">("ALERTA");
  const [tituloBanner, setTituloBanner] = useState("");
  const [resumoBanner, setResumoBanner] = useState("");
  const [descBanner, setDescBanner] = useState("");
  const [imagemBanner, setImagemBanner] = useState("");
  const [expiracaoBanner, setExpiracaoBanner] = useState("");
  const [criandoBanner, setCriandoBanner] = useState(false);

  // Estados de Auditoria
  const [logs, setLogs] = useState<any[]>([]);

  // Estados de feedback e upload
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [uploadingCoord, setUploadingCoord] = useState(false);
  const [uploadingSec, setUploadingSec] = useState(false);

  const fileInputCoordRef = useRef<HTMLInputElement>(null);
  const fileInputSecRef = useRef<HTMLInputElement>(null);

  // Carregar dados conforme aba
  async function carregarDados() {
    try {
      const resConf = await fetch("/api/admin/configuracoes");
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
      } else if (aba === "AUDITORIA") {
        const res = await fetch("/api/admin/auditoria");
        if (res.ok) {
          const d = await res.json();
          setLogs(d.logs || []);
        }
      }
    } catch (e) {
      console.error(e);
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

  // Upload de fotos da liderança
  async function handleUploadFoto(file: File, tipo: "coord" | "sec") {
    const formData = new FormData();
    formData.append("file", file);

    if (tipo === "coord") setUploadingCoord(true);
    else setUploadingSec(true);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        if (tipo === "coord") {
          setConfig((prev: any) => ({ ...prev, coordenadorFotoUrl: data.url }));
        } else {
          setConfig((prev: any) => ({ ...prev, secretarioFotoUrl: data.url }));
        }
        dispararSucesso("Foto carregada com sucesso! Clique em salvar.");
      } else {
        dispararErro(data.error || "Erro ao carregar foto.");
      }
    } catch {
      dispararErro("Erro de conexão no upload da foto.");
    } finally {
      if (tipo === "coord") setUploadingCoord(false);
      else setUploadingSec(false);
    }
  }

  // Salvar Configurações / Liderança
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
        dispararSucesso("Dados da coordenação e tela inicial atualizados com sucesso!");
      } else {
        dispararErro("Erro ao salvar configurações.");
      }
    } catch {
      dispararErro("Falha de conexão ao salvar.");
    } finally {
      setSalvandoConfig(false);
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
          Gestão da coordenação anual, banners da Home, usuários e configurações pastorais
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
          onClick={() => setAba("LIDERANCA")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            aba === "LIDERANCA"
              ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Coordenação Anual (Tela Inicial)
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
          Banners & Avisos da Home
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
          Usuários do Sistema
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
          Local & Regras Pastorais
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

      {/* ABA 1: COORDENAÇÃO ANUAL (TELA INICIAL) */}
      {aba === "LIDERANCA" && (
        <form onSubmit={handleSalvarConfig} className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-neutral-700 dark:text-neutral-300">
            <strong>Renovação Anual da Liderança:</strong> A cada ano a equipe pastoral muda. Atualize aqui os nomes, fotos e WhatsApp do Coordenador e Secretário. Essas informações alteram instantaneamente os banners amarelos da página pública do JUSC.
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

              {/* Preview e Upload da Foto do Coordenador */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 border-2 border-amber-300 flex-shrink-0 shadow-sm">
                  {config.coordenadorFotoUrl ? (
                    <Image
                      src={config.coordenadorFotoUrl}
                      alt="Foto Coordenador"
                      fill
                      className="object-cover"
                    />
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
                      if (e.target.files?.[0]) {
                        handleUploadFoto(e.target.files[0], "coord");
                      }
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
                  <p className="text-[11px] text-neutral-500">
                    Envie a foto do coordenador atual (JPEG ou PNG).
                  </p>
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
                    placeholder="Ex.: Brunão"
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
                    onChange={(e) =>
                      setConfig({ ...config, coordenadorWhatsapp: e.target.value })
                    }
                    placeholder="5545999068852"
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
                    onChange={(e) =>
                      setConfig({ ...config, coordenadorMensagem: e.target.value })
                    }
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

              {/* Preview e Upload da Foto do Secretário */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 border-2 border-amber-300 flex-shrink-0 shadow-sm">
                  {config.secretarioFotoUrl ? (
                    <Image
                      src={config.secretarioFotoUrl}
                      alt="Foto Secretário"
                      fill
                      className="object-cover"
                    />
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
                      if (e.target.files?.[0]) {
                        handleUploadFoto(e.target.files[0], "sec");
                      }
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
                  <p className="text-[11px] text-neutral-500">
                    Envie a foto do secretário atual (JPEG ou PNG).
                  </p>
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
                    placeholder="Ex.: Foletto"
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
                    onChange={(e) =>
                      setConfig({ ...config, secretarioWhatsapp: e.target.value })
                    }
                    placeholder="5545991179727"
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
                    onChange={(e) =>
                      setConfig({ ...config, secretarioMensagem: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={salvandoConfig}
              className="px-8 py-3 rounded-2xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {salvandoConfig ? "Salvando..." : "Salvar Coordenação da Tela Inicial"}
            </button>
          </div>
        </form>
      )}

      {/* ABA BANNERS */}
      {aba === "BANNERS" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Publicar Novo Banner / Aviso
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
                    Data de Expiração * (Some automaticamente após esta data)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expiracaoBanner}
                    onChange={(e) => setExpiracaoBanner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                  />
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

                {tipoBanner === "EVENTO" && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      URL da Imagem (opcional)
                    </label>
                    <input
                      type="url"
                      value={imagemBanner}
                      onChange={(e) => setImagemBanner(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                    />
                  </div>
                )}
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
                        Expira em: {formatarDataHora(b.dataExpiracao)} • Criado por:{" "}
                        {b.criadoPor?.nome}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>
      )}

      {/* ABA USUÁRIOS */}
      {aba === "USUARIOS" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Criar Novo Usuário de Liderança
            </h2>

            <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex.: João Bruno"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nome de Usuário (Login) *
                </label>
                <input
                  type="text"
                  required
                  value={novoLogin}
                  onChange={(e) => setNovoLogin(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  placeholder="Ex.: brunao ou foletto"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  E-mail de Contato (opcional)
                </label>
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="opcional@exemplo.com"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Senha Inicial Provisória * (usuário trocará no 1º acesso)
                </label>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Perfil de Acesso *
                </label>
                <select
                  value={novoPerfil}
                  onChange={(e: any) => setNovoPerfil(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                >
                  <option value="COLABORADOR">Colaborador (gestão de integrantes/chamada)</option>
                  <option value="ADMIN">Administrador (acesso total)</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={criandoUsuario}
                  className="px-5 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs shadow-sm transition-all"
                >
                  {criandoUsuario ? "Criando..." : "Cadastrar Usuário"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Usuários Cadastrados ({usuarios.length})
            </h2>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {usuarios.map((u) => (
                <div key={u.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                        {u.nome}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold">
                        @{u.login || u.email?.split("@")[0]}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          u.perfil === "ADMIN"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {u.perfil}
                      </span>
                      {u.primeiroAcesso && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          Aguardando troca de senha
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-500 mt-0.5">
                      Login: <strong className="text-neutral-700 dark:text-neutral-300">{u.login}</strong>
                      {u.email && ` • E-mail: ${u.email}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alternarStatusUsuario(u.id, u.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        u.status === "ATIVO"
                          ? "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                          : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {u.status === "ATIVO" ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA CONFIGURAÇÕES GERAIS */}
      {aba === "CONFIG" && (
        <form onSubmit={handleSalvarConfig} className="space-y-6">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Local, Horários e Regras Pastorais
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Local dos Encontros
                </label>
                <input
                  type="text"
                  value={config.enderecoPadrao}
                  onChange={(e) => setConfig({ ...config, enderecoPadrao: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Horário Padrão do Encontro
                </label>
                <input
                  type="text"
                  value={config.horarioPadrao}
                  onChange={(e) => setConfig({ ...config, horarioPadrao: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Instagram Oficial do JUSC (URL)
                </label>
                <input
                  type="text"
                  value={config.instagramUrl || ""}
                  onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Meses para Alerta de Ausência Prolongada
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={config.limiteMesesAlertaAusencia}
                  onChange={(e) =>
                    setConfig({ ...config, limiteMesesAlertaAusencia: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Meses para Inativação Automática
                </label>
                <input
                  type="number"
                  min={6}
                  max={36}
                  value={config.limiteMesesInativacao}
                  onChange={(e) =>
                    setConfig({ ...config, limiteMesesInativacao: e.target.value })
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
                {salvandoConfig ? "Salvando..." : "Salvar Configurações"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABA AUDITORIA */}
      {aba === "AUDITORIA" && (
        <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
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
                      {log.usuario?.nome} ({log.usuario?.email})
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
    </div>
  );
}
