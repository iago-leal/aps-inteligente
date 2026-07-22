# Relatório da feature — 004-estilo-primer-nas-telas

> Data: 2026-07-21
> Requirements: `requirements.md` · Roadmap: `roadmap.md` (D-01..D-10) · Execução: `actions.md` (15/15) e `progress.jsonl`

## Entrega em uma frase

A identidade visual da plataforma passou integralmente ao Primer (`@primer/react` 38.33.0 + `@primer/primitives` 11.9.0, pinados), com a calculadora inteira migrada sem alteração de comportamento, tema do usuário preservado, privacidade provada em runtime e as dívidas técnicas 3 (parte e2e) e 4 quitadas.

## Medições (antes → depois)

| Métrica | Antes (baseline, 2026-07-21) | Depois | Leitura |
|---|---|---|---|
| First load JS+CSS+HTML (gzip) | 126,3 kB | 279,1 kB | **+152,8 kB** — acima do limiar de 100 kB do esclarecimento 4; gate D-08 disparou e o usuário **aceitou o delta** (D-10): custo de primeiro acesso, amortizado pelo cache do CDN em app de tela única de uso repetido |
| Fontes baixadas | 3 woff2 (IBM Plex), 64 kB | **0** | Pilha de fontes do sistema (identidade Primer); `font-src 'self'` sem uso |
| Violações axe — tela inicial | 1 (`color-contrast`, serious) | **0** | RF-05 superado (critério era ≤ linha de base) |
| Violações axe — tela com resultado | 1 (`color-contrast`, serious) | **0** | idem |
| `globais.css` | 699 linhas, 28 tokens próprios | **397 linhas, 0 cores próprias** | RF-04 cumprido; dívida técnica nº 4 quitada |
| Suítes | 188 testes (sem e2e funcional) | **193 unidade/integração + 16 contrato + 4 e2e** | Nível e2e da pirâmide nasceu (dívida 3-e2e quitada) |

Detalhe das medições e método em `baseline.md`.

## Critérios de aceitação do requirements

| Cenário (Gherkin §7) | Resultado |
|---|---|
| Calculadora re-estilizada preserva o comportamento | ✅ 193/193; nenhuma asserção comportamental alterada; textos clínicos byte a byte |
| Tema do usuário sobrevive à migração | ✅ e2e prova persistência pós-recarga; chave `aps-inteligente:tema` intocada |
| Privacidade por arquitetura resiste | ✅ e2e: zero requisições externas; contrato 16/16 com CSP idêntica |
| Fundação pronta para telas futuras | ✅ deps pinadas + provider no shell + diretriz no README; `globais.css` < 400 |
| Acessibilidade não regride | ✅ 1 → 0 violações nos dois estados |
| Pacote vetado não entra | ✅ `@primer/css` e `@primer/view-components` ausentes do manifesto |

## Arquivamento do design Claude (RN-05)

O projeto Claude Design "Tela de calculadora de insulina" — até a feature 003 a fonte visual canônica, portada token a token para `globais.css` — está **superado e arquivado como referência histórica**. Seus tokens (paleta verde-clínica, IBM Plex Sans/Mono) foram removidos do código; nenhum artefato novo pode citá-lo como autoridade de estilo. As decisões **clínicas** nascidas na feature 001 (metformina/TFG, sulfonilureia, entrada por momento) permanecem plenamente vigentes: pertencem ao domínio, não ao estilo. Vigilância: W001 do `regression-watch.md`.

## Desvios e acréscimos registrados

- `next.config.ts`: + `transpilePackages` (bundling; CSP byte a byte idêntica — nota no D-09).
- `interface/calculadora/erro-de-campo.tsx`: componente novo fora do plano (evita import circular; preserva `role="alert"`).
- `vitest.config.ts`: inline dos pacotes `@primer/*` no runner; stub de localStorage no teste do adaptador (jsdom 29 não implementa a API).
- `experimental.optimizePackageImports`: testado como mitigação de bundle, sem efeito, revertido.

## Pendências herdadas (fora do escopo desta feature)

- O job de CI não roda o e2e (a suíte existe e roda localmente); incluí-lo é decisão futura de pipeline.
- Observações O-01..O-04 do `regression-watch.md` (linha de base axe atualizável para 0 por decisão; revalidação de peers em upgrades).
