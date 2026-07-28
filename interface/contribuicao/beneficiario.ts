// Ponto ÚNICO de configuração do beneficiário da contribuição voluntária
// (feature 019: RF-10; RN-09; roadmap D-09). Vive na camada de apresentação, e
// não no domínio, porque é dado de instalação e não regra: `models/contribuicao`
// recebe os valores por parâmetro e não sabe que esta constante existe.
//
// O QUE MUDA AO EDITAR ESTE ARQUIVO. Trocar a chave troca o destinatário de toda
// contribuição, no QR e nos dois comandos de cópia, sem que mais nada precise
// mudar. Nome e cidade aparecem na tela de confirmação do aplicativo de quem
// contribui, e é por eles que a pessoa reconhece para quem está transferindo.
// Os limites do padrão são verificados pelo módulo puro, que RECUSA em vez de
// truncar: nome acima de 25 caracteres ou cidade acima de 15 fazem o painel
// exibir erro em desenvolvimento, e não um beneficiário errado na câmera.
//
// A chave é pública por natureza — existe para ser exibida —, e por isso mora no
// repositório e não em `NEXT_PUBLIC_*`, que num produto client-side terminaria no
// mesmo bundle sem proteger nada (RN-09, decidido em 28/07/2026).

export interface Beneficiario {
  readonly chave: string;
  readonly nome: string;
  readonly cidade: string;
}

/**
 * Valores de EXEMPLO, declarados como tais. Existem para que a feature possa ser
 * desenvolvida e testada antes de a chave real ser emitida, e permanecem no
 * código depois disso como oráculo da guarda de
 * `tests/unit/interface/beneficiario-sem-exemplo.test.ts`, que reprova a suíte
 * enquanto o `BENEFICIARIO` abaixo ainda for igual a qualquer um deles.
 */
export const EXEMPLO: Beneficiario = Object.freeze({
  chave: "00000000-0000-0000-0000-000000000000",
  nome: "BENEFICIARIO DE EXEMPLO",
  cidade: "CIDADE EXEMPLO",
});

/**
 * Congelado no molde do `CATALOGO`: fonte única, sem cópia espalhada pela árvore.
 * Valores reais do mantenedor, recebidos em 28/07/2026 (encerram a lacuna `D-02`).
 *
 * A cidade fica aqui na forma civil, com acento; a normalização do módulo remove
 * os diacríticos antes de montar o payload, porque o padrão do Banco Central
 * admite apenas ASCII. Quem contribui vê "Goiania" na confirmação do aplicativo,
 * e o comprimento que conta para o limite de 15 caracteres é o do texto já
 * normalizado.
 */
export const BENEFICIARIO: Beneficiario = Object.freeze({
  chave: "3bd85538-97ca-416d-8529-e3854b3394ff",
  nome: "Iago Leal",
  cidade: "Goiânia",
});
