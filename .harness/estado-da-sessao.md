---
commit: 13c87d620f680bd7c605ee24b83ceb9604b24b52
feature: default_feature
start_time: '2026-07-29T01:02:02.600153+00:00'
status: inactive
---

## O que foi feito
- **Sessão de correção: `BUG-20260728-ZAHV` levado da triagem ao fechamento travado**, pelo ciclo `/reversa-debugger-fix` inteiro — mitigação, reprodução, diagnóstico, plano visual, dois gates, veredito de spec e closure. Commit `13c87d6` pushado. É o primeiro bug deste contexto a fechar, e o segundo do projeto.
- **A mitigação foi oferecida e dispensada com razão escrita**, em vez de pulada: as duas formas possíveis (desligar a cópia ou desligar a ficha) removiam mais função do que o defeito custava, num produto sem usuários externos regulares — que é o próprio racional da closure policy `local-software`.
- **A cápsula de reprodução correu FORA da suíte**, com config própria no diretório temporário da sessão, de modo que nenhum arquivo de `tests/` foi criado ou tocado antes do Gate 1. Determinística, 2/2, sobre o domínio real e sem navegador.
- **A medida corrigiu para pior a estimativa do registro.** O bug dizia "mais de quatro quintos", por leitura do print; medido, são **1.095 caracteres com 80 de registro clínico — 93% de proveniência**. O número está gravado em `evidence/reproduction.md` e é o que sustenta a razão de proporção da `MD-0035`.
- **Causa raiz `confirmed`, e não estava no código.** `formatarRegistro` somava as notas e a linha da fonte porque a regra 7 de `contracts.md` mandava; o teste que a afirmava provava **intenção, não acidente**. Por isso a correção começou pela spec, e o adendo virou pré-requisito do fechamento, não consequência dele. Não é regressão: o comportamento nasceu com a feature 020, e `git bisect` seria inaplicável por falta de commit bom conhecido.
- **Três achados da investigação corrigiram o que o registro previa, todos a favor de um change set menor.** (1) A spec afetada era maior que a regra 7: o adendo revoga também a **regra 8** de `contracts.md`, emenda a regra 5 e reescreve o § Forma do texto emitido. (2) Só **um** teste vigente mudou de sentido, não dois — `consulta-registro.test.ts:174` afirma a estrutura do domínio, que permaneceu, e seguiu verde sem ser tocado. (3) A superfície textual não se moveu: o `Fonte:` do formatador nunca esteve no inventário, por ficar abaixo do corte de duas palavras.
- **O adendo abre com uma advertência de numeração**, porque as duas specs numeram diferente: em `registro-soap.md` a regra 8 é *"nenhum identificador da criança"* (RN-12), permanece vigente e tem teste próprio. Sem a advertência, o leitor futuro concluiria que a correção suprimiu uma proteção de privacidade.
- **`MD-0036` registra a decisão nova**, que a `MD-0035` não cobria: ela fixou *o que* sai do texto; esta fixa *de que lado da fronteira* o corte incide. `RegistroDaConsulta` segue carregando `notas` e `referencias`, agora **sem consumidor de produção**, e a permanência vai declarada em três lugares em vez de corrigida.
- **Perda declarada e aceita pelo usuário:** a página exata da ficha (`p. 68, Consulta da 1ª Semana`) deixou de ser exibida em qualquer superfície. A alternativa de compensá-la trocaria um componente estático por consumidor de estado, para atender exigência que nenhuma norma faz.
- **Provas:** 5 vermelhos no Gate 1 → **821/821** na suíte (67 arquivos) e **9/9** no e2e com axe em zero violação. `tsc`, `eslint`, `prettier` e o inventário textual (1.187 literais, sem diff) reconferidos contra a linha de base de 816 testes.
- **Views do contexto e espelho global regenerados**, com o ZAHV migrando para as tabelas de resolvidos e travados; nota do vault atualizada.

## Próximos passos
- **`/reversa-debugger-fix BUG-20260728-C6LN`**, agora o único bug aberto do registro. A pergunta não é onde pôr o comando, e sim como: `ficha.tsx` projeta as seções a partir do dado clínico e **não aceita conteúdo de fora**, de modo que a escolha é entre dar-lhe ponto de extensão ou acoplar a projeção da fonte a um comando de aplicação. Veredito previsto `spec-gap`, com adendo aditivo.
- **Triar `018/W021`**, herdado da re-extração nº 4 e ainda barato: ou a mensagem de `models/insulina/validacao.ts:179` perde o `(p. 59)`, ou o item declara a exceção da insulina.
- **Chancelar as onze premissas 🟡 novas** e dar o **aval estético da 021**, ambos herdados sem movimento.

## Pendências / bloqueios
- **Um bug aberto, desbloqueado.** A correção do ZAHV não tocou nenhum arquivo que o C6LN alcança (`app.tsx`, `ficha.tsx`, `consulta-puericultura.css`).
- **A pendência de taxonomia sobreviveu ao fechamento, e agora é irreversível pela via normal.** O ZAHV foi travado com `module`/`feature: unclassified`, e a pasta é somente leitura: se `taxonomy.yaml` ganhar os termos propostos, ele **permanecerá sem classificação**. É o custo de fechar antes de decidir, declarado no `index.md` do contexto em vez de virar surpresa de auditoria.
- **`MD-0036` tem gatilho de revisão armado:** se `notas` e `referencias` continuarem sem consumidor na terceira re-extração consecutiva, a espera terá durado mais que a hipótese que a justificava, e a remoção passa a ser a leitura honesta.
- **Produção ainda não tem o SHA desta correção.** O push saiu em `13c87d6`; CI e deploy a confirmar em `/api/v1/status` na retomada.
- Herdados e sem movimento: `MD-0027` a arbitrar, `README.md` reprovando `prettier --check`, `interface.mts` em 684 linhas, **L-10** sem dono, as duas lacunas 🔴 de `gaps.md`, o Codex indisponível e o rastreamento preventivo pausado sem resposta da AHRQ em cinco dias.

## Ponteiros
- **A prova que saiu de graça, e vale mais que o argumento:** a regressão "é o único lugar que declara a proveniência" **já passava antes do corte**. Foi a demonstração empírica de que a declaração nunca dependeu do texto copiado — apenas estava duplicada nele. Quando uma decisão afirma que remover algo não perde nada, procure o teste que já passa: ele transforma retórica em fato.
- **Como reproduzir sem sujar `tests/`:** config do vitest no scratchpad, com `root` no projeto, os dois aliases (`models`, `interface`) e `include` apontando para fora. O arquivo precisa ser `.mjs` sem importar `vitest/config`, que não resolve de fora do repo — um objeto literal basta.
- **O que separou este bug de uma emenda de código:** o teste que afirmava a regra 7 provava que o comportamento era intencional. Teste que afirma o defeito é sinal de que o alvo é a spec, e reescrevê-lo no lugar — nunca apagá-lo — é o que faz a mudança de contrato passar pelo gate em vez de contorná-lo.
- **Onde ler o resultado:** `fix/plan.html` (o plano aprovado antes de qualquer escrita), `evidence/reproduction.md`, os três `fix/CHG-*.diff` e o adendo `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md`. Panorama em `_reversa_bugs/consulta-puericultura/generated/graph.html`.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0036`**.
- **Um adendo vigente**, o primeiro desde a re-extração nº 4: `bug-BUG-20260728-ZAHV-v001.md`, sobre `models-puericultura-consulta/contracts.md`. Os adendos 015 a 022 seguem marcados como superados.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status` · SHA `a422b60` na última conferência; `13c87d6` a confirmar.
