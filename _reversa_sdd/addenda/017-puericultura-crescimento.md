# Adendo — Puericultura: escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: 2026-07-28
> Cenário: legado

## Vigência

Vigente desde 2026-07-28.

## Resumo da entrega

Quinta calculadora da plataforma e primeira seção de Puericultura: de sexo, datas de nascimento e de
medição, peso, comprimento/estatura e perímetro cefálico, a tela devolve os escores z dos quatro
índices antropométricos e a classificação nutricional na redação literal da *Caderneta da Criança*
(Ministério da Saúde, 2.ª ed., 2020, pp. 85–97). Atende também a criança nascida pré-termo, com as
curvas INTERGROWTH-21st na janela de 27 a 64 semanas pós-menstruais e as curvas da OMS sobre idade
corrigida depois dela. A feature é estritamente aditiva: nasce um quinto domínio puro
`models/puericultura` sob os sete invariantes da família, uma tela em `interface/puericultura/`, a
rota `pages/puericultura/crescimento.tsx` e a quarta seção do catálogo da home; nenhum dos quatro
motores existentes muda de comportamento.

Duas novidades estruturais distinguem esta entrega das anteriores da família. A primeira é o
**acervo tabular embarcado**: 12.964 linhas `L/M/S` em 14 módulos gerados, com procedência versionada
por `sha256`, produzidos por uma cadeia dev-time (`scripts/**`) que baixa, verifica e emite — e que
não é importada por código de aplicação. A segunda é o **oráculo congelado**: uma cadeia gêmea, de
propósito oposto, que extrai 356 casos da OMS e 1596 células do INTERGROWTH-21st das fontes
originais para que a suíte julgue o motor com números que não vieram dele.

Ações concluídas: **52/52** (`actions.md` todas `[X]`; `progress.jsonl` com 58 linhas, 52 `done`,
5 `verified` e 1 `achado`). Suíte verde: 642 testes em 45 arquivos (antes 625 em 44), 36 e2e,
cobertura de `models/**` em 97,02% de statements sem exclusão alguma, `typecheck`, `eslint` e
`prettier` limpos. A rota nova nasce com zero violação axe, e `e2e/axe-baseline.json` ficou intocado.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | #1 Estilo arquitetural | componente-novo | Onde se lê "quatro domínios clínicos independentes", leia-se **cinco**: `models/puericultura` (11 módulos escritos à mão + 14 de dados gerados), fachada `CalculadoraCrescimentoInfantil.avaliar`, dentro dos mesmos invariantes da família |
| `_reversa_sdd/architecture.md` | #1 — camadas | componente-novo | Uma camada **dev-time** passa a existir acima das três: `scripts/**` (aquisição, verificação, emissão e congelamento do oráculo). Não entra no bundle e não é importada por `models/`, `interface/` nem `pages/` |
| `_reversa_sdd/architecture.md` | #2 Containers e componentes | componente-novo | Quinta fachada de domínio e quinta tela sobre a `Moldura` comum; **nenhum container novo** — o motor cresceu no cliente, como no delta da 014 |
| `_reversa_sdd/architecture.md` | #3 Dados | delta-de-dados | Primeiro acervo tabular grande do sistema (344 kB em `models/puericultura/oms/tabelas/`, com `manifesto.json` de 14 origens). Não é persistência: são módulos estáticos importados, e "nenhum dado clínico é persistido" segue intacto |
| `_reversa_sdd/architecture.md` | #4 Integrações externas | delta-de-contrato-externo (nenhum real) | A tabela de integrações ganha duas fontes clínicas — OMS e INTERGROWTH-21st, chegando pela caderneta como fonte editorial única (MD-0001) —, ambas **dev-time**. A única leitura de rede da feature vive em `scripts/baixar-tabelas-oms.mts`; `GET /api/v1/status` permanece byte a byte |
| `_reversa_sdd/architecture.md` | #5 Qualidade e testes | regra-alterada (extensão) | 37 → 45 arquivos de teste. A dívida 🟡 "fronteira de camadas confiada à disciplina" (dívida 1) ganha **verificação automática no quinto domínio**: `invariantes.test.ts` varre `models/puericultura/**` e falha se algum arquivo importar de fora, mencionar React/Next/Primer ou ler o relógio. Os outros quatro domínios seguem sem essa guarda |
| `_reversa_sdd/architecture.md` | #6 Dívidas técnicas | regra-alterada | Dívida 5 recebe três premissas clínicas 🟡 novas (os 1095 dias do limite de correção, a idade cronológica governando a posição de medida, a exibição em uma casa decimal). Dívida 6 (fontes fora do versionamento) ganha os PDFs da caderneta, da OMS e do INTERGROWTH-21st, agora mitigada por `sha256` no manifesto e por oráculo congelado no git |
| `_reversa_sdd/domain.md` | nova seção de regras de domínio, após #6 | regra-nova | Dezoito regras do quinto domínio (RN-01 a RN-18): escore z por LMS, correção de cauda restrita a P/I e IMC/I, os quatro conjuntos de rótulos literais, a conversão de posição de ±0,7 cm, a idade corrigida do pré-termo e o modelo próprio das curvas INTERGROWTH-21st |
| `_reversa_sdd/domain.md` | #7 Invariantes transversais | regra-alterada (extensão) | O título passa a cobrir **cinco** domínios. O invariante 1 (domínio puro) deixa de ser afirmação da extração e vira teste executável no domínio novo |
| `_reversa_sdd/domain.md` | #7.1 Regras da interface com força de domínio | regra-alterada (extensão) | Regra 8 (invalidação por edição) e regra 10 (ritual só na insulina) preservadas e realizadas na tela nova, esta última com teste negativo que exige **zero** `checkbox` no DOM antes e depois de avaliar |
| `_reversa_sdd/domain.md` | #8 Fronteiras de escopo | regra-alterada (extensão) | MD-0009 ganha uma segunda espécie: além da recusa **global** (idade fora de 0–10 anos), a recusa **parcial** — o perímetro cefálico sai de escopo a partir de 731 dias sem derrubar os demais índices. Três fronteiras numéricas entram no artigo: 3683, 1856 e 730 dias |
| `_reversa_sdd/state-machines.md` | #3 Máquinas de tela | componente-novo | `EstadoCrescimento` (`vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada`), sem ritual de revisão, com invalidação por edição de campo |
| `_reversa_sdd/code-analysis.md` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | O catálogo passa a ter **quatro** seções (`puericultura` é a quarta, com uma ficha) e o mapa de ícones, quatro pares, mantido o fallback `null`. Diff aditivo: nenhuma linha removida |
| `_reversa_sdd/code-analysis.md` | Módulo 11 — `interface/estilos` | componente-novo | Quinta folha, `puericultura.css`, com 3 classes sobre tokens Primer; `globais.css` intocado nas 364 linhas |
| `_reversa_sdd/code-analysis.md` | Módulo 12 — `pages` | componente-novo | Rota `pages/puericultura/crescimento.tsx` e o `import` da folha nova em `_app.tsx`; as sete rotas existentes inalteradas |
| `_reversa_sdd/code-analysis.md` | Módulo 2 — `models/gestacao` | regra-alterada (comentário) | `datas.ts` é o **único arquivo de motor existente aberto na feature**, e só para declarar em comentário o gêmeo `models/puericultura/datas.ts` (dívida de convergência, D-07). Nenhuma linha executável mudou |
| `_reversa_sdd/data-dictionary.md` · `_reversa_sdd/erd-complete.md` | Domínio 5 | delta-de-dados | Value objects em memória do quinto domínio, com o discriminante do índice em `estado` (não `tipo`), `idadeUsada` como objeto e a idade gestacional ao nascer como campo opcional; sem persistência e sem migração |
| `_reversa_sdd/c4-components.md` · `_reversa_sdd/c4-context.md` | Fachadas de domínio · fontes clínicas | componente-novo | Quinta fachada no diagrama de componentes; quinta e sexta fontes clínicas no de contexto (OMS e INTERGROWTH-21st sob a caderneta) |
| `_reversa_sdd/traceability/spec-impact-matrix.md` | Matriz | componente-novo | Duas colunas novas (`mdl-puericultura`, `if-puericultura`), isoladas das demais como no precedente do risco CV |
| `_reversa_sdd/adrs/0002` · `0004` · `0005` · `0013` | — | delta-de-contrato-externo (nenhum real) | Privacidade por construção, erro-como-valor, o motor informa e a aritmética em dias epoch UTC: os quatro preservados e agora exercitados pelo quinto domínio — registrado para leitura, sem delta |

## Regras sob vigilância

Watch items desta feature (conteúdo em
`_reversa_forward/017-puericultura-crescimento/regression-watch.md`): **W001** a **W041**, quarenta e
um itens, os mais numerosos de qualquer feature até aqui. Agrupam-se em seis famílias:

- **Catálogo e camadas** — W001 a W004.
- **Cadeia do dado e sua procedência** — W005 a W010, W016, W020.
- **Fronteiras e leitura das tabelas** — W011 a W015.
- **Contrato do domínio, rótulos e escopo** — W017, W022 a W033.
- **Oráculos congelados** — W018, W019, W021, W034.
- **Tela, acessibilidade e custo** — W035 a W041.

## Fontes

- `_reversa_forward/017-puericultura-crescimento/legacy-impact.md`
- `_reversa_forward/017-puericultura-crescimento/regression-watch.md`
- `_reversa_forward/017-puericultura-crescimento/requirements.md`
- `_reversa_forward/017-puericultura-crescimento/roadmap.md`
- `_reversa_forward/017-puericultura-crescimento/data-delta.md`
- `_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md`
- `_reversa_forward/017-puericultura-crescimento/medicao-bundle.md`
- `_reversa_forward/017-puericultura-crescimento/progress.jsonl`

## Notas de reconciliação

Três pontos que a implementação decidiu e que a próxima re-extração deve ler no código, não na spec:

1. **D-09 deixou de ser premissa.** As sete rotas existentes têm *first load* bruto idêntico byte a
   byte; só `/puericultura/crescimento` paga os +80,3 kB gzip das tabelas. Medição e método em
   `medicao-bundle.md` — o `next build` do Next 16 com Turbopack não publica mais o *First Load JS*,
   e a comparação foi reconstruída de `.next/build-manifest.json`.
2. **Nenhuma exceção de cobertura foi necessária.** T050 previa excluir os módulos de dados gerados
   do `include` do `vitest.config.ts` caso distorcessem a métrica; eles não distorceram, por serem
   integralmente cobertos ao ser importados. O arquivo ficou intocado.
3. **A fonte impressa venceu a spec em quatro pontos de redação**, e a transcrição foi preservada
   como está, inclusive na concordância destoante do comprimento ("Comprimento adequada para idade")
   e no "Peso elevado para idade" sem artigo. O médico compara a tela com a caderneta que tem na mão:
   corrigir o português criaria divergência onde a fonte não tem nenhuma. Decisão registrada em
   `MD-0012`, que trata de quem nomeia o índice — o domínio devolve o rótulo literal, e a tela usa a
   forma neutra no título para não reimplementar a fronteira dos dois anos.
