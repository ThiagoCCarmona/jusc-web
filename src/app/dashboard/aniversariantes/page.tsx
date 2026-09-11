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
} from "lucide-react";
import { formatarData } from "@/lib/utils";

export default function AniversariantesPage() {
  const [aba, setAba] = useState<"NASCIMENTO" | "GRUPO">("NASCIMENTO");
  const [aniversariantesNasc, setAniversariantesNasc] = useState<any[]>([]);
  const [aniversariantesGrupo, setAniversariantesGrupo] = useState<any[]>([]);
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
        <div className="flex items-center gap-2 bg-neutral-200/70 dark:bg-[#15171e] p-1 rounded-2xl border border-neutral-300/60 dark:border-neutral-800">
          <button
            onClick={() => setAba("NASCIMENTO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              aba === "NASCIMENTO"
                ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Cake className="w-4 h-4" />
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
            Tempo de JUSC ({aniversariantesGrupo.length})
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
            <div className="relative w-28 h-28 mx-auto">
              <Image
                src="/assets/abelhudo.png"
                alt="Abelhudo"
                fill
                className="object-contain"
              />
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
                `Parabéns, ${a.apelido || a.nomeCompleto}! 🎂🎉 Que Deus e o Menino Jesus abençoem grandemente sua vida e sua vocação. Abraço de toda a família JUSC!`
              )}`;

              return (
                <div
                  key={a.id}
                  className={`p-5 rounded-3xl border shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                    a.fazHoje
                      ? "bg-gradient-to-br from-amber-400/20 via-[#FFC72C]/10 to-transparent border-[#FFC72C] shadow-md ring-2 ring-[#FFC72C]/30 animate-pulse"
                      : "bg-white dark:bg-[#15171e] border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border flex-shrink-0 ${
                          a.fazHoje
                            ? "bg-[#FFC72C] text-neutral-950 border-amber-400"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-white border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        {a.dia}
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
                            <span className="text-xs text-neutral-500 font-medium">
                              ({a.apelido})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {a.idadeSendoCompletada > 0
                            ? `Completando ${a.idadeSendoCompletada} anos`
                            : "Data cadastrada"}
                        </p>
                      </div>
                    </div>

                    {a.fazHoje && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFC72C] text-neutral-950 font-black text-[10px] uppercase shadow-sm">
                        <Sparkles className="w-3 h-3" /> É Hoje!
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">{a.telefone}</span>
                    <a
                      href={linkMsg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Dar Parabéns
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Aba 2: Tempo de Grupo (JUSC) */
        aniversariantesGrupo.length === 0 ? (
          <div className="text-center bg-white dark:bg-[#15171e] rounded-3xl p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="relative w-28 h-28 mx-auto">
              <Image
                src="/assets/abelhudo.png"
                alt="Abelhudo"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              Nenhum aniversário de grupo neste mês
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Nenhum jovem completa ano de caminhada no JUSC no mês de {mesNomeAtual}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aniversariantesGrupo.map((g) => {
              const linkMsg = `https://api.whatsapp.com/send?phone=${g.telefone.replace(
                /\D/g,
                ""
              )}&text=${encodeURIComponent(
                `Parabéns pelos seus ${g.tempoTexto}, ${g.apelido || g.nomeCompleto}! 🐝💛 Obrigado por fazer parte da nossa colmeia no JUSC!`
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
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-black text-sm border border-pink-500/20 flex-shrink-0">
                        {g.dia ? `Dia ${g.dia}` : "Mês"}
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
                            <span className="text-xs text-neutral-500 font-medium">
                              ({g.apelido})
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-600 dark:text-[#FFC72C] mt-0.5 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          {g.tempoTexto}
                        </p>
                      </div>
                    </div>

                    {g.fazHoje && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFC72C] text-neutral-950 font-black text-[10px] uppercase shadow-sm">
                        <Sparkles className="w-3 h-3" /> Hoje!
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">
                      {g.precisao === "COMPLETA" ? "Data exata registrada" : "Período comemorativo"}
                    </span>
                    <a
                      href={linkMsg}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Felicitar
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
