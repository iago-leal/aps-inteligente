// Montagem do registro da consulta (feature 020: RF-06, RF-10; RN-09, RN-09b, RN-10, RN-11).
//
// O domínio devolve ESTRUTURA, nunca texto pronto (D-03): percorre a ficha na ordem impressa,
// descarta o que não foi preenchido, agrupa nas quatro seções do SOAP e anexa notas e
// referências. A projeção em cadeia é da camada de interface, e é ela que tela e comando de
// cópia consomem — uma função, uma variável, dois consumidores.
//
// A REGRA QUE GOVERNA TUDO AQUI (RN-10). O registro de prontuário afirma o que foi
// averiguado. Campo sem resposta não aparece, e seção que ficar sem item some inteira,
// cabeçalho incluído: cabeçalho solto afirmaria averiguação que não houve, que é pior que a
// omissão — é a diferença entre não ter olhado e ter registrado que olhou.
//
// O QUE VEM DA CALCULADORA DE CRESCIMENTO (RN-11, RF-10). O `ResultadoAvaliacao` chega
// PRONTO da fachada da feature 017. Este módulo não recalcula escore nenhum: transpõe o que
// aquele motor emitiu, com a referência que ele já carimbou. Os escores ocupam a seção
// objetiva, que é onde a medida mora; a classificação nutricional ocupa a avaliação, porque
// é juízo da própria fonte, e não conclusão que este produto tenha formado (RN-09b).
import {
  NOTA_FICHAS_AUSENTES,
  NOTA_ORGANIZACAO_EM_SOAP,
  NOTA_SUPRESSAO_DE_CAMPO,
  REFERENCIAS_DA_CONSULTA,
  referenciaDaFicha,
} from "./fonte-clinica";
import { camposAplicaveis, rotuloDoCampo } from "./selecao";
import type {
  Campo,
  EntradaDoRegistro,
  ItemDoRegistro,
  NotaDoRegistro,
  RegistroDaConsulta,
  Resposta,
  SecaoDoRegistro,
  SecaoSoap,
} from "./tipos";
import type {
  Indice,
  IndiceCalculado,
  ReferenciaClinica,
  ResultadoAvaliacao,
} from "../tipos";

/** RN-09: a ordem é fixa, e é esta. */
const ORDEM: readonly SecaoSoap[] = ["S", "O", "A", "P"];

/** Autoral: o nome por extenso de cada seção, para quem lê o registro na tela. */
const TITULO_DA_SECAO: Readonly<Record<SecaoSoap, string>> = Object.freeze({
  S: "Subjetivo",
  O: "Objetivo",
  A: "Avaliação",
  P: "Plano",
});

/**
 * O nome neutro de cada índice antropométrico (`MD-0012`). Declarado aqui, e não reusado da
 * tela da feature 017, porque `models/` não importa `interface/`: a direção das dependências
 * é o que mantém o domínio puro (ADR 0003), e furá-la por economia de quatro linhas seria
 * caro no lugar errado.
 */
const NOME_DO_INDICE: Readonly<Record<Indice, string>> = Object.freeze({
  "peso-idade": "Peso para a idade",
  "comprimento-estatura-idade": "Comprimento/estatura para a idade",
  "imc-idade": "IMC para a idade",
  "perimetro-cefalico-idade": "Perímetro cefálico para a idade",
});

/** O mês médio do calendário (365,25/12). Aritmética do produto, não da caderneta. */
const DIAS_POR_MES_MEDIO = 30.4375;

/** D-13 da 017: o escore é formatado, jamais recalculado; sinal sempre explícito. */
function formatarEscoreZ(escoreZ: number): string {
  const arredondado = Number(escoreZ.toFixed(1));
  return `${arredondado < 0 ? "−" : "+"}${Math.abs(arredondado).toFixed(1)}`;
}

/** RN-05: a idade em prosa curta, na unidade em que o prescritor a diz em voz alta. */
export function descreverIdade(diasDeVida: number): string {
  if (diasDeVida < Math.round(DIAS_POR_MES_MEDIO)) {
    return diasDeVida === 1 ? "1 dia" : `${diasDeVida} dias`;
  }
  const meses = Math.floor(diasDeVida / DIAS_POR_MES_MEDIO);
  const dias = Math.round(diasDeVida - meses * DIAS_POR_MES_MEDIO);
  const parteDosMeses = meses === 1 ? "1 mês" : `${meses} meses`;
  if (dias === 0) return parteDosMeses;
  return `${parteDosMeses} e ${dias === 1 ? "1 dia" : `${dias} dias`}`;
}

/** O valor em forma de leitura, por natureza do campo. Vazio significa não respondido. */
function valorDaResposta(resposta: Resposta, campo: Campo): string | null {
  switch (resposta.natureza) {
    case "marcacao":
      return resposta.valor === "sim" ? "Sim" : "Não";
    case "escolha": {
      const complemento = resposta.complemento?.trim();
      return complemento === undefined || complemento === ""
        ? resposta.opcao
        : `${resposta.opcao} — ${complemento}`;
    }
    case "medida": {
      const bruto = resposta.bruto.trim();
      return bruto === "" || campo.natureza !== "medida"
        ? null
        : `${bruto} ${campo.unidade}`;
    }
    case "texto": {
      const texto = resposta.texto.trim();
      return texto === "" ? null : texto;
    }
  }
}

/** Os itens vindos da ficha, na ordem impressa e já sem os campos em branco (RN-10). */
function itensDaFicha({
  ficha,
  contexto,
  preenchimento,
}: EntradaDoRegistro): Array<{ secao: SecaoSoap; item: ItemDoRegistro }> {
  const reunidos: Array<{ secao: SecaoSoap; item: ItemDoRegistro }> = [];

  for (const secaoDaFicha of ficha.secoes) {
    for (const campo of camposAplicaveis(secaoDaFicha, contexto.sexo)) {
      const resposta = preenchimento.get(campo.id);
      if (resposta === undefined) continue;
      const valor = valorDaResposta(resposta, campo);
      if (valor === null) continue;
      reunidos.push({
        secao: campo.secaoSoap,
        item: {
          rotulo: rotuloDoCampo(campo, contexto.sexo),
          valor,
          origem: "ficha",
        },
      });
    }
  }

  return reunidos;
}

function indicesCalculados(
  avaliacao: ResultadoAvaliacao,
): readonly IndiceCalculado[] {
  return avaliacao.indices.filter(
    (indice): indice is IndiceCalculado => indice.estado === "calculado",
  );
}

/**
 * RF-10: os escores na objetiva, a classificação nutricional na avaliação. Não é o mesmo
 * campo em dois lugares — é a medida de um lado e o juízo do outro, que é a mesma estrutura
 * que RN-09b descreve para alimentação e vacinação. O índice que produziu o juízo vai dito
 * no próprio valor, de modo que nada é escolhido em silêncio.
 */
function itensDaCalculadora(
  avaliacao: ResultadoAvaliacao | undefined,
): Array<{ secao: SecaoSoap; item: ItemDoRegistro }> {
  if (avaliacao === undefined) return [];
  const calculados = indicesCalculados(avaliacao);

  const objetivos = calculados.map((indice) => ({
    secao: "O" as const,
    item: {
      rotulo: NOME_DO_INDICE[indice.indice],
      valor: `escore z ${formatarEscoreZ(indice.escoreZ)}, ${indice.classificacao}`,
      origem: "calculadora-de-crescimento" as const,
      referencia: indice.referencia,
    },
  }));

  // O estado nutricional é o que o IMC para a idade classifica; sem ele, a fonte ainda
  // classifica o peso para a idade, e é essa a linha que sobra.
  const nutricional =
    calculados.find((i) => i.indice === "imc-idade") ??
    calculados.find((i) => i.indice === "peso-idade");

  const avaliativos =
    nutricional === undefined
      ? []
      : [
          {
            secao: "A" as const,
            item: {
              rotulo: "Crescimento",
              valor: `${nutricional.classificacao} (${NOME_DO_INDICE[nutricional.indice]})`,
              origem: "calculadora-de-crescimento" as const,
              referencia: nutricional.referencia,
            },
          },
        ];

  return [...objetivos, ...avaliativos];
}

/** RN-10: seção sem item não nasce. */
function agrupar(
  reunidos: ReadonlyArray<{ secao: SecaoSoap; item: ItemDoRegistro }>,
): readonly SecaoDoRegistro[] {
  return ORDEM.map((secao) => ({
    secao,
    titulo: TITULO_DA_SECAO[secao],
    itens: reunidos.filter((r) => r.secao === secao).map((r) => r.item),
  })).filter((secao) => secao.itens.length > 0);
}

/** RN-03, RN-08, RN-09: o que o registro precisa declarar sobre a sua própria feitura. */
function notasDe({
  ficha,
  contexto,
}: EntradaDoRegistro): readonly NotaDoRegistro[] {
  const notas: NotaDoRegistro[] = [
    { tipo: "ORGANIZACAO_EM_SOAP", mensagem: NOTA_ORGANIZACAO_EM_SOAP },
    { tipo: "FICHAS_AUSENTES", mensagem: NOTA_FICHAS_AUSENTES },
  ];

  const houveSupressao = ficha.secoes.some((secaoDaFicha) =>
    secaoDaFicha.campos.some(
      (campo) =>
        campo.sexos !== undefined && !campo.sexos.includes(contexto.sexo),
    ),
  );
  if (houveSupressao) {
    notas.push({
      tipo: "SUPRESSAO_DE_CAMPO",
      mensagem: NOTA_SUPRESSAO_DE_CAMPO,
    });
  }

  return notas;
}

function referenciasDe(
  entrada: EntradaDoRegistro,
  daCalculadora: ReadonlyArray<{ item: ItemDoRegistro }>,
): readonly ReferenciaClinica[] {
  const referencias: ReferenciaClinica[] = [
    REFERENCIAS_DA_CONSULTA.cobertura,
    referenciaDaFicha(entrada.ficha.titulo, entrada.ficha.pagina),
  ];
  for (const { item } of daCalculadora) {
    if (item.referencia === undefined) continue;
    if (
      referencias.some((r) => r.localizacao === item.referencia!.localizacao)
    ) {
      continue;
    }
    referencias.push(item.referencia);
  }
  return referencias;
}

export function montarRegistro(entrada: EntradaDoRegistro): RegistroDaConsulta {
  const daCalculadora = itensDaCalculadora(entrada.avaliacao);
  const reunidos = [...itensDaFicha(entrada), ...daCalculadora];

  return {
    tipo: "registro",
    ficha: {
      id: entrada.ficha.id,
      titulo: entrada.ficha.titulo,
      pagina: entrada.ficha.pagina,
    },
    idadeDeclarada: {
      especie: "cronologica",
      texto: `idade cronológica: ${descreverIdade(entrada.contexto.idades.diasDeVida)}`,
    },
    secoes: agrupar(reunidos),
    notas: notasDe(entrada),
    referencias: referenciasDe(entrada, daCalculadora),
  };
}
