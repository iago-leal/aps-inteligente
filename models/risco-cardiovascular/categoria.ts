// Classificação do risco estimado em categorias (RF-07; investigation §7): cortes
// do 2019 ACC/AHA Primary Prevention Guideline — baixo < 5%, limítrofe 5 a < 7,5%,
// intermediário 7,5 a < 20%, alto ≥ 20%. Função pura. Feature 014-risco-cardiovascular-pce.
import { CATEGORIAS } from "./fonte-clinica";
import type { CategoriaRisco } from "./tipos";

export function categoriaDe(riscoPct: number): CategoriaRisco {
  if (riscoPct < CATEGORIAS.limitrofe) return "baixo";
  if (riscoPct < CATEGORIAS.intermediario) return "limitrofe";
  if (riscoPct < CATEGORIAS.alto) return "intermediario";
  return "alto";
}
