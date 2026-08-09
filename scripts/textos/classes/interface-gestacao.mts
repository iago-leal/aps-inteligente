// Classe declarada dos literais de `interface/gestacao/**` (T012).
//
// Autoral por inteiro. O nome publicado da fonte do domínio chega à tela pelo próprio
// domínio e permanece `identificador` ao chegar (`MD-0021`), de modo que não se declara
// aqui.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, glifos } from "./declarar.mts";

export const MAPA: MapaDeClasses = {
  // ─── interface/gestacao ─────────────────────────────────────────────────────────

  "interface/gestacao/formulario.tsx": [
    ...autorais([
      "Datação pela menstruação",
      "Data da última menstruação (DUM)",
      "Datação pelo último ultrassom",
      "Data do exame",
      "Semanas no exame",
      "Dias no exame",
      "Calcular",
    ]),
  ],

  "interface/gestacao/resultado.tsx": [
    ...glifos(["—"]),

    ...autorais([
      "Idade gestacional:",
      ".º trimestre",
      "Data provável do parto:",
      "DUM equivalente:",
      "Resultado",
      "Informe a DUM, o último ultrassom, ou ambos, e calcule.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça o cálculo.",
      "Novo cálculo",
      "Entrada incompleta ou implausível",
      "Resultado desatualizado: os dados foram editados após o cálculo. Calcule novamente.",
      "Idade gestacional",
      "Calculada na data de referência",
      ".",
      "Pela DUM",
      "Pelo ultrassom",
      "Fonte clínica",
      ",",
      "·",
    ]),
  ],

  "interface/gestacao/tela.tsx": [
    ...autorais([
      "Calculadora de idade gestacional",
      "APS Inteligente · Fonte única:",
      ", 4.ª ed., 2025",
    ]),
  ],
};
