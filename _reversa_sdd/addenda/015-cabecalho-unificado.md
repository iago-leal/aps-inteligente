# Adendo 015 — Cabeçalho unificado entre home e calculadoras

> Identificador: `015-cabecalho-unificado` · Data: 2026-07-23 · Cenário: legado

## Vigência

Vigente desde 2026-07-23.

## Resumo da entrega

Harmonização só de apresentação do cabeçalho compartilhado. O alinhamento vertical da barra de ações, antes bifurcado entre as duas peles CSS da `Moldura` — `align-items: center` na variante `padrao` (`cabecalho.css`) e `align-items: flex-end` na `destaque` da home (`inicio.css`) —, passou a ser regra-única em `cabecalho.css`, ancorada ao topo (`flex-start`), válida para ambas as variantes. Como a logo tem altura fixa e igual (34px) nas duas telas (invariante da feature 013), ancorar ao topo faz os controles coincidirem entre home e calculadora, preservado o hero da home. `inicio.css` perdeu o override de alinhamento e ficou reduzido ao peso tipográfico do hero. Semântica, DOM e acessibilidade do cabeçalho intocados; `moldura.tsx` byte a byte inalterada. 4 de 4 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | interface/estilos (camada de estilo) | regra-alterada | `cabecalho.css`: o alinhamento vertical da barra de ações vira regra-única `align-items: flex-start` no `.cabecalho`, válida para `padrao` e `destaque`; ler o alinhamento do cabeçalho por este adendo e pelo `legacy-impact.md` da feature |
| `_reversa_sdd/architecture.md` | interface/estilos (camada de estilo) | regra-removida | `inicio.css`: removido o override `align-items: flex-end` da regra `.pagina[data-apresentacao="destaque"] .cabecalho`; a variante `destaque` guarda só o peso tipográfico do hero (padding, `borderColor-muted`, h1 28px, subtítulo 14px, `gap` 6px, coluna de 328px) |
| `_reversa_sdd/architecture.md` | interface/comum (Moldura) | regra-alterada (só apresentação) | Semântica intocada; muda apenas como o cabeçalho alinha os controles nas duas variantes. `git diff` vazio em `moldura.tsx` (escopo negativo, D-03) |
| `_reversa_sdd/interface-estilos/requirements.md` | Responsabilidades / Regras de Negócio | regra-alterada | O alinhamento do cabeçalho deixa de estar partido entre `cabecalho.css` e `inicio.css` e concentra-se em `cabecalho.css`; a apresentação do cabeçalho ganha fonte única de alinhamento |
| `_reversa_sdd/addenda/013-cabecalho-proporcoes.md` | camada da logo | regra-preservada (dependência) | A coincidência dos controles depende da logo de 34px igual nas duas telas, guardada pela 013; este adendo apoia-se nessa invariante |
| `e2e/cabecalho.spec.ts` | harness e2e | componente-novo (teste) | Guarda geométrica aditiva: coincidência vertical do alternador de tema entre `/` e `/dm2/insulina` na mesma viewport (±2px); falhava por 41,5px no estado bifurcado |

Nenhum impacto em `_reversa_sdd/domain.md`: nenhuma regra de domínio foi alterada. A feature é apresentação (CSS + guarda e2e); `models/` e o catálogo intocados, sem delta de dados nem de contrato externo (`/api/v1/status` inalterado).

## Regras sob vigilância

W001–W002 — ver `_reversa_forward/015-cabecalho-unificado/regression-watch.md`.

## Fontes

- `_reversa_forward/015-cabecalho-unificado/requirements.md`
- `_reversa_forward/015-cabecalho-unificado/roadmap.md`
- `_reversa_forward/015-cabecalho-unificado/investigation.md`
- `_reversa_forward/015-cabecalho-unificado/legacy-impact.md`
- `_reversa_forward/015-cabecalho-unificado/regression-watch.md`
- `_reversa_forward/015-cabecalho-unificado/progress.jsonl`
