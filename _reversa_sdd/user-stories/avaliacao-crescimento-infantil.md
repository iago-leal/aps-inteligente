# User Story — Avaliação do crescimento infantil

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `017-puericultura-crescimento`.
> Units: `models/puericultura`, `interface/puericultura`, `pages/`.

## História

**Como** médico de família e comunidade em consulta de puericultura,
**quero** obter os escores z dos quatro índices antropométricos e a classificação nutricional
que a Caderneta da Criança imprime,
**para** conferir o crescimento da criança sem depender do gráfico impresso, e com a mesma
redação que a caderneta usa.

## Contexto de uso

A consulta de puericultura ocorre com a caderneta na mão. O gráfico impresso é preciso, mas ler
o ponto exato entre duas linhas de escore consome tempo e admite erro de leitura, sobretudo nos
extremos. A calculadora não substitui a caderneta: ela devolve o número que o gráfico
representa, com o rótulo que a própria fonte atribui àquela faixa.

O caso que mais motiva a ferramenta é o **nascido pré-termo**. Ali, a leitura correta exige
distinguir três idades, escolher entre duas réguas e saber até quando corrigir — três decisões
que o gráfico impresso não toma por quem consulta.

## Fluxo principal

1. O prescritor informa sexo, data de nascimento e data da medição.
2. Informa as medidas que tiver: peso, comprimento ou estatura com a posição em que foi aferida,
   e perímetro cefálico.
3. Informa a idade gestacional ao nascer, se souber.
4. Aciona a avaliação.
5. A tela mostra, para cada um dos quatro índices, o escore com uma casa decimal, o rótulo da
   caderneta, a régua usada, a idade que indexou a curva e a página da fonte.
6. Lê as notas: o que foi suposto, o que foi convertido e o que a medição isolada não diz.

## Fluxos alternativos

- **Sem idade gestacional.** A criança é tratada como nascida a termo, e a tela **diz isso**,
  com a observação de que a classificação pode mudar se ela tiver nascido pré-termo.
- **Medida faltando.** O índice correspondente aparece como não avaliado, e os demais seguem.
  Ausência não é erro.
- **Perímetro cefálico acima de dois anos.** Aquele índice sai de escopo com o motivo dito, e os
  outros três permanecem válidos.
- **Idade acima da cobertura da fonte.** Nenhum escore é exibido, e a tela explica o limite em
  vez de estimar.
- **Posição de medida diferente da esperada para a idade.** A conversão de 0,7 cm é aplicada e
  **declarada**, nos dois índices que dependem da medida convertida.

## Critérios de aceitação

```gherkin
Dado uma criança de 1 ano, sexo masculino, com peso e comprimento informados
Quando o prescritor avalia
Então cada índice traz escore, rótulo, régua, idade usada e página da caderneta

Dado uma criança nascida com 30 semanas, hoje com 34 semanas pós-menstruais
Quando o prescritor avalia
Então a régua é o INTERGROWTH-21st, e o IMC aparece como inexistente nessas curvas

Dado que a idade gestacional não foi informada
Então o resultado declara a premissa de termo, e diz o que muda se ela estiver errada
```

## Valor entregue

O prescritor deixa de precisar interpolar visualmente entre linhas do gráfico, e passa a ter,
por escrito, a régua e a idade que produziram o número — o que torna o resultado conferível por
outra pessoa, dias depois, com a caderneta na mão.

## O que a história **não** cobre

- Tendência entre medições sucessivas, que é como a caderneta ensina a avaliar o crescimento. A
  ferramenta trata de uma medição isolada, e o diz em toda saída.
- Conduta. O motor informa; não sugere encaminhamento nem intervenção (ADR 0005).
- Registro. Nada é salvo, e nada é enviado.
