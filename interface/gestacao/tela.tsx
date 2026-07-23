"use client";
// Tela da calculadora de idade gestacional (feature 007: RF-02/RF-06): composição
// da moldura comum da plataforma (D-09) com o AppIdadeGestacional.
import { Moldura } from "interface/comum/moldura";
import { AppIdadeGestacional } from "./app";

export function TelaIdadeGestacional() {
  return (
    <Moldura
      titulo="Calculadora de Idade Gestacional"
      subtitulo="APS Inteligente · Fonte única: Guia Rápido Pré-Natal — SMS-Rio, 4.ª ed., 2025"
    >
      <AppIdadeGestacional />
    </Moldura>
  );
}
