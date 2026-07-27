# Contrato: aquisição das tabelas de referência da OMS

> Identificador: `017-puericultura-crescimento`
> Tipo: **arquivo** (dev-time). Não é contrato de rede: nada disto roda em produção.
> Data da verificação das URLs: `2026-07-26`

## 1. Por que este contrato existe

Nenhum outro artefato da feature tem consequência clínica maior. Se a curva errada entrar sob o
rótulo certo, a ferramenta produzirá um número plausível, bem formatado, rastreável e **falso**,
sem que nada no sistema acuse o erro. O contrato existe para que a conferência do dado seja um
procedimento, não um cuidado.

Vale, portanto, uma regra única acima de todas as outras: **a verificação é do conteúdo, jamais
do nome do arquivo.** A própria OMS publica o arquivo de peso-para-idade de 5 a 10 anos com o
prefixo `hfa-` (o do indicador de estatura) e um sufixo GUID; quem confia no nome embarca peso
onde deveria haver estatura, ou o contrário.

## 2. Origens verificadas

Todas as URLs abaixo foram requisitadas em 2026-07-26 e responderam `200`. Elas não pertencem a
uma API estável: são arquivos de um sítio institucional, sujeitos a mudança de caminho. Por isso
o dado é **versionado no repositório** (MD-0001) e estas URLs valem como procedência, não como
dependência.

Prefixo comum: `https://cdn.who.int/media/docs/default-source/child-growth`

### 2.1 Padrões WHO 2006 — 0 a 5 anos, índice por dia

| Índice | Caminho (sufixo do prefixo comum) |
|---|---|
| Peso-para-idade | `/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-{boys,girls}-zscore-expanded-tables.xlsx` |
| Comprimento/estatura-para-idade | `/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-{boys,girls}-zscore-expanded-tables.xlsx` |
| IMC-para-idade | `/child-growth-standards/indicators/body-mass-index-for-age/expanded-tables/bfa-{boys,girls}-zscore-expanded-tables.xlsx` |
| Perímetro cefálico-para-idade | `/child-growth-standards/indicators/head-circumference-for-age/expanded-tables/hcfa-{boys,girls}-zscore-expanded-tables.xlsx` |

Atenção ao segmento do caminho: comprimento/estatura usa `expandable-tables`; os outros três
usam `expanded-tables`. A inconsistência é da OMS.

### 2.2 Referência WHO 2007 — 5 a 10 anos, índice por mês

| Índice | Caminho |
|---|---|
| Peso-para-idade | `/growth-reference-5-19-years/weight-for-age-(5-10-years)/hfa-boys-z-who-2007-exp_0ff9c43c-8cc0-4c23-9fc6-81290675e08b.xlsx` e `…/hfa-girls-z-who-2007-exp_7ea58763-36a2-436d-bef0-7fcfbadd2820.xlsx` |
| Estatura-para-idade | `/growth-reference-5-19-years/height-for-age-(5-19-years)/hfa-{boys,girls}-z-who-2007-exp.xlsx` |
| IMC-para-idade | `/growth-reference-5-19-years/bmi-for-age-(5-19-years)/bmi-{boys,girls}-z-who-2007-exp.xlsx` |

O primeiro é o arquivo mal nomeado. Confirmado por conteúdo: a aba se chama
`wfa_boys_z_WHO 2007_exp` (respectivamente `wfa_girls_…`) e o valor mediano em 61 meses é
18,5057 kg para o menino e 18,2579 kg para a menina — peso, não estatura.

## 3. Formato de entrada

Pasta de trabalho única (`.xlsx`, uma aba por arquivo), com cabeçalho na linha 1 e dados a
partir da linha 2. Colunas presentes em todos os arquivos:

```
<índice> | L | M | S | SD4neg | SD3neg | SD2neg | SD1neg | SD0 | SD1 | SD2 | SD3 | SD4
```

O `<índice>` chama-se `Day` nos padrões 2006 e `Month` na referência 2007. As colunas devem ser
localizadas **pelo nome no cabeçalho**, nunca pela posição: a ordem varia entre arquivos.

**Reconciliado em 2026-07-27, contra os 14 arquivos em disco.** Doze deles têm exatamente estas
13 colunas. Os **dois de estatura da referência 2007** (`hfa_{boys,girls}_z_WHO 2007_exp`) têm
**15**: `StDev` e `SD5neg` a mais, entre `S` e `SD4neg`. A divergência é da OMS e não afeta o
dado que interessa. O gerador passa, portanto, a exigir a **presença** das colunas de que
depende — o índice, `L`, `M`, `S` e `SD3neg` a `SD3` — e a tolerar apenas as quatro conhecidas
como opcionais (`StDev`, `SD5neg`, `SD4neg`, `SD4`); qualquer coluna fora dessas duas listas
continua sendo falha, que é a intenção original da verificação.

Extensão da faixa esperada:

| Recorte | Primeira | Última | Linhas de dados |
|---|---|---|---|
| 2006, por dia | `Day = 0` | `Day = 1856` | 1857 |
| 2007, por mês | `Month = 61` | `Month = 228` (IMC e estatura) ou `120` (peso) | 168 ou 60 |

## 4. Transformação obrigatória

1. **Recortar ao escopo da fonte** (D-04 do roadmap): perímetro cefálico até `Day = 730`; peso,
   comprimento/estatura e IMC até `Month = 120`. Linha fora do recorte não entra no repositório.
2. **Limpar o ruído de ponto flutuante:** o `.xlsx` guarda `18.505700000000001` onde a fonte
   publica `18,5057`. Arredondar à precisão publicada (quatro casas em `M`, quatro em `L`, cinco
   em `S`) e conferir que o arredondamento não altera o escore em nenhum caso-âncora.

   **Medido em 2026-07-27, e mais forte do que o exigido:** o arredondamento é **idêntico** nas
   12.964 linhas das 14 tabelas — `Number(v.toFixed(4)) === v` em toda parte. O
   `18.505700000000001` já *é* o número de ponto flutuante de `18,5057`; o ruído está na grafia
   decimal, não no valor. Logo a limpeza não altera escore algum, em nenhuma célula, e não
   apenas nos casos-âncora. A emissão serializa na grafia mínima que relê para o mesmo número e
   falha se o texto trouxer mais casas do que a fonte publica.
3. **Emitir arrays paralelos** `l`, `m`, `s`, com `inicio`, `fim` e `unidade`, no formato de
   `data-delta.md#3.1`.
4. **Registrar a procedência no cabeçalho de cada módulo gerado:** URL de origem, data do
   download, faixa e o `RF-NN` que o justifica (Princípio VI).

## 5. Verificações que o gerador deve fazer antes de escrever qualquer arquivo

O gerador **falha ruidosamente** — nunca escreve parcialmente, nunca avisa e segue — quando
qualquer item abaixo não se confirma:

| # | Verificação | Falha significa |
|---|---|---|
| V1 | O nome da aba contém o acrônimo do indicador esperado (`wfa`, `lhfa`/`hfa`, `bfa`/`bmi`, `hcfa`) e o sexo esperado | Arquivo trocado na origem |
| V2 | O cabeçalho traz exatamente as 13 colunas do §3, com o índice esperado (`Day` ou `Month`) | Formato mudou |
| V3 | A faixa do índice é contínua, sem buraco nem repetição, e cobre o recorte pedido | Download truncado |
| V4 | `M` está na ordem de grandeza do indicador: peso em kg (0,5 a 60), comprimento em cm (40 a 160), IMC (10 a 25), perímetro em cm (30 a 55) | Indicador trocado — é a barreira contra o arquivo mal nomeado do §2.2 |
| V5 | `M` é crescente em peso, comprimento/estatura e perímetro cefálico, **exceto nos dois degraus declarados abaixo**, cuja magnitude é vigiada | Colunas embaralhadas, ou fronteira revista na origem |
| V6 | Reconstruir os valores `SD3neg`…`SD3` a partir de `L`, `M`, `S` e conferir contra as colunas publicadas, com tolerância do arredondamento da própria planilha | LMS não corresponde aos desvios: dado corrompido |
| V7 | Valores-âncora conhecidos batem: perímetro cefálico masculino ao nascer `M = 34,4618`; peso masculino em `Month = 61` (tabela 2007) `M = 18,5057`; peso feminino em `Month = 61` `M = 18,2579` | Revisão silenciosa da tabela na origem |

A verificação V6 é a mais valiosa: ela usa o próprio arquivo como oráculo de si mesmo e captura,
de uma vez, erro de coluna, de arredondamento e de leitura. V7 cobre justamente o que V6 não
cobre — uma revisão **coerente** da tabela, com os desvios recalculados junto do `M`, passa
incólume pela reconstrução da LMS e para só na âncora. As duas foram exercitadas nessa ordem,
com sabotagem dirigida, em 2026-07-27.

**V6 para em ±3 de propósito, e agora se sabe por quê** (apurado em 2026-07-27, no
congelamento de T008). As colunas `SD4neg` e `SD4` **não** são LMS pura nos indicadores
baseados em peso: a própria OMS as publica já com a correção de cauda aplicada. No peso
masculino ao nascer, a LMS prevê 5,6945 kg em `z = 4` e a planilha traz 5,642, que é
exatamente `SD3 + (SD3 − SD2)`. Estender V6 a ±4 faria o gerador abortar em oito das catorze
tabelas, com dado íntegro. Quem for "melhorar" a verificação leia isto antes.

### 5.2 Os dois degraus de V5 (reconciliado em 2026-07-27)

A redação original de V5 pedia monotonia simples, e o dado a desmentiu em dois pontos — nenhum
deles por corrupção. Ambos são propriedade da fonte, e declará-los com um limite torna V5 mais
forte do que era: ela deixa de exigir o que a fonte não cumpre e passa a vigiar o que a fonte faz.

| Índice | Degrau medido | Limite tolerado | Por que existe |
|---|---|---|---|
| `Day = 1`, peso 2006 | −0,87% (menino), −1,13% (menina) | 2% | **Perda ponderal fisiológica do recém-nascido.** O peso mediano cai no primeiro dia e só recupera o valor de nascimento no terceiro (menino) ou no quarto (menina) |
| `Day = 731`, comprimento/estatura 2006 | −0,6715 cm (menino), −0,6709 cm (menina) | 1,5% | **Troca da régua aos dois anos:** a tabela mede comprimento deitado até 730 dias e estatura em pé de 731 em diante |

O segundo degrau é achado de valor clínico próprio: a magnitude medida na tabela da OMS é a
**própria constante de 0,7 cm** que a caderneta manda aplicar na conversão de posição (RF-08,
D-11), e ela cai no exato dia que D-16 fixou como fronteira dos dois anos. O dado tabular
confirma, por conta própria, duas decisões que o plano havia tomado por leitura da caderneta.

Um degrau declarado que **não** apareça também é falha: significaria que a fonte foi revista.

### 5.3 Sobre que linhas cada verificação corre

V2 e V3 correm sobre a planilha inteira; V4 a V7, sobre o **recorte** que será emitido. O motivo
é que a faixa de grandeza de V4 foi calibrada para a cobertura da caderneta: a estatura da
referência 2007 chega a 176 cm no mês 228, fora da faixa de 40 a 160 cm, e essas linhas não são
embarcadas. Verificar o que se embarca é a regra; verificar o que se descarta produziria falha
em dado que o produto não usa.

## 5.1 Duas ferramentas, não uma

A auditoria cruzada (A007) mostrou que este contrato e o `onboarding.md` divergiam quanto a
quem baixa as planilhas. A divisão fica assim, e vale para os dois documentos:

| Ferramenta | Responsabilidade | Rede |
|---|---|---|
| `scripts/baixar-tabelas-oms.mts` | Resolve as URLs do §2, grava em `referencias/oms/` e registra o `sha256` de cada arquivo | sim, uma vez, na mão do mantenedor |
| `scripts/gerar-tabelas-oms.mts` | Lê do disco, aplica as verificações do §5, transforma conforme o §4 e escreve os módulos | **não** |

A extensão é `.mts` porque o `package.json` do Next não declara `type: module`: assim os
scripts são ESM sem ambiguidade e sem aviso de reparse. Os dois são invocados por `node`,
sem `npx tsx` (D-14).

A separação existe para que a conversão — a parte que decide números clínicos — seja
determinística, repetível offline e auditável sem depender de a origem continuar no ar. Ambas
leem o `.xlsx` com os built-ins do Node, sem dependência nova (D-14 do roadmap).

## 6. Idempotência e reprodutibilidade

- Rodar o gerador duas vezes sobre as mesmas origens produz **arquivos byte a byte idênticos**;
  o `git diff` vazio é a prova de que nada mudou na origem.
- O manifesto ao lado dos módulos registra a URL, a data e o `sha256` de cada `.xlsx` de origem:
  o baixador o preenche, o gerador o confere antes de converter e falha se o hash do arquivo em
  disco não corresponder. Uma revisão futura da OMS aparece como divergência de hash, não como
  surpresa num escore.
- O runtime **não depende de nada disto**: ele lê apenas os módulos TypeScript commitados.
  Reprodutibilidade temporal preservada (Princípio 5.3): o cálculo de daqui a dois anos não
  depende de o `cdn.who.int` continuar servindo o mesmo caminho.

## 7. Erros, tempo-limite e retentativa

Não se aplicam ao produto: o download acontece uma vez, na mão do mantenedor, fora do caminho do
usuário. A política é a mais simples possível, e agora com dono declarado (§5.1) — no **baixador**,
sem retentativa automática, tempo limite generoso e mensagem que diga qual URL falhou; no
**gerador**, mensagem que diga qual arquivo e em que verificação parou.

## 8. Gatilho de revisão

Alinhado a MD-0008 e a ADR 0011: nova edição da *Caderneta da Criança* ou revisão das tabelas
pela OMS dispara reexecução do gerador, conferência do `git diff` e reavaliação dos rótulos
literais. Enquanto o hash das origens não mudar, o dado embarcado é o vigente.
