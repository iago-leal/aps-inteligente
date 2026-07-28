"use client";
// Tela da calculadora de dor torácica / probabilidade pré-teste (feature 010:
// RF-01/RF-08): composição da moldura comum da plataforma (D-09) com o
// AppCardiologia.
import { Moldura } from "interface/comum/moldura";
import { NOME_PUBLICADO } from "models/cardiopatia-isquemica/fonte-clinica";
import { AppCardiologia } from "./app";

// Concatenação, e não template: o extrator do inventário não enxerga literal dentro de
// template interpolado, e a prosa do subtítulo continua sob a norma (MD-0021).
const SUBTITULO =
  "APS Inteligente · Fonte única: " +
  NOME_PUBLICADO +
  " (TelessaúdeRS-UFRGS, 2017)";

export function TelaCardiologia() {
  return (
    <Moldura
      titulo="Probabilidade pré-teste de cardiopatia isquêmica"
      subtitulo={SUBTITULO}
      comInicio
    >
      <AppCardiologia />
    </Moldura>
  );
}
