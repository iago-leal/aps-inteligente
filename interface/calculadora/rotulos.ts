// Rótulos de apresentação compartilhados entre a renderização do painel de
// resultado e o formatador do plano copiável (feature 006, RF-02): fonte única
// de texto para que tela e prontuário digam sempre a mesma coisa (RN-03).
import type { MomentoAplicacao } from "models/insulina/tipos";

export const ROTULO_MOMENTO: Record<MomentoAplicacao, string> = {
  antes_cafe: "antes do café",
  antes_almoco: "antes do almoço",
  antes_jantar: "antes do jantar",
  ao_deitar: "ao deitar",
};

export function textoDoDelta(deltaUi: number): string {
  if (deltaUi > 0) return `Aumentar ${deltaUi} UI`;
  if (deltaUi < 0) return `Reduzir ${Math.abs(deltaUi)} UI`;
  return "Manter a dose";
}
