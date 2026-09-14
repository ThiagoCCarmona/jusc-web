import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { PublicHeader } from "@/components/public/header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TermosUsoPage() {
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
            <FileText className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
              Termos de Uso
            </h1>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {nomeGrupo} — {subtituloGrupo} • {paroquiaNome}
          </p>

          <section className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              1. Objeto da Plataforma
            </h2>
            <p>
              Esta plataforma digital tem como objetivo divulgar as atividades, eventos e canais de acolhimento do grupo de jovens <strong>{nomeGrupo}</strong>, além de servir como ferramenta de apoio à gestão pastoral e controle de presenças pela liderança da {paroquiaNome}.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              2. Acesso à Área Restrita da Liderança
            </h2>
            <p>
              O acesso às áreas autenticadas do sistema é pessoal, intransferível e restrito aos coordenadores e colaboradores credenciados pela coordenação paroquial. O usuário compromete-se a zelar pelo sigilo de suas credenciais de acesso e a utilizar as informações dos integrantes exclusivamente para fins pastorais.
            </p>
          </section>

          <section className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              3. Propriedade Intelectual e Marca
            </h2>
            <p>
              O nome <strong>{nomeGrupo} — {subtituloGrupo}</strong>, o brasão oficial e os símbolos comunitários vinculados à pastoral juvenil da {paroquiaNome} são de uso pastoral comunitário, sendo vedada sua reprodução não autorizada para fins comerciais externos.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
