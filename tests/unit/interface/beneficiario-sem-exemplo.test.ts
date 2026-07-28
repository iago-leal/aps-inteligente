// T029 (feature 019) — guarda contra publicar o beneficiário de exemplo.
//
// O modo de falha que ela existe para impedir é silencioso do nosso lado: o QR
// aponta para chave inexistente, tudo passa na suíte, tudo passa no build, e o
// erro só aparece para quem tentou contribuir e viu o aplicativo do banco
// recusar. Não há como o produto perceber sozinho, porque o PIX estático não
// devolve nada ao site.
//
// Os três valores reais chegaram em 28/07/2026 (T028), e a guarda passou a valer.
// Ela ficou em `it.todo` enquanto a configuração era de exemplo, para não mentir
// dizendo verde nem travar a suíte por dado que ainda não existia.
import { describe, expect, it } from "vitest";
import { BENEFICIARIO, EXEMPLO } from "interface/contribuicao/beneficiario";

describe("Configuração publicada do beneficiário (RN-09; T028)", () => {
  it("a chave não é a de exemplo", () => {
    expect(BENEFICIARIO.chave).not.toBe(EXEMPLO.chave);
  });

  it("o nome não é o de exemplo", () => {
    expect(BENEFICIARIO.nome).not.toBe(EXEMPLO.nome);
  });

  it("a cidade não é a de exemplo", () => {
    expect(BENEFICIARIO.cidade).not.toBe(EXEMPLO.cidade);
  });
});

// Estas valem desde já: independem de os valores serem reais ou de exemplo, e
// guardam a forma da configuração, que é o que o módulo puro exige para emitir
// payload em vez de recusar.
describe("Forma da configuração, válida em qualquer estado", () => {
  it("está congelada, como manda RN-09", () => {
    expect(Object.isFrozen(BENEFICIARIO)).toBe(true);
  });

  it("nenhum dos três campos está vazio", () => {
    expect(BENEFICIARIO.chave.trim().length).toBeGreaterThan(0);
    expect(BENEFICIARIO.nome.trim().length).toBeGreaterThan(0);
    expect(BENEFICIARIO.cidade.trim().length).toBeGreaterThan(0);
  });

  it("nome e cidade cabem nos limites do padrão, que recusa em vez de truncar", () => {
    expect(BENEFICIARIO.nome.length).toBeLessThanOrEqual(25);
    expect(BENEFICIARIO.cidade.length).toBeLessThanOrEqual(15);
  });
});
