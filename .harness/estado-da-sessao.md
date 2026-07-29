---
commit: 3642ba65969af099862c32a87e37d6ed2b2586c4
feature: default_feature
start_time: '2026-07-29T01:02:02.600153+00:00'
status: active
gate_lembrete_fingerprint: 2ba72efe192771188327e8e51b279a449009d723
---

## O que foi feito
- **Sessão inteira de registro de defeito, sem uma linha de código de aplicação tocada.** O usuário abriu com dois prints da ficha de consulta de puericultura em produção e dois relatos; o `/reversa-debugger` fez o que o skill manda e só isso: resolveu o contexto, anotou, apurou, registrou e gerou as views. A correção é do `/reversa-debugger-fix`, e ficou para a próxima.
- **Nasceu o segundo contexto do registro de bugs**, `_reversa_bugs/consulta-puericultura/`, o primeiro além do `motor-insulina`, que existia sozinho desde 19/07. A pasta foi criada antes de qualquer análise, porque é ela que recebe as evidências: as duas imagens entraram em `intake/` no primeiro gesto, ao lado do relato bruto `relato-20260728-2145.md`.
- **`BUG-20260728-ZAHV` (critical · P0): a proveniência atravessa para o prontuário.** O texto que a tela entrega à área de transferência fecha com as três notas editoriais e a linha `Fonte:`. No print, com um único campo preenchido, a proveniência ocupava mais de quatro quintos do registro.
- **O achado da apuração é que o comportamento é o especificado.** A regra 7 de `models-puericultura-consulta/contracts.md` manda as notas fecharem o texto e a linha da fonte fechar as notas; o código obedece à letra. O bug acusa a spec, não o código, e o registro diz isso na cara: veredito previsto `spec-desatualizada`, com adendo versionado como pré-requisito de fechamento.
- **`BUG-20260728-C6LN` (medium · P2): o comando "Avaliar crescimento" fica fora do quadro "1. Medidas".** Nasce irmão da ficha, cai depois de todos os quadros, longe das três medidas que consome. É `spec-gap`, e a prova veio dos testes: os três que alcançam o comando o localizam por papel e nome, nunca por posição — a posição nunca foi contratada.
- **`MD-0035` registra a decisão do prescritor**, tomada em 28/07 sobre duas perguntas que mudavam o registro: saem as notas **e** a linha da fonte; ficam o cabeçalho e o SOAP; a declaração permanece na tela. A ficha generaliza a regra para além desta tela e já alcança o BR Code.
- **Views do contexto geradas e espelho global regenerado:** `index.md`, `catalog.jsonl`, `matrix.md`, `graph.md`, `spec-matrix.md` e o `graph.html` autocontido, mais `_reversa_sdd/traceability/bugs.md` com os três bugs dos dois contextos.
- **Três commits e três pushes:** `cf93c56` (a `MD-0035`), `aac422f` (o registro de bugs e o espelho) e `be3fec7` no `notas-obsidian`. Produção segue no SHA `a422b60`.

## Próximos passos
- **`/reversa-debugger-fix BUG-20260728-ZAHV`**, e é o primeiro gesto porque é o P0 e porque a decisão que ele executa já está escrita — o fix não precisa decidir nada de produto, só materializar `MD-0035` e o adendo.
- **Depois, `BUG-20260728-C6LN`.** A pergunta que o fix precisa responder não é onde pôr o botão, e sim como: `ficha.tsx` não aceita conteúdo de fora, e a escolha é entre dar-lhe ponto de extensão ou acoplar a projeção da fonte clínica a um comando de aplicação.
- **Triar `018/W021`**, herdado da re-extração nº 4 e ainda barato: ou a mensagem de `models/insulina/validacao.ts:179` perde o `(p. 59)`, ou o item declara a exceção da insulina.
- **Chancelar as onze premissas 🟡 novas** e dar o **aval estético da 021**, ambos herdados sem movimento.

## Pendências / bloqueios
- **Dois bugs abertos, nenhum bloqueado.** As duas listas `blocking` estão vazias, e os arquivos que cada correção alcança são disjuntos: podem correr em paralelo sem conflito de edição.
- **Um teste vigente reprova a correção do P0**, e é de propósito: `tests/unit/interface/formatar-registro.test.ts:82` afirma a regra 7. Ele muda de sentido junto com a spec, no mesmo change set — apagá-lo por conveniência seria contornar o gate em vez de passar por ele.
- **`taxonomy.yaml` não tem termo para esta área.** Os dois bugs ficaram em `module` e `feature: unclassified`, com as propostas (`interface-puericultura-consulta`, `models-puericultura-consulta`, `consulta-puericultura-soap`) registradas em Agent Notes. O arquivo é somente leitura no comando de registro, e a inclusão é decisão a tomar.
- Herdados e sem movimento: `MD-0027` a arbitrar, `README.md` reprovando `prettier --check`, `interface.mts` em 684 linhas, **L-10** sem dono, as duas lacunas 🔴 de `gaps.md`, o Codex indisponível e o rastreamento preventivo pausado sem resposta da AHRQ em cinco dias.

## Ponteiros
- **A distinção que organiza esta sessão, e vale para todo bug futuro:** relato de defeito nem sempre acusa o código. Antes de chamar de bug, ler a spec efetiva — se ela descreve o que o usuário reclamou, o alvo é a spec, e o registro precisa dizê-lo, ou o fix vai emendar o código deixando o contrato a afirmar o contrário do que o produto faz. Foi o que separou o P0 do P2: um pede que a spec mude, o outro pede que ela passe a existir.
- **Como se prova um `spec-gap` sem ler a spec inteira:** olhar como os testes localizam o alvo. Se nenhum o alcança pela propriedade reclamada, a propriedade nunca foi contratada. Os três testes do comando o pegam por papel e nome; nenhum por posição.
- **Por que o corte da proveniência não relaxa a norma:** `proveniencia.tsx` importa as constantes direto de `fonte-clinica.ts`, e não do registro. A declaração que RN-03, RN-08 e RN-09 exigem nunca dependeu do texto copiado — ele apenas a duplicava.
- **Onde ler o resultado:** `_reversa_bugs/consulta-puericultura/generated/graph.html` (grafo e tabela dos abertos), os dois `bug.md` e o relato bruto em `intake/`.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0035`**.
- **Adendos 015 a 022 marcados como superados.** Não há adendo vigente; o próximo nasce do fix do P0.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status` · SHA `a422b60`, conferido em 28/07.
