// Consulta do 4.º Mês, transcrita da p. 71 da Caderneta da Criança (feature 020, T020).
// As três decisões de transcrição valem como declaradas em `primeira-semana.ts`, e o par de
// rótulos de "Parou de amamentar" segue o de `segundo-mes.ts`: as duas tiragens divergem no
// espaço antes da interrogação, e cada tela mostra o que a sua caderneta traz.
import { camposDaPagina } from "./campos.ts";
import type { Ficha } from "../tipos";

const PAGINA = 71;
const { marcacao, escolha, medida, texto, secao } = camposDaPagina(PAGINA);

const NIVEIS_DO_DESENVOLVIMENTO = [
  "Adequado para idade",
  "Alerta para o desenvolvimento",
  "Provável atraso no desenvolvimento",
];

export const QUARTO_MES: Ficha = {
  id: "quarto-mes",
  titulo: "Consulta do 4º Mês",
  pagina: PAGINA,
  faixaEmDias: { de: 122, ate: 182 },
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
        id: "hernia",
        rotulo: "Hérnia inguinal/umbilical",
        secaoSoap: "O",
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

    secao(5, "Desenvolvimento", [
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

    secao(6, "Verificações importantes", [
      marcacao({
        id: "vacinas",
        rotulo: "Vacinas de acordo com o calendário",
        secaoSoap: "A",
      }),
    ]),

    secao(7, "Atenção e cuidados especiais nesta fase", [
      texto({
        id: "funcionamento-intestino",
        rotulo: "Funcionamento do intestino",
        secaoSoap: "S",
      }),
      texto({
        id: "higiene",
        rotulo: "Higiene e cuidados gerais",
        secaoSoap: "P",
      }),
      texto({
        id: "soro-nasal",
        rotulo: "Uso de soro nasal de rotina",
        secaoSoap: "P",
      }),
      texto({
        id: "saude-bucal",
        rotulo:
          "Orientações sobre saúde bucal do bebê: higiene bucal, nascimento dos dentes, uso de chupeta ou bico, etc.",
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

    secao(8, "Laços de afeto", [
      texto({
        id: "lacos-de-afeto",
        rotulo: "Laços de afeto",
        secaoSoap: "O",
        orientacao:
          "Avaliar a rede de apoio materno, participação dos pais, atenção à reação do bebê. Apoiar os cuidadores na estimulação do bebê. Observar se os cuidadores aproveitam os momentos da alimentação e outros para aconchegar, tocar, olhar e conversar com o bebê. Estimular as brincadeiras, canções e leituras.",
      }),
    ]),
  ],
};
