// T010 (feature 020) — invariantes do registro, verificados por propriedade.
//
// Os três exemplos escritos à mão de T009 provam o caso que alguém imaginou. Estes provam o
// que vale para TODO preenchimento, e é aqui que moram as promessas que a plataforma inteira
// assume: referência clínica nunca vazia (invariante 3 da família), nenhum campo não
// preenchido no registro (RN-10) e determinismo — a mesma entrada produz o mesmo registro,
// que é o que torna a cópia idempotente e o formatador testável (D-03).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { montarRegistro } from "models/puericultura/consulta/registro";
import type {
  Preenchimento,
  Resposta,
  SecaoSoap,
} from "models/puericultura/consulta/tipos";
import {
  contexto,
  escolha,
  fichaSintetica,
  marcacao,
  medida,
  secao,
  texto,
} from "../../apoio/consulta-puericultura";

const SECOES: readonly SecaoSoap[] = ["S", "O", "A", "P"];

const FICHA = fichaSintetica([
  secao(1, "Medidas", [
    medida("peso", "Peso", "g", "peso"),
    medida("pc", "PC", "cm", "perimetroCefalico"),
  ]),
  secao(2, "Aleitamento/alimentação", [
    escolha("aleitamento", "Aleitamento", "S", [
      "Leite materno exclusivo",
      "Leite artificial",
    ]),
  ]),
  secao(3, "Sinais de alerta", [
    marcacao("diarreia", "Diarreia/Constipação", "S"),
    marcacao("febre", "Febre", "O"),
  ]),
  secao(4, "Verificações importantes", [
    marcacao("vacinas", "Vacinas de acordo com o calendário", "A"),
  ]),
  secao(5, "Atenção e cuidados especiais nesta fase", [
    texto("higiene", "Higiene e cuidados gerais", "P"),
  ]),
]);

const CAMPOS = FICHA.secoes.flatMap((s) => s.campos);

/** Uma resposta plausível para cada natureza; `undefined` significa campo em branco. */
function respostaPara(id: string): fc.Arbitrary<Resposta | undefined> {
  const campo = CAMPOS.find((c) => c.id === id)!;
  const preenchida: fc.Arbitrary<Resposta> =
    campo.natureza === "marcacao"
      ? fc.constantFrom<Resposta>(
          { natureza: "marcacao", valor: "sim" },
          { natureza: "marcacao", valor: "nao" },
        )
      : campo.natureza === "escolha"
        ? fc
            .constantFrom(...campo.opcoes)
            .map((opcao): Resposta => ({ natureza: "escolha", opcao }))
        : campo.natureza === "medida"
          ? fc
              .integer({ min: 1, max: 30000 })
              .map((n): Resposta => ({ natureza: "medida", bruto: String(n) }))
          : fc
              .string({ minLength: 1, maxLength: 40 })
              .map((t): Resposta => ({ natureza: "texto", texto: t }));

  return fc.option(preenchida, { nil: undefined });
}

const preenchimentoArbitrario: fc.Arbitrary<Preenchimento> = fc
  .tuple(...CAMPOS.map((c) => respostaPara(c.id)))
  .map((respostas) => {
    const mapa = new Map<string, Resposta>();
    CAMPOS.forEach((campo, i) => {
      const resposta = respostas[i];
      if (resposta !== undefined) mapa.set(campo.id, resposta);
    });
    return mapa;
  });

function montar(p: Preenchimento) {
  return montarRegistro({
    ficha: FICHA,
    contexto: contexto(),
    preenchimento: p,
  });
}

describe("Invariantes do registro (property-based)", () => {
  it("a referência clínica nunca é vazia", () => {
    fc.assert(
      fc.property(preenchimentoArbitrario, (p) => {
        expect(montar(p).referencias.length).toBeGreaterThan(0);
      }),
    );
  });

  it("nenhum campo não preenchido aparece no registro (RN-10)", () => {
    fc.assert(
      fc.property(preenchimentoArbitrario, (p) => {
        const rotulosNoRegistro = montar(p)
          .secoes.flatMap((s) => s.itens)
          .filter((i) => i.origem === "ficha")
          .map((i) => i.rotulo);
        const rotulosPreenchidos = CAMPOS.filter((c) => p.has(c.id)).map(
          (c) => c.rotulo,
        );
        for (const rotulo of rotulosNoRegistro) {
          expect(rotulosPreenchidos).toContain(rotulo);
        }
      }),
    );
  });

  it("nenhuma seção emitida vem vazia, e a ordem é sempre S, O, A, P", () => {
    fc.assert(
      fc.property(preenchimentoArbitrario, (p) => {
        const secoes = montar(p).secoes;
        for (const s of secoes) expect(s.itens.length).toBeGreaterThan(0);
        const posicoes = secoes.map((s) => SECOES.indexOf(s.secao));
        expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b));
      }),
    );
  });

  it("a mesma entrada produz o mesmo registro", () => {
    fc.assert(
      fc.property(preenchimentoArbitrario, (p) => {
        expect(montar(p)).toEqual(montar(p));
      }),
    );
  });
});
