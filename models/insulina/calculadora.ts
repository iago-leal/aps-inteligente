// Fachada CalculadoraInsulinaDM2 — API pública única da camada de domínio
// (RF-06..RF-08 do motor; G-01..G-04): validação → estratégia → invariantes →
// alertas ordenados → referências. Pura e determinística; erro esperado é valor.
// Feature 001-integrar-design-claude (RF-01/RF-02/RF-03): regra transversal de
// antidiabéticos orais nos dois modos e gatilho do esquema já fracionado (D-01/D-04).
import { CONSTANTES, REFERENCIAS } from "./fonte-clinica";
import { RegraInicio } from "./regra-inicio";
import { RegraIntensificacao } from "./regra-intensificacao";
import { RegraMetformina } from "./regra-metformina";
import {
  RegraTitulacaoBasal,
  type AjusteEmCurso,
} from "./regra-titulacao-basal";
import { motivoForaDoEscopo, validarEntrada } from "./validacao";
import {
  DoseUi,
  Peso,
  type Alerta,
  type EntradaCalculo,
  type Recomendacao,
  type ReferenciaClinica,
  type ResultadoInicio,
  type ResultadoTitulacao,
  type SaidaCalculo,
  type TipoAlerta,
} from "./tipos";

const SEVERIDADE: Record<TipoAlerta, number> = {
  HIPOGLICEMIA: 0,
  DOSE_ACIMA_FAIXA_PLENA: 1,
  FRACIONAR_DOSE: 2,
  TETO_POR_APLICACAO: 3,
  INDICACAO_INSULINA: 4,
  // D-08 (001-integrar-design-claude): abaixo de INDICACAO_INSULINA.
  METFORMINA_NAO_OTIMIZADA: 5,
};

// Feature 001 (precedência clínica, Notas de execução do actions.md): TFG < 30
// suspende a metformina — "manter metformina" seria contraditório na mesma saída.
function semManterMetforminaSeSuspensa(
  recomendacoes: readonly Recomendacao[],
): Recomendacao[] {
  const suspensa = recomendacoes.some(
    (r) => r.tipo === "SUSPENDER_METFORMINA_TFG",
  );
  return suspensa
    ? recomendacoes.filter((r) => r.tipo !== "MANTER_METFORMINA")
    : [...recomendacoes];
}

function semDuplicatas<
  T extends { readonly tipo?: string; readonly localizacao?: string },
>(itens: readonly T[], chave: (item: T) => string): T[] {
  const vistos = new Set<string>();
  return itens.filter((item) => {
    const k = chave(item);
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

export class CalculadoraInsulinaDM2 {
  private readonly regraInicio = new RegraInicio();
  private readonly regraTitulacaoBasal = new RegraTitulacaoBasal();
  private readonly regraIntensificacao = new RegraIntensificacao();
  private readonly regraMetformina = new RegraMetformina();

  calcular(entrada: EntradaCalculo): SaidaCalculo {
    const ofensores = validarEntrada(entrada);
    if (ofensores.length > 0) {
      return { tipo: "erro-validacao", ofensores };
    }

    const motivo = motivoForaDoEscopo(entrada);
    if (motivo !== null) {
      return {
        tipo: "fora-do-escopo",
        motivo,
        orientacao:
          "A conduta exige avaliação clínica individual do prescritor; a calculadora não sugere dose fora da fonte adotada.",
      };
    }

    const peso = new Peso(entrada.pesoKg);
    if (entrada.modo === "inicio") {
      return this.comAntidiabeticosOrais(
        this.regraInicio.calcular(entrada, peso),
        entrada,
      );
    }
    return this.calcularTitulacao(entrada, peso);
  }

  /** Feature 001 (D-01): aplica a regra transversal de antidiabéticos orais ao início. */
  private comAntidiabeticosOrais(
    resultado: ResultadoInicio,
    entrada: EntradaCalculo,
  ): ResultadoInicio {
    const orais = this.regraMetformina.avaliar(entrada);
    if (orais.alertas.length === 0 && orais.recomendacoes.length === 0) {
      return resultado;
    }
    const alertas = [...resultado.alertas, ...orais.alertas].sort(
      (a, b) => SEVERIDADE[a.tipo] - SEVERIDADE[b.tipo],
    );
    const recomendacoes = semDuplicatas(
      semManterMetforminaSeSuspensa([
        ...resultado.recomendacoesAoPrescritor,
        ...orais.recomendacoes,
      ]),
      (r) => r.tipo,
    );
    const referencias = semDuplicatas(
      [
        ...resultado.referencias,
        ...orais.alertas.map((a) => a.referencia),
        ...orais.recomendacoes.map((r) => r.referencia),
      ],
      (r) => r.localizacao,
    );
    return {
      ...resultado,
      alertas,
      recomendacoesAoPrescritor: recomendacoes,
      referencias,
    };
  }

  private calcularTitulacao(
    entrada: EntradaCalculo,
    peso: Peso,
  ): ResultadoTitulacao {
    const esquemaAtual = entrada.esquemaAtual!;
    const ajuste: AjusteEmCurso = {
      aplicacoes: [...esquemaAtual.aplicacoes],
      alertas: [],
      recomendacoes: [],
      referencias: [REFERENCIAS.tabelaTitulacao],
      condutasAlternativas: [],
      houveAjuste: false,
      naMeta: false,
    };

    this.regraTitulacaoBasal.aplicar(ajuste, entrada);
    this.regraTitulacaoBasal.fracionarSeIndicado(ajuste, entrada, peso);
    // RN-03 (D-04): esquema que já chega com NPH fracionada.
    this.regraTitulacaoBasal.suspenderSulfonilureiaSeJaFracionado(
      ajuste,
      entrada,
    );
    this.regraIntensificacao.aplicar(ajuste, entrada);

    // Feature 001 (D-01): antidiabéticos orais no pós-processamento, antes da
    // ordenação de alertas e da deduplicação.
    const orais = this.regraMetformina.avaliar(entrada);
    ajuste.alertas.push(...orais.alertas);
    ajuste.recomendacoes.push(...orais.recomendacoes);
    ajuste.referencias.push(
      ...orais.alertas.map((a) => a.referencia),
      ...orais.recomendacoes.map((r) => r.referencia),
    );

    const doseTotalDiaUi = ajuste.aplicacoes.reduce((s, a) => s + a.doseUi, 0);
    const doseTotalAnteriorUi = esquemaAtual.aplicacoes.reduce(
      (s, a) => s + a.doseUi,
      0,
    );

    // R-12 (AMB-04): acima da faixa plena não trava — alerta + compartilhamento de cuidados.
    if (doseTotalDiaUi / peso.kg > CONSTANTES.faixaPlenaUiPorKgDia.max) {
      ajuste.alertas.push({
        tipo: "DOSE_ACIMA_FAIXA_PLENA",
        mensagem: `Dose total acima de ${CONSTANTES.faixaPlenaUiPorKgDia.max} UI/kg/dia, o extremo da faixa de insulinização plena do guia (0,5–1,0 UI/kg/dia).`,
        referencia: REFERENCIAS.faixaPlena,
      });
      ajuste.recomendacoes.push({
        tipo: "COMPARTILHAR_CUIDADO_ESPECIALISTA",
        mensagem:
          "Considerar compartilhamento de cuidados com especialista focal.",
        referencia: REFERENCIAS.faixaPlena,
      });
    }

    if (ajuste.houveAjuste) {
      ajuste.recomendacoes.push({
        tipo: "REAVALIAR_EM_3_DIAS",
        mensagem:
          "Reavaliar a glicemia e ajustar novamente a cada 3 dias, até alcançar a meta.",
        referencia: REFERENCIAS.cadencia,
      });
    }

    // Invariantes de realizabilidade (R-20, D-08): violação aqui é bug, nunca fluxo esperado.
    for (const aplicacao of ajuste.aplicacoes) {
      void new DoseUi(aplicacao.doseUi);
    }

    const alertas: Alerta[] = [...ajuste.alertas].sort(
      (a, b) => SEVERIDADE[a.tipo] - SEVERIDADE[b.tipo],
    );
    const recomendacoes: Recomendacao[] = semDuplicatas(
      semManterMetforminaSeSuspensa(ajuste.recomendacoes),
      (r) => r.tipo,
    );
    const referencias: ReferenciaClinica[] = semDuplicatas(
      ajuste.referencias,
      (r) => r.localizacao,
    );

    return {
      tipo: "resultado",
      modo: "titulacao",
      esquemaSugerido: ajuste.aplicacoes,
      doseTotalDiaUi,
      deltaTotalUi: doseTotalDiaUi - doseTotalAnteriorUi,
      naMeta: ajuste.naMeta,
      ...(ajuste.condutasAlternativas.length > 0
        ? { condutasAlternativas: ajuste.condutasAlternativas }
        : {}),
      alertas,
      recomendacoesAoPrescritor: recomendacoes,
      referencias,
    };
  }
}
