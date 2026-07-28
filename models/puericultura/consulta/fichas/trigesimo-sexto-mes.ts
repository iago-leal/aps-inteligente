// Consulta do 36.º Mês, transcrita da p. 74 da Caderneta da Criança (feature 020, T026).
// As três decisões de transcrição valem como declaradas em `primeira-semana.ts`.
//
// Divide a página com a do 24.º Mês, e a fonte as imprime com os mesmos campos: estatura no
// lugar do comprimento e o IMC entre as medidas, como em toda ficha a partir dos dois anos.
//
// É a ÚLTIMA consulta datada da caderneta, e por isso a sua faixa recolhe toda idade acima
// dela — a fonte fecha a seção mandando "continuar utilizando a folha de registro de medidas
// e gráficos", que é dizer que não há décima primeira ficha a sugerir.
import { camposDaPagina } from "./campos.ts";
import type { Ficha } from "../tipos";

const PAGINA = 74;
const { marcacao, escolha, medida, texto, secao } = camposDaPagina(PAGINA);

const NIVEIS_DO_DESENVOLVIMENTO = [
  "Adequado para idade",
  "Alerta para o desenvolvimento",
  "Provável atraso no desenvolvimento",
];

export const TRIGESIMO_SEXTO_MES: Ficha = {
  id: "trigesimo-sexto-mes",
  titulo: "Consulta do 36º Mês",
  pagina: PAGINA,
  faixaEmDias: { de: 1096, ate: Number.MAX_SAFE_INTEGER },
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
        id: "estatura",
        rotulo: "Estatura",
        secaoSoap: "O",
        unidade: "cm",
        vinculoAntropometrico: "comprimento",
      }),
      // Sem vínculo antropométrico: o IMC não é medida aferida, e a calculadora da feature
      // 017 o deriva do peso e da estatura. O campo existe porque a página o imprime.
      medida({ id: "imc", rotulo: "IMC", secaoSoap: "O", unidade: "kg/m²" }),
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
