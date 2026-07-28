"use client";
// Tela da calculadora de risco cardiovascular (feature 014: RF-01/RF-08):
// composição da moldura comum da plataforma (D-09) com o AppRiscoCardiovascular.
import { Moldura } from "interface/comum/moldura";
import { NOME_PUBLICADO } from "models/risco-cardiovascular/fonte-clinica";
import { AppRiscoCardiovascular } from "./app";

// Concatenação, e não template: o extrator do inventário não enxerga literal dentro de
// template interpolado, e a prosa do subtítulo continua sob a norma (MD-0021).
const SUBTITULO =
  "APS Inteligente · Fonte única: " + NOME_PUBLICADO + " (Goff et al., 2014)";

export function TelaRiscoCardiovascular() {
  return (
    <Moldura
      titulo="Risco cardiovascular em 10 anos (Pooled Cohort Equations)"
      subtitulo={SUBTITULO}
      comInicio
    >
      <AppRiscoCardiovascular />
    </Moldura>
  );
}
