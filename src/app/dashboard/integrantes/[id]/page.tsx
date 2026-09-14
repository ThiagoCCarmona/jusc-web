"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Edit3,
  Trash2,
  FileText,
  UserCheck,
  HeartPulse,
  Utensils,
} from "lucide-react";
import { formatarData, formatarDataHora } from "@/lib/utils";

export default function DetalhesIntegrantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;

  const [integrante, setIntegrante] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [modalInativar, setModalInativar] = useState(false);
  const [motivoInativacao, setMotivoInativacao] = useState("");
  const [processandoStatus, setProcessandoStatus] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch(`/api/integrantes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIntegrante(data.integrante);
      } else {
        router.push("/dashboard/integrantes");
      }
    } catch {
      router.push("/dashboard/integrantes");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [id]);

  async function alternarStatus(novoStatus: "ATIVO" | "INATIVO") {
    setProcessandoStatus(true);
    try {
      const res = await fetch(`/api/integrantes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: novoStatus,
          motivoInativacao: novoStatus === "INATIVO" ? motivoInativacao : null,
        }),
      });
      if (res.ok) {
        setModalInativar(false);
        setMotivoInativacao("");
        await carregar();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessandoStatus(false);
    }
  }

  if (carregando || !integrante) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#15171e] rounded-3xl border border-neutral-200 dark:border-neutral-800">
        <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-neutral-500">Carregando dados do integrante...</p>
      </div>
    );
  }

  const linkWhatsappJovem = `https://api.whatsapp.com/send?phone=${integrante.telefone.replace(/\D/g, "")}`;
  const linkWhatsappResp = `https://api.whatsapp.com/send?phone=${integrante.telefoneResponsavel.replace(/\D/g, "")}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Barra de Ações do Topo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/integrantes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a lista
        </Link>

        <div className="flex items-center gap-2">
          {/* Botão de Editar Integrante */}
          <Link
            href={`/dashboard/integrantes/${id}/editar`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            Editar Cadastro
          </Link>

          {/* Botão de Inativar/Reativar */}
          {integrante.status === "ATIVO" ? (
            <button
              onClick={() => setModalInativar(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-all"
            >
              <XCircle className="w-4 h-4" />
              Inativar Cadastro
            </button>
          ) : (
            <button
              onClick={() => alternarStatus("ATIVO")}
              disabled={processandoStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Reativar Integrante
            </button>
          )}
        </div>
      </div>

      {/* Card Principal de Perfil */}
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFC72C]/20 text-neutral-900 dark:text-[#FFC72C] flex items-center justify-center font-black text-2xl border border-[#FFC72C]/30 flex-shrink-0 relative overflow-hidden shadow-inner">
              {integrante.fotoUrl ? (
                <Image
                  src={integrante.fotoUrl}
                  alt={integrante.nomeCompleto}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                integrante.nomeCompleto.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  {integrante.nomeCompleto}
                </h1>
                {integrante.apelido && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
                    &quot;{integrante.apelido}&quot;
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Cadastrado em {formatarData(integrante.dataCadastro)} por{" "}
                <strong>{integrante.cadastradoPor?.nome || "Liderança"}</strong>
              </p>
            </div>
          </div>

          {/* Badges de Status */}
          <div>
            {integrante.temAlertaAusencia ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs border border-amber-300 dark:border-amber-700 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Alerta de Ausência ({integrante.mesesSemPresenca} meses)
              </span>
            ) : integrante.status === "ATIVO" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Integrante Ativo
              </span>
            ) : (
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs">
                  <XCircle className="w-4 h-4" />
                  Inativo
                </span>
                {integrante.motivoInativacao && (
                  <p className="text-[11px] text-neutral-400 mt-1 italic">
                    Motivo: {integrante.motivoInativacao}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Informações Pessoais e de Contato */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Contato & Nascimento
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26]">
                <span className="text-xs text-neutral-500">Telefone / WhatsApp</span>
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <span>{integrante.telefone}</span>
                  <a
                    href={linkWhatsappJovem}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    title="Conversar no WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26]">
                <span className="text-xs text-neutral-500">Sexo</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {integrante.sexo === "FEMININO" ? "Feminino" : "Masculino"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26]">
                <span className="text-xs text-neutral-500">Data de Nascimento</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {formatarData(integrante.dataNascimento)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26]">
                <span className="text-xs text-neutral-500">Grupo de WhatsApp</span>
                {integrante.noGrupoWhatsapp ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No Grupo
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs">
                    Pendente Adicionar
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              Responsável Legal
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26]">
                <span className="text-xs text-neutral-500">Nome do Responsável</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {integrante.nomeResponsavel}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26]">
                <span className="text-xs text-neutral-500">Telefone do Responsável</span>
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <span>{integrante.telefoneResponsavel}</span>
                  <a
                    href={linkWhatsappResp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    title="Conversar com o Responsável no WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sacramentos e Tempo de Grupo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Sacramentos
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                  integrante.batismo
                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Batismo
              </span>

              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                  integrante.primeiraEucaristia
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> 1ª Eucaristia
              </span>

              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                  integrante.crisma
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Crisma
              </span>
            </div>

            {/* Curso de Liderança Juvenil (CLJ) */}
            <div className="pt-2">
              {integrante.fezClj ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <span>🌹</span>
                  Fez o CLJ {integrante.qualClj ? `— ${integrante.qualClj}` : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                  Não participou do CLJ
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-[#FFC72C] flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Tempo de Caminhada no JUSC
            </h3>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] text-xs">
              {integrante.tempoGrupoPrecisao === "COMPLETA" && integrante.tempoGrupoDataCompleta && (
                <p className="font-bold text-neutral-900 dark:text-white">
                  Entrada exata em: {formatarData(integrante.tempoGrupoDataCompleta)}
                </p>
              )}
              {integrante.tempoGrupoPrecisao === "MES_ANO" && integrante.tempoGrupoMes && (
                <p className="font-bold text-neutral-900 dark:text-white">
                  Entrada aproximada: {integrante.tempoGrupoMes.toString().padStart(2, "0")}/{integrante.tempoGrupoAno}
                </p>
              )}
              {integrante.tempoGrupoPrecisao === "DESCONHECIDA" && (
                <p className="text-neutral-500">Data de início desconhecida</p>
              )}
            </div>
          </div>
        </div>

        {/* Saúde e Restrições Alimentares */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            Saúde e Restrições Alimentares
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Alergias */}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1">Alergias</span>
              {integrante.possuiAlergia ? (
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs">
                    Sim
                  </span>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">
                    {integrante.descricaoAlergia || "Alergia não especificada"}
                  </p>
                </div>
              ) : (
                <span className="text-xs font-medium text-neutral-500">Nenhuma alergia informada</span>
              )}
            </div>

            {/* Intolerância a Glúten */}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1">Glúten / Celíaco</span>
              {integrante.intoleranciaGluten ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                  Intolerante a Glúten
                </span>
              ) : (
                <span className="text-xs font-medium text-neutral-500">Sem restrição</span>
              )}
            </div>

            {/* Intolerância a Lactose */}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1">Lactose</span>
              {integrante.intoleranciaLactose ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                  Intolerante a Lactose
                </span>
              ) : (
                <span className="text-xs font-medium text-neutral-500">Sem restrição</span>
              )}
            </div>
          </div>
        </div>

        {/* Observações */}
        {integrante.observacao && (
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500">
              Observações Pastorais
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] whitespace-pre-line">
              {integrante.observacao}
            </p>
          </div>
        )}
      </div>

      {/* Histórico de Presenças */}
      <div className="bg-white dark:bg-[#15171e] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FFC72C]" />
            Histórico de Presenças nos Encontros
          </h2>
          <span className="text-xs text-neutral-500">
            {integrante.presencas.filter((p: any) => p.presente).length} presenças registradas
          </span>
        </div>

        {integrante.presencas.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4 text-center">
            Nenhum registro de encontro para este integrante ainda.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {integrante.presencas.map((p: any) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">
                    {p.encontro?.tema || "Encontro Ordinário"}
                  </h4>
                  <p className="text-neutral-500 mt-0.5">
                    {formatarDataHora(p.encontro?.dataHora)} • {p.encontro?.local}
                  </p>
                </div>
                <div>
                  {p.presente ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Presente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Ausente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Inativar */}
      {modalInativar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
                Inativar Integrante
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              O integrante <strong>{integrante.nomeCompleto}</strong> deixará de aparecer na lista de membros ativos e na chamada rápida dos encontros.
            </p>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Justificativa da Inativação (opcional)
              </label>
              <textarea
                rows={3}
                value={motivoInativacao}
                onChange={(e) => setMotivoInativacao(e.target.value)}
                placeholder="Ex.: Mudou de cidade, concluiu o período do grupo, etc."
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalInativar(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => alternarStatus("INATIVO")}
                disabled={processandoStatus}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {processandoStatus ? "Inativando..." : "Confirmar Inativação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
