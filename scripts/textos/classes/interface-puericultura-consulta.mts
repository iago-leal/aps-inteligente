// Classe declarada dos literais de `interface/puericultura/consulta/**` (feature 020; T012).
//
// Módulo separado do motor de crescimento pela mesma razão que separa os dois módulos de
// `models/`: a ficha de consulta e a avaliação antropométrica são assuntos distintos que
// compartilham prefixo de caminho. O predicado deste módulo vem ANTES do de
// `interface-puericultura.mts` em `classificacao.mts`, e é a ordem que faz a mensagem de
// erro apontar o módulo certo.
//
// Módulo DEV-TIME: nunca é importado por código de aplicação.
import type { MapaDeClasses } from "../classificacao.mts";
import { autorais, identificadores, glifos } from "./declarar.mts";

export const MAPA: MapaDeClasses = {
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
