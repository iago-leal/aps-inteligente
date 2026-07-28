// Congelador das páginas verdes da caderneta: `referencias/caderneta/*.pdf` →
// `tests/apoio/fichas-caderneta-congeladas.json`, versionado. Realiza T004 e T005 do plano
// da feature 020-consulta-puericultura-soap.
//
// O PROBLEMA QUE ELE RESOLVE (D-12, `MD-0010`). A feature transcreve à mão cerca de
// trezentos e cinquenta rótulos de dez páginas impressas, e erro de digitação em rótulo
// clínico é o defeito mais provável do acervo inteiro. Conferir por releitura seria a
// "segunda implementação" que `MD-0010` recusa: quem transcreveu lê o que quis escrever.
// Congelado o texto que o PDF devolve, a suíte passa a julgar a transcrição contra uma
// fonte que não veio de nós, e a conferência deixa de depender de atenção humana.
//
// POR QUE DUAS PASSAGENS, E POR QUE AS DUAS TIRAGENS. As páginas são diagramadas em duas
// colunas, e `pdftotext -layout` preserva a geometria ao custo de intercalar as colunas na
// mesma linha; sem `-layout`, o texto sai no fluxo de leitura interno do PDF, que às vezes
// mantém contíguo o rótulo que a outra passagem partiu. Exigir ocorrência em AO MENOS UMA
// das duas é o que mantém fechada a lista de exceções de layout. As duas tiragens entram
// porque a fonte imprime flexões distintas, e o oráculo precisa das duas para julgar tanto
// `rotulo` quanto `rotuloFeminino` (RN-07, D-06).
//
// Três promessas, na disciplina de `scripts/congelar-casos-oraculo.mts`:
//
//  1. **Nenhuma escrita parcial.** Tudo é extraído e conferido em memória; o arquivo só é
//     escrito quando a última página passou.
//  2. **Falha ruidosa e localizada.** A mensagem diz qual tiragem, qual passagem e o que
//     faltou.
//  3. **Idempotência.** Nenhuma data de relógio entra no documento, e rodar duas vezes
//     sobre os mesmos PDFs produz o mesmo arquivo — `git diff` vazio prova origem intacta.
//
// Uso:  node scripts/congelar-fichas-caderneta.mts
//       (exige `referencias/caderneta/` e o `pdftotext` do poppler.)
//
// Os PDFs são dependência editorial FORA do git (`MD-0008`); o congelado entra, e é ele
// que mantém a suíte executável em clone limpo.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";

const DESTINO = "tests/apoio/fichas-caderneta-congeladas.json";
const PASTA = join("referencias", "caderneta");

/** A janela impressa que a feature consome. A p. 76 entra por fechar a seção. */
const PRIMEIRA_PAGINA_IMPRESSA = 66;
const ULTIMA_PAGINA_IMPRESSA = 76;

/**
 * A página do PDF é a impressa MAIS UM, conferido nesta caderneta: o arquivo traz uma folha
 * de rosto sem numeração impressa. O deslocamento é propriedade DESTE par de arquivos, e
 * por isso é conferido no fim de cada bloco extraído em vez de suposto.
 */
const DESLOCAMENTO_DO_PDF = 1;

/** As duas passagens de D-12, cada uma com o que ela preserva. */
const PASSAGENS = [
  {
    id: "layout" as const,
    argumentos: ["-layout"],
    oQuePreserva:
      "a geometria da página, ao custo de intercalar as duas colunas",
  },
  {
    id: "fluxo" as const,
    argumentos: [],
    oQuePreserva:
      "o fluxo de leitura interno do PDF, que às vezes mantém contíguo o rótulo que a outra passagem parte",
  },
];

const TIRAGENS = [
  { id: "menino" as const, arquivo: "caderneta_crianca_menino_2ed.pdf" },
  { id: "menina" as const, arquivo: "caderneta_crianca_menina_2ed.pdf" },
];

type IdDePassagem = (typeof PASSAGENS)[number]["id"];
type PaginaCongelada = Readonly<Record<IdDePassagem, string>>;

class FalhaDoCongelamento extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "FalhaDoCongelamento";
  }
}

function sha256De(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Uma execução do `pdftotext`, devolvendo uma entrada por página impressa. O `-` final
 * manda o texto para a saída padrão; a divisão é pelo avanço de página que o poppler emite.
 */
function extrair(caminho: string, argumentos: readonly string[]): string[] {
  const bruto = execFileSync(
    "pdftotext",
    [
      ...argumentos,
      "-f",
      String(PRIMEIRA_PAGINA_IMPRESSA + DESLOCAMENTO_DO_PDF),
      "-l",
      String(ULTIMA_PAGINA_IMPRESSA + DESLOCAMENTO_DO_PDF),
      caminho,
      "-",
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

  // O poppler encerra a última página com o avanço, o que produz um bloco vazio no fim.
  const blocos = bruto.split("\f");
  if (blocos.at(-1)?.trim() === "") blocos.pop();
  return blocos;
}

/**
 * O deslocamento suposto tem de aparecer no impresso: cada bloco traz o seu número de
 * página, e é ele que se confere. Sem esta guarda, uma tiragem futura com uma folha a mais
 * congelaria o texto certo sob a página errada, e o oráculo apontaria o dedo para o lugar
 * errado sem produzir sinal nenhum.
 */
function conferirNumeracao(
  tiragem: string,
  passagem: string,
  blocos: readonly string[],
): void {
  const esperado = ULTIMA_PAGINA_IMPRESSA - PRIMEIRA_PAGINA_IMPRESSA + 1;
  if (blocos.length !== esperado) {
    throw new FalhaDoCongelamento(
      `${tiragem}/${passagem}: ${blocos.length} páginas extraídas, ${esperado} esperadas — ` +
        `confira a janela ${PRIMEIRA_PAGINA_IMPRESSA}–${ULTIMA_PAGINA_IMPRESSA} e o deslocamento ${DESLOCAMENTO_DO_PDF}`,
    );
  }

  blocos.forEach((bloco, indice) => {
    const pagina = PRIMEIRA_PAGINA_IMPRESSA + indice;
    const palavras = bloco.split(/\s+/).filter((p) => p.length > 0);
    if (!palavras.includes(String(pagina))) {
      throw new FalhaDoCongelamento(
        `${tiragem}/${passagem}: o bloco ${indice + 1} deveria ser a página impressa ${pagina}, ` +
          `e o número não aparece nele. O deslocamento de ${DESLOCAMENTO_DO_PDF} página não vale para este arquivo`,
      );
    }
  });
}

async function congelarTiragem(tiragem: (typeof TIRAGENS)[number]) {
  const caminho = join(PASTA, tiragem.arquivo);
  if (!existsSync(caminho)) {
    throw new FalhaDoCongelamento(
      `${tiragem.id}: arquivo ausente em ${caminho}. Os PDFs da caderneta são dependência ` +
        `editorial fora do git (MD-0008); ponha-os em ${PASTA}/ e rode de novo`,
    );
  }

  const sha256 = sha256De(await readFile(caminho));
  const porPassagem = new Map<IdDePassagem, string[]>();

  for (const passagem of PASSAGENS) {
    const blocos = extrair(caminho, passagem.argumentos);
    conferirNumeracao(tiragem.id, passagem.id, blocos);
    porPassagem.set(passagem.id, blocos);
    console.log(
      `✓ ${tiragem.id}/${passagem.id.padEnd(6)} ${blocos.length} páginas · ` +
        `${(blocos.join("").length / 1024).toFixed(0)} kB`,
    );
  }

  const paginas: Record<string, PaginaCongelada> = {};
  for (let p = PRIMEIRA_PAGINA_IMPRESSA; p <= ULTIMA_PAGINA_IMPRESSA; p += 1) {
    const indice = p - PRIMEIRA_PAGINA_IMPRESSA;
    paginas[String(p)] = {
      layout: porPassagem.get("layout")![indice],
      fluxo: porPassagem.get("fluxo")![indice],
    };
  }

  return { arquivo: tiragem.arquivo, sha256, paginas };
}

/** A nota de leitura que acompanha o arquivo — o "por que" que o JSON não conta sozinho. */
function meta(): Record<string, unknown> {
  return {
    esquema: "fichas-caderneta-congeladas/1",
    feature: "020-consulta-puericultura-soap",
    acao: "T005",
    geradoPor: "scripts/congelar-fichas-caderneta.mts",
    aviso:
      "ARQUIVO GERADO — não editar à mão. Regerar exige os PDFs da caderneta em " +
      "`referencias/caderneta/`, que o .gitignore exclui, e o `pdftotext` do poppler; " +
      "`git diff` vazio prova que a origem não mudou.",
    porQueExiste:
      "Oráculo de transcrição de D-12. A feature declara à mão cerca de 350 rótulos das " +
      "dez consultas datadas, e conferi-los por releitura seria a segunda implementação " +
      "que MD-0010 recusa. Congelado o texto que o PDF devolve, a suíte julga a " +
      "transcrição contra uma fonte que não veio de quem transcreveu.",
    consumidores: [
      "tests/unit/dominio-puericultura/consulta-transcricao.test.ts (T007)",
    ],
    paginasImpressas: {
      de: PRIMEIRA_PAGINA_IMPRESSA,
      ate: ULTIMA_PAGINA_IMPRESSA,
      deslocamentoDoPdf: DESLOCAMENTO_DO_PDF,
      sobreODeslocamento:
        "A página do PDF é a impressa mais um. O congelamento confere o número impresso " +
        "dentro de cada bloco em vez de supor o deslocamento.",
    },
    passagens: PASSAGENS.map((p) => ({
      id: p.id,
      argumentos: p.argumentos,
      oQuePreserva: p.oQuePreserva,
    })),
    comoLerNoTeste:
      "Um rótulo é dado por transcrito quando ocorre, com espaço em branco normalizado, no " +
      "texto da sua página em AO MENOS UMA das duas passagens de AO MENOS UMA tiragem. " +
      "Exigir as duas passagens reprovaria todo rótulo que o layout em colunas parte.",
    tiragens: TIRAGENS.map((t) => t.id),
  };
}

/** Formatado pelo Prettier do projeto, para que o `format:check` não seja 2.ª fonte de diff. */
async function serializar(documento: unknown): Promise<string> {
  return format(JSON.stringify(documento, null, 2), { parser: "json" });
}

async function principal(): Promise<void> {
  console.log(`Congelando as páginas verdes da caderneta para ${DESTINO}\n`);

  const dados: Record<string, unknown> = {};
  for (const tiragem of TIRAGENS) {
    dados[tiragem.id] = await congelarTiragem(tiragem);
  }

  const conteudo = await serializar({ ...meta(), dados });

  const anterior = existsSync(DESTINO) ? await readFile(DESTINO, "utf8") : null;
  if (anterior === conteudo) {
    console.log(`\n✓ ${DESTINO} já idêntico — nada escrito.`);
  } else {
    await writeFile(DESTINO, conteudo);
    console.log(`\n✓ ${DESTINO} escrito.`);
  }
  console.log(
    `✓ ${(conteudo.length / 1024).toFixed(0)} kB. Confira o \`git diff\`: vazio significa ` +
      `que nada mudou nas fontes.`,
  );
}

try {
  await principal();
} catch (erro) {
  const motivo = erro instanceof Error ? erro.message : String(erro);
  console.error(`\n✗ CONGELAMENTO ABORTADO — nada foi escrito.\n  ${motivo}`);
  process.exit(1);
}
