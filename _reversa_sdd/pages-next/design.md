# `pages/` — Design Técnico

> `design.md` · **Re-extração 4 (2026-07-28)**, regenerado. Fluxograma em
> `../flowcharts/pages.md`.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA.

## Interface

| Arquivo | Papel | Observação |
|---------|-------|------------|
| `pages/_document.tsx` | Documento HTML base | Idioma e identidade instalável, same-origin. |
| `pages/_app.tsx` | Composição raiz | Primitivos do Primer, as **nove** folhas em ordem, e o provedor de tema. |
| `pages/index.tsx` | `/` | Metadados de privacidade; monta a home. |
| `pages/dm2/insulina.tsx` | `/dm2/insulina` | `TelaCalculadora`. |
| `pages/pre-natal/idade-gestacional.tsx` | `/pre-natal/idade-gestacional` | `TelaIdadeGestacional`. |
| `pages/cardiologia/dor-toracica.tsx` | `/cardiologia/dor-toracica` | `TelaCardiologia`. |
| `pages/cardiologia/risco-cardiovascular.tsx` | `/cardiologia/risco-cardiovascular` | `TelaRiscoCardiovascular`. |
| `pages/puericultura/crescimento.tsx` | `/puericultura/crescimento` | `TelaCrescimento`. |
| `pages/puericultura/consulta.tsx` | `/puericultura/consulta` | `TelaConsulta`. |
| `pages/api/v1/status.ts` | `/api/v1/status` | **Handler `async` com I/O** — ver unit própria. |

Configuração: `next.config.ts` com a raiz do empacotador fixada, e aliases de `models/*` e
`interface/*` no `tsconfig.json`. 🟢

## Fluxo Principal

1. O build gera páginas estáticas; nenhuma rota de tela busca dados em servidor.
2. O documento define o idioma e a identidade instalável.
3. A composição raiz importa os primitivos e as nove folhas **nesta ordem** — primitivos,
   `globais.css`, `moldura.css`, folhas de tela — e envolve a aplicação no provedor de tema.
4. Cada rota monta a sua tela pela `interface/`; toda interação seguinte é do cliente.

## A ordem das folhas, que virou requisito

Até a feature 020, a ordem importava pouco: as folhas eram disjuntas. Com `moldura.css`, ela
passou a carregar significado — a folha estabelece a coluna, e as folhas de tela declaram o
eixo vertical **sobre** essa coluna. Trocar a ordem quebraria o enquadramento sem produzir erro
em teste unitário, e é por isso que a regra está escrita e não subentendida. 🟢

## Fluxos Alternativos

- **Raiz sem redirecionamento:** `/` serve a home diretamente.
- **API não-`GET`:** responde `405`, com `Allow`.
- **API com o banco fora:** responde `200` degradado, e não `503`.
- **404:** segue o padrão do Next, sem página dedicada. 🟡

## Dependências

- `interface/{inicio,calculadora,gestacao,cardiologia,risco-cardiovascular,puericultura}` e
  `interface/comum/moldura`.
- `@primer/primitives`, `@primer/react`, e o provedor de tema.
- Next.js com Pages Router, React 19.
- **`infra/`**, mas **só** pela rota de API — nenhuma rota de tela toca infraestrutura.
- Vercel, para as variáveis de deploy.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Pages Router, e não App Router, desde a refundação. | estrutura de `pages/` | 🟢 fato; 🟡 racional |
| Tipografia pela pilha do sistema do Primer, sem fonte baixada. | `_app.tsx` | 🟢 |
| Raiz serve a home, sem redirecionamento. | `index.tsx` | 🟢 |
| Identidade instalável a partir de ativos same-origin. | `_document.tsx` | 🟢 |
| **(021)** A ordem de importação das folhas é requisito, e não convenção. | `_app.tsx` | 🟢 |
| **(018)** Os metadados se aferem contra o catálogo. | feature 018 | 🟢 |
| **(022)** A única rota com I/O é a de API; as sete de tela permanecem estáticas. | `pages/api/v1/status.ts` | 🟢 |

## Estado Interno

Nenhum no shell. O estado que existe do lado do servidor é o pool de `infra/`, alcançado só
pela rota de API. 🟢

## Observabilidade

Nenhuma no shell de páginas. O endpoint de status é o ponto de observabilidade da plataforma, e
desde a feature 022 informa também a saúde do banco. 🟢

## Riscos e Lacunas

- 🟡 **404 própria:** segue o padrão do Next; reavaliar se merece página dedicada. Não bloqueia.
- 🟡 **A ordem das folhas não tem guarda automática.** Uma reordenação passaria em `typecheck`,
  em `lint` e na suíte unitária, e só apareceria em captura de tela.
- 🟢 As lacunas 🔴 da primeira extração continuam resolvidas: API realizada, CSP e cabeçalhos
  verificados por suíte de contrato, tipografia migrada.
