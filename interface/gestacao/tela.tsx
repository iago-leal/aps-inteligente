"use client";
// Tela da calculadora de idade gestacional (feature 007: RF-02/RF-06): composição
// da moldura comum da plataforma (D-09) com o AppIdadeGestacional.
import { Moldura } from "interface/comum/moldura";
import { NOME_PUBLICADO } from "models/gestacao/fonte-clinica";
import { AppIdadeGestacional } from "./app";

// Concatenação, e não template: o extrator do inventário não enxerga literal dentro de
// template interpolado, e a prosa do subtítulo continua sob a norma (MD-0021).
const SUBTITULO =
  "APS Inteligente · Fonte única: " + NOME_PUBLICADO + ", 4.ª ed., 2025";

export function TelaIdadeGestacional() {
  return (
    <Moldura
      titulo="Calculadora de idade gestacional"
      subtitulo={SUBTITULO}
      comInicio
    >
      <AppIdadeGestacional />
    </Moldura>
  );
}
