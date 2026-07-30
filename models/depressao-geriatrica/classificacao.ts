// As três faixas de resultado e a resolução do escore em faixa (RF-04; RN-04; D-04).
// Feature 023-saude-do-idoso-gds.
//
// AS FAIXAS SÃO DADO ORDENADO, E NÃO CADEIA DE `if` (D-04, regra 53 do `domain.md`). Os
// cortes são o segundo lugar em que a transcrição de instrumentos erra, depois da chave de
// pontuação, e uma cadeia de comparações mistura o número transcrito com o operador que o
// lê — de modo que um `>` no lugar de um `>=` desloca a fronteira sem tocar em número
// nenhum. Como dado, o corte é conferível contra a fonte por igualdade simples, e é o que
// `transcricao.test.ts` faz.
//
// A COBERTURA DE 0 A 15 É PROPRIEDADE DO DADO, e não do código que o lê: as três faixas se
// encadeiam com limites inclusivos nas duas pontas, sem buraco nem sobreposição. O espaço é
// inteiramente enumerável, e `escore.test.ts` o varre por completo em vez de amostrá-lo, o
// que dispensa aqui a fronteira dupla que a puericultura precisou declarar.
//
// Fonte: Escala de Depressão Geriátrica (GDS), Linhas de Cuidado, Ministério da Saúde,
// "Avaliações dos resultados".
import { ErroDeInvariante, type FaixaDeResultado } from "./tipos";

export const FAIXAS: readonly FaixaDeResultado[] = Object.freeze([
  Object.freeze({ de: 0, ate: 5, rotulo: "se considera normal" }),
  Object.freeze({ de: 6, ate: 10, rotulo: "indica depressão leve" }),
  Object.freeze({ de: 11, ate: 15, rotulo: "depressão severa" }),
]);

export function faixaDoEscore(escore: number): FaixaDeResultado {
  const faixa = FAIXAS.find((f) => escore >= f.de && escore <= f.ate);
  if (faixa === undefined) {
    // Escore fora de 0–15 é impossível por construção: a soma percorre quinze itens e
    // acrescenta no máximo um ponto por item. Chegar aqui é bug, e bug se anuncia (ADR 0004).
    throw new ErroDeInvariante(`Escore fora das faixas da fonte: ${escore}`);
  }
  return faixa;
}
