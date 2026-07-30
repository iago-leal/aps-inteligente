// Cálculo do escore (RF-04; RN-03). Feature 023-saude-do-idoso-gds.
//
// A soma percorre o DADO dos itens e não tem condicional por item: cada item declara qual
// resposta pontua, e o motor apenas compara. Trocar a direção de um item é editar
// `itens.ts`, e o oráculo de transcrição reprova a edição que divergir da fonte. Se esta
// função tivesse quinze ramos, a chave estaria espalhada por eles e nenhum oráculo os
// alcançaria todos.
//
// PRESSUPÕE ENTRADA COMPLETA. Quem garante isso é `validacao.ts`, chamado antes na fachada:
// resposta ausente aqui simplesmente não pontua, e o escore parcial que daí sairia é
// justamente o que RN-06 proíbe de existir.
import { ITENS } from "./itens";
import type { RespostasDaEscala } from "./tipos";

export function calcularEscore(respostas: RespostasDaEscala): number {
  return ITENS.reduce(
    (soma, item) =>
      soma + (respostas[item.id] === item.respostaQuePontua ? 1 : 0),
    0,
  );
}
