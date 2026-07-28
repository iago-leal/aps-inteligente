// T009 (feature 020) — a montagem do registro (RF-06, RF-10; RN-09, RN-09b, RN-10).
//
// O registro de prontuário afirma o que foi averiguado. Daí as duas regras que mais pesam
// aqui: campo não preenchido não aparece, e seção que ficar sem item some inteira, cabeçalho
// incluído. Um cabeçalho solto afirmaria averiguação que não houve, que é pior que a
// omissão — é a diferença entre não ter olhado e ter registrado que olhou.
//
// RN-09b entra como asserção estrutural, e não como leitura de texto: todo item da seção de
// avaliação vindo da ficha corresponde a um campo que a PRÓPRIA ficha declara em "A". O
// motor transpõe juízo impresso; não forma juízo nenhum (ADR 0005).
import { describe, expect, it } from "vitest";
import { montarRegistro } from "models/puericultura/consulta/registro";
import type { SecaoSoap } from "models/puericultura/consulta/tipos";
import {
  contexto,
  escolha,
  fichaSintetica,
  livre,
  marcacao,
  medida,
  medidaDe,
  nao,
  opcaoDe,
  preenchimento,
  secao,
  sim,
  texto,
} from "../../apoio/consulta-puericultura";

const FICHA = fichaSintetica([
  secao(1, "Medidas", [medida("peso", "Peso", "g", "peso")]),
  secao(2, "Aleitamento/alimentação", [
    escolha("aleitamento", "Aleitamento", "S", [
      "Leite materno exclusivo",
      "Leite artificial",
    ]),
    marcacao("parou", "Parou de amamentar?", "S"),
  ]),
  secao(3, "Sinais de alerta", [
    marcacao("diarreia", "Diarreia/Constipação", "S"),
    marcacao("estrabismo", "Estrabismo", "O"),
  ]),
  secao(4, "Verificações importantes", [
    marcacao("vacinas", "Vacinas de acordo com o calendário", "A"),
  ]),
  secao(5, "Atenção e cuidados especiais nesta fase", [
    texto("higiene", "Higiene e cuidados gerais", "P"),
  ]),
]);

function registroCom(entradas: Parameters<typeof preenchimento>[0]) {
  return montarRegistro({
    ficha: FICHA,
    contexto: contexto(),
    preenchimento: preenchimento(entradas),
  });
}

function secoesDo(registro: ReturnType<typeof registroCom>): SecaoSoap[] {
  return registro.secoes.map((s) => s.secao);
}

describe("Ordem e presença das seções (RN-09, RN-10)", () => {
  it("emite S, O, A e P nesta ordem, sempre", () => {
    const registro = registroCom({
      diarreia: sim(),
      estrabismo: nao(),
      vacinas: sim(),
      higiene: livre("orientada"),
    });
    expect(secoesDo(registro)).toEqual(["S", "O", "A", "P"]);
  });

  it("omite inteira a seção que ficou sem item, cabeçalho incluído", () => {
    const registro = registroCom({ diarreia: sim() });
    expect(secoesDo(registro)).toEqual(["S"]);
    expect(JSON.stringify(registro)).not.toContain("Objetivo");
  });

  it("devolve nenhuma seção quando nada foi preenchido", () => {
    expect(registroCom({}).secoes).toEqual([]);
  });
});

describe("Campo não preenchido (RN-10)", () => {
  it("não aparece no registro, em nenhuma forma", () => {
    const registro = registroCom({ diarreia: sim() });
    const itens = registro.secoes.flatMap((s) => s.itens);
    expect(itens.map((i) => i.rotulo)).toEqual(["Diarreia/Constipação"]);
  });

  it("distingue o não preenchido do preenchido com “Não”", () => {
    const registro = registroCom({ diarreia: nao() });
    const itens = registro.secoes.flatMap((s) => s.itens);
    expect(itens).toHaveLength(1);
    expect(itens[0]?.valor).toBe("Não");
  });

  it("descarta texto livre em branco, que é o mesmo que não ter respondido", () => {
    expect(registroCom({ higiene: livre("   ") }).secoes).toEqual([]);
  });
});

describe("Valores por natureza de campo", () => {
  it("imprime a medida com a unidade da fonte, e o peso em gramas", () => {
    const registro = registroCom({ peso: medidaDe("6400") });
    expect(registro.secoes[0]?.itens[0]?.valor).toBe("6400 g");
  });

  it("imprime a opção escolhida e o complemento quando houver", () => {
    const registro = registroCom({
      aleitamento: opcaoDe("Leite artificial", "fórmula de partida"),
    });
    expect(registro.secoes[0]?.itens[0]?.valor).toBe(
      "Leite artificial — fórmula de partida",
    );
  });
});

describe("Composição da avaliação (RN-09b)", () => {
  it("só recebe campo que a própria ficha declara em A", () => {
    const registro = registroCom({
      diarreia: sim(),
      vacinas: sim(),
      higiene: livre("orientada"),
    });
    const avaliacao = registro.secoes.find((s) => s.secao === "A");
    const rotulosDeclaradosEmA = FICHA.secoes
      .flatMap((s) => s.campos)
      .filter((c) => c.secaoSoap === "A")
      .map((c) => c.rotulo);

    for (const item of avaliacao?.itens ?? []) {
      if (item.origem !== "ficha") continue;
      expect(rotulosDeclaradosEmA).toContain(item.rotulo);
    }
  });

  it("não repete campo algum entre as seções", () => {
    const registro = registroCom({
      aleitamento: opcaoDe("Leite materno exclusivo"),
      diarreia: sim(),
      estrabismo: sim(),
      vacinas: sim(),
      higiene: livre("orientada"),
    });
    const rotulos = registro.secoes.flatMap((s) =>
      s.itens.map((i) => i.rotulo),
    );
    expect(new Set(rotulos).size).toBe(rotulos.length);
  });
});

describe("Cabeçalho, notas e referências", () => {
  it("nomeia a ficha e a página de onde ela veio", () => {
    const registro = registroCom({ diarreia: sim() });
    expect(registro.ficha).toEqual({
      id: FICHA.id,
      titulo: FICHA.titulo,
      pagina: FICHA.pagina,
    });
  });

  it("declara qual idade governou a escolha da ficha (RN-05)", () => {
    const registro = registroCom({ diarreia: sim() });
    expect(registro.idadeDeclarada.especie).toBe("cronologica");
    expect(registro.idadeDeclarada.texto).toContain("meses");
  });

  it("nunca sai sem referência clínica (invariante 3 da família)", () => {
    expect(registroCom({}).referencias.length).toBeGreaterThan(0);
  });

  it("carrega a nota da organização em SOAP, que é do produto (RN-09)", () => {
    const tipos = registroCom({ diarreia: sim() }).notas.map((n) => n.tipo);
    expect(tipos).toContain("ORGANIZACAO_EM_SOAP");
    expect(tipos).toContain("FICHAS_AUSENTES");
  });
});
