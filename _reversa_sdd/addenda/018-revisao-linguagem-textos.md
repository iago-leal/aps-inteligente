# Adendo — Revisão da linguagem dos textos da plataforma

> Identificador: `018-revisao-linguagem-textos`
> Data: 2026-07-27
> Cenário: legado

## Vigência

Vigente desde 2026-07-27.

## Resumo da entrega

A prosa da plataforma nasceu feature a feature, sem norma declarada. Esta entrega fecha as duas
metades de um mesmo ato: escreve a **norma de redação do produto** — princípio **IX** em
`.reversa/principles.md` e o guia operacional `docs/redacao.md`, com regras verificáveis em vez de
conselhos — e **revisa a prosa já publicada** contra ela, tela por tela, alcançando também os
metadados que saem do navegador para o buscador e para a tela de instalação. A distinção que a
governa separa o **texto autoral**, sujeito à revisão, do **texto citado** da fonte clínica, que
permanece byte a byte; a única exceção é estreita em três sentidos — só desvio de concordância,
sobre lista fechada de dois rótulos, e inseparável da declaração ao leitor (`MD-0015`).

Duas mudanças ultrapassam o texto revisado. A primeira: **a superfície textual virou dado**. O que
existia como leitura humana passou a ter lista fechada, gerada e classificada — 642 literais com
arquivo, linha e classe —, e literal novo sem classe declarada faz o gerador parar. A segunda: a
**descrição da plataforma deixou de ser prosa mantida à mão** e passou a ser prosa verificada
contra o `CATALOGO`, o que corrigiu um defeito de exatidão real (a `description` da raiz nomeava
duas das quatro seções).

Em números: **62/62 ações concluídas** (`actions.md` todas `[X]`, `progress.jsonl` com 62 linhas,
todas `done`). Da revisão: 490 literais autorais, dos quais 344 no código, com **27 reescritos**,
1 acrescentado e 316 mantidos com justificativa nominal; 106 citações preservadas byte a byte e 2
com afastamento declarado. O aparato cresceu em sete verificadores, todos vistos reprovar antes de
aceitos, e a suíte foi de **45 para 52 arquivos** e de **642 para 673 testes**, todos passando; as
duas famílias de asserção acopladas ao texto subiram de 267 para 269 e de 373 para 383, sem que
arquivo algum perdesse asserção. Os 36 roteiros de ponta a ponta passam e `e2e/axe-baseline.json`
ficou intocado. Nenhum dos cinco motores
mudou de comportamento; nenhuma rota nasceu ou morreu; o maior crescimento de bundle foi de 182 B
gzip, abaixo do limiar de declaração.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | #1 Estilo arquitetural — camadas | componente-novo | A camada **dev-time** inaugurada pela 017 ganha o **terceiro gerador idempotente**: `scripts/inventariar-textos.mts` mais os sete módulos de `scripts/textos/` (agregador e mapa de classes por camada). Não entra no bundle e não é importado por `models/`, `interface/` nem `pages/` |
| `_reversa_sdd/architecture.md` | #3 Dados | delta-de-dados | Dois artefatos de dado novos em `tests/apoio/`, **de propósito oposto no tempo**: `inventario-textual.json` (642 literais com arquivo, linha e classe, **regerado** ao fim de toda revisão) e `citacao-linha-de-base.json` (108 citações do estado anterior, **jamais regerado**, D-14). Nenhum é persistência: "nenhum dado clínico é persistido" segue intacto |
| `_reversa_sdd/architecture.md` | #5 Qualidade e testes | regra-alterada | **45 → 52 arquivos** e **642 → 673 testes**, pelos sete verificadores de `tests/unit/textos/` mais o apoio (55 arquivos no repositório contando os três de `tests/contract/`, que ficam fora do `vitest run` padrão). A cifra da re-extração nº 3 ("37 arquivos", baseline "0/0 por rota") segue defasada e é dívida herdada L-11 — ver `reconciliacao-spec.md` §2. **Correção de cifra:** o `legacy-impact.md` e a `reconciliacao-spec.md` §4 desta feature registram "52 para 59"; a execução da suíte em 27/07 mostra 52 arquivos **ao final**, não ao início |
| `_reversa_sdd/architecture.md` | #6 Dívidas técnicas | regra-alterada | Entra uma limitação **declarada**: o literal montado por interpolação em tempo de execução (recusas de `models/puericultura/elegibilidade.ts`, aviso de `medidas.ts`) fica fora do inventário por desenho do extrator, e o congelamento de RF-06 não o cobre. Sai nada: **L-10** (duas violações axe toleradas) permanece aberta e alheia a esta feature |
| `_reversa_sdd/domain.md` | #7 Invariantes transversais | regra-alterada (reforço) | Os invariantes 3, 5 e 6 seguem intactos, e o 3 sai **reforçado**: a decisão L-08 tirou a localização bibliográfica de dentro das mensagens de validação justamente para não criar segunda fonte do que a `ReferenciaClinica` já carrega. O congelamento por `Object.freeze` não foi tocado — as duas correções são de rótulo exibido |
| `_reversa_sdd/domain.md` | #7.1 regra 9 · #7.2 regra 12 | regra-alterada (nenhum delta) | Ambas preservadas e registradas para leitura: a interface importa a constante em vez de reescrever o valor, e é por isso que RN-04 quase não teve o que proteger nas telas; nenhum nome acessível foi tocado, por restrição explícita RN-07 |
| `_reversa_sdd/data-dictionary.md` | Campo `sexo`, cardiopatia isquêmica | delta-de-dados (nenhum real) | Cita `(eixo do Quadro 2)`. O literal saiu da **mensagem de validação**, não da descrição do campo, de modo que a citação segue correta aqui — registrado para que a re-extração confira em vez de supor |
| `_reversa_sdd/addenda/017-puericultura-crescimento.md` | Rótulos da Caderneta (linha 96) | **regra-alterada** | Onde se lê que os rótulos ficam "como está, inclusive na concordância destoante", leia-se: **dois em vinte e cinco** passaram a ser exibidos corrigidos, sob `MD-0015`, com a declaração do afastamento renderizada na proveniência. Os outros vinte e três seguem byte a byte |
| `_reversa_sdd/code-analysis.md` | Módulo 12 — `pages` | **delta-de-contrato-externo** | Os doze metadados das seis rotas mudaram: `<title>` uniformizado ao separador único e à caixa de frase, e a `description` da raiz **corrigida de exatidão** — nomeava duas das quatro seções do catálogo. A descrição deixa de ser prosa à mão e passa a ser verificada contra o `CATALOGO` na forma positiva (D-17) |
| `_reversa_sdd/code-analysis.md` | Módulo 12 — `pages` · `public/manifest.webmanifest` (feature 009) | delta-de-contrato-externo | A `description` do manifesto foi revisada **no mesmo ato** que o subtítulo da home, por serem o mesmo literal byte a byte (D-18), e é vigiada pela forma **negativa**: não se exige que enumere as seções, porque o campo tem teto prático de comprimento. `name` e `short_name` intactos |
| `_reversa_sdd/code-analysis.md` | Módulo 10 — `interface/inicio` | regra-alterada | Subtítulo do hero reescrito (o outro lado do par duplicado) e duas descrições do `catalogo.ts` revisadas em coesão. O catálogo, que já era fonte única da home (D-07), passa também a **oráculo da descrição da plataforma** |
| `_reversa_sdd/code-analysis.md` | Módulo 6 — `interface/calculadora` | regra-alterada | Cinco literais de `resultado.tsx`, todos da mesma família: travessão fazendo ofício de dois-pontos. `rotulos.ts` **não** foi tocado, e é por isso que as dezessete asserções `toContain` de `formatar-plano.test.ts` não quebraram — a fonte única segurou |
| `_reversa_sdd/code-analysis.md` | Módulo 9 — `interface/risco-cardiovascular` | regra-alterada | Separador do vínculo externo no bloco de proveniência |
| `_reversa_sdd/code-analysis.md` | Módulos 1–4 — `models/**` | regra-alterada | Molde do guia aplicado às mensagens de validação dos cinco domínios, com a referência bibliográfica fora delas (L-08) e a concordância de "raça" corrigida; e a prosa autoral de conduta e de recusa revisada nos arquivos de **regra**, não só em `validacao.ts` e `fonte-clinica.ts` (frente ampliada, D-16) |
| `_reversa_sdd/code-analysis.md` | Módulo de puericultura (via `addenda/017`) — `interface/puericultura/proveniencia.tsx` | regra-alterada | O bloco ganha um parágrafo, **lido do domínio** pelo mesmo caminho das demais notas. Segue sem texto próprio, como RN-05 exige |
| `docs/redacao.md` | — (artefato ausente da extração) | componente-novo | Primeiro artefato normativo de linguagem do projeto: as três classes de texto, a exceção estrita da citação, os três eixos da pontuação e — na §7 — a separação entre o que é verificado por teste e o que é julgamento |
| `.reversa/principles.md` | Princípio **IX** | regra-nova | Primeiro princípio do projeto que rege *como o artefato fala*, e não *como se chega a ele*. Vale para toda feature seguinte, e remete a `docs/redacao.md` como sua materialização operacional — nas duas direções |
| `_reversa_forward/017-puericultura-crescimento/regression-watch.md` | `W022` | regra-alterada | Fora da extração, mas parte da reconciliação: **W022 foi revogado em parte e reescrito no lugar** (`MD-0017`), com nota de superação apontando `MD-0015`, e passou a vigiar os vinte e três rótulos intocáveis **mais** a permanência da declaração |

**Contagem: 18 impactos.** Por tipo — componente-novo 2, regra-nova 1, regra-alterada 12,
delta-de-contrato-externo 2, delta-de-dados 2. (Duas linhas somam em dois tipos: `#3 Dados` e o
campo `sexo` do dicionário contam como `delta-de-dados`, sendo o segundo sem delta real; nenhuma
linha registra `componente-extinto` ou `regra-removida`.)

## Regras sob vigilância

**W001** a **W024**, em `_reversa_forward/018-revisao-linguagem-textos/regression-watch.md`.

Vinte e quatro itens, todos no watch principal, sem itens 🟡 ou 🔴. As observações sem peso de
regressão — a limitação do template interpolado, a régua de candidatura recalibrada duas vezes
(`MD-0019`), as três cifras em prosa que envelheceram durante a própria execução, e as dívidas
herdadas L-07, L-10 e L-11 — ficam na seção "Observações" do mesmo arquivo.

## Fontes

- `_reversa_forward/018-revisao-linguagem-textos/legacy-impact.md`
- `_reversa_forward/018-revisao-linguagem-textos/regression-watch.md`
- `_reversa_forward/018-revisao-linguagem-textos/requirements.md`
- `_reversa_forward/018-revisao-linguagem-textos/reconciliacao-spec.md`
- `_reversa_forward/018-revisao-linguagem-textos/relatorio-revisao.md`
- `_reversa_forward/018-revisao-linguagem-textos/actions.md`
- `_reversa_forward/018-revisao-linguagem-textos/progress.jsonl`

## Atualização 2026-07-27

A norma que este adendo registra foi **emendada no mesmo dia em que entrou**, por leitura do
mantenedor sobre o bloco `ContextoDaFonte` da tela de risco cardiovascular. A ficha é
`MD-0020`; o que segue é o delta sobre o que está acima, e não o substitui.

**O teto do eixo expressivo passou de um par por bloco a zero.** A 018 racionara o
travessão; a emenda o retira da prosa autoral inteira, em régua única para tela, metadado,
manifesto e `README.md`. A razão é de eixo e não de dose: o travessão marca subjetividade, e
uma ferramenta que informa dose, escore e probabilidade não tem subjetividade a marcar. A
inspeção confirmou que não havia uso legítimo a preservar — dos dezoito travessões autorais,
nenhum comentava, e todos faziam ofício de dois-pontos, de vírgula ou de ponto. A exceção
única é o nome pelo qual a fonte se publica.

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | #1 — camadas | regra-alterada | Os cinco `models/*/fonte-clinica.ts` passam a exportar **`NOME_PUBLICADO`**, o nome pelo qual a fonte se publica. Aditivo, sem mudança de comportamento: nenhuma fachada, nenhum cálculo e nenhum congelamento foram tocados |
| `_reversa_sdd/architecture.md` | #5 Qualidade e testes | regra-alterada | `norma.test.ts` troca a asserção de "mais de um par" por "nenhum travessão", descontados os nomes publicados que importa do domínio. Contagem de arquivos e de testes inalterada: 52 e 673 |
| `_reversa_sdd/code-analysis.md` | Módulo 9 · Módulo 6 · puericultura (via `addenda/017`) | regra-alterada | Seis literais reescritos: três apostos entre travessões (a nota de proveniência da puericultura e os dois parágrafos do `ContextoDaFonte`) e três qualificadores de rótulo (`— opcional` vira `, opcional`). Nenhuma afirmação clínica se moveu, e nenhuma asserção de teste precisou mudar |
| `docs/redacao.md` | §3.2 · §3.1 · §3.4 · §7 | regra-alterada | A seção do travessão foi reescrita inteira: a antiga ensinava o teto revogado e trazia um exemplo "depois" que hoje é violação. O guia também foi alinhado à própria norma que fixa |
| `README.md` | Tabela de fontes · prosa | **delta-de-contrato-externo** | Cinco nomes de fonte **uniformizados ao domínio** e catorze travessões de prosa reescritos. O drift dos nomes é o achado da emenda, e não era visível antes |

**O que a emenda ensinou, e vale mais que a regra.** O verificador confere a exceção contra
`NOME_PUBLICADO` no domínio, e não contra uma lista escrita no arquivo de teste. Foi essa
escolha que expôs o drift: o `README.md` nomeava três das cinco fontes de maneira que as
telas não usam — `Guia Rápido DM` por `Guia Rápido Diabetes Mellitus`, as duas metades das
Pooled Cohort Equations invertidas, e um travessão a mais na Caderneta da Criança. Uma lista
à mão teria aceitado as três. É a doutrina de `W012` aplicada a outro objeto: o oráculo mora
onde o dado nasce.

**Watch items:** nenhum dos vinte e quatro é revogado — nenhum deles asseverava o teto. Dois
passam a valer com leitura mais estrita, e a lista canônica segue em
`_reversa_forward/018-revisao-linguagem-textos/regression-watch.md`. Acrescenta-se um, que
esta emenda instala:

| ID | Origem | Regra esperada | Sinal de violação |
|---|---|---|---|
| W025 | `models/*/fonte-clinica.ts` — `NOME_PUBLICADO` | As cinco constantes existem e são a **única** fonte da exceção do travessão; `norma.test.ts` as importa do domínio | Lista de nomes escrita dentro do teste, ou exceção concedida por padrão de texto. Uma lista à mão aceita a forma divergente e continua verde depois de a fonte mudar de nome |

**Verificação:** vitest 52 arquivos e 673 testes, e2e 36/36, `typecheck` e `eslint` limpos.
`tests/apoio/citacao-linha-de-base.json` **intocada** (W007) e `e2e/axe-baseline.json`
**intocado** (W022). O verificador endurecido foi visto reprovar antes de aceito: 27 literais
na primeira execução, entre eles os cinco de drift.
