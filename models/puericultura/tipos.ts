// Contrato do motor de crescimento infantil (feature 017-puericultura-crescimento).
// Origem: RF-01, RF-06, RF-07, RF-10, RF-16 e RF-20 do requirements; RN-01, RN-08,
// RN-09, RN-12, RN-15 e RN-19; entidades conforme `data-delta.md` §2. Fonte editorial
// única: Caderneta da Criança (MS, 2.ª ed., 2020, pp. 85–97), que reproduz dois
// padrões tabulares — OMS e INTERGROWTH-21st (MD-0001 da série corrente).
// O motor apenas INFORMA escore e classificação, sem emitir conduta (ADR 0005, RN-12);
// erro esperado é valor (ADR 0004); exceção só para bug interno (ErroDeInvariante).
//
// Nota de leitura: o discriminante da SAÍDA da fachada é `tipo`, como nos quatro
// domínios existentes; o do ÍNDICE antropométrico é `estado`, para que um resultado
// com quatro índices não tenha cinco campos `tipo` de significados diferentes.

/** Data civil no formato ISO `AAAA-MM-DD` (RN-10: aritmética em dias epoch UTC). */
export type DataIso = string;

export interface ReferenciaClinica {
  readonly fonteId: string;
  readonly versaoEdicao: string;
  readonly localizacao: string;
}

export type Sexo = "masculino" | "feminino";

/** RN-09: dado clínico explícito, jamais suposto — não há default silencioso. */
export type PosicaoDaMedicao = "deitado" | "em-pe";

/** RN-15: IG ao nascer em semanas completas + dias, vocabulário de `models/gestacao`. */
export interface IdadeGestacional {
  readonly semanas: number;
  readonly dias: number;
}

/**
 * Nenhum campo identifica a criança (RNF de privacidade): sem nome, prontuário ou
 * documento. Campos opcionais realizam RF-06 já na entrada — a falta de uma medida
 * suprime só o índice que dela depende. `data-delta.md` §2.1 descreve a idade
 * gestacional como `… | null`; aqui ela é opcional, forma que o resto da plataforma
 * usa para campo ausente (molde de `EntradaDatacao`), sem diferença de comportamento.
 */
export interface EntradaAvaliacao {
  readonly sexo: Sexo;
  readonly dataDeNascimento: DataIso;
  /** Injetada pela UI com a data do dispositivo; o motor não lê o relógio (RN-10). */
  readonly dataDaMedicao: DataIso;
  readonly pesoKg?: number;
  readonly comprimentoCm?: number;
  /** Obrigatória quando há comprimento/estatura informado (RN-09). */
  readonly posicaoDaMedicao?: PosicaoDaMedicao;
  readonly perimetroCefalicoCm?: number;
  /** Ausente significa "tratada como termo", e isso é declarado na saída (RN-15). */
  readonly idadeGestacionalAoNascer?: IdadeGestacional;
}

/**
 * Cada regra temporal vira campo inspecionável, em vez de ficar espalhada pelo
 * cálculo (`data-delta.md` §2.2). RN-10, RN-16 e RN-17.
 */
export interface IdadesDerivadas {
  /** Idade cronológica em dias inteiros sobre `Date.UTC` (ADR 0013). */
  readonly diasDeVida: number;
  /** `40 − IG ao nascer`, em semanas; zero quando a criança é a termo (RN-16). */
  readonly descontoDeSemanas: number;
  /** Idade corrigida, ou a cronológica quando a correção já não se aplica. */
  readonly diasCorrigidos: number;
  /** Até 2 anos, ou até 3 quando a IG ao nascer for < 28 semanas (RN-16). */
  readonly correcaoAtiva: boolean;
  /** `IG ao nascer + idade cronológica`; `null` quando a criança é a termo (RN-17). */
  readonly semanasPosMenstruais: number | null;
}

/** RN-01: quatro índices, cada um independente dos demais (RF-06). */
export type Indice =
  | "peso-idade"
  | "comprimento-estatura-idade"
  | "imc-idade"
  | "perimetro-cefalico-idade";

/** RN-19: qual régua produziu o número. */
export type PadraoDeReferencia = "OMS" | "INTERGROWTH-21st";

/** RN-16, RN-17: qual idade indexou a curva. */
export type EspecieDeIdade = "cronologica" | "corrigida" | "pos-menstrual";

/**
 * RF-20: sem o par padrão + idade declarados, o escore seria inauditável — duas
 * crianças com o mesmo peso e a mesma data de nascimento recebem escores distintos
 * por terem nascido em idades gestacionais diferentes (RN-19).
 */
export interface IdadeUsada {
  readonly especie: EspecieDeIdade;
  /** Valor na unidade da curva: dias na OMS, semanas no INTERGROWTH-21st. */
  readonly valor: number;
  readonly unidade: "dia" | "semana";
  /** Desconto de prematuridade em semanas, presente quando `especie` é "corrigida". */
  readonly descontoDeSemanas?: number;
}

/** RN-09 (D-11): a conversão de posição é aplicada e declarada, nunca silenciosa. */
export type CodigoAviso = "CONVERSAO_DE_POSICAO_APLICADA";

export interface Aviso {
  readonly campo: string;
  readonly codigo: CodigoAviso;
  readonly mensagem: string;
}

export interface IndiceCalculado {
  readonly estado: "calculado";
  readonly indice: Indice;
  /** Sem arredondamento; exibir com uma casa decimal é da tela (D-13). */
  readonly escoreZ: number;
  /** Rótulo literal da caderneta, transcrito como está na fonte (RN-04 a RN-07). */
  readonly classificacao: string;
  readonly padrao: PadraoDeReferencia;
  readonly idadeUsada: IdadeUsada;
  /** Pode ser vazio; conversão de 0,7 cm entra aqui (RF-08). */
  readonly avisos: readonly Aviso[];
  /** Nunca ausente (RF-10, RF-20; invariante verificado por property-based). */
  readonly referencia: ReferenciaClinica;
}

/**
 * RF-06 no tipo: "não calculado" nunca se confunde com "calculado como zero", e a
 * ausência não é erro — nem quando o IMC simplesmente não existe nas curvas de
 * pré-termo (RN-17).
 */
export type MotivoDeAusencia =
  "MEDIDA_NAO_INFORMADA" | "IMC_INEXISTENTE_NO_PRETERMO";

export interface IndiceAusente {
  readonly estado: "ausente";
  readonly indice: Indice;
  readonly motivo: MotivoDeAusencia;
}

/** RN-08 (D-16): recusa PARCIAL, que não derruba os demais índices. */
export type MotivoParcialForaDoEscopo = "PC_ACIMA_DE_2_ANOS";

export interface IndiceForaDoEscopo {
  readonly estado: "fora-do-escopo";
  readonly indice: Indice;
  readonly motivo: MotivoParcialForaDoEscopo;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export type IndiceAntropometrico =
  IndiceCalculado | IndiceAusente | IndiceForaDoEscopo;

/** RN-15: a premissa de termo é do resultado inteiro, não de um índice. */
export type TipoDeNota = "PREMISSA_DE_TERMO" | "NASCIDO_A_TERMO_SEM_CORRECAO";

export interface NotaAoPrescritor {
  readonly tipo: TipoDeNota;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export interface ResultadoAvaliacao {
  readonly tipo: "resultado";
  readonly idades: IdadesDerivadas;
  /** Em qualquer combinação de variantes; um item por índice de RN-01. */
  readonly indices: readonly IndiceAntropometrico[];
  readonly notas: readonly NotaAoPrescritor[];
  /** RN-14: medição isolada × tendência, e os padrões em uso (RF-13). */
  readonly notaProveniencia: string;
  /** Nunca vazia (RF-10; invariante verificado por property-based). */
  readonly referencias: readonly ReferenciaClinica[];
}

/** RN-08 e RN-18 (D-15): recusa GLOBAL, sem número algum em tela. */
export type MotivoGlobalForaDoEscopo =
  "IDADE_FORA_DA_COBERTURA" | "ABAIXO_DA_CURVA_DE_PRETERMO";

export interface ForaDoEscopoDaFonte {
  readonly tipo: "fora-do-escopo";
  readonly motivo: MotivoGlobalForaDoEscopo;
  readonly mensagem: string;
  readonly referencia: ReferenciaClinica;
}

export type CodigoOfensor =
  | "SEXO_INVALIDO"
  | "DATA_DE_NASCIMENTO_INVALIDA"
  | "DATA_DE_NASCIMENTO_FUTURA"
  | "DATA_DA_MEDICAO_INVALIDA"
  | "NENHUMA_MEDIDA_INFORMADA"
  | "PESO_INVALIDO"
  | "COMPRIMENTO_INVALIDO"
  | "PERIMETRO_CEFALICO_INVALIDO"
  | "POSICAO_DA_MEDICAO_AUSENTE"
  | "IDADE_GESTACIONAL_INVALIDA";

export interface Ofensor {
  readonly campo: string;
  readonly codigo: CodigoOfensor;
  readonly mensagem: string;
}

/** Coleta total: todos os ofensores de uma vez, nunca só o primeiro (RN-11). */
export interface ErroValidacao {
  readonly tipo: "erro-validacao";
  readonly ofensores: readonly Ofensor[];
}

export type SaidaAvaliacao =
  ResultadoAvaliacao | ForaDoEscopoDaFonte | ErroValidacao;

/** Violação de invariante de domínio: bug interno, nunca fluxo esperado (ADR 0004). */
export class ErroDeInvariante extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeInvariante";
  }
}
