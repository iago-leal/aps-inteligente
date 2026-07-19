// T009 — Fracionamento e intensificação (RF-02 do motor; R-08..R-19 da spec §6.1).
// Fonte: p. 61, 64 e Figura 4 p. 62–63; decisões AMB-03, AMB-07 e AMB-10.
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import {
  afericao,
  comoErroValidacao,
  comoResultadoTitulacao,
  doseDe,
  entradaTitulacao,
  esquema,
  esquemaBasal,
  jejum,
  nph,
  regular,
  codigosDe,
  tiposDeAlerta,
  tiposDeRecomendacao,
} from "../../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

describe("Fracionamento da NPH (R-08..R-10 / AMB-10)", () => {
  it("dose titulada > 30 UI fraciona ½ café + ½ noite preservando o total (30 + 4 = 34 → 17 + 17)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(entradaTitulacao(esquemaBasal(30), jejum(200))),
    );
    expect(doseDe(r, "NPH", "antes_cafe")).toBe(17);
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(17);
    expect(r.doseTotalDiaUi).toBe(34);
    expect(tiposDeAlerta(r)).toContain("FRACIONAR_DOSE");
  });

  it("gatilho alternativo 0,4 UI/kg/dia (peso 50 → limiar 20; 18 + 4 = 22 → fraciona 11 + 11)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(18), jejum(200), { pesoKg: 50 }),
      ),
    );
    expect(doseDe(r, "NPH", "antes_cafe")).toBe(11);
    expect(doseDe(r, "NPH", "ao_deitar")).toBe(11);
    expect(tiposDeAlerta(r)).toContain("FRACIONAR_DOSE");
  });

  it("ao fracionar, oferece ⅔ + ⅓ como conduta alternativa rotulada (AMB-10: 34 → 23 + 11)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(entradaTitulacao(esquemaBasal(30), jejum(200))),
    );
    const alternativa = (r.condutasAlternativas ?? []).find((c) =>
      c.esquemaSugerido.some((a) => a.doseUi === 23),
    );
    expect(alternativa).toBeDefined();
    const doses = alternativa!.esquemaSugerido
      .map((a) => a.doseUi)
      .sort((a, b) => a - b);
    expect(doses).toEqual([11, 23]);
    expect(alternativa!.rotulo).not.toHaveLength(0);
  });

  it("ao fracionar com sulfonilureia em uso, recomenda suspendê-la e manter metformina (R-10)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(30), jejum(200), {
          usoSulfonilureia: true,
        }),
      ),
    );
    const tipos = tiposDeRecomendacao(r);
    expect(tipos).toContain("SUSPENDER_SULFONILUREIA");
    expect(tipos).toContain("MANTER_METFORMINA");
  });

  it("sem gatilho, não fraciona (20 + 4 = 24 ≤ 30 e < 0,4 UI/kg)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(entradaTitulacao(esquemaBasal(20), jejum(200))),
    );
    expect(r.esquemaSugerido).toHaveLength(1);
    expect(tiposDeAlerta(r)).not.toContain("FRACIONAR_DOSE");
  });
});

describe("Gates de HbA1c (R-13, R-18)", () => {
  it("HbA1c ≤ 7,0% em esquema basal mantém a conduta e pede HbA1c em 6 meses", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), jejum(100), { hba1cPercent: 6.5 }),
      ),
    );
    expect(r.deltaTotalUi).toBe(0);
    expect(tiposDeRecomendacao(r)).toContain("REPETIR_HBA1C_6_MESES");
  });

  it("HbA1c > 7,0% em esquema basal sem pré-prandiais pede aferição AA/AJ/AD", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), jejum(100), { hba1cPercent: 8 }),
      ),
    );
    expect(tiposDeRecomendacao(r)).toContain("AFERIR_PRE_PRANDIAIS");
  });

  it("pré-prandiais informadas em esquema basal sem HbA1c → HBA1C_OBRIGATORIA (EC-10)", () => {
    const erro = comoErroValidacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), afericao("antes_almoco", 150)),
      ),
    );
    expect(codigosDe(erro)).toContain("HBA1C_OBRIGATORIA");
  });

  it("esquema com Regular e HbA1c ≤ 7,0% recomenda avaliar encaminhamento ao endócrino (R-18)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(
          esquema("basal-plus", nph(20), regular(6, "antes_cafe")),
          afericao("antes_almoco", 110),
          { hba1cPercent: 6.8 },
        ),
      ),
    );
    expect(tiposDeRecomendacao(r)).toContain(
      "AVALIAR_ENCAMINHAMENTO_ENDOCRINO",
    );
  });

  it("esquema com Regular, HbA1c > 7,0% e pré-prandiais na meta orienta pós-prandial sem número (NG-07)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(
          esquema("basal-plus", nph(20), regular(6, "antes_cafe")),
          afericao("antes_almoco", 110),
          { hba1cPercent: 8 },
        ),
      ),
    );
    expect(tiposDeRecomendacao(r)).toContain("AFERIR_POS_PRANDIAL");
    expect(r.deltaTotalUi).toBe(0);
  });
});

describe("Braços pré-prandiais da intensificação (R-14..R-16 / AMB-03)", () => {
  it("AA ≥ 130 inicia Regular 4 UI antes do café (R-14)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), afericao("antes_almoco", 150), {
          hba1cPercent: 8,
        }),
      ),
    );
    expect(doseDe(r, "Regular", "antes_cafe")).toBe(4);
  });

  it("AD ≥ 130 inicia Regular 4 UI antes do jantar (R-16)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(esquemaBasal(20), afericao("ao_deitar", 150), {
          hba1cPercent: 8,
        }),
      ),
    );
    expect(doseDe(r, "Regular", "antes_jantar")).toBe(4);
  });

  it("AJ ≥ 130 com NPH no café devolve as DUAS condutas rotuladas sem escolher (AMB-03)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(
          esquema("basal", nph(16, "antes_cafe"), nph(16, "ao_deitar")),
          afericao("antes_jantar", 150),
          { hba1cPercent: 8 },
        ),
      ),
    );
    const alternativas = r.condutasAlternativas ?? [];
    expect(alternativas.length).toBeGreaterThanOrEqual(2);
    const aumentaNphCafe = alternativas.some((c) =>
      c.esquemaSugerido.some(
        (a) =>
          a.insulina === "NPH" && a.momento === "antes_cafe" && a.doseUi === 18,
      ),
    );
    const iniciaRegularAlmoco = alternativas.some((c) =>
      c.esquemaSugerido.some(
        (a) =>
          a.insulina === "Regular" &&
          a.momento === "antes_almoco" &&
          a.doseUi === 4,
      ),
    );
    expect(aumentaNphCafe).toBe(true);
    expect(iniciaRegularAlmoco).toBe(true);
    // O esquema principal não aplica nenhuma das duas: a escolha é do prescritor.
    expect(doseDe(r, "NPH", "antes_cafe")).toBe(16);
    expect(r.esquemaSugerido.some((a) => a.momento === "antes_almoco")).toBe(
      false,
    );
  });
});

describe("Titulação da Regular já iniciada (R-17 / AMB-07 — inferência espelhada)", () => {
  const basalPlus = esquema("basal-plus", nph(20), regular(6, "antes_cafe"));

  it("AA ≥ 130 aumenta a Regular do café em 2 UI (6 → 8)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(basalPlus, afericao("antes_almoco", 150), {
          hba1cPercent: 8,
        }),
      ),
    );
    expect(doseDe(r, "Regular", "antes_cafe")).toBe(8);
  });

  it("AA ≤ 70 reduz a Regular do café em 2 UI com alerta de hipoglicemia (6 → 4)", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(basalPlus, afericao("antes_almoco", 65), {
          hba1cPercent: 8,
        }),
      ),
    );
    expect(doseDe(r, "Regular", "antes_cafe")).toBe(4);
    expect(tiposDeAlerta(r)).toContain("HIPOGLICEMIA");
  });

  it("AA 71–129 mantém a Regular do café", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(basalPlus, afericao("antes_almoco", 110), {
          hba1cPercent: 8,
        }),
      ),
    );
    expect(doseDe(r, "Regular", "antes_cafe")).toBe(6);
  });
});
