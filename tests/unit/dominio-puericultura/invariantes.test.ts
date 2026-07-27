// Invariantes do quinto domínio (ação T017; RF-01, RF-10, RF-20).
// Duas naturezas de garantia num arquivo só, porque as duas dizem a mesma coisa por
// caminhos diferentes: que o motor é auditável.
//
//  1. **Property-based** — para QUALQUER entrada válida, todo índice calculado sai
//     com referência clínica, padrão e idade usada. Um exemplo escolhido a dedo
//     provaria o caso que o autor lembrou; a propriedade cobre os que ele não lembrou.
//  2. **Fronteira arquitetural** — nenhum arquivo de `models/puericultura/**` importa
//     nada de fora do próprio domínio. É o invariante 1 de `domain.md` §7 lido como
//     teste, e o que mantém a suíte do domínio rodando sem DOM.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CalculadoraCrescimentoInfantil } from "models/puericultura/calculadora";
import type {
  EntradaAvaliacao,
  Indice,
  SaidaAvaliacao,
} from "models/puericultura/tipos";
import { dataApos } from "../../apoio/puericultura";

const calculadora = new CalculadoraCrescimentoInfantil();
const NASCIMENTO = "2016-01-10";

const INDICES: readonly Indice[] = [
  "peso-idade",
  "comprimento-estatura-idade",
  "imc-idade",
  "perimetro-cefalico-idade",
];

/** Entrada dentro das faixas de plausibilidade — o universo que RF-10 cobre. */
const arbEntrada: fc.Arbitrary<EntradaAvaliacao> = fc
  .record({
    sexo: fc.constantFrom("masculino" as const, "feminino" as const),
    dias: fc.integer({ min: 0, max: 3682 }),
    pesoKg: fc.option(fc.double({ min: 0.4, max: 60, noNaN: true }), {
      nil: undefined,
    }),
    comprimentoCm: fc.option(fc.double({ min: 25, max: 180, noNaN: true }), {
      nil: undefined,
    }),
    posicaoDaMedicao: fc.constantFrom("deitado" as const, "em-pe" as const),
    perimetroCefalicoCm: fc.option(
      fc.double({ min: 25, max: 60, noNaN: true }),
      {
        nil: undefined,
      },
    ),
    ig: fc.option(
      fc.record({
        semanas: fc.integer({ min: 22, max: 42 }),
        dias: fc.integer({ min: 0, max: 6 }),
      }),
      { nil: undefined },
    ),
  })
  .map(({ dias, ig, ...resto }) => ({
    sexo: resto.sexo,
    dataDeNascimento: NASCIMENTO,
    dataDaMedicao: dataApos(NASCIMENTO, dias),
    pesoKg: resto.pesoKg,
    comprimentoCm: resto.comprimentoCm,
    posicaoDaMedicao:
      resto.comprimentoCm === undefined ? undefined : resto.posicaoDaMedicao,
    perimetroCefalicoCm: resto.perimetroCefalicoCm,
    idadeGestacionalAoNascer: ig,
  }));

function resultadosDe(saida: SaidaAvaliacao) {
  return saida.tipo === "resultado" ? saida : null;
}

describe("RF-10 e RF-20: todo índice calculado é auditável", () => {
  it("sai sempre com referência clínica não vazia", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const resultado = resultadosDe(calculadora.avaliar(entrada));
        if (resultado === null) return;

        for (const indice of resultado.indices) {
          if (indice.estado !== "calculado") continue;
          expect(indice.referencia.fonteId.length).toBeGreaterThan(0);
          expect(indice.referencia.versaoEdicao.length).toBeGreaterThan(0);
          expect(indice.referencia.localizacao.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 300 },
    );
  });

  it("sai sempre com padrão e idade usada declarados", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const resultado = resultadosDe(calculadora.avaliar(entrada));
        if (resultado === null) return;

        for (const indice of resultado.indices) {
          if (indice.estado !== "calculado") continue;
          expect(["OMS", "INTERGROWTH-21st"]).toContain(indice.padrao);
          expect(["cronologica", "corrigida", "pos-menstrual"]).toContain(
            indice.idadeUsada.especie,
          );
          expect(["dia", "semana"]).toContain(indice.idadeUsada.unidade);
          expect(Number.isFinite(indice.idadeUsada.valor)).toBe(true);
        }
      }),
      { numRuns: 300 },
    );
  });

  it("o escore é finito e a classificação, nunca vazia", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const resultado = resultadosDe(calculadora.avaliar(entrada));
        if (resultado === null) return;

        for (const indice of resultado.indices) {
          if (indice.estado !== "calculado") continue;
          expect(Number.isFinite(indice.escoreZ)).toBe(true);
          expect(indice.classificacao.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 300 },
    );
  });

  it("o padrão declarado é COERENTE com a unidade da idade usada", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const resultado = resultadosDe(calculadora.avaliar(entrada));
        if (resultado === null) return;

        for (const indice of resultado.indices) {
          if (indice.estado !== "calculado") continue;
          const esperada =
            indice.padrao === "INTERGROWTH-21st" ? "semana" : "dia";
          expect(indice.idadeUsada.unidade).toBe(esperada);
        }
      }),
      { numRuns: 300 },
    );
  });

  it("os quatro índices aparecem sempre, um de cada, na ordem da caderneta", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const resultado = resultadosDe(calculadora.avaliar(entrada));
        if (resultado === null) return;

        expect(resultado.indices.map((i) => i.indice)).toEqual(INDICES);
      }),
      { numRuns: 300 },
    );
  });

  it("o resultado nunca sai sem referência nem sem nota de proveniência", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const resultado = resultadosDe(calculadora.avaliar(entrada));
        if (resultado === null) return;

        expect(resultado.referencias.length).toBeGreaterThan(0);
        expect(resultado.notaProveniencia.length).toBeGreaterThan(0);
      }),
      { numRuns: 300 },
    );
  });

  it("uma régua só por criança: nenhum resultado mistura OMS e pré-termo", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        const resultado = resultadosDe(calculadora.avaliar(entrada));
        if (resultado === null) return;

        const padroes = new Set(
          resultado.indices
            .filter((i) => i.estado === "calculado")
            .map((i) => (i.estado === "calculado" ? i.padrao : "")),
        );
        expect(padroes.size).toBeLessThanOrEqual(1);
      }),
      { numRuns: 300 },
    );
  });

  it("determinismo: a mesma entrada devolve sempre a mesma saída", () => {
    fc.assert(
      fc.property(arbEntrada, (entrada) => {
        expect(calculadora.avaliar(entrada)).toEqual(
          calculadora.avaliar(entrada),
        );
      }),
      { numRuns: 200 },
    );
  });
});

const RAIZ_DO_DOMINIO = path.join(process.cwd(), "models", "puericultura");

function arquivosDoDominio(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = path.join(pasta, entrada.name);
    if (entrada.isDirectory()) return arquivosDoDominio(caminho);
    return entrada.name.endsWith(".ts") ? [caminho] : [];
  });
}

function importesDe(codigo: string): string[] {
  const especificadores: string[] = [];
  const regra = /(?:^|\n)\s*(?:import|export)[\s\S]*?from\s+"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = regra.exec(codigo)) !== null) especificadores.push(m[1]);
  return especificadores;
}

describe("RF-01: fronteira arquitetural do domínio puro", () => {
  const arquivos = arquivosDoDominio(RAIZ_DO_DOMINIO);

  it("o domínio tem os módulos que a decomposição previu", () => {
    // Guarda de sanidade da varredura: se ela deixasse de achar arquivos, os testes
    // abaixo passariam vazios e diriam o contrário do que se quer provar.
    expect(arquivos.length).toBeGreaterThanOrEqual(20);
  });

  it("nenhum arquivo importa de fora do próprio domínio", () => {
    const ofensores: string[] = [];

    for (const arquivo of arquivos) {
      for (const especificador of importesDe(readFileSync(arquivo, "utf8"))) {
        if (!especificador.startsWith(".")) {
          ofensores.push(
            `${path.relative(process.cwd(), arquivo)} → ${especificador}`,
          );
        }
      }
    }

    expect(ofensores).toEqual([]);
  });

  it("nenhum arquivo menciona React, Next ou Primer, nem em tipo", () => {
    const proibidos =
      /(from\s+"react|from\s+"next|from\s+"@primer|JSX\.|useState)/;
    const ofensores = arquivos.filter((a) =>
      proibidos.test(readFileSync(a, "utf8")),
    );

    expect(ofensores.map((a) => path.relative(process.cwd(), a))).toEqual([]);
  });

  it("o domínio não lê o relógio nem o ambiente: a data da medição é injetada", () => {
    // `new Date(...)` com argumento é aritmética de calendário e é legítimo; o que
    // não pode existir é `Date.now()` ou `new Date()` sem argumento (RN-10).
    const relogio = /Date\.now\(\)|new Date\(\s*\)/;
    const ambiente = /process\.env|localStorage|fetch\(/;
    const ofensores = arquivos.filter((a) => {
      const codigo = readFileSync(a, "utf8");
      return relogio.test(codigo) || ambiente.test(codigo);
    });

    expect(ofensores.map((a) => path.relative(process.cwd(), a))).toEqual([]);
  });
});
