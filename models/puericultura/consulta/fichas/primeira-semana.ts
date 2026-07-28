// Consulta da 1.ª Semana, transcrita da p. 68 da Caderneta da Criança (feature 020, T017).
//
// TRANSCRIÇÃO LITERAL, sem exceção. Os rótulos abaixo reproduzem a página byte a byte,
// inclusive onde a diagramação da fonte destoa da norma — "Dificuldade para amamentar ?"
// leva o espaço antes da interrogação porque é assim que a caderneta imprime, e a exceção
// que `MD-0015` autoriza alcança concordância e nada mais. Quem confere a tela contra a
// página vê o mesmo texto, que é o ponto.
//
// TRÊS DECISÕES DE TRANSCRIÇÃO, valendo para os dez módulos:
//
//  1. **O marcador de nota de rodapé não é texto.** A fonte imprime "PC*:" e explica o
//     asterisco embaixo, remetendo aos gráficos; o rótulo transcrito é "PC". A remissão de
//     página não entra por RN-17: a tela substitui o "anotar nos gráficos" pelo acesso à
//     calculadora, e a fonte ainda se contradiz sobre quais páginas são.
//  2. **A orientação ao profissional entra como `orientacao`, não como rótulo.** É o que a
//     caderneta manda investigar, e a ficha também serve de roteiro; mas ela orienta, não
//     registra, e por isso fica fora do texto copiado.
//  3. **Sinal de alerta se reparte por quem o constata.** Vai para O o campo cuja
//     verificação exige exame ou medição — inspeção, ausculta, palpação, aferição —, e para
//     S o sintoma relatado pelos cuidadores. É a leitura de RN-09, que põe em S o sinal
//     "referido" e em O os "demais achados de exame".
import { camposDaPagina } from "./campos.ts";
import type { Ficha } from "../tipos";

const PAGINA = 68;
const { marcacao, escolha, medida, texto, secao } = camposDaPagina(PAGINA);

export const PRIMEIRA_SEMANA: Ficha = {
  id: "primeira-semana",
  titulo: "Consulta da 1ª Semana",
  pagina: PAGINA,
  // Do nascimento à véspera do primeiro mês (mês médio de 30,4375 dias, arredondado).
  faixaEmDias: { de: 0, ate: 29 },
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
          "Leite materno exclusivo (LME)",
          "Leite materno e leite artificial (LM+LA)",
          "Leite artificial (LA)",
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

    secao(3, "Sinais de alerta", [
      marcacao({
        id: "coto-umbilical",
        rotulo: "Coto umbilical infeccionado",
        secaoSoap: "O",
      }),
      marcacao({ id: "ictericia", rotulo: "Icterícia", secaoSoap: "O" }),
      marcacao({
        id: "diarreia-vomitos",
        rotulo: "Diarreia/Vômitos",
        secaoSoap: "S",
      }),
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
      marcacao({
        id: "ausculta-cardiaca",
        rotulo: "Ausculta cardíaca alterada/Cianose",
        secaoSoap: "O",
      }),
      texto({ id: "outros-sinais", rotulo: "Outros:", secaoSoap: "S" }),
    ]),

    secao(4, "Vacinas", [
      marcacao({ id: "hepatite-b", rotulo: "Hepatite B", secaoSoap: "O" }),
      marcacao({ id: "bcg", rotulo: "BCG", secaoSoap: "O" }),
    ]),

    secao(5, "Desenvolvimento e laços de afeto", [
      texto({
        id: "desenvolvimento-lacos",
        rotulo: "Desenvolvimento e laços de afeto",
        secaoSoap: "O",
        orientacao:
          "Avaliar a rede de apoio materno, participação dos pais, atenção à reação do bebê. Observar se a mãe aproveita o momento da mamada/alimentação para aconchegar, tocar, olhar e conversar com o bebê.",
      }),
    ]),
  ],
};
