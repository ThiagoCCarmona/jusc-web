import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarTelefone(valor: string): string {
  if (!valor) return "";
  const digits = valor.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatarCpf(valor: string): string {
  if (!valor) return "";
  const digits = valor.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return "-";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatarDataHora(data: Date | string | null | undefined): string {
  if (!data) return "-";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarDataHoraLimite(data: Date | string | null | undefined): string {
  if (!data) return "-";
  const d = new Date(data);
  const dataPt = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaPt = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dataPt} às ${horaPt}`;
}

/**
 * Aplica máscara instantânea de digitação para DD/MM/AAAA enquanto o usuário digita
 */
export function formatarDataDigitacao(valor: string): string {
  const digits = valor.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Converte data ISO (YYYY-MM-DD) ou Date para o formato brasileiro DD/MM/AAAA
 */
export function isoParaBrasileiro(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  if (iso instanceof Date) {
    const dia = String(iso.getUTCDate()).padStart(2, "0");
    const mes = String(iso.getUTCMonth() + 1).padStart(2, "0");
    const ano = iso.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  }
  const str = String(iso).slice(0, 10);
  const parts = str.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return str;
}

/**
 * Converte data digitada no padrão brasileiro DD/MM/AAAA para ISO YYYY-MM-DD
 * Retorna null se for inválida ou incompleta
 */
export function brasileiroParaIso(br: string): string | null {
  if (!br) return null;
  const limpa = br.trim();
  const parts = limpa.split("/");
  if (parts.length !== 3) return null;
  const dia = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10);
  const ano = parseInt(parts[2], 10);

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > 2100) return null;

  const dStr = String(dia).padStart(2, "0");
  const mStr = String(mes).padStart(2, "0");
  const aStr = String(ano);

  return `${aStr}-${mStr}-${dStr}`;
}

/**
 * Formata o número da edição do CLJ permitindo apenas dígitos e adicionando o sufixo ordinal ° (Ex.: 48°)
 */
export function formatarNumeroClj(valor: string): string {
  if (!valor) return "";
  const digits = valor.replace(/\D/g, "");
  if (!digits) return "";
  return `${digits}°`;
}

export interface ModeloPrecoItem {
  nome: string;
  preco?: number;
}

/**
 * Normaliza qualquer formato de modelos:
 * Array de strings ["Branca", "Preta"]
 * Ou array de objetos [{ nome: "Tradicional", preco: 40 }, { nome: "Moletom", preco: 80 }]
 */
export function normalizarModelos(
  modelos: any,
  precoPadrao: number = 0
): ModeloPrecoItem[] {
  if (!modelos) return [{ nome: "Padrão", preco: precoPadrao }];

  let parsed = modelos;
  if (typeof modelos === "string") {
    try {
      parsed = JSON.parse(modelos);
    } catch {
      parsed = modelos.split(",").map((m) => m.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(parsed)) {
    return [{ nome: "Padrão", preco: precoPadrao }];
  }

  if (parsed.length === 0) {
    return [{ nome: "Padrão", preco: precoPadrao }];
  }

  return parsed.map((item) => {
    if (typeof item === "string") {
      return {
        nome: item.trim(),
        preco: precoPadrao,
      };
    }
    if (typeof item === "object" && item !== null) {
      const nome = String(item.nome || item.titulo || "Padrão").trim();
      const preco =
        item.preco !== undefined && !isNaN(parseFloat(item.preco))
          ? parseFloat(item.preco)
          : precoPadrao;
      return { nome, preco };
    }
    return { nome: "Padrão", preco: precoPadrao };
  });
}

/**
 * Retorna o preço de um modelo específico
 */
export function obterPrecoModelo(
  modeloNome: string,
  modelos: any,
  precoPadrao: number = 0
): number {
  const norm = normalizarModelos(modelos, precoPadrao);
  const encontrado = norm.find(
    (m) => m.nome.toLowerCase() === modeloNome.toLowerCase()
  );
  return encontrado?.preco !== undefined ? encontrado.preco : precoPadrao;
}

/**
 * Formata um resumo textual ou faixa de preços dos modelos de uma campanha
 * Ex: "R$ 45,00" ou "R$ 40,00 a R$ 80,00"
 */
export function formatarFaixaPrecos(
  modelos: any,
  precoPadrao: number = 0
): string {
  const norm = normalizarModelos(modelos, precoPadrao);
  const precos = norm.map((m) => m.preco ?? precoPadrao).filter((p) => p > 0);

  if (precos.length === 0) {
    return `R$ ${precoPadrao.toFixed(2).replace(".", ",")}`;
  }

  const min = Math.min(...precos);
  const max = Math.max(...precos);

  if (min === max) {
    return `R$ ${min.toFixed(2).replace(".", ",")}`;
  }

  return `R$ ${min.toFixed(2).replace(".", ",")} até R$ ${max.toFixed(2).replace(".", ",")}`;
}


