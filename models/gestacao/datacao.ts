// Regras puras de datação gestacional (RN-01..RN-04; RF-01/RF-02).
// Fonte: Guia Rápido Pré-Natal — SMS-Rio, 4.ª ed., 2025, pp. 31–32 (fonte-clinica.ts).
// Pré-condição: datas já validadas pela validação (validacao.ts); violação aqui é bug.
import { CONSTANTES } from "./fonte-clinica";
import { paraDiasEpoch, somarDias, somarMeses } from "./datas";
import {
  ErroDeInvariante,
  type DataIso,
  type IdadeGestacional,
  type Trimestre,
} from "./tipos";

/** RN-01 (p. 31): dias decorridos da DUM até a referência ÷ 7, em semanas e dias. */
export function igEntre(dum: DataIso, dataReferencia: DataIso): IdadeGestacional {
  const inicio = paraDiasEpoch(dum);
  const fim = paraDiasEpoch(dataReferencia);
  if (inicio === null || fim === null || fim < inicio) {
    throw new ErroDeInvariante(
      `Intervalo de datação impossível: ${dum} → ${dataReferencia}`,
    );
  }
  const dias = fim - inicio;
  return {
    semanas: Math.floor(dias / CONSTANTES.diasPorSemana),
    dias: dias % CONSTANTES.diasPorSemana,
  };
}

/** RN-02 (p. 32): regra de Naegele calendárica — +7 dias, depois +9 meses (D-03). */
export function dppPorNaegele(dum: DataIso): DataIso {
  return somarMeses(
    somarDias(dum, CONSTANTES.naegele.somarDias),
    CONSTANTES.naegele.somarMeses,
  );
}

/** RN-03: DUM equivalente do ultrassom — `dataExame − (semanas×7 + dias)`. */
export function dumEquivalente(
  dataExame: DataIso,
  semanas: number,
  dias: number,
): DataIso {
  return somarDias(dataExame, -(semanas * CONSTANTES.diasPorSemana + dias));
}

/** RN-04 (premissa 🟡): cortes convencionais 13+6 / 27+6. */
export function trimestreDaIg(ig: IdadeGestacional): Trimestre {
  const total = ig.semanas * CONSTANTES.diasPorSemana + ig.dias;
  if (total < CONSTANTES.trimestre.inicioSegundoDias) return 1;
  if (total < CONSTANTES.trimestre.inicioTerceiroDias) return 2;
  return 3;
}
