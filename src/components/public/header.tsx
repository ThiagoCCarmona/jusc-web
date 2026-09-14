import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  estaLogado?: boolean;
  nomeGrupo?: string;
  paroquiaNome?: string;
  logoUrl?: string | null;
}

export function PublicHeader({
  estaLogado = false,
  nomeGrupo = "JUSC",
  paroquiaNome = "Menino Jesus",
  logoUrl = "/assets/logo-jusc.jpeg",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800/80 bg-white/90 dark:bg-[#0d0e12]/90 backdrop-blur-md transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo e Nome */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFC72C] bg-black shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 aspect-square">
            <Image
              src={logoUrl || "/assets/logo-jusc.jpeg"}
              alt={`Logo ${nomeGrupo}`}
              fill
              unoptimized
              className="object-contain"
              priority
            />
          </div>

          <div>
            <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
              {nomeGrupo}
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]" />
            </span>
            <span className="hidden sm:block text-[11px] text-neutral-500 dark:text-neutral-400 font-medium -mt-1 tracking-wider uppercase">
              {paroquiaNome}
            </span>
          </div>
        </Link>

        {/* Ações: Theme Toggle e Entrar */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {estaLogado ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-xs tracking-wide shadow-sm transition-all"
            >
              Painel Interno
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold text-xs tracking-wide border border-neutral-200 dark:border-neutral-700 transition-all"
            >
              <LogIn className="w-4 h-4 text-[#FFC72C]" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
