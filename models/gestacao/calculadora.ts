// Fachada CalculadoraIdadeGestacional — API pública única da unit (RF-01/RF-02/RF-09;
// RN-06/RN-07/RN-11; D-04/D-05): validação → datação por método presente → comparação
// DUM×USG com veredito informativo (o motor não escolhe a datação — ADR 0005) →
// notas e referências. Pura e determinística; erro esperado é valor (ADR 0004).
import { CONSTANTES, REFERENCIAS, TEXTO_NOTAS } from "./fonte-clinica";
import {
  dppPorNaegele,
  dumEquivalente,
  igEntre,
  trimestreDaIg,
} from "./datacao";
import { paraDiasEpoch } from "./datas";
import { validarEntrada } from "./validacao";
import {
  ErroDeInvariante,
  type ComparacaoDatacoes,
  type DatacaoCalculada,
  type DatacaoPorUltrassom,
  type EntradaDatacao,
  type NotaAoPrescritor,
  type ReferenciaClinica,
  type SaidaDatacao,
  type Trimestre,
} from "./tipos";

function semDuplicatas(
  referencias: readonly ReferenciaClinica[],
): ReferenciaClinica[] {
  const vistas = new Set<string>();
  return referencias.filter((r) => {
    if (vistas.has(r.localizacao)) return false;
    vistas.add(r.localizacao);
    return true;
  });
}

function margemPorTrimestre(trimestre: Trimestre): number | undefined {
  if (trimestre === 1) return CONSTANTES.margemUsgDias.primeiroTrimestre;
  if (trimestre === 2) return CONSTANTES.margemUsgDias.segundoTrimestre;
  return undefined; // D-05: o guia não parametriza o 3.º trimestre.
}

export class CalculadoraIdadeGestacional {
  calcular(entrada: EntradaDatacao): SaidaDatacao {
    const ofensores = validarEntrada(entrada);
    if (ofensores.length > 0) {
      return { tipo: "erro-validacao", ofensores };
    }

    const referencias: ReferenciaClinica[] = [];
    const notas: NotaAoPrescritor[] = [];

    let porDum: DatacaoCalculada | undefined;
    if (entrada.dum !== undefined) {
      const ig = igEntre(entrada.dum, entrada.dataReferencia);
      porDum = {
        ig,
        dpp: dppPorNaegele(entrada.dum),
        trimestre: trimestreDaIg(ig),
        referencia: REFERENCIAS.datacaoPelaDum,
      };
      referencias.push(REFERENCIAS.datacaoPelaDum, REFERENCIAS.regraDeNaegele);
      notas.push({
        tipo: "CONFIABILIDADE_DUM",
        mensagem: TEXTO_NOTAS.confiabilidadeDum,
        referencia: REFERENCIAS.confiabilidadeDum,
      });
    }

    let porUltrassom: DatacaoPorUltrassom | undefined;
    let igNoExameDias: number | undefined;
    if (entrada.ultrassom !== undefined) {
      // Completude garantida pela validação; ausência aqui é bug interno.
      const { dataExame, semanas, dias } = entrada.ultrassom;
      if (dataExame === undefined || semanas === undefined || dias === undefined) {
        throw new ErroDeInvariante(
          "Ultrassom incompleto atravessou a validação",
        );
      }
      const dumEq = dumEquivalente(dataExame, semanas, dias);
      const ig = igEntre(dumEq, entrada.dataReferencia);
      igNoExameDias = semanas * CONSTANTES.diasPorSemana + dias;
      porUltrassom = {
        ig,
        dpp: dppPorNaegele(dumEq),
        trimestre: trimestreDaIg(ig),
        dumEquivalente: dumEq,
        referencia: REFERENCIAS.indicacoesUsg,
      };
      referencias.push(REFERENCIAS.indicacoesUsg, REFERENCIAS.regraDeNaegele);
    }

    let comparacao: ComparacaoDatacoes | undefined;
    if (porDum !== undefined && porUltrassom !== undefined) {
      comparacao = this.comparar(
        entrada.dum!,
        porUltrassom.dumEquivalente,
        igNoExameDias!,
      );
      referencias.push(REFERENCIAS.margensUsg);
    }

    notas.push({
      tipo: "ESTIMATIVA_NA_DATA_DE_REFERENCIA",
      mensagem: TEXTO_NOTAS.estimativaNaDataDeReferencia,
      referencia: REFERENCIAS.datacaoPelaDum,
    });

    const consolidadas = semDuplicatas(referencias);
    if (consolidadas.length === 0) {
      // RN-06: saída sem referência clínica não pode existir (invariante).
      throw new ErroDeInvariante("Resultado sem referência clínica");
    }

    return {
      tipo: "resultado",
      dataReferencia: entrada.dataReferencia,
      ...(porDum !== undefined ? { porDum } : {}),
      ...(porUltrassom !== undefined ? { porUltrassom } : {}),
      ...(comparacao !== undefined ? { comparacao } : {}),
      notas,
      referencias: consolidadas,
    };
  }

  /** RN-11 (p. 32): veredito informativo pela margem do trimestre da USG (D-04/D-05). */
  private comparar(
    dumInformada: string,
    dumEquivalenteUsg: string,
    igNoExameDias: number,
  ): ComparacaoDatacoes {
    const diferencaDias = Math.abs(
      paraDiasEpoch(dumInformada)! - paraDiasEpoch(dumEquivalenteUsg)!,
    );
    const trimestreDaUsg = trimestreDaIg({
      semanas: Math.floor(igNoExameDias / CONSTANTES.diasPorSemana),
      dias: igNoExameDias % CONSTANTES.diasPorSemana,
    });
    const margemDias = margemPorTrimestre(trimestreDaUsg);

    if (margemDias === undefined) {
      return {
        diferencaDias,
        trimestreDaUsg,
        veredito: "sem-parametro-na-fonte",
        mensagem:
          "Ultrassom de 3.º trimestre: a fonte não parametriza margem de erro para arbitrar entre as datações — a avaliação é do julgamento clínico.",
        referencia: REFERENCIAS.margensUsg,
      };
    }

    if (diferencaDias > margemDias) {
      return {
        diferencaDias,
        trimestreDaUsg,
        margemDias,
        veredito: "dum-fora-da-margem",
        mensagem: `A DUM diverge da datação do exame em ${diferencaDias} dias, além da margem de ${margemDias} dias do ${trimestreDaUsg}.º trimestre: pela fonte, a DUM deve ser desconsiderada — a datação pelo ultrassom passa a ser a referência.`,
        referencia: REFERENCIAS.margensUsg,
      };
    }

    return {
      diferencaDias,
      trimestreDaUsg,
      margemDias,
      veredito: "dum-confirmada",
      mensagem: `DUM confirmada pelo exame: divergência de ${diferencaDias} dias, dentro da margem de ${margemDias} dias do ${trimestreDaUsg}.º trimestre.`,
      referencia: REFERENCIAS.margensUsg,
    };
  }
}
