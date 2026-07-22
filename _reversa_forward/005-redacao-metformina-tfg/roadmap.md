# Roadmap: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Requirements: `_reversa_forward/005-redacao-metformina-tfg/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A mudança vive inteira na camada de interface. O motor de domínio permanece byte a byte intocado: mesmos tipos, mesmas mensagens, mesma ordem de saída, mesmas supressões — é o que o RF-03 exige e o que preserva o contrato descrito em `_reversa_sdd/code-analysis.md#módulo-1`. Um módulo puro novo na interface (`agrupar-recomendacoes.ts`) recebe a lista `recomendacoesAoPrescritor` e a devolve agrupada: quando `MANTER_METFORMINA` e `REDUZIR_METFORMINA_TFG` coexistem, o segundo vira subitem do primeiro; nos demais casos, a lista sai como entrou. O componente `Recomendacoes` de `resultado.tsx` passa a renderizar esses grupos como lista aninhada semântica (`<ul>` dentro do `<li>` pai), o que entrega a subordinação visual da RN-03 com HTML nativo, sem componente Primer novo, sem token novo e sem crescimento relevante de bundle. Por operar sobre tipos, não sobre modo, o agrupamento cobre início e titulação com o mesmo código (RF-02).

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | O requirements foi clarificado e travado antes deste plano; o código será projeção dele | respeita |
| II. Cadeia de derivação | RN-01/RN-03 derivam da queixa validada do prescritor (sessão 2026-07-22); RF-01..RF-03 as realizam | respeita |
| III. Clarificação precede solução | A solução (adjacência, não reescrita) nasceu na sessão de esclarecimentos, proposta pelo próprio usuário | respeita |
| IV. Portão G1 | Requirements sem `[DÚVIDA]` antes do plano | respeita |
| VI. Rastreabilidade bidirecional | O módulo novo cita RF-01/RF-02 no cabeçalho; a matriz será atualizada no sync | respeita |
| VII. Testes: metade da fonte | Teste de unidade do agrupador + ajuste do teste de integração do painel; asserções de texto do domínio intocadas | respeita |
| VIII. Proporcionalidade | Feature de apresentação: um módulo puro, um componente ajustado, dois arquivos de teste; nada além | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Agrupar na camada de interface; motor de domínio intocado | RF-03 exige invariância do motor (tipos, textos, ordem, supressões); a hierarquia é relação de apresentação, e o domínio puro (`_reversa_sdd/adrs/0003`) não deve carregar noção de layout | (a) reordenar na fachada `calculadora.ts` — muda a saída do motor e viola RF-03; (b) campo `subordinadaA` no tipo `Recomendacao` — muda o contrato que o resumo do requirements proíbe; (c) mensagem integrada única — descartada pelo prescritor na sessão de 2026-07-22 | 🟢 |
| D-02 | Módulo puro `interface/calculadora/agrupar-recomendacoes.ts` com mapa declarativo de pares (`REDUZIR_METFORMINA_TFG` → subitem de `MANTER_METFORMINA`) e fallback: subitem sem pai presente permanece item de topo | Coesão funcional e testabilidade em unidade, no mesmo padrão de `validacao-campos.ts` (extraído na feature 001); o fallback cobre a titulação sem fracionamento, em que `MANTER_METFORMINA` não é emitida | (a) lógica inline no componente `Recomendacoes` — não testável isoladamente e mistura transformação com renderização; (b) generalizar para N níveis — YAGNI, só existe um par | 🟢 |
| D-03 | Subordinação por lista aninhada semântica: `<ul>` dentro do `<li>` do item pai, recuo pelo estilo default de lista | HTML nativo é acessível por construção (leitores de tela anunciam "lista, 1 item" dentro do item pai), não adiciona dependência nem CSS novo, e mantém `globais.css` abaixo do teto de 400 linhas da dívida 4 quitada | (a) prefixo textual ("↳") — decorativo e ruidoso para leitores de tela; (b) componente Primer de árvore (`TreeView`) — peso desproporcional para um par de itens | 🟢 |
| D-04 | Um único agrupador para os dois modos (início e titulação) | O agrupamento dispara pela coexistência dos tipos, não pelo modo; cobre RF-02 sem código adicional | (a) restringir ao modo início — deixaria a mesma contradição viva na titulação com fracionamento | 🟡 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| A adjacência subordinada vale também na titulação com fracionamento (derivação da sessão de esclarecimentos, sem resposta direta do prescritor) | §9, terceira Q/R; RF-02 (🟡) | Baixo: se o prescritor discordar, remover o par do modo titulação é edição de uma linha no mapa de pares do agrupador |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `interface/calculadora` (módulo 2) | `_reversa_sdd/code-analysis.md#módulo-2` | componente-novo | `agrupar-recomendacoes.ts`: função pura lista → grupos `{principal, subitens}` |
| `PainelResultado` / `Recomendacoes` | `_reversa_sdd/code-analysis.md#módulo-2` (`interface/calculadora/resultado.tsx`) | regra-alterada | `Recomendacoes` renderiza grupos como lista aninhada; demais blocos e ordem fixa (RN-06 da UI) intocados |
| `models/insulina` (módulo 1) | `_reversa_sdd/code-analysis.md#módulo-1` | sem mudança | Invariância exigida pelo RF-03 — registrada aqui para o `legacy-impact.md` do coding |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhum dado novo é coletado, transmitido ou persistido; o tipo `Recomendacao` e a saída do motor não mudam. O único tipo novo é interno à interface (o grupo de renderização).
- Detalhe completo em: `_reversa_forward/005-redacao-metformina-tfg/data-delta.md`

## 7. Delta de contratos externos

n/a — a feature é integralmente client-side; nenhum contrato HTTP, fila ou arquivo é afetado (o endpoint `/api/status` da feature 002 segue intocado). Diretório `interfaces/` omitido.

## 8. Plano de migração

n/a — sem persistência, sem dado em trânsito, sem migração.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Testes de integração do painel (`tests/integration/interface/resultado.test.tsx`) assumem lista plana | baixo | alto | Ajustar asserções para a estrutura aninhada; nenhuma asserção de texto muda (RF-03) |
| Violação axe nova pela lista aninhada, quebrando a linha de base e2e (0 violações, feature 004) | médio | baixo | Lista aninhada é padrão HTML acessível; a spec e2e com `@axe-core/playwright` roda no critério de pronto e trava regressão |
| Recuo default de `<ul>` aninhada imperceptível no CSS atual (reset do Primer/globais) | baixo | médio | Conferir visualmente no onboarding; se preciso, uma regra local mínima de recuo, dentro do teto de 400 linhas de `globais.css` |
| Prescritor discordar da extensão à titulação (premissa 🟡) | baixo | baixo | Reversão localizada: remover o par do mapa quando `modo === "titulacao"` |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Suíte completa verde (`npm test`), com asserções de texto de mensagens intocadas (RF-03)
- [ ] E2e com axe ≤ linha de base da feature 004 (0 violações)
- [ ] Verificação visual dos quatro cenários Gherkin do requirements (TFG 40, 60, 25 e ausente)
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-22 | Versão inicial gerada por `/reversa-plan` | reversa |
