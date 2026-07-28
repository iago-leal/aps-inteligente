// Consulta do 9.º Mês, transcrita da p. 72 da Caderneta da Criança (feature 020, T022).
// Divide a página com a do 6.º Mês, e as duas diferem em três pontos, todos da fonte: aqui a
// pergunta sobre alimentação é "O que a criança está comendo?" em vez de "Quais alimentos
// foram introduzidos?", o tremor vem no singular, e a remissão dos gráficos deixa de citar a
// p. 87 — divergência que RN-17 registrou e que não se transcreve, porque a tela substitui o
// "anotar nos gráficos" pelo acesso à calculadora de crescimento.
import { camposDaPagina } from "./campos.ts";
import type { Ficha } from "../tipos";

const PAGINA = 72;
const { marcacao, escolha, medida, texto, secao } = camposDaPagina(PAGINA);

const NIVEIS_DO_DESENVOLVIMENTO = [
  "Adequado para idade",
  "Alerta para o desenvolvimento",
  "Provável atraso no desenvolvimento",
];

export const NONO_MES: Ficha = {
  id: "nono-mes",
  titulo: "Consulta do 9º Mês",
  pagina: PAGINA,
  faixaEmDias: { de: 274, ate: 364 },
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
        opcoes: ["LM", "LA"],
        aceitaComplemento: true,
      }),
      marcacao({
        id: "parou-amamentar",
        rotulo: "Parou de amamentar?",
        secaoSoap: "S",
      }),
      texto({ id: "idade-desmame", rotulo: "Com que idade?", secaoSoap: "S" }),
      texto({
        id: "o-que-esta-comendo",
        rotulo: "O que a criança está comendo?",
        secaoSoap: "S",
      }),
      texto({
        id: "porcoes-de-fruta",
        rotulo: "Quantas porções de fruta/dia?",
        secaoSoap: "S",
      }),
      marcacao({
        id: "industrializado",
        rotulo: "Recebe algum tipo de alimento industrializado?",
        secaoSoap: "S",
      }),
    ]),

    secao(3, "Presença de", [
      marcacao({ id: "diarreia", rotulo: "Diarreia", secaoSoap: "S" }),
      marcacao({ id: "vomitos", rotulo: "Vômitos", secaoSoap: "S" }),
      marcacao({ id: "febre", rotulo: "Febre (≥37,5°C)", secaoSoap: "O" }),
      marcacao({ id: "sibilancias", rotulo: "Sibilâncias", secaoSoap: "O" }),
      marcacao({
        id: "dificuldade-respirar",
        rotulo: "Dificuldades para respirar (FR>50 ou <30)",
        secaoSoap: "O",
      }),
      marcacao({
        id: "convulsoes",
        rotulo: "Convulsões ou tremor",
        secaoSoap: "S",
      }),
      texto({ id: "outros-sinais", rotulo: "Outros:", secaoSoap: "S" }),
    ]),

    secao(4, "Desenvolvimento", [
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

    secao(5, "Atenção e cuidados especiais nesta fase", [
      marcacao({
        id: "vacinas",
        rotulo: "Vacinas de acordo com o calendário",
        secaoSoap: "A",
      }),
      marcacao({
        id: "suplementacao-ferro",
        rotulo: "Suplementação de Fe/micronutrientes",
        secaoSoap: "P",
      }),
      marcacao({
        id: "suplementacao-vitamina-a",
        rotulo: "Suplementação de vitamina A",
        secaoSoap: "P",
      }),
      marcacao({
        id: "odontologico",
        rotulo: "Acompanhamento odontológico",
        secaoSoap: "P",
      }),
      marcacao({
        id: "acidentes-domesticos",
        rotulo: "Acidentes domésticos",
        secaoSoap: "P",
      }),
      texto({
        id: "violencias",
        rotulo: "Sinais de violências/negligências",
        secaoSoap: "O",
      }),
    ]),

    secao(6, "Laços de afeto", [
      texto({ id: "lacos-de-afeto", rotulo: "Laços de afeto", secaoSoap: "O" }),
    ]),
  ],
};
