"use client";
// Tela da avaliação do crescimento infantil (feature 017: RF-11): composição da
// moldura comum da plataforma com o AppCrescimento. `comInicio` é a prop dedicada do
// comando de início desde o adendo 016 — `logoComoTitulo` não existe mais.
import { Moldura } from "interface/comum/moldura";
import { AppCrescimento } from "./app";

export function TelaCrescimento() {
  return (
    <Moldura
      titulo="Avaliação do crescimento infantil"
      subtitulo="APS Inteligente · Fonte única: Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), pp. 85–97"
      comInicio
    >
      <AppCrescimento />
    </Moldura>
  );
}
