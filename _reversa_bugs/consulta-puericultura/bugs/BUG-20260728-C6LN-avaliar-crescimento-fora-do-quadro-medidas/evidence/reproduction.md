# Cápsula de reprodução — BUG-20260728-C6LN

> Registrada em 2026-08-09. Reprodução em ambiente de teste, não em produção: o defeito é de
> composição estática e não depende de rede, dado ou sessão.

## Ambiente

| Eixo | Valor |
|---|---|
| Commit base | `c3db432` |
| Branch | `main` |
| Sistema | macOS 26.5.2, arm64 |
| Runtime | Node v24.18.1 |
| Executor | vitest 4.1.10, ambiente `jsdom` |

## O que se executou

Um teste isolado, montado sob o mesmo molde de
`tests/integration/interface/consulta-puericultura.test.tsx`: renderiza `AppConsulta`,
identifica sexo e as duas datas de modo que a ficha seja sugerida, localiza o comando por papel
e nome acessível, e pergunta em que `fieldset` ele está.

O arquivo viveu em `tests/integration/interface/__repro-c6ln.test.tsx` só durante a execução e
foi removido em seguida; o teste que fica no repositório é o de Gate 1, redigido depois.

```
npx vitest run tests/integration/interface/__repro-c6ln.test.tsx
```

Asserções da reprodução:

```ts
const comando = screen.getByRole("button", { name: /avaliar crescimento/i });
const quadroDoComando = comando.closest("fieldset");
const medidas = screen.getByRole("group", { name: /^1\. Medidas$/ });

expect(quadroDoComando).not.toBeNull();
expect(medidas.contains(comando)).toBe(true);
```

## Resultado

Exit code **1**, uma asserção reprovada na primeira linha, que é onde o defeito aparece:

```
AssertionError: expected null not to be null
 ❯ tests/integration/interface/__repro-c6ln.test.tsx:35:33
```

O diagnóstico impresso junto localiza o comando com precisão:

```
[repro] fieldset do comando: NENHUM
[repro] pai do comando: consulta-regioes DIV
[repro] medidas contém o comando? false
```

O comando não está fora do quadro certo: está fora de **qualquer** quadro. Pende direto do
`div.consulta-regioes`, irmão da `<section class="consulta-ficha">` que abriga os dez
`fieldset`, e depois dela na ordem do documento — que é exatamente o que o print de 28/07
mostra.

## Taxa e determinismo

**1 tentativa, 1 falha.** `reproduction.classification: deterministic` se confirma: a posição
vem da ordem do JSX em `app.tsx`, sem condicional, estado ou corrida. Nenhum gatilho suspeito
a registrar.

## Apuração acessória, feita na mesma passada

O `bug.md` afirmava, por leitura de código, que as dez fichas têm a seção 1 com o título
"Medidas". A afirmação se confirma, e uma segunda, mais forte, também: **cada ficha tem
exatamente uma seção com campos do tipo `medida`, e é sempre a de número 1**. A varredura de
`models/puericultura/consulta/fichas/*.ts` conta três campos de medida nas oito primeiras
fichas e quatro nas duas últimas, onde o IMC se soma a PC, peso e estatura.

| Ficha | Seções com campo `medida` |
|---|---|
| `primeira-semana.ts` | 1. Medidas (3) |
| `primeiro-mes.ts` | 1. Medidas (3) |
| `segundo-mes.ts` | 1. Medidas (3) |
| `quarto-mes.ts` | 1. Medidas (3) |
| `sexto-mes.ts` | 1. Medidas (3) |
| `nono-mes.ts` | 1. Medidas (3) |
| `decimo-segundo-mes.ts` | 1. Medidas (3) |
| `decimo-oitavo-mes.ts` | 1. Medidas (3) |
| `vigesimo-quarto-mes.ts` | 1. Medidas (4) |
| `trigesimo-sexto-mes.ts` | 1. Medidas (4) |

A consequência importa para o desenho da correção: o predicado "a seção que contém campos de
medida" **seleciona uma seção, e sempre a mesma**, em todas as dez fichas. Não há ficha sem
medidas nem ficha com medidas espalhadas, de modo que a regra pode ser escrita por predicado
em vez de por título, sem caso especial e sem ambiguidade.
