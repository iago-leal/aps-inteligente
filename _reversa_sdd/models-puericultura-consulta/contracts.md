# `models/puericultura/consulta` — Contrato emitido

> Reversa Writer, re-extração nº 4 (2026-07-28).
> **Segundo dos dois contratos que a plataforma emite** e que nenhum artefato da extração
> anterior cobria; o outro é o BR Code de `models/contribuicao`.
> Contrato de origem: `_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md`.

## Por que este contrato existe

A plataforma inteira consome contratos externos — as tabelas da OMS, as equações do
INTERGROWTH-21st, os rótulos da caderneta. Esta feature inverte a direção: o registro em SOAP
**sai** do produto e vai colado num prontuário eletrônico de terceiro, fora do nosso alcance.
Uma vez colado, ele passa a ser texto de um documento clínico com valor legal, e a plataforma
não tem canal de retorno para saber se a forma chegou íntegra. 🟢

O que o torna contrato, e não formatação: a forma é a interface. Mudança silenciosa de layout
quebra o hábito de leitura de quem confere o registro contra a caderneta, e quebra a
possibilidade de conferir o que foi colado ontem contra o que se cola hoje.

## Quem emite

| Camada | Papel |
|--------|-------|
| `models/puericultura/consulta` | Produz `RegistroDaConsulta` — **estrutura**, com seções, itens, notas e referências. |
| `interface/puericultura/consulta/formatar-registro.ts` | Projeta a estrutura em texto simples. Função pura, com **dois consumidores**. |
| `interface/puericultura/consulta/registro.tsx` | Exibe o texto. |
| `interface/puericultura/consulta` (comando de cópia) | Entrega o mesmo texto à área de transferência. |

A separação não é decorativa: a identidade entre o que se vê e o que se copia é propriedade da
construção — uma função, uma variável, dois consumidores —, e não coincidência a verificar por
teste. 🟢

## Forma do texto emitido

Blocos separados por linha em branco dupla, nesta ordem:

```
<Título da ficha> — idade cronológica: <idade em prosa>

S
- <rótulo>: <valor>
- <rótulo>: <valor>

O
- Peso para a idade: escore z +1,2, Peso adequado para idade
- <rótulo>: <valor>

A
- Crescimento: Eutrofia (IMC para a idade)

P
- <rótulo>: <valor>

<nota de organização em SOAP>

<nota de fichas ausentes>

<nota de supressão de campo, quando houver>

Fonte: <edição da caderneta>: <localizações separadas por ponto e vírgula>.
```

### Regras da forma

| # | Regra | Confiança |
|---|-------|-----------|
| 1 | O cabeçalho de cada seção é **a letra sozinha** — `S`, `O`, `A`, `P` —, e a ordem vem do domínio, não da projeção. | 🟢 |
| 2 | Cada item é uma linha começada por `- `, com rótulo e valor separados por dois-pontos. | 🟢 |
| 3 | A primeira linha nomeia a ficha e declara a idade, com a espécie dita por extenso. | 🟢 |
| 4 | **Registro sem nenhuma seção projeta em cadeia vazia.** Entregar cabeçalhos vazios seria pior que entregar nada: afirmaria averiguação que não houve. | 🟢 |
| 5 | Os blocos se separam por linha em branco dupla, inclusive entre as notas. | 🟢 |
| 6 | Escore z sai com uma casa decimal e sinal explícito, com o menos tipográfico `−`. | 🟢 |
| 7 | As notas fecham o texto, e a linha da fonte fecha as notas. | 🟢 |
| 8 | A linha da fonte traz a edição da caderneta seguida das localizações, separadas por ponto e vírgula, e termina em ponto. | 🟢 |

## Compatibilidade

O texto é ASCII-compatível apenas em parte: o travessão `—`, o menos tipográfico `−` e as aspas
curvas das notas são caracteres não-ASCII, e os prontuários que os recebem precisam aceitar
UTF-8. A decisão foi deliberada, porque a norma de redação do produto (ADR 0019) governa
também o que sai dele. 🟡 Nenhum campo de prontuário conhecido foi testado quanto a isso.

## Como se verifica

| Verificação | Onde |
|-------------|------|
| Estrutura do texto, bloco a bloco | `tests/integration/interface/consulta-puericultura.test.tsx` |
| Identidade entre o exibido e o copiado | Mesmo teste; a função tem retorno único |
| Registro vazio projeta em vazio | Mesmo teste |
| Permanência das notas citadas | `tests/unit/textos/` |

## Riscos

- 🟡 **Não há canal de erro.** Se a forma quebrar, quem descobre é quem cola, e nós não
  ficamos sabendo. É a mesma assimetria do BR Code, e por isso os dois contratos emitidos são
  tratados como contratos e não como detalhe de apresentação.
- 🟡 **A colagem é a única saída.** Não há exportação em arquivo, impressão nem integração. O
  texto some ao recarregar a página, e a nota `NOTA_NADA_E_SALVO` avisa disso na tela.
- 🟢 A forma não depende de fonte, tema nem largura de tela: é texto simples, e a projeção
  ocorre antes de qualquer estilo.
