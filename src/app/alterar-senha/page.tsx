"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AlterarSenhaPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function checarUsuario() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.usuario) {
            setUsuario(data.usuario);
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setCarregandoUsuario(false);
      }
    }
    checarUsuario();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      setErro("A confirmação de senha não confere.");
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch("/api/auth/alterar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novaSenha, confirmacaoSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao atualizar senha.");
        setCarregando(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErro("Erro de conexão ao salvar a nova senha.");
      setCarregando(false);
    }
  }

  if (carregandoUsuario) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa] dark:bg-[#0a0b0e]">
        <div className="w-8 h-8 border-3 border-[#FFC72C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 honeycomb-pattern relative bg-[#fafafa] dark:bg-[#0a0b0e]">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#15171e] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
        {/* Header com Abelhudo */}
        <div className="text-center space-y-2">
          <div className="relative w-28 h-28 mx-auto">
            <Image
              src="/assets/abelhudo.png"
              alt="Mascote Abelhudo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFC72C]/20 text-neutral-950 dark:text-[#FFC72C] text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Primeiro Acesso ao Sistema
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Defina sua Senha Pessoal
          </h1>
          {usuario && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              Olá, <strong>{usuario.nome}</strong> (login: <code>@{usuario.login}</code>)! Por motivos de segurança, você deve cadastrar uma nova senha antes de prosseguir.
            </p>
          )}
        </div>

        {erro && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Nova Senha Pessoal (mínimo 6 caracteres) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                autoFocus
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 px-4 rounded-2xl bg-[#FFC72C] hover:bg-[#e5b220] text-neutral-950 font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {carregando ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {carregando ? "Salvando..." : "Salvar Senha e Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
