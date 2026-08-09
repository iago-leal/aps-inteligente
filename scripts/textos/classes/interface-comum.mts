// Classe declarada dos literais de `interface/comum/**` (T012).
//
// A moldura é o que toda tela veste: identidade, selo de privacidade e comandos de
// navegação. Autoral por inteiro, e é a prosa mais exposta do produto, porque aparece em
// todas as rotas ao mesmo tempo.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais } from "./declarar.mts";

export const MAPA: MapaDeClasses = {
  // ─── interface/comum ────────────────────────────────────────────────────────────

  // Nomes acessíveis fixados por decisão (RN-07, `domain.md` §7.2 regra 12).
  "interface/comum/moldura.tsx": [
    ...autorais([
      "Nada é salvo nem enviado",
      "Início",
      "Ativar tema claro",
      "Ativar tema escuro",
    ]),
  ],
};
