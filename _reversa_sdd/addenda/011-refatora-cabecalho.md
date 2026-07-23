# Adendo — Refatoração do cabeçalho (toggle icônico e navegação de retorno)

> Feature: `011-refatora-cabecalho`
> Data: `2026-07-23`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-23.

## Resumo da entrega

O cabeçalho comum (Moldura) ganhou duas melhorias de navegabilidade, sem tocar nenhum motor de domínio nem o catálogo. O alternador de tema deixou de ser um botão textual ("Tema claro"/"Tema escuro") e passou a ser um controle icônico (`IconButton` do Primer) exibindo o glifo do tema-alvo — sol quando o tema é escuro, lua quando é claro — com nome acessível "Ativar tema claro"/"Ativar tema escuro". O cabeçalho das calculadoras passou a oferecer um comando de início (link `href="/"`, ícone casa, rótulo "Início"), ausente na home por redundância; a logo permanece decorativa e não-link. Entrega puramente de apresentação e navegação. **8 de 8 ações concluídas.**

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | `#moldura-comum` | regra-alterada | O alternador de tema da Moldura é agora um `IconButton` icônico (tema-alvo), não mais um `Button` textual; ler a apresentação do cabeçalho pela feature 011 |
| `_reversa_sdd/architecture.md` | `#moldura-comum` | componente-novo | A Moldura passou a renderizar, quando `logoComoTitulo` é falso (calculadoras), um comando de início como link interno para `/`; ausente na home |
| `_reversa_sdd/domain.md` | preferência de tema (RN-04 da feature 004) | regra-alterada | A alternância e persistência do tema são idênticas; muda apenas a forma do controle e seu nome acessível ("Ativar tema …") |
| `_reversa_sdd/domain.md` | privacidade por construção (ADR 0002) | inalterado (reafirmado) | Selo "Nada é salvo nem enviado" preservado; navegação de início é link interno same-origin; zero telemetria nova |
| `_reversa_sdd/c4-components.md` | Moldura / cabeçalho | delta-de-contrato-externo (nenhum) | `GET /api/v1/status` byte a byte (16/16); nenhum contrato externo afetado |

## Regras sob vigilância

Watch items criados nesta entrega (conteúdo em `_reversa_forward/011-refatora-cabecalho/regression-watch.md`):

- `W001` — alternador de tema icônico com nome acessível, sem texto "Tema claro/escuro"
- `W002` — comando de início presente nas calculadoras, ausente na home
- `W003` — logo segue não-link; início é o único `<a>` do cabeçalho da calculadora
- `W004` — selo de privacidade preservado em todas as telas
- `W005` — alternância e persistência do tema (`data-tema`) idênticas

Observações sem peso de regressão: `O-11-01` (polyfill de teste jsdom), `O-11-02` (baseline axe), `O-11-03` (extração do spec e2e), `O-11-04` (premissa `logoComoTitulo`).

## Fontes

- `_reversa_forward/011-refatora-cabecalho/requirements.md`
- `_reversa_forward/011-refatora-cabecalho/roadmap.md`
- `_reversa_forward/011-refatora-cabecalho/legacy-impact.md`
- `_reversa_forward/011-refatora-cabecalho/regression-watch.md`
- `_reversa_forward/011-refatora-cabecalho/progress.jsonl`

## Atualização 2026-07-23 — Selo de privacidade migra para a identidade

Ajuste de apresentação posterior à entrega da 011, no mesmo assunto (cabeçalho da Moldura), conduzido fora do ciclo forward por proporcionalidade — dois arquivos, só CSS/JSX, sem motor. O selo "Nada é salvo nem enviado", que a extração descrevia na zona de ações (`.cabecalho-acoes`), encravado entre o comando de início e o alternador de tema, passou para a zona de identidade (`.cabecalho-identidade`), sob o subtítulo, com um cadeado à frente (`ShieldLockIcon`, decorativo). A zona de ações fica coesa, só com os dois botões irmãos — início (nas calculadoras) e tema. Motivação: informação passiva (a garantia) não deve intercalar controles clicáveis; separar informação de ação agrupa os controles e ancora a garantia à proposta da ferramenta. Puramente apresentação: mesmo texto, mesmo nome acessível, mesma cor `success`; domínio, catálogo e contrato externo intocados.

### Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/interface-comum/design.md` | Fluxo Principal, passo 5 | regra-alterada | O selo deixa de ser renderizado junto ao botão de tema na zona de ações; passa à zona de identidade, sob o subtítulo, com `ShieldLockIcon`. A zona de ações renderiza só os controles (início + tema). As referências de linha (`moldura.tsx:79-90`) estão defasadas — reler pela atualização |
| `_reversa_sdd/interface-comum/requirements.md` | RF-07 (selo sempre visível) | inalterado (reafirmado) | Presença e visibilidade do selo em toda tela preservadas; muda apenas a localização — identidade, não a barra de ações |
| `_reversa_sdd/architecture.md` | `#moldura-comum` | regra-alterada | Na Moldura, o selo de privacidade pertence a `.cabecalho-identidade`; `.cabecalho-acoes` passa a conter apenas controles icônicos (início condicional + tema) |
| `_reversa_sdd/domain.md` | privacidade por construção (ADR 0002) | inalterado (reafirmado) | Selo "Nada é salvo nem enviado" preservado — mesmo texto e nome acessível; o cadeado é decorativo (`aria-hidden`, sem nome acessível); zero telemetria nova |
| `_reversa_sdd/c4-components.md` | `moldura` (linha 20) | inalterado | A descrição do componente ("selo de privacidade") permanece válida; nenhum contrato externo afetado |

### Regras sob vigilância

- `W004` (desta feature) — "selo de privacidade preservado em todas as telas" — reafirmado: o selo continua presente por nome acessível, apenas reposicionado. Verificação nesta sessão: integração 19/19 (`moldura.test.tsx` inclui `getByText(/nada é salvo nem enviado/i)`); e2e 23/23, incluindo os três `axe-baseline` em zero; conferência visual nos temas claro e escuro na calculadora de insulina.

Nenhum watch item novo: o delta é de apresentação e a única regra em jogo (selo sempre visível) já está sob `W004`.

### Fontes

- `interface/comum/moldura.tsx` — selo movido para `.cabecalho-identidade`; import de `ShieldLockIcon`
- `interface/estilos/cabecalho.css` — regra nova `.cabecalho-selo` (gap do cadeado, `align-self:flex-start`, respiro do subtítulo)
- Verificação: `tests/integration/interface/moldura.test.tsx`, `e2e/cabecalho.spec.ts`, `e2e/plataforma.spec.ts`, `e2e/calculadora.spec.ts`
