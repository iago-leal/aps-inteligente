# Regression Watch: Refatoração do cabeçalho

> Feature: `011-refatora-cabecalho` · Data: `2026-07-23`

Itens que precisam continuar verdadeiros nas próximas extrações `/reversa`. Só regras 🟢 alteradas entram no watch principal; observações 🟡/🔴 vão à seção sem peso.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|------------------------------|---------------------|-------------------|
| W001 | `interface/comum/moldura.tsx` (alternador de tema) | O alternador de tema é um controle icônico (sol/lua pelo tema-alvo) com nome acessível "Ativar tema claro"/"Ativar tema escuro"; sem rótulo textual "Tema claro"/"Tema escuro" | redação | Voltar a existir texto "Tema claro"/"Tema escuro" no cabeçalho, ou o controle perder o nome acessível |
| W002 | `interface/comum/moldura.tsx` (comando de início) | O cabeçalho das calculadoras (`logoComoTitulo` falso) tem um comando de início — link `href="/"`, ícone casa, rótulo "Início"; a home (`logoComoTitulo` verdadeiro) não o exibe | presença | Ausência do link "Início" na calculadora, ou sua presença na home |
| W003 | `interface/comum/moldura.tsx` (logo × link) | No cabeçalho da calculadora, a logo segue não-link; o comando de início é o único `<a>` | presença | A logo virar link, ou surgir link adicional não previsto no cabeçalho |
| W004 | `interface/comum/moldura.tsx` (selo de privacidade) | O selo "Nada é salvo nem enviado" permanece visível no cabeçalho de todas as telas | presença | Selo ausente ou encoberto após a refatoração |
| W005 | `interface/comum/moldura.tsx` + `preferencia-de-tema` | A alternância e a persistência do tema (`data-tema` = `"claro"`/`"escuro"`) são idênticas ao comportamento anterior | presença | `data-tema` não alternar ao acionar o controle, ou a preferência não persistir |

## Observações (sem peso de regressão)

- **O-11-01 (infra de teste):** o polyfill `tests/apoio/setup-jsdom.ts` (registrado em `vitest.config.ts#setupFiles`) existe apenas para o `TooltipV2` do `IconButton` funcionar no jsdom. Se o Primer deixar de usar o popover-polyfill, o polyfill vira dispensável (não é regra de negócio).
- **O-11-02 (acessibilidade):** a baseline axe permaneceu 0/0 nas telas; os controles icônicos dependem do `aria-label` para o nome acessível. Vigiar em futuras mudanças que troquem `IconButton` por elemento sem rótulo.
- **O-11-03 (teto de 400 linhas):** `e2e/cabecalho.spec.ts` nasceu da extração dos cenários de `plataforma.spec.ts` (que voltou a 392 linhas). Sem dívida aberta.
- **O-11-04 (premissa de discriminação):** o comando de início usa `logoComoTitulo` como sinal home×calculadora. Se surgir tela sem logo que também deva ocultar o início, extrair prop dedicada (roadmap §4).

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso quando /reversa rodar de novo. -->

## Arquivadas

<!-- Vazio. -->
