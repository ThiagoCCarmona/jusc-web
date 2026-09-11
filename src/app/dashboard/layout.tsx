import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNavbar } from "@/components/dashboard/navbar";

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

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0a0b0e] text-neutral-900 dark:text-neutral-100 transition-colors">
      <DashboardNavbar
        usuario={{
          id: usuario.id,
          nome: usuario.nome,
          login: usuario.login,
          email: usuario.email,
          perfil: usuario.perfil as "ADMIN" | "COLABORADOR",
        }}
      />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
