// Catálogo das 14 origens das tabelas de referência da OMS — a lista que o baixador
// resolve e o gerador percorre. Fonte: contrato de aquisição
// `_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md` §2,
// com URLs verificadas em 2026-07-26. RF-02, D-03 e D-04 do roadmap da feature 017.
//
// Regra de ouro do contrato §1: a verificação é do CONTEÚDO, jamais do nome do arquivo.
// A OMS publica o peso-para-idade de 5 a 10 anos com prefixo `hfa-` (o do indicador de
// estatura) e sufixo GUID; quem confia no nome embarca peso onde deveria haver estatura.
// Por isso cada origem declara o acrônimo de aba esperado (`abaEsperada`) e a faixa que
// o gerador exige encontrar — é o que transforma o nome em irrelevante.
// Feature 017-puericultura-crescimento.

export type Indicador =
  "peso" | "comprimento-estatura" | "imc" | "perimetro-cefalico";
export type Sexo = "masculino" | "feminino";
/** `2006` é indexada por dia (0–5 anos); `2007`, por mês (5–10 anos). */
export type Familia = "2006" | "2007";

export interface Origem {
  /** Identificador estável, usado em nome de arquivo e em mensagem de erro. */
  readonly id: string;
  readonly indicador: Indicador;
  readonly sexo: Sexo;
  readonly familia: Familia;
  readonly url: string;
  /** Nome do arquivo em `referencias/oms/`, normalizado — o da origem é irregular. */
  readonly arquivo: string;
  /** Acrônimos aceitos no nome da aba (verificação V1 do contrato §5). */
  readonly abaEsperada: readonly string[];
  /** Nome da coluna de índice: `Day` na família 2006, `Month` na 2007 (contrato §3). */
  readonly colunaIndice: "Day" | "Month";
  /** Recorte ao escopo da caderneta, inclusivo nas duas pontas (D-04). */
  readonly recorte: { readonly de: number; readonly ate: number };
}

const CDN = "https://cdn.who.int/media/docs/default-source/child-growth";
const PADROES_2006 = `${CDN}/child-growth-standards/indicators`;
const REFERENCIA_2007 = `${CDN}/growth-reference-5-19-years`;

/** Última linha das tabelas por dia: 1856 dias, o limite da própria OMS (contrato §3). */
const ULTIMO_DIA_2006 = 1856;
/** Perímetro cefálico existe só até 2 anos — 730 dias (D-16, caderneta p. 85). */
const ULTIMO_DIA_PERIMETRO = 730;
/** Primeiro mês da referência 2007 e o último que a caderneta cobre (D-15). */
const PRIMEIRO_MES_2007 = 61;
const ULTIMO_MES_2007 = 120;

export const ORIGENS: readonly Origem[] = Object.freeze([
  // --- Padrões WHO 2006, 0 a 5 anos, índice por dia ---
  {
    id: "peso-masculino-2006",
    indicador: "peso",
    sexo: "masculino",
    familia: "2006",
    url: `${PADROES_2006}/weight-for-age/expanded-tables/wfa-boys-zscore-expanded-tables.xlsx`,
    arquivo: "peso-masculino-2006.xlsx",
    abaEsperada: ["wfa_boys"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_2006 },
  },
  {
    id: "peso-feminino-2006",
    indicador: "peso",
    sexo: "feminino",
    familia: "2006",
    url: `${PADROES_2006}/weight-for-age/expanded-tables/wfa-girls-zscore-expanded-tables.xlsx`,
    arquivo: "peso-feminino-2006.xlsx",
    abaEsperada: ["wfa_girls"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_2006 },
  },
  {
    id: "comprimento-estatura-masculino-2006",
    indicador: "comprimento-estatura",
    sexo: "masculino",
    familia: "2006",
    // Atenção: comprimento/estatura usa `expandable-tables`; os outros três, `expanded-tables`.
    // A inconsistência é da OMS (contrato §2.1).
    url: `${PADROES_2006}/length-height-for-age/expandable-tables/lhfa-boys-zscore-expanded-tables.xlsx`,
    arquivo: "comprimento-estatura-masculino-2006.xlsx",
    abaEsperada: ["lhfa_boys", "hfa_boys"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_2006 },
  },
  {
    id: "comprimento-estatura-feminino-2006",
    indicador: "comprimento-estatura",
    sexo: "feminino",
    familia: "2006",
    url: `${PADROES_2006}/length-height-for-age/expandable-tables/lhfa-girls-zscore-expanded-tables.xlsx`,
    arquivo: "comprimento-estatura-feminino-2006.xlsx",
    abaEsperada: ["lhfa_girls", "hfa_girls"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_2006 },
  },
  {
    id: "imc-masculino-2006",
    indicador: "imc",
    sexo: "masculino",
    familia: "2006",
    url: `${PADROES_2006}/body-mass-index-for-age/expanded-tables/bfa-boys-zscore-expanded-tables.xlsx`,
    arquivo: "imc-masculino-2006.xlsx",
    abaEsperada: ["bfa_boys", "bmi_boys"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_2006 },
  },
  {
    id: "imc-feminino-2006",
    indicador: "imc",
    sexo: "feminino",
    familia: "2006",
    url: `${PADROES_2006}/body-mass-index-for-age/expanded-tables/bfa-girls-zscore-expanded-tables.xlsx`,
    arquivo: "imc-feminino-2006.xlsx",
    abaEsperada: ["bfa_girls", "bmi_girls"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_2006 },
  },
  {
    id: "perimetro-cefalico-masculino-2006",
    indicador: "perimetro-cefalico",
    sexo: "masculino",
    familia: "2006",
    url: `${PADROES_2006}/head-circumference-for-age/expanded-tables/hcfa-boys-zscore-expanded-tables.xlsx`,
    arquivo: "perimetro-cefalico-masculino-2006.xlsx",
    abaEsperada: ["hcfa_boys"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_PERIMETRO },
  },
  {
    id: "perimetro-cefalico-feminino-2006",
    indicador: "perimetro-cefalico",
    sexo: "feminino",
    familia: "2006",
    url: `${PADROES_2006}/head-circumference-for-age/expanded-tables/hcfa-girls-zscore-expanded-tables.xlsx`,
    arquivo: "perimetro-cefalico-feminino-2006.xlsx",
    abaEsperada: ["hcfa_girls"],
    colunaIndice: "Day",
    recorte: { de: 0, ate: ULTIMO_DIA_PERIMETRO },
  },

  // --- Referência WHO 2007, 5 a 10 anos, índice por mês ---
  {
    id: "peso-masculino-2007",
    indicador: "peso",
    sexo: "masculino",
    familia: "2007",
    // O arquivo MAL NOMEADO do contrato §2.2: prefixo `hfa-` para peso-para-idade.
    // A aba diz `wfa_boys_z_WHO 2007_exp` e a mediana em 61 meses é 18,5057 kg — peso.
    url: `${REFERENCIA_2007}/weight-for-age-(5-10-years)/hfa-boys-z-who-2007-exp_0ff9c43c-8cc0-4c23-9fc6-81290675e08b.xlsx`,
    arquivo: "peso-masculino-2007.xlsx",
    abaEsperada: ["wfa_boys"],
    colunaIndice: "Month",
    recorte: { de: PRIMEIRO_MES_2007, ate: ULTIMO_MES_2007 },
  },
  {
    id: "peso-feminino-2007",
    indicador: "peso",
    sexo: "feminino",
    familia: "2007",
    url: `${REFERENCIA_2007}/weight-for-age-(5-10-years)/hfa-girls-z-who-2007-exp_7ea58763-36a2-436d-bef0-7fcfbadd2820.xlsx`,
    arquivo: "peso-feminino-2007.xlsx",
    abaEsperada: ["wfa_girls"],
    colunaIndice: "Month",
    recorte: { de: PRIMEIRO_MES_2007, ate: ULTIMO_MES_2007 },
  },
  {
    id: "comprimento-estatura-masculino-2007",
    indicador: "comprimento-estatura",
    sexo: "masculino",
    familia: "2007",
    url: `${REFERENCIA_2007}/height-for-age-(5-19-years)/hfa-boys-z-who-2007-exp.xlsx`,
    arquivo: "comprimento-estatura-masculino-2007.xlsx",
    abaEsperada: ["hfa_boys"],
    colunaIndice: "Month",
    recorte: { de: PRIMEIRO_MES_2007, ate: ULTIMO_MES_2007 },
  },
  {
    id: "comprimento-estatura-feminino-2007",
    indicador: "comprimento-estatura",
    sexo: "feminino",
    familia: "2007",
    url: `${REFERENCIA_2007}/height-for-age-(5-19-years)/hfa-girls-z-who-2007-exp.xlsx`,
    arquivo: "comprimento-estatura-feminino-2007.xlsx",
    abaEsperada: ["hfa_girls"],
    colunaIndice: "Month",
    recorte: { de: PRIMEIRO_MES_2007, ate: ULTIMO_MES_2007 },
  },
  {
    id: "imc-masculino-2007",
    indicador: "imc",
    sexo: "masculino",
    familia: "2007",
    url: `${REFERENCIA_2007}/bmi-for-age-(5-19-years)/bmi-boys-z-who-2007-exp.xlsx`,
    arquivo: "imc-masculino-2007.xlsx",
    abaEsperada: ["bmi_boys", "bfa_boys"],
    colunaIndice: "Month",
    recorte: { de: PRIMEIRO_MES_2007, ate: ULTIMO_MES_2007 },
  },
  {
    id: "imc-feminino-2007",
    indicador: "imc",
    sexo: "feminino",
    familia: "2007",
    url: `${REFERENCIA_2007}/bmi-for-age-(5-19-years)/bmi-girls-z-who-2007-exp.xlsx`,
    arquivo: "imc-feminino-2007.xlsx",
    abaEsperada: ["bmi_girls", "bfa_girls"],
    colunaIndice: "Month",
    recorte: { de: PRIMEIRO_MES_2007, ate: ULTIMO_MES_2007 },
  },
]);

/** Onde as planilhas baixadas vivem — pasta ignorada pelo git (MD-0008). */
export const PASTA_ORIGENS = "referencias/oms";
/** Manifesto versionado de procedência, ao lado dos módulos gerados (contrato §6). */
export const CAMINHO_MANIFESTO =
  "models/puericultura/oms/tabelas/manifesto.json";

export interface EntradaManifesto {
  readonly id: string;
  readonly url: string;
  readonly arquivo: string;
  readonly baixadoEm: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface Manifesto {
  readonly contrato: string;
  readonly geradoEm: string;
  readonly origens: readonly EntradaManifesto[];
}
