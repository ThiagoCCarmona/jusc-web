"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
} from "lucide-react";

interface EditorBasicoProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export function EditorBasico({
  value,
  onChange,
  placeholder = "Digite aqui as anotações e observações...",
  minHeight = "130px",
  disabled = false,
}: EditorBasicoProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [estaVazio, setEstaVazio] = useState(!value || value === "<br>" || value.trim() === "");

  // Atualizar conteúdo externo quando value muda (sem resetar cursor se já estiver focado)
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
      checkEstaVazio();
    }
  }, [value]);

  function checkEstaVazio() {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const html = editorRef.current.innerHTML || "";
    const vazio = text.trim() === "" && (!html || html === "<br>" || html === "<p><br></p>");
    setEstaVazio(vazio);
  }

  function executarComando(comando: string, valor: string | undefined = undefined) {
    if (disabled) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(comando, false, valor);
    handleInput();
  }

  function handleInput() {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    checkEstaVazio();
    onChange(html);
  }

  return (
    <div className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1d26] overflow-hidden focus-within:ring-2 focus-within:ring-[#FFC72C] transition-all">
      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-100 dark:bg-[#15171e] border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 select-none">
        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("bold")}
          title="Negrito (Ctrl+B)"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("italic")}
          title="Itálico (Ctrl+I)"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("underline")}
          title="Sublinhado (Ctrl+U)"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("formatBlock", "<h3>")}
          title="Título / Destaque"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs font-bold"
        >
          <Heading className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("insertUnorderedList")}
          title="Lista com Marcadores"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("insertOrderedList")}
          title="Lista Numerada"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("formatBlock", "<blockquote>")}
          title="Citação / Bloco"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          disabled={disabled}
          onClick={() => executarComando("removeFormat")}
          title="Limpar Formatação"
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs text-neutral-500 hover:text-red-500"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Área Editável */}
      <div className="relative p-3.5 text-xs text-neutral-900 dark:text-neutral-100">
        {estaVazio && (
          <div className="absolute top-3.5 left-3.5 text-neutral-400 pointer-events-none select-none text-xs">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          className="outline-none prose prose-xs dark:prose-invert max-w-none leading-relaxed [&_h3]:text-sm [&_h3]:font-black [&_h3]:my-1.5 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-neutral-500"
        />
      </div>
    </div>
  );
}
