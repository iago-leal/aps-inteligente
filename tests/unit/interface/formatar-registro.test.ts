// T012 (feature 020) — a projeção do registro em texto, contra o contrato de
// `_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md`.
//
// Este texto é a SAÍDA PRINCIPAL da feature: o produto dela é um registro, não um número, e
// ele atravessa para fora da plataforma por colagem num prontuário. Um formato que mude sem
// aviso quebra o hábito de quem cola o texto todo dia, e é por isso que a forma tem contrato
// e o contrato tem teste. Cada asserção abaixo corresponde a uma das oito regras do §2.
import { describe, expect, it } from "vitest";
import { formatarRegistro } from "interface/puericultura/consulta/formatar-registro";
import { montarRegistro } from "models/puericultura/consulta/registro";
import {
  contexto,
  fichaSintetica,
  livre,
  marcacao,
  preenchimento,
  secao,
  sim,
  texto,
} from "../../apoio/consulta-puericultura";

const FICHA = fichaSintetica([
  secao(1, "Sinais de alerta", [
    marcacao("diarreia", "Diarreia/Constipação", "S"),
    marcacao("estrabismo", "Estrabismo", "O"),
  ]),
  secao(2, "Verificações importantes", [
    marcacao("vacinas", "Vacinas de acordo com o calendário", "A"),
  ]),
  secao(3, "Atenção e cuidados especiais nesta fase", [
    texto("higiene", "Higiene e cuidados gerais", "P"),
  ]),
]);

function textoDe(entradas: Parameters<typeof preenchimento>[0]): string {
  return formatarRegistro(
    montarRegistro({
      ficha: FICHA,
      contexto: contexto(),
      preenchimento: preenchimento(entradas),
    }),
  );
}

const COMPLETO = textoDe({
  diarreia: sim(),
  estrabismo: sim(),
  vacinas: sim(),
  higiene: livre("orientada"),
});

describe("Forma do texto (contrato §2)", () => {
  it("abre pelo título da ficha e pela idade declarada", () => {
    expect(COMPLETO.split("\n")[0]).toContain(FICHA.titulo);
    expect(COMPLETO.split("\n")[0]).toContain("cronológica");
  });

  it("emite as quatro seções na ordem fixa S, O, A, P (regra 1)", () => {
    const cabecalhos = COMPLETO.split("\n").filter((l) => /^[SOAP]$/.test(l));
    expect(cabecalhos).toEqual(["S", "O", "A", "P"]);
  });

  it("omite inteira a seção vazia, cabeçalho incluído (regra 2)", () => {
    const so = textoDe({ diarreia: sim() });
    expect(so.split("\n").filter((l) => /^[SOAP]$/.test(l))).toEqual(["S"]);
  });

  it("não escreve linha alguma de campo não preenchido (regra 3)", () => {
    const so = textoDe({ diarreia: sim() });
    expect(so).not.toContain("Estrabismo");
    expect(so).not.toContain("não informado");
  });

  it("usa o rótulo da fonte, byte a byte (regra 4)", () => {
    expect(COMPLETO).toContain("- Diarreia/Constipação: Sim");
  });

  it("nomeia a espécie de idade que governou a escolha da ficha (regra 5)", () => {
    expect(COMPLETO).toMatch(/idade cronológica/);
  });

  it("fecha com as notas de proveniência e a linha da fonte (regra 7)", () => {
    const linhas = COMPLETO.trimEnd().split("\n");
    expect(linhas.at(-1)).toMatch(/^Fonte: /);
    expect(COMPLETO).toContain("organização");
  });

  it("não carrega identificador algum da criança (regra 8)", () => {
    expect(COMPLETO).not.toMatch(/nome|prontuário|CPF|CNS/i);
  });
});

describe("Ausência de registro a produzir (contrato §4)", () => {
  it("devolve cadeia vazia quando nada foi preenchido, em vez de cabeçalhos vazios", () => {
    expect(textoDe({}).trim()).toBe("");
  });
});

describe("Idempotência (contrato §5)", () => {
  it("formatar duas vezes o mesmo registro produz a mesma cadeia", () => {
    const entradas = { diarreia: sim(), vacinas: sim() };
    expect(textoDe(entradas)).toBe(textoDe(entradas));
  });
});
