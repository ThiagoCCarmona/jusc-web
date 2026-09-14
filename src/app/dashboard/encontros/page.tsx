"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  CalendarPlus,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { formatarDataHora } from "@/lib/utils";

export default function EncontrosPage() {
  const [encontros, setEncontros] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch("/api/encontros");
      if (res.ok) {
        const data = await res.json();
        setEncontros(data.encontros || []);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#FFC72C]" />
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
              Encontros do Grupo
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Histórico de reuniões, temas abordados e lista de presença
          </p>
        </div>

        <Link
          href="/dashboard/encontros/novo"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
        >
          <CalendarPlus className="w-4 h-4" />
          Registrar Novo Encontro
        </Link>
      </div>

      {carregando ? (
        <div className="p-12 text-center bg-white dark:bg-[#15171e] rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Carregando encontros...</p>
        </div>
      ) : encontros.length === 0 ? (
        <div className="text-center bg-white dark:bg-[#15171e] rounded-3xl p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src="/assets/abelhudo.png"
              alt="Mascote Abelhudo"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
            Nenhum encontro registrado ainda
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
            Comece registrando o encontro de domingo e fazendo a lista de chamada dos integrantes!
          </p>
          <Link
            href="/dashboard/encontros/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFC72C] text-neutral-950 font-bold text-xs shadow-sm hover:bg-[#e5b220] transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            Registrar Primeiro Encontro
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {encontros.map((enc) => {
            const integrantesPresentes = enc.presencas.filter(
              (p: any) => p.presente && p.integranteId
            ).length;
            const visitantesCount = enc.presencas.filter(
              (p: any) => p.nomeVisitante
            ).length;
            const totalPresentes = integrantesPresentes + visitantesCount;

            return (
              <Link
                key={enc.id}
                href={`/dashboard/encontros/${enc.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#15171e] border border-neutral-200 dark:border-neutral-800 hover:border-[#FFC72C] dark:hover:border-[#FFC72C] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-[#FFC72C]">
                        {formatarDataHora(enc.dataHora)}
                      </span>
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white mt-1.5 group-hover:text-amber-600 dark:group-hover:text-[#FFC72C] transition-colors leading-snug">
                        {enc.tema || "Encontro Ordinário"}
                      </h3>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs flex-shrink-0 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {totalPresentes} presentes
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{enc.local}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span>Conduzido por: {enc.conduzidoPor}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    {visitantesCount > 0
                      ? `${integrantesPresentes} membros + ${visitantesCount} visitantes`
                      : `${integrantesPresentes} membros presentes`}
                  </span>
                  <div className="flex items-center font-bold text-amber-600 dark:text-[#FFC72C]">
                    Ver Ata <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
