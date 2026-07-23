// Fachada CalculadoraRiscoCardiovascular — API pública única da unit (RF-01..RF-10;
// RN-01..RN-09): validação → escopo (idade, DCV prévia) → clamp fisiológico →
// equação PCE → categoria de risco, com nota de proveniência e referências. Pura e
// determinística; o motor apenas INFORMA o risco, nunca escolhe conduta (ADR 0005);
// erro esperado é valor (ADR 0004); toda saída de resultado carrega ≥1 referência
// (invariante RF-08). Feature 014-risco-cardiovascular-pce.
import { foraDoEscopo } from "./elegibilidade";
import { categoriaDe } from "./categoria";
import { grupoDe, riscoAscvdPct } from "./equacao";
import { NOTA_PROVENIENCIA, REFERENCIAS } from "./fonte-clinica";
import { clamparEntrada, validarEntrada } from "./validacao";
import {
  ErroDeInvariante,
  type EntradaEstimativa,
  type ReferenciaClinica,
  type SaidaEstimativa,
} from "./tipos";

export class CalculadoraRiscoCardiovascular {
  estimar(entrada: EntradaEstimativa): SaidaEstimativa {
    const ofensores = validarEntrada(entrada);
    if (ofensores.length > 0) {
      return { tipo: "erro-validacao", ofensores };
    }

    const escopo = foraDoEscopo(entrada);
    if (escopo !== null) {
      return escopo;
    }

    const { variaveis, avisos } = clamparEntrada(entrada);
    const grupo = grupoDe(entrada.sexo, entrada.raca);
    const riscoPct = riscoAscvdPct(grupo, variaveis);

    const referencias: readonly ReferenciaClinica[] = [
      REFERENCIAS.equacoes,
      REFERENCIAS.categorias,
    ];
    if (referencias.length === 0) {
      // RF-08: resultado sem referência clínica não pode existir (invariante).
      throw new ErroDeInvariante("Resultado sem referência clínica");
    }

    return {
      tipo: "resultado",
      riscoPct,
      categoria: categoriaDe(riscoPct),
      avisos,
      notaProveniencia: NOTA_PROVENIENCIA,
      referencias,
    };
  }
}
