import { differenceInMonths, differenceInYears, isSameDay } from "date-fns";

export interface PresencaItem {
  presente: boolean;
  encontro?: {
    dataHora: Date | string;
  } | null;
}

export interface IntegranteStatusInfo {
  statusCalculado: "ATIVO" | "INATIVO";
  temAlertaAusencia: boolean;
  ultimaPresencaData: Date | null;
  mesesSemPresenca: number;
}

export interface PausaItem {
  dataInicio: Date | string;
  dataFim?: Date | string | null;
}

export function calcularIdade(
  dataNascimento: Date | string,
  dataReferencia: Date | string = new Date()
): number {
  const nasc = new Date(dataNascimento);
  const ref = new Date(dataReferencia);
  let idade = ref.getUTCFullYear() - nasc.getUTCFullYear();
  const mesDiff = ref.getUTCMonth() - nasc.getUTCMonth();
  if (mesDiff < 0 || (mesDiff === 0 && ref.getUTCDate() < nasc.getUTCDate())) {
    idade--;
  }
  return Math.max(0, idade);
}

/**
 * Regra 9.1: Cálculo de status por ausência
 * - Data do último encontro em que esteve presente
 * - Desconta períodos de encontros pausados (férias/recesso)
 * - > 12 meses sem presença -> Inativo automático
 * - > 3 meses sem presença (e < 12 meses) -> Alerta de ausência prolongada
 * - Se voltou a comparecer -> Reativa e encerra alerta
 */
export function calcularStatusPorAusencia(
  statusManual: string,
  dataCadastro: Date | string,
  presencas: PresencaItem[],
  limiteMesesAlerta = 3,
  limiteMesesInativo = 12,
  dataReferencia: Date = new Date(),
  pausas: PausaItem[] = []
): IntegranteStatusInfo {
  // Se foi inativado manualmente, respeita a decisão manual
  if (statusManual === "INATIVO") {
    return {
      statusCalculado: "INATIVO",
      temAlertaAusencia: false,
      ultimaPresencaData: null,
      mesesSemPresenca: 0,
    };
  }

  // Filtrar apenas presenças confirmadas
  const presencasConfirmadas = presencas
    .filter((p) => p.presente && p.encontro?.dataHora)
    .map((p) => new Date(p.encontro!.dataHora))
    .sort((a, b) => b.getTime() - a.getTime());

  const ultimaData = presencasConfirmadas.length > 0 
    ? presencasConfirmadas[0] 
    : new Date(dataCadastro);

  // Calcular total de dias transcorridos
  const diffTotalMs = Math.max(0, dataReferencia.getTime() - ultimaData.getTime());
  const totalDiasTranscorridos = Math.floor(diffTotalMs / (1000 * 60 * 60 * 24));

  // Descontar dias de pausas/recessos que ocorreram entre a última presença e a data de referência
  let diasPausados = 0;
  for (const p of pausas) {
    const pInicio = new Date(p.dataInicio);
    const pFim = p.dataFim ? new Date(p.dataFim) : dataReferencia;

    const start = pInicio > ultimaData ? pInicio : ultimaData;
    const end = pFim < dataReferencia ? pFim : dataReferencia;

    if (end > start) {
      diasPausados += Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  const diasAtivosSemPresenca = Math.max(0, totalDiasTranscorridos - diasPausados);
  const meses = Math.floor(diasAtivosSemPresenca / 30.4375);

  if (meses >= limiteMesesInativo) {
    return {
      statusCalculado: "INATIVO",
      temAlertaAusencia: false,
      ultimaPresencaData: presencasConfirmadas[0] || null,
      mesesSemPresenca: meses,
    };
  }

  const temAlerta = meses >= limiteMesesAlerta;

  return {
    statusCalculado: "ATIVO",
    temAlertaAusencia: temAlerta,
    ultimaPresencaData: presencasConfirmadas[0] || null,
    mesesSemPresenca: meses,
  };
}

export interface AniversarianteNascimento {
  id: string;
  nomeCompleto: string;
  apelido: string | null;
  telefone: string;
  dataNascimento: Date;
  dia: number;
  idadeSendoCompletada: number;
  fazHoje: boolean;
  fotoUrl: string | null;
}

export function processarAniversariantesNascimento(
  integrantes: Array<{
    id: string;
    nomeCompleto: string;
    apelido: string | null;
    telefone: string;
    dataNascimento: Date | string;
    fotoUrl: string | null;
    status: string;
  }>,
  dataReferencia: Date = new Date()
): AniversarianteNascimento[] {
  const mesAtual = dataReferencia.getMonth();
  const diaAtual = dataReferencia.getDate();

  return integrantes
    .filter((int) => int.status === "ATIVO")
    .map((int) => {
      const nasc = new Date(int.dataNascimento);
      // Datas de nascimento salvas como ISO / UTC midnight (ex: "2005-09-12T00:00:00.000Z")
      // devem ser lidas em UTC para não sofrer deslocamento de fuso horário brasileiro (-3h -> dia anterior 21h)
      const mesNasc = nasc.getUTCMonth();
      const diaNasc = nasc.getUTCDate();

      if (mesNasc !== mesAtual) return null;

      const anoAtual = dataReferencia.getFullYear();
      const anoNasc = nasc.getUTCFullYear();
      let anos = anoAtual - anoNasc;
      if (diaAtual < diaNasc) {
        anos -= 1;
      }
      const fazHoje = diaNasc === diaAtual;

      return {
        id: int.id,
        nomeCompleto: int.nomeCompleto,
        apelido: int.apelido,
        telefone: int.telefone,
        dataNascimento: nasc,
        dia: diaNasc,
        idadeSendoCompletada: anos,
        fazHoje,
        fotoUrl: int.fotoUrl,
      };
    })
    .filter((item): item is AniversarianteNascimento => item !== null)
    .sort((a, b) => a.dia - b.dia);
}

export interface AniversarianteGrupo {
  id: string;
  nomeCompleto: string;
  apelido: string | null;
  telefone: string;
  precisao: "COMPLETA" | "MES_ANO" | "DESCONHECIDA";
  dia: number | null;
  anos: number;
  tempoTexto: string;
  fazHoje: boolean;
  fotoUrl: string | null;
}

/**
 * Regra 6.5: Aniversariantes de Grupo (tempo de casa)
 * 3 níveis de precisão:
 * - COMPLETA: dia exato calculado, destaque se for hoje
 * - MES_ANO: entra no mês, sem destaque de dia exato
 * - DESCONHECIDA: não entra na listagem
 */
export function processarAniversariantesGrupo(
  integrantes: Array<{
    id: string;
    nomeCompleto: string;
    apelido: string | null;
    telefone: string;
    tempoGrupoPrecisao: string;
    tempoGrupoDataCompleta: Date | string | null;
    tempoGrupoMes: number | null;
    tempoGrupoAno: number | null;
    fotoUrl: string | null;
    status: string;
  }>,
  dataReferencia: Date = new Date(),
  nomeGrupo: string = "caminhada"
): AniversarianteGrupo[] {
  const mesAtual = dataReferencia.getMonth() + 1; // 1-12
  const anoAtual = dataReferencia.getFullYear();
  const diaAtual = dataReferencia.getDate();

  const resultados: AniversarianteGrupo[] = [];

  for (const int of integrantes) {
    if (int.status !== "ATIVO") continue;

    if (int.tempoGrupoPrecisao === "COMPLETA" && int.tempoGrupoDataCompleta) {
      const data = new Date(int.tempoGrupoDataCompleta);
      const mes = data.getUTCMonth() + 1;
      const dia = data.getUTCDate();
      const ano = data.getUTCFullYear();

      if (mes === mesAtual) {
        const anos = anoAtual - ano;
        if (anos > 0) {
          const fazHoje = dia === diaAtual;
          resultados.push({
            id: int.id,
            nomeCompleto: int.nomeCompleto,
            apelido: int.apelido,
            telefone: int.telefone,
            precisao: "COMPLETA",
            dia,
            anos,
            tempoTexto: `${anos} ${anos === 1 ? "ano" : "anos"} de ${nomeGrupo}`,
            fazHoje,
            fotoUrl: int.fotoUrl,
          });
        }
      }
    } else if (int.tempoGrupoPrecisao === "MES_ANO" && int.tempoGrupoMes && int.tempoGrupoAno) {
      if (int.tempoGrupoMes === mesAtual) {
        const anos = anoAtual - int.tempoGrupoAno;
        if (anos > 0) {
          resultados.push({
            id: int.id,
            nomeCompleto: int.nomeCompleto,
            apelido: int.apelido,
            telefone: int.telefone,
            precisao: "MES_ANO",
            dia: null,
            anos,
            tempoTexto: `${anos} ${anos === 1 ? "ano" : "anos"} de ${nomeGrupo} (mês comemorativo)`,
            fazHoje: false,
            fotoUrl: int.fotoUrl,
          });
        }
      }
    }
    // Se DESCONHECIDA, não adiciona
  }

  return resultados.sort((a, b) => (a.dia ?? 99) - (b.dia ?? 99));
}
