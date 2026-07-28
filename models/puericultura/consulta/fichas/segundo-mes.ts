// Consulta do 2.º Mês, transcrita da p. 70 da Caderneta da Criança (feature 020, T019).
// As três decisões de transcrição valem como declaradas em `primeira-semana.ts`.
//
// A SUPRESSÃO DE `MD-0026`, e por que ela mora aqui. A fonte imprime "Criptorquidia" entre
// os sinais de alerta desta página nas DUAS tiragens, inclusive na da menina — conferido nos
// dois PDFs. É desvio de CONTEÚDO, e portanto fora da exceção de concordância de `MD-0015`;
// a arbitragem de 28/07 autorizou suprimi-lo na ficha feminina sob a condição de a supressão
// ser declarada ao leitor, e a declaração é `NOTA_SUPRESSAO_DE_CAMPO`. A restrição entra
// como `sexos` no DADO, e não como condicional na tela: quem procurar por que o campo sumiu
// procura na ficha, que é onde ele é declarado.
import { camposDaPagina, SO_MASCULINO } from "./campos.ts";
import type { Ficha } from "../tipos";

const PAGINA = 70;
const { marcacao, escolha, medida, texto, secao } = camposDaPagina(PAGINA);

const NIVEIS_DO_DESENVOLVIMENTO = [
  "Adequado para idade",
  "Alerta para o desenvolvimento",
  "Provável atraso no desenvolvimento",
];

export const SEGUNDO_MES: Ficha = {
  id: "segundo-mes",
  titulo: "Consulta do 2º Mês",
  pagina: PAGINA,
  faixaEmDias: { de: 61, ate: 121 },
  secoes: [
    secao(1, "Medidas", [
      medida({
        id: "perimetro-cefalico",
        rotulo: "PC",
        secaoSoap: "O",
        unidade: "cm",
        vinculoAntropometrico: "perimetroCefalico",
      }),
      medida({
        id: "peso",
        rotulo: "Peso",
        secaoSoap: "O",
        unidade: "g",
        vinculoAntropometrico: "peso",
      }),
      medida({
        id: "comprimento",
        rotulo: "Comprimento",
        secaoSoap: "O",
        unidade: "cm",
        vinculoAntropometrico: "comprimento",
      }),
    ]),

    secao(2, "Aleitamento/alimentação", [
      escolha({
        id: "aleitamento",
        rotulo: "Aleitamento/alimentação",
        secaoSoap: "S",
        opcoes: [
          "Leite materno exclusivo",
          "Leite materno e leite artificial",
          "Leite artificial",
        ],
        aceitaComplemento: true,
      }),
      marcacao({
        id: "dificuldade-amamentar",
        rotulo: "Dificuldade para amamentar ?",
        secaoSoap: "S",
      }),
      // As duas tiragens divergem no espaço antes da interrogação, e a divergência é da
      // diagramação, não da língua. O par de rótulos de D-06 dá conta dela sem que nenhuma
      // das duas formas precise ser corrigida: cada tela mostra o que a sua caderneta traz.
      marcacao({
        id: "parou-amamentar",
        rotulo: "Parou de amamentar ?",
        rotuloFeminino: "Parou de amamentar?",
        secaoSoap: "S",
      }),
      texto({ id: "idade-desmame", rotulo: "Com que idade?", secaoSoap: "S" }),
      texto({
        id: "motivo-desmame",
        rotulo: "Em caso de desmame precoce descreva o motivo:",
        secaoSoap: "S",
      }),
    ]),

    secao(3, "Sinais de alerta", [
      marcacao({
        id: "secrecao-nasal",
        rotulo: "Secreção nasal",
        secaoSoap: "S",
      }),
      marcacao({ id: "colica", rotulo: "Cólica/Engasgos", secaoSoap: "S" }),
      marcacao({
        id: "diarreia",
        rotulo: "Diarreia/Constipação",
        secaoSoap: "S",
      }),
      marcacao({ id: "vomitos", rotulo: "Vômitos/Golfadas", secaoSoap: "S" }),
      marcacao({
        id: "dificuldade-respirar",
        rotulo: "Dificuldades para respirar (FR>50 ou <30)",
        secaoSoap: "O",
      }),
      marcacao({ id: "febre", rotulo: "Febre (≥37,5°C)", secaoSoap: "O" }),
      marcacao({
        id: "hipotermia",
        rotulo: "Hipotermia (<36,5°C)",
        secaoSoap: "O",
      }),
      marcacao({
        id: "convulsoes",
        rotulo: "Convulsões ou movimentos anormais",
        secaoSoap: "S",
      }),
      marcacao({
        id: "criptorquidia",
        rotulo: "Criptorquidia",
        secaoSoap: "O",
        sexos: SO_MASCULINO,
      }),
      texto({ id: "outros-sinais", rotulo: "Outros:", secaoSoap: "S" }),
    ]),

    secao(4, "Exame ocular", [
      marcacao({
        id: "globo-ocular",
        rotulo: "Globo ocular de tamanho normal",
        secaoSoap: "O",
      }),
      marcacao({ id: "pupilas", rotulo: "Pupilas normais", secaoSoap: "O" }),
      marcacao({ id: "estrabismo", rotulo: "Estrabismo", secaoSoap: "O" }),
      marcacao({
        id: "secrecao-ocular",
        rotulo: "Secreção ocular",
        secaoSoap: "O",
      }),
    ]),

    secao(5, "Verificações importantes", [
      marcacao({
        id: "vacinas",
        rotulo: "Vacinas de acordo com o calendário",
        secaoSoap: "A",
      }),
    ]),

    secao(6, "Atenção e cuidados especiais nesta fase", [
      texto({
        id: "posicao-no-sono",
        rotulo: "Posição no sono",
        secaoSoap: "S",
      }),
      texto({ id: "tempo-de-sono", rotulo: "Tempo de sono", secaoSoap: "S" }),
      texto({
        id: "troca-de-posicao",
        rotulo: "Troca de posição durante o dia",
        secaoSoap: "P",
      }),
      texto({
        id: "funcionamento-intestino",
        rotulo: "Funcionamento do intestino e cólicas",
        secaoSoap: "S",
      }),
      texto({
        id: "higiene",
        rotulo: "Higiene e cuidados gerais",
        secaoSoap: "P",
      }),
      texto({
        id: "saude-bucal",
        rotulo:
          "Orientações sobre saúde bucal do bebê: higiene bucal, uso de chupeta ou bico",
        secaoSoap: "P",
      }),
      texto({
        id: "soro-nasal",
        rotulo: "Uso de soro fisiológico nasal",
        secaoSoap: "P",
      }),
      texto({
        id: "acidentes-domesticos",
        rotulo: "Acidentes domésticos",
        secaoSoap: "P",
      }),
      marcacao({
        id: "violencias",
        rotulo: "Sinais de violências/negligências",
        secaoSoap: "O",
      }),
    ]),

    secao(7, "Desenvolvimento", [
      texto({
        id: "interacao",
        rotulo: "Observação da interação mãe-filho",
        rotuloFeminino: "Observação da interação mãe-filha",
        secaoSoap: "O",
      }),
      escolha({
        id: "classificacao-desenvolvimento",
        rotulo: "Desenvolvimento",
        secaoSoap: "A",
        opcoes: NIVEIS_DO_DESENVOLVIMENTO,
      }),
      texto({
        id: "observacoes-desenvolvimento",
        rotulo: "Observações:",
        secaoSoap: "O",
      }),
    ]),

    secao(8, "Laços de afeto", [
      texto({
        id: "lacos-de-afeto",
        rotulo: "Laços de afeto",
        secaoSoap: "O",
        orientacao:
          "Avaliar a rede de apoio materno, participação dos pais, atenção à reação do bebê. Apoiar os cuidadores na estimulação do bebê. Observar se a mãe aproveita o momento da mamada para aconchegar, tocar, olhar e conversar com o bebê.",
      }),
    ]),
  ],
};
