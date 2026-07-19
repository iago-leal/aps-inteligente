// BUG-20260719-RHZ5 — motor silencioso com HbA1c ausente nos ramos residuais da
// intensificação (RN-H + adendo bug-BUG-20260719-RHZ5-v001). BUG_VIRA_TESTE
// (Princípio VII): reprodução e regressão permanentes; não remover ao refatorar o gate.
import { describe, expect, it } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import {
  afericao,
  codigosDe,
  comoErroValidacao,
  comoResultadoTitulacao,
  entradaTitulacao,
  esquema,
  esquemaBasal,
  jejum,
  nph,
  regular,
  tiposDeRecomendacao,
} from "../apoio/construtores";

const calculadora = new CalculadoraInsulinaDM2();

describe("BUG-20260719-RHZ5 — HbA1c ausente nos ramos residuais recomenda dosar HbA1c", () => {
  it("reprodução (ramo a): basal puro, só jejum, sem HbA1c → DOSAR_HBA1C presente e referenciada", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(entradaTitulacao(esquemaBasal(20), jejum(100))),
    );
    const rec = r.recomendacoesAoPrescritor.find((x) => x.tipo === "DOSAR_HBA1C");
    expect(rec).toBeDefined();
    expect(rec!.referencia.localizacao).not.toHaveLength(0);
  });

  it("reprodução (ramo b): basal-plus sem pré-prandiais, sem HbA1c → DOSAR_HBA1C", () => {
    const r = comoResultadoTitulacao(
      calculadora.calcular(
        entradaTitulacao(
          esquema("basal-plus", nph(20), regular(4, "antes_cafe")),
          jejum(100),
        ),
      ),
    );
    expect(tiposDeRecomendacao(r)).toContain("DOSAR_HBA1C");
  });

  describe("vizinhança do gate permanece intacta", () => {
    it("EC-10 segue barrando basal puro com pré-prandiais sem HbA1c", () => {
      const erro = comoErroValidacao(
        calculadora.calcular(
          entradaTitulacao(esquemaBasal(20), [
            ...jejum(100),
            ...afericao("antes_almoco", 150),
          ]),
        ),
      );
      expect(codigosDe(erro)).toContain("HBA1C_OBRIGATORIA");
    });

    it("HbA1c presente ≤ 7 não ganha DOSAR_HBA1C", () => {
      const r = comoResultadoTitulacao(
        calculadora.calcular(
          entradaTitulacao(esquemaBasal(20), jejum(100), { hba1cPercent: 6.5 }),
        ),
      );
      expect(tiposDeRecomendacao(r)).not.toContain("DOSAR_HBA1C");
    });

    it("HbA1c presente > 7 não ganha DOSAR_HBA1C", () => {
      const r = comoResultadoTitulacao(
        calculadora.calcular(
          entradaTitulacao(esquemaBasal(20), jejum(100), { hba1cPercent: 8 }),
        ),
      );
      expect(tiposDeRecomendacao(r)).not.toContain("DOSAR_HBA1C");
    });

    it("intensificado com pré-prandiais sem HbA1c mantém REPETIR_HBA1C_3_MESES, sem DOSAR_HBA1C", () => {
      const r = comoResultadoTitulacao(
        calculadora.calcular(
          entradaTitulacao(
            esquema("basal-plus", nph(20), regular(4, "antes_cafe")),
            [...jejum(100), ...afericao("antes_almoco", 150)],
          ),
        ),
      );
      const tipos = tiposDeRecomendacao(r);
      expect(tipos).toContain("REPETIR_HBA1C_3_MESES");
      expect(tipos).not.toContain("DOSAR_HBA1C");
    });
  });
});
