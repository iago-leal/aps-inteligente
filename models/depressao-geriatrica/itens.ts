// Os quinze itens da escala como DADO CONGELADO (RF-03; RN-02/RN-03; D-02). Feature
// 023-saude-do-idoso-gds.
//
// ORIGEM DE CADA CAMPO. O `numero` e o `texto` vêm da tabela da fonte, transcritos byte a
// byte, inclusive o desdobramento de gênero entre parênteses que ela adota. O
// `respostaQuePontua` NÃO VEM DO TEXTO: a fonte publica a chave pela cor da célula, com a
// classe `bg-table-light-grey` na resposta que pontua (`MD-0038`), e é dela que esta coluna
// foi lida, item a item. Quem reconferir precisa saber onde olhar, porque o texto extraído
// da página não carrega a informação.
//
// POR QUE DADO, E NÃO CADEIA DE CONDICIONAIS (D-02). A escala mistura dez itens em que
// pontua o "Sim" com cinco em que pontua o "Não" — os de número 1, 5, 7, 11 e 13 —, e é
// exatamente o ponto em que a transcrição de instrumentos erra. Como dado, a direção tem um
// lugar só, e `tests/unit/dominio-depressao-geriatrica/transcricao.test.ts` a confere contra
// o congelado da fonte. Como cadeia de `if`, ela estaria espalhada por quinze ramos e nenhum
// oráculo alcançaria todos.
//
// Fonte: Escala de Depressão Geriátrica (GDS), Linhas de Cuidado, Ministério da Saúde,
// tabela dos quinze itens; cópia datada em `referencias/saude-do-idoso/`, lida em 30/07/2026.
import type { ItemDaEscala } from "./tipos";

/** Congelamento profundo: o dado da fonte não se altera em tempo de execução. */
export const ITENS: readonly ItemDaEscala[] = Object.freeze([
  Object.freeze({
    id: "item-01",
    numero: 1,
    texto: "Está satisfeito(a) com sua vida?",
    respostaQuePontua: "nao" as const,
  }),
  Object.freeze({
    id: "item-02",
    numero: 2,
    texto: "Interrompeu muitas de suas atividades?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-03",
    numero: 3,
    texto: "Acha sua vida vazia?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-04",
    numero: 4,
    texto: "Aborrece-se com frequência?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-05",
    numero: 5,
    texto: "Sente-se bem com a vida na maior parte do tempo?",
    respostaQuePontua: "nao" as const,
  }),
  Object.freeze({
    id: "item-06",
    numero: 6,
    texto: "Teme que algo ruim lhe aconteça?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-07",
    numero: 7,
    texto: "Sente-se alegre a maior parte do tempo?",
    respostaQuePontua: "nao" as const,
  }),
  Object.freeze({
    id: "item-08",
    numero: 8,
    texto: "Sente-se desamparado com frequência?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-09",
    numero: 9,
    texto: "Prefere ficar em casa a sair e fazer coisas novas?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-10",
    numero: 10,
    texto: "Acha que tem mais problemas de memória que outras pessoas?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-11",
    numero: 11,
    texto: "Acha que é maravilhoso estar vivo(a)?",
    respostaQuePontua: "nao" as const,
  }),
  Object.freeze({
    id: "item-12",
    numero: 12,
    texto: "Sente-se inútil?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-13",
    numero: 13,
    texto: "Sente-se cheio(a) de energia?",
    respostaQuePontua: "nao" as const,
  }),
  Object.freeze({
    id: "item-14",
    numero: 14,
    texto: "Sente-se sem esperança?",
    respostaQuePontua: "sim" as const,
  }),
  Object.freeze({
    id: "item-15",
    numero: 15,
    texto: "Acha que os outros têm mais sorte que você?",
    respostaQuePontua: "sim" as const,
  }),
]);
