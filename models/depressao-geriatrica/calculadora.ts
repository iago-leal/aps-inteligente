// Fachada EscalaDepressaoGeriatrica — API pública única da unit (RF-01..RF-07;
// RN-01..RN-08): validação → escore → faixa → resultado com providência, advertência e
// referências. Pura e determinística; erro esperado é valor (ADR 0004); toda saída carrega
// referência (RN-01). Feature 023-saude-do-idoso-gds.
//
// A ORDEM DAS ETAPAS É A REGRA, e não conveniência de escrita: a validação vem primeiro
// porque escore calculado sobre entrada incompleta é número que parece resultado e não é
// (RN-06). Não há etapa de escopo entre elas, como nos units de cardiologia, porque este
// domínio não tem recusa a fazer: a fonte não publica faixa etária (RN-07, D-07).
import { faixaDoEscore } from "./classificacao";
import { calcularEscore } from "./escore";
import { PROVIDENCIA, REFERENCIAS, TEXTO_ADVERTENCIA } from "./fonte-clinica";
import { validarRespostas } from "./validacao";
import {
  ErroDeInvariante,
  type Advertencia,
  type ReferenciaClinica,
  type RespostasDaEscala,
  type SaidaAvaliacao,
} from "./tipos";

/**
 * RN-05: a advertência acompanha TODA saída de resultado, em qualquer faixa. Escore baixo
 * também é leitura de um instrumento de rastreamento, e omitir ali a ressalva convidaria à
 * leitura diagnóstica exatamente onde ela parece inofensiva.
 */
const ADVERTENCIAS: readonly Advertencia[] = Object.freeze([
  Object.freeze({
    tipo: "RASTREAMENTO_NAO_DIAGNOSTICO" as const,
    mensagem: TEXTO_ADVERTENCIA.rastreamentoNaoDiagnostico,
    referencia: REFERENCIAS.itens,
  }),
]);

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

export class EscalaDepressaoGeriatrica {
  avaliar(respostas: RespostasDaEscala): SaidaAvaliacao {
    const ofensores = validarRespostas(respostas);
    if (ofensores.length > 0) {
      return { tipo: "erro-validacao", ofensores };
    }

    const escore = calcularEscore(respostas);
    const faixa = faixaDoEscore(escore);

    const referencias = semDuplicatas([
      REFERENCIAS.itens,
      REFERENCIAS.pontuacao,
      REFERENCIAS.faixas,
      PROVIDENCIA.referencia,
    ]);
    if (referencias.length === 0) {
      // RN-01: saída sem referência clínica não pode existir (invariante).
      throw new ErroDeInvariante("Resultado sem referência clínica");
    }

    return {
      tipo: "resultado",
      escore,
      faixa,
      providencia: PROVIDENCIA,
      advertencias: ADVERTENCIAS,
      referencias,
    };
  }
}
