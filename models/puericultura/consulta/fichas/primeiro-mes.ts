// Consulta do 1.º Mês, transcrita da p. 69 da Caderneta da Criança (feature 020, T018).
// As três decisões de transcrição valem como declaradas em `primeira-semana.ts`.
//
// DOIS ACHADOS DESTA PÁGINA, registrados aqui para que ninguém os tome por erro nosso:
//
//  · A fonte imprime "Orelhinha - Exame autidivo", com a troca de letras. É desvio de
//    DIGITAÇÃO, não de concordância, e portanto fora da exceção estreita que `MD-0015`
//    autoriza. Fica como a página o traz, e o oráculo de T007 confirma a procedência.
//  · O quadro da triagem neonatal cruza três colunas — realizado, resultado e encaminhamento
//    — para cada um dos quatro testes. Entra como um campo de escolha por teste, com o
//    resultado publicado nas opções e o encaminhamento no complemento: teste sem resposta é
//    teste não averiguado, que é a mesma disciplina de RN-10 aplicada a uma tabela.
import { camposDaPagina } from "./campos.ts";
import type { Ficha } from "../tipos";

const PAGINA = 69;
const { marcacao, escolha, medida, texto, secao } = camposDaPagina(PAGINA);

const RESULTADO_DA_TRIAGEM = ["Normal", "Alterado"];

const NIVEIS_DO_DESENVOLVIMENTO = [
  "Adequado para idade",
  "Alerta para o desenvolvimento",
  "Provável atraso no desenvolvimento",
];

export const PRIMEIRO_MES: Ficha = {
  id: "primeiro-mes",
  titulo: "Consulta do 1º Mês",
  pagina: PAGINA,
  faixaEmDias: { de: 30, ate: 60 },
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

    secao(2, "Triagem neonatal - Testes", [
      escolha({
        id: "pezinho",
        rotulo: "Pezinho",
        secaoSoap: "O",
        opcoes: RESULTADO_DA_TRIAGEM,
        aceitaComplemento: true,
        orientacao:
          "AB-Atenção Básica; CER-Centro Especializado em Reabilitação; SSA - Serviço de Saúde Auditiva; SSE - Serviço de Saúde especializado (Oftalmológico – Auditivo – Outros).",
      }),
      escolha({
        id: "orelhinha",
        rotulo: "Orelhinha - Exame autidivo",
        secaoSoap: "O",
        opcoes: RESULTADO_DA_TRIAGEM,
        aceitaComplemento: true,
      }),
      escolha({
        id: "olhinho",
        rotulo: "Olhinho - Reflexo olho vermelho",
        secaoSoap: "O",
        opcoes: RESULTADO_DA_TRIAGEM,
        aceitaComplemento: true,
      }),
      escolha({
        id: "coracaozinho",
        rotulo: "Coraçãozinho",
        secaoSoap: "O",
        opcoes: RESULTADO_DA_TRIAGEM,
        aceitaComplemento: true,
      }),
    ]),

    secao(3, "Aleitamento/alimentação", [
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
        rotulo: "Dificuldade para amamentar?",
        secaoSoap: "S",
      }),
      marcacao({
        id: "parou-amamentar",
        rotulo: "Parou de amamentar?",
        secaoSoap: "S",
      }),
      texto({ id: "idade-desmame", rotulo: "Com que idade?", secaoSoap: "S" }),
      texto({
        id: "motivo-desmame",
        rotulo: "Em caso de desmame precoce descreva o motivo:",
        secaoSoap: "S",
      }),
    ]),

    secao(4, "Sinais de alerta", [
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
        rotulo: "Dificuldades para respirar (FR>60 ou <30)",
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
      texto({ id: "outros-sinais", rotulo: "Outros:", secaoSoap: "S" }),
    ]),

    secao(5, "Exame ocular", [
      marcacao({
        id: "abertura-ocular",
        rotulo: "Abertura ocular normal",
        secaoSoap: "O",
      }),
      marcacao({ id: "pupilas", rotulo: "Pupilas normais", secaoSoap: "O" }),
      marcacao({ id: "estrabismo", rotulo: "Estrabismo", secaoSoap: "O" }),
      marcacao({
        id: "segue-olhar",
        rotulo: "Segue com o olhar",
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

    secao(8, "Atenção e cuidados especiais nesta fase", [
      texto({
        id: "tempo-de-sono",
        rotulo: "Tempo de sono em 24 horas",
        secaoSoap: "S",
      }),
      texto({
        id: "posicao-no-sono",
        rotulo: "Posição no sono quando deitado no berço:",
        secaoSoap: "S",
      }),
      texto({
        id: "barriga-para-cima",
        rotulo: "De barriga para cima?",
        secaoSoap: "S",
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
        id: "violencias",
        rotulo: "Sinais de violências/negligências",
        secaoSoap: "O",
      }),
      marcacao({
        id: "acidentes-domesticos",
        rotulo: "Acidentes domésticos",
        secaoSoap: "P",
      }),
    ]),

    secao(9, "Laços de afeto", [
      texto({
        id: "lacos-de-afeto",
        rotulo: "Laços de afeto",
        secaoSoap: "O",
        orientacao:
          "Avaliar a rede de apoio materno, participação dos pais, atenção à reação do bebê. Investigar depressão materna. Observar se a mãe aproveita o momento da mamada para aconchegar e conversar com o bebê.",
      }),
    ]),
  ],
};
