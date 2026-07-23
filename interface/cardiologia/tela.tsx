"use client";
// Tela da calculadora de dor torácica / probabilidade pré-teste (feature 010:
// RF-01/RF-08): composição da moldura comum da plataforma (D-09) com o
// AppCardiologia.
import { Moldura } from "interface/comum/moldura";
import { AppCardiologia } from "./app";

export function TelaCardiologia() {
  return (
    <Moldura
      titulo="Probabilidade Pré-teste de Cardiopatia Isquêmica"
      subtitulo="APS Inteligente · Fonte única: TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017)"
    >
      <AppCardiologia />
    </Moldura>
  );
}
