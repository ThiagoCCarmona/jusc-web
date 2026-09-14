import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PoliticaPrivacidadePage() {
  const config = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
  const nomeGrupo = config?.nomeGrupo || "JUSC";
  const subtituloGrupo = config?.subtituloGrupo || "Jovens Unidos Seguindo Cristo";
  const paroquiaNome = config?.paroquiaNome || "Paróquia Menino Jesus";
  const logoUrl = config?.logoUrl || "/assets/logo-jusc.jpeg";

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0a0b0e] text-neutral-900 dark:text-neutral-100">
      <PublicHeader nomeGrupo={nomeGrupo} paroquiaNome={paroquiaNome} logoUrl={logoUrl} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a página inicial
        </Link>

        <div className="bg-white dark:bg-[#13151c] rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-[#FFC72C]">
            <ShieldCheck className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
              Política de Privacidade
            </h1>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Última atualização: Setembro de 2026 • Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
          </p>

          <section className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              1. Finalidade e Escopo
            </h2>
            <p>
              O <strong>{nomeGrupo} — {subtituloGrupo}</strong>, grupo pastoral vinculado à <strong>{paroquiaNome}</strong>, preza pela transparência, privacidade e proteção dos dados pessoais de seus participantes, especialmente jovens e menores de idade.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              2. Dados Coletados e Tratamento de Menores
            </h2>
            <p>
              Os dados dos integrantes são cadastrados exclusivamente por membros autorizados da liderança pastoral para organização das atividades do grupo. Coletamos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Nome completo, apelido e telefone do participante;</li>
              <li>Data de nascimento (para acolhida e felicitações nos aniversários);</li>
              <li>Nome e telefone de contato do <strong>responsável legal</strong> (obrigatório para segurança e comunicação institucional);</li>
              <li>Registro de sacramentos celebrados (Batismo, Primeira Eucaristia e Crisma);</li>
              <li>Presença em encontros comunitários e celebrações pastorais.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              3. Uso e Compartilhamento
            </h2>
            <p>
              Os dados coletados são de uso estritamente pastoral interno. <strong>Em hipótese alguma</strong> os dados são comercializados, compartilhados com terceiros para fins publicitários ou transferidos sem autorização prévia.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              4. Direitos do Titular e Exclusão de Dados
            </h2>
            <p>
              Conforme o Art. 18 da LGPD, o titular ou seu responsável legal tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Confirmação da existência de tratamento dos seus dados;</li>
              <li>Acesso, correção ou atualização de dados incompletos ou inexatos;</li>
              <li>A inativação ou exclusão definitiva do cadastro do integrante de nossa base de dados.</li>
            </ul>
            <p className="pt-2">
              Para exercer seus direitos, entre em contato diretamente com a coordenação do grupo pelos canais disponibilizados na página inicial ou na secretaria paroquial.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
