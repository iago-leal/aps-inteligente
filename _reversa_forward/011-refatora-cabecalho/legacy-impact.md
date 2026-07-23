# Legacy Impact: Refatoração do cabeçalho

> Feature: `011-refatora-cabecalho` · Data: `2026-07-23`
> Âncora: legado (`_reversa_sdd/architecture.md` + `domain.md`)

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `interface/comum/moldura.tsx` | Moldura comum (`_reversa_sdd/architecture.md#moldura-comum`) | regra-alterada | MEDIUM | Toggle textual → `IconButton` icônico; novo comando de início condicional |
| `interface/estilos/cabecalho.css` | Camada de estilo do cabeçalho | regra-alterada | LOW | Regra de herança para o link de início; sem cor própria |
| `tests/integration/interface/moldura.test.tsx` | Suíte de integração da Moldura | regra-alterada | LOW | Asserções do toggle e de links reconciliadas (D-06) |
| `e2e/calculadora.spec.ts` | e2e da calculadora | regra-alterada | LOW | Seletores do toggle atualizados para os novos rótulos |
| `e2e/plataforma.spec.ts` | e2e da plataforma | regra-alterada | LOW | Seletor do toggle atualizado; cenários de início extraídos |
| `e2e/cabecalho.spec.ts` | e2e do cabeçalho | componente-novo | LOW | Spec novo com os cenários de início→home e home-sem-início |
| `tests/apoio/setup-jsdom.ts` | Infra de teste (jsdom) | componente-novo | LOW | Polyfill de `adoptedStyleSheets` para o Tooltip do IconButton |
| `vitest.config.ts` | Config de teste | regra-alterada | LOW | Registra `setupFiles` do polyfill |

## Diff conceitual por componente

**Moldura comum (`interface/comum/moldura.tsx`).** A zona de ações do cabeçalho tinha um `Button` textual do Primer que alternava o tema mostrando "Tema claro"/"Tema escuro". Esse controle passou a ser um `IconButton`, exibindo o glifo do tema-alvo (`SunIcon` no escuro, `MoonIcon` no claro) e carregando o nome acessível "Ativar tema claro"/"Ativar tema escuro". O mecanismo de leitura/gravação do tema (`useSyncExternalStore` + `gravarTema` sobre `preferencia-de-tema`) é idêntico — só o gatilho de UI mudou. Além disso, quando `logoComoTitulo` é falso (calculadoras), o cabeçalho passa a renderizar um segundo `IconButton` (ícone casa) como link interno (`next/link`, `href="/"`, rótulo "Início"); na home (`logoComoTitulo` verdadeiro) esse comando é omitido. A logo permanece decorativa e não-link (D-04 da feature 009): o comando de início é o único `<a>` do cabeçalho da calculadora.

**Camada de estilo (`interface/estilos/cabecalho.css`).** Acréscimo de uma regra que fixa `text-decoration:none; color:inherit` no link de início (`.cabecalho-inicio`), para não depender da cascata de globais. Layout base, camada da logo e responsivo intocados.

**Suíte e infra de teste.** As asserções que fixavam o texto antigo do toggle e a ausência de links na calculadora foram reconciliadas (D-06). Foi adicionado um polyfill de `adoptedStyleSheets` ao ambiente jsdom porque o `TooltipV2` embutido no `IconButton` do Primer quebra sem ele; no navegador real (e2e) o tooltip funciona normalmente.

## Preservadas (regras 🟢 do domínio intactas)

- **Domínio clínico puro (ADR 0003):** `models/insulina`, `models/gestacao`, `models/cardiopatia-isquemica` sem qualquer diff. Nenhuma regra de cálculo, estratificação ou datação tocada.
- **Privacidade por arquitetura (ADR 0002):** zero coleta/envio; nenhuma telemetria nova; navegação de início é link interno same-origin. O selo "Nada é salvo nem enviado" permanece visível em todas as telas (RF-06).
- **Contrato `GET /api/v1/status` (ADR 0008):** byte a byte — 16/16 no teste de contrato.
- **Catálogo (`interface/inicio/catalogo.ts`):** intocado — rotas, títulos e papéis acessíveis idênticos.
- **`data-tema` como marcador observável (feature 004, RN-04):** mesmos valores `"claro"`/`"escuro"`, mesma persistência.
- **Logo como marca decorativa não-link nas calculadoras (feature 009, D-04):** preservada — a logo continua `aria-hidden`, `alt=""`, fora de âncora.

## Modificadas (regras 🟢 alteradas)

- **Apresentação do alternador de tema (feature 004):** de rótulo textual para controle icônico com nome acessível. Comportamento funcional (alternância + persistência) preservado; muda apenas a forma e o nome acessível ("Ativar tema …").
- **Ausência de links no cabeçalho da calculadora (invariante implícito da feature 009):** revogada deliberadamente. O cabeçalho da calculadora passa a ter exatamente um link — o comando de início. A intenção original (a logo não é link) permanece verdadeira e é reafirmada no teste.
