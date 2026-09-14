import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  if (usuario.primeiroAcesso) {
    redirect("/alterar-senha");
  }

  let configGeral: {
    nomeGrupo: string;
    paroquiaNome: string;
    logoUrl: string | null;
  } = {
    nomeGrupo: "JUSC",
    paroquiaNome: "Paróquia Menino Jesus",
    logoUrl: "/assets/logo-jusc.jpeg",
  };

  try {
    const configDb = await prisma.configuracaoGeral.findFirst({ where: { id: 1 } });
    if (configDb) {
      configGeral = {
        nomeGrupo: configDb.nomeGrupo || "JUSC",
        paroquiaNome: configDb.paroquiaNome || "Paróquia Menino Jesus",
        logoUrl: configDb.logoUrl || "/assets/logo-jusc.jpeg",
      };
    }
  } catch {
    // fallback
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0a0b0e] text-neutral-900 dark:text-neutral-100 transition-colors">
      <DashboardNavbar
        usuario={{
          id: usuario.id,
          nome: usuario.nome,
          login: usuario.login,
          email: usuario.email,
          perfil: usuario.perfil as "ADMIN" | "COLABORADOR" | "TESOUREIRO",
        }}
        config={configGeral}
      />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

