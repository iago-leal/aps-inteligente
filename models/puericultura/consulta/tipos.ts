// Contrato do registro de consulta de puericultura (feature 020-consulta-puericultura-soap).
// Origem: RF-04, RF-06, RF-08, RF-09, RF-10 e RF-12 do requirements; RN-02, RN-04, RN-05,
// RN-06 a RN-13; entidades conforme `data-delta.md` §2. Fonte editorial única: a MESMA
// Caderneta da Criança da feature 017 (MD-0001, ADR 0011), aqui na seção "Acompanhamento
// da Criança e Consultas Recomendadas", pp. 66 a 75 — outra seção, nenhuma segunda fonte.
//
// TRÊS DECISÕES QUE ESTE ARQUIVO MATERIALIZA, e que se leem melhor juntas:
//
//  1. **O motor devolve ESTRUTURA, nunca texto pronto** (D-03). `RegistroDaConsulta` é o
//     que a fachada emite; a projeção em cadeia é função pura da camada de interface, e
//     tela e comando de cópia consomem a MESMA cadeia. A identidade que RF-08 exige passa
//     a ser propriedade da construção, e não coincidência a verificar.
//  2. **A ausência é modelada pela ausência** (RN-10). Campo sem entrada em `Preenchimento`
//     é campo não preenchido, e não aparece no registro. Não há valor sentinela, porque
//     sentinela é justamente o que produz a linha vazia que o prontuário não deve receber.
//  3. **A aplicabilidade por sexo mora no DADO** (D-05, `MD-0026`), em `Campo.sexos`, e não
//     em condicional de tela: quem procura por que a criptorquidia sumiu da ficha feminina
//     procura na ficha, que é onde o campo é declarado.
//
// A flexão por sexo entra como PAR de rótulos (`rotulo` mais `rotuloFeminino`), jamais como
// interpolação (D-06): o inventário textual ignora crase com substituição de propósito, e um
// rótulo montado em tempo de execução sairia do guarda da citação sem que ninguém percebesse.
import type {
  DataIso,
  EspecieDeIdade,
  IdadeGestacional,
  IdadesDerivadas,
  PosicaoDaMedicao,
  ReferenciaClinica,
  ResultadoAvaliacao,
  Sexo,
} from "../tipos";

/** RN-09: as quatro seções do registro clínico orientado por problemas. */
export type SecaoSoap = "S" | "O" | "A" | "P";

/** RF-04: a natureza que a FONTE dá ao campo, e que decide como a tela o desenha. */
export type NaturezaDeCampo = "marcacao" | "escolha" | "medida" | "texto";

/** RN-11 (D-08): liga o campo à entrada da calculadora de crescimento da feature 017. */
export type VinculoAntropometrico =
  "peso" | "comprimento" | "perimetroCefalico";

/**
 * A unidade como a caderneta a imprime — o peso vem em GRAMAS, e a conversão para quilos é
 * do produto (D-09). O `kg/m²` do IMC é o único que a fonte NÃO imprime: as fichas do 24.º e
 * do 36.º Mês pedem "IMC****: ______" sem unidade, e escrevê-la aqui é dizer em que escala o
 * número se lê, não acrescentar campo que a página não tem.
 */
export type UnidadeDeMedida = "g" | "cm" | "kg/m²";

interface CampoBase {
  /** Identificador estável dentro da ficha; nunca chega à tela. */
  readonly id: string;
  /** Citação: o texto impresso, byte a byte (RN-06). */
  readonly rotulo: string;
  /** Citação: a flexão da tiragem feminina, presente só quando difere (RN-07, D-06). */
  readonly rotuloFeminino?: string;
  /** Estruturação AUTORAL (RN-09): a caderneta não fala em SOAP. */
  readonly secaoSoap: SecaoSoap;
  /** Página impressa de onde este rótulo foi transcrito; oráculo de D-12. */
  readonly pagina: number;
  /**
   * Citação: a orientação que a fonte imprime ao lado do campo, dizendo ao profissional o
   * que investigar. Entra porque a ficha também serve de roteiro — a persona do residente
   * em campo depende dela —, e sai do registro copiado, que afirma achados e não instruções.
   */
  readonly orientacao?: string;
  /** Presente só quando o campo NÃO se aplica aos dois sexos (D-05, `MD-0026`). */
  readonly sexos?: readonly Sexo[];
}

/** O `( ) Não ( ) Sim` que a fonte imprime ao lado da maioria dos itens. */
export interface CampoDeMarcacao extends CampoBase {
  readonly natureza: "marcacao";
}

/** Escolha entre opções impressas, como o bloco de aleitamento. */
export interface CampoDeEscolha extends CampoBase {
  readonly natureza: "escolha";
  /** Citação: as opções, na ordem e na redação da página. */
  readonly opcoes: readonly string[];
  /** A fonte imprime uma linha ao lado da opção, e o que se escreve nela é do usuário. */
  readonly aceitaComplemento?: boolean;
}

export interface CampoDeMedida extends CampoBase {
  readonly natureza: "medida";
  readonly unidade: UnidadeDeMedida;
  readonly vinculoAntropometrico?: VinculoAntropometrico;
}

export interface CampoDeTexto extends CampoBase {
  readonly natureza: "texto";
}

/** União discriminada por `natureza` (`data-delta.md` §2.1). */
export type Campo =
  CampoDeMarcacao | CampoDeEscolha | CampoDeMedida | CampoDeTexto;

export interface SecaoDaFicha {
  /** O número impresso na fonte, preservado por ser parte de como o item se nomeia. */
  readonly numero: number;
  /** Citação: o título da seção, como a página o imprime. */
  readonly titulo: string;
  readonly campos: readonly Campo[];
}

/** A janela de idade que a sugestão consulta (D-07); fronteiras inclusivas. */
export interface FaixaEmDias {
  readonly de: number;
  readonly ate: number;
}

export interface Ficha {
  readonly id: string;
  /** Citação: o título impresso ("Consulta do 4º Mês"). */
  readonly titulo: string;
  readonly pagina: number;
  readonly faixaEmDias: FaixaEmDias;
  readonly secoes: readonly SecaoDaFicha[];
}

/** RN-10: união por natureza do campo; a falta de entrada É a falta de resposta. */
export type Resposta =
  | { readonly natureza: "marcacao"; readonly valor: "sim" | "nao" }
  | {
      readonly natureza: "escolha";
      readonly opcao: string;
      readonly complemento?: string;
    }
  /** O número BRUTO, como digitado: o registro imprime o que o prescritor escreveu. */
  | { readonly natureza: "medida"; readonly bruto: string }
  | { readonly natureza: "texto"; readonly texto: string };

/** `id do campo` → resposta. Chave ausente é campo não preenchido (RN-10). */
export type Preenchimento = ReadonlyMap<string, Resposta>;

/**
 * RN-12: nenhum campo identifica a criança — sem nome, prontuário, documento ou endereço.
 * O vínculo com a pessoa é feito pelo prontuário onde o texto será colado.
 */
export interface ContextoDaConsulta {
  readonly sexo: Sexo;
  readonly dataDeNascimento: DataIso;
  readonly dataDaConsulta: DataIso;
  readonly idadeGestacionalAoNascer?: IdadeGestacional;
  /** REUSO integral da feature 017 (RN-05, D-01): nenhuma terceira aritmética de datas. */
  readonly idades: IdadesDerivadas;
  /** Campo AUTORAL (D-09): a caderneta não pergunta, e o motor da 017 se recusa a supor. */
  readonly posicaoDaMedicao?: PosicaoDaMedicao;
}

/** RF-10: de onde veio a linha — da ficha preenchida ou da fachada da feature 017. */
export type OrigemDoItem = "ficha" | "calculadora-de-crescimento";

export interface ItemDoRegistro {
  /** Citação: o rótulo do campo, na flexão do sexo informado. */
  readonly rotulo: string;
  readonly valor: string;
  readonly origem: OrigemDoItem;
  /** Presente nos itens vindos da calculadora, que carregam a página do gráfico (RF-10). */
  readonly referencia?: ReferenciaClinica;
}

export interface SecaoDoRegistro {
  readonly secao: SecaoSoap;
  /** Autoral: "Subjetivo", "Objetivo", "Avaliação", "Plano". */
  readonly titulo: string;
  readonly itens: readonly ItemDoRegistro[];
}

/** RN-03, RN-08, RN-09, RN-13: o que o registro precisa declarar sobre si mesmo. */
export type TipoDeNotaDoRegistro =
  "ORGANIZACAO_EM_SOAP" | "FICHAS_AUSENTES" | "SUPRESSAO_DE_CAMPO";

export interface NotaDoRegistro {
  readonly tipo: TipoDeNotaDoRegistro;
  readonly mensagem: string;
}

/** RN-05: qual idade governou a escolha da ficha, dita por extenso no registro. */
export interface IdadeDeclarada {
  readonly especie: EspecieDeIdade;
  readonly texto: string;
}

export interface FichaDoRegistro {
  readonly id: string;
  readonly titulo: string;
  readonly pagina: number;
}

export interface RegistroDaConsulta {
  readonly tipo: "registro";
  readonly ficha: FichaDoRegistro;
  readonly idadeDeclarada: IdadeDeclarada;
  /** Só as seções que têm item (RN-10): seção vazia é omitida inteira, cabeçalho incluído. */
  readonly secoes: readonly SecaoDoRegistro[];
  readonly notas: readonly NotaDoRegistro[];
  /** Nunca vazia — invariante 3 da família de domínios. */
  readonly referencias: readonly ReferenciaClinica[];
}

/**
 * RN-04: o motor INFORMA qual ficha a idade indica; quem escolhe é o prescritor (ADR 0005).
 * A espécie de idade vai junto para que o registro a declare sem a tela reescrever a regra.
 */
export interface SugestaoDeFicha {
  readonly ficha: Ficha;
  readonly especieDeIdade: EspecieDeIdade;
  readonly diasDeVida: number;
}

/**
 * A entrada da fachada: tudo o que o registro precisa, e nada além (RN-12).
 *
 * `avaliacao` chega PRONTA da fachada da feature 017 (RN-11, D-08). Este domínio não
 * recalcula escore nenhum: transpõe o que aquele motor já emitiu, com a referência que ele
 * já carimbou. Ausente significa que o prescritor não abriu o painel de crescimento, e isso
 * não é erro — é a mesma disciplina de RN-10, um passo acima.
 */
export interface EntradaDoRegistro {
  readonly ficha: Ficha;
  readonly contexto: ContextoDaConsulta;
  readonly preenchimento: Preenchimento;
  readonly avaliacao?: ResultadoAvaliacao;
}
