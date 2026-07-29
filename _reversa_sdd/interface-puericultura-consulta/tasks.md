# `interface/puericultura/consulta` — Tarefas de Implementação

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `020-consulta-puericultura-soap`.

## Pré-requisitos

- [ ] `models/puericultura/consulta` implementada, com as três operações da fachada.
- [ ] `models/puericultura` implementada, ao menos `derivarIdades` e a fachada de crescimento.
- [ ] `interface/comum/moldura` com `comInicio`, e o adaptador de área de transferência.
- [ ] Next.js com suporte a `next/dynamic`.

## Tarefas

- [ ] T-01, Compor a tela com a moldura e o subtítulo citando as pp. 66–75.
  - Origem no legado: `interface/puericultura/consulta/tela.tsx`
  - Critério de pronto: subtítulo por concatenação, não template.
  - Confiança: 🟢

- [ ] T-02, Implementar a identificação da consulta e a derivação do contexto.
  - Origem no legado: `identificacao.tsx`, `app.tsx:contexto`
  - Critério de pronto: entrada incompleta e datas impossíveis produzem contexto nulo sem
    quebrar a tela.
  - Confiança: 🟢

- [ ] T-03, Implementar o seletor de ficha, com a sugerida assinalada e troca livre.
  - Origem no legado: `seletor-de-ficha.tsx`
  - Critério de pronto: a escolha do usuário prevalece; a sugestão continua visível.
  - Confiança: 🟢

- [ ] T-04, Implementar a ficha preenchível, com um controle por natureza de campo e o filtro
      por sexo invocado do domínio.
  - Origem no legado: `ficha.tsx`
  - Critério de pronto: nenhuma condicional de sexo na tela; cada campo com rótulo associado.
  - Confiança: 🟢

- [ ] T-05, Implementar a gravação de resposta em mapa imutável, com remoção ao limpar.
  - Origem no legado: `app.tsx:aoResponder`
  - Critério de pronto: limpar a resposta faz o item sumir do registro.
  - Confiança: 🟢

- [ ] T-06, Implementar a projeção do registro em texto, conforme o contrato de forma.
  - Origem no legado: `formatar-registro.ts`
  - Critério de pronto: registro sem seção projeta em cadeia vazia; blocos separados por linha
    em branco dupla.
  - Confiança: 🟢

- [ ] T-07, Implementar o bloco do registro, exibindo e copiando **a mesma variável**.
  - Origem no legado: `registro.tsx`
  - Critério de pronto: não há segunda formatação para a cópia.
  - Confiança: 🟢

- [ ] T-08, Implementar o painel de crescimento com carregamento dinâmico, devolvendo o
      resultado ao registro.
  - Origem no legado: `painel-crescimento.tsx`, `app.tsx:next/dynamic`
  - Critério de pronto: quem não abre o painel não carrega o acervo tabular; o foco volta ao
    gatilho ao fechar.
  - Confiança: 🟢

- [ ] T-09, Implementar o aviso de não persistência e o bloco de proveniência.
  - Origem no legado: `proveniencia.tsx`
  - Critério de pronto: o aviso vem antes de qualquer campo; os textos vêm do domínio.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Preenchimento produzindo registro derivado, com atualização a cada resposta.
- [ ] TT-02, Identidade entre o texto exibido e o copiado.
- [ ] TT-03, Identificação incompleta e datas impossíveis.
- [ ] TT-04, Troca de ficha.
- [ ] TT-05, Filtro por sexo, incluindo o campo restrito e a nota que o declara.
- [ ] TT-06, Painel de crescimento incorporando escores ao registro.
- [ ] TT-07, Presença do aviso de não persistência.

## Ordem Sugerida

1. T-02 primeiro: sem contexto não há ficha.
2. T-03 a T-05 formam o preenchimento.
3. T-06 e T-07 juntos, porque a identidade entre exibir e copiar é o ponto.
4. T-08 por último, por ser o único com carregamento assíncrono.

## Lacunas Pendentes (🔴)

Nenhuma. As três premissas 🟡 — ficha sugerida entre consultas, acessibilidade herdada e
volatilidade do preenchimento — estão em `design.md`.
