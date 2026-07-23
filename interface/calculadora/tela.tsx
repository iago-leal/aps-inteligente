"use client";
// Tela da calculadora de insulina: composição da moldura comum da plataforma
// (extraída nesta feature 007, D-09 — comportamento byte a byte) com o
// CalculadoraApp. Nenhuma regra clínica nem estado de cálculo vive aqui.
import { Moldura } from "interface/comum/moldura";
import { CalculadoraApp } from "./calculadora-app";

export function TelaCalculadora() {
  return (
    <Moldura
      titulo="Calculadora de Insulina — DM2"
      subtitulo="APS Inteligente · Fonte única: Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023"
    >
      <CalculadoraApp />
    </Moldura>
  );
}
