"use client";
// Tela do rastreamento de depressão na pessoa idosa (feature 023: RF-08): composição da
// moldura comum da plataforma com o AppDepressaoGeriatrica.
import { Moldura } from "interface/comum/moldura";
import { NOME_PUBLICADO } from "models/depressao-geriatrica/fonte-clinica";
import { AppDepressaoGeriatrica } from "./app";

// Concatenação, e não template: o extrator do inventário não enxerga literal dentro de
// template interpolado, e a prosa do subtítulo continua sob a norma (MD-0021).
// O nome publicado já termina em parêntese, e um segundo par logo depois emparedaria a
// linha: o publicador entra por aposto, e não por parêntese.
const SUBTITULO =
  "APS Inteligente · Fonte única: " +
  NOME_PUBLICADO +
  ", Linhas de Cuidado, Ministério da Saúde";

export function TelaDepressaoGeriatrica() {
  return (
    <Moldura
      titulo="Rastreamento de depressão na pessoa idosa"
      subtitulo={SUBTITULO}
      comInicio
    >
      <AppDepressaoGeriatrica />
    </Moldura>
  );
}
