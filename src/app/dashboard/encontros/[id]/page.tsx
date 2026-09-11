"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { formatarDataHora } from "@/lib/utils";

export default function DetalhesEncontroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;

  const [encontro, setEncontro] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/encontros/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEncontro(data.encontro);
        } else {
          router.push("/dashboard/encontros");
        }
      } catch {
        router.push("/dashboard/encontros");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  if (carregando || !encontro) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#15171e] rounded-3xl border border-neutral-200 dark:border-neutral-800">
        <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Carregando ata do encontro...</p>
      </div>
    );
  }

  const membrosPresentes = encontro.presencas.filter(
    (p: any) => p.presente && p.integranteId
  );
  const visitantes = encontro.presencas.filter((p: any) => p.nomeVisitante);
  const membrosAusentes = encontro.presencas.filter(
    (p: any) => !p.presente && p.integranteId
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/encontros"
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a lista de encontros
      </Link>

      {/* Cabeçalho do Encontro */}
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFC72C]">
          <Calendar className="w-4 h-4" />
          <span>{formatarDataHora(encontro.dataHora)}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
          {encontro.tema || "Encontro Ordinário JUSC"}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>{encontro.local}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>Conduzido por: <strong>{encontro.conduzidoPor}</strong></span>
          </div>
        </div>

        {/* Indicadores de Presença */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
              Total Presentes
            </span>
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">
              {membrosPresentes.length + visitantes.length}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
              Visitantes
            </span>
            <p className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-0.5">
              {visitantes.length}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400">
              Ausentes
            </span>
            <p className="text-2xl font-black text-neutral-800 dark:text-neutral-200 mt-0.5">
              {membrosAusentes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Chamada: Integrantes Presentes e Visitantes */}
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Integrantes Presentes ({membrosPresentes.length})
        </h2>

        {membrosPresentes.length === 0 ? (
          <p className="text-xs text-neutral-500">Nenhum integrante marcado como presente.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {membrosPresentes.map((p: any) => (
              <Link
                key={p.id}
                href={`/dashboard/integrantes/${p.integrante?.id}`}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] hover:bg-neutral-100 dark:hover:bg-[#222733] border border-neutral-200/60 dark:border-neutral-800 text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between transition-colors"
              >
                <span>{p.integrante?.nomeCompleto}</span>
                <span className="text-[10px] text-emerald-600 font-extrabold">Presente</span>
              </Link>
            ))}
          </div>
        )}

        {/* Visitantes */}
        {visitantes.length > 0 && (
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Visitantes no Encontro ({visitantes.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {visitantes.map((v: any) => (
                <span
                  key={v.id}
                  className="px-3 py-1 rounded-full bg-[#FFC72C]/20 text-neutral-900 dark:text-[#FFC72C] text-xs font-bold"
                >
                  {v.nomeVisitante}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Ausentes */}
      {membrosAusentes.length > 0 && (
        <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-neutral-400" />
            Integrantes Ausentes ({membrosAusentes.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {membrosAusentes.map((p: any) => (
              <Link
                key={p.id}
                href={`/dashboard/integrantes/${p.integrante?.id}`}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] hover:bg-neutral-100 dark:hover:bg-[#222733] border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between transition-colors"
              >
                <span>{p.integrante?.nomeCompleto}</span>
                <span className="text-[10px] text-neutral-400">Ausente</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
