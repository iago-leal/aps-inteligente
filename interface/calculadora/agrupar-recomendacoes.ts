// Agrupador de recomendações — feature 005-redacao-metformina-tfg (RF-01/RF-02).
// A subordinação é relação de APRESENTAÇÃO: o motor de domínio permanece
// intocado (RF-03); este módulo só reorganiza a lista para renderização,
// no mesmo molde de módulo puro de interface de validacao-campos.ts (D-01/D-02).
import type { Recomendacao, TipoRecomendacao } from "models/insulina/tipos";

export interface GrupoDeRecomendacoes {
  readonly principal: Recomendacao;
  readonly subitens: readonly Recomendacao[];
}

// Par clínico validado pelo prescritor (requirements §9, sessão 2026-07-22):
// a redução por TFG qualifica a manutenção da metformina — manter, com dose
// reduzida. Subitem sem pai presente permanece item de topo (fallback D-02,
// caso da titulação sem fracionamento).
const SUBORDINACOES: Partial<Record<TipoRecomendacao, TipoRecomendacao>> = {
  REDUZIR_METFORMINA_TFG: "MANTER_METFORMINA",
};

export function agruparRecomendacoes(
  itens: readonly Recomendacao[],
): GrupoDeRecomendacoes[] {
  const tiposPresentes = new Set(itens.map((item) => item.tipo));
  const subordinada = (item: Recomendacao): boolean => {
    const tipoDoPai = SUBORDINACOES[item.tipo];
    return tipoDoPai !== undefined && tiposPresentes.has(tipoDoPai);
  };

  return itens
    .filter((item) => !subordinada(item))
    .map((principal) => ({
      principal,
      subitens: itens.filter(
        (item) => subordinada(item) && SUBORDINACOES[item.tipo] === principal.tipo,
      ),
    }));
}
