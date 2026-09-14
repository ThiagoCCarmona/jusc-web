"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Cake,
  Calendar,
  Sparkles,
  Phone,
  MessageCircle,
  Clock,
  Heart,
  PartyPopper,
} from "lucide-react";
import { formatarData } from "@/lib/utils";

export default function AniversariantesPage() {
  const [aba, setAba] = useState<"NASCIMENTO" | "GRUPO">("NASCIMENTO");
  const [aniversariantesNasc, setAniversariantesNasc] = useState<any[]>([]);
  const [aniversariantesGrupo, setAniversariantesGrupo] = useState<any[]>([]);
  const [nomeGrupo, setNomeGrupo] = useState("JUSC");
  const [carregando, setCarregando] = useState(true);

  const mesNomeAtual = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    new Date()
  );

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const res = await fetch("/api/aniversariantes");
        if (res.ok) {
          const data = await res.json();
          setAniversariantesNasc(data.nascimento || []);
          setAniversariantesGrupo(data.grupo || []);
          if (data.nomeGrupo) setNomeGrupo(data.nomeGrupo);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cake className="w-6 h-6 text-[#FFC72C]" />
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white capitalize">
              Aniversariantes de {mesNomeAtual}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Felicitações de aniversário de vida e de caminhada no grupo de jovens
          </p>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#15171e] p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setAba("NASCIMENTO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              aba === "NASCIMENTO"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Nascimento ({aniversariantesNasc.length})
          </button>
          <button
            onClick={() => setAba("GRUPO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              aba === "GRUPO"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Tempo de {nomeGrupo} ({aniversariantesGrupo.length})
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {carregando ? (
        <div className="p-12 text-center bg-white dark:bg-[#15171e] rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Buscando aniversariantes...</p>
        </div>
      ) : aba === "NASCIMENTO" ? (
        /* Aba 1: Nascimento */
        aniversariantesNasc.length === 0 ? (
          <div className="text-center bg-white dark:bg-[#15171e] rounded-3xl p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center shadow-inner">
              <Cake className="w-10 h-10" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              Nenhum aniversariante de nascimento neste mês
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Nenhum jovem ativo cadastrado completa aniversário em {mesNomeAtual}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aniversariantesNasc.map((a) => {
              const linkMsg = `https://api.whatsapp.com/send?phone=${a.telefone.replace(
                /\D/g,
                ""
              )}&text=${encodeURIComponent(
                `Parabéns, ${a.apelido || a.nomeCompleto}! 🎂🎉 Que Deus abençoe grandemente sua vida e sua vocação. Abraço de toda a família ${nomeGrupo}!`
              )}`;

              return (
                <div
                  key={a.id}
                  className={`p-5 rounded-3xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                    a.fazHoje
                      ? "bg-gradient-to-br from-amber-400/20 via-[#FFC72C]/10 to-transparent border-[#FFC72C] shadow-md ring-2 ring-[#FFC72C]/30"
                      : "bg-white dark:bg-[#15171e] border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border flex-shrink-0 relative overflow-hidden shadow-inner ${
                          a.fazHoje
                            ? "bg-[#FFC72C] text-neutral-950 border-amber-400"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-white border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        {a.fotoUrl ? (
                          <Image
                            src={a.fotoUrl}
                            alt={a.nomeCompleto}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <span>{a.dia || "🎂"}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/integrantes/${a.id}`}
                            className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-[#FFC72C] transition-colors"
                          >
                            {a.nomeCompleto}
                          </Link>
                          {a.apelido && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
                              "{a.apelido}"
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <span>{a.idadeCompletada} anos</span>
                          <span>•</span>
                          <span>
                            {a.fazHoje
                              ? "🎉 Faz aniversário HOJE!"
                              : `Dia ${a.dia} de ${mesNomeAtual}`}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-mono">
                      {a.telefone}
                    </span>
                    <a
                      href={linkMsg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Felicitar no WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Aba 2: Tempo de Grupo */
        aniversariantesGrupo.length === 0 ? (
          <div className="text-center bg-white dark:bg-[#15171e] rounded-3xl p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
              <PartyPopper className="w-10 h-10" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              Nenhum aniversário de grupo neste mês
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Nenhum jovem completa ano de caminhada no {nomeGrupo} no mês de {mesNomeAtual}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aniversariantesGrupo.map((g) => {
              const linkMsg = `https://api.whatsapp.com/send?phone=${g.telefone.replace(
                /\D/g,
                ""
              )}&text=${encodeURIComponent(
                `Parabéns pelos seus ${g.tempoTexto}, ${g.apelido || g.nomeCompleto}! 💛 Obrigado por fazer parte da nossa caminhada no ${nomeGrupo}!`
              )}`;

              return (
                <div
                  key={g.id}
                  className={`p-5 rounded-3xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                    g.fazHoje
                      ? "bg-gradient-to-br from-amber-400/20 via-[#FFC72C]/10 to-transparent border-[#FFC72C] shadow-md ring-2 ring-[#FFC72C]/30"
                      : "bg-white dark:bg-[#15171e] border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-[#FFC72C] flex items-center justify-center font-black text-xs border border-amber-500/20 flex-shrink-0 relative overflow-hidden shadow-inner p-1 text-center leading-tight">
                        {g.fotoUrl ? (
                          <Image
                            src={g.fotoUrl}
                            alt={g.nomeCompleto}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black">
                            {g.anos ? `${g.anos} ${g.anos === 1 ? "ano" : "anos"}` : g.tempoTexto}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/integrantes/${g.id}`}
                            className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-[#FFC72C] transition-colors"
                          >
                            {g.nomeCompleto}
                          </Link>
                          {g.apelido && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
                              "{g.apelido}"
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <span>{g.tempoTexto}</span>
                          <span>•</span>
                          <span>
                            {g.fazHoje
                              ? "🎉 Completa aniversário HOJE!"
                              : g.dia
                              ? `Dia ${g.dia} de ${mesNomeAtual}`
                              : `Comemorativo em ${mesNomeAtual}`}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-mono">
                      {g.telefone}
                    </span>
                    <a
                      href={linkMsg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-[#FFC72C] text-xs font-bold transition-all active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Parabenizar no WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
