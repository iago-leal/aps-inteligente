---
commit: d8c49f0a90e83f9cb8ce56d355694cd91f69f69d
feature: default_feature
start_time: '2026-07-28T16:18:03.305693+00:00'
status: inactive
---

## O que foi feito
- **A feature 020 foi CODADA de ponta a ponta: 46 de 46 ações, nenhuma falhou.** `/reversa-coding` percorreu as cinco fases na ordem do `actions.md`, e a entrega saiu com os cinco portões verdes — `typecheck`, `lint`, **808** testes de unidade e integração, **54** roteiros e2e e o gerador do inventário textual idempotente. Commit `d8c49f0`, pushado para `aps-inteligente/main`.
- **O oráculo de transcrição fez exatamente o que foi projetado para fazer, e é o achado da sessão.** Escrito em `T007`, antes da primeira ficha, ele conferiu 386 textos citados contra o congelado das pp. 66–76 das duas tiragens e **pegou quatro rótulos partidos pelo layout em duas colunas** — "Convulsões ou movimentos anormais" (p. 69), a linha de saúde bucal (p. 71) e "Dificuldades para respirar (FR>50 ou <30)" (pp. 73 e 74). Cada um foi inspecionado nas quatro variantes antes de virar exceção declarada com motivo. A lista fechou em **4 de 10**, com folga confortável sobre o limiar de reabertura de D-12.
- **A premissa 🟡 de risco médio do plano caiu para verde, e a razão é uma regra de normalização, não uma exceção.** Remover as sequências de sublinhado — as linhas onde se escreve à mão — antes de comparar resolveu quase tudo: a linha de preenchimento não é texto, e retirá-la é ler a página, não afrouxar o guarda. Sem isso, "Convulsões ou movimentos anormais" nunca ocorreria contíguo em variante alguma.
- **`models/puericultura` passa a ter duas fachadas**, primeira unit da plataforma a tê-las. ADR 0011 fica intacto porque o que ele proíbe é segunda **fonte**, não segunda fachada: é a mesma caderneta, em outra seção. As dez fichas são dado declarado, **278 campos** com a página de origem em cada um, dez módulos todos abaixo de 400 linhas.
- **`MD-0027` é a decisão mais consequente da sessão, e foi tomada na execução.** O verificador da classe citação da 018 reprovava *qualquer* citação nova, e esta é a primeira feature depois dela a trazer fonte clínica. A saída fácil — regerar `citacao-linha-de-base.json` — é o desfecho que `MD-0018` existe para impedir. Em vez disso, o guarda ganhou isenção **nominal** para subárvore com oráculo mais forte, hoje com uma entrada só. A ficha declara que a decisão não passou pelo prescritor e que o caminho de volta é barato.
- **`MD-0028` fixou o critério que reparte os sinais de alerta** entre subjetivo e objetivo: vai para **O** o campo cuja constatação exige exame ou medição, e para **S** o sintoma relatado. O `requirements.md` dava o critério em duas palavras e a página traz trinta itens heterogêneos; sem regra escrita, as dez fichas sairiam internamente incoerentes.
- **A medição de bundle provou o que RF-11 pede, e não por inferência.** Quatro valores `L/M/S` colhidos de `peso-idade-0-5-masculino.ts` foram procurados nos chunks do primeiro carregamento: aparecem em `/puericultura/crescimento` e **não** aparecem em `/puericultura/consulta`. A rota nova custa 302 kB gzip, **69,5 kB menos** que a do crescimento, apesar de ter interface maior.
- **A nota do vault foi atualizada** com a entrega, as duas fichas novas e os dois itens novos de "aguardando" — a arbitragem de `MD-0027` e as duas premissas 🟡 da 020.

## Próximos passos
- **`/reversa-sync` da 020**, com `legacy-impact.md` e `regression-watch.md` prontos e 15 watch items a destilar. Logo depois, o da **019**, que continua devendo desde que a `T033` fechou.
- **A re-extração `/reversa` nº 4** passa a acumular **cinco** adendos vigentes, as duas dívidas herdadas e `MD-0022` a **`MD-0028`**. É a primeira que verá uma unit com duas fachadas.
- **Conferir produção**, que segue no SHA anterior à 019 — agora com três commits de código de aplicação sem conferência de `/api/v1/status`.
- **Arbitrar `MD-0027`**, que é o único item desta sessão em que a decisão foi tomada sem o prescritor e cuja reversão é barata.

## Pendências / bloqueios
- **`MD-0027` foi decidida na execução, não antes.** Se a leitura for de que a isenção enfraquece o gate da 018, desfazê-la custa uma linha, porque a lista tem uma entrada só. É o item de severidade **HIGH** do `legacy-impact.md`.
- **Dívida amarela nova:** `scripts/textos/classes/interface.mts` foi de 589 para **684 linhas**, e já estava acima do teto de 400 antes desta feature. É mapa de declarações, não lógica, mas a exceção que o README concede às tabelas da OMS não o alcança nominalmente (`O-20-04`).
- **A 019 fecha em 34/34 e ainda não tem adendo**, e agora a 020 fecha em 46/46 e também não.
- **Produção segue no SHA anterior à 019.**
- **As duas premissas 🟡 da 020 continuam abertas**, e ambas só o uso arbitra: a ficha sugerida entre duas consultas previstas, e a colocação dos três campos resistentes do mapa SOAP.
- **Cobertura de ramos do submódulo novo em 82,8%**, contra 95,2% do conjunto. O limiar contratual é global e continua satisfeito (`O-20-05`).
- **`format:check` reprova 587 arquivos no estado anterior a esta feature.** Dívida pré-existente, não regressão; os arquivos novos desta entrega estão formatados (`O-20-10`).
- **`O-19-03` herdado:** o comando de fechar do `Dialog` do Primer tem nome acessível em inglês, e a 020 usa o mesmo painel.
- **Três violações vivas de `MD-0020`**, as cifras erradas nos artefatos da 018, as três premissas 🟡 da 017 mais as 13 da re-extração nº 3, e **L-10** sem dono há seis features.
- **Rastreamento preventivo por perfil** segue PAUSADO, sem resposta da AHRQ em cinco dias. Passando de duas semanas, redigir follow-up.

## Ponteiros
- **A regra que esta sessão confirmou na prática, e vale para qualquer transcrição futura:** o guarda vem antes do que ele guarda. O oráculo escrito antes das fichas pegou quatro erros que uma releitura no fim quase certamente perderia — e os pegou um a um, no momento em que cada ficha entrou, que é quando corrigir custa menos.
- **Onde a normalização do oráculo mora, e por que ela é regra e não exceção:** `tests/unit/dominio-puericultura/consulta-transcricao.test.ts`. Ela remove sublinhados e colapsa espaço antes de comparar. Mexer nela sem entender isso é o modo mais fácil de cegar o guarda sem perceber.
- **Os módulos das fichas usam extensão `.ts` explícita** nos imports de valor, para que `scripts/textos/classes/models-puericultura-consulta.mts` os importe pelo Node. O `tsconfig` autoriza desde a 017, e o build de produção foi conferido (`O-20-09`).
- **Como regerar o congelado do oráculo:** `node scripts/congelar-fichas-caderneta.mts`, com os PDFs em `referencias/caderneta/` e o `pdftotext` do poppler. `git diff` vazio significa origem intacta. Quarto gerador idempotente do projeto.
- **O que a 020 tem de diferente das cinco calculadoras anteriores:** o produto dela é um **texto de registro**, não um número, e o contrato da forma está em `interfaces/registro-soap.md`. É a única saída da plataforma que atravessa para fora por colagem.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0028`**. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017 e 018; as emendas `MD-0020` e `MD-0021` e as decisões `MD-0022` a `MD-0028` vivem só como ficha.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`.
