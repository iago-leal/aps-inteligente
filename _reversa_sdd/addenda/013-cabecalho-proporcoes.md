# Adendo 013 — Proporções do cabeçalho da calculadora (padrão) alinhadas à home

> Identificador: `013-cabecalho-proporcoes` · Data: 2026-07-23 · Cenário: legado

## Vigência

Vigente desde 2026-07-23.

## Resumo da entrega

Correção só de apresentação no cabeçalho da variante `padrao` (calculadoras). O conteúdo, que colava nas bordas da página e ficava numa faixa comprimida, passou a encaixar na coluna centrada do corpo (`.calc-regioes`, 1180px) e a respirar na vertical, tomando o cabeçalho `destaque` da home como referência; a logo APSi da calculadora, que era "um degrau menor" (24px), igualou o wordmark da home (34px). Domínio, catálogo e semântica do cabeçalho intocados. 8 de 8 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | interface/estilos (camada de estilo) | regra-alterada | `cabecalho.css`: o cabeçalho `padrao` agora encaixa na coluna do corpo via `padding: 44px max(32px, calc(50% - 558px)) 36px` e a `.cabecalho-marca` vale 34px; ler o layout do cabeçalho por este adendo e pelo `legacy-impact.md` da feature |
| `_reversa_sdd/architecture.md` | interface/comum (Moldura) | regra-alterada (só apresentação) | Semântica intocada; muda apenas como o cabeçalho `padrao` se apresenta (proporção e tamanho da logo) |
| `_reversa_sdd/interface-estilos/requirements.md` | Requisitos Funcionais / Regras de Negócio | regra-nova | A técnica de coluna com `max()` — antes só do hero `destaque` (RF-07/008) — passa a valer também no cabeçalho base `padrao` |
| `_reversa_sdd/addenda/009-logo-apsi-no-cabecalho.md` | camada da logo | regra-alterada | Revê o "degrau menor" da marca: a `.cabecalho-marca` iguala a altura do wordmark da home (34px) |
| `e2e/plataforma.spec.ts` | harness e2e | componente-novo (teste) | Duas guardas geométricas aditivas: alinhamento do cabeçalho à coluna do corpo e igualdade de tamanho da logo |

Nenhum impacto em `_reversa_sdd/domain.md`: nenhuma regra de domínio foi alterada (`git diff models/` e `catalogo.ts` vazios).

## Regras sob vigilância

W001–W005 — ver `_reversa_forward/013-cabecalho-proporcoes/regression-watch.md`.

## Fontes

- `_reversa_forward/013-cabecalho-proporcoes/requirements.md`
- `_reversa_forward/013-cabecalho-proporcoes/roadmap.md`
- `_reversa_forward/013-cabecalho-proporcoes/legacy-impact.md`
- `_reversa_forward/013-cabecalho-proporcoes/regression-watch.md`
- `_reversa_forward/013-cabecalho-proporcoes/progress.jsonl`
- `_reversa_forward/013-cabecalho-proporcoes/screenshots/` (antes/depois × 2 temas)
