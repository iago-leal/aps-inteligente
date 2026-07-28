---
commit: 7e7627e5ce3d6a6c29bf1c3e809e1a196b4e6708
feature: default_feature
start_time: '2026-07-28T18:19:51.480908+00:00'
status: inactive
---

## O que foi feito
- **A feature 021 percorreu o ciclo forward inteiro numa sessão: `/reversa-to-do` → `/reversa-coding` → `/reversa-sync`, e está commitada e pushada** em `7e7627e`. 24 de 24 ações, nenhuma falha, cinco portões verdes — `typecheck`, `lint`, **808** testes de unidade e integração, **56** roteiros e2e e o inventário textual idempotente em 1161 literais. Adendo 021 vigente, watch **W001–W008**.
- **O `actions.md` foi RECONCILIADO, e não regerado.** Ele fora decomposto sobre um roadmap de oito decisões; a auditoria da sessão anterior produziu D-09, D-10 e D-11, e o roadmap foi reescrito depois. Nenhum ID foi reciclado: T001–T021 conservam o que eram, T022 e T023 nasceram das decisões novas, e o histórico declara cada mudança.
- **A correção é de enquadramento, mas o que a entrega tem de estrutural é o LUGAR dela.** Até aqui a coluna do corpo não existia como enunciado — existia como coincidência de nome de classe, herdada por as cinco primeiras telas reusarem `.calc-regioes`. A sexta precisou de outro arranjo interno, escreveu classe própria e não herdou nada. A coluna passa a morar no `<main>` da `Moldura`, governada pelo `data-apresentacao` pelo qual o cabeçalho já era calibrado desde a 013. Só o eixo horizontal sobe; o vertical fica com cada folha, porque varia com legitimidade.
- **A decomposição encontrou um efeito que o roadmap não declarava, e eu NÃO criei ação para ele.** `.contribuicao-bloco` tem `border-top`, e com `box-sizing: border-box` essa régua media os 720px da caixa enquanto o texto alinhava em 656px; cedida a coluna ao `<main>`, ela encolhe e passa a alinhar-se ao texto — em TODA largura, não só no telefone, que era o que a premissa dizia. Registrei o achado, emendei a premissa do roadmap e o passo 7 do `onboarding.md`, e só então executei. Criar ação sem decisão que a ampare seria repetir o defeito A002 que esta reconciliação veio desfazer.
- **A lição da sessão é sobre ORDEM no TDD, e custou uma ação nova.** T005 pedia que a guarda, escrita antes da correção, passasse nas cinco telas antigas e reprovasse só na rota nova. Executada, reprovou nos **sete** casos — e não por defeito: D-05 mudou o alvo da medição para o `<main>`, e a coluna do `<main>` só nasce em T008. **Guarda generalizada não tem linha de base verde antes da generalização que ela pressupõe.** O critério de RF-03 migrou para **T024**, criada na execução e verificada depois de T013 pelo procedimento do `onboarding.md` §6.
- **A demonstração de T024 provou mais do que pedia.** Comentada a regra da variante `padrao`, a guarda reprovou nomeando `/puericultura/consulta` entre as seis rotas `padrao` e **não** nomeou a home, que é `destaque` — prova de que discrimina por variante, que nenhum critério exigia.
- **Impedi o Prettier de quitar dívida alheia.** Ele reformataria asserções de idade gestacional, cardiologia e risco cardiovascular em `plataforma.spec.ts`, arquivo que **já reprovava no HEAD** (conferido antes de decidir). Aplicar `--write` violaria T015 e RF-04. Restaurei e formatei só o que escrevi.
- **O custo de bundle ficou NEGATIVO, e foi medido, não estimado:** build nos dois estados via `git stash`, 54.175 → 53.766 B gzip, **−409 B**, apesar de crescer 278 B em bruto. Consolidar três declarações repetidas numa regra só comprime melhor do que o que acrescenta.
- **A nota do vault foi atualizada e pushada** (`621cec0` em `notas-obsidian`), com a entrega, a lição de ordem no TDD e o pendente novo do aval estético.

## Próximos passos
- **`/reversa-sync` da 019 e da 020**, que continuam devendo. A dívida agora tem consequência visível: a extração registra a correção da 021 **sem registrar** o que foi corrigido (`O-21-04`).
- **A re-extração `/reversa` nº 4** passa a acumular **seis** adendos vigentes (015–018, 021) e `MD-0022` a **`MD-0029`**. É a primeira que verá uma unit com duas fachadas e a coluna como invariante enunciada.
- **Conferir produção**, que segue no SHA anterior à 019 — agora com **quatro** commits de código de aplicação sem conferência de `/api/v1/status`.
- **Aval estético da 021** e a premissa 🟡 do piso de `22rem`, com as capturas já feitas.

## Pendências / bloqueios
- **Os adendos 019 e 020 continuam ausentes**, e é a dívida de rastreabilidade mais antiga em aberto. `_reversa_sdd/addenda/` salta de `018` para `021`.
- **Produção segue no SHA anterior à 019**, agora com quatro commits de aplicação sem conferência.
- **`e2e/plataforma.spec.ts` reprova `prettier --check`, e já reprovava antes desta feature** (`O-21-06`). Não é regressão, e corrigi-lo aqui violaria RF-04. Fica na mesma família de `O-20-10`.
- **A premissa 🟡 do piso de `22rem`** (`O-21-01`) e o aval estético só o uso arbitra. Nenhuma asserção depende do valor.
- **`_reversa_sdd/domain.md:196` cita `logoComoTitulo`, prop que a `Moldura` não tem mais** — hoje é `comInicio` (`O-21-05`, achado A009). A 021 não depende dela; a re-extração há de corrigir.
- Herdados e sem movimento: **`MD-0027`** a arbitrar, as duas premissas 🟡 da 020, a dívida amarela de `interface.mts` em 684 linhas, `O-19-03`, as três violações vivas de `MD-0020`, as premissas 🟡 da 017 e da re-extração nº 3, e **L-10** sem dono há sete features.
- **Rastreamento preventivo por perfil** segue PAUSADO, sem resposta da AHRQ em cinco dias. Passando de duas semanas, redigir follow-up.

## Ponteiros
- **A regra que esta sessão descobriu, e que vale para toda feature que mude o ALVO de uma guarda:** a guarda generalizada não pode ter linha de base verde antes da generalização que ela pressupõe. Se o alvo da medição muda, a ordem TDD precisa de duas etapas — a reprovação ampla, que é linha de base, e a reprovação seletiva, que só é observável depois da correção. Está em `O-21-03`.
- **Onde a coluna mora agora, e o que NÃO pode entrar lá:** `interface/estilos/moldura.css`, nona folha. Só o eixo horizontal. Qualquer `padding-block`, `gap` ou altura que apareça ali é o sinal de que a folha começou a virar folha-ônibus — é o watch **W004**.
- **O que não se deve fazer com a guarda geométrica:** parametrizar o seletor de classe por rota. Isso reintroduziria no teste o acoplamento a nome de classe que é a causa raiz do defeito no CSS. Está escrito no comentário do próprio teste e nos watch **W002** e **W007**.
- **Por que os dois breakpoints são diferentes (900px e 544px) e não devem ser unificados:** cada um pertence a uma variante e já existia; unificá-los moveria telas que RF-04 manda não mover (**W006**).
- **Como reproduzir a demonstração de RF-03:** comentar a regra da variante `padrao` em `moldura.css` e rodar `npx playwright test plataforma --grep "encaixa na coluna"`. Procedimento completo no `onboarding.md` §6.
- **As capturas da 021** estão no scratchpad da sessão, não no repo: ficha em 1280/375 e home ao pé nas duas larguras.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0029`**. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017, 018 e **021**; as emendas `MD-0020`/`MD-0021` e as decisões `MD-0022` a `MD-0029` vivem só como ficha.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`.
