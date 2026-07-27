// Oráculo das curvas da OMS: os pares `(medida em SDn, n)` que as próprias planilhas
// publicam ao lado de `L`, `M` e `S`.
//
// POR QUE ESTE MÓDULO EXISTE (achado A003 da auditoria cruzada): as colunas de desvio são
// consumidas pela verificação V6 do gerador e **não** entram nos módulos emitidos por
// `scripts/oms/emitir-modulo.mts`. Elas só existem nas planilhas de `referencias/oms/`, que
// o `.gitignore` exclui. Sem este congelamento, o oráculo exato do escore z desapareceria
// no primeiro clone limpo e T010 ficaria sem como se provar.
//
// A amostra é DETERMINÍSTICA: fronteiras obrigatórias mais um passo fixo. Duas execuções
// sobre a mesma planilha produzem os mesmos casos, na mesma ordem — é o que permite ao
// `git diff` vazio significar "a origem não mudou".
//
// Módulo DEV-TIME: nunca importado por código de aplicação (fronteira do roadmap §5).
// T008 · RF-02, RF-03, D-10 do roadmap da feature 017-puericultura-crescimento.
import { coluna, lerPlanilha, type Planilha } from "../lib/planilha.mts";
import { extrairRecorte, type LinhaLms } from "../oms/extracao.mts";
import { DESVIOS_CONFERIDOS, PRECISAO } from "../oms/criterios.mts";
import { type Origem } from "../oms/origens.mts";

/**
 * Desvios congelados. A ação pede `SD3neg`…`SD3`; `SD4neg` e `SD4` entram junto porque
 * custam dois números por caso e carregam, sozinhos, a prova da correção de cauda.
 *
 * ACHADO DO CONGELAMENTO (27/07): as colunas de ±4 **não** são LMS pura em toda tabela. Nos
 * indicadores baseados em peso, a própria OMS as publica já com a correção de cauda — no
 * peso masculino ao nascer a LMS prevê 5,6945 kg em z = 4 e a fonte publica 5,642, que é
 * exatamente `SD3 + (SD3 − SD2)`. RN-03 e D-10 até aqui se apoiavam na leitura da
 * implementação `gigs`; agora se apoiam no dado da fonte.
 *
 * O ACHADO TEM UM SEGUNDO LADO, e ele importa mais. Nos outros dois indicadores a coluna de
 * ±4 **não distingue** as duas regras: comprimento/estatura e perímetro cefálico têm `L = 1`
 * em todas as 14 tabelas, e com `L = 1` a LMS já é linear em `z`, de passo `SD3 − SD2`.
 * Extrapolar a partir de ±3 devolve, ali, exatamente o que a LMS devolveria — a diferença
 * medida é de 1e-14, ruído de ponto flutuante. Duas consequências: (1) o dado da OMS
 * confirma a cauda onde ela vale e é SILENCIOSO onde ela não vale, de modo que a metade
 * negativa de RN-03 não se prova por este oráculo, e sim por tabela sintética com `L ≠ 1`
 * (T007); (2) nesses dois indicadores, aplicar a cauda por engano seria clinicamente
 * inócuo, ao passo que deixar de aplicá-la no peso desloca o escore em até 10,4 unidades de
 * IMC — a assimetria diz onde o teste precisa ser severo.
 */
export const DESVIOS_CONGELADOS: Readonly<Record<string, number>> =
  Object.freeze({
    SD4neg: -4,
    ...DESVIOS_CONFERIDOS,
    SD4: 4,
  });

/**
 * As duas colunas que o gerador não extrai: `extrairRecorte` traz só os desvios de
 * `DESVIOS_CONFERIDOS`, que são os de V6. Estas são lidas à parte, da mesma planilha.
 */
const DESVIOS_EXTRAS: readonly string[] = Object.freeze(
  Object.keys(DESVIOS_CONGELADOS).filter(
    (nome) => !(nome in DESVIOS_CONFERIDOS),
  ),
);

/** Casas decimais com que a fonte publica as colunas de desvio. */
export const PRECISAO_DOS_DESVIOS = 3;

/**
 * Indicadores a que a correção de cauda se aplica (RN-03, D-10): os baseados em peso. A
 * conferência de ±4 usa a regra da cauda nestes dois e a LMS pura nos outros, e para se a
 * fonte discordar. Vale saber o alcance da prova: retirar "peso" ou "imc" desta lista faz o
 * congelamento falhar de imediato; acrescentar os outros dois **não** o faz falhar, porque
 * ali `L = 1` iguala as duas regras. A lista é comprovada num sentido só.
 */
export const APLICA_CAUDA: readonly string[] = Object.freeze(["peso", "imc"]);

/** Fronteira além da qual a OMS deixa de usar a LMS e extrapola linearmente. */
const FRONTEIRA_DA_CAUDA = 3;

/**
 * Tolerância da conferência, NA ESCALA DA MEDIDA: metade da última casa publicada, mais
 * folga de ponto flutuante. Mesma grandeza da `TOLERANCIA_V6` do gerador, e pelo mesmo
 * motivo — o desvio publicado é o valor exato arredondado a três casas, então reconstruí-lo
 * empata na terceira.
 *
 * A escala importa. Conferir na escala de `z` pareceria mais direto e seria mais frouxo:
 * o erro de arredondamento da medida se amplifica por `1/(M·S)` ao virar escore, e no peso
 * ao nascer (`M = 3,3464`, `S = 0,14602`) esse fator passa de dois. Aqui se confere onde a
 * fonte publica; a tolerância em `z` é consequência medida, e vai declarada no arquivo.
 */
export const TOLERANCIA_ORACULO = 5e-4 + 1e-9;

/** Passo da amostra na família 2006, em dias. Bimestral: legível e barato. */
const PASSO_2006 = 60;
/** Passo da amostra na família 2007, em meses. Semestral: a tabela tem só 60 linhas. */
const PASSO_2007 = 6;

/**
 * Índices que a amostra inclui sempre, quando caem dentro do recorte da origem. Cada um
 * responde por uma decisão do plano que só se prova no ponto exato.
 */
const OBRIGATORIOS: Readonly<Record<string, string>> = Object.freeze({
  0: "primeira linha da tabela — nascimento",
  1: "degrau da perda ponderal fisiológica (V5, contrato §5.2)",
  2: "recuperação do peso de nascimento no menino",
  3: "recuperação do peso de nascimento na menina",
  729: "véspera da fronteira dos dois anos",
  730: "fronteira dos dois anos — última linha do perímetro cefálico (D-16)",
  731: "primeiro dia além dos dois anos — degrau da troca de régua (D-11, D-16)",
  1825: "cinco anos exatos — véspera da troca de rótulo do IMC (D-05)",
  1826: "primeiro dia com os rótulos da faixa de cima (D-05)",
  1855: "penúltima linha da família 2006",
  1856: "última linha da família 2006 — fronteira de tabela (D-05)",
  61: "primeiro mês da referência 2007",
  120: "último mês coberto pela caderneta (D-15)",
});

/**
 * Chave do desvio no JSON. O prefixo não é enfeite: `{"-4": …, "0": …}` sai do
 * `JSON.stringify` com as chaves inteiras positivas na frente, porque o JavaScript trata
 * índice de array antes de chave de objeto. Com `z-4` a ordem de inserção se mantém e a
 * tabela fica legível na auditoria. Leia com `Number(chave.slice(1))`.
 */
export function chaveDoDesvio(z: number): string {
  return `z${z}`;
}

export interface CasoOraculo {
  readonly indice: number;
  readonly l: number;
  readonly m: number;
  readonly s: number;
  /** Medida publicada em cada desvio, indexada por `chaveDoDesvio`. */
  readonly sd: Readonly<Record<string, number>>;
  /** Presente só quando o índice está na lista de obrigatórios; diz por que ele entrou. */
  readonly porque?: string;
}

export interface TabelaOraculo {
  readonly origem: string;
  readonly modulo: string;
  readonly indicador: string;
  readonly sexo: string;
  readonly familia: string;
  readonly unidadeDoIndice: "dia" | "mes";
  readonly recorte: { readonly de: number; readonly ate: number };
  /** Total de linhas do recorte, do qual a amostra saiu. */
  readonly linhasNaOrigem: number;
  readonly casos: readonly CasoOraculo[];
}

/** Escore z pelo LMS de Cole, sem correção de cauda. Independente do domínio por desenho:
 * conferir o congelado contra a implementação que ele existe para testar seria circular. */
export function escoreLms(
  medida: number,
  l: number,
  m: number,
  s: number,
): number {
  return l === 0
    ? Math.log(medida / m) / s
    : (Math.pow(medida / m, l) - 1) / (l * s);
}

/** A inversa: a medida que o escore `z` representa naquela linha. É nela que se confere. */
function medidaEsperada(z: number, l: number, m: number, s: number): number {
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l);
}

/**
 * A medida que a OMS publica em `z` além de ±3 nos indicadores com cauda: extrapolação
 * linear a partir do último ponto da LMS, no passo `SD3 − SD2` do lado correspondente. Os
 * dois pontos de apoio vêm da LMS exata, não das colunas já arredondadas, para que a
 * conferência acumule um arredondamento só — o do próprio valor publicado.
 */
function medidaPelaCauda(z: number, l: number, m: number, s: number): number {
  const sinal = Math.sign(z);
  const borda = medidaEsperada(sinal * FRONTEIRA_DA_CAUDA, l, m, s);
  const anterior = medidaEsperada(sinal * (FRONTEIRA_DA_CAUDA - 1), l, m, s);
  return borda + (Math.abs(z) - FRONTEIRA_DA_CAUDA) * (borda - anterior);
}

/** Índices da amostra, em ordem crescente e sem repetição. */
function selecionarIndices(origem: Origem): number[] {
  const { de, ate } = origem.recorte;
  const passo = origem.familia === "2006" ? PASSO_2006 : PASSO_2007;
  const escolhidos = new Set<number>();
  for (let i = de; i <= ate; i += passo) escolhidos.add(i);
  escolhidos.add(ate);
  for (const chave of Object.keys(OBRIGATORIOS)) {
    const indice = Number(chave);
    if (indice >= de && indice <= ate) escolhidos.add(indice);
  }
  return [...escolhidos].sort((a, b) => a - b);
}

/** Lê `SD4neg` e `SD4` diretamente da planilha, indexadas pelo índice da linha. */
function lerDesviosExtras(
  planilha: Planilha,
  origem: Origem,
  caminho: string,
): Map<number, Record<string, number>> {
  const posicaoDoIndice = coluna(planilha, origem.colunaIndice, caminho);
  const posicoes = DESVIOS_EXTRAS.map(
    (nome) => [nome, coluna(planilha, nome, caminho)] as const,
  );
  const porIndice = new Map<number, Record<string, number>>();
  for (const celulas of planilha.linhas) {
    const indice = Number(celulas[posicaoDoIndice]);
    porIndice.set(
      indice,
      Object.fromEntries(
        posicoes.map(([nome, posicao]) => [nome, Number(celulas[posicao])]),
      ),
    );
  }
  return porIndice;
}

function montarCaso(
  linha: LinhaLms,
  extras: Readonly<Record<string, number>> | undefined,
  caminho: string,
): CasoOraculo {
  const publicados = { ...linha.desvios, ...(extras ?? {}) };
  const sd: Record<string, number> = {};
  for (const [nome, n] of Object.entries(DESVIOS_CONGELADOS)) {
    const bruto = publicados[nome];
    if (bruto === undefined || !Number.isFinite(bruto)) {
      throw new Error(
        `${caminho}: coluna de desvio "${nome}" ausente ou não numérica na linha ${linha.indice}`,
      );
    }
    sd[chaveDoDesvio(n)] = Number(bruto.toFixed(PRECISAO_DOS_DESVIOS));
  }
  const porque = OBRIGATORIOS[String(linha.indice)];
  return {
    indice: linha.indice,
    l: Number(linha.l.toFixed(PRECISAO.l)),
    m: Number(linha.m.toFixed(PRECISAO.m)),
    s: Number(linha.s.toFixed(PRECISAO.s)),
    sd,
    ...(porque === undefined ? {} : { porque }),
  };
}

/** Nome do módulo emitido a que esta origem corresponde, para o teste amarrar os dois. */
function moduloDaOrigem(origem: Origem): string {
  const faixa =
    origem.indicador === "perimetro-cefalico"
      ? "0-2"
      : origem.familia === "2006"
        ? "0-5"
        : "5-10";
  const indicador =
    origem.indicador === "comprimento-estatura" && origem.familia === "2007"
      ? "estatura"
      : origem.indicador;
  return `${indicador}-idade-${faixa}-${origem.sexo}`;
}

/** Lê a planilha da origem e devolve a amostra congelável, já conferida contra a LMS. */
export function congelarTabela(
  origem: Origem,
  caminho: string,
): { tabela: TabelaOraculo; conferidos: number; piorEmZ: number } {
  const planilha = lerPlanilha(caminho);
  const { linhas } = extrairRecorte(planilha, origem, caminho);
  const porIndice = new Map(linhas.map((linha) => [linha.indice, linha]));
  const extras = lerDesviosExtras(planilha, origem, caminho);

  const casos: CasoOraculo[] = [];
  let conferidos = 0;
  let piorEmZ = 0;
  for (const indice of selecionarIndices(origem)) {
    const linha = porIndice.get(indice);
    if (linha === undefined) {
      throw new Error(`${caminho}: índice ${indice} ausente no recorte`);
    }
    const caso = montarCaso(linha, extras.get(indice), caminho);
    const conferencia = conferirCaso(caso, origem.indicador, caminho);
    conferidos += conferencia.pares;
    piorEmZ = Math.max(piorEmZ, conferencia.piorEmZ);
    casos.push(caso);
  }

  return {
    piorEmZ,
    tabela: {
      origem: origem.id,
      modulo: moduloDaOrigem(origem),
      indicador: origem.indicador,
      sexo: origem.sexo,
      familia: origem.familia,
      unidadeDoIndice: origem.colunaIndice === "Day" ? "dia" : "mes",
      recorte: origem.recorte,
      linhasNaOrigem: linhas.length,
      casos,
    },
    conferidos,
  };
}

export interface ConferenciaDoCaso {
  /** Quantos pares `(medida, z)` do caso se sustentaram. */
  readonly pares: number;
  /** Maior desvio na escala de `z`, que é o que o teste vai enxergar. */
  readonly piorEmZ: number;
}

/**
 * Confere, na própria rodada de congelamento, que a medida publicada em cada desvio é a que
 * a LMS da mesma linha prevê. Um caso que não se sustenta não pode virar oráculo de coisa
 * alguma. De passagem, mede o desvio correspondente em `z` — o número que o teste vai
 * precisar como tolerância, e que assim sai medido, não estimado.
 */
function conferirCaso(
  caso: CasoOraculo,
  indicador: string,
  caminho: string,
): ConferenciaDoCaso {
  const comCauda = APLICA_CAUDA.includes(indicador);
  let pares = 0;
  let piorEmZ = 0;
  for (const [chave, publicada] of Object.entries(caso.sd)) {
    const z = Number(chave.slice(1));
    const extrapolado = comCauda && Math.abs(z) > FRONTEIRA_DA_CAUDA;
    const prevista = extrapolado
      ? medidaPelaCauda(z, caso.l, caso.m, caso.s)
      : medidaEsperada(z, caso.l, caso.m, caso.s);
    if (Math.abs(prevista - publicada) > TOLERANCIA_ORACULO) {
      throw new Error(
        `${caminho}: no índice ${caso.indice}, ${extrapolado ? "a cauda" : "a LMS"} ` +
          `(L=${caso.l}, M=${caso.m}, S=${caso.s}) prevê ${prevista.toFixed(6)} em z=${z} e ` +
          `a fonte publica ${publicada} — divergência ` +
          `${Math.abs(prevista - publicada).toExponential(2)}, acima da tolerância. ` +
          `Em desvio de ±4, suspeite primeiro de APLICA_CAUDA para "${indicador}"`,
      );
    }
    // O desvio em `z` só faz sentido onde a medida é LMS pura; além da cauda, a inversa que
    // o teste vai usar não é esta, e comparar aqui mediria outra coisa.
    if (!extrapolado) {
      piorEmZ = Math.max(
        piorEmZ,
        Math.abs(escoreLms(publicada, caso.l, caso.m, caso.s) - z),
      );
    }
    pares++;
  }
  return { pares, piorEmZ };
}
