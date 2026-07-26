---
commit: ad402b18801afe0cb0c85bd91767e9c1c1019e1e
feature: default_feature
start_time: '2026-07-26T22:13:26.489594+00:00'
status: inactive
---

## O que foi feito
- **Reconciliação do plano da 017 sobre a auditoria cruzada, antes de qualquer código.** Os cinco achados HIGH do `cross-check.md` foram fechados: A001 (leitura do `.xlsx`), A002 (RF-06 sem ação), A003 (oráculo da OMS em pasta ignorada pelo git), A004 (raio de impacto subdimensionado) e A005 (fronteira superior sem dono). Os seis MEDIUM e os cinco LOW também, com exceção declarada de A016, que é dívida do artefato da extração e se resolve na próxima re-extração.
- **MD-0004 fechada por medição, não por preferência.** Um spike escreveu o leitor de `.xlsx` só com built-ins (`node:fs` + `node:zlib`) em ~70 linhas e reproduziu o contrato de aquisição sobre `wfa-boys` em 0,1 s. Somou-se o fato de o SheetJS ter saído do npm em 2023 (resta a `0.18.5` abandonada, com CVEs). Virou **D-14** no roadmap: `package.json` intocado, `npx tsx` descartado porque o Node 26 executa TypeScript nativamente, e a aquisição separada do gerador — só o baixador toca a rede.
- **MD-0006 aberta e fechada:** as duas fronteiras que a spec deixara em anos ganharam número na unidade da própria fonte — **3683 dias** em cima (o mês 120 cobre 3653 a 3682; a auditoria estimara 3683 como coberto, e a conta exata desmentiu por um dia) e **730 dias** em baixo, governando de uma só vez o perímetro cefálico e a troca da régua deitado/em pé. Entraram como **D-15** e **D-16**.
- **Sete ações executadas no `/reversa-coding`, nenhuma falha.** T001 (caderneta baixada do gov.br; achado de leitura: **a página impressa é a física menos um**), T003 (baixador escrito e rodado — 14 planilhas, 14 `sha256` distintos, manifesto de procedência versionado), T004, T005, T006 e T029 (leitor de `.xlsx` nativo, ~230 linhas, provado nos quatro formatos da OMS).
- **A pendência obrigatória da MD-0002 foi encerrada por caminho melhor que o previsto.** Como o Lancet seguiu inacessível, a conferência dos coeficientes do INTERGROWTH-21st deixou de ser tipográfica e passou a ser **de consequência**: as seis tabelas oficiais `PPFS_zscores_*` contra as expressões fechadas, **1596 células, nenhuma fora da tolerância de arredondamento**, pior desvio 0,005 — empate de arredondamento. Evidência mais forte que a leitura da tabela impressa, porque testa o efeito e não a grafia.
- O leitor já provou o seu valor clínico: confirmou por **conteúdo** que o arquivo mal nomeado da OMS (`hfa-boys-…`) é peso — aba `wfa_boys_z_WHO 2007_exp`, `M = 18.5057` em 61 meses, o valor-âncora V7 do contrato.
- Suíte **424/424** verde em 32 arquivos, `typecheck` e `eslint` limpos. Diff em arquivos existentes puramente aditivo: 19 inserções, nenhuma remoção.

## Próximos passos
- `/reversa-coding` a partir de **T030** (verificações V1–V7 do gerador), que destrava T031 → T032 → T033 e, com elas, a emissão das 14 tabelas.
- Em paralelo, T007 (apoio de teste) e T008 (casos-oráculo congelados) já rodam: as tabelas do INTERGROWTH-21st extraídas nesta sessão são a matéria-prima delas.
- `/reversa-sync` só quando a feature fechar.

## Pendências / bloqueios
- **Trabalho desta sessão não commitado** — 13 arquivos modificados e 6 novos, incluindo as fichas `MD-0002`, `MD-0004` e `MD-0006`, os três scripts dev-time e os artefatos do ciclo forward.
- **Estado intermediário assumido:** a home já anuncia `/puericultura/crescimento`, rota que só existe em T045. É consequência da regra de anti-drift do README (catálogo primeiro) e desaparece na fase de integração.
- Rastreamento preventivo por perfil — PAUSADA (26/07/2026), aguardando a chave da API USPSTF (AHRQ Prevention TaskForce), solicitada em 23/07/2026 a `uspstfpda@ahrq.gov`, sem resposta. Retomar por `/reversa-requirements` quando a chave chegar.
- Premissas 🟡 do plano da 017 (§4 do `roadmap.md`, agora sete com a da leitura no mês 120), somadas às 13 da re-extração nº 3, seguem a validar pelo prescritor.
- **A016 da auditoria não foi corrigida por decisão:** `_reversa_sdd/domain.md` §7.2 regra 11 ainda descreve `logoComoTitulo`, prop removida pelo adendo 016. O plano está certo; o artigo da extração é que está atrasado, e se acerta na próxima re-extração.

## Ponteiros
- Feature ativa: `_reversa_forward/017-puericultura-crescimento/` · estágio `coding` em `.reversa/active-requirements.json` · progresso em `progress.jsonl` (7 linhas), rastros em `legacy-impact.md` e `regression-watch.md` (W001–W005).
- Microdecisões da 017: `MD-0001` (fonte editorial × dado tabular), `MD-0002` (equações fechadas do pré-termo — **ressalva encerrada**), `MD-0003` (leitura sem interpolação), `MD-0004` (**fechada**: leitura nativa do `.xlsx`), `MD-0005` (severidade da auditoria), `MD-0006` (**fechada**: fronteiras de 3683 e 730 dias).
- Código novo: `scripts/baixar-tabelas-oms.mts`, `scripts/oms/origens.mts`, `scripts/lib/planilha.mts`; dado de procedência em `models/puericultura/oms/tabelas/manifesto.json`. Fontes clínicas fora do git em `referencias/{caderneta,oms,intergrowth}/`.
- Adendos vigentes: `_reversa_sdd/addenda/` (001–016). Extração Reversa nº 3: commit `ab075ac`.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status` (último código em produção: feature 016, `472cb08`).
