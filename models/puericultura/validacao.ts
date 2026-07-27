// Validação de entrada com coleta de TODOS os ofensores (RF-09, RN-11) — invariante
// 4 de `domain.md` §7 e molde de `models/risco-cardiovascular/validacao.ts`. O motor
// revalida tudo, sem confiar na UI. Feature 017-puericultura-crescimento.
//
// Uma diferença de fundo frente ao molde da 014, e ela é deliberada: lá, valor fora
// da faixa fisiológica é CLAMPADO ao limite e sinalizado por aviso; aqui, ele TRAVA.
// A razão é o que cada faixa significa. Na 014 a faixa é o intervalo de validação da
// equação, e o adulto com colesterol acima dele existe. Aqui a faixa é de
// plausibilidade antropométrica: criança de 200 kg ou de 5 cm não existe — é erro de
// digitação, e clampá-lo devolveria um escore extremo com aparência de cálculo. A
// escolha custa o caso extremo legítimo, que a premissa 🟡 do roadmap §4 já registra.
import { FAIXAS_DE_PLAUSIBILIDADE } from "./fonte-clinica";
import { paraDiasEpoch } from "./datas";
import type { CodigoOfensor, EntradaAvaliacao, Ofensor, Sexo } from "./tipos";

const SEXOS: readonly Sexo[] = ["masculino", "feminino"];
const {
  pesoKg,
  comprimentoCm,
  perimetroCefalicoCm,
  idadeGestacionalSemanas,
  idadeGestacionalDias,
} = FAIXAS_DE_PLAUSIBILIDADE;

function ofensor(
  campo: string,
  codigo: CodigoOfensor,
  mensagem: string,
): Ofensor {
  return { campo, codigo, mensagem };
}

interface FaixaFechada {
  readonly min: number;
  readonly max: number;
}

/** Medida válida: número finito, estritamente positivo e dentro da plausibilidade. */
function medidaForaDaFaixa(valor: number, faixa: FaixaFechada): boolean {
  return !Number.isFinite(valor) || valor <= faixa.min || valor > faixa.max;
}

/**
 * As três medidas, cada uma com a sua faixa e o seu ofensor. A tabela existe para que
 * acrescentar uma quarta medida um dia seja acrescentar uma LINHA, e não repetir pela
 * quarta vez o mesmo bloco `if` — e para manter `validarMedidas` dentro do teto de 50
 * linhas do mantenedor, que a repetição estourava.
 */
const MEDIDAS_VALIDAVEIS = Object.freeze([
  {
    campo: "pesoKg",
    codigo: "PESO_INVALIDO",
    rotulo: "Peso",
    unidade: "kg",
    faixa: pesoKg,
    ler: (e: EntradaAvaliacao) => e.pesoKg,
  },
  {
    campo: "comprimentoCm",
    codigo: "COMPRIMENTO_INVALIDO",
    rotulo: "Comprimento/estatura",
    unidade: "cm",
    faixa: comprimentoCm,
    ler: (e: EntradaAvaliacao) => e.comprimentoCm,
  },
  {
    campo: "perimetroCefalicoCm",
    codigo: "PERIMETRO_CEFALICO_INVALIDO",
    rotulo: "Perímetro cefálico",
    unidade: "cm",
    faixa: perimetroCefalicoCm,
    ler: (e: EntradaAvaliacao) => e.perimetroCefalicoCm,
  },
] as const satisfies readonly {
  campo: string;
  codigo: CodigoOfensor;
  rotulo: string;
  unidade: string;
  faixa: FaixaFechada;
  ler: (e: EntradaAvaliacao) => number | undefined;
}[]);

function validarMedidas(entrada: EntradaAvaliacao): Ofensor[] {
  const ofensores: Ofensor[] = [];
  const comprimento = entrada.comprimentoCm;

  if (MEDIDAS_VALIDAVEIS.every((m) => m.ler(entrada) === undefined)) {
    ofensores.push(
      ofensor(
        "medidas",
        "NENHUMA_MEDIDA_INFORMADA",
        "Informe ao menos uma medida: peso, comprimento/estatura ou perímetro cefálico.",
      ),
    );
  }

  for (const medida of MEDIDAS_VALIDAVEIS) {
    const valor = medida.ler(entrada);
    if (valor === undefined || !medidaForaDaFaixa(valor, medida.faixa))
      continue;
    ofensores.push(
      ofensor(
        medida.campo,
        medida.codigo,
        `${medida.rotulo} inválido: informe um valor entre ${medida.faixa.min} e ${medida.faixa.max} ${medida.unidade}.`,
      ),
    );
  }

  if (comprimento !== undefined && entrada.posicaoDaMedicao === undefined) {
    // RN-09: a posição é dado clínico. Supor "deitado" erraria por 0,7 cm em
    // silêncio, exatamente na medida que o escore de estatura consome.
    ofensores.push(
      ofensor(
        "posicaoDaMedicao",
        "POSICAO_DA_MEDICAO_AUSENTE",
        "Informe se a medida foi aferida deitada (comprimento) ou em pé (estatura): a conversão de 0,7 cm depende disso.",
      ),
    );
  }

  return ofensores;
}

function validarDatas(entrada: EntradaAvaliacao): Ofensor[] {
  const ofensores: Ofensor[] = [];
  // `paraDiasEpoch` devolve null para qualquer coisa que não case com o formato,
  // inclusive campo vazio: o motor não confia na UI para tê-lo preenchido.
  const nascimento = paraDiasEpoch(entrada.dataDeNascimento);
  const medicao = paraDiasEpoch(entrada.dataDaMedicao);

  if (nascimento === null) {
    ofensores.push(
      ofensor(
        "dataDeNascimento",
        "DATA_DE_NASCIMENTO_INVALIDA",
        "Data de nascimento inválida: informe uma data real no formato AAAA-MM-DD.",
      ),
    );
  }

  if (medicao === null) {
    ofensores.push(
      ofensor(
        "dataDaMedicao",
        "DATA_DA_MEDICAO_INVALIDA",
        "Data da medição inválida: informe uma data real no formato AAAA-MM-DD.",
      ),
    );
  }

  if (nascimento !== null && medicao !== null && nascimento > medicao) {
    ofensores.push(
      ofensor(
        "dataDeNascimento",
        "DATA_DE_NASCIMENTO_FUTURA",
        "Data de nascimento posterior à data da medição: verifique as duas datas.",
      ),
    );
  }

  return ofensores;
}

function validarIdadeGestacional(entrada: EntradaAvaliacao): Ofensor[] {
  const ig = entrada.idadeGestacionalAoNascer;
  if (ig === undefined) return []; // RN-15: ausência é premissa declarada, não erro.

  const semanasForaDaFaixa =
    !Number.isInteger(ig.semanas) ||
    ig.semanas < idadeGestacionalSemanas.min ||
    ig.semanas > idadeGestacionalSemanas.max;
  const diasForaDaFaixa =
    !Number.isInteger(ig.dias) ||
    ig.dias < idadeGestacionalDias.min ||
    ig.dias > idadeGestacionalDias.max;

  if (!semanasForaDaFaixa && !diasForaDaFaixa) return [];

  return [
    ofensor(
      "idadeGestacionalAoNascer",
      "IDADE_GESTACIONAL_INVALIDA",
      `Idade gestacional ao nascer inválida: informe de ${idadeGestacionalSemanas.min} a ${idadeGestacionalSemanas.max} semanas completas e de ${idadeGestacionalDias.min} a ${idadeGestacionalDias.max} dias.`,
    ),
  ];
}

/**
 * Devolve TODOS os ofensores de uma vez (RN-11). Nunca para no primeiro: quem
 * digitou três campos errados merece corrigir os três numa passada, e não descobrir
 * um por vez a cada tentativa.
 */
export function validarEntrada(entrada: EntradaAvaliacao): Ofensor[] {
  const ofensores: Ofensor[] = [];

  if (!SEXOS.includes(entrada.sexo)) {
    ofensores.push(
      ofensor(
        "sexo",
        "SEXO_INVALIDO",
        "Sexo inválido: informe masculino ou feminino. As curvas de referência são específicas por sexo.",
      ),
    );
  }

  ofensores.push(...validarDatas(entrada));
  ofensores.push(...validarMedidas(entrada));
  ofensores.push(...validarIdadeGestacional(entrada));

  return ofensores;
}
