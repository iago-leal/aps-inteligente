# Relatório de impacto — /reversa-principles

> Data: `2026-07-19`
> Operação: criação inicial (importação dos princípios I–VIII do projeto `plano-viagem`)
> Escopo: sugestões textuais de ajuste nos templates dependentes. **Nenhum template foi alterado.**
> Aplicar ou não cada sugestão é decisão humana.

## Diagnóstico geral

Os templates atuais do Reversa já convergem com boa parte da doutrina: o
`requirements-template.md` possui marcação de confidência (🟢/🟡/🔴) e `[DÚVIDA]`; o
`roadmap-template.md` já traz as seções "Princípios aplicados", "Alternativas
descartadas" e "Premissas"; o `actions-template.md` já prevê fase de testes e coluna
"Arquivo alvo". As sugestões abaixo fecham as lacunas restantes, sobretudo nas cadeias
de derivação (Princípio II) e de rastreabilidade (Princípio VI).

## `requirements-template.md`

1. **[Princípio III] Mapear `[F]/[I]/[H]` ↔ confidência.** O template usa 🟢/🟡/🔴; a
   doutrina usa `[F]` fato / `[I]` inferência / `[H]` hipótese. Sugerir, no comentário de
   cabeçalho, a equivalência explícita (🟢 = `[F]`, 🟡 = `[I]`, 🔴 = `[H]`/lacuna) para que
   os dois vocabulários não divirjam entre clarificação e requirements.
2. **[Princípio II] Coluna de origem na tabela de RFs (seção 5).** Acrescentar coluna
   `Origem (P_n)` para que cada RF aponte o problema validado de que deriva. RF sem
   origem é sinal de escopo entrando pela lateral.
3. **[Princípio IV] Aviso de estado preliminar.** Nota no cabeçalho: o documento só é
   fonte de verdade após o travamento do seed (G1); antes disso, tudo é preliminar.
4. **[Princípio VI] Referência a artefatos e testes por RF.** Prever, na tabela de RFs ou
   em seção própria, espaço para os artefatos (código e testes) que realizam cada RF —
   o lado spec→código da matriz de rastreabilidade.
5. **[Princípio VII] Já atendido em parte.** A seção 7 (Gherkin) torna os critérios de
   aceite conversíveis em teste de validação; nenhuma mudança estrutural necessária,
   apenas reforçar no comentário que cada cenário deve corresponder a um teste.
6. **[Princípio VIII] Já atendido.** O template já permite "n/a" em seção obrigatória.

## `roadmap-template.md`

1. **[Princípios I e II] Decisões citam spec, não código.** Na tabela de decisões
   (seção 3), reforçar no comentário que a justificativa de cada `D-NN` cita o RF-NN ou a
   spec que a origina — nunca "porque o código já faz assim".
2. **[Princípio III] Regra das ≥3 alternativas.** Onde houver mais de uma saída
   defensável, a coluna "Alternativas descartadas" deve registrar ao menos três opções
   com prós, contras e porquê da escolha. Hoje a coluna existe, mas sem esse piso.
3. **[Princípio V] Premissas: já atendido.** A seção 4 já converte `[DÚVIDA]`/`[H]` em
   premissa explícita com risco; nenhuma mudança necessária.
4. **[Princípios VI e VII] Critério de pronto (seção 10).** Acrescentar dois itens:
   `[ ] Matriz de rastreabilidade RF ↔ artefato ↔ teste consistente` e
   `[ ] Testes de validação dos RFs cobertos passando`.

## `actions-template.md`

1. **[Princípios II e VI] Coluna `RF-NN` por ação.** Acrescentar coluna que rastreie o
   requisito que cada ação realiza; combinada com "Arquivo alvo", ela alimenta as duas
   pontas da matriz de rastreabilidade.
2. **[Princípio VII] Fase 2 (Testes) deixa de ser opcional.** O comentário atual diz
   "Omitir se a equipe não pratica TDD"; substituir por "Obrigatória quando houver RF de
   domínio; bug encontrado durante a execução gera ação de teste de regressão em
   `tests/regression/`".
3. **[Princípio I] Gate de spec antes do `[X]`.** Nota nas regras de preenchimento: ação
   que altere comportamento só recebe `[X]` após a spec correspondente ser atualizada.
4. **[Princípio VIII] Já atendido.** Fases vazias podem ser omitidas; sugerir apenas que
   a omissão seja registrada em "Notas de execução".
