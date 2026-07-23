# Investigation: Refatoração do cabeçalho

> Feature: `011-refatora-cabecalho` · Data: `2026-07-23`

## Pergunta de fundo

Como trocar o alternador de tema textual por um controle icônico e adicionar um retorno à home, sem regredir acessibilidade, sem introduzir dependência nova e sem tocar o domínio?

## Achados no código atual

- `interface/comum/moldura.tsx` concentra o cabeçalho inteiro (identidade + ações). O tema é lido via `useSyncExternalStore(assinarTema, lerTema, lerTemaNoServidor)` de `interface/calculadora/preferencia-de-tema`, e alternado por `gravarTema`. Esse mecanismo **não muda**.
- O alternador atual é um `Button` do `@primer/react` cujo texto já segue a lógica de "tema-alvo" ("Tema escuro" quando claro). A feature apenas troca texto por ícone + `aria-label`, preservando a semântica.
- `logoComoTitulo` já distingue a home (única a passá-lo) das calculadoras — sinal reaproveitado para condicionar o comando de início (D-04).
- `@primer/react@38.33.0` oferece `IconButton` (botão acessível somente-ícone, exige `aria-label`); `@primer/octicons-react@19.29.2` oferece `SunIcon`, `MoonIcon`, `HomeIcon`. Ambos já são dependências do projeto — custo de bundle desprezível e tree-shakeable.

## Alternativas avaliadas

| Alternativa | Veredito |
|-------------|----------|
| `IconButton` do Primer para os dois controles | **Escolhida** — dentro do vocabulário Primer, acessível por construção, testável por `role` |
| `Button` com ícone e texto `sr-only` manual | Descartada — reimplementa o que o `IconButton` já entrega |
| Comando de início via `Button` + `useRouter().push('/')` | Descartada — não é anchor; pior a11y/SEO, não capturável por `role="link"` |
| Tornar a logo clicável (link para `/`) | Descartada — contraria D-04 da feature 009 (logo é marca decorativa, não navegável); o usuário pediu botão explícito |
| Prop nova `mostrarInicio` | Descartada por ora — `logoComoTitulo` já é discriminante suficiente (premissa §4 do roadmap) |

## Padrões aplicáveis

- **Ícone decorativo + nome acessível textual**: mesmo padrão da feature 008 (`IconeDaSecao`, `aria-hidden` no glifo, texto como nome acessível). Aqui o nome vem do `aria-label` do `IconButton`.
- **Delta só de apresentação**: mesma disciplina das features 008/009 — `git diff models/` vazio, contrato `/api/v1/status` byte a byte, asserções antigas preservadas salvo as que a feature legitimamente revoga (D-06).

## Convenção do toggle (resolvida)

Tema-alvo: tema **escuro** vigente → `SunIcon` + "Ativar tema claro"; tema **claro** vigente → `MoonIcon` + "Ativar tema escuro". Coincide com a lógica de rótulo já existente, reduzindo a mudança a forma, não a comportamento.
