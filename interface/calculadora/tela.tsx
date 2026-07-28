"use client";
// Tela da calculadora de insulina: composição da moldura comum da plataforma
// (extraída nesta feature 007, D-09 — comportamento byte a byte) com o
// CalculadoraApp. Nenhuma regra clínica nem estado de cálculo vive aqui.
import { Moldura } from "interface/comum/moldura";
import { NOME_PUBLICADO } from "models/insulina/fonte-clinica";
import { CalculadoraApp } from "./calculadora-app";

// Concatenação, e não template: o extrator do inventário não enxerga literal dentro de
// template interpolado, e a prosa do subtítulo continua sob a norma (MD-0021).
const SUBTITULO =
  "APS Inteligente · Fonte única: " +
  NOME_PUBLICADO +
  ", 2.ª ed. atualizada, 2023";

export function TelaCalculadora() {
  return (
    <Moldura
      titulo="Calculadora de insulina no DM2"
      subtitulo={SUBTITULO}
      comInicio
    >
      <CalculadoraApp />
    </Moldura>
  );
}
