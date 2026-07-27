// Teste da elegibilidade (ação T015; RF-07, RN-08, RN-18; D-15, D-16).
// Cobre os cenários negativos 10, 11 e 12 do `requirements.md` §7.
//
// Os dois pares de limite estão aqui porque um dia de erro em qualquer deles é
// clinicamente consequente nas duas direções: recusar quem a tabela cobre nega
// leitura possível; ler quem ela não cobre devolve escore extrapolado com aparência
// de publicado. E a recusa PARCIAL do perímetro cefálico é a novidade desta unit
// frente ao molde da 014 — o teste vigia que ela não derrube os outros índices.
import { describe, expect, it } from "vitest";
import {
  foraDoEscopo,
  perimetroCefalicoForaDoEscopo,
} from "models/puericultura/elegibilidade";
import { derivarIdades } from "models/puericultura/idades";
import type { IdadesDerivadas } from "models/puericultura/tipos";
import { dataApos, entradaAvaliacao } from "../../apoio/puericultura";

const NASCIMENTO = "2016-01-10";

function idadesApos(
  dias: number,
  ig?: { semanas: number; dias: number },
): IdadesDerivadas {
  return derivarIdades(
    entradaAvaliacao({
      dataDeNascimento: NASCIMENTO,
      dataDaMedicao: dataApos(NASCIMENTO, dias),
      idadeGestacionalAoNascer: ig,
    }),
  );
}

describe("cobertura superior da fonte: o par 3682/3683 dias (D-15, cenário 10)", () => {
  it("3682 dias ainda está coberto — é o último dia do mês 120", () => {
    expect(foraDoEscopo(idadesApos(3682))).toBeNull();
  });

  it("3683 dias recusa globalmente, sem número algum", () => {
    const recusa = foraDoEscopo(idadesApos(3683));

    expect(recusa).not.toBeNull();
    expect(recusa?.motivo).toBe("IDADE_FORA_DA_COBERTURA");
    expect(recusa?.tipo).toBe("fora-do-escopo");
    expect(recusa?.mensagem).toContain("0 a 10 anos");
    expect(recusa?.referencia.fonteId).toBe("caderneta-da-crianca-ms-2ed-2020");
  });

  it("criança de 12 anos: recusa com a idade dita na mensagem", () => {
    const recusa = foraDoEscopo(idadesApos(4383));

    expect(recusa?.motivo).toBe("IDADE_FORA_DA_COBERTURA");
    expect(recusa?.mensagem).toContain("12 anos");
  });

  it("a recusa não traz escore: a mensagem é texto, não número estimado", () => {
    const recusa = foraDoEscopo(idadesApos(4383));

    expect(recusa).not.toHaveProperty("escoreZ");
    expect(recusa).not.toHaveProperty("indices");
  });
});

describe("fronteira inferior das curvas de pré-termo (RN-18, cenário 11)", () => {
  it("26 semanas pós-menstruais recusam globalmente", () => {
    // Nascido com 26 semanas, medido no dia do nascimento.
    const recusa = foraDoEscopo(idadesApos(0, { semanas: 26, dias: 0 }));

    expect(recusa?.motivo).toBe("ABAIXO_DA_CURVA_DE_PRETERMO");
    expect(recusa?.mensagem).toContain("27 semanas");
  });

  it("27 semanas exatas já estão dentro: a fronteira é inclusiva", () => {
    expect(foraDoEscopo(idadesApos(7, { semanas: 26, dias: 0 }))).toBeNull();
    expect(foraDoEscopo(idadesApos(0, { semanas: 27, dias: 0 }))).toBeNull();
  });

  it("26 semanas e 6 dias ainda recusam — a fronteira é em semanas exatas", () => {
    const recusa = foraDoEscopo(idadesApos(6, { semanas: 26, dias: 0 }));

    expect(recusa?.motivo).toBe("ABAIXO_DA_CURVA_DE_PRETERMO");
    expect(recusa?.mensagem).toContain("26,9 semanas");
  });

  it("a criança a termo não tem fronteira inferior: recém-nascido de 0 dias passa", () => {
    expect(foraDoEscopo(idadesApos(0))).toBeNull();
    expect(foraDoEscopo(idadesApos(0, { semanas: 39, dias: 0 }))).toBeNull();
  });

  it("a fronteira de pré-termo precede a de cobertura quando as duas se aplicariam", () => {
    // Impossível na prática, mas o teste fixa a ordem de precedência do módulo.
    const idades: IdadesDerivadas = {
      diasDeVida: 4000,
      descontoDeSemanas: 14,
      diasCorrigidos: 4000,
      correcaoAtiva: false,
      semanasPosMenstruais: 26,
    };

    expect(foraDoEscopo(idades)?.motivo).toBe("ABAIXO_DA_CURVA_DE_PRETERMO");
  });
});

describe("recusa PARCIAL do perímetro cefálico: o par 730/731 (D-16, cenário 12)", () => {
  it("aos 730 dias o perímetro cefálico ainda é calculável", () => {
    expect(perimetroCefalicoForaDoEscopo(idadesApos(730))).toBeNull();
  });

  it("aos 731 dias ele sai do escopo, com motivo próprio", () => {
    const fora = perimetroCefalicoForaDoEscopo(idadesApos(731));

    expect(fora?.motivo).toBe("PC_ACIMA_DE_2_ANOS");
    expect(fora?.indice).toBe("perimetro-cefalico-idade");
    expect(fora?.mensagem).toContain("0 a 2 anos");
    expect(fora?.referencia.localizacao).toContain("p. 88");
  });

  it("é recusa de ÍNDICE, não de saída: o discriminante é `estado`, não `tipo`", () => {
    const fora = perimetroCefalicoForaDoEscopo(idadesApos(1095));

    expect(fora?.estado).toBe("fora-do-escopo");
    expect(fora).not.toHaveProperty("tipo");
  });

  it("criança de 3 anos: PC fora do escopo, e nenhuma recusa global junto", () => {
    const idades = idadesApos(1095);

    expect(perimetroCefalicoForaDoEscopo(idades)?.motivo).toBe(
      "PC_ACIMA_DE_2_ANOS",
    );
    expect(foraDoEscopo(idades)).toBeNull();
  });
});

describe("a idade que decide o escopo é a que indexa a curva (RN-16)", () => {
  it("no prematuro com correção ativa, o escopo do PC segue a idade corrigida", () => {
    const ig30 = { semanas: 30, dias: 0 };
    // 730 dias cronológicos − 70 de desconto = 660 corrigidos: ainda dentro.
    const comCorrecao = idadesApos(730, ig30);

    expect(comCorrecao.correcaoAtiva).toBe(true);
    expect(comCorrecao.diasCorrigidos).toBe(660);
    expect(perimetroCefalicoForaDoEscopo(comCorrecao)).toBeNull();
  });

  it("passado o limite da correção, a idade volta a ser a cronológica também no escopo", () => {
    const ig30 = { semanas: 30, dias: 0 };
    const semCorrecao = idadesApos(731, ig30);

    expect(semCorrecao.correcaoAtiva).toBe(false);
    expect(perimetroCefalicoForaDoEscopo(semCorrecao)?.motivo).toBe(
      "PC_ACIMA_DE_2_ANOS",
    );
  });
});
