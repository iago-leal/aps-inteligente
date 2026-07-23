// Validação de entrada com coleta de TODOS os ofensores (RN-08) — padrão da regra
// 15 do domain.md: nunca parar no primeiro. O motor revalida tudo, sem confiar na
// UI. Dois níveis distintos (D-07): ofensor TRAVA (tipo/domínio inválido: sexo,
// raça, idade implausível, valor não positivo); valor fora da faixa fisiológica NÃO
// trava — é clampado ao limite e sinalizado por `Aviso` (RN-07). Idade fora de 40–79
// mas plausível também não é ofensor: é fora-do-escopo (elegibilidade.ts).
// Feature 014-risco-cardiovascular-pce.
import { FAIXAS } from "./fonte-clinica";
import type {
  Aviso,
  CodigoAviso,
  CodigoOfensor,
  EntradaEstimativa,
  Ofensor,
  Raca,
  Sexo,
} from "./tipos";
import type { VariaveisEquacao } from "./equacao";

const { idadePlausivel, colesterolTotal, hdl, pas } = FAIXAS;

const SEXOS: readonly Sexo[] = ["masculino", "feminino"];
const RACAS: readonly Raca[] = ["branco", "afro-americano", "outra"];

function ofensor(campo: string, codigo: CodigoOfensor, mensagem: string): Ofensor {
  return { campo, codigo, mensagem };
}

function numeroValido(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

export function validarEntrada(entrada: EntradaEstimativa): Ofensor[] {
  const ofensores: Ofensor[] = [];

  if (!SEXOS.includes(entrada.sexo)) {
    ofensores.push(
      ofensor("sexo", "SEXO_INVALIDO", "Sexo inválido: informe masculino ou feminino."),
    );
  }

  if (!RACAS.includes(entrada.raca)) {
    ofensores.push(
      ofensor(
        "raca",
        "RACA_INVALIDA",
        "Raça inválida: informe branco, afro-americano ou outra.",
      ),
    );
  }

  if (
    !Number.isInteger(entrada.idadeAnos) ||
    entrada.idadeAnos < idadePlausivel.min ||
    entrada.idadeAnos > idadePlausivel.max
  ) {
    ofensores.push(
      ofensor(
        "idadeAnos",
        "IDADE_INVALIDA",
        `Idade inválida: informe um número inteiro de anos entre ${idadePlausivel.min} e ${idadePlausivel.max}.`,
      ),
    );
  }

  if (!numeroValido(entrada.colesterolTotalMgDl)) {
    ofensores.push(
      ofensor(
        "colesterolTotalMgDl",
        "COLESTEROL_INVALIDO",
        "Colesterol total inválido: informe um valor positivo em mg/dL.",
      ),
    );
  }

  if (!numeroValido(entrada.hdlMgDl)) {
    ofensores.push(
      ofensor("hdlMgDl", "HDL_INVALIDO", "HDL inválido: informe um valor positivo em mg/dL."),
    );
  }

  if (!numeroValido(entrada.pasMmHg)) {
    ofensores.push(
      ofensor(
        "pasMmHg",
        "PAS_INVALIDA",
        "Pressão arterial sistólica inválida: informe um valor positivo em mmHg.",
      ),
    );
  }

  return ofensores;
}

interface Faixa {
  readonly min: number;
  readonly max: number;
}

/** Clampa o valor à faixa e, se houve corte, produz o `Aviso` correspondente. */
function clampar(
  valor: number,
  faixa: Faixa,
  campo: string,
  codigo: CodigoAviso,
  unidade: string,
): { valor: number; aviso: Aviso | null } {
  if (valor < faixa.min || valor > faixa.max) {
    const limite = valor < faixa.min ? faixa.min : faixa.max;
    const sentido = valor < faixa.min ? "subestimar" : "superestimar";
    return {
      valor: limite,
      aviso: {
        campo,
        codigo,
        mensagem: `Valor fora da faixa fisiológica (${faixa.min}–${faixa.max} ${unidade}): calculado com o limite de ${limite} ${unidade}, o que pode ${sentido} o risco.`,
      },
    };
  }
  return { valor, aviso: null };
}

export interface EntradaClampada {
  readonly variaveis: VariaveisEquacao;
  readonly avisos: readonly Aviso[];
}

/**
 * Clampa os valores numéricos fora da faixa fisiológica ao limite mais próximo e
 * coleta os avisos (RN-07/D-07). Pressupõe entrada já sem ofensores (validarEntrada
 * passou), garantindo números positivos finitos.
 */
export function clamparEntrada(entrada: EntradaEstimativa): EntradaClampada {
  const avisos: Aviso[] = [];

  const col = clampar(
    entrada.colesterolTotalMgDl,
    colesterolTotal,
    "colesterolTotalMgDl",
    "COLESTEROL_FORA_DA_FAIXA",
    "mg/dL",
  );
  if (col.aviso) avisos.push(col.aviso);

  const h = clampar(entrada.hdlMgDl, hdl, "hdlMgDl", "HDL_FORA_DA_FAIXA", "mg/dL");
  if (h.aviso) avisos.push(h.aviso);

  const p = clampar(entrada.pasMmHg, pas, "pasMmHg", "PAS_FORA_DA_FAIXA", "mmHg");
  if (p.aviso) avisos.push(p.aviso);

  return {
    variaveis: {
      idadeAnos: entrada.idadeAnos,
      colesterolTotalMgDl: col.valor,
      hdlMgDl: h.valor,
      pasMmHg: p.valor,
      emTratamentoAntiHipertensivo: entrada.emTratamentoAntiHipertensivo,
      diabetes: entrada.diabetes,
      tabagismoAtual: entrada.tabagismoAtual,
    },
    avisos,
  };
}
