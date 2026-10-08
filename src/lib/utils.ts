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

export const TAMANHOS_INFANTIS = ["2", "4", "6", "8", "10", "12", "14", "16"];
export const TAMANHOS_ADULTOS = [
  "PPP",
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "XGG",
  "XXG",
  "XXGG",
  "XXXG",
];
export const TAMANHOS_PLUS_ESPECIAIS = ["G1", "G2", "G3", "G4", "G5", "Sob Medida"];

export const TAMANHOS_CATALOGO_COMPLETO: string[] = [
  ...TAMANHOS_INFANTIS,
  ...TAMANHOS_ADULTOS,
  ...TAMANHOS_PLUS_ESPECIAIS,
];

export const TAMANHOS_PADRAO_INICIAIS: string[] = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XGG",
];

export function ordenarTamanhosCatalogo(tamanhos: string[]): string[] {
  return [...tamanhos].sort((a, b) => {
    const idxA = TAMANHOS_CATALOGO_COMPLETO.indexOf(a.toUpperCase());
    const idxB = TAMANHOS_CATALOGO_COMPLETO.indexOf(b.toUpperCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b, "pt-BR");
  });
}

export interface ModeloPrecoItem {
  nome: string;
  preco?: number;
  tamanhos?: string[]; // Compatibilidade retroativa
  ehConjunto?: boolean; // Se true, modelo é um conjunto (Short + Camiseta)
  tamanhosShort?: string[]; // Compatibilidade retroativa
}

/**
 * Normaliza qualquer formato de modelos:
 * Array de strings ["Branca", "Preta"]
 * Ou array de objetos [{ nome: "Tradicional", preco: 40, tamanhos: ["P", "M"] }, { nome: "Conjunto", preco: 80, ehConjunto: true }]
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

      // Tamanhos específicos do modelo
      let tamanhos: string[] | undefined = undefined;
      if (Array.isArray(item.tamanhos) && item.tamanhos.length > 0) {
        tamanhos = item.tamanhos.map((t: any) => String(t).trim().toUpperCase()).filter(Boolean);
      } else if (typeof item.tamanhos === "string" && item.tamanhos.trim()) {
        tamanhos = item.tamanhos.split(",").map((t: string) => t.trim().toUpperCase()).filter(Boolean);
      }

      // Configuração de conjunto
      const ehConjunto = Boolean(
        item.ehConjunto ||
        nome.toLowerCase().includes("conjunto") ||
        (nome.toLowerCase().includes("short") && nome.toLowerCase().includes("camis"))
      );

      let tamanhosShort: string[] | undefined = undefined;
      if (Array.isArray(item.tamanhosShort) && item.tamanhosShort.length > 0) {
        tamanhosShort = item.tamanhosShort.map((t: any) => String(t).trim().toUpperCase()).filter(Boolean);
      } else if (typeof item.tamanhosShort === "string" && item.tamanhosShort.trim()) {
        tamanhosShort = item.tamanhosShort.split(",").map((t: string) => t.trim().toUpperCase()).filter(Boolean);
      }

      return {
        nome,
        preco,
        tamanhos: tamanhos && tamanhos.length > 0 ? tamanhos : undefined,
        ehConjunto,
        tamanhosShort: tamanhosShort && tamanhosShort.length > 0 ? tamanhosShort : undefined,
      };
    }
    return { nome: "Padrão", preco: precoPadrao };
  });
}

/**
 * Retorna se o modelo selecionado é um conjunto (short + camiseta)
 */
export function modeloEhConjunto(modeloNome: string, modelos: any): boolean {
  const norm = normalizarModelos(modelos);
  const encontrado = norm.find(
    (m) => m.nome.toLowerCase() === modeloNome.toLowerCase()
  );
  if (encontrado?.ehConjunto !== undefined) return encontrado.ehConjunto;
  const lower = modeloNome.toLowerCase();
  return lower.includes("conjunto") || (lower.includes("short") && lower.includes("camis"));
}

/**
 * Retorna os tamanhos disponíveis para um modelo específico da camiseta/conjunto
 */
export function obterTamanhosModelo(
  modeloNome: string,
  modelos: any,
  tamanhosPadraoCampanha: string[] = []
): string[] {
  const norm = normalizarModelos(modelos);
  const encontrado = norm.find(
    (m) => m.nome.toLowerCase() === modeloNome.toLowerCase()
  );
  if (encontrado?.tamanhos && encontrado.tamanhos.length > 0) {
    return encontrado.tamanhos;
  }
  return tamanhosPadraoCampanha && tamanhosPadraoCampanha.length > 0
    ? tamanhosPadraoCampanha
    : ["PP", "P", "M", "G", "GG", "XGG"];
}

/**
 * Retorna os tamanhos disponíveis para o short do conjunto
 */
export function obterTamanhosShort(
  modeloNome: string,
  modelos: any,
  tamanhosPadraoCampanha: string[] = []
): string[] {
  const norm = normalizarModelos(modelos);
  const encontrado = norm.find(
    (m) => m.nome.toLowerCase() === modeloNome.toLowerCase()
  );
  if (encontrado?.tamanhosShort && encontrado.tamanhosShort.length > 0) {
    return encontrado.tamanhosShort;
  }
  if (encontrado?.tamanhos && encontrado.tamanhos.length > 0) {
    return encontrado.tamanhos;
  }
  return tamanhosPadraoCampanha && tamanhosPadraoCampanha.length > 0
    ? tamanhosPadraoCampanha
    : ["PP", "P", "M", "G", "GG", "XGG"];
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


