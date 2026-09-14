"use client";

import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import { formatarDataDigitacao, isoParaBrasileiro, brasileiroParaIso } from "@/lib/utils";

interface InputDataBrProps {
  value: string; // DD/MM/AAAA ou YYYY-MM-DD
  onChange: (valorBr: string, valorIso: string | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function InputDataBr({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  className = "",
  required = false,
  disabled = false,
  id,
  name,
}: InputDataBrProps) {
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  const valorFormatado = value && value.includes("-") ? isoParaBrasileiro(value) : (value || "");

  function handleDigitacao(e: React.ChangeEvent<HTMLInputElement>) {
    const formatado = formatarDataDigitacao(e.target.value);
    const iso = brasileiroParaIso(formatado);
    onChange(formatado, iso);
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isoVal = e.target.value;
    if (isoVal) {
      const br = isoParaBrasileiro(isoVal);
      onChange(br, isoVal);
    }
  }

  function abrirCalendario() {
    if (disabled) return;
    if (hiddenDateRef.current) {
      if (typeof hiddenDateRef.current.showPicker === "function") {
        try {
          hiddenDateRef.current.showPicker();
        } catch {
          hiddenDateRef.current.click();
        }
      } else {
        hiddenDateRef.current.click();
      }
    }
  }

  const isoAtual = brasileiroParaIso(valorFormatado) || "";

  return (
    <div className={`relative inline-flex items-center w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={abrirCalendario}
        title="Abrir calendário"
        aria-label="Abrir calendário para selecionar data"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Calendar className="w-4 h-4 text-amber-500" />
      </button>

      <input
        type="text"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        maxLength={10}
        value={valorFormatado}
        onChange={handleDigitacao}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c202a] border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C] transition-all"
      />

      <input
        type="date"
        ref={hiddenDateRef}
        value={isoAtual}
        onChange={handlePickerChange}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none"
      />
    </div>
  );
}
