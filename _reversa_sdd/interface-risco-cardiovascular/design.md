# interface/risco-cardiovascular — Design

> `design.md` · Foca no COMO. Re-extração 3 (2026-07-23), feature `014-risco-cardiovascular-pce`.
> Molde do `AppCardiologia`; sem ritual de revisão (ADR 0012, D-08); privacidade por construção (ADR 0002).

## Componentes

| Arquivo | Papel |
|---|---|
| `tela.tsx` | `TelaRiscoCardiovascular` — composição fina: `Moldura` (título/subtítulo) + `AppRiscoCardiovascular` |
| `app.tsx` | Contêiner com `EstadoRiscoCardiovascular`, ciclo estimar/invalidar/nova estimativa; motor e relator injetáveis |
| `formulario.tsx` | `FormularioRiscoCardiovascular` — formulário controlado, validação no blur espelhando `FAIXAS` do domínio |
| `resultado.tsx` | `PainelRiscoCardiovascular` — risco %, categoria com `Label`, avisos de clamp; estados vazio/sucesso/fora-do-escopo/erro/falha |
| `proveniencia.tsx` | `NotaDeProveniencia` (Flash warning) + `ContextoDaFonte` (seção consultável PCE × PREVENT) |

## Máquina de estados (`EstadoRiscoCardiovascular`)

`vazio → sucesso | fora-do-escopo | erro | falha-inesperada`, com a flag ortogonal `desatualizado` (qualquer edição invalida o resultado vigente) e `geracaoFormulario` (reinício por `key`). Molde idêntico ao `EstadoCardiologia`, com a variante `fora-do-escopo` disparada por dois motivos (idade fora de 40–79 ou DCV prévia). Detalhe em `state-machines.md` §4.

`estadoDaSaida(saida)` mapeia o discriminante `tipo` do domínio ao estado da UI: `resultado`→sucesso, `fora-do-escopo`→fora-do-escopo, `erro-validacao`→erro.

## Fluxo de interação (`app.tsx`)

1. `aoEstimar(entrada)` → `motorReal.estimar(entrada)`; em exceção, reporta evento anônimo (só nome da classe) e vai a `falha-inesperada` (EC-07). Zera `desatualizado`. 🟢
2. `aoAlterar()` → se há resultado, marca `desatualizado`. 🟢
3. `aoNovaEstimativa()` → volta a `vazio`, incrementa `geracaoFormulario` (remonta o formulário). 🟢
4. Layout `.calc-regioes`: formulário, painel, `ContextoDaFonte`. 🟢

## Proveniência (`proveniencia.tsx`)

- `NotaDeProveniencia` — `Flash variant="warning"` com `NOTA_PROVENIENCIA` importada do domínio (texto único congelado, anti-drift). 🟢
- `ContextoDaFonte` — seção `aria-labelledby` "Por que Pooled Cohort Equations, e não a AHA PREVENT?", material consultável **fora do painel de resultado**, sem emitir conduta (ADR 0005). Link `<a>` nativo à PREVENT (`professional.heart.org`) — navegação do usuário, não requisição de rede (ADR 0002). 🟢

## Decisões de projeto

- 🟢 **Sem ritual de revisão nem "Copiar plano"** (D-08): estimar risco não prescreve dose — diferença deliberada face à insulina.
- 🟢 **Molde do `AppCardiologia`**: reusa `relator-de-erros.ts` de `interface/calculadora/` (acoplamento residual declarado, comum às telas).
- 🟢 **Contexto metodológico fora do resultado** (D-10): a explicação PCE×PREVENT é material consultável, não conduta.

## Acoplamentos

- `interface/risco-cardiovascular` → `models/risco-cardiovascular` (fachada, tipos), `interface/comum` (Moldura), `interface/calculadora` (relator-de-erros, tema). 🟡 (o último é o acoplamento residual já declarado na Moldura.)
