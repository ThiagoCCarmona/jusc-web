"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  CalendarPlus,
  Cake,
  BarChart3,
  ShieldAlert,
  Shirt,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  usuario: {
    id: string;
    nome: string;
    login?: string;
    email?: string | null;
    perfil: "ADMIN" | "COLABORADOR" | "TESOUREIRO";
  };
  config?: {
    nomeGrupo: string;
    paroquiaNome: string;
    logoUrl: string | null;
  };
}

export function DashboardNavbar({ usuario, config }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const nomeGrupo = config?.nomeGrupo || "JUSC";
  const paroquiaNome = config?.paroquiaNome || "Paróquia Menino Jesus";
  const logoUrl = config?.logoUrl || "/assets/logo-jusc.jpeg";

  async function handleLogout() {
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  const links = [
    { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/dashboard/integrantes", label: "Integrantes", icon: Users },
    { href: "/dashboard/encontros", label: "Encontros", icon: Calendar },
    { href: "/dashboard/aniversariantes", label: "Aniversariantes", icon: Cake },
    { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  ];

  if (usuario.perfil === "ADMIN" || usuario.perfil === "TESOUREIRO") {
    links.push({ href: "/dashboard/pedidos", label: "Pedidos", icon: Shirt });
  }

  if (usuario.perfil === "ADMIN") {
    links.push({ href: "/dashboard/admin", label: "Admin", icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0d0e12]/95 backdrop-blur-md transition-colors print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo e Título */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFC72C] bg-black shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 aspect-square">
              <Image
                src={logoUrl}
                alt={`Logo ${nomeGrupo}`}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 font-black text-sm tracking-tight text-neutral-900 dark:text-white">
                {nomeGrupo}
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#FFC72C] text-black">
                  Gestão
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[180px]">
                {paroquiaNome}
              </p>
            </div>
          </Link>


          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const ativo = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    ativo
                      ? "bg-[#FFC72C] text-neutral-950 shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Ações e Usuário */}
        <div className="flex items-center gap-2.5">
          {/* Link para o site público */}
          <Link
            href="/"
            target="_blank"
            title="Ver site público em nova aba"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Ver Site</span>
          </Link>

          <ThemeToggle />

          {/* Badge de Usuário */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">
              {usuario.nome.split(" ")[0]}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-[#FFC72C] font-semibold uppercase">
              {usuario.perfil === "ADMIN"
                ? "Administrador"
                : usuario.perfil === "TESOUREIRO"
                ? "Tesoureiro"
                : "Colaborador"}
            </span>
          </div>

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            disabled={saindo}
            title="Encerrar Sessão"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Abrir menu"
          >
            {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Retrátil */}
      {menuAberto && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e12] px-4 py-3 space-y-1 animate-fadeIn">
          <div className="pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                {usuario.nome}
              </p>
              <p className="text-[10px] text-[#FFC72C] font-semibold uppercase">
                {usuario.perfil === "ADMIN"
                  ? "Administrador"
                  : usuario.perfil === "TESOUREIRO"
                  ? "Tesoureiro"
                  : "Colaborador"}
              </p>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-neutral-500 inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Site
            </Link>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                  ativo
                    ? "bg-[#FFC72C] text-neutral-950"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
