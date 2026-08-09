// Mapa de classificação da superfície textual: agrega os módulos de `classes/` e responde
// a que classe pertence cada literal. Realiza T008 do plano da feature
// 018-revisao-linguagem-textos.
//
// A REGRA QUE ESTE MÓDULO FAZ VALER (D-04, RN-02, `MD-0014`). A classe de um literal vem da
// ORIGEM do texto, jamais do diretório onde ele mora: `models/*/validacao.ts` é autoral
// porque nenhum guia impresso escreve "Informe o peso do paciente", e `interface/**` pode
// ser citação quando reproduz a fonte. Inferir por caminho erraria nas duas direções, e
// erraria em silêncio — revisando citação por omissão, que é o pior modo de falha possível
// nesta feature. Por isso aqui não há inferência nenhuma: só consulta a um mapa declarado,
// e parada ruidosa quando o literal não está nele.
//
// POR QUE A CHAVE É ARQUIVO + TEXTO, E NUNCA A LINHA. A linha se move a cada edição, e um
// mapa chaveado por linha exigiria renumerar centenas de entradas a cada reescrita — o que
// converteria a declaração em ruído e a faria ser mantida no automático, que é o contrário
// do que D-04 quer. O texto é estável: enquanto o literal não muda, a declaração vale; e no
// dia em que ele muda, a entrada some do mapa e o gerador para, que é exatamente o momento
// em que alguém deve decidir de novo a que classe ele pertence.
//
// Consequência aceita: dois literais IDÊNTICOS no mesmo arquivo colapsam numa declaração
// só. É o comportamento desejado — o mesmo texto tem a mesma classe, e declará-lo duas
// vezes seria abrir a porta para declará-lo de dois modos.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
//
// Princípio IX de `.reversa/principles.md`; guia em `docs/redacao.md`.

import { MAPA as MODELS_PUERICULTURA_CONSULTA } from "./classes/models-puericultura-consulta.mts";
import { MAPA as MODELS_PUERICULTURA } from "./classes/models-puericultura.mts";
import { MAPA as MODELS_INSULINA } from "./classes/models-insulina.mts";
import { MAPA as MODELS_DEPRESSAO_GERIATRICA } from "./classes/models-depressao-geriatrica.mts";
import { MAPA as MODELS_DEMAIS } from "./classes/models-demais.mts";
import { MAPA as INTERFACE_SAUDE_DO_IDOSO } from "./classes/interface-saude-do-idoso.mts";
import { MAPA as INTERFACE_CALCULADORA } from "./classes/interface-calculadora.mts";
import { MAPA as INTERFACE_CARDIOLOGIA } from "./classes/interface-cardiologia.mts";
import { MAPA as INTERFACE_COMUM } from "./classes/interface-comum.mts";
import { MAPA as INTERFACE_CONTRIBUICAO } from "./classes/interface-contribuicao.mts";
import { MAPA as INTERFACE_GESTACAO } from "./classes/interface-gestacao.mts";
import { MAPA as INTERFACE_INICIO } from "./classes/interface-inicio.mts";
import { MAPA as INTERFACE_PUERICULTURA_CONSULTA } from "./classes/interface-puericultura-consulta.mts";
import { MAPA as INTERFACE_PUERICULTURA } from "./classes/interface-puericultura.mts";
import { MAPA as INTERFACE_RISCO_CARDIOVASCULAR } from "./classes/interface-risco-cardiovascular.mts";
import {
  MAPA as PAGES_E_ARQUIVOS,
  UNIFORMES,
} from "./classes/pages-e-arquivos.mts";

/** As três classes de RN-01. Fechada por construção: não há quarta. */
export type ClasseDeTexto = "autoral" | "citacao" | "identificador";

export type Declaracao = {
  readonly texto: string;
  readonly classe: ClasseDeTexto;
  /**
   * Só para `citacao`: onde a fonte impressa traz o texto. É o que permite a quem confere
   * contra o material impresso saber para que página olhar.
   */
  readonly origem?: string;
  /**
   * Só para `citacao` afastada da fonte: a ficha de decisão que autoriza o afastamento.
   * Hoje, os dois rótulos de concordância de `MD-0015`. Declaração sem ficha é violação.
   */
  readonly excecao?: string;
  /**
   * Razão da classe, quando ela não é evidente pela leitura do literal. É o caso das
   * mensagens de invariante interno, que parecem prosa e nunca chegam à tela.
   */
  readonly nota?: string;
};

/** Um módulo de `classes/` declara, por arquivo, as declarações dos seus literais. */
export type MapaDeClasses = Readonly<Record<string, readonly Declaracao[]>>;

export class FalhaDeClassificacao extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "FalhaDeClassificacao";
  }
}

/**
 * Os módulos, cada um com o predicado que diz quais arquivos lhe pertencem. O predicado
 * serve à MENSAGEM DE ERRO, não à classificação: ele responde "onde declarar este
 * literal?", que é pergunta de organização; a classe em si continua vindo do mapa.
 */
const MODULOS: ReadonlyArray<{
  readonly nome: string;
  readonly mapa: MapaDeClasses;
  readonly cobre: (arquivo: string) => boolean;
}> = [
  // O submódulo da consulta vem ANTES do da puericultura, e a ordem é o que faz a mensagem
  // de erro apontar o módulo certo: `models/puericultura/consulta/**` casa com os dois
  // predicados, e quem responde é o primeiro. Invertidos, o gerador mandaria declarar o
  // rótulo de uma ficha no módulo do motor de crescimento (feature 020, T029).
  {
    nome: "scripts/textos/classes/models-puericultura-consulta.mts",
    mapa: MODELS_PUERICULTURA_CONSULTA,
    cobre: (a) => a.startsWith("models/puericultura/consulta/"),
  },
  {
    nome: "scripts/textos/classes/models-puericultura.mts",
    mapa: MODELS_PUERICULTURA,
    cobre: (a) => a.startsWith("models/puericultura/"),
  },
  {
    nome: "scripts/textos/classes/models-insulina.mts",
    mapa: MODELS_INSULINA,
    cobre: (a) => a.startsWith("models/insulina/"),
  },
  {
    nome: "scripts/textos/classes/models-depressao-geriatrica.mts",
    mapa: MODELS_DEPRESSAO_GERIATRICA,
    cobre: (a) => a.startsWith("models/depressao-geriatrica/"),
  },
  {
    nome: "scripts/textos/classes/models-demais.mts",
    mapa: MODELS_DEMAIS,
    cobre: (a) => a.startsWith("models/"),
  },
  // Feature 023 (D-11): começou aqui a partição que a dívida 3 pedia. O predicado alcança a
  // tela e a casca da sua rota, e por isso vem ANTES de `pages-e-arquivos.mts` — a ordem é o
  // que faz a mensagem de erro apontar o módulo certo.
  {
    nome: "scripts/textos/classes/interface-saude-do-idoso.mts",
    mapa: INTERFACE_SAUDE_DO_IDOSO,
    cobre: (a) =>
      a.startsWith("interface/saude-do-idoso/") ||
      a.startsWith("pages/saude-do-idoso/"),
  },
  // OPP-20260730-R8FJ: a partição se completou, e `interface.mts` deixou de existir. Um
  // módulo por unit, no molde que a 023 estreou e que `models/**` já seguia. O que se ganha
  // não é só o arquivo abaixo de 400 linhas: é a razão de cada classe passar a morar ao lado
  // dos literais que ela explica, em vez de num preâmbulo comum a nove assuntos.
  {
    nome: "scripts/textos/classes/interface-calculadora.mts",
    mapa: INTERFACE_CALCULADORA,
    cobre: (a) => a.startsWith("interface/calculadora/"),
  },
  {
    nome: "scripts/textos/classes/interface-cardiologia.mts",
    mapa: INTERFACE_CARDIOLOGIA,
    cobre: (a) => a.startsWith("interface/cardiologia/"),
  },
  {
    nome: "scripts/textos/classes/interface-comum.mts",
    mapa: INTERFACE_COMUM,
    cobre: (a) => a.startsWith("interface/comum/"),
  },
  {
    nome: "scripts/textos/classes/interface-contribuicao.mts",
    mapa: INTERFACE_CONTRIBUICAO,
    cobre: (a) => a.startsWith("interface/contribuicao/"),
  },
  {
    nome: "scripts/textos/classes/interface-gestacao.mts",
    mapa: INTERFACE_GESTACAO,
    cobre: (a) => a.startsWith("interface/gestacao/"),
  },
  {
    nome: "scripts/textos/classes/interface-inicio.mts",
    mapa: INTERFACE_INICIO,
    cobre: (a) => a.startsWith("interface/inicio/"),
  },
  // Mesma precedência que rege os dois módulos de `models/puericultura`, e pela mesma razão:
  // `interface/puericultura/consulta/**` casa com os dois predicados, e quem responde é o
  // primeiro. Invertidos, o gerador mandaria declarar o rótulo de uma ficha no módulo da
  // avaliação antropométrica.
  {
    nome: "scripts/textos/classes/interface-puericultura-consulta.mts",
    mapa: INTERFACE_PUERICULTURA_CONSULTA,
    cobre: (a) => a.startsWith("interface/puericultura/consulta/"),
  },
  {
    nome: "scripts/textos/classes/interface-puericultura.mts",
    mapa: INTERFACE_PUERICULTURA,
    cobre: (a) => a.startsWith("interface/puericultura/"),
  },
  {
    nome: "scripts/textos/classes/interface-risco-cardiovascular.mts",
    mapa: INTERFACE_RISCO_CARDIOVASCULAR,
    cobre: (a) => a.startsWith("interface/risco-cardiovascular/"),
  },
  // Rede de arrasto de `interface/**`, e ela declara VAZIO de propósito. Nenhum literal se
  // declara aqui: o mapa vazio existe para que o unit novo — que não casa com nenhum
  // predicado acima — receba a instrução de ganhar módulo próprio, em vez de a mensagem
  // genérica de caminho não coberto. É o que impede o monólito de renascer por acréscimo,
  // que foi exatamente como ele nasceu.
  {
    nome: "scripts/textos/classes/interface-<unit>.mts (unit novo: crie o módulo, no molde dos irmãos, e registre-o em `MODULOS`)",
    mapa: {},
    cobre: (a) => a.startsWith("interface/"),
  },
  {
    nome: "scripts/textos/classes/pages-e-arquivos.mts",
    mapa: PAGES_E_ARQUIVOS,
    cobre: (a) =>
      a.startsWith("pages/") || a === "public/manifest.webmanifest" || a === "README.md",
  },
];

/** `arquivo\ntexto` → declaração. A quebra de linha evita colisão entre as duas partes. */
function chave(arquivo: string, texto: string): string {
  return `${arquivo}\n${texto}`;
}

/**
 * Agrega os módulos numa tabela só, reprovando declaração repetida entre módulos.
 * Repetição não é erro benigno: significa que o mesmo literal tem duas classes declaradas,
 * e a que prevaleceria dependeria da ordem de importação — decisão por acidente.
 */
function agregar(): ReadonlyMap<string, Declaracao> {
  const tabela = new Map<string, Declaracao>();
  const procedencia = new Map<string, string>();

  for (const modulo of MODULOS) {
    for (const [arquivo, declaracoes] of Object.entries(modulo.mapa)) {
      for (const declaracao of declaracoes) {
        const k = chave(arquivo, declaracao.texto);
        const anterior = procedencia.get(k);
        if (anterior !== undefined) {
          throw new FalhaDeClassificacao(
            `declaração repetida para o mesmo literal, em dois módulos:\n` +
              `  arquivo: ${arquivo}\n` +
              `  texto:   ${recortar(declaracao.texto)}\n` +
              `  módulos: ${anterior} e ${modulo.nome}\n` +
              `Apague uma das duas. O mesmo literal tem uma classe só.`,
          );
        }
        procedencia.set(k, modulo.nome);
        tabela.set(k, declaracao);
      }
    }
  }

  return tabela;
}

const TABELA = agregar();

/** Onde declarar um literal deste arquivo. Alimenta a mensagem de erro, e só ela. */
export function moduloDe(arquivo: string): string {
  return (
    MODULOS.find((m) => m.cobre(arquivo))?.nome ??
    "scripts/textos/classes/ (nenhum módulo cobre este caminho: acrescente o predicado em `MODULOS`)"
  );
}

function recortar(texto: string): string {
  const limite = 90;
  return texto.length <= limite ? `"${texto}"` : `"${texto.slice(0, limite)}…"`;
}

/**
 * A consulta, e a parada ruidosa que D-04 exige. Recebe a linha só para poder nomeá-la no
 * erro: ela não participa da chave.
 */
export function declaracaoDe(
  arquivo: string,
  texto: string,
  linha: number,
): Declaracao {
  const encontrada = TABELA.get(chave(arquivo, texto));
  if (encontrada !== undefined) return encontrada;

  // Arquivo cuja prosa foi declarada de uma classe só, por origem. Ver a justificativa em
  // `classes/pages-e-arquivos.mts`, `UNIFORMES`: a porta é estreita e a razão vai escrita.
  const uniforme = UNIFORMES[arquivo];
  if (uniforme !== undefined) {
    return { texto, classe: uniforme.classe, nota: uniforme.razao };
  }

  throw new FalhaDeClassificacao(
    `literal candidato sem classe declarada.\n` +
      `  arquivo: ${arquivo}:${linha}\n` +
      `  texto:   ${recortar(texto)}\n` +
      `\n` +
      `Declare-o em ${moduloDe(arquivo)}, sob a chave "${arquivo}", com uma das três\n` +
      `classes de RN-01:\n` +
      `  · "autoral"       — escrito pelo produto; a norma de docs/redacao.md o alcança;\n` +
      `  · "citacao"       — transcrito de fonte clínica; permanece byte a byte, e pede\n` +
      `                      \`origem\` com a localização impressa;\n` +
      `  · "identificador" — chave, id, código de erro, discriminante de tipo; fora do escopo.\n` +
      `\n` +
      `A classe vem da ORIGEM do texto, nunca do diretório (RN-02). Na dúvida entre autoral\n` +
      `e citação, a pergunta é: algum guia impresso escreve esta frase? Se não, é autoral.`,
  );
}

/** Existe declaração para este literal? Usado pelo relatório, que não pode abortar. */
export function temDeclaracao(arquivo: string, texto: string): boolean {
  return TABELA.has(chave(arquivo, texto));
}

/** Total de declarações agregadas. Alimenta a conferência de soma de T015. */
export function totalDeclarado(): number {
  return TABELA.size;
}

/** Todas as declarações, em ordem estável de inserção. Usado pela conferência de órfãos. */
export function todasAsDeclaracoes(): ReadonlyArray<{
  readonly arquivo: string;
  readonly declaracao: Declaracao;
}> {
  return [...TABELA.entries()].map(([k, declaracao]) => ({
    arquivo: k.slice(0, k.indexOf("\n")),
    declaracao,
  }));
}
