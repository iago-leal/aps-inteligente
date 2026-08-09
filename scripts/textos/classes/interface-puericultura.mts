// Classe declarada dos literais de `interface/puericultura/**`, exceto a ficha de consulta
// (T012). A consulta tem módulo próprio, `interface-puericultura-consulta.mts`.
//
// O QUE PARECE CITAÇÃO E NÃO É, que é o modo de erro mais provável deste unit. Os títulos
// dos índices em `resultado.tsx` são AUTORAIS por decisão de `MD-0012`: o rótulo clínico é
// do domínio, e a tela nomeia o índice pela forma neutra, com artigo — "Peso para a idade",
// e não "Peso adequado para idade". Nome de fonte e nome de fármaco também são autorais:
// permanecem por serem nome próprio ou termo consagrado, não por serem citação.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, identificadores } from "./declarar.mts";

export const MAPA: MapaDeClasses = {
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
};
