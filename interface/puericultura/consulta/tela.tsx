"use client";
// Tela da ficha de consulta de puericultura (feature 020: RF-01): composição da moldura
// comum da plataforma com o AppConsulta, no molde de `interface/puericultura/tela.tsx`.
import { Moldura } from "interface/comum/moldura";
import { NOME_PUBLICADO } from "models/puericultura/fonte-clinica";
import { AppConsulta } from "./app";

// Concatenação, e não template: o extrator do inventário não enxerga literal dentro de
// template interpolado, e a prosa do subtítulo continua sob a norma (`MD-0021`).
const SUBTITULO =
  "APS Inteligente · Fonte única: " +
  NOME_PUBLICADO +
  " (Ministério da Saúde, 2.ª ed., 2020), pp. 66–75";

export function TelaConsulta() {
  return (
    <Moldura
      titulo="Ficha de consulta de puericultura"
      subtitulo={SUBTITULO}
      comInicio
    >
      <AppConsulta />
    </Moldura>
  );
}
