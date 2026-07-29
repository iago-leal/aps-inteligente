# ADR 0021 — A `Moldura` é dona do enquadramento horizontal, e cada prop governa uma preocupação

> Retroativo, reconstruído pelo Reversa Detective (2026-07-28, re-extração nº 4) a partir das features 015, 016 e 021, dos adendos correspondentes e da ficha `MD-0029`. Confiança: 🟢

## Contexto

A `Moldura` embala home e telas desde a feature 004, mas o enquadramento nunca foi propriedade dela. A coluna centrada do corpo existia como **coincidência de nome de classe**: as cinco primeiras telas reusavam `.calc-regioes` e herdavam a largura por tabela. O alinhamento do cabeçalho estava partido entre duas folhas, e a altura divergia entre home e calculadoras (200,5px contra 209,0px) porque a home fundia logo e `h1` em dois blocos, enquanto a calculadora empilhava três.

Duas coisas expuseram o arranjo. A prop `logoComoTitulo` governava **duas preocupações ortogonais** ao mesmo tempo, a saber, se a logo era o `h1` e se o comando de início aparecia. E a sexta tela, a ficha de consulta, precisou de arranjo interno próprio, escreveu classe própria e não herdou nada: nasceu com o corpo colado nas bordas da janela, sob um cabeçalho que respeitava a coluna. Pior, **a guarda geométrica que existia desde a feature 013 exatamente para esse defeito media uma rota fixa**, e a rota nova nasceu fora do alcance dela.

## Decisão

A `Moldura` passa a ser **dona do enquadramento horizontal de toda tela**, e o contrato de props passa a ter **uma responsabilidade por prop**.

- **A coluna do corpo mora no `<main>` da `Moldura`**, governada pelo atributo `data-apresentacao` que o componente já emitia: 1.180px na variante `padrao` e 720px na `destaque`, com recuo de 32px que cai para 16px nos respectivos pontos de quebra. Sobe para lá **só o eixo horizontal**; o vertical permanece na folha de cada tela, porque varia com legitimidade.
- **O corolário é obrigação:** quem declarava a coluna deixa de declará-la, sob pena de coluna aninhada. Tela nova nasce enquadrada por construção.
- **`logoComoTitulo` foi removida**, e a presença do comando de início passou à prop dedicada **`comInicio`** (default `false`). A identidade ficou unificada: a logo é **sempre** marca decorativa (`aria-hidden`, `alt=""`) acima de um `h1` **sempre textual**, em toda tela, com o nome acessível preservado.
- **O alinhamento vertical do cabeçalho é regra única** (`flex-start`), válida para as duas variantes, e a altura passou a ser igual em todas as rotas **por construção**, sem `min-height` nem px chumbado.
- **A guarda geométrica deixou de medir rota nomeada** e passou a percorrer as rotas que o catálogo declarar, mais a home. Calculadora nova cai sob a guarda ao entrar no catálogo.

Não é preferência estética. A coluna é a referência contra a qual o cabeçalho foi calibrado na feature 013, e tela cujo corpo saia dela **desalinha o próprio cabeçalho**.

## Alternativas consideradas

- **Repetir a regra na folha da tela nova**: descartada porque é a raiz do defeito, e não a sua correção. A sétima tela teria o mesmo problema, e nada impediria a oitava.
- **Classe utilitária compartilhada** (`.coluna-do-corpo`, aplicada em cada tela): descartada porque continua exigindo que cada tela se lembre de aplicá-la, o que é a mesma disciplina de antes, com nome melhor.
- **Classe nova no JSX da `Moldura`**: descartada por desnecessária. O seletor `.pagina[data-apresentacao="…"] > main` alcança o `<main>` pelo atributo que o componente já emitia, e o `.tsx` não precisou mudar.
- **Manter `logoComoTitulo` e derivar o comando de início da sua negação**: descartada porque foi assim que a home ficou sem poder ter `h1` textual sem ganhar um ⌂ redundante. Uma prop, uma preocupação.
- **Fixar a altura do cabeçalho por `min-height`**: descartada porque igualaria o sintoma e deixaria a divergência estrutural viva por baixo.

## Consequências

- Nasce `moldura.css`, **sede única da coluna** nas duas variantes de apresentação, e `globais.css` **encolhe** ao ceder as três propriedades horizontais; a regra nova nasceu em folha própria justamente para não reabrir a dívida daquela folha.
- O contrato de componente da `Moldura` mudou, o que obrigou as calculadoras a declarar `comInicio` e a home a exibir o texto "APS Inteligente" no `h1`.
- A tipografia de hero da feature 008 foi aposentada, e a variante `destaque` ficou reduzida à coluna e à borda.
- A extração carregava a dívida **L-07** por descrever a `Moldura` governada por uma prop que ela não tem mais; esta passagem a encerra.
- A lição de método vale mais que a correção: **guarda de regressão presa a uma rota nomeada falha em regredir**. A guarda passou a ler o catálogo, e é isso que os watch items W002, W003 e W007 da feature 021 vigiam.

## Status

Ativa. Reavaliar se surgir tela que precise legitimamente de largura fora das duas variantes, caso em que a variante nova se declara na `Moldura`, e não na folha da tela.
