# Regression watch — 019-contribuicao-voluntaria-pix

> Data: 2026-07-28 · Para a próxima re-extração `/reversa` (nº 4)
> O watch principal só admite o que era 🟢 e mudou. O que nasce 🟡 vai para as observações,
> sem peso de regressão.

## 1. Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | `_reversa_sdd/architecture.md#1`, tabela de invariantes da família `models/*` | A tabela vale para todo módulo **clínico** de `models/`. `models/contribuicao` é isento por escrito, e a isenção está no cabeçalho de `br-code.ts` (`MD-0022`) | presença | A re-extração reportar `models/contribuicao` como violação de fonte clínica única, de `ReferenciaClinica` ou do catálogo congelado. Se isso acontecer, o defeito é do texto de `architecture.md#1`, que ainda generaliza, e não do código |
| W002 | `_reversa_sdd/architecture.md#6` e `dependencies.md` | Há **uma** dependência de runtime nova desde a feature 010: `react-qr-code@2.2.0`, pinada exata, com lockfile commitado e ficha `MD-0024` | redação | Qualquer texto que ainda afirme "sem dependência de runtime nova desde a 010", ou que registre a dependência sem versão pinada |
| W003 | `_reversa_sdd/code-analysis.md#Módulo 10 — interface/inicio` | O `CATALOGO` continua sendo fonte única de **calculadoras**: cinco fichas em quatro seções, e o bloco de apoio **fora** dele | ausência | Entrada de contribuição dentro do `CATALOGO`, ou o bloco de apoio renderizado dentro do `map` das seções |
| W004 | `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | Abrir e fechar o painel não faz requisição externa, não busca dado e não cria durável novo; o único item de `localStorage` segue sendo a preferência de tema | presença | Requisição a host distinto da própria origem, requisição `fetch`/`xhr`/`websocket` na abertura do painel, ou chave nova no armazenamento |
| W005 | `_reversa_sdd/architecture.md#5`, baseline `axe` 0 por rota | O painel aberto não introduz violação `axe` nova, e a hierarquia de títulos dentro do `Dialog` começa em `h2`, porque o Primer publica o título como `h1` | presença | `heading-order` reaparecer, ou `e2e/axe-baseline.json` crescer para acomodar violação nova |
| W006 | `_reversa_sdd/addenda/018-revisao-linguagem-textos.md` | Todo literal exibido da feature tem classe declarada, e o inventário é idempotente. As mensagens de validação são literais **completos**, e não frases montadas por template | presença | Prosa nova montada por interpolação em `models/contribuicao` ou `interface/contribuicao`, que escaparia ao extrator (`MD-0021`) e à norma |
| W007 | `interfaces/br-code.md` §3 (contrato externo) | O CRC16 é calculado sobre a cadeia que **já contém** `6304`, e o payload emitido é aceito por decodificador independente | presença | Decodificador de terceiro recusar o payload, ou o cálculo passar a excluir o sufixo `6304` |
| W008 | `interfaces/br-code.md` §4 | Comprimento excedido em nome, cidade ou identificação **recusa**, e nunca trunca | ausência | Qualquer `slice`, `substring` ou `padEnd` sobre os campos do beneficiário no caminho de emissão |
| W009 | `_reversa_forward/019-.../requirements.md` RN-08 | O comando de apoio existe **só na home**, e em nenhuma das cinco rotas de calculadora | ausência | Comando de contribuição em tela de resultado clínico, ou na `Moldura` |
| W010 | `_reversa_forward/019-.../roadmap.md` RNF de desempenho | O painel entra por import dinâmico: o `Dialog` e a biblioteca do QR ficam fora do primeiro carregamento da home | presença | `import` estático de `./painel` em `bloco-de-apoio.tsx`, ou o custo da home voltar à casa dos 15 kB gzip |

## 2. Observações, sem peso de regressão

| ID | Assunto | Estado |
|---|---|---|
| O-19-01 | **Os três valores reais chegaram em 28/07/2026** e `T028` fechou: chave aleatória, `Iago Leal` e `Goiânia`. A guarda de `tests/unit/interface/beneficiario-sem-exemplo.test.ts` saiu de `it.todo` e passou a valer. Os valores de exemplo permanecem exportados como oráculo dela | resolvido |
| O-19-02 | **A leitura por aplicativo de banco real (`T033`) continua pendente.** É a única verificação da feature que não se automatiza, e a única em que o consumidor real do contrato se manifesta. O payload já foi aceito por decodificador independente, e a tela do aplicativo deve exibir **Iago Leal**. Procedimento e tabela em branco em `oraculo-externo.md` §3 | pendente |
| O-19-03 | **O nome acessível do comando de fechar é "Close", em inglês.** Vem do `Dialog` do Primer, que não é localizado, e é o único texto exibido da feature que não passa pelo inventário, porque não é literal nosso. Corrigi-lo exigiria `renderHeader` próprio, assumindo a manutenção de acessibilidade que `D-06` decidiu não assumir | tolerado, revisável |
| O-19-04 | **O QR não segue o tema**: fundo branco e módulos pretos mesmo no tema escuro. É requisito de leitura por câmera, e não escolha estética; código invertido falha em boa parte dos aplicativos de banco | intencional |
| O-19-05 | **A disposição de RF-16 em telas largas** usa `grid-template-areas` e nasceu 🟡 na `D-11`. A ordem do DOM é a de telefone, e o CSS recoloca o desenho ao lado sem alterar leitura nem foco. Duas guardas e2e cobrem a ordem geométrica e a visibilidade sem rolagem em 375 px | a validar em uso |
| O-19-06 | **`prop-types` entrou na árvore de runtime** por `react-qr-code`, sob React 19, onde é resíduo inútil. Já existia na árvore de desenvolvimento via `eslint-plugin-react`, de modo que não há custo novo de disco, e o build passa | tolerado |
| O-19-07 | **A cifra de testes de `architecture.md#5` está mais defasada** (agora 733 de unidade e integração, mais 47 de ponta a ponta). Dívida L-11, herdada da 018 e não criada aqui | a corrigir na re-extração |
| O-19-08 | **Polyfill de `ResizeObserver`** entrou em `tests/apoio/setup-jsdom.ts` para o `useOverflow` do `Dialog`. Inerte por desenho: nada no jsdom muda de tamanho, e a geometria fica com os roteiros de ponta a ponta | intencional |
| O-19-09 | **O construtor de teste foi para `tests/apoio/contribuicao.ts`**, e não para `construtores.ts` como o `actions.md` previa. Arquivo próprio por domínio é o precedente de `tests/apoio/puericultura.ts`, e evita pôr um módulo não clínico no apoio de um motor clínico | desvio declarado |

## 3. Histórico de re-extrações

_(a preencher pela próxima execução de `/reversa`)_

## 4. Arquivadas

_(vazio)_

## Histórico de re-extrações

### Re-extração 2026-07-28 23:50

> Re-extração nº 4 · 10 watch items verificados contra o SDD regenerado e contra o código.

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | a isenção de `models/contribuicao` está por escrito e agora também em ADR 0016 e em `models-contribuicao/`; a re-extração **não** a reporta como violação da família `models/*` |
| W002 | 🟢 verde | `react-qr-code` pinada exata em `2.2.0`; nenhum texto da extração afirma mais “sem dependência de runtime nova desde a 010” |
| W003, W009 | 🟢 verde | o `CATALOGO` segue sendo fonte única de calculadoras e o bloco de apoio segue fora do `map`. As cifras do item evoluíram por decisão posterior: **seis** fichas e **seis** rotas de calculadora, por acréscimo da feature 020 |
| W004..W006, W008, W010 | 🟢 verde | sem requisição na abertura do painel; hierarquia de títulos preservada; nenhum `slice`/`substring` no caminho de emissão; painel por import dinâmico em `bloco-de-apoio.tsx` |
| W007 | 🟡 amarelo | o cálculo sobre a cadeia com `6304` está verificado no código e por propriedade ✅; a aceitação por **decodificador independente** não foi reexecutada nesta sessão — é a lacuna **L-02** de `gaps.md` |

