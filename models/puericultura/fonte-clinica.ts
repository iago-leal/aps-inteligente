// Fonte clínica congelada do crescimento infantil (RF-13, RN-04 a RN-07, RN-14).
// Fonte editorial única desta unit (ADR 0011; MD-0001 da série corrente): Caderneta
// da Criança — Menino / Menina, Ministério da Saúde, 2.ª ed., Brasília, 2020, seção
// "Acompanhando o Crescimento", pp. 85–97. Os PDFs são dependência editorial fora do
// git (`referencias/caderneta/`); os rótulos abaixo foram transcritos deles em 27/07.
// Feature 017-puericultura-crescimento.
//
// TRANSCRIÇÃO FIEL, com UMA exceção declarada — e a exceção é nova, de 27/07/2026.
//
// A fonte escreve "Peso elevado para idade" (sem o artigo), "Comprimento adequada" e
// "Baixa comprimento": formas que destoam da norma culta. Conferidos os dois PDFs, os
// rótulos são IDÊNTICOS nos materiais do menino e da menina, com a mesma concordância.
//
// Até 26/07 este cabeçalho concluía daí que nada se corrigia, e a conclusão era defensável:
// o médico compara a tela com a caderneta que tem na mão. A arbitragem de `MD-0015` mudou
// a conclusão sem mudar a premissa. Os DOIS desvios de CONCORDÂNCIA — e só eles — passam a
// ser corrigidos, sob a condição de o afastamento ser declarado ao leitor na proveniência
// (`NOTA_CORRECAO_DE_CONCORDANCIA`, abaixo). A razão é que corrigir em silêncio trocaria um
// desvio gramatical por um desvio de transparência, e este é o pior dos dois numa
// ferramenta que se confere contra o impresso.
//
// O que a exceção NÃO alcança, e a lista é fechada (`requirements.md` §2.4):
//   · "Muito baixo comprimento para idade" — o cabeçalho antigo o arrolava entre os
//     desviantes, e ele está correto: "baixo" já concorda com o masculino. Fica intocado;
//   · "Peso elevado para idade", "Peso adequado para idade" e os demais vinte e dois —
//     a elipse do artigo é registro telegráfico de tabela, não erro de concordância, e
//     uniformizá-la arrastaria o conjunto inteiro para além do que a decisão autorizou.
//
// A permanência do resto é verificada contra `tests/apoio/citacao-linha-de-base.json`,
// congelado do estado anterior a esta correção e jamais regerado (D-14, `MD-0018`).
import type { Indice, ReferenciaClinica } from "./tipos";

export const FONTE_ID = "caderneta-da-crianca-ms-2ed-2020";
export const VERSAO_EDICAO =
  "Caderneta da Criança (Ministério da Saúde, 2.ª ed., Brasília, 2020)";

/**
 * Nome publicado da fonte; oráculo da exceção do travessão (`docs/redacao.md` §3.2,
 * MD-0020). Esta fonte se publica sem travessão no nome, e a entrada existe assim mesmo:
 * o verificador lê as cinco, e uma lista que pulasse a fonte sem travessão ensinaria que
 * a exceção vale por fonte, quando ela vale por nome.
 */
export const NOME_PUBLICADO = "Caderneta da Criança";

export function referencia(localizacao: string): ReferenciaClinica {
  return Object.freeze({
    fonteId: FONTE_ID,
    versaoEdicao: VERSAO_EDICAO,
    localizacao,
  });
}

/**
 * Corte de classificação, na ordem em que a caderneta os imprime — do maior escore
 * para o menor. `acimaDe` é estritamente maior; `aPartirDe` é maior ou igual; a
 * última faixa recolhe o resto. Modelar o corte em vez de encadear `if` deixa a
 * borda visível: `> +2` e `≥ −2` são coisas diferentes, e é exatamente aí que a
 * transcrição de uma tabela de faixas costuma errar.
 */
export type CorteDeClassificacao =
  | { readonly tipo: "acimaDe"; readonly z: number; readonly rotulo: string }
  | { readonly tipo: "aPartirDe"; readonly z: number; readonly rotulo: string }
  | { readonly tipo: "abaixoDeTudo"; readonly rotulo: string };

/** RN-04 (pp. 89, 92, 95): quatro faixas, com categoria superior. */
export const CORTES_PESO: readonly CorteDeClassificacao[] = Object.freeze([
  Object.freeze({
    tipo: "acimaDe" as const,
    z: 2,
    rotulo: "Peso elevado para idade",
  }),
  Object.freeze({
    tipo: "aPartirDe" as const,
    z: -2,
    rotulo: "Peso adequado para idade",
  }),
  Object.freeze({
    tipo: "aPartirDe" as const,
    z: -3,
    rotulo: "Baixo peso para idade",
  }),
  Object.freeze({
    tipo: "abaixoDeTudo" as const,
    rotulo: "Muito baixo peso para idade",
  }),
]);

/**
 * RN-05 (p. 90): comprimento, até 2 anos. A fonte troca o SUBSTANTIVO do índice na
 * mesma fronteira dos dois anos em que troca a posição de medida (D-16) — achado da
 * transcrição, que o plano não previa: ele só antecipava a troca de nomenclatura do
 * IMC aos cinco anos. Sem categoria superior: estatura acima de +2 não é desvio
 * classificado na caderneta, e inventar rótulo para ela seria inventar fonte.
 */
export const CORTES_COMPRIMENTO: readonly CorteDeClassificacao[] =
  Object.freeze([
    Object.freeze({
      // Impresso "Comprimento adequada para idade" (MD-0015, RF-10).
      tipo: "aPartirDe" as const,
      z: -2,
      rotulo: "Comprimento adequado para idade",
    }),
    Object.freeze({
      // Impresso "Baixa comprimento para idade" (MD-0015, RF-10).
      tipo: "aPartirDe" as const,
      z: -3,
      rotulo: "Baixo comprimento para idade",
    }),
    Object.freeze({
      tipo: "abaixoDeTudo" as const,
      rotulo: "Muito baixo comprimento para idade",
    }),
  ]);

/** RN-05 (pp. 93, 96): estatura, de 2 anos em diante. */
export const CORTES_ESTATURA: readonly CorteDeClassificacao[] = Object.freeze([
  Object.freeze({
    tipo: "aPartirDe" as const,
    z: -2,
    rotulo: "Estatura adequada para idade",
  }),
  Object.freeze({
    tipo: "aPartirDe" as const,
    z: -3,
    rotulo: "Baixa estatura para idade",
  }),
  Object.freeze({
    tipo: "abaixoDeTudo" as const,
    rotulo: "Muito baixa estatura para idade",
  }),
]);

/** RN-06 (pp. 91, 94): IMC de 0 a 5 anos. */
export const CORTES_IMC_ATE_5_ANOS: readonly CorteDeClassificacao[] =
  Object.freeze([
    Object.freeze({ tipo: "acimaDe" as const, z: 3, rotulo: "Obesidade" }),
    Object.freeze({ tipo: "acimaDe" as const, z: 2, rotulo: "Sobrepeso" }),
    Object.freeze({
      tipo: "acimaDe" as const,
      z: 1,
      rotulo: "Risco de sobrepeso",
    }),
    Object.freeze({ tipo: "aPartirDe" as const, z: -2, rotulo: "Eutrofia" }),
    Object.freeze({ tipo: "aPartirDe" as const, z: -3, rotulo: "Magreza" }),
    Object.freeze({
      tipo: "abaixoDeTudo" as const,
      rotulo: "Magreza acentuada",
    }),
  ]);

/**
 * RN-06 (p. 97): IMC de 5 a 10 anos. Os três rótulos superiores DESLIZAM um degrau
 * — o que era "Sobrepeso" vira "Obesidade" —, de modo que o mesmo escore z muda de
 * laudo nutricional ao cruzar os cinco anos. É a armadilha central da fonte.
 */
export const CORTES_IMC_DE_5_A_10_ANOS: readonly CorteDeClassificacao[] =
  Object.freeze([
    Object.freeze({
      tipo: "acimaDe" as const,
      z: 3,
      rotulo: "Obesidade grave",
    }),
    Object.freeze({ tipo: "acimaDe" as const, z: 2, rotulo: "Obesidade" }),
    Object.freeze({ tipo: "acimaDe" as const, z: 1, rotulo: "Sobrepeso" }),
    Object.freeze({ tipo: "aPartirDe" as const, z: -2, rotulo: "Eutrofia" }),
    Object.freeze({ tipo: "aPartirDe" as const, z: -3, rotulo: "Magreza" }),
    Object.freeze({
      tipo: "abaixoDeTudo" as const,
      rotulo: "Magreza acentuada",
    }),
  ]);

/** RN-07 (p. 88): três faixas, sem corte em ±3. A fonte usa a sigla, não o nome. */
export const CORTES_PERIMETRO_CEFALICO: readonly CorteDeClassificacao[] =
  Object.freeze([
    Object.freeze({
      tipo: "acimaDe" as const,
      z: 2,
      rotulo: "PC acima do esperado para a idade",
    }),
    Object.freeze({
      tipo: "aPartirDe" as const,
      z: -2,
      rotulo: "PC adequado para idade",
    }),
    Object.freeze({
      tipo: "abaixoDeTudo" as const,
      rotulo: "PC abaixo do esperado para idade",
    }),
  ]);

/**
 * Fronteiras clínicas em DIAS. Os dois primeiros números vêm da ficha `MD-0006`, que
 * converteu em dias o que a spec enunciava em anos: sem número não há teste.
 */
export const FRONTEIRAS = Object.freeze({
  /** D-16: o último dia de "menor de 2 anos". Governa posição de medida, escopo do
   *  perímetro cefálico e o substantivo do índice de comprimento/estatura. */
  doisAnosEmDias: 730,
  /** D-05: cinco anos exatos, onde a caderneta troca a nomenclatura do IMC. NÃO
   *  coincide com a fronteira de TABELA (1856 dias), que mora em `oms/leitura.ts`. */
  cincoAnosEmDias: 1826,
  /** RN-16: a correção de idade vale até 2 anos de idade cronológica... */
  correcaoAteEmDias: 730,
  /** ...ou até 3 anos quando a IG ao nascer for < 28 semanas. O ano segue a mesma
   *  disciplina de D-16 — 365 dias corridos, não a data civil de aniversário —,
   *  para que as duas fronteiras da mesma regra se meçam na mesma unidade. */
  correcaoEstendidaAteEmDias: 1095,
  /** RN-16: abaixo desta IG ao nascer, a correção se estende ao terceiro ano. */
  igQueEstendeACorrecaoEmSemanas: 28,
  /** RN-15: a partir daqui a criança é a termo e nenhuma correção se aplica. */
  igDeTermoEmSemanas: 37,
  /** RN-16: o alvo do desconto — `desconto = 40 − IG ao nascer`. */
  semanasDeTermo: 40,
});

/** RN-17/RN-18 (p. 87): a janela em que as curvas de pré-termo valem. */
export const JANELA_PRETERMO_EM_SEMANAS = Object.freeze({ de: 27, ate: 64 });

/** RN-09 (p. 85): a diferença entre medir deitado e medir em pé. */
export const CONVERSAO_DE_POSICAO_EM_CM = 0.7;

/**
 * RN-11 🟡: bom senso clínico, não da fonte — a caderneta não publica limites de
 * digitação. Existem para barrar erro grosseiro, não para julgar o caso extremo.
 */
export const FAIXAS_DE_PLAUSIBILIDADE = Object.freeze({
  pesoKg: Object.freeze({ min: 0, max: 150 }),
  comprimentoCm: Object.freeze({ min: 20, max: 200 }),
  perimetroCefalicoCm: Object.freeze({ min: 20, max: 70 }),
  idadeGestacionalSemanas: Object.freeze({ min: 22, max: 42 }),
  idadeGestacionalDias: Object.freeze({ min: 0, max: 6 }),
});

/**
 * A página do gráfico que a caderneta imprime para cada índice e faixa etária. São
 * três gráficos por índice (0–2, 2–5 e 5–10 anos), exceto o perímetro cefálico, que
 * só tem o primeiro. As faixas AQUI são as da caderneta e não coincidem com as duas
 * tabelas da OMS (0–5 e 5–10): a fonte editorial parte onde o dado tabular não parte.
 */
function paginaDoIndice(indice: Indice, diasDeVida: number): number {
  const ateDoisAnos = diasDeVida <= FRONTEIRAS.doisAnosEmDias;
  const ateCincoAnos = diasDeVida < FRONTEIRAS.cincoAnosEmDias;

  switch (indice) {
    case "perimetro-cefalico-idade":
      return 88;
    case "peso-idade":
      return ateDoisAnos ? 89 : ateCincoAnos ? 92 : 95;
    case "comprimento-estatura-idade":
      return ateDoisAnos ? 90 : ateCincoAnos ? 93 : 96;
    case "imc-idade":
      return ateDoisAnos ? 91 : ateCincoAnos ? 94 : 97;
  }
}

const NOME_DO_INDICE: Readonly<Record<Indice, string>> = Object.freeze({
  "peso-idade": "peso para idade",
  "comprimento-estatura-idade": "comprimento/estatura para idade",
  "imc-idade": "IMC para idade",
  "perimetro-cefalico-idade": "perímetro cefálico para idade",
});

/** RF-10/RF-20: a referência que carimba cada índice lido nas curvas da OMS. */
export function referenciaDoIndice(
  indice: Indice,
  diasDeVida: number,
): ReferenciaClinica {
  return referencia(
    `p. ${paginaDoIndice(indice, diasDeVida)}, gráfico de ${NOME_DO_INDICE[indice]} (curvas da OMS)`,
  );
}

export const REFERENCIAS = Object.freeze({
  /** p. 87: os gráficos de pré-termo e a regra de transferência às 64 semanas. */
  preTermo: referencia(
    "p. 87, Curvas Internacionais de Crescimento para Crianças Nascidas Pré-Termo (INTERGROWTH-21st), de 27 a 64 semanas",
  ),
  /** p. 86: onde a caderneta ensina a calcular e até quando corrigir a idade. */
  idadeCorrigida: referencia(
    "p. 86, cálculo da idade corrigida do recém-nascido pré-termo: 40 semanas menos a IG ao nascer, descontado da idade cronológica",
  ),
  /** p. 85: a regra dos 0,7 cm entre comprimento e estatura. */
  posicaoDaMedicao: referencia(
    "p. 85, diferença de 0,7 cm entre a estatura medida deitada e em pé",
  ),
  /** p. 85: a cobertura da caderneta, que é o limite do que se pode afirmar. */
  cobertura: referencia(
    "pp. 85–97, Acompanhando o Crescimento: gráficos de 0 a 10 anos, e de 0 a 2 anos no perímetro cefálico",
  ),
});

/**
 * RN-14/RF-13: fonte textual única da nota de proveniência, lida pela tela. Diz as
 * três coisas que o número em tela não diz sozinho: que uma medição isolada não é a
 * avaliação que a caderneta ensina, quais réguas produziram o escore, e que a
 * leitura da tabela é por linha publicada, sem interpolar (D-06) — divergência
 * assumida contra o software oficial da OMS, que o roadmap §9 mandou declarar aqui.
 */
/**
 * RF-10: a declaração do único afastamento autorizado da transcrição literal.
 *
 * Constante PRÓPRIA, e não emenda na `NOTA_PROVENIENCIA`, por três razões que a decisão
 * registrou (D-06): são dois assuntos com ciclos de vida distintos — um descreve o limite
 * da avaliação, o outro o afastamento da fonte —; emendar produziria um bloco único com
 * três pares de travessão, contra o teto da norma; e `W022` da feature 017, reescrito por
 * `MD-0017`, passa a vigiar a permanência desta declaração, o que se faz com precisão sobre
 * constante exportada e não sobre trecho dentro de um parágrafo de quinhentos caracteres.
 *
 * Ela nomeia as formas impressas para que quem confere contra a página saiba de onde vem a
 * diferença. Corrigir sem informar seria violação de RN-09, não cumprimento parcial dela.
 */
export const NOTA_CORRECAO_DE_CONCORDANCIA =
  "Dois rótulos de classificação são exibidos com a concordância corrigida: onde a Caderneta da Criança imprime “Comprimento adequada para idade” e “Baixa comprimento para idade”, esta tela lê “Comprimento adequado para idade” e “Baixo comprimento para idade”. A correção alcança a concordância e nada mais: os demais rótulos, inclusive “Muito baixo comprimento para idade” e a elipse do artigo em “para idade”, são reproduzidos como a fonte os imprime.";

export const NOTA_PROVENIENCIA =
  "A classificação vale para esta medição isolada. A Caderneta da Criança avalia o crescimento pela tendência de medidas sucessivas, cujos pontos unidos formam a linha que mostra como a criança evolui; um ponto único não substitui essa leitura. Os escores usam as curvas da Organização Mundial da Saúde (padrões de 2006 para 0 a 5 anos e referência de 2007 para 5 a 10 anos) e, na criança nascida pré-termo entre 27 e 64 semanas pós-menstruais, as curvas INTERGROWTH-21st reproduzidas na p. 87. A tabela é lida na linha publicada, por dia até os 5 anos e por mês completo depois, sem interpolação: nenhum valor do cálculo é estimado.";
