"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [esqueciSenhaAberto, setEsqueciSenhaAberto] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Falha ao autenticar. Verifique seus dados.");
        setCarregando(false);
        return;
      }

      // Se for primeiro acesso, direciona para definir a senha pessoal
      if (data.usuario?.primeiroAcesso) {
        router.push("/alterar-senha");
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    } catch {
      setErro("Erro de conexão com o servidor. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#15171e] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 mt-12 sm:mt-0 transition-all">
      {/* Identidade Visual: Logo e Mascote */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-[#FFC72C] shadow-md bg-black">
          <Image
            src="/assets/logo-jusc.jpeg"
            alt="Logo JUSC"
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
          Acesso à Liderança
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          JUSC — Jovens Unidos Seguindo Cristo
        </p>
      </div>

      {erro && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{erro}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
            Nome de Usuário (Login)
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              required
              autoFocus
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Digite seu nome de usuário"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              Senha
            </label>
            <button
              type="button"
              onClick={() => setEsqueciSenhaAberto(true)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              Esqueci a senha
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type={mostrarSenha ? "text" : "password"}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C] transition-all"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
            >
              {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#FFC72C] hover:bg-[#e5b220] active:scale-[0.99] text-neutral-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {carregando ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            "Entrar no Sistema"
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 text-center flex items-center justify-center gap-3">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image
            src="/assets/abelhudo.png"
            alt="Mascote Abelhudo"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-left">
          Acesso exclusivo para os membros da coordenação e liderança.
        </p>
      </div>

      {/* Modal Esqueci Minha Senha */}
      {esqueciSenhaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#15171e] rounded-3xl max-w-sm w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
                Recuperação de Acesso
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              As contas e senhas são gerenciadas pela Coordenação Geral do JUSC. Se você esqueceu seu login ou senha, solicite a redefinição diretamente ao Administrador.
            </p>
            <button
              type="button"
              onClick={() => setEsqueciSenhaAberto(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 honeycomb-pattern relative bg-[#fafafa] dark:bg-[#0a0b0e]">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center max-w-5xl mx-auto w-full px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o site
        </Link>
        <ThemeToggle />
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md p-12 bg-white dark:bg-[#15171e] rounded-3xl text-center">
            <div className="w-8 h-8 border-2 border-[#FFC72C] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
