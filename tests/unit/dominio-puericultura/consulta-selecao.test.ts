// T008 (feature 020) — a seleção da ficha pela idade (RF-03, RN-04, RN-05; D-07).
//
// O motor INFORMA qual ficha a idade indica; quem escolhe é o prescritor (ADR 0005). Três
// coisas se provam aqui: que cada uma das dez fichas é sugerida dentro da sua faixa, que a
// idade entre duas consultas previstas cai na ficha ANTERIOR, e que a espécie de idade que
// governou a escolha volta junto com a sugestão — sem ela, a tela teria de reescrever a
// regra de RN-05 para poder declarar no registro qual idade decidiu.
import { describe, expect, it } from "vitest";
import { FICHAS } from "models/puericultura/consulta/fichas/indice";
import { sugerirFicha } from "models/puericultura/consulta/selecao";
import { derivarIdades } from "models/puericultura/idades";

function idadesEm(diasDeVida: number) {
  return derivarIdades({
    sexo: "masculino",
    dataDeNascimento: "2020-01-01",
    dataDaMedicao: new Date(Date.UTC(2020, 0, 1 + diasDeVida))
      .toISOString()
      .slice(0, 10),
  });
}

describe("Faixas das dez fichas (RN-02)", () => {
  it("declara exatamente dez consultas datadas", () => {
    expect(FICHAS).toHaveLength(10);
  });

  it("cobre a idade sem lacuna e sem sobreposição, da 1.ª Semana em diante", () => {
    expect(FICHAS[0]?.faixaEmDias.de).toBe(0);
    for (let i = 1; i < FICHAS.length; i += 1) {
      expect(
        FICHAS[i]!.faixaEmDias.de,
        `a faixa de ${FICHAS[i]!.id} começa onde a de ${FICHAS[i - 1]!.id} termina`,
      ).toBe(FICHAS[i - 1]!.faixaEmDias.ate + 1);
    }
  });

  it.each(FICHAS.map((f) => [f.id, f] as const))(
    "sugere %s no primeiro e no último dia da sua faixa",
    (_id, ficha) => {
      expect(sugerirFicha(idadesEm(ficha.faixaEmDias.de)).ficha.id).toBe(
        ficha.id,
      );
      const ultimo = Math.min(ficha.faixaEmDias.ate, 4000);
      expect(sugerirFicha(idadesEm(ultimo)).ficha.id).toBe(ficha.id);
    },
  );
});

describe("Idade entre duas consultas previstas (RN-04)", () => {
  it("cai na ficha imediatamente anterior", () => {
    // Sete meses não é consulta prevista: a fonte imprime 6.º e 9.º, e nada entre eles.
    const seteMeses = sugerirFicha(idadesEm(213));
    expect(seteMeses.ficha.id).toBe("sexto-mes");
  });

  it("recolhe no 36.º Mês toda idade acima da última consulta datada", () => {
    expect(sugerirFicha(idadesEm(2000)).ficha.id).toBe("trigesimo-sexto-mes");
  });

  it("sugere a ficha do 4.º Mês aos 4 meses e 10 dias (RF-03)", () => {
    const idades = derivarIdades({
      sexo: "masculino",
      dataDeNascimento: "2026-03-10",
      dataDaMedicao: "2026-07-20",
    });
    expect(sugerirFicha(idades).ficha.id).toBe("quarto-mes");
  });
});

describe("A espécie de idade que governou (RN-05)", () => {
  it("é a cronológica na criança nascida a termo", () => {
    const sugestao = sugerirFicha(idadesEm(150));
    expect(sugestao.especieDeIdade).toBe("cronologica");
    expect(sugestao.diasDeVida).toBe(150);
  });

  it("é a cronológica também no nascido pré-termo, e não a corrigida", () => {
    // 32 semanas ao nascer descontam 8 semanas: a corrigida indicaria outra ficha.
    const idades = derivarIdades({
      sexo: "masculino",
      dataDeNascimento: "2026-01-01",
      dataDaMedicao: "2026-05-31",
      idadeGestacionalAoNascer: { semanas: 32, dias: 0 },
    });
    expect(idades.diasCorrigidos).toBeLessThan(idades.diasDeVida);

    const sugestao = sugerirFicha(idades);
    expect(sugestao.especieDeIdade).toBe("cronologica");
    expect(sugestao.diasDeVida).toBe(idades.diasDeVida);
    expect(sugestao.ficha.id).toBe(
      sugerirFicha(idadesEm(idades.diasDeVida)).ficha.id,
    );
  });
});
