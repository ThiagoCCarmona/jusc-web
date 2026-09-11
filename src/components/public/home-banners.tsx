"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AlertTriangle, ChevronDown, ChevronUp, MessageCircle, Sparkles } from "lucide-react";

interface BannerAlertaProps {
  titulo: string;
  resumo: string;
  descricaoCompleta: string;
  whatsappCoordenador: string;
}

export function BannerAlerta({
  titulo,
  resumo,
  descricaoCompleta,
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
        <div className="px-6 pb-6 pt-3 border-t border-red-500/60 bg-red-700/40 animate-fadeIn">
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
                <div className="w-full h-full flex items-center justify-center bg-amber-300">
                  <Image
                    src="/assets/abelhudo.png"
                    alt="Avatar"
                    width={72}
                    height={72}
                    className="object-contain"
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
    <div className="w-full rounded-3xl bg-amber-50 dark:bg-[#1a1711] border-2 border-amber-300 dark:border-amber-800/80 shadow-md overflow-hidden transition-all">
      <div
        onClick={() => setExpandido(!expandido)}
        className="p-5 sm:p-6 flex items-start gap-4 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#FFC72C] text-neutral-950 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
              Ação Pastoral Especial
            </span>
          </div>
          <h4 className="font-black text-lg text-neutral-900 dark:text-white mt-1">
            {titulo}
          </h4>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
            {resumo}
          </p>
        </div>

        <div className="flex-shrink-0 text-neutral-500 p-1">
          {expandido ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {expandido && (
        <div className="px-6 pb-6 pt-3 border-t border-amber-200/80 dark:border-amber-800/40 bg-white/70 dark:bg-black/30 animate-fadeIn space-y-4">
          {imagemUrl && (
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-900">
              <Image src={imagemUrl} alt={titulo} fill className="object-cover" />
            </div>
          )}
          <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
            {descricaoCompleta}
          </p>
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-950 text-white font-bold text-xs shadow-md hover:bg-neutral-800 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Saber mais no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
