---
commit: a422b60b2cbbe494fc5723d42865255f327943b7
feature: default_feature
start_time: '2026-07-28T21:47:30.394951+00:00'
status: inactive
---

## O que foi feito
- **A dívida de sincronização acabou.** Esta sessão gerou **três** adendos numa passagem de `/reversa-sync`: o da feature ativa **022** e os das **019** e **020**, que deviam desde 28/07. `_reversa_sdd/addenda/` não salta mais de `018` para `021`, e a re-extração nº 4 passa a ter oito adendos vigentes, 015 a 022. Nenhuma das duas features em dívida tinha ação aberta, de modo que o menu de sincronização parcial não se aplicou.
- **O adendo 022 registra uma INVERSÃO, e é o que ele tem de mais útil.** Até esta feature, o código estava atrasado em relação à extração: `architecture.md` §1, §2 e §4 afirmavam desde a primeira passagem que `infra/database.ts` era usada só pelo healthcheck, e o único importador do módulo era um **teste**. A partir dela, é a extração que está atrasada — `code-analysis.md` e `architecture.md` ainda descrevem a rota como sem I/O (`O-22-07`). Catorze impactos: 6 `regra-alterada`, 5 `delta-de-contrato-externo`, 2 `componente-novo`, 1 `delta-de-dados`.
- **Levei ao adendo a correção de referência que o `legacy-impact.md` da 022 pediu.** O contrato e o roadmap dizem revogar o watch **W006** da feature 003; o item que afirma "o endpoint não consulta o banco" é o **W005**. O W006 trata da suíte de contrato com caso negativo, e esse permanece vigente e verde, preservado e ampliado pela 022.
- **O adendo 020 aponta a unit de puericultura para o ADENDO 017, e não para `code-analysis.md`.** A extração nº 3 é de 23/07 e é anterior à feature 017: ela não conhece a unit. Escrever o apontador para o artefato-base repetiria a confusão que o adendo existe para desfazer. Corrigi também a contagem de folhas de estilo — 019 e 020 se declararam **ambas** "sétima", por terem corrido em paralelo, e o total corrente é **nove**.
- **A feature 022 estava INTEIRA no working tree, e foi commitada aqui.** O código do healthcheck, os três contratos, as fichas `MD-0030` a `MD-0032` e a pasta da feature não estavam no histórico. Antes de commitar, rodei os portões de novo em vez de confiar na nota de execução: `typecheck` e `lint` verdes, **816** testes em 67 arquivos. Dois commits, em sequência lógica: `b58117a` (a feature) e `a422b60` (os três adendos).
- **Produção foi conferida, e é a primeira vez em que a conferência diz algo sobre o BANCO.** Cinco commits de aplicação vinham sem conferir `/api/v1/status`. CI verde nos três jobs, deploy no ar, e `npm run status:conferir` respondeu `a422b60 · publicado há 0 min · ambiente producao · **banco íntegro**`. O healthcheck consultou a Neon de verdade e ela respondeu; o vínculo que a extração afirmava há três passagens existe agora em runtime.
- **A nota do vault foi atualizada e pushada** (`20827e9` em `notas-obsidian`): a entrega da 022, o fim da dívida de sincronização e o `PRÓXIMO PASSO` reescrito, que apontava para o `/reversa-coding` da 020 e estava obsoleto havia duas sessões.
- Encerramento não versionado: o estado de sessão ficou como mudança pendente no working tree.

## Próximos passos
- **A re-extração `/reversa` nº 4**, que agora é o único gesto grande em aberto. Absorve **oito** adendos vigentes (015 a 022) e `MD-0022` a **`MD-0032`**. É a primeira que verá uma unit com duas fachadas, um unit de domínio não clínico, a coluna como invariante enunciada e uma rota de API com I/O.
- **Fechar as três dívidas que só ela fecha:** **L-07** (`domain.md` §7.2 ainda cita `logoComoTitulo`, prop que a `Moldura` não tem mais), **L-11** (a cifra de testes de `architecture.md` §5, hoje muito defasada) e a descrição da rota de status como sem I/O.
- **Aval estético da 021** e a premissa 🟡 do piso de `22rem`, com as capturas já feitas.
- **Observar `ambiente` em pré-visualização** (`O-22-03`), a única premissa 🟡 que a 022 deixou: verificável no primeiro deploy de preview, pelo passo 9 do `onboarding.md` da feature.

## Pendências / bloqueios
- **Nada do ciclo forward está em aberto**, e nada do trabalho desta sessão ficou fora do histórico. O repositório está limpo, CI verde, produção no SHA `a422b60` e conferida.
- **`MD-0027` continua a arbitrar.** A isenção nominal no verificador de citação foi tomada na execução da 020, não pelo usuário, e a própria ficha a declara aberta a revisão enquanto a lista tiver uma entrada só. O adendo 020 lhe deu seção própria, o que torna a leitura mais fácil, e não dispensa a decisão.
- **`README.md` reprova `prettier --check`, e já reprovava no HEAD** (`O-22-02`), na mesma família de `O-21-06` (`e2e/plataforma.spec.ts`) e `O-20-10`. Dívida de formatação alheia, que uma feature não deve quitar de passagem.
- Herdados e sem movimento: as duas premissas 🟡 da 020, a dívida amarela de `interface.mts` em 684 linhas, `O-19-03`, as três violações vivas de `MD-0020`, as premissas 🟡 da 017 e da re-extração nº 3, e **L-10** sem dono há oito features.
- **Rastreamento preventivo por perfil** segue PAUSADO, sem resposta da AHRQ em cinco dias. Passando de duas semanas, redigir follow-up.

## Ponteiros
- **A regra desta sessão, e ela é sobre o que um adendo É:** o adendo anota, não corrige. Quando o `legacy-impact.md` de uma feature traz erro de referência — aqui, W006 onde é W005 —, o lugar de acertar é o adendo, e nunca o artefato da extração. Vale também para apontador: adendo de feature que a extração-base não conhece aponta para o **adendo anterior**, e não para `code-analysis.md`.
- **Por que o healthcheck responde 200 com o banco caído**, que é a leitura contraintuitiva e a que mais gera dúvida na retomada: as seis calculadoras são integralmente cliente e seguem servindo com o banco fora, de modo que 503 afirmaria uma queda que não houve. Está em `MD-0031`, e o watch **W003** da 022 o vigia.
- **O acoplamento mais frágil que a 022 deixou:** `ehEstouroDeTempo` reconhece o estouro de conexão por uma **frase** que o driver emite ("Connection terminated due to connection timeout"). Atualização de `pg` é gatilho de revisão. É o watch **W007**, o único de tipo redação, e o achado A004 conta como ele apareceu.
- **Como reproduzir o estado degradado sem quebrar nada:** `npm run db:down` produz `causa: "conexao"`; `APS_TIMEOUT_SAUDE_MS=1` com o banco de pé produz `tempo_esgotado`. Procedimento nos §5 e §6 do `onboarding.md` da 022.
- **Como conferir produção agora:** `npm run status:conferir` lê idade do deploy e estado do banco, e `--exigir-saudavel` promove degradado a saída não-zero sem tocar na semântica dos códigos de defasagem.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0032`**. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017, 018, **019**, **020**, 021 e **022**; as emendas `MD-0020`/`MD-0021` vivem só como ficha.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`.
