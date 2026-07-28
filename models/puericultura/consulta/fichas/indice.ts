// Índice das fichas de consulta (feature 020: RF-03, RN-02; D-02, D-07).
//
// Arquivo criado em T007 com a lista vazia, para que o oráculo de transcrição existisse
// ANTES da primeira ficha, e fechado em T027 com as dez e as suas faixas de idade. A ordem
// não é capricho: transcrever trezentos e cinquenta rótulos e conferir depois transformaria
// a conferência numa auditoria única no fim, que é o modo mais caro e menos confiável de
// encontrar um erro de digitação (`MD-0010`).
//
// AS FAIXAS, E DE ONDE VÊM OS NÚMEROS. A caderneta nomeia as consultas por mês, e a seleção
// precisa de dias — a mesma conversão que `MD-0006` fez para as fronteiras da feature 017. O
// mês é o médio do calendário, 365,25/12 = 30,4375 dias, arredondado: 1 mês são 30 dias, 2
// meses 61, 4 meses 122, 6 meses 183, 9 meses 274, 12 meses 365, 18 meses 548, 24 meses 730
// e 36 meses 1096. As faixas são CONTÍGUAS por construção, e cada uma vai do seu marco à
// véspera do seguinte: idade entre duas consultas previstas cai na anterior (RN-04, premissa
// 🟡 do roadmap §4). A dos 24 meses coincide com `FRONTEIRAS.doisAnosEmDias` da 017, e a
// coincidência é da fonte, não do arredondamento.
import { DECIMO_OITAVO_MES } from "./decimo-oitavo-mes.ts";
import { DECIMO_SEGUNDO_MES } from "./decimo-segundo-mes.ts";
import { NONO_MES } from "./nono-mes.ts";
import { PRIMEIRA_SEMANA } from "./primeira-semana.ts";
import { PRIMEIRO_MES } from "./primeiro-mes.ts";
import { QUARTO_MES } from "./quarto-mes.ts";
import { SEGUNDO_MES } from "./segundo-mes.ts";
import { SEXTO_MES } from "./sexto-mes.ts";
import { TRIGESIMO_SEXTO_MES } from "./trigesimo-sexto-mes.ts";
import { VIGESIMO_QUARTO_MES } from "./vigesimo-quarto-mes.ts";
import type { Ficha } from "../tipos";

/** As dez consultas datadas, na ordem da fonte (RN-02). */
export const FICHAS: readonly Ficha[] = Object.freeze([
  PRIMEIRA_SEMANA,
  PRIMEIRO_MES,
  SEGUNDO_MES,
  QUARTO_MES,
  SEXTO_MES,
  NONO_MES,
  DECIMO_SEGUNDO_MES,
  DECIMO_OITAVO_MES,
  VIGESIMO_QUARTO_MES,
  TRIGESIMO_SEXTO_MES,
]);
