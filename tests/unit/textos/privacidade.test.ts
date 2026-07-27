// A cláusula de privacidade sobrevive à revisão (T057; D-20; RNF de privacidade).
//
// AS SEIS `description` afirmam hoje que o cálculo não sai do navegador. O que este teste
// guarda é a AFIRMAÇÃO, não a redação — e a distinção é a decisão inteira.
//
// Congelar `Cálculo 100% no navegador: nada é salvo nem enviado.` poria um requisito não
// funcional a vetar a revisão que a feature existe para fazer, já que a cláusula é prosa
// autoral como qualquer outra e o guia pode reescrevê-la. Não asseverar nada devolveria a
// uniformidade à disciplina de quem edita — que é exatamente o mecanismo que já falhou e
// produziu o defeito da descrição desatualizada da home.
//
// A forma fraca, portanto: a promessa tem de estar lá, em alguma redação conforme ao guia.
// O que não pode desaparecer por descuido de reescrita é a afirmação.
//
// Ele NÃO depende do inventário: lê as seis rotas direto.

import { describe, expect, it } from "vitest";

import { ROTAS, descricaoDaRota } from "../../apoio/superficie-textual";

/**
 * A asserção fraca, em duas partes. A primeira fixa ONDE o cálculo acontece; a segunda, o
 * que NÃO acontece com o dado. Uma redação nova precisa dizer as duas coisas, e é livre
 * quanto ao modo de dizê-las.
 */
function afirmaPrivacidade(descricao: string): boolean {
  const ondeCalcula = /navegador|no cliente|local(mente)?\b/i.test(descricao);
  const oQueNaoAcontece =
    /\bnada\b|\bnão\b|\bnem\b/i.test(descricao) &&
    /salv|enviad|envia|transmit|sai\b|arma?zena/i.test(descricao);
  return ondeCalcula && oQueNaoAcontece;
}

describe("cláusula de privacidade nas seis rotas (forma fraca, D-20)", () => {
  it("as seis rotas estão declaradas", () => {
    expect(
      ROTAS.length,
      "a lista de rotas encolheu ou cresceu. Rota nova entra aqui: uma rota sem cláusula " +
        "de privacidade é uma rota que promete menos que as outras cinco.",
    ).toBe(6);
  });

  for (const rota of ROTAS) {
    it(`${rota} afirma que o cálculo não sai do navegador`, () => {
      const descricao = descricaoDaRota(rota);
      expect(
        afirmaPrivacidade(descricao),
        `a descrição de ${rota} deixou de afirmar a privacidade do cálculo.\n` +
          `  ${JSON.stringify(descricao)}\n\n` +
          `A asserção é deliberadamente FRACA: a redação de hoje não está congelada, e o ` +
          `guia pode reescrevê-la. O que ela exige é que o texto continue dizendo onde o ` +
          `cálculo acontece (no navegador) e o que não acontece com o dado (não é salvo ` +
          `nem enviado). Privacidade por construção é ADR 0002, e a promessa ao leitor é ` +
          `parte dela.`,
      ).toBe(true);
    });
  }
});
