import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center honeycomb-pattern relative bg-[#fafafa] dark:bg-[#0a0b0e] text-neutral-900 dark:text-neutral-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-[#13151c] rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl">
        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
          <Compass className="w-12 h-12 animate-pulse" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-[#FFC72C]/20 text-neutral-900 dark:text-[#FFC72C] text-xs font-black uppercase tracking-wider mb-2">
          Erro 404
        </div>

        <h1 className="text-2xl font-black text-neutral-950 dark:text-white">
          Ops! Página não encontrada
        </h1>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
          A página que você estava procurando não existe ou foi movida.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-bold text-sm shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            Voltar para a Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Painel Interno
          </Link>
        </div>
      </div>
    </div>
  );
}
