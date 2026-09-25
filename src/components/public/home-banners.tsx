"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AlertTriangle, ChevronDown, ChevronUp, MessageCircle, Sparkles, Shirt, ClipboardList, Calendar, Share2, Check, Copy } from "lucide-react";
import { normalizarModelos, formatarFaixaPrecos, formatarData, formatarDataHoraLimite } from "@/lib/utils";
import { ModalPedidoCamiseta, CampanhaModalData } from "@/components/public/modal-pedido-camiseta";
import { ModalInscricao, CampanhaInscricaoData } from "@/components/public/modal-inscricao";

interface BannerAlertaProps {
  titulo: string;
  resumo: string;
  descricaoCompleta: string;
  imagemUrl?: string | null;
  whatsappCoordenador: string;
}

export function BannerAlerta({
  titulo,
  resumo,
  descricaoCompleta,
  imagemUrl,
  whatsappCoordenador,
}: BannerAlertaProps) {
  const [expandido, setExpandido] = useState(false);

  const linkWhatsapp = `https://api.whatsapp.com/send?phone=${whatsappCoordenador.replace(/\D/g, "")}&text=${encodeURIComponent(
    `Olá! Vi o aviso no site sobre "${titulo}" e gostaria de tirar uma dúvida.`
  )}`;

  return (
    <div className="w-full rounded-3xl bg-red-600 text-white shadow-xl overflow-hidden border-2 border-red-500 transition-all">
      <div
        onClick={() => setExpandido(!expandido)}
        className="p-5 sm:p-6 flex items-start gap-4 cursor-pointer hover:bg-red-700/50 transition-colors"
      >
        <div className="p-2.5 rounded-2xl bg-white/20 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6 text-amber-200" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
              Comunicado Urgente
            </span>
          </div>
          <h3 className="font-black text-lg sm:text-xl mt-1 text-white leading-snug">
            {titulo}
          </h3>
          <p className="text-sm text-red-100 mt-1.5 leading-relaxed">{resumo}</p>
        </div>
        <div className="flex-shrink-0 text-white/80 p-1">
          {expandido ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {expandido && (
        <div className="px-6 pb-6 pt-3 border-t border-red-500/60 bg-red-700/40 animate-fadeIn space-y-4">
          {imagemUrl && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-black/20">
              <Image
                src={imagemUrl}
                alt={titulo}
                fill
                unoptimized
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <div className="text-sm text-white/95 whitespace-pre-line leading-relaxed mb-5">
            {descricaoCompleta}
          </div>
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white text-red-700 font-black text-xs sm:text-sm hover:bg-neutral-100 shadow-lg transition-all active:scale-95"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            Falar com a coordenação no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

interface BannerContatoProps {
  cargo: "Coordenador" | "Secretário";
  nome: string;
  fotoUrl?: string | null;
  whatsapp: string;
  mensagem: string;
  chamada: string;
  ladoFoto?: "direita" | "esquerda";
}

export function BannerContato({
  cargo,
  nome,
  fotoUrl,
  whatsapp,
  mensagem,
  chamada,
  ladoFoto = "direita",
}: BannerContatoProps) {
  const linkWhatsapp = `https://api.whatsapp.com/send?phone=${whatsapp.replace(/\D/g, "")}&text=${encodeURIComponent(
    mensagem
  )}`;

  const fotoNaEsquerda = ladoFoto === "esquerda";

  return (
    <div className="relative pt-6 pb-2 sm:pt-8 sm:pb-4 group">
      {/* Card principal com fundo amarelo dourado vibrante e cantos curvos */}
      <div
        className={`w-full rounded-3xl bg-gradient-to-br from-[#FFC72C] via-[#ffcf40] to-[#f5b810] border-2 border-amber-400/80 dark:border-amber-500/40 shadow-xl hover:shadow-2xl transition-all duration-500 p-6 sm:p-8 text-neutral-950 relative overflow-visible ${
          fotoNaEsquerda ? "sm:pl-56" : "sm:pr-56"
        }`}
      >
        {/* Efeito decorativo orgânico no fundo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Foto em Efeito 3D com avanço para fora do banner */}
        <div
          className={`relative sm:absolute sm:-top-12 ${
            fotoNaEsquerda
              ? "sm:-left-6 mb-5 sm:mb-0"
              : "sm:-right-6 mb-5 sm:mb-0"
          } flex justify-center z-20`}
        >
          <div className="relative group-hover:-translate-y-2.5 group-hover:scale-105 transition-all duration-500 ease-out">
            {/* Sombra 3D profunda projetada no chão */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-7 bg-neutral-950/35 rounded-full blur-lg group-hover:w-full group-hover:opacity-50 transition-all duration-500" />

            {/* Borda flutuante estilizada */}
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-4 border-neutral-950 bg-neutral-900 shadow-2xl ring-4 ring-[#FFC72C]/90 rotate-1 group-hover:rotate-0 transition-transform duration-500">
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt={`${cargo} ${nome}`}
                  fill
                  sizes="(max-width: 640px) 144px, 192px"
                  className="object-cover object-top filter brightness-[1.03] contrast-[1.03]"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src="/assets/avatar-padrao.png"
                    alt="Avatar Padrão"
                    width={80}
                    height={80}
                    className="object-contain opacity-70"
                  />
                </div>
              )}

              {/* Brilho reflexivo sobre a imagem */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* Badge flutuante sobre a foto */}
            <div
              className={`absolute -bottom-2 ${
                fotoNaEsquerda ? "right-0 sm:-right-2" : "left-0 sm:-left-2"
              } px-2.5 py-1 rounded-full bg-neutral-950 text-[#FFC72C] text-[10px] font-black uppercase tracking-wider shadow-lg border border-amber-300/40`}
            >
              {cargo}
            </div>
          </div>
        </div>

        {/* Conteúdo do Banner */}
        <div className="space-y-3 relative z-10 text-left">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-neutral-950/90 text-[#FFC72C]">
                {cargo} • Gestão Atual
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight mt-1.5">
              {nome}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-neutral-900/90 font-medium leading-relaxed max-w-md">
            {chamada}
          </p>

          <div className="pt-2">
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-xl transition-all duration-300 group-hover:translate-x-1"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
              <span>Conversar no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BannerEventoProps {
  titulo: string;
  resumo: string;
  descricaoCompleta: string;
  imagemUrl?: string | null;
  whatsappCoordenador: string;
}

export function BannerEvento({
  titulo,
  resumo,
  descricaoCompleta,
  imagemUrl,
  whatsappCoordenador,
}: BannerEventoProps) {
  const [expandido, setExpandido] = useState(false);

  const linkWhatsapp = `https://api.whatsapp.com/send?phone=${whatsappCoordenador.replace(/\D/g, "")}&text=${encodeURIComponent(
    `Olá! Gostaria de mais informações sobre: "${titulo}"`
  )}`;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/40 to-yellow-50 dark:from-[#1a1711] dark:via-[#1e1c15] dark:to-[#16140e] border-2 border-[#FFC72C]/70 dark:border-[#FFC72C]/40 shadow-xl overflow-hidden transition-all duration-300">
      <div
        onClick={() => setExpandido(!expandido)}
        className="p-5 sm:p-6 flex items-start gap-4 cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFC72C] to-[#e5b220] text-neutral-950 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-amber-400/30">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFC72C]/30 text-neutral-900 dark:text-[#FFC72C] border border-[#FFC72C]/40">
              Ação Pastoral Especial
            </span>
          </div>
          <h4 className="font-black text-lg sm:text-xl text-neutral-950 dark:text-white mt-1">
            {titulo}
          </h4>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 line-clamp-2 leading-relaxed font-medium">
            {resumo}
          </p>
        </div>

        <div className="flex-shrink-0 text-neutral-600 dark:text-neutral-400 p-1">
          {expandido ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {expandido && (
        <div className="px-6 pb-6 pt-4 border-t border-[#FFC72C]/30 bg-white/80 dark:bg-black/40 backdrop-blur-sm animate-fadeIn space-y-5">
          {imagemUrl && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#FFC72C]/40 shadow-lg bg-neutral-100 dark:bg-neutral-900">
              <Image
                src={imagemUrl}
                alt={titulo}
                fill
                unoptimized
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-normal">
            {descricaoCompleta}
          </p>
          <div>
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-[#FFC72C] font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span>Saber mais no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
interface BannerCamisetaProps {
  campanha: CampanhaModalData;
}

export function BannerCamiseta({ campanha }: BannerCamisetaProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const primeiraFoto = campanha.fotos[0];
  const fotoCapa = (typeof primeiraFoto === "object" && primeiraFoto ? primeiraFoto.url : primeiraFoto) || "/assets/logo-jusc.jpeg";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("camiseta") === String(campanha.id)) {
        setModalAberto(true);
      }
    }
  }, [campanha.id]);

  async function handleCompartilhar(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/?camiseta=${campanha.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Campanha de Camisetas JUSC - ${campanha.titulo}`,
          text: `Garanta a sua camiseta oficial do grupo jovem: ${campanha.titulo}! Faça seu pedido online:`,
          url,
        });
        return;
      } catch {
        // cancelado pelo usuário
      }
    }
    handleCopiarLink(e);
  }

  async function handleCopiarLink(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/?camiseta=${campanha.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 2500);
    }
  }

  return (
    <>
      <div className="w-full rounded-3xl bg-gradient-to-r from-amber-500 via-[#FFC72C] to-yellow-400 text-neutral-950 p-5 sm:p-6 shadow-xl border-2 border-amber-400/90 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-5 relative z-10">
          {/* Miniatura Foto da Camiseta */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-neutral-950 shadow-md bg-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src={fotoCapa}
              alt={campanha.titulo}
              fill
              unoptimized
              className="object-contain p-1"
            />
            <span className="absolute bottom-1 right-1 bg-neutral-950 text-[#FFC72C] text-[10px] font-black px-1.5 py-0.5 rounded-md">
              {campanha.fotos.length} fotos
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-950 text-[#FFC72C] text-[10px] font-black uppercase tracking-wider">
              <Shirt className="w-3.5 h-3.5" />
              Campanha Oficial de Camisetas
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950">
              {campanha.titulo}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-900/90 font-medium line-clamp-2">
              {campanha.descricao || "Garanta já a sua camiseta oficial do grupo jovem! Diversos modelos e tamanhos."}
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-neutral-950/10 font-black text-xs text-neutral-950">
                {formatarFaixaPrecos(campanha.modelos, campanha.precoUnitario)}
              </span>
              <span className="text-[11px] font-semibold text-neutral-800">
                Modelos: {normalizarModelos(campanha.modelos, campanha.precoUnitario).map((m) => m.nome).join(", ")}
              </span>
              {campanha.dataFim && (
                <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-700" />
                  Limite: {formatarDataHoraLimite(campanha.dataFim)}
                </span>
              )}
            </div>
          </div>

          {/* Ações: Fazer Pedido em CIMA, Compartilhar/Copiar EMBAIXO */}
          <div className="flex-shrink-0 w-full sm:w-auto md:w-56 pt-2 md:pt-0 flex flex-col gap-2">
            <button
              onClick={() => setModalAberto(true)}
              className="w-full px-5 py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-[#FFC72C] font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Shirt className="w-4 h-4 flex-shrink-0" />
              <span>Fazer Pedido Online</span>
            </button>

            <div className="flex items-center gap-1.5 w-full">
              <button
                type="button"
                onClick={handleCompartilhar}
                title="Compartilhar campanha no celular ou redes"
                className="flex-1 px-3 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-300"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0" />
                <span>Compartilhar</span>
              </button>

              <button
                type="button"
                onClick={handleCopiarLink}
                title="Copiar link direto"
                className="px-3 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer border border-neutral-300"
              >
                {copiadoLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-800" />}
                <span className="text-[11px] font-bold">{copiadoLink ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalPedidoCamiseta
        campanha={campanha}
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
      />
    </>
  );
}

interface BannerInscricaoProps {
  campanha: CampanhaInscricaoData;
}

export function BannerInscricao({ campanha }: BannerInscricaoProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const fotoCapa = campanha.fotoUrl || "/assets/logo-jusc.jpeg";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("inscricao") === String(campanha.id)) {
        setModalAberto(true);
      }
    }
  }, [campanha.id]);

  async function handleCompartilhar(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/?inscricao=${campanha.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Inscrições Abertas JUSC - ${campanha.titulo}`,
          text: `As inscrições para ${campanha.titulo} do grupo JUSC estão abertas! Inscreva-se online:`,
          url,
        });
        return;
      } catch {
        // cancelado pelo usuário
      }
    }
    handleCopiarLink(e);
  }

  async function handleCopiarLink(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/?inscricao=${campanha.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 2500);
    }
  }

  return (
    <>
      <div className="w-full rounded-3xl bg-gradient-to-r from-amber-500 via-[#FFC72C] to-yellow-400 text-neutral-950 p-5 sm:p-6 shadow-xl border-2 border-amber-400/90 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-5 relative z-10">
          {/* Miniatura com Foto da Inscrição */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-neutral-950 shadow-md bg-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src={fotoCapa}
              alt={campanha.titulo}
              fill
              unoptimized
              className="object-cover"
            />
            <span className="absolute bottom-1 right-1 bg-neutral-950 text-[#FFC72C] text-[9px] font-black px-1.5 py-0.5 rounded-md">
              Oficial
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-950 text-[#FFC72C] text-[10px] font-black uppercase tracking-wider">
              <ClipboardList className="w-3.5 h-3.5" />
              Inscrições Abertas
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950">
              {campanha.titulo}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-900/90 font-medium line-clamp-2">
              {campanha.descricao || "Faça sua inscrição online e garanta sua presença neste encontro especial do grupo jovem!"}
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-neutral-950/10 font-black text-xs text-neutral-950">
                {campanha.requerPagamento
                  ? `R$ ${Number(campanha.valor || 0).toFixed(2).replace(".", ",")}`
                  : "Inscrição Gratuita"}
              </span>
              <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-700" />
                Limite: {formatarDataHoraLimite(campanha.dataLimite)}
              </span>
            </div>
          </div>

          {/* Ações: Fazer Inscrição em CIMA, Compartilhar/Copiar EMBAIXO */}
          <div className="flex-shrink-0 w-full sm:w-auto md:w-56 pt-2 md:pt-0 flex flex-col gap-2">
            <button
              onClick={() => setModalAberto(true)}
              className="w-full px-5 py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-[#FFC72C] font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4 flex-shrink-0" />
              <span>Fazer Inscrição Online</span>
            </button>

            <div className="flex items-center gap-1.5 w-full">
              <button
                type="button"
                onClick={handleCompartilhar}
                title="Compartilhar evento no celular ou redes"
                className="flex-1 px-3 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-300"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0" />
                <span>Compartilhar</span>
              </button>

              <button
                type="button"
                onClick={handleCopiarLink}
                title="Copiar link direto"
                className="px-3 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-neutral-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer border border-neutral-300"
              >
                {copiadoLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-800" />}
                <span className="text-[11px] font-bold">{copiadoLink ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalInscricao
        campanha={campanha}
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
      />
    </>
  );
}


