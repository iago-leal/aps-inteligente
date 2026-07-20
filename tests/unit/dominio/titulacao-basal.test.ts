// T008 — Validação da titulação basal (RF-02 do motor; R-05..R-07 da spec §6.1).
// Fonte: Figura 4 p. 62; decisões AMB-02, AMB-05, AMB-06 e AMB-09.
// T005 (001-integrar-design-claude) — gatilhos ampliados da sulfonilureia (RN-03; RF-03).
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import { TEXTO_SUSPENDER_SULFONILUREIA } from "models/insulina/fonte-clinica";
import {
  comoResultadoTitulacao,
  doseDe,
  entradaTitulacao,
  esquemaBasal,
  esquemaNphFracionada,
  jejum,
  tiposDeAlerta,
  tiposDeRecomendacao,
} from "../../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

// Esquema-base longe dos gatilhos de fracionamento (20 UI; peso 80 → 0,4 UI/kg = 32 UI).
const titulacao = (glicemias: ReturnType<typeof jejum>) =>
  comoResultadoTitulacao(
    calculadora.calcular(entradaTitulacao(esquemaBasal(20), glicemias)),
  );

describe("RegraTitulacaoBasal — tabela de ajuste por jejum (R-06)", () => {
  it("jejum ≥ 180 aumenta 4 UI (200 → 24 UI)", () => {
    const r = titulacao(jejum(200));
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(24);
    expect(r.deltaTotalUi).toBe(4);
  });

  it("jejum exatamente 180 aumenta 4 UI — prioridade ao braço ≥ 180 (AMB-09)", () => {
    const r = titulacao(jejum(180));
    expect(r.deltaTotalUi).toBe(4);
  });

  it("jejum 179 aumenta 2 UI (braço ≥ 130 e < 180)", () => {
    const r = titulacao(jejum(179));
    expect(r.deltaTotalUi).toBe(2);
  });

  it("jejum exatamente 130 aumenta 2 UI", () => {
    const r = titulacao(jejum(130));
    expect(r.deltaTotalUi).toBe(2);
  });

  it("jejum 129 mantém a dose e informa 'na meta' (AMB-02, AMB-05)", () => {
    const r = titulacao(jejum(129));
    expect(r.deltaTotalUi).toBe(0);
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(20);
    expect(r.naMeta).toBe(true);
  });

  it("jejum 71 mantém a dose e informa 'na meta' (piso da faixa-alvo)", () => {
    const r = titulacao(jejum(71));
    expect(r.deltaTotalUi).toBe(0);
    expect(r.naMeta).toBe(true);
  });

  it("jejum ≤ 70 reduz 4 UI com alerta de hipoglicemia (RN-05)", () => {
    const r = titulacao(jejum(70));
    expect(r.deltaTotalUi).toBe(-4);
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(16);
    expect(r.alertas[0]?.tipo).toBe("HIPOGLICEMIA");
    expect(r.naMeta).toBe(false);
  });
});

describe("RegraTitulacaoBasal — agregação de múltiplas glicemias (R-05 / AMB-06)", () => {
  it("usa a média das glicemias de jejum (180 e 120 → média 150 → +2 UI)", () => {
    const r = titulacao(jejum(180, 120));
    expect(r.deltaTotalUi).toBe(2);
  });

  it("qualquer valor ≤ 70 prevalece sobre a média (200 e 65 → −4 UI + alerta)", () => {
    const r = titulacao(jejum(200, 65));
    expect(r.deltaTotalUi).toBe(-4);
    expect(tiposDeAlerta(r)).toContain("HIPOGLICEMIA");
  });

  it("com hipoglicemia presente a recomendação nunca é aumento (RN-05)", () => {
    const r = titulacao(jejum(300, 70, 250));
    expect(r.deltaTotalUi).toBeLessThanOrEqual(0);
  });
});

describe("RegraTitulacaoBasal — cadência de 3 dias (Figura 4, p. 62)", () => {
  it("todo ajuste vem com a recomendação de reavaliar em 3 dias", () => {
    const r = titulacao(jejum(200));
    expect(tiposDeRecomendacao(r)).toContain("REAVALIAR_EM_3_DIAS");
  });

  it("resultado 'na meta' não pede reavaliação em 3 dias", () => {
    const r = titulacao(jejum(100));
    expect(tiposDeRecomendacao(r)).not.toContain("REAVALIAR_EM_3_DIAS");
  });
});

// RN-03 (RF-03) — suspensão da sulfonilureia: gatilho atual + dois gatilhos ampliados.
// Fonte: p. 62 ("suspender a sulfonilureia, se estiver em uso"); Figura 4, p. 62–63.
describe("RN-03 — sulfonilureia ao fracionar (gatilho atual + redação condicional)", () => {
  // Esquema 30 UI + jejum 200 → +4 = 34 UI > 30: dispara o fracionamento.
  const fracionando = (usoSulfonilureia?: boolean) =>
    comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(30), jejum(200), {
          ...(usoSulfonilureia === undefined ? {} : { usoSulfonilureia }),
        }),
      ),
    );

  it("uso explícito mantém a redação direta (gatilho atual inalterado)", () => {
    const r = fracionando(true);
    const rec = r.recomendacoesAoPrescritor.find(
      (x) => x.tipo === "SUSPENDER_SULFONILUREIA",
    );
    expect(rec?.mensagem).toBe(TEXTO_SUSPENDER_SULFONILUREIA.diretaAoFracionar);
  });

  it("uso não informado emite a redação condicional ao fracionar", () => {
    const r = fracionando(undefined);
    const rec = r.recomendacoesAoPrescritor.find(
      (x) => x.tipo === "SUSPENDER_SULFONILUREIA",
    );
    expect(rec?.mensagem).toBe(
      TEXTO_SUSPENDER_SULFONILUREIA.condicionalAoFracionar,
    );
  });

  it("uso negado (false) não emite a recomendação", () => {
    const r = fracionando(false);
    expect(tiposDeRecomendacao(r)).not.toContain("SUSPENDER_SULFONILUREIA");
  });
});

describe("RN-03 — esquema que já chega fracionado (gatilho novo, D-04)", () => {
  // NPH em 2 aplicações na entrada; jejum 150 → +2 na noturna, sem novo fracionamento.
  const jaFracionado = (usoSulfonilureia?: boolean) =>
    comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaNphFracionada(14, 14), jejum(150), {
          ...(usoSulfonilureia === undefined ? {} : { usoSulfonilureia }),
        }),
      ),
    );

  it("uso explícito emite a recomendação com redação direta de contexto", () => {
    const r = jaFracionado(true);
    const rec = r.recomendacoesAoPrescritor.find(
      (x) => x.tipo === "SUSPENDER_SULFONILUREIA",
    );
    expect(rec?.mensagem).toBe(
      TEXTO_SUSPENDER_SULFONILUREIA.diretaEsquemaFracionado,
    );
    expect(rec?.referencia.localizacao).toMatch(/62/);
  });

  it("uso não informado emite a redação condicional de contexto", () => {
    const r = jaFracionado(undefined);
    const rec = r.recomendacoesAoPrescritor.find(
      (x) => x.tipo === "SUSPENDER_SULFONILUREIA",
    );
    expect(rec?.mensagem).toBe(
      TEXTO_SUSPENDER_SULFONILUREIA.condicionalEsquemaFracionado,
    );
  });

  it("uso negado (false) não emite a recomendação", () => {
    const r = jaFracionado(false);
    expect(tiposDeRecomendacao(r)).not.toContain("SUSPENDER_SULFONILUREIA");
  });
});
