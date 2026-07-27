// Escore z nas curvas de pré-termo (RF-18, RN-17; D-02).
// Feature 017-puericultura-crescimento.
//
// A conversão é a distância normal padrão, na escala em que cada curva foi modelada:
//
//     peso (kg):        z = (ln(peso)        − μ_wfa(x))  / σ_wfa(x)
//     comprimento (cm): z = (ln(comprimento) − μ_lfa(x))  / σ_lfa(x)
//     perímetro (cm):   z = (perímetro       − μ_hcfa(x)) / σ_hcfa(x)
//
// O IMC NÃO EXISTE nessas curvas, e essa é a regra que este módulo carrega junto do
// cálculo: RN-17 determina que, na janela do pré-termo, o índice IMC/I simplesmente
// não é calculado — sem que isso seja erro. Devolvê-lo como ausência COM MOTIVO é o
// que separa "a fonte não publica" de "faltou a medida", duas coisas que o prescritor
// precisa distinguir e que um `null` sozinho confundiria.
import { escalaDe, mu, sigma, type MedidaPreTermo } from "./equacoes";
import {
  ErroDeInvariante,
  type Indice,
  type MotivoDeAusencia,
  type Sexo,
} from "../tipos";

/** RN-17: os três índices que a fonte publica, e o que fazer com o quarto. */
export type IndiceNoPreTermo =
  | { readonly tipo: "medida"; readonly medida: MedidaPreTermo }
  | { readonly tipo: "inexistente"; readonly motivo: MotivoDeAusencia };

export function medidaDoIndiceNoPreTermo(indice: Indice): IndiceNoPreTermo {
  switch (indice) {
    case "peso-idade":
      return { tipo: "medida", medida: "peso" };
    case "comprimento-estatura-idade":
      return { tipo: "medida", medida: "comprimento" };
    case "perimetro-cefalico-idade":
      return { tipo: "medida", medida: "perimetro-cefalico" };
    case "imc-idade":
      return { tipo: "inexistente", motivo: "IMC_INEXISTENTE_NO_PRETERMO" };
  }
}

/**
 * Converte medida em escore z na semana pós-menstrual dada. A janela de validade
 * (27 a 64 semanas) NÃO é conferida aqui: quem decide se estas curvas valem é
 * `padrao.ts`, e quem recusa abaixo de 27 semanas é `elegibilidade.ts`. Repetir a
 * política em três lugares criaria três verdades a manter sincronizadas.
 */
export function escoreZPreTermo(
  medida: MedidaPreTermo,
  valor: number,
  sexo: Sexo,
  semanasPosMenstruais: number,
): number {
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new ErroDeInvariante(
      `Medida deve ser um número positivo nas curvas de pré-termo; veio ${valor}`,
    );
  }

  const observado =
    escalaDe(medida) === "logaritmica" ? Math.log(valor) : valor;
  return (
    (observado - mu(medida, sexo, semanasPosMenstruais)) /
    sigma(medida, semanasPosMenstruais)
  );
}
