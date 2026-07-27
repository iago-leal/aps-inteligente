---
commit: 33c4a31856102875f3c76be86e54a1fb05ebc619
feature: default_feature
start_time: '2026-07-27T21:33:40.713530+00:00'
status: active
---

## O que foi feito
- **A feature 018 atravessou três auditorias e quatro passagens do ciclo, e começou a virar código.** A sessão correu `/reversa-audit` → `/reversa-clarify` → `/reversa-plan` → `/reversa-to-do` → `/reversa-audit` → `/reversa-plan` → `/reversa-to-do` → `/reversa-coding`. O `actions.md` foi de 55 para **62 ações**; o `roadmap.md`, de 13 para **20 decisões**.
- **A segunda auditoria achou quatro defeitos altos, e o traço comum era um só: a fronteira do que seria reescrito ficara mais estreita que a fronteira do que seria inventariado.** O plano mandava reescrever `models/*/validacao.ts`; a medição encontrou 18 literais ali contra **47** nos 17 arquivos de regra que ficavam de fora. Mais três: o teste do manifesto fora escrito com o critério oposto ao do próprio contrato; o subtítulo da home e a `description` do manifesto são o **mesmo literal byte a byte** e só um tinha ação; e a régua de RF-08 não via as dezessete asserções `toContain` de `formatar-plano.test.ts`, o arquivo mais acoplado ao texto de toda a suíte.
- **As cinco decisões do usuário viraram D-16 a D-20**, propagadas por seis artefatos: frente de reescrita **por camada** e não por lista de arquivos; **duas formas** de verificação da descrição da plataforma, positiva na home e negativa no manifesto; par duplicado reescrito **num ato só**, com igualdade asseverada; régua de RF-08 em **duas famílias** de asserção; e asserção **fraca** da cláusula de privacidade, que exige a afirmação sem congelar a redação.
- **A terceira auditoria achou um alto, de espécie nova: a propagação alcançou o corpo dos artefatos e deixou para trás as contagens que os resumem.** O roadmap contava "quatro verificadores" em três lugares e cinco num quarto, quando há sete. O reparo não foi trocar o número: foi **tirar a contagem do plano** e apontá-la para T055, onde ela vive. É a doutrina de L-13 — contagem é dado gerado, não número escrito em prosa — aplicada ao artefato que a formulou.
- **O `/reversa-coding` começou, e três ações estão concluídas.** **T001**: princípio **IX** em `.reversa/principles.md` ("A prosa do produto tem norma declarada, e a norma é verificável"), o primeiro deste projeto que não vem da doutrina importada do `/clarificar` — os oito anteriores regem *como se chega* ao artefato, e este rege *como o artefato fala*; mais `.reversa/principles-impact-20260727.md`, com cinco sugestões de template, das quais só uma altera critério de conclusão. **T006**: `scripts/inventariar-textos.mts`, extrator por árvore sintática do TypeScript, sem dependência nova. **T007**: a medição.
- **A medição refutou a régua do plano, e o modo como refutou é o que importa.** Sob o corte de três palavras de §2.1, 447 candidatos — dentro da ordem de grandeza prevista. Mas dos 1837 literais abaixo do corte, **164 são texto exibido**, e entre eles estão rótulos de classificação transcritos da Caderneta: `Eutrofia`, `Magreza acentuada`, `Obesidade grave`, `Sobrepeso`. São classe `citacao`, e ficariam fora da linha de base de RF-07 — **o guarda da citação nasceria cego exatamente onde a feature mais precisa dele.** O usuário arbitrou pela união de posição sintática e corte de palavras. Contagem nova: **645 candidatos** (531 no código, 114 no README), sendo 198 só por posição, 151 só por palavras e 296 pelas duas.
- Suíte verde na entrada (**45 arquivos, 642 testes**) e `typecheck` verde na saída. Nenhum código de aplicação foi tocado: o que existe de novo é um script de tempo de desenvolvimento e o princípio.

## Próximos passos
- **Registrar a régua nova como decisão.** Ela altera D-03 e ainda não tem `D-NN` no roadmap nem ficha em `.harness/decisoes/`. É a primeira coisa da retomada, antes de qualquer classificação: quem mexer no extrator depois vai querer entender por que a régua tem duas metades.
- **Corrigir a premissa de dimensionamento do roadmap §4**, que previa 270 a 320 e está refutada por 645.
- **Retomar o `/reversa-coding` em T002**, a primeira metade de `docs/redacao.md`, que depende de T001 e está liberada. A cadeia crítica segue por T008 → T009-T013 → T014 → T053 → T015.
- Manter no radar a **re-extração `/reversa` nº 4**, que absorveria a 017 e superaria os adendos 015, 016 e 017.

## Pendências / bloqueios
- **59 das 62 ações seguem `[ ]`.** A sessão fez T001, T006 e T007; o `progress.jsonl` tem as três linhas e nenhuma falhou.
- **A classificação de 645 candidatos é o gargalo declarado da feature, e ele cresceu.** O risco médio do roadmap §9 confirmou-se pelo lado ruim: o número dobrou em relação à previsão. Se a fase se mostrar inviável numa sessão, o escopo se renegocia ali — é o que o próprio plano manda fazer.
- **Os 1644 literais fora da régua não foram inspecionados um a um.** São, em quase totalidade, nome de classe CSS e discriminante de tipo, mas "quase" não é "todos", e a conferência pertence a T015.
- **`interface/calculadora/resultado.tsx` saltou para 39 candidatos** e passou a ser o arquivo mais denso do código, à frente de `models/puericultura/fonte-clinica.ts` (35). T025 o alcança pela cláusula "demais literais autorais do módulo", mas a concentração sugere ação própria.
- **`W022` da 017 continua a pendência com prazo.** Enquanto T049 não o reescrever, a spec afirma o contrário do que o código fará, e a próxima verificação de regressão acusará vermelho legítimo sobre decisão deliberada.
- **Três premissas 🟡 da 017 a validar pelo prescritor**: os 1095 dias da correção de idade (D-16), a idade cronológica governando a posição de medida no prematuro, e o escore z com uma casa decimal (D-13).
- **Dívida de higiene alheia à feature:** `npm run format:check` segue acusando centenas de arquivos, quase todos documentação pré-existente do Reversa. Não é gate do CI.
- Rastreamento preventivo por perfil — PAUSADA (26/07/2026), aguardando a chave da API USPSTF, solicitada em 23/07/2026 a `uspstfpda@ahrq.gov`, sem resposta.

## Ponteiros
- **A regra que a sessão descobriu, em uma linha:** régua de candidatura que conta palavras mede o tamanho do literal, não o fato de ele ser exibido — e foi por isso que ela perdeu justamente os rótulos clínicos curtos, que são citação e são o que mais precisa de guarda.
- **A doutrina que se ampliou:** verificação nova se confere primeiro pela falha, e **medição nova se confere contra o caso que ela deveria acusar**. A segunda metade nasceu quando a régua de RF-08 se mostrou cega ao arquivo que a reescrita mais quebra.
- **Onde a medição de T007 está registrada:** `actions.md`, seção "Notas de execução", com a tabela por camada, a repartição por metade da régua e as três consequências para o plano.
- **O aparato tem sete verificadores, e a lista canônica é a de T055**: norma, congelamento, citação, descrição da plataforma nas duas formas, integridade do manifesto, igualdade do par duplicado e cláusula de privacidade. O roadmap deixou de contá-los e passou a apontar a lista.
- **A regra de `MD-0016`, em uma linha:** a superfície textual é dado gerado; a classe de cada literal é decisão declarada. O que a máquina extrai é o literal; o que ela nunca infere é a que classe ele pertence.
- **A regra de `MD-0017`, em uma linha:** watch item revogado por decisão posterior é reescrito onde nasceu, apontando a ficha que o revogou — nem apagado, nem contornado por item novo noutro arquivo.
- Feature ativa: **018**, estágio `to-do` no ponteiro, execução iniciada. Nove arquivos em `_reversa_forward/018-revisao-linguagem-textos/`, mais `audit/cross-check.md` e `progress.jsonl`.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a `MD-0018`. `MD-0014` segue `superado-parcialmente`. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016 e 017; os de 001 a 014 foram superados pela re-extração nº 3 (commit `ab075ac`).
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`. SHA `7e0a522`; **esta sessão não tocou código de aplicação, logo produção segue nele.**
