// Classe declarada dos literais de `interface/calculadora/**` (T012).
//
// Camada autoral por inteiro: nenhum guia impresso escreve "Informe ao menos uma glicemia
// capilar para a titulação". A fonte clínica do domínio de insulina é citada em
// `models/insulina/**`, e é lá que a transcrição mora.
//
// FRAGMENTOS DE PONTUAÇÃO, e por que eles são literais como os outros. ":", ".", "—", "·",
// "%", "a" entram por posição sintática, porque são texto solto entre tags que a montagem
// da frase interrompe. São autorais como o resto da frase de que fazem parte, e é bom que
// sejam: acrescentar um dois-pontos onde não havia é alteração de forma, e a norma existe
// para que ela não passe em silêncio. `resultado.tsx` é o caso mais denso do código, e por
// isso o critério vai escrito aqui; ele vale para toda a camada.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, glifos } from "./declarar.mts";

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
};
