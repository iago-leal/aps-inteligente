// Fachada CalculadoraInsulinaDM2 — API pública única da camada de domínio
// (RF-06..RF-08 do motor; G-01..G-04): validação → estratégia → invariantes →
// alertas ordenados → referências. Pura e determinística; erro esperado é valor.
import { CONSTANTES, REFERENCIAS } from "./fonte-clinica";
import { RegraInicio } from "./regra-inicio";
import { RegraIntensificacao } from "./regra-intensificacao";
import {
  RegraTitulacaoBasal,
  type AjusteEmCurso,
} from "./regra-titulacao-basal";
import {
  motivoForaDoEscopo,
  validarEntrada,
} from "./validacao";
import {
  DoseUi,
  Peso,
  type Alerta,
  type EntradaCalculo,
  type Recomendacao,
  type ReferenciaClinica,
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
};

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
      return this.regraInicio.calcular(entrada, peso);
    }
    return this.calcularTitulacao(entrada, peso);
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
    this.regraIntensificacao.aplicar(ajuste, entrada);

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
      ajuste.recomendacoes,
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
