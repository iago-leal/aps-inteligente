// Validação de entrada com coleta de TODOS os ofensores (RF-05; RN-03; EC-01..08/10).
// Defesa em profundidade: o motor revalida tudo, sem confiar na UI (EC-08).
import { CONSTANTES } from "./fonte-clinica";
import type { CodigoErro, EntradaCalculo, Ofensor } from "./tipos";

const { plausibilidade } = CONSTANTES;

function ofensor(campo: string, codigo: CodigoErro, mensagem: string): Ofensor {
  return { campo, codigo, mensagem };
}

function esquemaTemRegular(entrada: EntradaCalculo): boolean {
  return (entrada.esquemaAtual?.aplicacoes ?? []).some(
    (a) => a.insulina === "Regular",
  );
}

function temPrePrandiais(entrada: EntradaCalculo): boolean {
  return entrada.glicemias.some((g) => g.momento !== "jejum");
}

export function validarEntrada(entrada: EntradaCalculo): Ofensor[] {
  const ofensores: Ofensor[] = [];

  const peso = entrada.pesoKg;
  if (
    typeof peso !== "number" ||
    !Number.isFinite(peso) ||
    peso <= 0 ||
    peso > plausibilidade.pesoKg.max
  ) {
    ofensores.push(
      ofensor(
        "pesoKg",
        "PESO_FORA_DE_FAIXA",
        `Peso fora da faixa plausível: informe um valor maior que 0 e até ${plausibilidade.pesoKg.max} kg.`,
      ),
    );
  }

  entrada.glicemias.forEach((glicemia, indice) => {
    const valor = glicemia?.valorMgDl;
    if (
      typeof valor !== "number" ||
      !Number.isFinite(valor) ||
      valor < plausibilidade.glicemiaMgDl.min ||
      valor > plausibilidade.glicemiaMgDl.max
    ) {
      ofensores.push(
        ofensor(
          `glicemias[${indice}]`,
          "GLICEMIA_FORA_DE_FAIXA",
          `Glicemia fora da faixa plausível: informe um valor entre ${plausibilidade.glicemiaMgDl.min} e ${plausibilidade.glicemiaMgDl.max} mg/dL.`,
        ),
      );
    }
  });

  if (entrada.hba1cPercent !== undefined) {
    const hba1c = entrada.hba1cPercent;
    if (
      typeof hba1c !== "number" ||
      !Number.isFinite(hba1c) ||
      hba1c < plausibilidade.hba1cPercent.min ||
      hba1c > plausibilidade.hba1cPercent.max
    ) {
      ofensores.push(
        ofensor(
          "hba1cPercent",
          "HBA1C_FORA_DE_FAIXA",
          `HbA1c fora da faixa plausível: informe um valor entre ${plausibilidade.hba1cPercent.min}% e ${plausibilidade.hba1cPercent.max}%.`,
        ),
      );
    }
  }

  if (entrada.modo === "titulacao") {
    const aplicacoes = entrada.esquemaAtual?.aplicacoes ?? [];
    if (!entrada.esquemaAtual || aplicacoes.length === 0) {
      ofensores.push(
        ofensor(
          "esquemaAtual",
          "ESQUEMA_OBRIGATORIO",
          "Informe o esquema de insulina atual para calcular a titulação.",
        ),
      );
    } else {
      aplicacoes.forEach((aplicacao, indice) => {
        const dose = aplicacao?.doseUi;
        if (
          typeof dose !== "number" ||
          !Number.isInteger(dose) ||
          dose < CONSTANTES.dosePorAplicacaoUi.min ||
          dose > CONSTANTES.dosePorAplicacaoUi.max
        ) {
          ofensores.push(
            ofensor(
              `esquemaAtual.aplicacoes[${indice}].doseUi`,
              "DOSE_FORA_DE_FAIXA",
              `Dose por aplicação deve ser inteira, entre ${CONSTANTES.dosePorAplicacaoUi.min} e ${CONSTANTES.dosePorAplicacaoUi.max} UI (limite da caneta).`,
            ),
          );
        }
      });
    }

    if (entrada.glicemias.length === 0) {
      ofensores.push(
        ofensor(
          "glicemias",
          "GLICEMIAS_AUSENTES",
          "Informe ao menos uma glicemia capilar para calcular a titulação.",
        ),
      );
    }

    // EC-10: o gate de intensificação a partir do esquema basal exige HbA1c (R-13).
    if (
      temPrePrandiais(entrada) &&
      !esquemaTemRegular(entrada) &&
      entrada.hba1cPercent === undefined
    ) {
      ofensores.push(
        ofensor(
          "hba1cPercent",
          "HBA1C_OBRIGATORIA",
          "Glicemias pré-prandiais dirigem a intensificação, que depende da HbA1c (> 7,0% após 3 meses): informe a HbA1c.",
        ),
      );
    }
  }

  return ofensores;
}

/** Cenários que a fonte não cobre (RF-07; NG-06): detectados após a validação. */
export function motivoForaDoEscopo(entrada: EntradaCalculo): string | null {
  for (const aplicacao of entrada.esquemaAtual?.aplicacoes ?? []) {
    if (aplicacao.insulina !== "NPH" && aplicacao.insulina !== "Regular") {
      return `O Guia Rápido DM (SMS-Rio, 2023) não titula a insulina "${String(aplicacao.insulina)}" no DM2: o catálogo coberto é NPH e Regular (p. 59).`;
    }
  }
  return null;
}
