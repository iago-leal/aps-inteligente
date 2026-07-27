// Classe declarada de cada literal candidato de `models/puericultura/**` (T009).
//
// É o módulo mais delicado da coleção, porque aqui convivem as três classes no mesmo
// arquivo: `fonte-clinica.ts` traz os vinte e cinco rótulos TRANSCRITOS da Caderneta da
// Criança, a `NOTA_PROVENIENCIA` AUTORAL que os acompanha, e os códigos de ausência que são
// puro identificador. Nenhuma dessas três se deduz do caminho do arquivo — é o exemplo que
// RN-02 tem em mente.
//
// Os dois rótulos de concordância de `MD-0015` foram corrigidos por T037, e é a única
// exceção que este projeto abriu à transcrição literal. Eles aparecem abaixo por
// `citacaoCorrigida`, que exige as três coisas juntas: o texto novo, a forma impressa que
// ele substitui e a ficha que autorizou o afastamento. A parada do gerador na troca não foi
// acidente — foi o momento em que a classe teve de ser decidida de novo, e foi.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { MapaDeClasses } from "../classificacao.mts";
import {
  autorais,
  citacaoCorrigida,
  citacoes,
  identificadores,
  internas,
} from "./declarar.mts";

const CADERNETA = "Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020)";

export const MAPA: MapaDeClasses = {
  "models/puericultura/calculadora.ts": [
    ...autorais([
      "Idade gestacional ao nascer não informada: a criança foi tratada como nascida a termo e nenhuma correção de idade foi aplicada. Se ela nasceu pré-termo, informe a idade gestacional: a classificação pode mudar.",
    ]),
    ...internas(["Resultado sem referência clínica"]),
    ...identificadores(["IMC_INEXISTENTE_NO_PRETERMO", "MEDIDA_NAO_INFORMADA"]),
  ],

  "models/puericultura/elegibilidade.ts": [
    ...autorais([
      "O gráfico de perímetro cefálico da Caderneta da Criança cobre de 0 a 2 anos. Acima dessa idade a fonte não publica referência, e os demais índices seguem válidos.",
    ]),
    ...citacoes(`${CADERNETA}, p. 88`, [
      "p. 88, gráfico de perímetro cefálico para idade de 0 a 2 anos",
    ]),
    ...identificadores([
      "ABAIXO_DA_CURVA_DE_PRETERMO",
      "IDADE_FORA_DA_COBERTURA",
      "PC_ACIMA_DE_2_ANOS",
    ]),
  ],

  "models/puericultura/fonte-clinica.ts": [
    // A identificação da edição, como a caderneta se nomeia na folha de rosto.
    ...citacoes(CADERNETA, [
      "Caderneta da Criança (Ministério da Saúde, 2.ª ed., Brasília, 2020)",
    ]),

    // RN-04, pp. 89, 92, 95 — peso para idade, quatro faixas.
    ...citacoes(`${CADERNETA}, pp. 89, 92, 95`, [
      "Peso elevado para idade",
      "Peso adequado para idade",
      "Baixo peso para idade",
      "Muito baixo peso para idade",
    ]),

    // RN-05, p. 90 — comprimento, até 2 anos. Os dois primeiros são os rótulos de §2.4, e
    // são os ÚNICOS literais de citação de todo o produto que se afastam da fonte. O
    // terceiro fica intocado: "baixo" já concorda com o masculino, e a lista de §2.4 o
    // arrola explicitamente entre os que a exceção NÃO alcança.
    citacaoCorrigida(
      `${CADERNETA}, p. 90`,
      "Comprimento adequada para idade",
      "Comprimento adequado para idade",
      "MD-0015",
    ),
    citacaoCorrigida(
      `${CADERNETA}, p. 90`,
      "Baixa comprimento para idade",
      "Baixo comprimento para idade",
      "MD-0015",
    ),
    ...citacoes(`${CADERNETA}, p. 90`, ["Muito baixo comprimento para idade"]),

    // RN-05, pp. 93, 96 — estatura, de 2 anos em diante.
    ...citacoes(`${CADERNETA}, pp. 93, 96`, [
      "Estatura adequada para idade",
      "Baixa estatura para idade",
      "Muito baixa estatura para idade",
    ]),

    // RN-06, pp. 91, 94, 97 — IMC. Os cinco rótulos comuns às duas tabelas aparecem uma
    // vez só: mesmo texto, mesmo arquivo, mesma classe (chave arquivo + texto).
    ...citacoes(`${CADERNETA}, pp. 91, 94, 97`, [
      "Obesidade grave",
      "Obesidade",
      "Sobrepeso",
      "Risco de sobrepeso",
      "Eutrofia",
      "Magreza",
      "Magreza acentuada",
    ]),

    // RN-07, p. 88 — perímetro cefálico. A fonte usa a sigla, e alterna o artigo.
    ...citacoes(`${CADERNETA}, p. 88`, [
      "PC acima do esperado para a idade",
      "PC adequado para idade",
      "PC abaixo do esperado para idade",
    ]),

    // Nomes dos gráficos, como a caderneta os intitula: entram na localização da
    // referência, e é por isso que são citação e não o rótulo neutro da tela (`MD-0012`).
    ...citacoes(`${CADERNETA}, pp. 85–97, títulos dos gráficos`, [
      "peso para idade",
      "comprimento/estatura para idade",
      "IMC para idade",
      "perímetro cefálico para idade",
    ]),

    // Localizações bibliográficas.
    ...citacoes(`${CADERNETA}, pp. 85–97`, [
      "p. 87, Curvas Internacionais de Crescimento para Crianças Nascidas Pré-Termo (INTERGROWTH-21st), de 27 a 64 semanas",
      "p. 86, cálculo da idade corrigida do recém-nascido pré-termo: 40 semanas menos a IG ao nascer, descontado da idade cronológica",
      "p. 85, diferença de 0,7 cm entre a estatura medida deitada e em pé",
      "pp. 85–97, Acompanhando o Crescimento: gráficos de 0 a 10 anos, e de 0 a 2 anos no perímetro cefálico",
    ]),

    // As duas notas são do produto, não da caderneta. A primeira diz o que o número em
    // tela não diz sozinho; a segunda declara ao leitor o afastamento autorizado acima, e
    // é a metade sem a qual a correção seria violação de RN-09 em vez de cumprimento dela.
    // Ambas autorais, e alcançadas pela norma.
    ...autorais([
      "Dois rótulos de classificação são exibidos com a concordância corrigida: onde a Caderneta da Criança imprime “Comprimento adequada para idade” e “Baixa comprimento para idade”, esta tela lê “Comprimento adequado para idade” e “Baixo comprimento para idade”. A correção alcança a concordância e nada mais: os demais rótulos, inclusive “Muito baixo comprimento para idade” e a elipse do artigo em “para idade”, são reproduzidos como a fonte os imprime.",
      "A classificação vale para esta medição isolada. A Caderneta da Criança avalia o crescimento pela tendência de medidas sucessivas — vários pontos unidos formam a linha que mostra como a criança evolui —, e um ponto único não substitui essa leitura. Os escores usam as curvas da Organização Mundial da Saúde (padrões de 2006 para 0 a 5 anos e referência de 2007 para 5 a 10 anos) e, na criança nascida pré-termo entre 27 e 64 semanas pós-menstruais, as curvas INTERGROWTH-21st reproduzidas na p. 87. A tabela é lida na linha publicada, por dia até os 5 anos e por mês completo depois, sem interpolação: nenhum valor do cálculo é estimado.",
    ]),
  ],

  "models/puericultura/intergrowth/escore.ts": [
    ...identificadores(["IMC_INEXISTENTE_NO_PRETERMO"]),
  ],

  // Fragmentos do aviso de conversão de posição, montados na mensagem exibida.
  "models/puericultura/medidas.ts": [
    ...autorais([
      "aferida deitada em criança de 2 anos ou mais",
      "aferida em pé em criança menor de 2 anos",
    ]),
  ],

  "models/puericultura/oms/leitura.ts": [
    ...identificadores([
      "PERIMETRO_CEFALICO_ACIMA_DE_2_ANOS",
      "IDADE_ACIMA_DA_COBERTURA",
    ]),
  ],

  // RN-02 em estado puro: nenhum guia impresso escreve "Informe ao menos uma medida".
  "models/puericultura/validacao.ts": [
    ...autorais([
      "Peso",
      "Comprimento/estatura",
      "Perímetro cefálico",
      "Informe ao menos uma medida: peso, comprimento/estatura ou perímetro cefálico.",
      "Informe se a medida foi aferida deitada (comprimento) ou em pé (estatura): a conversão de 0,7 cm depende disso.",
      "Data de nascimento inválida: informe uma data real no formato AAAA-MM-DD.",
      "Data da medição inválida: informe uma data real no formato AAAA-MM-DD.",
      "Data de nascimento posterior à data da medição: verifique as duas datas.",
      "Sexo inválido: informe masculino ou feminino. As curvas de referência são específicas por sexo.",
    ]),
  ],
};
