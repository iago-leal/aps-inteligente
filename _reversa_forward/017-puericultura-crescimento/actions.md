# Actions: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Roadmap: `_reversa_forward/017-puericultura-crescimento/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 52 |
| Paralelizáveis (`[//]`) | 27 |
| Maior cadeia de dependência | 12 (T002 → T029 → T030 → T032 → T033 → T034 → T039 → T043 → T044 → T045 → T048 → T049) |

Convenções desta decomposição: toda ação de código cita no cabeçalho do arquivo o `RF-NN`
que a origina (Princípio VI); nenhuma ação de domínio importa framework (RF-01); as ações
`[//]` tocam arquivos distintos e não dependem entre si.

## Fase 1, Preparação

<!-- Setup, scaffolding, aquisição do dado de origem, entrada no catálogo. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Obter os PDFs da *Caderneta da Criança* (menino e menina, MS, 2.ª ed., 2020) em `referencias/` e fixar as pp. 85–97 como origem dos rótulos literais. **Bloqueia T023** (roadmap §8, passo 1; risco declarado em §9) | - | `[//]` | `referencias/` | 🟡 | `[ ]` |
| T002 | Fechar **MD-0004** (aberta): escolher a estratégia de leitura do `.xlsx` pelo gerador — parser como `devDependency` × leitura de ZIP + XML com built-ins do Node — preencher o campo D da ficha e reconciliar `roadmap.md` §5 (que promete `package.json` intocado) e `onboarding.md` §3 (que invoca `npx tsx`) com o que for decidido | - | `[//]` | `.harness/decisoes/MD-0004.md` | 🟡 | `[ ]` |
| T003 | Baixar os 14 `.xlsx` da OMS (URLs de `interfaces/tabelas-de-referencia.md#2`) para `referencias/oms/`, pasta ignorada pelo git, e registrar URL, data e `sha256` de cada arquivo | - | `[//]` | `referencias/oms/` | 🟢 | `[ ]` |
| T004 | Conferir, coeficiente a coeficiente, as seis expressões de μ e σ do INTERGROWTH-21st contra a tabela impressa de Villar 2015, e atualizar o campo ESTADO da microdecisão (pendência obrigatória de `investigation.md#3`) | - | `[//]` | `.harness/decisoes/MD-0002.md` | 🟡 | `[ ]` |
| T005 | Acrescentar a seção `puericultura` ao catálogo, com uma ficha ("Avaliação do crescimento infantil", rota `/puericultura/crescimento`) e a citação da caderneta na descrição — catálogo primeiro, como manda o README (RF-14, D-12) | - | `[//]` | `interface/inicio/catalogo.ts` | 🟢 | `[ ]` |
| T006 | Mapear `puericultura → SmileyIcon` no mapa de ícones da home (RF-14, D-12) | - | `[//]` | `interface/inicio/icones.tsx` | 🟢 | `[ ]` |

## Fase 2, Testes

<!-- Escritos antes ou junto do núcleo. Um teste por cenário Gherkin de requirements.md#7. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Apoio de teste: tabelas LMS sintéticas mínimas (D-08, injeção por construtor) e construtor de entrada de avaliação, no molde de `tests/apoio/construtores.ts` | - | `[//]` | `tests/apoio/puericultura.ts` | 🟢 | `[ ]` |
| T008 | Congelar a amostra de casos-oráculo em arquivo: escores por `gigs`/`anthro` (OMS, idades de mês inteiro entre 5 e 10 anos e idades diárias abaixo de 5) e valores em ±1/±2/±3 DP das tabelas do INTERGROWTH-21st, com a procedência de cada caso (`investigation.md#6`) | T003, T004 | - | `tests/apoio/casos-oraculo-puericultura.json` | 🟡 | `[ ]` |
| T009 | Teste de idades: dias epoch UTC independentes de fuso, calendário impossível como valor nulo, desconto `40 − IG`, correção ativa até 2 anos e até 3 anos com IG < 28 semanas, semanas pós-menstruais no par 64/65 (RF-05, RF-17, RF-19) | T007 | `[//]` | `tests/unit/dominio-puericultura/idades.test.ts` | 🟢 | `[ ]` |
| T010 | Teste do LMS e da correção de cauda: `L ≠ 0` e `L = 0`; oráculo embutido (medida igual a `SDn` devolve `z = n`); cauda aplicada a P/I e IMC/I e **não** aplicada a C-E/I e PC/I; sinal preservado nos dois lados (RF-02, RF-03) | T003, T007 | `[//]` | `tests/unit/dominio-puericultura/lms.test.ts` | 🟢 | `[ ]` |
| T011 | Teste da leitura da tabela: dia inteiro até 5 anos, mês completo (`⌊dias/30,4375⌋`) de 5 a 10 anos, sem interpolação; as duas fronteiras nos quatro pontos 1825, 1826, 1855 e 1856 dias (D-05, D-06) | T007 | `[//]` | `tests/unit/dominio-puericultura/leitura-oms.test.ts` | 🟡 | `[ ]` |
| T012 | Teste das curvas de pré-termo: μ e σ nos extremos e no meio da janela contra a tabela de sanidade de `investigation.md#3`; `z` em escala log para peso e comprimento e natural para PC; IMC inexistente na janela (RF-18) | T008 | `[//]` | `tests/unit/dominio-puericultura/intergrowth.test.ts` | 🟡 | `[ ]` |
| T013 | Teste de classificação: bordas `−3`, `−2`, `+1`, `+2`, `+3` em cada índice; ausência de categoria superior em C-E/I; troca de rótulos do IMC aos 1826 dias, com `z = +2,5` virando "Sobrepeso" aos 4a11m e "Obesidade" aos 5a0m (RF-04) | T001, T007 | `[//]` | `tests/unit/dominio-puericultura/classificacao.test.ts` | 🟢 | `[ ]` |
| T014 | Teste de validação por coleta total: três ofensores simultâneos, data de nascimento futura, nenhuma medida informada, IG fora de 22–42 semanas ou com dias fora de 0–6, faixas de plausibilidade (RF-09) | T007 | `[//]` | `tests/unit/dominio-puericultura/validacao.test.ts` | 🟡 | `[ ]` |
| T015 | Teste de elegibilidade: `IDADE_FORA_DA_COBERTURA` (global, sem número), `ABAIXO_DA_CURVA_DE_PRETERMO` (global) e `PC_ACIMA_DE_2_ANOS` (**parcial**, sem derrubar os demais índices) (RF-07) | T007 | `[//]` | `tests/unit/dominio-puericultura/elegibilidade.test.ts` | 🟢 | `[ ]` |
| T016 | Teste de medidas: conversão de −0,7 cm (deitado ≥ 2 anos) e +0,7 cm (em pé < 2 anos), aviso declarado na saída, e IMC calculado sobre a medida já convertida (RF-08, D-11) | T007 | `[//]` | `tests/unit/dominio-puericultura/medidas.test.ts` | 🟢 | `[ ]` |
| T017 | Teste de invariantes com `fast-check`: todo índice calculado sai com `ReferenciaClinica` não vazia, com padrão e com idade usada declarados; e fronteira arquitetural — nenhum `import` de framework em `models/puericultura/**` (RF-01, RF-10, RF-20) | T007 | `[//]` | `tests/unit/dominio-puericultura/invariantes.test.ts` | 🟢 | `[ ]` |
| T018 | Teste da fachada, um caso nomeado por cenário Gherkin de `requirements.md#7`: lactente a termo completo, prematuro na janela sem IMC, transferência em 64/65 semanas, IG ausente com premissa declarada, medida ausente que não invalida as demais, e os quatro cenários negativos | T007, T008 | - | `tests/unit/dominio-puericultura/fachada.test.ts` | 🟢 | `[ ]` |
| T019 | Teste dos casos-oráculo congelados: cada caso do arquivo reproduzido pelo motor dentro da tolerância declarada, com a divergência de mês inteiro (D-06) explicitada no próprio teste | T008 | `[//]` | `tests/unit/dominio-puericultura/casos-oraculo.test.ts` | 🟡 | `[ ]` |

## Fase 3, Núcleo

<!-- Quinto domínio puro, gerador do dado e leitura das duas famílias de curvas. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T020 | Tipos do domínio: entrada, `IdadesDerivadas`, `IndiceAntropometrico` como união discriminada (`calculado` / `ausente` / `fora-do-escopo`) e saída da fachada em três variantes, tudo `readonly` (`data-delta.md#2`) | - | `[//]` | `models/puericultura/tipos.ts` | 🟢 | `[ ]` |
| T021 | Aritmética de datas em dias epoch UTC copiada de `models/gestacao/datas.ts`, com o gêmeo e a dívida de convergência declarados no cabeçalho (RF-05, D-07, ADR 0013) | - | `[//]` | `models/puericultura/datas.ts` | 🟡 | `[ ]` |
| T022 | Declarar o gêmeo no cabeçalho de `models/gestacao/datas.ts` — comentário apenas, nenhuma linha de lógica tocada (D-07) | T021 | - | `models/gestacao/datas.ts` | 🟡 | `[ ]` |
| T023 | Fonte clínica congelada: rótulos literais dos quatro índices, os **dois** conjuntos do IMC (0–5 e 5–10 anos), referências de página por índice e a nota de proveniência (medição isolada × tendência, padrões em uso, leitura por dia até 5 anos e por mês depois) (RF-13, RN-04 a RN-07, RN-14) | T001, T020 | - | `models/puericultura/fonte-clinica.ts` | 🟢 | `[ ]` |
| T024 | Idades derivadas: cronológica, desconto, corrigida com os limites de 2 e 3 anos, `correcaoAtiva` e semanas pós-menstruais (RF-05, RF-16, RF-17) | T020, T021 | - | `models/puericultura/idades.ts` | 🟢 | `[ ]` |
| T025 | Medidas: conversão de posição de ±0,7 cm com aviso, e IMC sobre o comprimento/estatura já convertido (RF-08, D-11) | T020 | `[//]` | `models/puericultura/medidas.ts` | 🟢 | `[ ]` |
| T026 | Validação por coleta total, no molde de `models/risco-cardiovascular/validacao.ts`: ofensores travantes e faixas de plausibilidade, sem parar no primeiro erro (RF-09) | T020 | `[//]` | `models/puericultura/validacao.ts` | 🟡 | `[ ]` |
| T027 | Elegibilidade com os três motivos, sendo `PC_ACIMA_DE_2_ANOS` **parcial** — novidade frente ao molde da 014, que só tem recusa global (RF-07) | T020, T023 | - | `models/puericultura/elegibilidade.ts` | 🟢 | `[ ]` |
| T028 | Escore z pelo LMS e correção de cauda derivada da própria LMS, aplicada só a P/I e IMC/I (RF-02, RF-03, D-10) | T020 | `[//]` | `models/puericultura/oms/lms.ts` | 🟢 | `[ ]` |
| T029 | Gerador, leitura: abrir o `.xlsx` pela estratégia decidida em T002 e devolver as colunas localizadas **pelo nome do cabeçalho**, nunca pela posição (`interfaces/tabelas-de-referencia.md#3`) | T002, T003 | - | `scripts/oms/ler-planilha.ts` | 🟡 | `[ ]` |
| T030 | Gerador, verificações V1 a V7 com falha ruidosa e nenhuma escrita parcial, incluindo a reconstrução dos desvios a partir de `L/M/S` (V6) e os valores-âncora (V7) | T029 | - | `scripts/oms/verificacoes.ts` | 🟢 | `[ ]` |
| T031 | Gerador, emissão: recorte ao escopo da fonte (D-04), limpeza do ruído de ponto flutuante, arrays paralelos `l`/`m`/`s` com `inicio`, `fim` e `unidade`, cabeçalho de procedência por módulo e manifesto com URL, data e `sha256` | T029 | - | `scripts/oms/emitir-modulo.ts` | 🟢 | `[ ]` |
| T032 | Gerador, orquestração: percorrer os 14 recortes, encadear leitura → verificação → emissão, ser idempotente byte a byte e falhar dizendo qual URL e qual verificação pararam | T030, T031 | - | `scripts/gerar-tabelas-oms.ts` | 🟢 | `[ ]` |
| T033 | Rodar o gerador, conferir os valores-âncora do `onboarding.md` contra a saída e commitar os 14 módulos de dados e o manifesto junto do gerador que os produziu | T032 | - | `models/puericultura/oms/tabelas/` | 🟢 | `[ ]` |
| T034 | Repositório de tabelas da OMS: interface injetável, seleção por índice, sexo e faixa, índice de linha aritmético e as duas fronteiras dos 5 anos separadas (D-05, D-06, D-08) | T020, T033 | - | `models/puericultura/oms/leitura.ts` | 🟡 | `[ ]` |
| T035 | Equações fechadas do INTERGROWTH-21st: μ e σ por semana pós-menstrual para peso, comprimento e PC, com os coeficientes conferidos em T004 e a procedência no cabeçalho (D-02) | T004, T020 | - | `models/puericultura/intergrowth/equacoes.ts` | 🟡 | `[ ]` |
| T036 | Escore z de pré-termo: log para peso e comprimento, escala natural para PC, e ausência de IMC como variante `ausente` com motivo, jamais erro (RF-18, RN-17) | T035 | - | `models/puericultura/intergrowth/escore.ts` | 🟢 | `[ ]` |
| T037 | Escolha do padrão como único ponto de fronteira entre as duas réguas: INTERGROWTH-21st entre 27 e 64 semanas pós-menstruais, OMS sobre idade corrigida a partir de 65 (RF-18, RF-19, D-01) | T020, T024 | - | `models/puericultura/padrao.ts` | 🟢 | `[ ]` |
| T038 | Classificação por índice e faixa, com a troca de nomenclatura do IMC na fronteira de rótulo dos 1826 dias e sem categoria superior em C-E/I (RF-04) | T023 | - | `models/puericultura/classificacao.ts` | 🟢 | `[ ]` |
| T039 | Fachada `CalculadoraCrescimentoInfantil.avaliar`, síncrona, com repositório de tabelas injetável e o real por omissão: `validar → datar → escolher o padrão → ler a régua → classificar`, cada índice carimbado com padrão, idade usada e página (RF-01, RF-20, D-08) | T024, T025, T026, T027, T028, T034, T036, T037, T038 | - | `models/puericultura/calculadora.ts` | 🟢 | `[ ]` |

## Fase 4, Integração

<!-- Tela, rota, estilos e as suítes que exercitam a cola. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T040 | Formulário: sexo, data de nascimento, data da medição, peso, comprimento/estatura com posição explícita (sem default silencioso), perímetro cefálico e idade gestacional ao nascer em semanas + dias, com `erro-de-campo.tsx` para os ofensores (RF-11, RN-09) | T020 | `[//]` | `interface/puericultura/formulario.tsx` | 🟢 | `[ ]` |
| T041 | Painel de resultado: um bloco por índice com escore z de uma casa decimal e sinal sempre explícito, classificação literal, padrão, idade usada e página; variantes `ausente` e `fora-do-escopo` distinguidas; painel honesto em falha de invariante (RF-11, RF-21, D-13) | T020 | `[//]` | `interface/puericultura/resultado.tsx` | 🟡 | `[ ]` |
| T042 | Bloco de proveniência fora do painel de resultado, lendo o texto congelado no domínio (RF-13, molde da 014) | T023 | `[//]` | `interface/puericultura/proveniencia.tsx` | 🟢 | `[ ]` |
| T043 | Contêiner: estado efêmero, motor injetável, invalidação por edição marcando o resultado como desatualizado, `RelatorDeErros` nulo e **sem** ritual de revisão (RF-12, RF-15, RF-21) | T039, T040, T041, T042 | - | `interface/puericultura/app.tsx` | 🟢 | `[ ]` |
| T044 | Tela: composição da `Moldura` com `comInicio` (contrato do adendo 016; `logoComoTitulo` não existe mais), título e subtítulo com a fonte única | T043 | - | `interface/puericultura/tela.tsx` | 🟢 | `[ ]` |
| T045 | Rota `/puericultura/crescimento` com metadados próprios, no molde de `pages/cardiologia/risco-cardiovascular.tsx` | T044 | - | `pages/puericultura/crescimento.tsx` | 🟢 | `[ ]` |
| T046 | Folha de estilo da tela nova e o seu `import` no shell, no molde de `risco-cardiovascular.css` — só apresentação, sobre os tokens do Primer | T041 | - | `interface/estilos/puericultura.css` | 🟢 | `[ ]` |
| T047 | Teste de integração da tela: campos presentes, escore com uma casa decimal, invalidação por edição, ausência de caixa de confirmação, proveniência fora do painel, recusas honestas em tela e painel honesto na falha inesperada (RF-11 a RF-16, RF-21) | T043 | - | `tests/integration/interface/puericultura.test.tsx` | 🟢 | `[ ]` |
| T048 | E2e: navegação da home ao cartão da seção Puericultura e varredura axe da rota nova, com delta 0/0 e sem alterar `e2e/axe-baseline.json` (RF-14, RNF de acessibilidade) | T005, T006, T045 | - | `e2e/puericultura.spec.ts` | 🟢 | `[ ]` |

## Fase 5, Polimento

<!-- Medição, cobertura e documentação curta. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T049 | Medir o bundle com `next build` e registrar a comparação do *First Load JS* das rotas existentes contra `main`: elas devem ficar inalteradas, e só `/puericultura/crescimento` pode crescer (D-09) | T048 | - | `_reversa_forward/017-puericultura-crescimento/actions.md` (notas de execução) | 🟡 | `[ ]` |
| T050 | Conferir a cobertura de `models/**` ≥ 90% com o quinto domínio incluído; se os módulos de dados gerados distorcerem a métrica, excluí-los do `include` por decisão registrada, nunca por ajuste silencioso do limite | T039, T047 | - | `vitest.config.ts` | 🟡 | `[ ]` |
| T051 | README: linha da quinta calculadora na tabela de rotas, menção à seção nova e o procedimento de regeneração das tabelas da OMS com a leitura do `git diff` vazio | T045 | `[//]` | `README.md` | 🟢 | `[ ]` |
| T052 | Conferir os tetos do mantenedor nos arquivos novos — nenhum arquivo de **código** acima de 400 linhas, nenhuma função acima de 50 —, com a exceção dos módulos de dados gerados declarada onde ela vale | T039 | `[//]` | `models/puericultura/` | 🟢 | `[ ]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-26 | Versão inicial gerada por `/reversa-to-do` | reversa |
