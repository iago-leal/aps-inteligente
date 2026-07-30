// Validação de entrada com COLETA TOTAL de ofensores (RF-05; RN-06; D-03). Feature
// 023-saude-do-idoso-gds.
//
// A regra 15 do `domain.md`: nunca parar no primeiro. Aqui ela tem consequência prática
// maior que nos outros units, porque a escala tem quinze campos — devolver um ofensor por
// vez faria o prescritor descobrir o segundo item em branco só depois de corrigir o
// primeiro, quinze vezes se preciso.
//
// A AUSÊNCIA DE CHAVE É A AUSÊNCIA DE RESPOSTA. Não há terceiro valor a testar: o mapa de
// entrada ou traz a resposta do item, ou não a traz. Chave desconhecida no mapa não é
// resposta de item nenhum, e por isso não completa a escala — o que este módulo garante ao
// percorrer os ITENS, e não as chaves recebidas.
//
// Nunca lança: erro esperado é valor (ADR 0004).
import { ITENS } from "./itens";
import type { Ofensor, RespostasDaEscala } from "./tipos";

export function validarRespostas(respostas: RespostasDaEscala): Ofensor[] {
  const ofensores: Ofensor[] = [];

  for (const item of ITENS) {
    const resposta = respostas[item.id];
    if (resposta !== "sim" && resposta !== "nao") {
      ofensores.push({
        campo: item.id,
        codigo: "ITEM_NAO_RESPONDIDO",
        // O número e o enunciado nomeiam o item na tela: o prescritor precisa saber a qual
        // pergunta voltar, e o identificador interno não lhe diz nada.
        mensagem: `Item ${item.numero} sem resposta: ${item.texto}`,
      });
    }
  }

  return ofensores;
}
