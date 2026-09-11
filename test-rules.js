const assert = require("assert");

// Simulação das regras de negócio
function differenceInMonths(d1, d2) {
  return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
}

function calcularStatusPorAusencia(
  statusManual,
  dataCadastro,
  presencas,
  limiteAlerta = 3,
  limiteInativo = 12,
  dataReferencia = new Date()
) {
  if (statusManual === "INATIVO") {
    return { statusCalculado: "INATIVO", temAlertaAusencia: false, mesesSemPresenca: 0 };
  }

  const presencasConfirmadas = presencas
    .filter((p) => p.presente && p.encontro?.dataHora)
    .map((p) => new Date(p.encontro.dataHora))
    .sort((a, b) => b.getTime() - a.getTime());

  const ultimaData = presencasConfirmadas.length > 0
    ? presencasConfirmadas[0]
    : new Date(dataCadastro);

  const meses = differenceInMonths(dataReferencia, ultimaData);

  if (meses >= limiteInativo) {
    return { statusCalculado: "INATIVO", temAlertaAusencia: false, mesesSemPresenca: meses };
  }

  const temAlerta = meses >= limiteAlerta;
  return { statusCalculado: "ATIVO", temAlertaAusencia: temAlerta, mesesSemPresenca: meses };
}

function processarAniversariantesGrupo(integrantes, dataReferencia = new Date()) {
  const mesAtual = dataReferencia.getMonth() + 1;
  const anoAtual = dataReferencia.getFullYear();
  const diaAtual = dataReferencia.getDate();

  const resultados = [];

  for (const int of integrantes) {
    if (int.status !== "ATIVO") continue;

    if (int.tempoGrupoPrecisao === "COMPLETA" && int.tempoGrupoDataCompleta) {
      const data = new Date(int.tempoGrupoDataCompleta);
      const mes = data.getMonth() + 1;
      const dia = data.getDate();
      const ano = data.getFullYear();

      if (mes === mesAtual) {
        const anos = anoAtual - ano;
        if (anos > 0) {
          resultados.push({
            id: int.id,
            precisao: "COMPLETA",
            dia,
            tempoTexto: `${anos} ${anos === 1 ? "ano" : "anos"} de JUSC`,
            fazHoje: dia === diaAtual,
          });
        }
      }
    } else if (int.tempoGrupoPrecisao === "MES_ANO" && int.tempoGrupoMes && int.tempoGrupoAno) {
      if (int.tempoGrupoMes === mesAtual) {
        const anos = anoAtual - int.tempoGrupoAno;
        if (anos > 0) {
          resultados.push({
            id: int.id,
            precisao: "MES_ANO",
            dia: null,
            tempoTexto: `${anos} ${anos === 1 ? "ano" : "anos"} de JUSC (mês comemorativo)`,
            fazHoje: false,
          });
        }
      }
    }
  }

  return resultados;
}

console.log("Executando testes automatizados das Regras de Negócio...");

// Teste 1: Membro ativo com presença recente (< 3 meses)
const hoje = new Date(2026, 8, 11); // 11 de Setembro de 2026
const presencaRecente = new Date(2026, 8, 4); // 1 semana atrás
const resAtivo = calcularStatusPorAusencia("ATIVO", new Date(2025, 0, 1), [
  { presente: true, encontro: { dataHora: presencaRecente } },
], 3, 12, hoje);
assert.strictEqual(resAtivo.statusCalculado, "ATIVO");
assert.strictEqual(resAtivo.temAlertaAusencia, false);
console.log("✓ Teste 1 passou: Presença recente mantém Ativo sem alerta.");

// Teste 2: Membro com ausência prolongada (4 meses atrás)
const presenca4Meses = new Date(2026, 4, 11); // Maio de 2026 (4 meses)
const resAlerta = calcularStatusPorAusencia("ATIVO", new Date(2025, 0, 1), [
  { presente: true, encontro: { dataHora: presenca4Meses } },
], 3, 12, hoje);
assert.strictEqual(resAlerta.statusCalculado, "ATIVO");
assert.strictEqual(resAlerta.temAlertaAusencia, true);
assert.strictEqual(resAlerta.mesesSemPresenca, 4);
console.log("✓ Teste 2 passou: Ausência > 3 meses gera alerta de ausência prolongada.");

// Teste 3: Membro com ausência > 12 meses (14 meses)
const presenca14Meses = new Date(2025, 6, 11);
const resInativo = calcularStatusPorAusencia("ATIVO", new Date(2024, 0, 1), [
  { presente: true, encontro: { dataHora: presenca14Meses } },
], 3, 12, hoje);
assert.strictEqual(resInativo.statusCalculado, "INATIVO");
assert.strictEqual(resInativo.temAlertaAusencia, false);
console.log("✓ Teste 3 passou: Ausência >= 12 meses inativa automaticamente.");

// Teste 4: Membro inativado manualmente
const resManual = calcularStatusPorAusencia("INATIVO", new Date(2025, 0, 1), [
  { presente: true, encontro: { dataHora: presencaRecente } },
], 3, 12, hoje);
assert.strictEqual(resManual.statusCalculado, "INATIVO");
console.log("✓ Teste 4 passou: Inativação manual é sempre respeitada.");

// Teste 5: Aniversário de Grupo com precisão COMPLETA (faz aniversário HOJE)
const aniversariantesHoje = processarAniversariantesGrupo([
  {
    id: "1",
    status: "ATIVO",
    tempoGrupoPrecisao: "COMPLETA",
    tempoGrupoDataCompleta: new Date(2024, 8, 11), // 11 de Setembro de 2024
  },
  {
    id: "2",
    status: "ATIVO",
    tempoGrupoPrecisao: "MES_ANO",
    tempoGrupoMes: 9, // Setembro
    tempoGrupoAno: 2023,
  },
  {
    id: "3",
    status: "ATIVO",
    tempoGrupoPrecisao: "DESCONHECIDA",
  },
], hoje);

assert.strictEqual(aniversariantesHoje.length, 2);
assert.strictEqual(aniversariantesHoje[0].fazHoje, true);
assert.strictEqual(aniversariantesHoje[0].tempoTexto, "2 anos de JUSC");
assert.strictEqual(aniversariantesHoje[1].fazHoje, false);
assert.strictEqual(aniversariantesHoje[1].precisao, "MES_ANO");
console.log("✓ Teste 5 passou: Aniversário de grupo respeita 3 níveis de precisão e destaca dia exato.");

console.log("\nTodos os 5 testes de regras de negócio passaram com 100% de sucesso!");
