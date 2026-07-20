// Validação de campos do formulário espelhada nas faixas únicas do motor
// (RF-05 do requirements; RN da validação espelhada). Extraído de formulario.tsx
// na feature 001-integrar-design-claude (D-07: reduzir o arquivo a ≤ 400 linhas).
// Nenhuma regra clínica vive aqui: apenas plausibilidade de digitação.
import { CONSTANTES } from "models/insulina/fonte-clinica";

const FAIXAS = CONSTANTES.plausibilidade;

/** "82,5" e "82.5" produzem o mesmo número (RF-05; EC-01 da UI). */
export function interpretaDecimal(bruto: string): number | null {
  const normalizado = bruto.trim().replace(",", ".");
  if (normalizado === "") return null;
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) return Number.NaN;
  return Number(normalizado);
}

export function erroDoPeso(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  if (valor === null) return "Informe o peso do paciente.";
  if (Number.isNaN(valor))
    return "Peso inválido: use apenas números (vírgula ou ponto).";
  if (valor <= 0 || valor > FAIXAS.pesoKg.max) {
    return `Peso fora da faixa plausível: maior que 0 e até ${FAIXAS.pesoKg.max} kg.`;
  }
  return null;
}

export function erroDaHba1c(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  if (valor === null) return null;
  if (Number.isNaN(valor)) return "HbA1c inválida: use apenas números.";
  if (valor < FAIXAS.hba1cPercent.min || valor > FAIXAS.hba1cPercent.max) {
    return `HbA1c fora da faixa plausível: entre ${FAIXAS.hba1cPercent.min}% e ${FAIXAS.hba1cPercent.max}%.`;
  }
  return null;
}

export function erroDaDose(bruto: string): string | null {
  const valor = interpretaDecimal(bruto);
  const { min, max } = CONSTANTES.dosePorAplicacaoUi;
  if (valor === null) return "Informe a dose da aplicação.";
  if (
    Number.isNaN(valor) ||
    !Number.isInteger(valor) ||
    valor < min ||
    valor > max
  ) {
    return `Dose inválida: inteira, entre ${min} e ${max} UI por aplicação.`;
  }
  return null;
}
