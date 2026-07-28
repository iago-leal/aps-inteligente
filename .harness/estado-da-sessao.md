---
commit: 19c8edd127560a686a72c7377a723fa844418717
feature: default_feature
start_time: '2026-07-27T22:33:42.647729+00:00'
status: inactive
---

## O que foi feito
- **`MD-0021` executada e entregue: as telas passam a ler o nome da fonte do domínio.** Onze sítios em que `NOME_PUBLICADO` fazia ofício de **rótulo bibliográfico** deixaram de reescrever o nome à mão: os cinco subtítulos `Fonte única:`, as quatro linhas de proveniência dos painéis de resultado, o cabeçalho do material de referência da cardiologia e a linha de fonte do plano copiável. O **texto exibido permanece byte a byte** o de antes, conferido par a par nos cinco subtítulos por script de igualdade, e não por confiança na leitura. Commit **`19c8edd`**, pushado, CI verde em 2 min 04 s e `/api/v1/status` respondendo `19c8edd1275…`, tudo conferido **antes** do encerramento.
- **A sessão começou por uma pergunta de leitura, e a resposta virou o trabalho.** O usuário não entendeu o que era `NOME_PUBLICADO`; explicá-lo expôs que a constante existia como oráculo do verificador mas não como fonte do texto, e que sete literais reescreviam o nome à mão. Daí o pedido de consumo.
- **Duas decisões foram levadas ao usuário, porque mudavam o trabalho, e as duas voltaram na opção recomendada.** A **classe** de `NOME_PUBLICADO` fica em `identificador`, contra o que `MD-0020` prometera no seu descarte (3); e o **escopo** cobre só os rótulos bibliográficos, deixando fora o catálogo da home e a prosa corrida, que mudariam texto visível.
- **A promessa de `MD-0020` foi emendada com razão, não contornada.** Confirmei empiricamente que a linha de base da citação **não contém** nenhum dos cinco nomes: reclassificá-los para `citacao` os faria surgir como cinco afastamentos não autorizados, obrigando a alargar `AFASTAMENTOS_AUTORIZADOS`, cuja semântica é "desvio da forma impressa", para guardar cinco não-desvios. A razão positiva pesou mais que a recusa: **`congelamento.test.ts` já protege os cinco literais**, e a força de guarda certa para um nome que muda a cada edição da fonte é "mudança deliberada", não "proibida salvo duas exceções".
- **O achado da execução vale mais que a decisão principal, e quase passou despercebido.** Interpolar a constante converteria os subtítulos de `StringLiteral` em template com expressão, e **o extrator do inventário só registra `NoSubstitutionTemplateLiteral`**: os cinco sairiam calados da superfície verificada, justamente na linha que nomeia a fonte de cada calculadora. Só notei porque o gerador **não** reclamou dos subtítulos ao rodar, quando deveria ter reclamado. Silêncio onde se esperava ruído foi o sinal.
- **A varredura mediu o buraco, em vez de estimá-lo:** **259 fragmentos de template interpolado** estão fora do inventário em `interface/`, `models/` e `pages/`, e **três violam `MD-0020` sem que nada reprove**: `interface/calculadora/formatar-plano.ts:21`, `models/gestacao/calculadora.ts:158` e `models/insulina/regra-titulacao-basal.ts:160`. O primeiro é o **plano copiável**, o texto que o prescritor cola no prontuário.
- **A resposta ao achado foi não alargar o buraco, e reportá-lo.** As cinco telas **concatenam** em vez de interpolar, com a razão escrita ao lado de cada uma, de modo que a prosa dos subtítulos continua sob a régua. Estender o extrator a `TemplateExpression` custaria classificar quase 200 literais novos: é trabalho de feature, e não se faz de passagem.
- **A ficha `MD-0021` foi escrita, o índice atualizado e `docs/redacao.md` acompanhou**, com §2.3 alargada para nomear o caso (a classe `identificador` significa "fora do alcance da revisão", não só "código") e §3.2 registrando que a exceção deixou de depender de quem escreve lembrar da forma certa.
- **A nota do vault não tinha registro de `MD-0020`**, apesar de a emenda ser de 27/07: a nota fora atualizada às 18:48 e a emenda saiu à noite. Entraram os dois blocos, o de `MD-0020` e o de `MD-0021`, e a linha de Retomada passou a apontar o achado do extrator como candidato a feature própria.
- Encerramento não versionado: o estado de sessão ficou como mudança pendente no working tree.

## Próximos passos
- **A re-extração `/reversa` nº 4 continua a candidata mais forte**, e ganhou peso: além dos quatro adendos vigentes (**015, 016, 017, 018**) e das dívidas **L-07** e **L-11**, ela agora precisa absorver **duas emendas que não têm adendo em `addenda/`**, `MD-0020` e `MD-0021`, ambas executadas fora do ciclo forward.
- **Candidata a feature nova, nascida nesta sessão: fechar a cegueira do extrator a `TemplateExpression`.** É a de maior consequência clínica das pendências abertas, porque uma das três violações vive no plano copiável. O trabalho tem forma conhecida: estender `visitar()` em `scripts/inventariar-textos.mts`, classificar o que aparecer em `scripts/textos/classes/`, e corrigir os três travessões que a régua passar a enxergar.
- **Fronteiriço, deixado por decisão de escopo:** `interface/risco-cardiovascular/resultado.tsx` escreve `Pooled Cohort Equations (ACC/AHA 2013)` numa linha de proveniência, o mesmo slot bibliográfico dos outros, mas em forma divergente da publicada. Trocá-la mudaria texto visível, então é revisão de redação e não refatoração.
- **Abrir ticket para L-10**, as duas violações axe toleradas em `e2e/axe-baseline.json`. Dívida sem dono há quatro features.

## Pendências / bloqueios
- **Nada em curso.** A entrega está no histórico, pushada, com CI verde e produção no SHA. Não há feature a meio caminho.
- **Nenhuma pendência de deploy.** Foi a segunda sessão seguida em que a confirmação não passou para a retomada.
- **Três violações vivas de `MD-0020`** seguem no código, invisíveis ao verificador, e são pendência declarada, não esquecimento. Estão nomeadas por arquivo e linha na ficha `MD-0021`.
- **As cifras erradas continuam nos artefatos da 018** (`legacy-impact.md` e `reconciliacao-spec.md` §4 dizem "52 para 59"; o certo é 45 → 52). O adendo declara a correção; a re-extração deve ler o adendo, não os dois.
- **Três premissas 🟡 da 017** a validar pelo prescritor, somadas às 13 da re-extração nº 3.
- **Rastreamento preventivo por perfil** segue PAUSADO, aguardando a chave da API USPSTF pedida em 23/07 à AHRQ, sem resposta em **cinco dias**. Passando de duas semanas, redigir follow-up na thread.
- `npm run format:check` segue acusando centenas de arquivos de documentação pré-existente. Não é gate do CI.

## Ponteiros
- **A regra que esta sessão produziu:** **verificador só vale sobre a superfície que ele enxerga, e a forma do código decide o que ele enxerga.** Quando a escolha entre duas formas equivalentes muda o que o gate alcança, ela deixou de ser questão de estilo. É por isso que as telas concatenam, e a feiura tem comentário ao lado em cada uma delas.
- **O sinal que denunciou o buraco foi a ausência de ruído.** O gerador do inventário deveria ter parado pedindo classe para os cinco subtítulos reescritos, e não parou. Num projeto que confia em falha barulhenta, **silêncio onde se esperava barulho é o próprio defeito**, e vale mais atenção que uma falha.
- **Por que a classe não virou `citacao`, em uma linha:** cumprir a promessa exigiria alargar uma lista de afastamentos autorizados para nela guardar cinco não-afastamentos, que é desfazer o gate para passar por ele. A alternativa correta e descartada por proporcionalidade está anotada na ficha: o guarda **confunde hoje** "citação reescrita" (um sumido pareado com um surgido) com "citação nova entrando no produto" (surgido sem par), e só a primeira é desvio da fonte. Fica como trabalho próprio, jamais como efeito colateral de refactor.
- **A linha de base da citação (`tests/apoio/citacao-linha-de-base.json`) segue com um único commit**, e `e2e/axe-baseline.json` também. Conferido por `git status` depois da entrega, e não presumido. É o W007 da 018 e o modo de falha mais silencioso daquela feature.
- **Onde o oráculo do nome vive agora:** `NOME_PUBLICADO` nos cinco `models/*/fonte-clinica.ts`, lido por `tests/unit/textos/apoio.ts` (`semNomesDeFonte`) para o verificador **e** pelas telas para exibição. Uma constante, dois consumidores, nenhuma cópia à mão nos rótulos bibliográficos.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0021`**. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017 e 018; as emendas `MD-0020` e `MD-0021` vivem só como ficha, e a re-extração nº 4 precisa saber disso.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`. SHA **`19c8edd`**, com CI verde e liveness conferida em 28/07.
