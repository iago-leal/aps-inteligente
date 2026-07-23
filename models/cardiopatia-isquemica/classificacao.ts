// Classificação clínica da dor torácica (RN-01; Quadro 1, p. 4). Três
// características: retroesternal, provocada por esforço/estresse, aliviada por
// repouso ou nitrato. 3 → angina típica; 2 → angina atípica; 0–1 → não anginosa.
// Função pura. Feature 010-dor-toracica-pre-teste.
import type { CaracteristicasDor, ClassificacaoDor } from "./tipos";

export function contarCaracteristicas(c: CaracteristicasDor): number {
  return (
    (c.retroesternal ? 1 : 0) +
    (c.provocadaPorEsforcoOuEstresse ? 1 : 0) +
    (c.aliviaComRepousoOuNitrato ? 1 : 0)
  );
}

export function classificarDor(c: CaracteristicasDor): ClassificacaoDor {
  const total = contarCaracteristicas(c);
  if (total === 3) return "tipica";
  if (total === 2) return "atipica";
  return "nao-anginosa";
}
