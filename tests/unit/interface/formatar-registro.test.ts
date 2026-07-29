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

  // A regra 7 MUDOU DE SENTIDO com o adendo `bug-BUG-20260728-ZAHV-v001`, que executa a
  // decisão `MD-0035`: a proveniência se declara a quem lê a tela e não viaja no texto que
  // sai da plataforma. A asserção anterior — "fecha com as notas e a linha da fonte" — era
  // fiel ao contrato de então, e por isso é reescrita no lugar em vez de apagada: o que o
  // contrato afirma passou a ser outro, e é este teste quem carrega a afirmação.
  it("não carrega nota de proveniência nem linha da fonte (regra 7, adendo ZAHV)", () => {
    expect(COMPLETO).not.toMatch(/^Fonte: /m);
    expect(COMPLETO).not.toContain("a organização do texto em subjetivo");
    expect(COMPLETO).not.toContain("ficaram fora desta entrega");
  });

  it("fecha no último item da última seção preenchida (regra 7, adendo ZAHV)", () => {
    const linhas = COMPLETO.trimEnd().split("\n");
    expect(linhas.at(-2)).toBe("P");
    expect(linhas.at(-1)).toBe("- Higiene e cuidados gerais: orientada");
  });

  it("não carrega identificador algum da criança (regra 8)", () => {
    expect(COMPLETO).not.toMatch(/nome|prontuário|CPF|CNS/i);
  });
});

// Regressão de `BUG-20260728-ZAHV`. As asserções acima verificam cada regra por vez, e é
// possível passar em todas com um bloco a mais no fim que nenhuma delas olha — foi
// exatamente assim que a proveniência atravessou. Esta fixa a cadeia INTEIRA: o que sobrar
// depois da última seção reprova aqui, seja lá o que for.
//
// O cabeçalho entra por leitura, e não chumbado, porque o seu oráculo é a idade declarada
// pelo domínio da 017 — duplicá-lo aqui seria reimplementar `derivarIdades` dentro do teste,
// e as duas asserções do topo já o guardam.
describe("Forma exata da cadeia (regressão de BUG-20260728-ZAHV)", () => {
  it("é cabeçalho e seções, e nada mais", () => {
    const cabecalho = COMPLETO.split("\n")[0];
    expect(COMPLETO).toBe(
      [
        cabecalho,
        "S\n- Diarreia/Constipação: Sim",
        "O\n- Estrabismo: Sim",
        "A\n- Vacinas de acordo com o calendário: Sim",
        "P\n- Higiene e cuidados gerais: orientada",
      ].join("\n\n"),
    );
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
