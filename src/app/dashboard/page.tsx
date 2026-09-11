import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  calcularStatusPorAusencia,
  processarAniversariantesNascimento,
  processarAniversariantesGrupo,
} from "@/lib/rules";
import {
  Users,
  UserPlus,
  Calendar,
  CalendarPlus,
  Cake,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const usuario = await getCurrentUser();

  // Buscar configurações gerais de limites de ausência
  const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
  const limiteAlerta = config?.limiteMesesAlertaAusencia || 3;
  const limiteInativo = config?.limiteMesesInativacao || 12;

  // Buscar todos os integrantes com presenças
  const todosIntegrantes = await prisma.integrante.findMany({
    include: {
      presencas: {
        include: {
          encontro: {
            select: { dataHora: true },
          },
        },
      },
    },
  });

  // Aplicar regra de negócio 9.1 de status por ausência
  let ativos = 0;
  let inativos = 0;
  let alertasAusencia = 0;

  let batismoQtd = 0;
  let eucaristiaQtd = 0;
  let crismaQtd = 0;

  todosIntegrantes.forEach((int) => {
    const statusInfo = calcularStatusPorAusencia(
      int.status,
      int.dataCadastro,
      int.presencas,
      limiteAlerta,
      limiteInativo
    );

    if (statusInfo.statusCalculado === "ATIVO") {
      ativos++;
      if (int.batismo) batismoQtd++;
      if (int.primeiraEucaristia) eucaristiaQtd++;
      if (int.crisma) crismaQtd++;
    } else {
      inativos++;
    }

    if (statusInfo.temAlertaAusencia) {
      alertasAusencia++;
    }
  });

  // Processar Aniversariantes
  const aniversariantesNasc = processarAniversariantesNascimento(todosIntegrantes);
  const aniversariantesGrupo = processarAniversariantesGrupo(todosIntegrantes);
  const aniversariantesHoje = aniversariantesNasc.filter((a) => a.fazHoje);

  // Buscar últimos encontros
  const ultimosEncontros = await prisma.encontro.findMany({
    take: 5,
    orderBy: { dataHora: "desc" },
    include: {
      presencas: true,
    },
  });

  // Calcular média de presentes por encontro recente
  const presencasPorEncontro = ultimosEncontros.map(
    (e) => e.presencas.filter((p) => p.presente).length
  );
  const mediaPresenca =
    presencasPorEncontro.length > 0
      ? Math.round(
          presencasPorEncontro.reduce((a, b) => a + b, 0) /
            presencasPorEncontro.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas com Mascote Abelhudo */}
      <div className="bg-gradient-to-r from-amber-400/20 via-amber-300/10 to-transparent dark:from-[#262112] dark:via-[#19160d] dark:to-transparent rounded-3xl p-6 border border-amber-300/50 dark:border-amber-900/40 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC72C] text-neutral-950 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Paz e Bem!
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
            Olá, {usuario?.nome.split(" ")[0]}!
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-lg leading-relaxed">
            Bem-vindo(a) ao painel de gestão do JUSC. Acompanhe a caminhada dos jovens, registre presenças e cuide de nossa colmeia pastoral.
          </p>
        </div>

        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
          <Image
            src="/assets/abelhudo.png"
            alt="Abelhudo"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* Destaque Especial: Aniversariante de Hoje */}
      {aniversariantesHoje.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFC72C] text-neutral-950 font-medium flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 text-[#FFC72C] flex items-center justify-center flex-shrink-0">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">
                🎉 Aniversariante de Hoje!
              </p>
              <p className="font-extrabold text-sm sm:text-base">
                {aniversariantesHoje.map((a) => a.nomeCompleto).join(", ")} completa mais um ano de vida hoje!
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/aniversariantes"
            className="px-3 py-1.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex-shrink-0"
          >
            Ver Detalhes
          </Link>
        </div>
      )}

      {/* Ações Rápidas em Destaque */}
      <section>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 px-1">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/dashboard/integrantes/novo"
            className="p-4 rounded-2xl bg-white dark:bg-[#15171e] border border-neutral-200 dark:border-neutral-800 hover:border-[#FFC72C] dark:hover:border-[#FFC72C] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#FFC72C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Cadastrar Integrante
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Novo jovem no JUSC
            </p>
          </Link>

          <Link
            href="/dashboard/encontros/novo"
            className="p-4 rounded-2xl bg-white dark:bg-[#15171e] border border-neutral-200 dark:border-neutral-800 hover:border-[#FFC72C] dark:hover:border-[#FFC72C] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Registrar Encontro
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Fazer lista de presença
            </p>
          </Link>

          <Link
            href="/dashboard/aniversariantes"
            className="p-4 rounded-2xl bg-white dark:bg-[#15171e] border border-neutral-200 dark:border-neutral-800 hover:border-[#FFC72C] dark:hover:border-[#FFC72C] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Cake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Aniversariantes
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {aniversariantesNasc.length} neste mês
            </p>
          </Link>

          <Link
            href="/dashboard/relatorios"
            className="p-4 rounded-2xl bg-white dark:bg-[#15171e] border border-neutral-200 dark:border-neutral-800 hover:border-[#FFC72C] dark:hover:border-[#FFC72C] hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Relatórios & PDF
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Frequência e gráficos
            </p>
          </Link>
        </div>
      </section>

      {/* Indicadores Principais */}
      <section>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 px-1">
          Indicadores do Grupo
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#15171e] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase">Ativos</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white">
              {ativos}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {inativos} inativos cadastrados
            </p>
          </div>

          <div className="bg-white dark:bg-[#15171e] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase">Alerta Ausência</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {alertasAusencia}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              &gt; {limiteAlerta} meses sem presença
            </p>
          </div>

          <div className="bg-white dark:bg-[#15171e] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase">Média Presença</span>
              <CheckCircle className="w-4 h-4 text-[#FFC72C]" />
            </div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white">
              {mediaPresenca}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              jovens por encontro recente
            </p>
          </div>

          <div className="bg-white dark:bg-[#15171e] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase">Aniversários Grupo</span>
              <Cake className="w-4 h-4 text-pink-500" />
            </div>
            <div className="text-3xl font-black text-neutral-900 dark:text-white">
              {aniversariantesGrupo.length}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              completando anos de JUSC este mês
            </p>
          </div>
        </div>
      </section>

      {/* Seção Dupla: Distribuição de Sacramentos & Últimos Encontros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Sacramentos */}
        <div className="bg-white dark:bg-[#15171e] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFC72C]" />
              Sacramentos dos Integrantes Ativos
            </h3>
            <span className="text-xs text-neutral-500">{ativos} ativos</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Batismo</span>
                <span>
                  {batismoQtd}/{ativos} ({ativos ? Math.round((batismoQtd / ativos) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${ativos ? (batismoQtd / ativos) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Primeira Eucaristia</span>
                <span>
                  {eucaristiaQtd}/{ativos} ({ativos ? Math.round((eucaristiaQtd / ativos) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-[#FFC72C] rounded-full"
                  style={{ width: `${ativos ? (eucaristiaQtd / ativos) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Crisma</span>
                <span>
                  {crismaQtd}/{ativos} ({ativos ? Math.round((crismaQtd / ativos) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${ativos ? (crismaQtd / ativos) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Últimos Encontros Registrados */}
        <div className="bg-white dark:bg-[#15171e] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFC72C]" />
              Últimos Encontros Registrados
            </h3>
            <Link
              href="/dashboard/encontros"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {ultimosEncontros.length === 0 ? (
            <p className="text-xs text-neutral-500 py-4 text-center">
              Nenhum encontro registrado ainda.
            </p>
          ) : (
            <div className="space-y-2.5">
              {ultimosEncontros.map((encontro) => {
                const presentesCount = encontro.presencas.filter((p) => p.presente).length;
                const dataFormatada = new Date(encontro.dataHora).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={encontro.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1d26] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">
                        {encontro.tema || "Encontro Ordinário"}
                      </h4>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {dataFormatada} • {encontro.local}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {presentesCount} presentes
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
