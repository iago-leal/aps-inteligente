# Actions: A ficha de consulta encaixa na coluna do corpo

> Identificador: `021-coluna-da-ficha-de-consulta`
> Data: `2026-07-28`
> Roadmap: `_reversa_forward/021-coluna-da-ficha-de-consulta/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 24 |
| Paralelizáveis (`[//]`) | 13 |
| Maior cadeia de dependência | 10 (T001 → T003 → T004 → T005 → T008 → T009 → T010 → T013 → T018 → T022) |

> Execução concluída em 2026-07-28: **24 de 24**, nenhuma falha. T024 nasceu durante a
> execução, pela razão registrada nas notas.

A ordem das fases realiza D-07 do roadmap: a guarda generalizada nasce na fase 2, **antes**
de existir regra de coluna alguma, e a fase 3 só começa depois de a reprovação em
`/puericultura/consulta` estar registrada. A fase 1 é a única que precede a guarda, e por isso
nela nada altera pixel: a folha nova entra sem regra e o alias do catálogo é habilitado no
roteiro.

Dois roteiros de validação (T006 e T007) também nascem reprovando, por projeto e não por
descuido: eles afirmam o que só a fase 3 entrega. A distinção importa na leitura do log de
`/reversa-coding`, e está registrada nas notas de execução.

A contagem da cobertura é de **sete casos**, e não de seis rotas: o catálogo declara seis, e a
home entra à parte por ser a única tela da variante `destaque` (RN-04, A005).

## Fase 1, Preparação

<!-- Setup, scaffolding, migrações iniciais, configuração de infraestrutura local. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Habilitar nos roteiros e2e a importação do catálogo tipado: confirmar que o Playwright resolve o alias `interface/*` declarado em `tsconfig.json:27`, importando `CATALOGO` num roteiro e enumerando as rotas. Se não resolver, ajustar a configuração do Playwright pelo caminho mínimo, sem tocar em `tsconfig.json` | - | `[//]` | `playwright.config.ts` | 🟡 | `[X]` |
| T002 | Criar `interface/estilos/moldura.css`, **nona** folha do diretório, contendo só o comentário-cabeçalho (origem: RN-01b, D-01 a D-03 e `MD-0029`), sem regra alguma, e importá-la em `_app.tsx` na linha seguinte a `globais.css:22`, antes de todas as folhas de tela. A ordem importa: a coluna precisa vir antes de quem declara o eixo vertical sobre ela. A folha entra vazia de propósito: nada pode mudar de largura antes de a guarda existir | - | `[//]` | `interface/estilos/moldura.css` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- Testes que precisam existir antes ou logo após o núcleo. Omitir se a equipe não pratica TDD. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Generalizar a guarda geométrica de `e2e/plataforma.spec.ts:372`: percorrer as rotas derivadas de `CATALOGO` em vez de `/dm2/insulina`, medir o `<main>` em vez de `.calc-regioes`, e ler o recuo lateral do estilo computado do próprio elemento em vez do `GUTTER = 32` chumbado em `:378`. Preservar a tolerância de 2px e as duas asserções de borda. Não parametrizar seletor de classe por rota, que reintroduziria no teste o acoplamento que é a causa raiz do defeito no CSS (RF-03, RN-04, D-05) | T001 | `[//]` | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |
| T004 | Acrescentar à guarda o **sétimo caso**, que o catálogo não declara: `/` na variante `destaque`, com o `<main>` aferido contra a calibração `calc(50% - 328px)` de `inicio.css:28`. É a mitigação do risco 2 do roadmap, e sem ela a variante `destaque` sai da fase 3 sem cobertura | T003 | - | `e2e/plataforma.spec.ts` | 🟡 | `[X]` |
| T005 | Executar a guarda e **registrar a reprovação**: as cinco telas de calculadora anteriores e a home passam, `/puericultura/consulta` reprova nomeada. Colar a saída na nota de execução, porque é o critério de aceite literal de RF-03 e o que separa guarda de regressão de lista de verificação manual | T003, T004 | - | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |
| T006 | Roteiro de validação do telefone: em 375px de largura, `/puericultura/consulta` não produz rolagem horizontal e nenhum texto encosta na borda, com o recuo medido igual ao de `/puericultura/crescimento` (RF-02) | - | `[//]` | `e2e/consulta-puericultura.spec.ts` | 🟢 | `[X]` |
| T007 | Roteiro de validação do registro longo: preencher a ficha do 1.º Mês por inteiro e aferir que o bloco do registro em SOAP quebra dentro da coluna, sem rolagem horizontal da página, em 1280px e em 375px (RF-05, RN-05) | T006 | - | `e2e/consulta-puericultura.spec.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

<!-- Lógica central da feature. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Escrever em `moldura.css` a coluna do corpo, com o seletor `.pagina[data-apresentacao="…"] > main` nas duas variantes: 1180px na `padrao` e 720px na `destaque`, cada uma com `margin-inline: auto` e recuo lateral de 32px. Sem classe nova no JSX e sem tocar `moldura.tsx`, que RN-03 mantém fora do alcance (D-11). **Só o eixo horizontal**: nenhuma propriedade vertical entra nesta folha (RN-01b, D-01, D-02) | T002, T005 | - | `interface/estilos/moldura.css` | 🟢 | `[X]` |
| T009 | Acrescentar a `moldura.css` os dois pontos de quebra do recuo lateral, preservados por variante: 900px na `padrao` e 544px na `destaque`, ambos baixando o recuo para 16px. Unificá-los está descartado por D-04, que os herda de `globais.css:346` e `inicio.css:161` | T008 | - | `interface/estilos/moldura.css` | 🟢 | `[X]` |
| T010 | Subtrair de `.calc-regioes` (`globais.css:33`) as três propriedades horizontais e converter o recuo remanescente em `padding-block: 28px 56px`, repetindo a conversão dentro da media query de 900px, que passa a `padding-block: 20px 40px` e mantém a coluna única | T008, T009 | `[//]` | `interface/estilos/globais.css` | 🟢 | `[X]` |
| T011 | Mesma subtração em `.inicio-secoes` (`inicio.css:34`), com `padding-block: 40px 64px` na regra-base e `24px 48px` na media query de 544px, preservando o `gap` de cada uma | T008, T009 | `[//]` | `interface/estilos/inicio.css` | 🟢 | `[X]` |
| T012 | Mesma subtração em `.contribuicao-bloco` (`contribuicao.css:21`), terceiro declarante da coluna por D-09, que vive dentro do `<main>` da home por `interface/inicio/tela.tsx:58`. O eixo vertical converte-se em `padding-block: 32px 64px`, e **não** `0 64px`: a regra declara `padding: 0 32px 64px` na linha 24 e `padding-top: 32px` na linha 30, que sobrescreve o zero do atalho. A folha **não tem media query própria**, de modo que a subtração muda o recuo do telefone de 32px para 16px — mudança visível e esperada, declarada na terceira premissa do roadmap e no passo 7 do `onboarding.md`, e que não há de ser reportada como regressão. Sem esta ação o bloco fica com recuo lateral dobrado dentro de coluna aninhada, defeito que a guarda, por medir o `<main>`, não veria | T008, T009 | `[//]` | `interface/estilos/contribuicao.css` | 🟢 | `[X]` |
| T013 | Executar a guarda de novo: os **sete casos** passam — as seis rotas do catálogo, `/puericultura/consulta` inclusive, mais a home na variante `destaque`. Colar a saída na nota de execução, ao lado da reprovação de T005 (RF-01, RF-03, RF-04) | T010, T011, T012 | - | `e2e/plataforma.spec.ts` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Cola com outras partes do sistema, contratos externos, ganchos. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T014 | Rodar a suíte e2e inteira e a varredura `axe`, conferindo que `e2e/axe-baseline.json` fica sem diff e que a rota da consulta permanece em zero violação (RF-06) | T013 | - | `e2e/axe-baseline.json` | 🟢 | `[X]` |
| T015 | Conferir RF-04 na forma que ele afirma desde a segunda sessão de clarify — **invariância verificada, e não ausência de diff**: nenhuma asserção dos roteiros de comportamento das cinco telas anteriores foi editada, e o diff de `e2e/` restringe-se à guarda geométrica, que RF-04 exclui nominalmente por ser objeto de RF-03, e ao roteiro da consulta | T014 | - | `e2e/` | 🟢 | `[X]` |
| T016 | Verificar o escopo negativo com `git diff --stat` em duas listas: a de `data-delta.md` §4 — `models/`, `interface/inicio/catalogo.ts`, `pages/api/` e `e2e/axe-baseline.json` (RF-09, RF-06) — e a das folhas que RF-04 nomeia como intocadas, `puericultura.css`, `cardiologia.css`, `risco-cardiovascular.css` e `cabecalho.css`. Saída esperada vazia nas duas | T013 | `[//]` | `models/` | 🟢 | `[X]` |
| T017 | Rodar `node scripts/inventariar-textos.mts --gerar` e conferir que conclui sem candidato órfão e que a segunda execução deixa `git diff` vazio. O portão vale por feature, e não por intenção, ainda que esta não crie literal exibido (RF-07) | T010, T011, T012 | `[//]` | `scripts/textos/` | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Logs, telemetria, mensagens de erro, documentação curta. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T018 | Subir o piso do `minmax` de `.consulta-identificacao` de `12rem` para `22rem`, mantendo `auto-fit` e sem media query nova: três colunas em 1280px, uma no telefone (RF-08, D-06). Último passo por ser o único descartável sem afetar o resto | T013 | - | `interface/estilos/consulta-puericultura.css` | 🟡 | `[X]` |
| T019 | Medir o custo de bundle gzip das rotas tocadas contra a linha de base da 020 e registrar o delta, que o requisito não funcional de desempenho projeta abaixo de 1 kB por rota | T013 | `[//]` | `.next/` | 🟢 | `[X]` |
| T020 | Rodar `typecheck`, `lint` e a suíte de unidade e integração, e conferir `prettier --check` nos arquivos criados ou alterados por esta feature. A reprovação global de `format:check` é dívida pré-existente registrada em `O-20-10`, e não regressão desta entrega | T013 | `[//]` | `package.json` | 🟢 | `[X]` |
| T021 | Capturar `/puericultura/consulta` em 1280px e em 375px, depois do ajuste de T018, e anexar as duas imagens ao relatório para o aval estético. A aprovação em si fica fora do `actions.md`, porque espera por humano (`MD-0023`) | T018 | - | `e2e/consulta-puericultura.spec.ts` | 🟡 | `[X]` |
| T022 | Guarda de escopo de D-10: conferir que `git diff -- interface/estilos/consulta-puericultura.css` se restringe à linha do `minmax` de `.consulta-identificacao`, sem nenhuma outra hunk. É o que torna RF-08b critério em vez de intenção, e substitui a conferência a olho do revisor (A006) | T018 | `[//]` | `interface/estilos/consulta-puericultura.css` | 🟢 | `[X]` |
| T023 | Capturar a home em 1280px e em 375px, com o pé da página visível, e anexar ao relatório a conferência do passo 7 do `onboarding.md`: o bloco de apoio há de alinhar-se, nas duas larguras, às seções acima dele. É a inspeção do risco 3 do roadmap, que a guarda não faz por medir o `<main>`. Captura ad hoc, sem roteiro novo commitado, para não colidir com T015; a aprovação espera por humano e fica fora (`MD-0023`) | T013 | `[//]` | `e2e/` | 🟡 | `[X]` |
| T024 | **Demonstrar a reprovação de RF-03**, pelo procedimento do `onboarding.md` §6: comentar a regra da variante `padrao` em `moldura.css`, rodar a guarda, conferir que ela reprova **nomeando** `/puericultura/consulta`, e restaurar. Ação criada na execução porque T005 não podia cobrir o critério: com o alvo da medição no `<main>` (D-05), a guarda escrita antes da correção reprova em toda tela, e a reprovação seletiva que RF-03 exige só é observável depois de T013. Ver a nota de execução | T013 | - | `interface/estilos/moldura.css` | 🟢 | `[X]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

- T006 e T007 nascem reprovando, e isso é o projeto e não descuido: afirmam o que só a fase 3
  entrega. Só T005 exige a reprovação **registrada**, porque nela a falha é o critério de aceite.
- **T005 não pôde cobrir o critério que lhe foi atribuído, e a razão é estrutural.** A ação
  previa que a guarda, escrita antes da correção, passasse nas cinco telas antigas e na home e
  reprovasse só em `/puericultura/consulta`. Executada, ela reprovou nos **sete** casos. A causa
  não é defeito de implementação: D-05 mudou o alvo da medição de `.calc-regioes` para o
  `<main>`, e a coluna do `<main>` só nasce em T008 — de modo que, nesta ordem, nenhuma tela pode
  passar. A expectativa de T005 só faria sentido se a guarda medisse o elemento que então tinha a
  coluna, isto é, se não estivesse generalizada. A reprovação de sete linhas ficou registrada
  como linha de base, e o critério de RF-03 migrou para **T024**, que o verifica depois de T013
  pelo procedimento do `onboarding.md` §6. Ali a guarda reprovou nomeando a consulta entre as
  seis rotas da variante `padrao`, e **não** nomeou a home, que é `destaque` — prova adicional de
  que ela discrimina por variante.
- **Segundo efeito visível de T012, apurado na decomposição e já declarado no roadmap.**
  `.contribuicao-bloco` tem `border-top` (`contribuicao.css:29`), e o `box-sizing: border-box` de
  `globais.css:10` faz essa régua medir hoje os 720px da caixa, ao passo que o texto acima e
  abaixo dela alinha em 656px. Cedida a coluna ao `<main>` por T012, o bloco passa a ocupar a
  largura de conteúdo do `<main>`, e a régua encolhe para 656px, alinhando-se ao texto. É
  consequência de D-09, não escopo acrescentado, e a home muda por isso em **toda largura**, não
  só em 375px. A terceira premissa do roadmap e o passo 7 do `onboarding.md` foram emendados para
  declarar os dois efeitos; T023 os põe diante do olho de quem confere.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-to-do`, sobre o `roadmap.md` de 8 decisões e o `data-delta.md` sem delta | reversa |
| 2026-07-28 | `/reversa-coding`: 24 de 24 ações concluídas, nenhuma falha. T024 nasceu durante a execução, porque T005 não podia cobrir o critério de RF-03 na ordem determinada por D-05 e D-07. Os cinco portões fecharam verdes — `typecheck`, `lint`, 808 testes de unidade e integração, 56 roteiros e2e e o inventário textual idempotente em 1161 literais. Bundle **−409 B** gzip | reversa |
| 2026-07-28 | `/reversa-to-do`, reconciliação com o `roadmap.md` reescrito após `audit/cross-check.md`. Nascem T022 (guarda de escopo de `consulta-puericultura.css`, D-10 e A006) e T023 (conferência do bloco de apoio na home, risco 3 e D-09). T012 sobe de 🟡 a 🟢 por passar a ter D-09 que a ampare, e a sua descrição absorve as duas particularidades da folha: `padding-block: 32px 64px` por causa do `padding-top` que sobrescreve o atalho, e a ausência de media query própria, que torna a mudança do telefone visível e esperada. T008 recebe o seletor de D-11; T002, a numeração de nona folha e a ordem de importação de D-03; T005 e T013, a contagem de sete casos (A005); T015, a forma de RF-04 como invariância verificada com a guarda excluída nominalmente (A001, A004); T016, a segunda lista de escopo negativo com as três folhas que RF-04 nomeia intocadas. Sai da nota de execução a observação de que T012 não constava do roadmap, e entra o achado da régua do bloco de apoio. IDs preservados, nenhum reciclado | reversa |
