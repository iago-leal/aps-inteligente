// T009 (feature 023-saude-do-idoso-gds) — a fronteira arquitetural do domínio puro
// (RF-17; RN-09; ADR 0003).
//
// O QUE ESTA VARREDURA FAZ, E POR QUE ELA EXISTE EM ARQUIVO PRÓPRIO. Ela lê os arquivos de
// `models/depressao-geriatrica/**` como texto e reprova se algum importar de fora do próprio
// domínio, mencionar framework ou sistema de design, ou ler o relógio. É o molde que a
// feature 017 instalou para `models/puericultura/**`, estendido ao sexto unit: a dívida 1 de
// `architecture.md` — guarda executável restrita a um domínio só — encolhe em vez de se
// repetir.
//
// Fica separado de `invariantes.test.ts` porque prova coisa de outra natureza: aquele afirma
// o COMPORTAMENTO do motor, este afirma a FORMA do código que o produz. Juntos num arquivo,
// a segunda garantia desapareceria dentro da primeira na primeira leitura apressada.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ_DO_DOMINIO = path.join(
  process.cwd(),
  "models",
  "depressao-geriatrica",
);

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

function relativo(arquivo: string): string {
  return path.relative(process.cwd(), arquivo);
}

describe("RF-17: fronteira arquitetural de models/depressao-geriatrica", () => {
  const arquivos = arquivosDoDominio(RAIZ_DO_DOMINIO);

  it("a varredura encontra os módulos que a decomposição previu", () => {
    // Guarda de sanidade: se ela deixasse de achar arquivos, os testes abaixo passariam
    // vazios e diriam o contrário do que se quer provar.
    expect(arquivos.map((a) => path.basename(a)).sort()).toEqual([
      "calculadora.ts",
      "classificacao.ts",
      "escore.ts",
      "fonte-clinica.ts",
      "itens.ts",
      "tipos.ts",
      "validacao.ts",
    ]);
  });

  it("nenhum arquivo importa de fora do próprio domínio", () => {
    const ofensores: string[] = [];
    for (const arquivo of arquivos) {
      for (const especificador of importesDe(readFileSync(arquivo, "utf8"))) {
        if (!especificador.startsWith(".")) {
          ofensores.push(`${relativo(arquivo)} → ${especificador}`);
        }
      }
    }
    expect(ofensores).toEqual([]);
  });

  it("nenhum arquivo menciona React, Next ou o sistema de design, nem em tipo", () => {
    const proibidos =
      /(from\s+"react|from\s+"next|from\s+"@primer|JSX\.|useState)/;
    const ofensores = arquivos.filter((a) =>
      proibidos.test(readFileSync(a, "utf8")),
    );
    expect(ofensores.map(relativo)).toEqual([]);
  });

  it("o domínio não lê o relógio nem o ambiente", () => {
    // Aqui nem `new Date(...)` com argumento tem lugar: a escala não tem aritmética de
    // calendário, e a data que a fonte carrega é a de acesso, escrita como constante.
    const relogio = /Date\.now\(\)|new Date\(/;
    const ambiente = /process\.env|localStorage|fetch\(/;
    const ofensores = arquivos.filter((a) => {
      const codigo = readFileSync(a, "utf8");
      return relogio.test(codigo) || ambiente.test(codigo);
    });
    expect(ofensores.map(relativo)).toEqual([]);
  });

  it("nenhum arquivo do domínio lê disco: o dado da escala é congelado em código", () => {
    const disco = /node:fs|readFileSync|require\(/;
    const ofensores = arquivos.filter((a) =>
      disco.test(readFileSync(a, "utf8")),
    );
    expect(ofensores.map(relativo)).toEqual([]);
  });
});
