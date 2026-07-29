# ADR 0017 — Uma fonte por unit não é uma fachada por unit

> Retroativo, reconstruído pelo Reversa Detective (2026-07-28, re-extração nº 4) a partir da feature 020 (`020-consulta-puericultura-soap`) e do adendo 020. Confiança: 🟢

## Contexto

O ADR 0011 fixou que cada unit de domínio tem **uma fonte clínica única**, sem mescla entre guias. Como até a feature 019 cada unit tinha também uma única fachada, a extração passou a ler as duas coisas como se fossem uma, e "uma fonte por unit" virou, na prática, "uma calculadora por unit".

A feature 020 desfez a coincidência. A ficha de consulta de puericultura vem das páginas 66 a 75 da *Caderneta da Criança*, a **mesma edição, a mesma caderneta** que a feature 017 já usava nas páginas 85 a 97 para os escores de crescimento. São seções distintas do mesmo impresso, e o registro da consulta precisa transpor o escore que o outro motor produziu.

## Decisão

`models/puericultura` passa a ter **duas fachadas**: `CalculadoraCrescimentoInfantil.avaliar`, da feature 017, e `RegistroDeConsultaPuericultura.montar`, no submódulo `consulta/`. O ADR 0011 **permanece intacto**, porque ele fala de fonte, e a fonte continua sendo uma só.

Três regras acompanham a decisão e a tornam verificável:

1. **A segunda fachada não recalcula nada da primeira.** O `ResultadoAvaliacao` chega pronto e é **transposto**, com a referência que o outro motor já carimbou. Recalcular criaria uma segunda fonte de escore z dentro da mesma unit, que é exatamente o que o ADR 0011 existe para impedir.
2. **A direção das dependências não se fura por economia.** O submódulo declara o próprio nome neutro dos índices em vez de importá-lo da tela da 017, porque `models/` não importa `interface/`.
3. **A matriz de rastreabilidade passa a modelar duas fachadas sob uma unit**, arranjo que não existia na plataforma.

## Alternativas consideradas

- **Sexta unit de domínio** (`models/consulta-puericultura`): descartada por duas razões. Precisaria importar de outra unit para transpor o escore, sem precedente na família, ou carregar uma **terceira cópia** da aritmética de datas, quando a segunda já é dívida de convergência declarada. E a fonte seria a mesma caderneta, criando duas units com fonte idêntica, o que enfraquece o ADR 0011 muito mais do que duas fachadas o enfraquecem.
- **Ampliar a fachada existente** com um método a mais: descartada por coesão. Avaliar crescimento e montar registro de consulta respondem a perguntas diferentes, têm acervo próprio (14 módulos tabulares contra 10 fichas) e ciclos de revisão distintos.
- **Duplicar as fichas dentro da tela**, sem passar pelo domínio: descartada porque colocaria transcrição de fonte clínica na camada de apresentação, fora do alcance dos invariantes e do oráculo congelado.

## Consequências

- A leitura implícita de "uma fachada por unit" deixa de valer, e a extração passa a enunciar a distinção em vez de deduzi-la da coincidência.
- O produto da plataforma deixa de ser sempre um número: a segunda fachada emite **texto de registro**, com contrato de forma próprio, consumido fora da plataforma por colagem no prontuário.
- Os watch items **W010** (nenhuma segunda fonte de escore z na mesma unit) e **W007** (o texto exibido e o copiado saem do mesmo cálculo) da feature 020 guardam as duas pontas da decisão.
- Uma unit com duas fachadas pede que a matriz de rastreabilidade e os diagramas de componentes distingam unit de fachada, e não os tratem como sinônimos.

## Status

Ativa. Reavaliar se uma terceira fachada aparecer sob a mesma unit, ou se alguma fachada passar a precisar de fonte diferente, caso em que a separação em units volta a ser a resposta certa.
