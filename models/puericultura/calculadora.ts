// Fachada CalculadoraCrescimentoInfantil — API pública única da unit (RF-01, RF-20;
// D-08). Fluxo: validar → datar → escopo → medidas → escolher o padrão → ler a régua
// → classificar, com cada índice carimbado com padrão, idade usada e página.
// Pura e determinística; o motor apenas INFORMA escore e classificação, nunca escolhe
// conduta (ADR 0005, RN-12); erro esperado é valor (ADR 0004); exceção só para bug
// interno. Feature 017-puericultura-crescimento.
//
// **Qual idade governa o quê** — a distinção que atravessa este arquivo:
//
//  · A idade CRONOLÓGICA governa como a criança foi medida (RN-09): a posição
//    esperada é propriedade do corpo da criança, não da curva. Um prematuro de 2
//    anos de vida mede-se em pé, ainda que a sua curva seja lida na idade corrigida.
//  · A idade que INDEXA a curva — corrigida enquanto a correção vale — governa a
//    leitura da tabela, o escopo da fonte e a faixa de rótulo.
//
// A premissa é registrada no roadmap §4 e fica aqui declarada por ser o único ponto
// do motor em que as duas idades divergem de propósito.
import { classificar } from "./classificacao";
import { foraDoEscopo, perimetroCefalicoForaDoEscopo } from "./elegibilidade";
import {
  NOTA_PROVENIENCIA,
  REFERENCIAS,
  referenciaDoIndice,
} from "./fonte-clinica";
import { derivarIdades, ehPreTermo } from "./idades";
import { derivarMedidas, type MedidasDerivadas } from "./medidas";
import { escolherPadrao, type EscolhaDePadrao } from "./padrao";
import { validarEntrada } from "./validacao";
import {
  escoreZPreTermo,
  medidaDoIndiceNoPreTermo,
} from "./intergrowth/escore";
import { aplicaCorrecaoDeCauda, escoreZ } from "./oms/lms";
import {
  REPOSITORIO_OMS,
  lerLms,
  type RepositorioDeTabelasOms,
} from "./oms/leitura";
import {
  ErroDeInvariante,
  type Aviso,
  type EntradaAvaliacao,
  type IdadesDerivadas,
  type Indice,
  type IndiceAntropometrico,
  type NotaAoPrescritor,
  type ReferenciaClinica,
  type SaidaAvaliacao,
} from "./tipos";

/** RN-01: os quatro índices, sempre na mesma ordem — a da caderneta. */
const INDICES: readonly Indice[] = Object.freeze([
  "peso-idade",
  "comprimento-estatura-idade",
  "imc-idade",
  "perimetro-cefalico-idade",
]);

/** A medida que cada índice consome; `undefined` quando não foi informada (RF-06). */
function medidaDoIndice(
  indice: Indice,
  entrada: EntradaAvaliacao,
  medidas: MedidasDerivadas,
): number | undefined {
  switch (indice) {
    case "peso-idade":
      return entrada.pesoKg;
    case "comprimento-estatura-idade":
      return medidas.comprimentoCm;
    case "imc-idade":
      return medidas.imc;
    case "perimetro-cefalico-idade":
      return entrada.perimetroCefalicoCm;
  }
}

/**
 * O aviso da conversão de posição acompanha os DOIS índices que consomem a medida
 * convertida — o de comprimento/estatura e o de IMC (D-11). Pendurá-lo só no
 * primeiro esconderia do prescritor que o IMC também mudou.
 */
function avisosDoIndice(
  indice: Indice,
  medidas: MedidasDerivadas,
): readonly Aviso[] {
  const consomeAMedidaConvertida =
    indice === "comprimento-estatura-idade" || indice === "imc-idade";
  return consomeAMedidaConvertida ? medidas.avisos : [];
}

function avaliarNoPreTermo(
  indice: Indice,
  valor: number,
  entrada: EntradaAvaliacao,
  escolha: Extract<EscolhaDePadrao, { padrao: "INTERGROWTH-21st" }>,
  medidas: MedidasDerivadas,
  diasParaRotulo: number,
): IndiceAntropometrico {
  const noPreTermo = medidaDoIndiceNoPreTermo(indice);
  if (noPreTermo.tipo === "inexistente") {
    // RN-17: o IMC não existe nestas curvas, e isso não é erro.
    return { estado: "ausente", indice, motivo: noPreTermo.motivo };
  }

  const z = escoreZPreTermo(
    noPreTermo.medida,
    valor,
    entrada.sexo,
    escolha.semanasPosMenstruais,
  );

  return {
    estado: "calculado",
    indice,
    escoreZ: z,
    classificacao: classificar(indice, z, diasParaRotulo),
    padrao: "INTERGROWTH-21st",
    idadeUsada: escolha.idadeUsada,
    avisos: avisosDoIndice(indice, medidas),
    referencia: REFERENCIAS.preTermo,
  };
}

function avaliarNaOms(
  indice: Indice,
  valor: number,
  entrada: EntradaAvaliacao,
  escolha: Extract<EscolhaDePadrao, { padrao: "OMS" }>,
  medidas: MedidasDerivadas,
  repositorio: RepositorioDeTabelasOms,
): IndiceAntropometrico {
  const leitura = lerLms(
    indice,
    entrada.sexo,
    escolha.diasParaLeitura,
    repositorio,
  );
  if (leitura.tipo === "sem-tabela") {
    // A elegibilidade já recusou os dois casos possíveis (global e parcial); chegar
    // aqui sem linha é bug interno, não fluxo esperado.
    throw new ErroDeInvariante(
      `Sem tabela da OMS para ${indice} em ${escolha.diasParaLeitura} dias (motivo ${leitura.motivo}), com a elegibilidade já vencida`,
    );
  }

  const z = escoreZ(valor, leitura.parametros, aplicaCorrecaoDeCauda(indice));

  return {
    estado: "calculado",
    indice,
    escoreZ: z,
    classificacao: classificar(indice, z, escolha.diasParaLeitura),
    padrao: "OMS",
    idadeUsada: escolha.idadeUsada,
    avisos: avisosDoIndice(indice, medidas),
    referencia: referenciaDoIndice(indice, escolha.diasParaLeitura),
  };
}

/** RN-15: o que o resultado precisa declarar sobre a correção que NÃO houve. */
function notasDe(
  entrada: EntradaAvaliacao,
  idades: IdadesDerivadas,
): readonly NotaAoPrescritor[] {
  const ig = entrada.idadeGestacionalAoNascer;

  if (ig === undefined) {
    return [
      {
        tipo: "PREMISSA_DE_TERMO",
        mensagem:
          "Idade gestacional ao nascer não informada: a criança foi tratada como nascida a termo e nenhuma correção de idade foi aplicada. Se ela nasceu pré-termo, informe a idade gestacional — a classificação pode mudar.",
        referencia: REFERENCIAS.idadeCorrigida,
      },
    ];
  }

  if (!ehPreTermo(ig)) {
    return [
      {
        tipo: "NASCIDO_A_TERMO_SEM_CORRECAO",
        mensagem: `Idade gestacional ao nascer de ${ig.semanas} semanas e ${ig.dias} dias: nascida a termo, sem correção de idade. A regra da idade corrigida vale para o recém-nascido pré-termo.`,
        referencia: REFERENCIAS.idadeCorrigida,
      },
    ];
  }

  if (!idades.correcaoAtiva) {
    return [
      {
        tipo: "NASCIDO_A_TERMO_SEM_CORRECAO",
        mensagem: `Nascida pré-termo com ${ig.semanas} semanas e ${ig.dias} dias, mas já fora do período de correção: a partir daqui a leitura usa a idade cronológica.`,
        referencia: REFERENCIAS.idadeCorrigida,
      },
    ];
  }

  return [];
}

function referenciasDe(
  escolha: EscolhaDePadrao,
  medidas: MedidasDerivadas,
): readonly ReferenciaClinica[] {
  const referencias: ReferenciaClinica[] = [REFERENCIAS.cobertura];
  if (escolha.padrao === "INTERGROWTH-21st")
    referencias.push(REFERENCIAS.preTermo);
  if (escolha.idadeUsada.especie === "corrigida") {
    referencias.push(REFERENCIAS.idadeCorrigida);
  }
  if (medidas.avisos.length > 0) referencias.push(REFERENCIAS.posicaoDaMedicao);
  return referencias;
}

export class CalculadoraCrescimentoInfantil {
  /** D-08: acervo injetável, com o real por omissão — a tela instancia sem argumento. */
  constructor(
    private readonly repositorio: RepositorioDeTabelasOms = REPOSITORIO_OMS,
  ) {}

  avaliar(entrada: EntradaAvaliacao): SaidaAvaliacao {
    const ofensores = validarEntrada(entrada);
    if (ofensores.length > 0) {
      return { tipo: "erro-validacao", ofensores };
    }

    const idades = derivarIdades(entrada);
    const escopo = foraDoEscopo(idades);
    if (escopo !== null) {
      return escopo;
    }

    // A posição de medida segue a idade CRONOLÓGICA; a curva, a que a indexa.
    const medidas = derivarMedidas(entrada, idades.diasDeVida);
    const escolha = escolherPadrao(idades);
    const diasParaRotulo =
      escolha.padrao === "OMS"
        ? escolha.diasParaLeitura
        : idades.diasCorrigidos;

    const indices = INDICES.map((indice) =>
      this.avaliarIndice(
        indice,
        entrada,
        idades,
        escolha,
        medidas,
        diasParaRotulo,
      ),
    );

    const referencias = referenciasDe(escolha, medidas);
    if (referencias.length === 0) {
      // RF-10: resultado sem referência clínica não pode existir (invariante).
      throw new ErroDeInvariante("Resultado sem referência clínica");
    }

    return {
      tipo: "resultado",
      idades,
      indices,
      notas: notasDe(entrada, idades),
      notaProveniencia: NOTA_PROVENIENCIA,
      referencias,
    };
  }

  private avaliarIndice(
    indice: Indice,
    entrada: EntradaAvaliacao,
    idades: IdadesDerivadas,
    escolha: EscolhaDePadrao,
    medidas: MedidasDerivadas,
    diasParaRotulo: number,
  ): IndiceAntropometrico {
    // O escopo da fonte vem antes do preenchimento: dizer "medida não informada"
    // numa criança de 3 anos sugeriria que o perímetro cefálico deveria ter sido
    // informado, quando a caderneta simplesmente não o classifica nessa idade.
    if (indice === "perimetro-cefalico-idade") {
      const fora = perimetroCefalicoForaDoEscopo(idades);
      if (fora !== null) return fora;
    }

    const valor = medidaDoIndice(indice, entrada, medidas);
    if (valor === undefined) {
      // RN-17: no pré-termo, o IMC é ausência POR INEXISTÊNCIA, não por falta de
      // medida — e o motivo tem de dizer qual das duas coisas ocorreu.
      if (escolha.padrao === "INTERGROWTH-21st" && indice === "imc-idade") {
        return {
          estado: "ausente",
          indice,
          motivo: "IMC_INEXISTENTE_NO_PRETERMO",
        };
      }
      return { estado: "ausente", indice, motivo: "MEDIDA_NAO_INFORMADA" };
    }

    return escolha.padrao === "INTERGROWTH-21st"
      ? avaliarNoPreTermo(
          indice,
          valor,
          entrada,
          escolha,
          medidas,
          diasParaRotulo,
        )
      : avaliarNaOms(
          indice,
          valor,
          entrada,
          escolha,
          medidas,
          this.repositorio,
        );
  }
}
