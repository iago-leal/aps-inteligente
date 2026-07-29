# Cápsula de reprodução — BUG-20260728-ZAHV

> Gravada em 2026-07-28 pelo `/reversa-debugger-fix`, etapa 2 (reprodução).
> A reprodução correu **fora da suíte do projeto**: o arquivo de teste e a configuração do
> vitest ficaram no diretório temporário da sessão, de modo que nenhum arquivo de `tests/`
> foi criado, tocado ou removido antes do Gate 1.

## Ambiente

| Eixo | Valor |
|---|---|
| Commit base | `3642ba6` (`main`, árvore limpa exceto `.harness/estado-da-sessao.md`) |
| Branch | `main` |
| OS | macOS 26.5.2 (darwin-arm64) |
| Runtime | Node v26.1.0 |
| Runner | vitest 4.1.10 |
| Alvo | `formatarRegistro` sobre `montarRegistro`, sem navegador e sem React |

## Comando executado

```bash
npx vitest run --config <scratchpad>/repro.config.mjs
```

O `repro.config.mjs` reproduz apenas os dois aliases de `vitest.config.ts` (`models`,
`interface`) e aponta o `include` para o arquivo de reprodução no diretório temporário.

## Caso reproduzido

O do print de 28/07, reconstruído no domínio real e não em ficha sintética — a ficha
`PRIMEIRA_SEMANA` do acervo, sexo masculino, nascimento em 2026-07-22, consulta em
2026-07-28, e **um único campo preenchido**: `parou-amamentar` = `não`.

## Exit code e taxa

| Eixo | Valor |
|---|---|
| Tentativas | 2 execuções completas |
| Falhas do comportamento esperado | 2/2 |
| Taxa | 1/1 por execução; a asserção negativa reprova sempre |
| Classificação | `deterministic` |
| Exit code | 1 (a asserção de ausência da proveniência falha, como previsto) |

O determinismo é de construção, não de observação: as duas primeiras notas entram
incondicionalmente em `notasDe` (`registro.ts:210-213`) e `parteDaFonte` é somada à cadeia
sempre que existe ao menos uma seção (`formatar-registro.ts:37,46`). Não há condição de
ambiente, de relógio ou de ordem que possa suprimi-las.

## Cadeia observada

```text
Consulta da 1ª Semana — idade cronológica: 6 dias

S
- Parou de amamentar?: Não

A matéria desta ficha vem da Caderneta da Criança; a organização do texto em subjetivo,
objetivo, avaliação e plano é do produto. A fonte imprime os itens em seções numeradas e não
menciona o registro clínico orientado por problemas. Cada campo foi atribuído a uma das quatro
seções por decisão editorial, e nenhum campo aparece em duas.

Esta tela cobre as dez consultas datadas, da 1.ª Semana ao 36.º Mês. Três registros das mesmas
páginas ficaram fora desta entrega e serão acrescentados depois: Pré-Natal, Parto, Nascimento,
Internação Neonatal e Alta (p. 67), Triagens Neonatais (p. 68) e Outras Medidas e Consultas
Necessárias (p. 75), esta com a tabela de aferição da pressão arterial. Quem confere a tela
contra a caderneta precisa saber que ela não cobre as páginas verdes inteiras.

Fonte: Caderneta da Criança (Ministério da Saúde, 2.ª ed., Brasília, 2020): pp. 66–75,
Acompanhamento da Criança e Consultas Recomendadas: as dez consultas datadas, da 1.ª Semana ao
36.º Mês; p. 68, Consulta da 1ª Semana.
```

A nota de supressão de campo não aparece porque a ficha aberta é a masculina e o campo
suprimido é o da ficha feminina — a terceira nota é condicional e não faz falta à reprodução.

## Medida da desproporção

O registro do bug afirmava "mais de quatro quintos", por leitura do print. Medido:

| Parte | Caracteres | Fração |
|---|---:|---:|
| Registro clínico (cabeçalho + seção S) | 80 | 7% |
| Proveniência (duas notas + linha da fonte) | 1 015 | **93%** |
| Total da cadeia | 1 095 | 100% |

O número corrige para pior a estimativa do registro, e é o que sustenta a razão de proporção
de `MD-0035`: um formato em que o aviso sobre o produto é treze vezes maior que o registro do
paciente inverte a hierarquia daquilo que a tela existe para produzir.

## Saída da asserção que falha

```text
AssertionError: expected 'Consulta da 1ª Semana — idade cronoló…' not to match /^Fonte: /m
  ❯ repro.test.ts:51:23
```
