// Classe declarada de cada literal candidato de `interface/**` (T012).
//
// A camada é predominantemente autoral, e as três exceções valem por si:
//
//   · `cardiologia/referencias.tsx` mistura ENQUADRAMENTO AUTORAL — os títulos das quatro
//     seções — com CONTEÚDO CITADO do TeleCondutas, que ali é reproduzido para consulta
//     "fora do cálculo desta ferramenta", como o próprio rodapé do componente diz;
//   · `cardiologia/formulario.tsx` transcreve os três critérios do Quadro 1 como rótulos
//     de caixa de seleção: o enunciado do critério é da fonte, e não nosso;
//   · `risco-cardiovascular/resultado.tsx` transcreve as quatro categorias de risco do
//     2019 ACC/AHA, cortes incluídos.
//
// Nos demais arquivos, o que parece citação em geral não é. Os títulos dos índices em
// `puericultura/resultado.tsx` são AUTORAIS por decisão de `MD-0012`: o rótulo clínico é do
// domínio, e a tela nomeia o índice pela forma neutra, com artigo — "Peso para a idade",
// e não "Peso adequado para idade". Nome de fonte e nome de fármaco também são autorais:
// permanecem por serem nome próprio ou termo consagrado, não por serem citação.
//
// Fragmentos de pontuação — ":", ".", "—", "·", "%", "a" — entram por posição sintática,
// porque são texto solto entre tags que a montagem da frase interrompe. São autorais como o
// resto da frase de que fazem parte, e é bom que sejam: acrescentar um dois-pontos onde não
// havia é alteração de forma, e a norma existe para que ela não passe em silêncio.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.

import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, citacoes, glifos, identificadores } from "./declarar.mts";

const TELECONDUTAS =
  "TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017)";

export const MAPA: MapaDeClasses = {
  // ─── interface/calculadora ──────────────────────────────────────────────────────

  "interface/calculadora/antidiabeticos-orais.tsx": [
    ...autorais([
      "Dose de metformina inválida: use apenas números.",
      "TFG inválida: use apenas números.",
      "Antidiabéticos orais e função renal",
      "Dose atual de metformina (mg/dia), opcional",
      "TFG (mL/min/1,73 m²), opcional",
    ]),
  ],

  "interface/calculadora/esquema-atual.tsx": [
    ...autorais([
      "Antes do café",
      "Antes do almoço",
      "Antes do jantar",
      "Ao deitar",
      "Esquema atual de insulina",
      "Insulina",
      "NPH",
      "Regular",
      "Momento da aplicação",
      "Dose (UI)",
      "Remover aplicação",
      "Adicionar aplicação",
    ]),
  ],

  "interface/calculadora/formatar-plano.ts": [
    ...autorais([
      "Plano elaborado com apoio de ferramenta de decisão clínica; a prescrição é responsabilidade do médico.",
      "A dose exata é fixada pelo prescritor.",
      "Recomendações ao prescritor:",
      "Fonte clínica:",
    ]),
  ],

  "interface/calculadora/formulario.tsx": [
    ...autorais([
      "Informe ao menos uma glicemia capilar para a titulação.",
      "Informe o esquema de insulina atual.",
      "Modo de cálculo",
      "Início de insulinização",
      "Titulação de dose",
      "Dados do paciente",
      "Peso (kg)",
      "HbA1c (%), opcional",
      "Uso de sulfonilureia",
      "Não informado",
      "Sim",
      "Não",
      "Calcular",
    ]),
  ],

  "interface/calculadora/glicemias-por-momento.tsx": [
    ...autorais([
      "Jejum",
      "Antes do almoço (AA)",
      "Antes do jantar (AJ)",
      "Ao deitar (AD)",
      "Glicemias capilares por momento",
      "Registre uma ou mais aferições por campo, separadas por espaço (ex.: 98,5 130 210). Deixe em branco o momento não aferido.",
      "(mg/dL)",
    ]),
  ],

  // O arquivo mais denso do código (39 candidatos, 35 literais distintos).
  "interface/calculadora/resultado.tsx": [
    ...glifos(["—"]),

    ...autorais([
      "Copiar plano",
      "Plano copiado: cole no prontuário.",
      "Não foi possível copiar. Transcreva o plano manualmente a partir desta tela.",
      "UI",
      "Recomendações ao prescritor",
      "Fonte clínica",
      ",",
      ":",
      "Insulina",
      ". Dose inicial pela fonte:",
      "a",
      "UI/dia",
      "Equivalente por peso (0,1 a 0,2 UI/kg/dia):",
      "O guia informa a faixa; a dose exata é fixada pelo prescritor.",
      "Conduta:",
      "Dose total:",
      "Na meta (71–129 mg/dL)",
      "Condutas alternativas do guia: a escolha é do prescritor",
      "Resultado do cálculo",
      "Resultado",
      "Os dados mudaram: recalcule antes de prescrever.",
      "Preencha os dados do paciente e acione Calcular.",
      "Não foi possível calcular.",
      "Ocorreu uma falha inesperada.",
      "Não prescreva",
      "a partir desta tela: recarregue a página e, se persistir, faça o cálculo manualmente pela fonte clínica.",
      "Entradas fora da faixa plausível. Nenhuma dose foi calculada:",
      "Cenário fora do escopo da fonte clínica:",
      ".",
      "Revisei a dose e a fonte",
      "Pronto para prescrever",
      "Transcreva o esquema ao prontuário/receituário. Nada é salvo nem enviado por esta página.",
      "Ferramenta de apoio à decisão: não substitui o julgamento do médico, que permanece responsável pela prescrição.",
      "Novo cálculo",
    ]),
  ],

  // Fonte única entre o painel de resultado e o plano copiável (RN-05, feature 006).
  "interface/calculadora/rotulos.ts": [
    ...autorais([
      "antes do café",
      "antes do almoço",
      "antes do jantar",
      "ao deitar",
      "Manter a dose",
    ]),
  ],

  // O subtítulo é composto: a prosa fica aqui em duas metades, e o nome da fonte entra do
  // domínio por `NOME_PUBLICADO` (MD-0021). É por isso que a tela concatena em vez de usar
  // template — literal dentro de template interpolado é invisível ao extrator.
  "interface/calculadora/tela.tsx": [
    ...autorais([
      "Calculadora de insulina no DM2",
      "APS Inteligente · Fonte única:",
      ", 2.ª ed. atualizada, 2023",
    ]),
  ],

  "interface/calculadora/validacao-campos.ts": [
    ...autorais([
      "Informe o peso do paciente.",
      "Peso inválido: use apenas números (vírgula ou ponto).",
      "HbA1c inválida: use apenas números.",
      "Informe a dose da aplicação.",
    ]),
  ],

  // ─── interface/cardiologia ──────────────────────────────────────────────────────

  "interface/cardiologia/formulario.tsx": [
    // Os três critérios do Quadro 1, como a fonte os enuncia.
    ...citacoes(`${TELECONDUTAS}, Quadro 1, p. 4`, [
      "Desconforto ou dor retroesternal",
      "Provocada por exercício ou estresse emocional",
      "Alívio rápido (≈1 min) com repouso ou nitrato",
    ]),
    ...autorais([
      "Diabetes",
      "Tabagismo",
      "Hipertensão",
      "Dislipidemia",
      "Paciente",
      "Idade (anos)",
      "Sexo",
      "Masculino",
      "Feminino",
      "Características da dor (Quadro 1)",
      "Fatores de risco",
      "Sinais clínicos adicionais",
      "ECG basal altera a interpretação da ergometria ou o paciente não pode exercitar-se",
      "Sinais de angina instável ou dor aguda (repouso, início recente, em crescendo)",
      "Avaliar",
    ]),
    ...identificadores(["sexo"]),
  ],

  "interface/cardiologia/referencias.tsx": [
    // Enquadramento: os títulos das quatro seções e o rodapé são do produto.
    ...autorais([
      "Classificação funcional da angina estável (CCS)",
      "Tratamento farmacológico e Tabela 1 de medicamentos",
      "Acompanhamento na APS",
      "Manejo da doença arterial coronariana aguda e encaminhamento",
      "Material de referência",
      "Conteúdo consultável do",
      "(TelessaúdeRS-UFRGS, 2017), fora do cálculo desta ferramenta.",
    ]),

    ...citacoes(`${TELECONDUTAS}, Quadro 3, p. 5`, [
      "Quadro 3, p. 5 (Sociedade Canadense Cardiovascular)",
      "Classe I — atividades comuns (caminhar, subir escadas) não causam angina; sintoma só em esforço extenuante ou prolongado.",
      "Classe II — limitação leve; angina ao caminhar mais de duas quadras no plano ou subir mais de um lance de escadas.",
      "Classe III — limitação marcada; angina ao caminhar 1 a 2 quadras ou subir um lance de escadas.",
      "Classe IV — angina a qualquer atividade física, podendo ocorrer em repouso.",
    ]),

    ...citacoes(`${TELECONDUTAS}, pp. 9–11`, [
      "p. 9-11 (cardiopatia isquêmica estabelecida)",
      "Prevenção cardiovascular: antiagregante plaquetário (AAS 100 mg/dia; clopidogrel 75 mg/dia na intolerância ou alergia) e estatina de alta intensidade como prevenção secundária.",
      "Antianginosos: betabloqueador (primeira escolha, alvo de FC próxima a 60 bpm), bloqueador de canal de cálcio (anlodipino, verapamil ou diltiazem) e nitrato (sublingual para sintomas agudos; de uso fixo com intervalo livre de 12 h para evitar tolerância).",
      "IECA: benéfico na redução de mortalidade e eventos, sobretudo pós-infarto, disfunção ventricular, diabetes e hipertensão.",
      "Betabloqueadores: propranolol, atenolol, metoprolol, carvedilol.",
      "Bloqueadores de canal de cálcio: anlodipino, verapamil, diltiazem (nifedipina retard).",
      "Nitratos: isossorbida (di/mononitrato); dinitrato sublingual 5 mg até 3 comprimidos; propatilnitrato.",
      "IECA: enalapril, captopril. Antiplaquetários: AAS, clopidogrel, ticlopidina. Estatinas: sinvastatina, atorvastatina, rosuvastatina, pravastatina.",
    ]),

    ...citacoes(`${TELECONDUTAS}, pp. 8–9`, [
      "p. 8-9 (periodicidade e controle de fatores de risco)",
      "Periodicidade das consultas: em torno de 4 a 12 meses, conforme gravidade, adesão e fatores de risco.",
      "A cada consulta, reavaliar a classe funcional da angina; piora sugere otimizar tratamento e investigar fatores de descompensação.",
      "Controle de fatores de risco: cessação do tabagismo, dieta cardioprotetora, exercício regular, PA < 140/90 e, em diabéticos, HbA1c < 7%.",
      "Aumento da frequência ou duração da dor, ou dor em repouso: encaminhar à emergência (angina instável / IAM).",
    ]),

    ...citacoes(`${TELECONDUTAS}, p. 12`, [
      "p. 12 (suspeita de IAM ou angina instável)",
      "Suspeita de IAM ou angina instável: encaminhar para atendimento emergencial.",
      "Enquanto aguarda a ambulância: repouso, sinais vitais e ECG, AAS 100 mg (3 comprimidos mastigados), oxigênio se hipóxia e nitrato sublingual (exceto em hipotensão ou uso de inibidores da fosfodiesterase-5).",
      "Encaminhamento ao cardiologista: estratificação após evento agudo; diagnóstico recente de alto risco (> 90%); sintomático apesar de tratamento otimizado; ou impossibilidade de investigação não invasiva em probabilidade intermediária/alta.",
    ]),
  ],

  "interface/cardiologia/resultado.tsx": [
    ...citacoes(`${TELECONDUTAS}, Quadro 1, p. 4`, [
      "Angina típica",
      "Angina atípica",
      "Dor não anginosa",
    ]),
    ...autorais([
      "Probabilidade pré-teste (base):",
      "%",
      "Ajustada por fatores de risco:",
      "% a",
      "(pode ultrapassar 90%)",
      "Resultado",
      "Informe idade, sexo, as características da dor e os fatores de risco, e avalie.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a avaliação.",
      "Nova avaliação",
      "Fora do escopo da fonte",
      "Fonte clínica",
      "·",
      "Entrada incompleta ou implausível",
      "Resultado desatualizado: os dados foram editados após a avaliação. Avalie novamente.",
      "Estrato de probabilidade:",
      "Conduta",
      "Investigar causas não cardíacas:",
    ]),
  ],

  "interface/cardiologia/tela.tsx": [
    ...autorais([
      "Probabilidade pré-teste de cardiopatia isquêmica",
      "APS Inteligente · Fonte única:",
      "(TelessaúdeRS-UFRGS, 2017)",
    ]),
  ],

  // ─── interface/comum ────────────────────────────────────────────────────────────

  // Nomes acessíveis fixados por decisão (RN-07, `domain.md` §7.2 regra 12).
  "interface/comum/moldura.tsx": [
    ...autorais([
      "Nada é salvo nem enviado",
      "Início",
      "Ativar tema claro",
      "Ativar tema escuro",
    ]),
  ],

  // ─── interface/contribuicao (feature 019) ───────────────────────────────────────
  //
  // Camada autoral por inteiro, com três exceções que são identificador pela ORIGEM
  // e não pelo diretório (RN-02): a chave PIX, o nome civil e a cidade do
  // beneficiário. Nenhum dos três é prosa a revisar — a chave é código de
  // recebimento, e nome e cidade são o que o padrão do Banco Central exige nos
  // campos 59 e 60, transcritos da vida civil. Os valores hoje são de EXEMPLO, e o
  // arquivo os declara como tais; quando os reais entrarem, a classe não muda.
  //
  // "PIX" aparece dentro de frases autorais e não se declara à parte: é marca do
  // arranjo de pagamento dentro da prosa do produto, e a prosa é que se revisa.

  "interface/contribuicao/beneficiario.ts": [
    // Os dois primeiros são os valores publicados; os dois últimos, os de exemplo
    // que permanecem no arquivo como oráculo da guarda de
    // `tests/unit/interface/beneficiario-sem-exemplo.test.ts`.
    ...identificadores([
      "Iago Leal",
      "BENEFICIARIO DE EXEMPLO",
      "CIDADE EXEMPLO",
    ]),
  ],

  "interface/contribuicao/acao-copiar.tsx": [
    ...autorais([
      "Não foi possível copiar. Selecione o texto nesta tela e copie manualmente.",
    ]),
  ],

  "interface/contribuicao/painel.tsx": [
    ...autorais([
      "Contribuição voluntária",
      "A contribuição é voluntária e não compra funcionalidade, prioridade, suporte nem acesso.",
      "A plataforma é gratuita e continua gratuita para quem não contribuir.",
      "Nada é processado nem confirmado aqui: a transferência acontece no aplicativo do seu banco, e esta página não fica sabendo se ela ocorreu.",
      "Código PIX copia e cola",
      "No próprio celular não dá para ler o código com a câmera do mesmo aparelho. Copie o código abaixo e cole no aplicativo do seu banco, que já chega com o beneficiário identificado.",
      "Copiar código copia e cola",
      "Código copiado: cole no aplicativo do banco.",
      "Chave PIX",
      "Copiar chave",
      "Chave copiada.",
      "Código para leitura por câmera",
      "Código PIX para leitura pela câmera de outro aparelho",
      "Beneficiário:",
      ", em",
      ".",
      "A configuração do beneficiário está incorreta e o código não pôde ser gerado.",
    ]),
  ],

  "interface/contribuicao/bloco-de-apoio.tsx": [
    ...autorais([
      "Apoie a plataforma",
      "A APS Inteligente é mantida por uma pessoa só e não tem anúncio, cadastro nem plano pago. Se ela poupa seu tempo na consulta, você pode contribuir com o valor que quiser, por PIX.",
      "Contribuir por PIX",
    ]),
  ],

  // ─── interface/gestacao ─────────────────────────────────────────────────────────

  "interface/gestacao/formulario.tsx": [
    ...autorais([
      "Datação pela menstruação",
      "Data da última menstruação (DUM)",
      "Datação pelo último ultrassom",
      "Data do exame",
      "Semanas no exame",
      "Dias no exame",
      "Calcular",
    ]),
  ],

  "interface/gestacao/resultado.tsx": [
    ...glifos(["—"]),

    ...autorais([
      "Idade gestacional:",
      ".º trimestre",
      "Data provável do parto:",
      "DUM equivalente:",
      "Resultado",
      "Informe a DUM, o último ultrassom, ou ambos, e calcule.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça o cálculo.",
      "Novo cálculo",
      "Entrada incompleta ou implausível",
      "Resultado desatualizado: os dados foram editados após o cálculo. Calcule novamente.",
      "Idade gestacional",
      "Calculada na data de referência",
      ".",
      "Pela DUM",
      "Pelo ultrassom",
      "Fonte clínica",
      ",",
      "·",
    ]),
  ],

  "interface/gestacao/tela.tsx": [
    ...autorais([
      "Calculadora de idade gestacional",
      "APS Inteligente · Fonte única:",
      ", 4.ª ed., 2025",
    ]),
  ],

  // ─── interface/inicio ───────────────────────────────────────────────────────────

  // Fonte única das seções e rotas (D-07 da feature 007, anti-drift). É também o oráculo
  // contra o qual a descrição da home é verificada (D-05).
  "interface/inicio/catalogo.ts": [
    ...autorais([
      "Diabetes Mellitus tipo 2",
      "Calculadora de insulina",
      "Início de insulinização, titulação da NPH e intensificação com Regular, pelo Guia Rápido Diabetes Mellitus (SMS-Rio, 2023).",
      "Pré-natal",
      "Calculadora de idade gestacional",
      "Idade gestacional, data provável do parto e trimestre a partir da DUM ou do último ultrassom, pelo Guia Rápido Pré-Natal (SMS-Rio, 2025).",
      "Cardiologia",
      "Calculadora de probabilidade pré-teste de cardiopatia isquêmica",
      "Classificação da dor torácica, probabilidade pré-teste de doença arterial coronariana e conduta de investigação, pelo TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017).",
      "Calculadora de risco cardiovascular em 10 anos",
      "Risco de doença cardiovascular aterosclerótica (ASCVD) em 10 anos pelas Pooled Cohort Equations (ACC/AHA 2013, Goff et al.).",
      "Puericultura",
      "Avaliação do crescimento infantil",
      "Escores z de peso, comprimento/estatura, IMC e perímetro cefálico com a classificação nutricional da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), inclusive para nascidos pré-termo.",
      // Segunda ficha da seção Puericultura (feature 020).
      "Ficha de consulta de puericultura",
      "As dez consultas datadas da Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020) em ficha preenchível, com o registro pronto em SOAP para colar no prontuário.",
      // Quinta seção (feature 023). O catálogo é fonte única das seções, e por isso as três
      // linhas entram aqui e não no módulo próprio da tela nova: o arquivo é o do catálogo.
      "Saúde da pessoa idosa",
      "Rastreamento de depressão na pessoa idosa",
      "Escala de Depressão Geriátrica em quinze itens, com o escore e a faixa na redação das Linhas de Cuidado (Ministério da Saúde).",
    ]),
  ],

  // O subtítulo é hoje byte a byte igual à `description` do manifesto (D-18, RN-05).
  "interface/inicio/tela.tsx": [
    ...autorais([
      "APS Inteligente",
      "Calculadoras clínicas para a Atenção Primária à Saúde · Cálculo 100% no navegador",
    ]),
  ],

  // ─── interface/puericultura ─────────────────────────────────────────────────────

  "interface/puericultura/formulario.tsx": [
    ...autorais([
      "Criança",
      "Sexo",
      "Masculino",
      "Feminino",
      "Data de nascimento",
      "Data da medição",
      "Medidas",
      "Informe ao menos uma medida. A que faltar apenas suprime o índice que depende dela.",
      "Peso (kg)",
      "Comprimento/estatura (cm)",
      "Posição da medição",
      "Deitado (comprimento)",
      "Em pé (estatura)",
      "Perímetro cefálico",
      "Perímetro cefálico (cm)",
      "Idade gestacional ao nascer (opcional)",
      "Em branco, a criança é tratada como nascida a termo e nenhuma correção de idade é aplicada.",
      "Semanas completas",
      "Dias",
      "Avaliar crescimento",
    ]),
    ...identificadores(["sexo", "posicao"]),
  ],

  "interface/puericultura/proveniencia.tsx": [
    ...autorais([
      "Proveniência e limites desta avaliação",
      "Cobertura da fonte:",
      ". Fora dessa faixa, a ferramenta recusa o cálculo em vez de extrapolar.",
      "Fonte:",
      ".",
    ]),
  ],

  // Os quatro títulos de índice são AUTORAIS por `MD-0012`: o rótulo clínico ("Peso
  // adequado para idade") é do domínio e é citação; a tela nomeia o índice pela forma
  // neutra, com artigo, que a caderneta não imprime em lugar nenhum.
  "interface/puericultura/resultado.tsx": [
    ...autorais([
      "Peso para a idade",
      "Comprimento/estatura para a idade",
      "IMC para a idade",
      "Perímetro cefálico para a idade",
      "Medida não informada.",
      "As curvas de pré-termo (INTERGROWTH-21st) não publicam IMC: o índice não existe nesta faixa, e a sua falta não é erro.",
      "Escore z:",
      "·",
      "Padrão:",
      "idade cronológica",
      "idade corrigida",
      "idade pós-menstrual",
      "Não calculado.",
      "Resultado",
      "Informe o sexo, as duas datas e ao menos uma medida para avaliar o crescimento pelos gráficos da Caderneta da Criança.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a avaliação.",
      "Nova avaliação",
      "Fora do escopo da fonte",
      "Fonte clínica",
      "Entrada incompleta ou implausível",
      "Resultado desatualizado: os dados foram editados após a avaliação. Avalie novamente.",
      "Índices antropométricos",
    ]),
    // Nomes de classe CSS, apanhados pelo corte de duas palavras.
    ...identificadores([
      "indice indice-ausente",
      "indice indice-fora-do-escopo",
    ]),
  ],

  "interface/puericultura/tela.tsx": [
    ...autorais([
      "Avaliação do crescimento infantil",
      "APS Inteligente · Fonte única:",
      "(Ministério da Saúde, 2.ª ed., 2020), pp. 85–97",
    ]),
  ],

  // ─── interface/risco-cardiovascular ─────────────────────────────────────────────

  "interface/risco-cardiovascular/formulario.tsx": [
    ...autorais([
      "Branca",
      "Preta / afro-americana",
      "Outra",
      "Paciente",
      "Sexo",
      "Masculino",
      "Feminino",
      "Raça / cor",
      "Idade (anos)",
      "Exames e pressão",
      "Colesterol total (mg/dL)",
      "HDL (mg/dL)",
      "Pressão arterial sistólica (mmHg)",
      "Em tratamento anti-hipertensivo",
      "Fatores de risco",
      "Diabetes",
      "Tabagismo atual",
      "Histórico cardiovascular",
      "Doença cardiovascular já estabelecida (infarto, AVC, revascularização)",
      "Estimar risco",
    ]),
    ...identificadores(["sexo", "raca"]),
  ],

  "interface/risco-cardiovascular/proveniencia.tsx": [
    ...autorais([
      "Por que Pooled Cohort Equations, e não a AHA PREVENT?",
      "A AHA PREVENT (2023) é uma calculadora mais recente, sexo-específica e sem variável de raça, derivada de mais de 6,5 milhões de adultos e capaz de incorporar função renal e determinantes sociais. Foi criada para modernizar a estimativa e ampliar sua aplicabilidade à população geral dos Estados Unidos.",
      "Esta ferramenta usa, ainda assim, as Pooled Cohort Equations, porque a recomendação de estatina em prevenção primária da USPSTF (2022) foi calibrada sobre elas, e é esse limiar que dá sentido clínico ao número estimado. A PREVENT estima risco sistematicamente menor: adotá-la descasaria o risco estimado do limiar que fundamenta a conduta. Fica como candidata a uma calculadora futura, com fonte própria.",
      "Calculadora AHA PREVENT (site oficial, em inglês):",
      "professional.heart.org · PREVENT™ Online Calculator",
    ]),
    // Valor do atributo `rel` do vínculo externo.
    ...identificadores(["noopener noreferrer"]),
  ],

  "interface/risco-cardiovascular/resultado.tsx": [
    // As quatro categorias do 2019 ACC/AHA, com os cortes que a diretriz publica.
    ...citacoes(
      "2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease: cortes 5% / 7,5% / 20%",
      [
        "Baixo (< 5%)",
        "Limítrofe (5 a < 7,5%)",
        "Intermediário (7,5 a < 20%)",
        "Alto (≥ 20%)",
      ],
    ),
    ...autorais([
      "Resultado",
      "Informe sexo, raça, idade, os exames e os fatores de risco, e estime o risco cardiovascular em 10 anos.",
      "Falha inesperada na calculadora. Não use os valores desta tela; recarregue a página e refaça a estimativa.",
      "Nova estimativa",
      "Fora do escopo da fonte",
      "Fonte clínica",
      "Pooled Cohort Equations (ACC/AHA 2013) ·",
      "Entrada incompleta ou implausível",
      "Resultado desatualizado: os dados foram editados após a estimativa. Estime novamente.",
      "Risco de ASCVD em 10 anos:",
      "%",
      "Categoria de risco:",
    ]),
  ],

  "interface/risco-cardiovascular/tela.tsx": [
    ...autorais([
      "Risco cardiovascular em 10 anos (Pooled Cohort Equations)",
      "APS Inteligente · Fonte única:",
      "(Goff et al., 2014)",
    ]),
  ],

  // ─── interface/puericultura/consulta (feature 020) ──────────────────────────────
  //
  // Tudo aqui é AUTORAL, e a uniformidade merece explicação porque a tela reproduz uma
  // ficha impressa. A citação desta feature — os trezentos e cinquenta rótulos das dez
  // consultas — mora no DADO, em `models/puericultura/consulta/fichas/**`, com declaração
  // derivada e oráculo próprio. O que sobra na camada de apresentação é o que o produto
  // escreveu para pôr aquele dado na tela: rótulos de controle, avisos e cabeçalhos.
  //
  // "Não" e "Sim" são o caso limite, e a razão de serem autorais é a de `MD-0014`. A
  // caderneta imprime "( ) Não ( ) Sim" ao lado de cada campo, mas o que está na tela são
  // os rótulos dos dois botões de rádio que o produto desenhou; sem a caderneta, eles
  // seriam os mesmos. A citação conferível é o rótulo do CAMPO, e é ela que o oráculo de
  // transcrição confere contra a página. As telas da 014 e da 017 já declaram "Masculino" e
  // "Feminino" pelo mesmo raciocínio.

  "interface/puericultura/consulta/app.tsx": [
    ...autorais(["Avaliar crescimento"]),
  ],

  "interface/puericultura/consulta/ficha.tsx": [
    ...autorais(["Não", "Sim", "Complemento"]),
    ...identificadores(["campo-radios consulta-campo", "campo consulta-campo"]),
  ],

  "interface/puericultura/consulta/identificacao.tsx": [
    ...autorais([
      "Identificação da consulta",
      "Nenhum campo identifica a criança: a ficha registra achado clínico, e o vínculo com a pessoa é do prontuário onde o texto será colado.",
      "Sexo",
      "Masculino",
      "Feminino",
      "Data de nascimento",
      "Data da consulta",
      "Idade gestacional ao nascer: semanas",
      "Idade gestacional ao nascer: dias",
      "Em branco, a criança é tratada como nascida a termo. Mínimo",
      "semanas.",
      "Informe o sexo e as duas datas para que a ficha da idade seja sugerida.",
      "Idade cronológica:",
      "Idade corrigida:",
    ]),
    ...identificadores(["sexo"]),
  ],

  "interface/puericultura/consulta/painel-crescimento.tsx": [
    ...autorais([
      "Avaliação do crescimento",
      "As medidas vêm da ficha desta consulta, sem redigitação. O peso, que a caderneta pede em gramas, é convertido para quilos antes de entrar nos escores.",
      "Posição da medição",
      "A caderneta não pergunta a posição, e o cálculo depende dela: entre medir deitado e medir em pé há 0,7 cm de diferença. Informe qual foi.",
      "Deitado (comprimento)",
      "Em pé (estatura)",
    ]),
    ...identificadores(["posicao-da-medicao"]),
  ],

  "interface/puericultura/consulta/proveniencia.tsx": [
    ...autorais([
      "Proveniência e limites desta ficha",
      "Cobertura da fonte:",
      "Fonte:",
    ]),
    ...glifos(["."]),
  ],

  "interface/puericultura/consulta/registro.tsx": [
    ...autorais([
      "Registro em SOAP",
      "Nada foi preenchido ainda. O registro mostra apenas o que você marcar na ficha, e some do texto o que ficar em branco.",
      "Confira o texto antes de copiar. É exatamente esta cadeia que vai para a área de transferência.",
      "Copiar registro",
      "Registro copiado. Cole no prontuário.",
    ]),
  ],

  "interface/puericultura/consulta/seletor-de-ficha.tsx": [
    ...autorais([
      "Ficha da consulta",
      "Sugerida pela idade",
      "A idade indica a",
      ", e a ficha aberta é outra. A escolha é sua.",
    ]),
  ],

  "interface/puericultura/consulta/tela.tsx": [
    ...autorais([
      "Ficha de consulta de puericultura",
      "APS Inteligente · Fonte única:",
      "(Ministério da Saúde, 2.ª ed., 2020), pp. 66–75",
    ]),
  ],
};
