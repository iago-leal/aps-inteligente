// Fachada CalculadoraCardiopatiaIsquemica — API pública única da unit (RF-01..RF-09;
// RN-01..RN-09): validação → escopo (idade) → classificação da dor → probabilidade
// pré-teste com ajuste por fatores de risco → conduta de investigação → advertências
// e referências. Pura e determinística; erro esperado é valor (ADR 0004); toda saída
// carrega referência (invariante RN-09). Feature 010-dor-toracica-pre-teste.
import { classificarDor } from "./classificacao";
import { advertenciasPara, condutaPara } from "./conduta";
import { REFERENCIAS } from "./fonte-clinica";
import {
  ajustarPorFatoresDeRisco,
  estratoDe,
  faixaEtariaDe,
  probabilidadeBasePct,
} from "./probabilidade";
import { validarEntrada } from "./validacao";
import {
  ErroDeInvariante,
  type EntradaAvaliacao,
  type ReferenciaClinica,
  type SaidaAvaliacao,
} from "./tipos";

function semDuplicatas(
  referencias: readonly ReferenciaClinica[],
): ReferenciaClinica[] {
  const vistas = new Set<string>();
  return referencias.filter((r) => {
    if (vistas.has(r.localizacao)) return false;
    vistas.add(r.localizacao);
    return true;
  });
}

export class CalculadoraCardiopatiaIsquemica {
  avaliar(entrada: EntradaAvaliacao): SaidaAvaliacao {
    const ofensores = validarEntrada(entrada);
    if (ofensores.length > 0) {
      return { tipo: "erro-validacao", ofensores };
    }

    const faixaEtaria = faixaEtariaDe(entrada.idadeAnos);
    if (faixaEtaria === null) {
      return {
        tipo: "fora-do-escopo",
        motivo: "IDADE_FORA_DA_TABELA",
        mensagem: `Idade de ${entrada.idadeAnos} anos fora do Quadro 2, que cobre de 30 a 69 anos: a fonte não estima a probabilidade pré-teste para esta idade.`,
        referencia: REFERENCIAS.probabilidadePreTeste,
      };
    }

    const classificacaoDor = classificarDor(entrada.caracteristicas);
    const basePct = probabilidadeBasePct(
      classificacaoDor,
      entrada.sexo,
      faixaEtaria,
    );
    const probabilidadeAjustada = ajustarPorFatoresDeRisco(
      basePct,
      entrada.fatoresDeRisco.length,
    );
    const estrato = estratoDe(classificacaoDor, basePct, probabilidadeAjustada);
    const conduta = condutaPara(estrato, entrada.impedimentoErgometria ?? false);
    const advertencias = advertenciasPara(entrada.sinaisInstabilidade ?? false);

    const referencias = semDuplicatas([
      REFERENCIAS.classificacaoDor,
      REFERENCIAS.probabilidadePreTeste,
      ...(probabilidadeAjustada !== undefined
        ? [REFERENCIAS.ajusteFatoresDeRisco]
        : []),
      conduta.referencia,
      ...advertencias.map((a) => a.referencia),
    ]);
    if (referencias.length === 0) {
      // RN-09: saída sem referência clínica não pode existir (invariante).
      throw new ErroDeInvariante("Resultado sem referência clínica");
    }

    return {
      tipo: "resultado",
      classificacaoDor,
      faixaEtaria,
      probabilidadeBasePct: basePct,
      ...(probabilidadeAjustada !== undefined ? { probabilidadeAjustada } : {}),
      estrato,
      conduta,
      advertencias,
      referencias,
    };
  }
}
