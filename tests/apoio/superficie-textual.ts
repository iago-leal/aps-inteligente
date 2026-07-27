// Leitura direta da superfície textual que os verificadores da feature 018 conferem.
//
// POR QUE LER O FONTE, E NÃO O INVENTÁRIO. Três dos sete verificadores — descrição da
// plataforma, igualdade do par duplicado e cláusula de privacidade — precisam do estado
// CORRENTE do arquivo, e o inventário é regerado ao fim das reescritas. Um verificador que
// lesse o inventário estaria conferindo o texto contra a cópia que o próprio texto acabou
// de produzir, e passaria por construção. Aqui não há intermediário: abre-se o arquivo.
//
// A leitura é por expressão regular, e é o lugar certo para ela — ao contrário do extrator
// de `scripts/inventariar-textos.mts`, que percorre a árvore sintática porque precisa
// distinguir literal de comentário em quarenta arquivos, aqui se buscam campos nomeados em
// seis arquivos conhecidos, e a ausência do campo é falha explícita e não silêncio.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..", "..");

/** As seis rotas, na ordem do catálogo. A raiz vem primeiro. */
export const ROTAS = [
  "pages/index.tsx",
  "pages/dm2/insulina.tsx",
  "pages/pre-natal/idade-gestacional.tsx",
  "pages/cardiologia/dor-toracica.tsx",
  "pages/cardiologia/risco-cardiovascular.tsx",
  "pages/puericultura/crescimento.tsx",
] as const;

export const CAMINHO_DO_MANIFESTO = "public/manifest.webmanifest";
export const CAMINHO_DA_HOME = "interface/inicio/tela.tsx";

export function ler(caminhoRelativo: string): string {
  return readFileSync(join(RAIZ, caminhoRelativo), "utf8");
}

function normalizar(bruto: string): string {
  return bruto.replace(/\s+/g, " ").trim();
}

/** A `<meta name="description">` da rota. Falha explícita quando o campo não existe. */
export function descricaoDaRota(rota: string): string {
  const fonte = ler(rota);
  // Sem a bandeira `s`: o alvo do projeto é ES2017, e ela não é necessária — `\s*` já
  // atravessa a quebra de linha entre os dois atributos, e `.` não é usado aqui.
  const achado = /name="description"\s*content="([^"]*)"/.exec(fonte);
  if (achado === null) {
    throw new Error(
      `${rota} não declara <meta name="description">. Toda rota precisa da sua: é o texto ` +
        `que sai para o buscador e para o compartilhamento.`,
    );
  }
  return normalizar(achado[1]);
}

/** O `<title>` da rota, com o espaço em branco do JSX normalizado. */
export function tituloDaRota(rota: string): string {
  const achado = /<title>([\s\S]*?)<\/title>/.exec(ler(rota));
  if (achado === null) throw new Error(`${rota} não declara <title>.`);
  return normalizar(achado[1]);
}

/** O subtítulo do hero da home, que hoje é byte a byte igual à `description` do manifesto. */
export function subtituloDaHome(): string {
  const achado = /subtitulo="([^"]*)"/.exec(ler(CAMINHO_DA_HOME));
  if (achado === null) {
    throw new Error(
      `${CAMINHO_DA_HOME} não declara a prop \`subtitulo\` da Moldura. É o par de D-18: ` +
        `o subtítulo do hero e a \`description\` do manifesto dizem a mesma coisa.`,
    );
  }
  return normalizar(achado[1]);
}

export function manifesto(): Record<string, unknown> {
  return JSON.parse(ler(CAMINHO_DO_MANIFESTO)) as Record<string, unknown>;
}
