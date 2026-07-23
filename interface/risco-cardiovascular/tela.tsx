"use client";
// Tela da calculadora de risco cardiovascular (feature 014: RF-01/RF-08):
// composição da moldura comum da plataforma (D-09) com o AppRiscoCardiovascular.
import { Moldura } from "interface/comum/moldura";
import { AppRiscoCardiovascular } from "./app";

export function TelaRiscoCardiovascular() {
  return (
    <Moldura
      titulo="Risco Cardiovascular em 10 anos (Pooled Cohort Equations)"
      subtitulo="APS Inteligente · Fonte única: 2013 ACC/AHA Guideline — Pooled Cohort Equations (Goff et al., 2014)"
    >
      <AppRiscoCardiovascular />
    </Moldura>
  );
}
