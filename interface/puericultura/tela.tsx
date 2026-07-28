"use client";
// Tela da avaliação do crescimento infantil (feature 017: RF-11): composição da
// moldura comum da plataforma com o AppCrescimento. `comInicio` é a prop dedicada do
// comando de início desde o adendo 016 — `logoComoTitulo` não existe mais.
import { Moldura } from "interface/comum/moldura";
import { NOME_PUBLICADO } from "models/puericultura/fonte-clinica";
import { AppCrescimento } from "./app";

// Concatenação, e não template: o extrator do inventário não enxerga literal dentro de
// template interpolado, e a prosa do subtítulo continua sob a norma (MD-0021).
const SUBTITULO =
  "APS Inteligente · Fonte única: " +
  NOME_PUBLICADO +
  " (Ministério da Saúde, 2.ª ed., 2020), pp. 85–97";

export function TelaCrescimento() {
  return (
    <Moldura
      titulo="Avaliação do crescimento infantil"
      subtitulo={SUBTITULO}
      comInicio
    >
      <AppCrescimento />
    </Moldura>
  );
}
