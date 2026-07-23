// Validação de entrada com coleta de TODOS os ofensores (RN-05; RF-03) —
// padrão da regra 15 do domain.md: nunca parar no primeiro. Data inválida é
// valor (DATA_INVALIDA), nunca exceção (ADR 0004). O motor revalida tudo,
// sem confiar na UI. Feature 007-idade-gestacional-e-home.
import { CONSTANTES } from "./fonte-clinica";
import { paraDiasEpoch } from "./datas";
import type { CodigoOfensor, EntradaDatacao, Ofensor } from "./tipos";

const { plausibilidade, diasPorSemana } = CONSTANTES;

function ofensor(
  campo: string,
  codigo: CodigoOfensor,
  mensagem: string,
): Ofensor {
  return { campo, codigo, mensagem };
}

function igLaudoPlausivel(semanas: number, dias: number): boolean {
  return (
    Number.isInteger(semanas) &&
    semanas >= plausibilidade.igLaudoSemanas.min &&
    semanas <= plausibilidade.igLaudoSemanas.max &&
    Number.isInteger(dias) &&
    dias >= plausibilidade.igLaudoDias.min &&
    dias <= plausibilidade.igLaudoDias.max
  );
}

export function validarEntrada(entrada: EntradaDatacao): Ofensor[] {
  const ofensores: Ofensor[] = [];

  const refDias = paraDiasEpoch(entrada.dataReferencia);
  if (refDias === null) {
    ofensores.push(
      ofensor(
        "dataReferencia",
        "DATA_INVALIDA",
        "Data de referência inválida: use o formato AAAA-MM-DD com data de calendário real.",
      ),
    );
  }

  if (entrada.dum !== undefined) {
    const dumDias = paraDiasEpoch(entrada.dum);
    if (dumDias === null) {
      ofensores.push(
        ofensor(
          "dum",
          "DATA_INVALIDA",
          "DUM inválida: use o formato AAAA-MM-DD com data de calendário real.",
        ),
      );
    } else if (refDias !== null) {
      if (dumDias > refDias) {
        ofensores.push(
          ofensor(
            "dum",
            "DUM_FUTURA",
            "DUM no futuro: a data da última menstruação deve ser até a data de referência.",
          ),
        );
      } else if (
        refDias - dumDias >
        plausibilidade.dumRetroativaMaxSemanas * diasPorSemana
      ) {
        ofensores.push(
          ofensor(
            "dum",
            "DUM_ALEM_DE_44_SEMANAS",
            `DUM além do plausível para gestação em curso: mais de ${plausibilidade.dumRetroativaMaxSemanas} semanas antes da data de referência.`,
          ),
        );
      }
    }
  }

  const usg = entrada.ultrassom;
  if (usg !== undefined) {
    const completo =
      usg.dataExame !== undefined &&
      usg.semanas !== undefined &&
      usg.dias !== undefined;
    if (!completo) {
      ofensores.push(
        ofensor(
          "ultrassom",
          "DATACAO_ULTRASSOM_INCOMPLETA",
          "Datação por ultrassom incompleta: informe a data do exame e a IG do laudo (semanas e dias).",
        ),
      );
    }

    if (usg.dataExame !== undefined) {
      const exameDias = paraDiasEpoch(usg.dataExame);
      if (exameDias === null) {
        ofensores.push(
          ofensor(
            "ultrassom.dataExame",
            "DATA_INVALIDA",
            "Data do exame inválida: use o formato AAAA-MM-DD com data de calendário real.",
          ),
        );
      } else if (refDias !== null && exameDias > refDias) {
        ofensores.push(
          ofensor(
            "ultrassom.dataExame",
            "DATA_EXAME_FUTURA",
            "Data do exame no futuro: informe um exame já realizado, até a data de referência.",
          ),
        );
      }
    }

    if (usg.semanas !== undefined || usg.dias !== undefined) {
      if (!igLaudoPlausivel(usg.semanas ?? 0, usg.dias ?? 0)) {
        ofensores.push(
          ofensor(
            "ultrassom.ig",
            "IG_LAUDO_FORA_DE_FAIXA",
            `IG do laudo fora da faixa plausível: informe entre ${plausibilidade.igLaudoSemanas.min} e ${plausibilidade.igLaudoSemanas.max} semanas e entre ${plausibilidade.igLaudoDias.min} e ${plausibilidade.igLaudoDias.max} dias.`,
          ),
        );
      }
    }
  }

  if (entrada.dum === undefined && usg === undefined) {
    ofensores.push(
      ofensor(
        "datacao",
        "NENHUMA_DATACAO_INFORMADA",
        "Nenhuma datação informada: informe a DUM ou o ultrassom (data do exame e IG do laudo).",
      ),
    );
  }

  return ofensores;
}
