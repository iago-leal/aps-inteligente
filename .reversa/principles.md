<!--
Mantido por /reversa-principles.
Numeração romana estável, jamais reciclada. Princípios aposentados não são apagados:
recebem data de aposentadoria e migram para o final do documento.
-->

# Princípios do projeto

> Projeto: `aps-inteligente`
> Data da última alteração: `2026-07-27`
> Mantido por: `/reversa-principles`

## Preâmbulo — Fluxo `/clarificar` (SDD/TDD)

Os princípios abaixo derivam de uma única doutrina: o fluxo `/clarificar`, command
cross-harness (Claude Code + Gemini) que converte uma queixa crua em spec validada e só
então em código. A doutrina canônica vive em `~/.claude/docs/{pccp,sdd,tdd}.md`; as
decisões que a sustentam, em `MD-0011/0016/0020/0021`. Detalhe dos moldes SDD em
`sdd.md`, da doutrina de testes em `tdd.md`, do protocolo em `pccp.md`.

## Princípios ativos

### I. Invariante-mãe: a spec é a fonte de verdade

**Descrição.** A spec é a fonte de verdade; o código é projeção descartável dela e dos
testes (`MD-0016`). O método só é eficaz se `{decisões + specs + testes}` reconstroem a
funcionalidade (equivalente, por agente competente) sem o código. Em conflito
código × spec, reconcilie o código, nunca a spec.

**Exemplo de aplicação.** Um bug revela que o código valida datas de forma diferente do
que a spec descreve. A correção não é ajustar a spec ao comportamento observado, e sim
corrigir o código para o que a spec determina; se a spec estiver errada, ela muda
primeiro, por decisão registrada, e o código a segue.

**Impacto em templates.**
- `requirements-template.md`: o requirements é artefato de spec; nenhuma seção pode ser preenchida a partir do código sem confidência marcada.
- `roadmap-template.md`: decisões técnicas (D-NN) devem citar a spec que as origina, não o código existente.
- `actions-template.md`: ações que alterem comportamento exigem atualização da spec correspondente antes do `[X]`.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### II. Cadeia de derivação: nada nasce sem origem validada

**Descrição.** Todo artefato tem origem rastreável no elo anterior do contrato:
`Demanda validada → P_n → RF-NN → spec (PRD/Arquitetura/…) → TESTS_SPEC + tests/ → código`.
Artefato sem origem validada na cadeia não existe legitimamente.

**Exemplo de aplicação.** Surge a ideia de adicionar um endpoint "útil" durante a
implementação. Sem um `RF-NN` que o origine, o endpoint não entra: ou se volta à
clarificação para validar a demanda que o justificaria, ou ele é descartado.

**Impacto em templates.**
- `requirements-template.md`: cada RF deve apontar o `P_n` (problema validado) de que deriva.
- `roadmap-template.md`: decisões e deltas citam os RF-NN que os motivam.
- `actions-template.md`: cada ação rastreia o RF-NN que realiza.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### III. Clarificação precede qualquer solução

**Descrição.** A Fase 1 (`/clarificar`) é read-only e precede qualquer solução: não muta
arquivo algum. Separa a Queixa (o pedido de superfície) da Demanda (o problema de fundo);
quando não bastam, sonda SIFE. Exige o real (`EXAME_DO_REAL`: código, schema, logs, fluxo
efetivo, nunca o idealizado) e marca tudo `[F]` fato / `[I]` inferência / `[H]` hipótese —
jamais promovendo `[I]` ou `[H]` a `[F]`. Diante de fragilidade, roda
clarifica → steelmana → contesta, com prova. Havendo arquitetura com mais de uma saída
defensável, para na decisão compartilhada: ≥3 opções com prós, contras, recomendação e
porquê. Esgotado o orçamento (`MAX_RODADAS_CLARIF=2`), assume a `[H]` mínima e sinaliza o
que a invalidaria.

**Exemplo de aplicação.** O pedido é "adicione cache ao endpoint lento" (Queixa). A
clarificação examina logs e schema reais e descobre que a lentidão vem de uma query N+1
(Demanda). A solução muda de natureza antes de qualquer linha de código, e a suposição
inicial fica registrada como `[H]` invalidada pelo `EXAME_DO_REAL`.

**Impacto em templates.**
- `requirements-template.md`: as seções de esclarecimentos e lacunas absorvem as marcas `[F]/[I]/[H]`; `[DÚVIDA]` corresponde a `[I]`/`[H]` não resolvidas.
- `roadmap-template.md`: decisões com mais de uma saída defensável exigem ≥3 alternativas registradas antes da escolha.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### IV. Portão G1: nenhuma solução antes de `/travar`

**Descrição.** Nenhuma solução antes de os requisitos serem travados. `/travar` fixa o
seed (Queixa×Demanda validada, `P_n`, `[F]/[I]/[H]`, não-objetivos, RF/RNF preliminares)
e libera a Fase 2. Por proporcionalidade (Princípio VIII), tarefa pequena para aqui.

**Exemplo de aplicação.** Concluída a clarificação de um script utilitário simples, o
seed é travado e a execução segue direto, sem coleção SDD completa: o portão G1 é o
ponto de parada suficiente para tarefas pequenas.

**Impacto em templates.**
- `requirements-template.md`: o documento só é considerado fonte após o travamento do seed; antes disso, tudo é preliminar.
- `roadmap-template.md`: o roadmap não pode nascer de requirements não travados.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### V. Fase 2 (`/spec`): a única que escreve, e proporcional

**Descrição.** A Fase 2 (`/spec`, opt-in, só após G1) é a única que escreve. Lê `sdd.md`
e projeta a coleção SDD proporcional à categoria: trio crítico (PRD, Arquitetura, Tarefas)
sempre; API/Regras/Dados/Fluxos conforme a superfície real. Mapeamento: Demanda vira
problema do PRD; cada `P_n` vira `RF-NN`; não-objetivos viram escopo negativo; `[H]`
pendente vira risco declarado, nunca premissa silenciosa; prioridades viram `RNF-NN`
(RNF sem RF que sirva é descartado). Emite em `spec/` (`SPEC-<AREA>-NN-slug.md`),
arquivos pequenos e focados. Cada molde volta ao solicitante (validação compartilhada)
antes de virar fonte; decisão de arquitetura segue G2 e vira `MD-NNNN` ou ADR.

**Exemplo de aplicação.** Uma automação de médio porte gera PRD, Arquitetura e Tarefas,
mas dispensa moldes de API e Fluxos por não haver superfície correspondente; uma `[H]`
não resolvida sobre volume de dados entra no PRD como risco declarado, não como premissa
embutida.

**Impacto em templates.**
- `requirements-template.md`: o mapeamento Demanda→problema, `P_n`→RF-NN e não-objetivos→escopo negativo orienta o preenchimento das seções 1, 4 e 5.
- `roadmap-template.md`: `[H]` pendentes entram na seção de premissas/riscos, nunca implícitas nas decisões.
- `actions-template.md`: as tarefas derivam do molde Tarefas da coleção SDD.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### VI. Rastreabilidade bidirecional

**Descrição.** Spec → código: cada `RF-NN` lista os artefatos (código e testes) que o
realizam. Código → spec: cada arquivo cita, no cabeçalho, o `RF-NN` que o originou. A
matriz `spec/rastreabilidade.md` fecha o circuito `RF-NN ↔ artefato ↔ teste`. Alterar
código sem atualizar a spec faz a matriz mentir: reconcilie a spec.

**Exemplo de aplicação.** Um refactor move a lógica de `RF-03` para um módulo novo. O
commit só se completa quando o cabeçalho do módulo cita `RF-03` e a matriz de
rastreabilidade aponta para o novo caminho; caso contrário, a matriz mente.

**Impacto em templates.**
- `requirements-template.md`: a tabela de RFs deve permitir referenciar artefatos e testes que os realizam.
- `roadmap-template.md`: o critério de pronto inclui matriz de rastreabilidade consistente.
- `actions-template.md`: a coluna "Arquivo alvo" alimenta o lado artefato da matriz.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### VII. Testes: metade da fonte de verdade, em dois papéis

**Descrição.** A Fase 2 projeta o esqueleto `tests/` e o `TESTS_SPEC.md` proporcionais,
seguindo `tdd.md` (pirâmide como pastas `unit → integration → contract → e2e → regression`,
CI em ordem de custo crescente para falhar cedo). O teste de validação
comprova o `RF-NN` ("para esta entrada, esta saída"); para invariantes de domínio, usa
property-based ("para qualquer entrada válida, esta propriedade se mantém"), em
`tests/unit/test_invariantes.py`. O teste de falha/regressão nasce de um bug já visto:
escreve-se primeiro o teste que reproduz o bug (falha no código atual), só então se
aplica o fix. Mora em `tests/regression/`, um por bug (`BUG_VIRA_TESTE=sem exceção`); a
spec se completa por evidência.

**Exemplo de aplicação.** Um usuário reporta que datas em 29 de fevereiro quebram o
parser. Antes de qualquer fix, nasce `tests/regression/test_bug_29fev.py`, que falha no
código atual; o fix só é aceito quando esse teste passa e os demais seguem verdes.

**Impacto em templates.**
- `requirements-template.md`: cada critério de aceite deve ser conversível em teste de validação.
- `roadmap-template.md`: o critério de pronto inclui os testes de validação dos RFs cobertos.
- `actions-template.md`: a Fase 2 (Testes) do actions deixa de ser opcional quando há RF de domínio; bug encontrado durante a execução gera ação de teste de regressão.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### VIII. Proporcionalidade: moldes e pirâmide escalam com a categoria

**Descrição.** Quais moldes SDD e quais níveis da pirâmide de testes existem escalam com
a categoria do artefato (Princípio nº 4 global: Snippet / Automação / Aplicação /
Produto): forçar 15 documentos ou a pirâmide inteira num script trivial é dívida, não
zelo.

**Exemplo de aplicação.** Um script descartável de 80 linhas recebe clarificação, seed
travado e um teste de fumaça — e nada mais. Já uma aplicação com usuários recebe o trio
crítico completo, matriz de rastreabilidade e pirâmide com regressão.

**Impacto em templates.**
- `requirements-template.md`: seções obrigatórias podem receber "n/a" justificado quando a categoria dispensa o detalhe.
- `roadmap-template.md`: o nível de detalhe dos deltas segue a categoria declarada.
- `actions-template.md`: o número de fases usadas escala com a categoria; fases vazias são omitidas com registro.

**Criado em.** `2026-07-19`
**Última revisão.** `2026-07-19`

---

### IX. A prosa do produto tem norma declarada, e a norma é verificável

**Descrição.** Todo literal que o produto exibe pertence a exatamente uma de três classes,
e a classe é **declarada**, jamais inferida do diretório onde o literal mora: **autoral**
(escrito pelo produto), **citação** (transcrito de fonte clínica, incluindo rótulo de
classificação, conduta e localização bibliográfica) ou **identificador** (chave, `id`,
nome de campo, valor de `data-*`). A classe autoral responde a uma norma de redação
escrita e versionada, materializada em `docs/redacao.md`. A citação permanece byte a
byte, com uma exceção estrita: onde a fonte impressa contraria a concordância, o produto
escreve a forma correta e **declara o afastamento ao leitor** — corrigir sem informar
troca um desvio gramatical por um desvio de transparência, e este é o pior dos dois numa
ferramenta clínica. O identificador está fora do alcance da revisão.

A norma se divide pelo que dela se pode provar. O que ela fixa em **regra dura** —
pontuação pelos três eixos, teto de sinais expressivos por bloco, grafia de números,
unidades e siglas — é verificado por teste, no mesmo portão dos demais, com mensagem de
falha que aponta a regra violada. O que ela fixa em **julgamento** — coesão, progressão
econômica, ausência de ornamento — vive no guia como par "antes/depois" tirado do próprio
produto. O guia diz qual é qual, para que ninguém confunda "a suíte passou" com "o texto
está bom".

**Exemplo de aplicação.** Uma calculadora nova precisa de subtítulo. Quem a escreve não
delibera sobre travessão nem inventa um separador: abre `docs/redacao.md`, encontra a
regra e o exemplo tirado de uma tela que já existe, e escreve conforme. Se errar, o teste
de norma reprova antes do commit, e o que reprova é a regra escrita, não o gosto de quem
revisa. Do outro lado da mesma disciplina: quem transcreve um rótulo novo da caderneta o
declara como citação, e nenhuma revisão de estilo posterior o alcança.

**Impacto em templates.**
- `requirements-template.md`: RF que introduza texto exibido declara a classe dos literais que cria; critério de aceite de texto autoral remete ao guia, e não a uma descrição de estilo escrita ali mesmo.
- `roadmap-template.md`: decisão que crie superfície textual nova declara onde a classe de cada literal será registrada; a seção 2 passa a ter um princípio a mais a conferir.
- `actions-template.md`: ação que escreva texto exibido é ação de classe declarada; literal novo sem entrada no mapa faz o gerador do inventário parar, e a ação não se dá por concluída enquanto isso não for resolvido.

**Criado em.** `2026-07-27`
**Última revisão.** `2026-07-27`

---

## Princípios aposentados

<!-- Nenhum princípio aposentado até o momento. -->

## Histórico de alterações

| Data | Operação | Princípio | Resumo |
|------|----------|-----------|--------|
| 2026-07-19 | criar | I–VIII | Versão inicial: doutrina do fluxo `/clarificar` (SDD/TDD) importada do projeto `plano-viagem` (versão de 2026-07-12), adotada sem alteração de conteúdo |
| 2026-07-27 | adicionar | IX | A prosa do produto tem norma declarada, e a norma é verificável. Nasce da feature 018 (RF-11, roadmap D-09) e da arbitragem de `MD-0015`, que autorizou a exceção de concordância na citação sob condição de declaração ao leitor. É o primeiro princípio deste projeto que não vem da doutrina importada do `/clarificar`: os oito anteriores tratam de **como se chega** ao artefato, e este trata de **como o artefato fala**. Materialização operacional em `docs/redacao.md`, que o princípio nomeia e que remete de volta a ele. Relatório de impacto em `.reversa/principles-impact-20260727.md` |
