// Curvas pós-natais do INTERGROWTH-21st como EQUAÇÕES FECHADAS (D-02; RF-18, RN-17).
// Feature 017-puericultura-crescimento.
//
// Fonte: Villar J, Giuliani F, Bhutta ZA, Bertino E, Ohuma EO, Ismail LC et al.
// *Postnatal growth standards for preterm infants: the Preterm Postnatal Follow-up
// Study of the INTERGROWTH-21st Project.* Lancet Glob Health 2015;3(11):e681–e691.
// A caderneta reproduz essas curvas na p. 87, para 27 a 64 semanas pós-menstruais.
//
// POR QUE EQUAÇÃO E NÃO TABELA. O estudo não modela assimetria — os resíduos não
// mostraram não-normalidade após transformação logarítmica —, de modo que não há `L`
// de LMS a tabelar: para cada semana e cada sexo existem μ(x) e σ(x) em expressão
// fechada, e o escore é a distância normal padrão usual. Como a expressão é contínua
// em `x`, a idade pós-menstrual entra em semanas exatas fracionárias sem que nada
// seja interpolado — a tensão entre granularidade e fidelidade, que existe do lado
// da OMS (D-06), simplesmente não existe aqui.
//
// PROCEDÊNCIA DOS COEFICIENTES (ficha `MD-0002`). Foram lidos da implementação de
// referência `gigs` (rOpenSci), que os documenta como transcrição do artigo. O texto
// integral do Lancet ficou inacessível deste ambiente (HTTP 403), e a conferência
// tipográfica que a ficha exigia foi substituída por uma **de consequência**, mais
// forte: as seis tabelas oficiais de z-score do próprio projeto foram extraídas e
// comparadas às expressões célula a célula — 1596 células, nenhuma fora da tolerância
// de arredondamento, pior desvio 0,005. A prova está congelada em T008 e corre em
// `tests/unit/dominio-puericultura/intergrowth.test.ts`.
import { ErroDeInvariante, type Sexo } from "../tipos";

/**
 * As três medidas que a fonte publica para o pré-termo. Não há IMC: a ausência é
 * propriedade da fonte, e o motor a devolve como índice ausente, jamais como erro
 * (RN-17).
 */
export type MedidaPreTermo = "peso" | "comprimento" | "perimetro-cefalico";

/** Escala em que cada medida é modelada: log para as duas de crescimento, natural para o PC. */
export type EscalaDaCurva = "logaritmica" | "natural";

interface Curva {
  readonly escala: EscalaDaCurva;
  readonly unidade: string;
  mu(x: number, masculino: number): number;
  sigma(x: number): number;
}

const CURVAS: Readonly<Record<MedidaPreTermo, Curva>> = Object.freeze({
  peso: Object.freeze({
    escala: "logaritmica" as const,
    unidade: "kg",
    mu: (x: number, masculino: number) =>
      2.591277 -
      0.01155 * Math.pow(x, 0.5) -
      2201.705 * x ** -2 +
      0.0911639 * masculino,
    sigma: (x: number) =>
      0.1470258 + 505.92394 * x ** -2 - 140.0576 * x ** -2 * Math.log(x),
  }),
  comprimento: Object.freeze({
    escala: "logaritmica" as const,
    unidade: "cm",
    mu: (x: number, masculino: number) =>
      4.136244 - 547.0018 * x ** -2 + 0.0026066 * x + 0.0314961 * masculino,
    sigma: (x: number) =>
      0.050489 + 310.44761 * x ** -2 - 90.0742 * x ** -2 * Math.log(x),
  }),
  "perimetro-cefalico": Object.freeze({
    escala: "natural" as const,
    unidade: "cm",
    mu: (x: number, masculino: number) =>
      55.53617 - 852.0059 * x ** -1 + 0.7957903 * masculino,
    sigma: (x: number) => 3.0582292 + 3910.05 * x ** -2 - 180.5625 * x ** -1,
  }),
});

function curvaDe(medida: MedidaPreTermo, semanasPosMenstruais: number): Curva {
  if (!Number.isFinite(semanasPosMenstruais) || semanasPosMenstruais <= 0) {
    throw new ErroDeInvariante(
      `Idade pós-menstrual deve ser positiva; veio ${semanasPosMenstruais}`,
    );
  }
  return CURVAS[medida];
}

export function escalaDe(medida: MedidaPreTermo): EscalaDaCurva {
  return CURVAS[medida].escala;
}

/** μ na semana pós-menstrual `x` — em ln(medida) nas curvas logarítmicas. */
export function mu(
  medida: MedidaPreTermo,
  sexo: Sexo,
  semanasPosMenstruais: number,
): number {
  const curva = curvaDe(medida, semanasPosMenstruais);
  return curva.mu(semanasPosMenstruais, sexo === "masculino" ? 1 : 0);
}

/** σ na semana pós-menstrual `x`; não depende do sexo em nenhuma das três curvas. */
export function sigma(
  medida: MedidaPreTermo,
  semanasPosMenstruais: number,
): number {
  return curvaDe(medida, semanasPosMenstruais).sigma(semanasPosMenstruais);
}

/** A mediana na escala da medida — μ para o PC, e exp(μ) para peso e comprimento. */
export function medianaDe(
  medida: MedidaPreTermo,
  sexo: Sexo,
  semanasPosMenstruais: number,
): number {
  return medidaNoDesvio(medida, sexo, semanasPosMenstruais, 0);
}

/**
 * A inversa: a medida que corresponde ao escore `z` naquela semana. É contra ela que
 * as tabelas publicadas de z-score são conferidas (T004, T012).
 */
export function medidaNoDesvio(
  medida: MedidaPreTermo,
  sexo: Sexo,
  semanasPosMenstruais: number,
  z: number,
): number {
  const centro = mu(medida, sexo, semanasPosMenstruais);
  const desvio = sigma(medida, semanasPosMenstruais);
  const valor = centro + z * desvio;
  return escalaDe(medida) === "logaritmica" ? Math.exp(valor) : valor;
}
