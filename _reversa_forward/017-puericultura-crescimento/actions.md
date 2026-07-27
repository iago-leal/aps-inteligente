# Actions: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Roadmap: `_reversa_forward/017-puericultura-crescimento/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 52 · **52 concluídas** — todas as cinco fases: Preparação (T001–T006), Testes (T007–T019), Núcleo (T020–T039), Integração (T040–T048) e Polimento (T049–T052) |
| Paralelizáveis (`[//]`) | 27 |
| Maior cadeia de dependência | 12 (T003 → T029 → T030 → T032 → T033 → T034 → T039 → T043 → T044 → T045 → T048 → T049) |

Convenções desta decomposição: toda ação de código cita no cabeçalho do arquivo o `RF-NN`
que a origina (Princípio VI); nenhuma ação de domínio importa framework (RF-01); as ações
`[//]` tocam arquivos distintos e não dependem entre si.

## Fase 1, Preparação

<!-- Setup, scaffolding, aquisição do dado de origem, entrada no catálogo. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Obter os PDFs da *Caderneta da Criança* (menino e menina, MS, 2.ª ed., 2020) em `referencias/` e fixar as pp. 85–97 como origem dos rótulos literais. **Bloqueia T023** (roadmap §8, passo 1; risco declarado em §9). **Feito:** baixados de `gov.br` para `referencias/caderneta/`, com `sha256` registrado no progresso. Nota de leitura obrigatória para T023 — a **página impressa é a física menos um** no PDF; a p. 85 impressa (física 86) abre "Acompanhando o Crescimento" e confirma a regra dos 0,7 cm, o perímetro cefálico até 2 anos e os gráficos das pp. 87 a 97 | - | `[//]` | `referencias/caderneta/` | 🟢 | `[X]` |
| T002 | **Concluída fora do ciclo de código, em 26/07/2026.** Fechar **MD-0004**: a leitura do `.xlsx` é feita com os built-ins do Node (`node:fs` + `node:zlib`), sem dependência nova, e o gerador é invocado por `node`, sem `npx tsx`. A escolha entrou no roadmap como D-14; `roadmap.md` §5 e `onboarding.md` §3 foram reconciliados na mesma sessão | - | `[//]` | `.harness/decisoes/MD-0004.md` | 🟢 | `[X]` |
| T003 | Aquisição das planilhas: escrever `scripts/baixar-tabelas-oms.mts` (única ferramenta que toca a rede, contrato §5.1), rodá-lo para trazer os 14 `.xlsx` da OMS (URLs de `interfaces/tabelas-de-referencia.md#2`) a `referencias/oms/`, pasta ignorada pelo git, e gravar URL, data e `sha256` de cada arquivo no manifesto que o gerador confere. **Feito:** 14 arquivos, 14 `sha256` distintos, manifesto versionado em `models/puericultura/oms/tabelas/manifesto.json`; o catálogo tipado das origens (com aba esperada e recorte por arquivo) ficou em `scripts/oms/origens.mts` | - | `[//]` | `scripts/baixar-tabelas-oms.mts`, `scripts/oms/origens.mts`, `referencias/oms/` | 🟢 | `[X]` |
| T004 | Conferir, coeficiente a coeficiente, as seis expressões de μ e σ do INTERGROWTH-21st contra a tabela impressa de Villar 2015, e atualizar o campo ESTADO da microdecisão (pendência obrigatória de `investigation.md#3`) | - | `[//]` | `.harness/decisoes/MD-0002.md` | 🟢 | `[X]` |
| | **Feito por caminho melhor:** o Lancet seguiu inacessível, então a conferência passou de tipográfica a **de consequência** — as seis tabelas oficiais de z-score do projeto (`PPFS_zscores_*`, assinadas "Villar et al. Lancet Glob Health 2015;3:e681-91") foram baixadas para `referencias/intergrowth/`, extraídas e comparadas às expressões célula a célula: **1596 células, nenhuma fora da tolerância de arredondamento**, pior desvio 0,005 (empate de arredondamento). MD-0002 encerra a ressalva de procedência | | | | | |
| T005 | Acrescentar a seção `puericultura` ao catálogo, com uma ficha ("Avaliação do crescimento infantil", rota `/puericultura/crescimento`) e a citação da caderneta na descrição — catálogo primeiro, como manda o README (RF-14, D-12) | - | `[//]` | `interface/inicio/catalogo.ts` | 🟢 | `[X]` |
| T006 | Mapear `puericultura → SmileyIcon` no mapa de ícones da home (RF-14, D-12) | - | `[//]` | `interface/inicio/icones.tsx` | 🟢 | `[X]` |

## Fase 2, Testes

<!-- Escritos antes ou junto do núcleo. Um teste por cenário Gherkin de requirements.md#7. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Apoio de teste: tabelas LMS sintéticas mínimas (D-08, injeção por construtor) e construtor de entrada de avaliação, no molde de `tests/apoio/construtores.ts`. **Feito:** `tabelaSintetica` gera `L/M/S` deliberadamente reconhecíveis — o `m` de cada linha é a própria chave —, de modo que leitura na posição errada aparece como número errado, e não como igualdade acidental; `repositorioSintetico` monta acervos sob medida (inclusive o vazio, para exercitar a guarda de acervo incompleto); o construtor de entrada nasce no primeiro cenário Gherkin, e os narrowings seguem o molde de `construtores.ts`. Executada depois de T020 e T034, que dão os tipos que ela constrói | - | `[//]` | `tests/apoio/puericultura.ts` | 🟢 | `[X]` |
| T008 | Congelar a amostra de casos-oráculo em arquivo **versionado**: escores por `gigs`/`anthro` (OMS, idades de mês inteiro entre 5 e 10 anos e idades diárias abaixo de 5), valores em ±1/±2/±3 DP das tabelas do INTERGROWTH-21st e — acréscimo do achado A003 — os pares `(medida em SDn, n)` extraídos das colunas `SD3neg`…`SD3` das próprias planilhas da OMS, que são o oráculo da correção de cauda e não sobrevivem à emissão de T031. Cada caso com a sua procedência (`investigation.md#6`). É o que permite a T010 rodar em clone limpo, sem `referencias/`. **Feito** com **duas** das três fontes, e a terceira dispensada por decisão registrada (**MD-0010**): `gigs`/`anthro` reimplementam a mesma LMS sobre o mesmo `L/M/S`, de modo que confirmariam por intermediário o que a fonte primária confirma direto — e custariam R como dependência de ambiente para uma rodada só. Congelados 356 casos de 14 tabelas (3204 pares, conferidos contra a LMS antes de escrever) e as 1596 células do INTERGROWTH-21st. A amostra é determinística: passo fixo mais as fronteiras obrigatórias, cada uma nomeando no campo `porque` a decisão do plano que ela prova. Os desvios foram estendidos a ±4, e é de lá que vem o achado da rodada | T003, T004 | - | `tests/apoio/casos-oraculo-puericultura.json`, `scripts/congelar-casos-oraculo.mts`, `scripts/oraculo/{oms,intergrowth}.mts` | 🟢 | `[X]` |
| | **Achado de T008, com consequência sobre RF-03 (reconciliado em `requirements.md`, `roadmap.md` D-10.1 e no contrato §5):** as colunas `SD4` **não** são LMS pura nos indicadores de peso — a OMS as publica já com a correção de cauda aplicada (peso masculino ao nascer: LMS prevê 5,6945 kg em `z = 4`, a fonte traz 5,642, que é `SD3 + (SD3 − SD2)`). Isso promove RN-03 de "confirmado contra `gigs`" a "confirmado na fonte primária". O segundo lado do achado importa mais: em C-E/I e PC/I o dado é **silencioso**, porque `L = 1` em todas as tabelas e ali a LMS já é linear de passo `SD3 − SD2` — corrigir e não corrigir dão o mesmo número, com diferença de 1e-14. Logo a metade negativa de RN-03 tem de ser exercitada em acervo sintético com `L ≠ 1`, e não no dado real, sob pena de o teste passar com a implementação certa e com a errada | | | | | |
| T009 | Teste de idades: dias epoch UTC independentes de fuso, calendário impossível como valor nulo, desconto `40 − IG`, correção ativa até 2 anos e até 3 anos com IG < 28 semanas, semanas pós-menstruais no par 64/65 (RF-05, RF-17, RF-19) | T007 | `[//]` | `tests/unit/dominio-puericultura/idades.test.ts` | 🟢 | `[X]` |
| T010 | Teste do LMS e da correção de cauda: `L ≠ 0` e `L = 0`; oráculo (medida igual a `SDn` devolve `z = n`) lido dos **casos congelados de T008**, nunca de `referencias/`, que o git ignora; cauda aplicada a P/I e IMC/I e **não** aplicada a C-E/I e PC/I; sinal preservado nos dois lados (RF-02, RF-03). **Três notas de T008 valem como instrução de escrita:** (1) a tolerância é `oms.toleranciaEmZ` do próprio arquivo (3e-3, medida e justificada lá), e não a da escala da medida, que é dez vezes menor e reprovaria empate de arredondamento; (2) o ramo `L = 0` **não** existe no dado real — nenhuma das 14 tabelas tem linha com `L = 0` —, então ele se cobre com o acervo sintético de T007; (3) a não-aplicação da cauda a C-E/I e PC/I também pede sintético com `L ≠ 1`, pelo achado registrado na linha de T008 | T007, T008 | `[//]` | `tests/unit/dominio-puericultura/lms.test.ts` | 🟢 | `[X]` |
| T011 | Teste da leitura da tabela: dia inteiro até 5 anos, mês completo (`⌊dias/30,4375⌋`) de 5 a 10 anos, sem interpolação; as duas fronteiras dos 5 anos nos quatro pontos 1825, 1826, 1855 e 1856 dias (D-05, D-06); e a **fronteira superior** no par 3682/3683 dias, com o mês calculado conferido em cada um — 3682 lê o mês 120, 3683 sai da cobertura (D-15). **Feito:** 22 casos. Cada fronteira exercitada no **par** que a define, contra o acervo real e contra acervo sintético; a ausência de interpolação provada pela igualdade dos dias 1857 e 1887 (mesmo mês, mesma linha) e pela diferença em 1888. O encaixe das duas tabelas conferido sem buraco nem sobreposição: `⌊1856/30,4375⌋ = 60` e `⌊1857/30,4375⌋ = 61`. O par 730/731 do perímetro cefálico (D-16) entrou junto, com a prova de que a recusa é parcial — os demais índices seguem lendo aos 731 dias (RF-06) | T007 | `[//]` | `tests/unit/dominio-puericultura/leitura-oms.test.ts` | 🟢 | `[X]` |
| T012 | Teste das curvas de pré-termo: μ e σ nos extremos e no meio da janela contra a tabela de sanidade de `investigation.md#3`; `z` em escala log para peso e comprimento e natural para PC; IMC inexistente na janela (RF-18) | T008 | `[//]` | `tests/unit/dominio-puericultura/intergrowth.test.ts` | 🟡 | `[X]` |
| T013 | Teste de classificação: bordas `−3`, `−2`, `+1`, `+2`, `+3` em cada índice; ausência de categoria superior em C-E/I; troca de rótulos do IMC aos 1826 dias, com `z = +2,5` virando "Sobrepeso" aos 4a11m e "Obesidade" aos 5a0m (RF-04) | T001, T007 | `[//]` | `tests/unit/dominio-puericultura/classificacao.test.ts` | 🟢 | `[X]` |
| T014 | Teste de validação por coleta total: três ofensores simultâneos, data de nascimento futura, nenhuma medida informada, IG fora de 22–42 semanas ou com dias fora de 0–6, faixas de plausibilidade (RF-09) | T007 | `[//]` | `tests/unit/dominio-puericultura/validacao.test.ts` | 🟡 | `[X]` |
| T015 | Teste de elegibilidade: `IDADE_FORA_DA_COBERTURA` (global, sem número) **no par de limite 3682/3683 dias** (D-15), `ABAIXO_DA_CURVA_DE_PRETERMO` (global) e `PC_ACIMA_DE_2_ANOS` (**parcial**, sem derrubar os demais índices) **no par de limite 730/731 dias** (D-16) (RF-07) | T007 | `[//]` | `tests/unit/dominio-puericultura/elegibilidade.test.ts` | 🟢 | `[X]` |
| T016 | Teste de medidas: conversão de −0,7 cm (deitado ≥ 2 anos) e +0,7 cm (em pé < 2 anos), com a fronteira no par 730/731 dias (D-16), aviso declarado na saída, e IMC calculado sobre a medida já convertida (RF-08, D-11) | T007 | `[//]` | `tests/unit/dominio-puericultura/medidas.test.ts` | 🟢 | `[X]` |
| T017 | Teste de invariantes com `fast-check`: todo índice calculado sai com `ReferenciaClinica` não vazia, com padrão e com idade usada declarados; e fronteira arquitetural — nenhum `import` de framework em `models/puericultura/**` (RF-01, RF-10, RF-20) | T007 | `[//]` | `tests/unit/dominio-puericultura/invariantes.test.ts` | 🟢 | `[X]` |
| T018 | Teste da fachada, um caso nomeado por cenário Gherkin de `requirements.md#7`: lactente a termo completo, prematuro na janela sem IMC, transferência em 64/65 semanas, IG ausente com premissa declarada, **medida ausente que não invalida as demais (RF-06)**, e os quatro cenários negativos. O mapa completo dos dezoito cenários está na seção "Cobertura dos cenários" ao fim deste documento | T007, T008 | - | `tests/unit/dominio-puericultura/fachada.test.ts` | 🟢 | `[X]` |
| T019 | Teste dos casos-oráculo congelados: cada caso do arquivo reproduzido pelo motor dentro da tolerância declarada, com a divergência de mês inteiro (D-06) explicitada no próprio teste | T008 | `[//]` | `tests/unit/dominio-puericultura/casos-oraculo.test.ts` | 🟡 | `[X]` |

## Fase 3, Núcleo

<!-- Quinto domínio puro, gerador do dado e leitura das duas famílias de curvas. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T020 | Tipos do domínio: entrada, `IdadesDerivadas`, `IndiceAntropometrico` como união discriminada (`calculado` / `ausente` / `fora-do-escopo`) e saída da fachada em três variantes, tudo `readonly` (`data-delta.md#2`). A variante `ausente` é o que realiza **RF-06** no tipo: cada índice responde por si, e a falta de uma medida suprime só o índice que dela depende. **Feito:** a união do índice discrimina por `estado` (`calculado`/`ausente`/`fora-do-escopo`), e não por `tipo`, para que um resultado com quatro índices não carregue cinco campos `tipo` de significados diferentes; a saída da fachada mantém `tipo`, como nos quatro domínios existentes. `idadeUsada` virou objeto (espécie, valor, unidade e desconto), porque RF-20 pede a idade **com** o desconto, e não só o seu nome | - | `[//]` | `models/puericultura/tipos.ts` | 🟢 | `[X]` |
| T021 | Aritmética de datas em dias epoch UTC copiada de `models/gestacao/datas.ts`, com o gêmeo e a dívida de convergência declarados no cabeçalho (RF-05, D-07, ADR 0013) | - | `[//]` | `models/puericultura/datas.ts` | 🟡 | `[X]` |
| T022 | Declarar o gêmeo no cabeçalho de `models/gestacao/datas.ts` — comentário apenas, nenhuma linha de lógica tocada (D-07) | T021 | - | `models/gestacao/datas.ts` | 🟡 | `[X]` |
| T023 | Fonte clínica congelada: rótulos literais dos quatro índices, os **dois** conjuntos do IMC (0–5 e 5–10 anos), referências de página por índice e a nota de proveniência (medição isolada × tendência, padrões em uso, leitura por dia até 5 anos e por mês depois) (RF-13, RN-04 a RN-07, RN-14) | T001, T020 | - | `models/puericultura/fonte-clinica.ts` | 🟢 | `[X]` |
| T024 | Idades derivadas: cronológica, desconto, corrigida com os limites de 2 e 3 anos, `correcaoAtiva` e semanas pós-menstruais (RF-05, RF-16, RF-17) | T020, T021 | - | `models/puericultura/idades.ts` | 🟢 | `[X]` |
| T025 | Medidas: conversão de posição de ±0,7 cm com aviso, e IMC sobre o comprimento/estatura já convertido (RF-08, D-11) | T020 | `[//]` | `models/puericultura/medidas.ts` | 🟢 | `[X]` |
| T026 | Validação por coleta total, no molde de `models/risco-cardiovascular/validacao.ts`: ofensores travantes e faixas de plausibilidade, sem parar no primeiro erro (RF-09) | T020 | `[//]` | `models/puericultura/validacao.ts` | 🟡 | `[X]` |
| T027 | Elegibilidade com os três motivos, sendo `PC_ACIMA_DE_2_ANOS` **parcial** — novidade frente ao molde da 014, que só tem recusa global (RF-07) | T020, T023 | - | `models/puericultura/elegibilidade.ts` | 🟢 | `[X]` |
| T028 | Escore z pelo LMS e correção de cauda derivada da própria LMS, aplicada só a P/I e IMC/I (RF-02, RF-03, D-10) | T020 | `[//]` | `models/puericultura/oms/lms.ts` | 🟢 | `[X]` |
| T029 | Gerador, leitura: abrir o `.xlsx` com os built-ins do Node conforme D-14 — `node:fs` mais `inflateRawSync` de `node:zlib` sobre o contêiner ZIP, e leitura direta de `xl/workbook.xml`, `xl/sharedStrings.xml` e `xl/worksheets/sheet1.xml` —, devolvendo as colunas localizadas **pelo nome do cabeçalho**, nunca pela posição (`interfaces/tabelas-de-referencia.md#3`). O leitor é módulo dev-time e nunca é importado por código de aplicação | T003 | - | `scripts/lib/planilha.mts` | 🟢 | `[X]` |
| T030 | Gerador, verificações V1 a V7 com falha ruidosa e nenhuma escrita parcial, incluindo a reconstrução dos desvios a partir de `L/M/S` (V6) e os valores-âncora (V7). **Feito** em quatro módulos, pelos tetos do mantenedor: `criterios.mts` (o que se exige do dado, com a proveniência de cada exigência), `extracao.mts` (texto → `L/M/S` recortado e canonizado, onde V3 vive), `falha.mts` (o modo de falha único do contrato §7) e `verificacoes.mts` (V1, V2 e V4 a V7). As 14 tabelas passam; 9 sabotagens dirigidas provaram que cada verificação morde a anomalia que lhe cabe | T029 | - | `scripts/oms/{criterios,extracao,falha,verificacoes}.mts` | 🟢 | `[X]` |
| T031 | Gerador, emissão (realiza **D-03**): recorte ao escopo da fonte (D-04), limpeza do ruído de ponto flutuante, arrays paralelos `l`/`m`/`s` com `inicio`, `fim` e `unidade`, cabeçalho de procedência por módulo e manifesto com URL, data e `sha256`. As colunas `SDn` são consumidas na verificação V6 e **não** entram no módulo emitido — o oráculo delas vive congelado em T008. **Feito:** o recorte e a canonização passaram para `extracao.mts` (V4 a V7 precisam valer sobre o dado que se embarca, não sobre o bruto) e aqui ficou a produção do texto, sem aritmética. O cabeçalho é determinístico — a data vem do manifesto, nunca do relógio —, o texto sai formatado pelo Prettier do projeto e cada número é conferido por releitura | T029 | - | `scripts/oms/emitir-modulo.mts` | 🟢 | `[X]` |
| T032 | Gerador, orquestração: percorrer os 14 recortes, conferir o `sha256` de cada arquivo contra o manifesto do baixador antes de converter, encadear leitura → verificação → emissão, ser idempotente byte a byte e falhar dizendo qual **arquivo** e qual verificação pararam (a mensagem de URL cabe ao baixador, contrato §7). **Feito:** a promessa de "nenhuma escrita parcial" ficou estrutural — as 14 tabelas são lidas, verificadas e emitidas em memória, e o primeiro byte só chega ao disco quando a última passa. Acrescentou-se uma guarda que o plano não previa: duas origens não podem reivindicar o mesmo módulo. Roda em 0,62 s | T030, T031 | - | `scripts/gerar-tabelas-oms.mts` | 🟢 | `[X]` |
| T033 | Rodar o gerador, conferir contra a saída os valores-âncora de `interfaces/tabelas-de-referencia.md` §5 (verificação V7) — não os do `onboarding.md` §4, que são escores z e só se tornam verificáveis depois de T039 — e commitar os 14 módulos de dados e o manifesto junto do gerador que os produziu (D-03). **Feito:** 14 módulos, 12.964 linhas `L/M/S`, 344 kB de texto-fonte (376 kB em disco com o manifesto) — o volume que `investigation.md` §7 estimara. As três âncoras do contrato §5 conferidas **na saída**, mais a do spike de D-14 (peso masculino em `Day = 1856`, `M = 18,4968`): 4/4. Idempotência provada por segunda execução, "14 já idênticos, 0 escritos" | T032 | - | `models/puericultura/oms/tabelas/` | 🟢 | `[X]` |
| T034 | Repositório de tabelas da OMS: interface injetável, seleção por índice, sexo e faixa, índice de linha aritmético e as duas fronteiras dos 5 anos separadas (D-05, D-06, D-08) | T020, T033 | - | `models/puericultura/oms/leitura.ts` | 🟢 | `[X]` |
| T035 | Equações fechadas do INTERGROWTH-21st: μ e σ por semana pós-menstrual para peso, comprimento e PC, com os coeficientes conferidos em T004 e a procedência no cabeçalho (D-02) | T004, T020 | - | `models/puericultura/intergrowth/equacoes.ts` | 🟡 | `[X]` |
| T036 | Escore z de pré-termo: log para peso e comprimento, escala natural para PC, e ausência de IMC como variante `ausente` com motivo, jamais erro (RF-18, RN-17) | T035 | - | `models/puericultura/intergrowth/escore.ts` | 🟢 | `[X]` |
| T037 | Escolha do padrão como único ponto de fronteira entre as duas réguas: INTERGROWTH-21st entre 27 e 64 semanas pós-menstruais, OMS sobre idade corrigida a partir de 65 (RF-18, RF-19, D-01) | T020, T024 | - | `models/puericultura/padrao.ts` | 🟢 | `[X]` |
| T038 | Classificação por índice e faixa, com a troca de nomenclatura do IMC na fronteira de rótulo dos 1826 dias e sem categoria superior em C-E/I (RF-04) | T023 | - | `models/puericultura/classificacao.ts` | 🟢 | `[X]` |
| T039 | Fachada `CalculadoraCrescimentoInfantil.avaliar`, síncrona, com repositório de tabelas injetável e o real por omissão: `validar → datar → escolher o padrão → ler a régua → classificar`, cada índice carimbado com padrão, idade usada e página (RF-01, RF-20, D-08) | T024, T025, T026, T027, T028, T034, T036, T037, T038 | - | `models/puericultura/calculadora.ts` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Tela, rota, estilos e as suítes que exercitam a cola. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T040 | Formulário: sexo, data de nascimento, data da medição, peso, comprimento/estatura com posição explícita (sem default silencioso), perímetro cefálico e idade gestacional ao nascer em semanas + dias, com `erro-de-campo.tsx` para os ofensores (RF-11, RN-09) | T020 | `[//]` | `interface/puericultura/formulario.tsx` | 🟢 | `[X]` |
| T041 | Painel de resultado: um bloco por índice com escore z de uma casa decimal e sinal sempre explícito, classificação literal, padrão, idade usada e página; variantes `ausente` e `fora-do-escopo` distinguidas; painel honesto em falha de invariante (RF-11, RF-21, D-13) | T020 | `[//]` | `interface/puericultura/resultado.tsx` | 🟡 | `[X]` |
| T042 | Bloco de proveniência fora do painel de resultado, lendo o texto congelado no domínio (RF-13, molde da 014) | T023 | `[//]` | `interface/puericultura/proveniencia.tsx` | 🟢 | `[X]` |
| T043 | Contêiner: estado efêmero, motor injetável, invalidação por edição marcando o resultado como desatualizado, `RelatorDeErros` nulo e **sem** ritual de revisão (RF-12, RF-15, RF-21) | T039, T040, T041, T042 | - | `interface/puericultura/app.tsx` | 🟢 | `[X]` |
| T044 | Tela: composição da `Moldura` com `comInicio` (contrato do adendo 016; `logoComoTitulo` não existe mais), título e subtítulo com a fonte única | T043 | - | `interface/puericultura/tela.tsx` | 🟢 | `[X]` |
| T045 | Rota `/puericultura/crescimento` com metadados próprios, no molde de `pages/cardiologia/risco-cardiovascular.tsx` | T044, T046 | - | `pages/puericultura/crescimento.tsx` | 🟢 | `[X]` |
| T046 | Folha de estilo da tela nova e o seu `import` no shell, no molde de `risco-cardiovascular.css` — só apresentação, sobre os tokens do Primer | T041 | - | `interface/estilos/puericultura.css` | 🟢 | `[X]` |
| T047 | Teste de integração da tela: campos presentes, escore com uma casa decimal, invalidação por edição, ausência de caixa de confirmação, proveniência fora do painel, recusas honestas em tela e painel honesto na falha inesperada (RF-11 a RF-16, RF-21) | T043 | - | `tests/integration/interface/puericultura.test.tsx` | 🟢 | `[X]` |
| T048 | E2e: navegação da home ao cartão da seção Puericultura e varredura axe da rota nova, com delta 0/0 e sem alterar `e2e/axe-baseline.json` (RF-14, RNF de acessibilidade) | T005, T006, T045 | - | `e2e/puericultura.spec.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Medição, cobertura e documentação curta. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T049 | Medir o bundle com `next build` e registrar a comparação do *First Load JS* das rotas existentes contra `main`: elas devem ficar inalteradas, e só `/puericultura/crescimento` pode crescer (D-09). O registro vai em arquivo próprio, não nas notas de execução deste documento, que o template reserva ao `/reversa-coding` | T048 | - | `_reversa_forward/017-puericultura-crescimento/medicao-bundle.md` | 🟡 | `[X]` |
| T050 | Conferir a cobertura de `models/**` ≥ 90% com o quinto domínio incluído; se os módulos de dados gerados distorcerem a métrica, excluí-los do `include` por decisão registrada, nunca por ajuste silencioso do limite | T039, T047 | - | `vitest.config.ts` | 🟡 | `[X]` |
| T051 | README: linha da quinta calculadora na tabela de rotas, menção à seção nova e o procedimento de regeneração das tabelas da OMS com a leitura do `git diff` vazio | T045 | `[//]` | `README.md` | 🟢 | `[X]` |
| T052 | Conferir os tetos do mantenedor nos arquivos novos — nenhum arquivo de **código** acima de 400 linhas, nenhuma função acima de 50 —, com a exceção dos módulos de dados gerados declarada onde ela vale | T039 | `[//]` | `models/puericultura/` | 🟢 | `[X]` |

## Cobertura dos cenários

Mapa exigido pelo critério de pronto do roadmap §10 e cobrado pelo achado A011 da auditoria:
cada um dos dezoito cenários Gherkin de `requirements.md` §7 com a ação que o cobre. Onde há
duas, a primeira é a que responde pelo cenário; a segunda o exercita em outro nível da pirâmide.

| # | Cenário (`requirements.md` §7) | Ação |
|---|---|---|
| 1 | Lactente a termo com medidas completas | T018, T047 |
| 2 | A nomenclatura do IMC muda aos 5 anos | T013, T011 |
| 3 | Correção de cauda só onde a OMS a prevê | T010 |
| 4 | Medição em pé antes dos 2 anos | T016 |
| 5 | Prematuro dentro da janela das curvas de pré-termo | T018, T012 |
| 6 | Transferência do padrão de pré-termo para as curvas da OMS | T018, T009 |
| 7 | Até quando a idade é corrigida | T009 |
| 8 | Idade gestacional não informada | T018 |
| 9 | Medida ausente não invalida as demais (**RF-06**) | T018, T020 |
| 10 | Negativo: idade fora da cobertura da fonte | T015, T011 |
| 11 | Negativo: abaixo da curva de pré-termo | T015 |
| 12 | Negativo: perímetro cefálico acima dos 2 anos | T015 |
| 13 | Negativo: entrada inválida em três pontos | T014 |
| 14 | Negativo: edição invalida o resultado | T047 |
| 15 | A nova seção nasce na home | T048 |
| 16 | Proveniência e limites declarados fora do painel de resultado | T047 |
| 17 | Negativo: a tela não pede confirmação de revisão | T047 |
| 18 | Negativo: falha inesperada não produz número | T047 |

## Observações de plano

- **Séries de microdecisão.** As fichas citadas como `MD-000N` sem qualificação pertencem a
  **duas** séries distintas, e o achado A010 pediu que a diferença ficasse explícita: as da
  feature 017 (`MD-0001` a `MD-0008`) vivem em `.harness/decisoes/`; as citadas por `domain.md`
  e pelo contrato de aquisição (`MD-0003`, `MD-0008`, `MD-0009`, `MD-0011`) são da série
  pré-refundação, preservada dentro dos artefatos da extração. Onde este documento cita sem
  qualificar, entenda-se a série corrente.
- **Dívida do legado (A016).** `_reversa_sdd/domain.md` §7.2 regra 11 ainda descreve o comando de
  início derivado de `logoComoTitulo`, prop removida pelo adendo 016. O plano está correto — T044
  usa `comInicio` —; é o artefato da extração que está atrasado, e se corrige na próxima
  re-extração, não aqui.
- **`referencias/` (A013).** T001 e T003 escrevem sob a mesma árvore, em ramos distintos
  (`referencias/` e `referencias/oms/`) e sem conflito de arquivo; seguem paralelizáveis.

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

### Rodada de 2026-07-27 — cadeia do gerador (T030 a T033)

**Desvios de forma frente ao plano, todos declarados:**

1. **Extensão `.mts`, não `.ts`,** em todo o gerador — a mesma razão que T003 e T029 já
   encontraram: o `package.json` do Next não declara `type: module`. O contrato §5.1 foi
   reconciliado.
2. **T030 virou quatro módulos,** não um: `criterios.mts` (o que se exige do dado, com a
   proveniência de cada exigência), `extracao.mts` (texto → `L/M/S` recortado e canonizado),
   `falha.mts` (o modo de falha único do contrato §7) e `verificacoes.mts` (a mecânica).
   O motivo é o teto de 400 linhas do mantenedor: em um arquivo só, davam 503. A divisão
   também separou o que muda por motivos diferentes — os critérios mudam quando a fonte muda,
   a mecânica quando o gerador muda.
3. **O recorte (D-04) e a canonização (§4.2) migraram da emissão para a extração.** O plano os
   atribuía a T031, mas V4 a V7 precisam valer sobre o dado que se embarca, não sobre o bruto.
   A emissão ficou sem aritmética alguma: recebe tabela provada e produz texto.
4. **V3 vive em `extracao.mts`,** e não com as outras verificações: a continuidade da faixa só
   se apura durante a varredura das linhas.

**Achados de conteúdo, com consequência sobre a spec** (os quatro reconciliados no contrato
`interfaces/tabelas-de-referencia.md`):

1. **A aba do comprimento/estatura 2006 é `LFA_boys_z_exp`** — sem o `h` do nome do arquivo
   (`lhfa-boys-…`). O catálogo de origens previa `lhfa_boys` e V1 recusaria o arquivo certo;
   `origens.mts` foi corrigido, mantendo os três grafismos aceitos.
2. **Os dois arquivos de estatura 2007 têm 15 colunas,** não as 13 do contrato §3: `StDev` e
   `SD5neg` a mais. V2 passou a exigir as colunas de que o gerador depende e a tolerar quatro
   opcionais conhecidas; coluna desconhecida continua sendo falha.
3. **V5, como enunciada, era clinicamente falsa.** O peso mediano cai no dia 1 (perda ponderal
   fisiológica do recém-nascido, −0,87% no menino e −1,13% na menina) e a estatura cai no dia
   731. Os dois degraus entraram declarados e com limite de magnitude, o que torna V5 mais
   forte do que era. **O segundo degrau vale como evidência independente:** mede −0,6715 cm,
   que é a própria constante de 0,7 cm da conversão de posição (RF-08, D-11), no exato dia que
   D-16 fixou como fronteira dos dois anos. O dado tabular confirmou, por conta própria, duas
   decisões que o plano tomara por leitura da caderneta.
4. **A "limpeza do ruído de ponto flutuante" não altera número algum.** Medição sobre as
   12.964 linhas: `Number(v.toFixed(4)) === v` em toda parte. O `18.505700000000001` já *é* o
   ponto flutuante de `18,5057` — o ruído está na grafia decimal, não no valor. A promessa do
   contrato §4.2 passou de "não altera nos casos-âncora" a "não altera em nenhuma célula".

**Guarda acrescentada além do plano:** duas origens não podem emitir o mesmo módulo, sob pena
de o dado de uma sobrescrever o da outra em silêncio.

**Fichas abertas e fechadas nesta rodada:** `MD-0007` (a verificação mede o que a fonte faz —
os degraus de V5, as colunas toleradas de V2 e o alcance de V4 a V7 sobre o recorte) e
`MD-0008` da série corrente (a idempotência como propriedade do texto emitido: sem data de
relógio, formatação por construção, grafia mínima com dupla guarda). A segunda é homônima da
`MD-0008` pré-refundação, e a própria ficha abre declarando a colisão.

**Como a rodada foi provada:** as 14 tabelas passam as sete verificações (12.964 linhas,
90.748 desvios reconstruídos da LMS, pior divergência 5·10⁻⁴ — o empate de arredondamento da
terceira casa publicada); nove sabotagens dirigidas confirmaram que cada verificação morde a
anomalia que lhe cabe, inclusive a distinção fina entre V6 e V7; as quatro âncoras conferem na
saída; a segunda execução reporta "14 já idênticos, 0 escritos".

**Dívida declarada:** `npm run format:check` acusa 544 arquivos fora de formato, quase todos
documentação pré-existente do Reversa e testes anteriores a esta feature. Não é regressão desta
rodada e não é gate do CI, que cobra `lint`, `typecheck` e `test`. Fica registrado como dívida
de higiene do repositório, a tratar fora do escopo da 017.

### Rodada de 2026-07-27 (segunda) — a leitura do dado (T020, T034, T007, T011)

**Ordem executada, e por quê.** O pedido era T034, mas ela depende de T020, que estava aberta;
e entregar a leitura das tabelas sem o teste dos seus limites deixaria descoberto justamente o
risco que o roadmap §9 classifica como alto. A rodada fechou, então, a cadeia mínima verificável
`T020 → T034 → T007 → T011`. T007 saiu do papel de "sem dependências" que o plano lhe dava: as
tabelas sintéticas que ela constrói precisam do contrato que T034 declara.

**Decisões de forma tomadas na implementação, todas declaradas:**

1. **A união do índice antropométrico discrimina por `estado`,** não por `tipo`. A saída da
   fachada continua com `tipo`, como nos quatro domínios existentes; usar a mesma palavra nos
   dois níveis faria um resultado com quatro índices carregar cinco campos `tipo` de
   significados diferentes.
2. **`idadeUsada` é objeto, não string.** `data-delta.md` §2.3 a descrevia como
   `"cronologica" | "corrigida" | "pos-menstrual"` "com o desconto quando houver"; RF-20 pede a
   idade **com** o desconto, então ela ficou como espécie + valor + unidade + desconto. É a mesma
   informação, num lugar só.
3. **A idade gestacional na entrada é campo opcional,** e não `… | null` como o delta de dados
   escreveu: é a forma que o resto da plataforma usa para campo ausente (molde de
   `EntradaDatacao`), sem diferença de comportamento.
4. **A fronteira DE TABELA mora em `leitura.ts`; a DE RÓTULO, em `classificacao.ts`** (T038). O
   cabeçalho de cada um declara onde está a outra. Foi a maneira de honrar "as duas fronteiras
   separadas" sem que a separação virasse dispersão.
5. **`MotivoSemTabela` não é `ForaDoEscopoDaFonte`.** A leitura informa que a OMS não publica
   linha para aquela combinação; traduzir isso em recusa clínica, global ou parcial, continua
   sendo de `elegibilidade.ts` (T027). Duplicar a política em dois lugares criaria duas verdades.

**Achado de aritmética no plano, sem consequência de comportamento.** D-05 chama a fronteira de
tabela de "61 meses (1856 dias)", como se os dois números fossem o mesmo ponto. Não são:
`⌊1856 / 30,4375⌋ = 60`. O que a fonte tem é um encaixe exato — o dia 1856 é a última linha da
tabela de 2006 e o dia **1857** é o primeiro do mês 61 de 2007 —, e é isso que o código
implementa e o teste prova, nos dois lados. A decisão não muda; o que estava impreciso era a
maneira de enunciá-la, e fica corrigida aqui.

**Guarda acrescentada além do plano:** `conferirTabela` recusa, na montagem do acervo, tabela com
unidade trocada ou com array mais curto do que a faixa que ela própria declara. É barata (14
comparações no `import`) e cobre a única maneira de o dado gerado mentir sem que a geração tenha
falhado: alguém editar um módulo à mão, contra o aviso do cabeçalho.

**Como a rodada foi provada:** 22 casos novos em `leitura-oms.test.ts`, com cada fronteira
exercitada no par de dias que a define e conferida contra as âncoras V7 do contrato de aquisição
(`Day 0` do perímetro cefálico = 34,4618; `Month 61` do peso = 18,5057 no menino e 18,2579 na
menina) e a de D-14 (`Day 1856` do peso masculino = 18,4968). Suíte completa em **446 testes,
33 arquivos** (antes 424 em 32), `typecheck` e `eslint` limpos. Nenhum arquivo pré-existente foi
tocado nesta rodada.

### Rodada de 2026-07-27 (terceira) — o motor inteiro (Fases 2 e 3)

Fecharam-se as 23 ações restantes das duas fases: os dez testes que faltavam (T009,
T010, T012 a T019) e os treze módulos do núcleo (T021 a T028, T035 a T039). O domínio
está completo e provado; abre-se a Integração.

**Achados de conteúdo, com consequência sobre a spec.** Os três primeiros vieram da
transcrição da caderneta em T023, feita com os dois PDFs à mão (menino e menina):

1. **A concordância destoante do comprimento está nos DOIS materiais,** e não só no da
   menina, como supunha a lacuna 🟡 de `requirements.md` §10. A fonte imprime
   "Comprimento adequada para idade", "Baixa comprimento para idade" e "Muito baixo
   comprimento para idade" em ambos. A premissa fica resolvida e a consequência
   simplifica: os rótulos não variam por sexo, e uma tabela só os atende.
2. **O comprimento troca de SUBSTANTIVO aos dois anos** — "Comprimento" nos gráficos de
   0 a 2 anos (p. 90), "Estatura" a partir de 2 (pp. 93 e 96) —, na mesma fronteira de
   D-16 em que troca a posição de medida. O plano só previa a troca de nomenclatura do
   IMC aos cinco anos (RN-06); esta é uma segunda troca, na outra fronteira, e entrou
   em `classificacao.ts` com teste no par 730/731.
3. **Os rótulos impressos divergem da paráfrase da spec** em três pontos de artigo:
   a fonte escreve "Peso elevado para idade" (RN-04 diz "para a idade") e usa a SIGLA
   no perímetro cefálico — "PC acima do esperado para a idade", "PC adequado para
   idade" (RN-07 escreve o nome por extenso). Transcreveu-se o impresso: o médico
   compara a tela com a caderneta que tem na mão.
4. **Uma célula das 1596 do INTERGROWTH-21st excede a tolerância de 0,005,** e é
   empate de arredondamento, não erro de coeficiente: peso masculino, semana 55,
   z = −3, em que a tabela publica 4,40 kg e a equação devolve 4,40503. O teste a
   **nomeia** em vez de afrouxar a tolerância — uma folga maior acomodaria também um
   coeficiente errado. Confirma, por outro caminho, o "pior desvio 0,005" de T004.

**Decisões de implementação declaradas:**

1. **Duas idades governam coisas diferentes, e a distinção é explícita na fachada.** A
   idade CRONOLÓGICA governa como a criança foi medida (a posição esperada é
   propriedade do corpo, não da curva); a idade que INDEXA a curva — corrigida
   enquanto a correção vale — governa leitura, escopo e faixa de rótulo. É a premissa
   do roadmap §4 levada a código, e o único ponto em que as duas divergem de propósito.
2. **Os três anos da correção estendida valem 1095 dias,** pela mesma disciplina de
   D-16: ano de 365 dias corridos, não data civil de aniversário. O plano fixara em
   dias só a fronteira dos dois anos; esta é a irmã que faltava.
3. **As faixas de plausibilidade TRAVAM,** ao contrário do molde da 014, em que valor
   fora da faixa é clampado com aviso. A razão é o que cada faixa significa: lá é o
   intervalo de validação da equação, e o adulto fora dele existe; aqui é
   plausibilidade antropométrica, e criança de 200 kg é erro de digitação, que
   clampado devolveria escore extremo com aparência de cálculo.
4. **O escopo da fonte precede o preenchimento.** Numa criança de 3 anos, o perímetro
   cefálico sai como fora-de-escopo mesmo quando não foi informado: dizer "medida não
   informada" sugeriria que ela deveria ter sido, quando a caderneta simplesmente não
   a classifica nessa idade.
5. **O aviso da conversão de 0,7 cm acompanha DOIS índices,** o de estatura e o de IMC,
   porque ambos consomem a medida convertida (D-11). Pendurá-lo só no primeiro
   esconderia do prescritor que o IMC também mudou.
6. **`ehPreTermo` não é *type guard*.** A primeira versão o declarava `ig is
   IdadeGestacional`, o que estreitava o ramo negativo a `never` e quebrava o
   `typecheck`: o predicado distingue "é pré-termo", não "é idade gestacional".
7. **O teste da fachada nasceu acima do teto de 400 linhas** e foi partido em dois por
   coesão: `fachada.test.ts` responde pelo que a calculadora calcula, e
   `fachada-recusas.test.ts` pelos quatro cenários negativos em que ela se recusa.

**Como a rodada foi provada.** Suíte de 446 para **625 testes em 44 arquivos**, todos
verdes; `typecheck` e `eslint` limpos; Prettier conforme nos arquivos da rodada. As
provas de maior alcance: os **3204 pares** do oráculo da OMS reproduzidos pela FACHADA
(T019), com a cadeia inteira sob prova — datas, escopo, padrão, leitura, LMS, cauda e
classificação —; os **2492 pares** conferidos direto no LMS (T010); as **1596 células**
do INTERGROWTH-21st (T012); e oito propriedades `fast-check` sobre entrada arbitrária
válida, entre elas a de que nenhum resultado mistura as duas réguas. A fronteira
arquitetural de RF-01 virou teste que lê os 25 arquivos do domínio e falha se algum
importar de fora dele, mencionar React/Next/Primer ou ler o relógio.

**Tetos do mantenedor:** nenhum arquivo de código do domínio passa de 400 linhas — o
maior é `oms/leitura.ts`, com 331, e o segundo é a fachada, com 296.

### Rodada de 2026-07-28 — integração e polimento (T040 a T052)

**Decisões de implementação da tela, declaradas porque divergem do molde ou porque a
alternativa era razoável:**

1. **Campo vazio é ausência, não erro** (`formulario.tsx`, RF-06). O molde da 014
   converte campo vazio em `NaN` para o motor recusá-lo, porque lá todo campo é
   obrigatório. Aqui a falta de uma medida suprime só o índice que dela depende, então o
   vazio vira `undefined`. Só texto não-numérico produz `NaN` — e esse o motor recusa
   como digitação inválida, que é o que ele é.
2. **A posição da medição não tem rádio pré-marcado** (RN-09). Supor "deitado" erraria
   por 0,7 cm em silêncio, na medida exata que o escore de estatura e o de IMC consomem.
3. **Idade gestacional: semanas preenchidas com dias em branco contam zero.** "32
   semanas" é a forma corrente de dizer "32 semanas e 0 dias"; já os dois campos em
   branco significam idade gestacional não informada, e disparam a premissa de termo
   declarada (RN-15). Dias preenchidos sem semanas produz ofensor, como deve.
4. **O título do bloco de índice é neutro** (`resultado.tsx`). A caderneta troca o
   substantivo aos 2 anos — "Comprimento" antes, "Estatura" depois —, e o rótulo literal
   que o domínio devolve já traz o certo. Escrevê-lo também no título seria a segunda
   implementação da fronteira dos 730 dias, agora na camada mais livre para divergir do
   motor numa refatoração futura.
5. **A tela formata, nunca recalcula.** Uma casa decimal e sinal explícito inclusive no
   zero (D-13); o valor não arredondado fica intacto no objeto de saída. Consequência
   aceita: um escore de −0,04 exibe-se como `+0.0`, porque o que se mostra é o valor
   arredondado, e ele é zero.
6. **A proveniência aparece antes do primeiro número.** RF-13 pede o bloco fora do
   painel; a tela o mantém visível desde o carregamento. Os limites do que a ferramenta
   pode afirmar valem para quem ainda vai digitar.
7. **As referências são impressas a partir de `referencia.versaoEdicao`**, e não de uma
   string repetida na tela — mesma disciplina anti-drift da nota de proveniência.

**Duas correções de forma que T052 encontrou, e que não eram cosméticas.**
`validarMedidas` tinha 62 linhas por repetir três vezes o mesmo bloco de faixa: virou a
tabela `MEDIDAS_VALIDAVEIS`, com 40, e uma quarta medida um dia passa a ser uma linha.
O formulário repetia cinco vezes a anatomia campo → erro → blur: ganhou o subcomponente
`CampoNumerico` e caiu de 258 para 226 linhas. Nenhuma mensagem, código de ofensor ou
rótulo mudou — os 218 testes do domínio e da tela passaram sem edição, que é a prova de
que a refatoração foi de forma.

**Como a rodada foi provada.** Suíte de 625 para **642 testes em 45 arquivos** e **36
testes e2e**, todos verdes; `typecheck` e `eslint` limpos. Cobertura de `models/**` em
97,02% de statements (96,05 branches, 98,33 funções, 97,16 linhas), **sem exclusão
alguma** — T050 previa excluir os módulos de dados se distorcessem a métrica, e eles não
distorcem, por serem cobertos ao ser importados. `vitest.config.ts` e
`e2e/axe-baseline.json` ficaram intocados.

**Três achados de ferramenta e de ambiente, registrados para quem repetir:**

- **O `next build` não publica mais o *First Load JS*.** O Next 16 com Turbopack imprime
  só a lista de rotas. A comparação de D-09 foi reconstruída de
  `.next/build-manifest.json`; o registro está em `medicao-bundle.md`.
- **e2e vermelho em bloco é suspeita de servidor obsoleto, não de regressão.** A primeira
  execução falhou em 35 dos 36 testes, inclusive os que a rodada não tocou, porque o
  Playwright reutilizou um `next-server` de quatro horas antes. Encerrado o processo,
  tudo passou.
- **O `next build` reescreve `next-env.d.ts`** (troca `.next/dev/types` por
  `.next/types`). É artefato gerado; `git checkout --` depois da medição mantém o diff
  limpo.

**Tetos, reconferidos com a tela dentro:** nenhum arquivo escrito à mão acima de 400
linhas (o maior é `formulario.tsx`, com 344) e nenhuma função de domínio acima de 50 (a
maior tem 40). Os componentes de tela excedem as 50 linhas por função — 226 e 108 —,
como já ocorre nas outras calculadoras: o corpo é JSX declarativo, e o teto mira lógica.
A exceção dos seis módulos de dados acima de 400 linhas está declarada no README, com o
seu limite.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-26 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-27 | Motor completo (T009–T019, T021–T028, T035–T039): quinto domínio puro fechado e provado, 625 testes verdes. Quatro achados de conteúdo — a concordância destoante nos dois materiais, a troca de substantivo do comprimento aos 2 anos, os rótulos com artigo divergente da paráfrase da spec e o empate de arredondamento nomeado do INTERGROWTH | reversa-coding |
| 2026-07-27 | Leitura do dado executada (T020, T034, T007, T011): tipos do domínio, repositório injetável das 14 tabelas e o teste das três fronteiras nos seus pares. Achado de aritmética em D-05 registrado (1856 dias é o mês 60; o encaixe está em 1856/1857), sem mudança de comportamento | reversa-coding |
| 2026-07-27 | Cadeia do gerador executada (T030 a T033): 14 módulos de dado emitidos e verificados. Quatro achados de conteúdo reconciliados no contrato de aquisição (aba `LFA_*`, 15 colunas na estatura 2007, os dois degraus de V5 e a natureza do ruído de ponto flutuante) | reversa-coding |
| 2026-07-26 | Reconciliação sobre a auditoria cruzada: T002 concluída fora do ciclo de código (A001/A009); T003 vira a ferramenta de aquisição e T029 o leitor nativo (A007); T008 passa a congelar também o oráculo `SDn` da OMS e T010 depende dela, não de `referencias/` (A003); RF-06 citado em T018 e T020 (A002); pares de limite 3682/3683 e 730/731 em T011, T015 e T016 (A005/A006); T033 aponta para os valores-âncora do contrato (A008); T045 passa a depender de T046 (A015); T049 grava em arquivo próprio (A014); mapa dos dezoito cenários e observações de plano acrescentados (A011, A010, A013, A016) | reversa |
| 2026-07-27 | Casos-oráculo congelados (T008): 356 casos de 14 tabelas da OMS (3204 pares conferidos) e as 1596 células do INTERGROWTH-21st, em `tests/apoio/casos-oraculo-puericultura.json`. Terceira fonte (`gigs`/`anthro`) dispensada por MD-0010. Achado da rodada — a coluna `SD4` já vem com a cauda aplicada nos indicadores de peso, e é silenciosa em C-E/I e PC/I por `L = 1` — reconciliado em RF-03, no roadmap (D-10, D-10.1) e no contrato §5 | reversa-coding |
| 2026-07-28 | Integração e polimento (T040–T052): a feature passa a existir para o usuário — formulário, painel, proveniência, contêiner, tela, rota, folha própria, 17 testes de integração e 5 e2e com axe em zero. D-09 medida e confirmada (as sete rotas existentes com first-load bruto idêntico byte a byte); cobertura de `models/**` em 97,02% sem exclusão alguma; dois excessos de teto achados e corrigidos (`validarMedidas` 62→40, formulário 258→226). 52/52 ações | reversa-coding |
