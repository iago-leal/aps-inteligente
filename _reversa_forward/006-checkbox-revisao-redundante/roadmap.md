# Roadmap: Dar função ao ritual de revisão — copiar o Plano ao prontuário

> Identificador: `006-checkbox-revisao-redundante`
> Data: `2026-07-22`
> Requirements: `_reversa_forward/006-checkbox-revisao-redundante/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature é um delta puramente de apresentação sobre o painel de resultado, no mesmo molde da feature 005. Três peças novas, todas na camada `interface/calculadora`: (1) um formatador puro `formatar-plano.ts` (`ResultadoCalculo → string`) que produz o texto do plano reutilizando `agruparRecomendacoes` e os rótulos já existentes, garantindo por construção que o texto copiado espelha a tela; (2) um adaptador de infraestrutura `area-de-transferencia.ts`, no molde de `preferencia-de-tema.ts`/`relator-de-erros.ts`, que encapsula a API de clipboard do navegador e devolve sucesso/falha como valor; (3) a extensão de `resultado.tsx`, onde o predicado existente `revisaoValida` passa a habilitar o botão de cópia dentro do bloco "Pronto para prescrever", com estado local de retorno (`ocioso | copiado | falhou`). O motor (`models/`) não é tocado; a máquina `EstadoResultado` não ganha estados novos — apenas a sub-máquina da revisão ganha um efeito no estado `confirmada`.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | Requirements travado antes do plano; RN-02/RN-03 do legado alteradas serão reconciliadas por adendo via `/reversa-sync` | respeita |
| II. Cadeia de derivação | Todos os RFs derivam da demanda clarificada (ritual só se justifica com função); nenhum artefato órfão | respeita |
| III. Clarificação precede solução | Duas rodadas de `/reversa-clarify` resolveram destino do bloco, precedência do Must e escopo do texto | respeita |
| IV. Portão G1 | Requirements sem `[DÚVIDA]`; seed travado | respeita |
| V. Fase 2 proporcional | Feature de UI numa Aplicação: roadmap + data-delta + onboarding, sem contrato externo (interfaces/ omitida) | respeita |
| VI. Rastreabilidade bidirecional | Módulos novos citam RF-NN no cabeçalho; matriz da unit `interface-calculadora` ganha as linhas novas no adendo | respeita |
| VII. Testes como metade da fonte | Unit do formatador (função pura), integração com stub de clipboard, e2e com clipboard real; nascem antes do código (TDD) | respeita |
| VIII. Proporcionalidade | Sem pirâmide extra: os três níveis já existentes cobrem a superfície tocada | respeita |

Nenhum conflito de princípio identificado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Formatador puro `interface/calculadora/formatar-plano.ts` (`ResultadoCalculo → string`), importando `agruparRecomendacoes` e os rótulos de momento hoje em `resultado.tsx` (extraídos para reuso) | Espelhamento tela↔texto por construção (RN-03); testável por unidade sem DOM; molde consagrado pela 005 (`agrupar-recomendacoes.ts`) | Formatar inline no componente (intestável isolada e propensa a drift); serializar o DOM renderizado (frágil, acoplado a markup) | 🟢 |
| D-02 | Adaptador `interface/calculadora/area-de-transferencia.ts`: função assíncrona que grava texto na área de transferência e devolve `{ok: true} \| {ok: false}` — erro como valor, sem exceção ao chamador | Isola a API de navegador da lógica do painel (molde `preferencia-de-tema.ts`); ADR 0004 (erros como valores); RN-05 exige falha barulhenta e tratável | Chamada direta à API no componente (acopla e dificulta stub); fallback via comando de cópia legado do DOM (descartado: API depreciada); biblioteca externa de clipboard (dependência extra para uma linha — Princípio de dependências enxutas) | 🟢 |
| D-03 | Estado de retorno local ao painel: `ocioso \| copiado \| falhou`, zerado sempre que `revisaoValida` deixa de valer (edição, novo cálculo, desmarcação); mensagens com `role="status"` (sucesso) e `role="alert"` (falha); sem timers de auto-ocultação | Determinismo e testabilidade (sem relógio); RF-03 exige retorno anunciável a leitores de tela; o zeramento acompanha a semântica da RN-02 | Estado global em `calculadora-app.tsx` (desnecessário: nenhum outro componente consome); toast com timeout (introduz tempo e flakiness em teste) | 🟢 |
| D-04 | Corpo "esquema/dose" do texto copiado = corpo principal exibido (início: insulina/momento + faixa da fonte + equivalente por peso; titulação: conduta + dose total + esquema por aplicação). Alertas e condutas alternativas ficam fora do texto | O requirements §5 RF-02 enumera quatro partes, e alternativas/alertas não estão entre elas; o Plano do prontuário registra a conduta sugerida — a escolha entre equivalentes é do prescritor (ADR 0005) e colada ao registro confundiria a prescrição | Espelhar o painel inteiro, alertas e alternativas incluídos (transformaria o Plano em transcrição da tela, não em plano assistencial) | 🟡 interpretação de "esquema/dose"; vigiar em `regression-watch.md` |
| D-05 | Linha final de contexto: "Plano elaborado com apoio de ferramenta de decisão clínica; a prescrição é responsabilidade do médico." | RN-03: mesmo teor do disclaimer, sem dado clínico do paciente; redação delegada ao plano pelo requirements §10 | Citar nome/URL da ferramenta (desnecessário e mais frágil que o teor de responsabilidade) | 🟢 |
| D-06 | Rótulo do botão: "Copiar plano"; posição: dentro do bloco "Pronto para prescrever", após o texto de transcrição | Verbo + objeto direto, coerente com a linguagem da tela; o bloco já é a área da ação (requirements §9) | "Copiar recomendações" (subestima o conteúdo); botão fora do bloco (quebraria o vínculo revisão→ação) | 🟢 |
| D-07 | Testes: unit do formatador (4 cenários: início, titulação com/sem agrupamento, titulação com alternativas excluídas); integração `resultado.test.tsx` com stub do adaptador (aparecer/copiar/feedback/invalidar); e2e chromium com permissão de clipboard concedida e leitura do conteúdo copiado | Pirâmide do Princípio VII; clipboard real só é verificável em e2e; permissões de clipboard são suportadas no runner e2e existente | Testar clipboard só por stub (deixaria RF-02 sem verificação de ponta); e2e nos dois navegadores para clipboard (a leitura da área de transferência é instável fora do chromium — mantém-se o restante da suíte nos dois viewports) | 🟢 |

## 4. Premissas

n/a — o requirements chegou ao plano sem marcadores `[DÚVIDA]`. A única interpretação assumida está registrada como decisão (D-04), não como premissa de dúvida.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Painel de resultado (`resultado.tsx`) | `_reversa_sdd/architecture.md#2-containers-e-componentes` | regra-alterada | O bloco "Pronto para prescrever" ganha botão de cópia habilitado por `revisaoValida` e mensagens de retorno; rótulos de momento extraídos para reuso |
| Formatador do plano (`formatar-plano.ts`) | — (novo) | componente-novo | Função pura `ResultadoCalculo → string` com as quatro partes do RF-02 |
| Adaptador de área de transferência (`area-de-transferencia.ts`) | — (novo) | componente-novo | Encapsula a API de clipboard; sucesso/falha como valor |
| Sub-máquina da revisão | `_reversa_sdd/state-machines.md#1-estadoresultado` | regra-alterada | O estado `confirmada` (com resultado atual) passa a habilitar a ação de cópia; estados inalterados |
| Folha de estilos global (`globais.css`) | `_reversa_sdd/inventory.md` | regra-alterada | Ajuste mínimo de espaçamento do botão/mensagens dentro do bloco, mantendo o arquivo abaixo de 400 linhas |

`models/` fora do delta por definição (RF-05; ADR 0003).

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma entidade do domínio muda; surge apenas um tipo local de UI (estado de retorno da cópia) e uma string derivada, efêmera, nunca armazenada.
- Detalhe completo em: `_reversa_forward/006-checkbox-revisao-redundante/data-delta.md`

## 7. Delta de contratos externos

Nenhum. A área de transferência é API do navegador no dispositivo do usuário, não contrato externo de rede — coerente com a privacidade por arquitetura (ADR 0002/0007). Diretório `interfaces/` omitido.

## 8. Plano de migração

n/a — sem dados persistidos, sem contrato externo, sem alteração de comportamento fora do bloco de revisão.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Área de transferência indisponível (contexto não seguro, permissão negada, navegador antigo) | médio | baixo | RN-05/D-02: falha vira valor, painel exibe orientação de transcrição manual; cenário negativo coberto em integração |
| Drift entre texto copiado e tela conforme recomendações evoluírem | médio | médio | D-01: formatador importa as mesmas funções/rótulos da renderização; teste de unidade fixa as quatro partes; watch no adendo |
| Prescritor sentir falta de alertas/condutas alternativas no texto colado | baixo | médio | D-04 registrado como interpretação 🟡; entrada dedicada em `regression-watch.md` para validação em uso real |
| Leitura da área de transferência instável no e2e fora do chromium | baixo | alto | D-07: verificação de conteúdo copiado restrita ao chromium; comportamento visível (botão/feedback) segue nos dois viewports |
| `resultado.tsx` ultrapassar o limite de 400 linhas do mantenedor | baixo | médio | Extração dos rótulos e do formatador já remove linhas; medir no coding e, se necessário, extrair o bloco de revisão em componente próprio |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Suítes verdes: unidade + integração (incluindo os testes novos), contrato e e2e com axe na linha de base da feature 004 (0 violações)
- [ ] `git diff models/` vazio
- [ ] Nenhum texto clínico existente alterado (diff das strings dos painéis nulo fora do bloco de revisão)
- [ ] `regression-watch.md` gerado com os watchs de D-04 e do drift do formatador
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-22 | Versão inicial gerada por `/reversa-plan` | reversa |
