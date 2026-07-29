# Arquitetura — aps-inteligente

> Regenerado pelo Reversa Architect em 2026-07-28 (**re-extração nº 4** — absorve as features 015–022 sobre a base 001–014).
> Substitui a versão de 2026-07-23, que descrevia quatro domínios clínicos, três camadas e uma rota de status sem I/O.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Detalhes: `c4-context.md` · `c4-containers.md` · `c4-components.md` · `erd-complete.md` · `traceability/spec-impact-matrix.md`

## 1. Estilo arquitetural

🟢 **Plataforma web de calculadoras clínicas com domínio embarcado no cliente**, hoje com **seis calculadoras sobre cinco domínios clínicos**, mais um unit não clínico, sob uma casca comum. Uma home por seções despacha para seis telas, cada qual sobre um domínio puro e uma fonte clínica única (ADR 0001/0011).

**Cinco camadas**, com dependência estritamente unidirecional entre as quatro de aplicação:

```
scripts/**  (DEV-TIME: aquisição, verificação, emissão, congelamento — ADR 0018)
   ⋮ não entra no bundle; não é importada por nenhuma camada abaixo
pages (shell Next.js: home, 7 rotas de página, 1 rota de API, PWA)
  → interface/* (React + Primer: Moldura, telas, formulários, painéis, home)
    → models/* (5 domínios clínicos + 1 não clínico, TypeScript puro)
infra/{database,saude}.ts (pool pg + adaptador de saúde) — usada SÓ pelo healthcheck, e desde a 022 de fato
```

🟢 A **família `models/*` deixou de ser homogênea**, e a tabela de invariantes passa a declarar o **alcance** de cada linha, porque ausência não declarada se lê como esquecimento:

| Propriedade | Mecanismo | Alcance | Decisão |
|---|---|---|---|
| Domínio puro | `models/*` não importa framework nem lê o relógio | **7 units**; verificado por teste em `models/puericultura/**` | ADR 0003 |
| Erros como valores | union discriminada por `tipo`; exceção só para bug | 7 units | ADR 0004 |
| Coleta total de ofensores | a validação nunca para no primeiro erro | 7 units | regra 16 do `domain.md` |
| O motor informa, não escolhe | condutas alternativas, veredito, estrato, categoria, ficha trocável | 7 units | ADR 0005/0006 |
| Uma fonte clínica por unit | mescla proibida; **não** implica uma fachada por unit | 6 units clínicos | ADR 0011 · **ADR 0017** |
| Toda saída carrega `ReferenciaClinica` | catálogo `REFERENCIAS` congelado por `Object.freeze` | 6 units clínicos | ADR 0001 |
| Constantes clínicas congeladas | `fonte-clinica.ts` comentado com o RN/quadro de origem | 6 units clínicos | ADR 0001 |
| **Isenção declarada do não clínico** | `models/contribuicao` sem fonte, sem referência, sem catálogo | 1 unit | **ADR 0016** (`MD-0022`) |
| Escopo = fonte | fora do guia → `ForaDoEscopoDaFonte`, global **ou parcial** | 6 units clínicos | ADR 0009 |
| Privacidade por construção | sem `fetch`/`storage` de dado clínico; único durável é o tema | toda a plataforma | ADR 0002/0007 |
| Ritual de revisão só na insulina | as outras cinco telas não prescrevem dose | 1 tela | ADR 0012 |
| Aritmética de datas em dias epoch UTC | `Date.UTC`, sem fuso local | gestação e puericultura | ADR 0013 |
| Prosa com norma verificável | três classes de texto declaradas; citação byte a byte | todo literal exibido | **ADR 0019** |
| Enquadramento na `Moldura` | coluna do corpo no `<main>`, por `data-apresentacao` | todas as telas | **ADR 0021** |

🟢 **Três leituras da passagem anterior deixaram de valer**, e é o achado estrutural desta: uma fachada por unit (a puericultura tem duas, ADR 0017); todo unit de `models/` é clínico (ADR 0016); e a rota de status é pura (ADR 0020).

## 2. Containers e componentes

🟢 **Três containers reais**, mais um de borda e uma camada de ferramentas fora do runtime (diagramas em `c4-containers.md`):

1. **Aplicação web** — Next.js 16 (Pages Router, Turbopack) servida pela Vercel em `apsinteligente.app`; o motor dos seis domínios roda no cliente. Componentes-chave em `c4-components.md`: as **seis fachadas** (duas delas sob `models/puericultura`) e a `Moldura`, que desde a feature 021 é **dona do enquadramento horizontal** de toda tela, e não só da estrutura.
2. **Function `/api/v1/status`** — Vercel Function pública, sem autenticação e sem dado clínico. **Deixou de ser sem estado externo**: o handler é `async`, consulta o banco a cada requisição sob teto e devolve seis chaves (ADR 0008/0020).
3. **Banco PostgreSQL** — Neon em produção, `postgres:17.10-alpine` local na porta 5433. Continua **sem dado clínico** e sem esquema de negócio, e **deixou de existir só para o teste**: passou a ter consumidor de produção.

De borda: `localStorage`, exclusivamente para a preferência de tema.

Fora do runtime: **`scripts/**`**, 23 arquivos e 5.517 linhas de camada dev-time, com quatro geradores idempotentes e um conferidor de produção (ADR 0018). Não entra no bundle, e o Node do `engines` a executa sem dependência nova.

## 3. Dados

🟢 **Nenhum dado clínico é persistido** (ADR 0002). As entidades dos seis domínios são estruturas em memória, efêmeras por cálculo; o ERD as modela como composição de objetos imutáveis. Três acréscimos desta janela:

- 🆕 **Acervo tabular embarcado** (344 kB): 12.964 linhas L/M/S em 14 módulos gerados, com `manifesto.json` de 14 origens e `sha256`. **Não é persistência**: são módulos estáticos importados, e o custo fica confinado à rota que os usa, por `next/dynamic`.
- 🆕 **Acervo textual congelado**: dez fichas da caderneta com ~350 rótulos transcritos, mais os oráculos (356 casos da OMS, 1.596 células do INTERGROWTH-21st).
- 🆕 **Dois artefatos de dado de propósito oposto no tempo**: `inventario-textual.json` (1.187 literais com arquivo, linha e classe), **regerado** a cada revisão, e `citacao-linha-de-base.json`, **jamais** regerado (`MD-0018`).

🟢 O banco continua sem tabela, sem coluna e sem migração: a consulta de saúde é `SELECT $1::int AS ok`. O único dado durável do sistema segue sendo o tema. Gatilho registrado: introduzir persistência de dado clínico reabre LGPD, autenticação e specs (ADR 0002, `permissions.md`).

## 4. Integrações externas

🟢 **Nenhuma integração de runtime toca dado clínico**, e a novidade desta passagem está nas duas últimas linhas: a plataforma passou a **emitir** contratos para consumo de terceiros.

| Integração | Natureza | Momento | Dado clínico |
|---|---|---|---|
| Vercel (`apsinteligente.app`) | Build, CDN e execução de Function; domínio próprio apex → `www` | runtime | não |
| Neon (Postgres) | Banco gerenciado do healthcheck | **runtime de fato** (só `/api/v1/status`, a cada requisição, sob teto de 3.000 ms) | **não** — só `SELECT $1::int AS ok` |
| 6 fontes clínicas (SMS-Rio DM, SMS-Rio Pré-Natal, TeleCondutas, ACC/AHA PCE, Caderneta da Criança pp. 85–97 e pp. 66–75) | Dependência **editorial** (PDFs fora do repo) | dev-time | fundamenta constantes e rótulos |
| OMS e INTERGROWTH-21st | Dados tabulares **sob** a caderneta, que é a fonte editorial (`MD-0001`) | dev-time (`scripts/baixar-tabelas-oms.mts`, única leitura de rede da cadeia) | fundamenta os escores |
| Especificação do Banco Central (EMV/QRCPS-MPM) | Padrão do BR Code; não é fonte clínica (`MD-0022`) | dev-time (transcrita em constantes) | não |
| Link à AHA PREVENT | `<a>` nativo no `ContextoDaFonte` do risco CV | navegação do usuário | não |
| 🆕 **BR Code emitido** | Contrato que a plataforma **produz**, lido por aplicativo de banco de terceiros, **sem canal de erro** | runtime, no cliente | não |
| 🆕 **Registro SOAP emitido** | Texto copiado para o prontuário, fora da plataforma; contrato de **forma** | runtime, no cliente | **sim, na mão de quem copia** — nada sai pela rede |

🟢 **`GET /api/v1/status`** devolve **seis** chaves: `atualizado_em`, `versao`, `commit` (feature 002, intocados em nome, tipo e semântica) e `publicado_em`, `ambiente`, `banco` (feature 022). Responde **200 em todo estado do banco** (`MD-0031`, ADR 0020), `Cache-Control: no-store`, e 405 com `Allow: GET` **antes de qualquer I/O**. O acréscimo é aditivo e cabe em `/api/v1`; mudança incompatível exigiria `/api/v2` (ADR 0008).

🟡 **Contratos emitidos sem artefato próprio na extração até aqui.** O BR Code e o registro SOAP vivem em `_reversa_forward/019-*/interfaces/br-code.md` e `_reversa_forward/020-*/interfaces/registro-soap.md`. São os únicos formatos cuja quebra é observável **fora** do nosso alcance: um payload malformado falha na câmera de quem contribui, e uma mudança de forma no registro quebra a expectativa de quem cola no prontuário todo dia.

## 5. Qualidade e testes

- 🟢 **Cifra aferida nesta passagem, e não transcrita** (`MD-0033`): `npx vitest run` em 28/07 → **67 arquivos, 816 testes, exit 0, 8,6 s**. Fora da suíte padrão correm **3 arquivos de contrato** (exigem servidor de pé) e **6 roteiros e2e com 56 casos**. *Isso encerra a dívida **L-11**, que mantinha esta seção em "37 arquivos" desde a feature 018.*
- 🟢 **Unidade** — 39 arquivos de domínio em seis pastas. Property-based por domínio (toda saída referenciada, doses realizáveis, determinismo); **oráculos congelados** na puericultura, extraídos das fontes primárias por cadeia independente (`MD-0010`); `fast-check` sobre o BR Code, mais o vetor conhecido do CRC.
- 🟢 **Guardas de camada** — `invariantes.test.ts` **varre** `models/puericultura/**` e reprova se algum arquivo importar de fora, mencionar framework ou ler o relógio. Os outros cinco units seguem confiados à disciplina (dívida 1).
- 🟢 **Textos** — sete verificadores em `tests/unit/textos/`, todos vistos reprovar antes de aceitos (ADR 0019).
- 🟢 **Geométricas** — a guarda de enquadramento deixou de medir rota nomeada e passou a percorrer as rotas que o `CATALOGO` declarar, mais a home: **calculadora nova cai sob a guarda ao entrar no catálogo**. Foi a falha oposta que causou o defeito da feature 021.
- 🟢 **Contrato** — a suíte da rota ganhou **alvo duplo**, lido de `API_BASE_URL_DEGRADADO` e pulado quando a variável falta; a denylist é aferida sobre o corpo **realmente serializado**, nos dois estados do banco. O CI sobe dois servidores dentro do job `contrato`.
- 🟢 **e2e** — Playwright com `axe` em zero por rota; as rotas novas mantêm o zero **por asserção direta**, sem entrada na baseline.

## 6. Dívidas técnicas

| # | Dívida | Evidência | Gravidade |
|---|---|---|---|
| 1 | Fronteira de camadas sem verificação automática **nos cinco units antigos** | `eslint.config.mjs` sem regra de import boundary; só puericultura tem guarda executável | média — parcialmente mitigada desde a 017 |
| 2 | Acoplamento residual `interface/comum` → `interface/calculadora` | `preferencia-de-tema.ts` não realocado (comentado no código) | baixa — sem movimento há oito features |
| 3 | 🆕 `scripts/textos/classes/interface.mts` em **684 linhas** | acima do teto de 400; a exceção nominal das tabelas geradas não o alcança | média — mapa de declarações, não lógica; parte-se por camada de tela |
| 4 | `let proximoId` módulo-global em `formulario.tsx` (insulina) | ids de linhas dinâmicas | baixa — frágil sob HMR/StrictMode, funcional |
| 5 | Premissas clínicas 🟡 pendentes de validação | treze herdadas + seis desta janela (1.095 dias, posição de medida pela cronológica, uma casa decimal, faixas de plausibilidade, ficha anterior, repartição S/O) | média — decisões de projeto, não bugs |
| 6 | PDFs das seis fontes fora do versionamento | `MD-0008` | baixa por design — mitigada por `sha256` e oráculo congelado na puericultura, e por concordância cruzada no risco CV |
| 7 | 🆕 **`ehEstouroDeTempo` depende de frase do driver** | `infra/database.ts`, watch W007 da 022 | 🔴 **alta em fragilidade, baixa em probabilidade** — atualização de `pg` é gatilho de revisão |
| 8 | 🆕 Isenção nominal do verificador de citação | `MD-0027`, uma entrada em `SUBARVORES_COM_ORACULO_PROPRIO` | baixa — declaradamente aberta a revisão |
| 9 | 🆕 Duas cópias da aritmética de datas | `models/gestacao/datas.ts` e `models/puericultura/datas.ts`, gêmeos declarados em comentário (D-07 da 017) | baixa — convergência adiada por escolha |
| 10 | 🆕 `README.md` reprova `prettier --check` | já reprovava antes da 022 (`O-22-02`) | baixa — dívida de formatação alheia |
| — | ~~`globais.css` no teto de 400 linhas~~ **RESOLVIDA** | 367 linhas; a regra nova da 021 nasceu em folha própria para não reabri-la | — |

🟡 **Dívida de dependências, agora existente:** a afirmação de que as features seguintes à 010 não haviam introduzido dependência de runtime **deixou de valer**. Entrou `react-qr-code@2.2.0`, pinada exata, importada em **um** arquivo, atrás de envoltório e por `next/dynamic` (`MD-0024`); ela arrasta `prop-types@15.8.1`, resíduo inútil sob React 19, tolerado por já existir na árvore de desenvolvimento. Stack no restante recente e pinada, lockfile commitado.

🟢 **Reconciliação desta passagem:** encerram-se **L-07** (a `Moldura` descrita por prop que não existe mais) e **L-11** (cifra de testes), e a rota de status deixa de ser descrita como sem I/O. Os três units novos chegam com fonte declarada ou isenção declarada, referências, oráculo e testes.

## 7. Mapa de artefatos da extração

| Pergunta | Artefato |
|---|---|
| O que existe e onde | `inventory.md`, `dependencies.md` |
| Como funciona por dentro | `code-analysis.md`, `flowcharts/`, `data-dictionary.md` |
| Por que é assim | `domain.md`, `adrs/` (0001–0021), `state-machines.md`, `permissions.md` |
| Como se estrutura | `architecture.md` (este), `c4-*.md`, `erd-complete.md` |
| O que impacta o quê | `traceability/spec-impact-matrix.md` |
| O que se prometeu a terceiros | `openapi/status.yaml`; contratos de BR Code e registro SOAP em `_reversa_forward/019-*` e `_reversa_forward/020-*/interfaces/` |
