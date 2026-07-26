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
| V5 | `M` é monotonicamente crescente em peso, comprimento e perímetro cefálico | Colunas embaralhadas |
| V6 | Reconstruir os valores `SD3neg`…`SD3` a partir de `L`, `M`, `S` e conferir contra as colunas publicadas, com tolerância do arredondamento da própria planilha | LMS não corresponde aos desvios: dado corrompido |
| V7 | Valores-âncora conhecidos batem: perímetro cefálico masculino ao nascer `M = 34,4618`; peso masculino em `Month = 61` (tabela 2007) `M = 18,5057`; peso feminino em `Month = 61` `M = 18,2579` | Revisão silenciosa da tabela na origem |

A verificação V6 é a mais valiosa: ela usa o próprio arquivo como oráculo de si mesmo e captura,
de uma vez, erro de coluna, de arredondamento e de leitura.

## 6. Idempotência e reprodutibilidade

- Rodar o gerador duas vezes sobre as mesmas origens produz **arquivos byte a byte idênticos**;
  o `git diff` vazio é a prova de que nada mudou na origem.
- O gerador registra, num manifesto ao lado dos módulos, a URL, a data e o `sha256` de cada
  `.xlsx` de origem. Uma revisão futura da OMS aparece como divergência de hash, não como
  surpresa num escore.
- O runtime **não depende de nada disto**: ele lê apenas os módulos TypeScript commitados.
  Reprodutibilidade temporal preservada (Princípio 5.3): o cálculo de daqui a dois anos não
  depende de o `cdn.who.int` continuar servindo o mesmo caminho.

## 7. Erros, tempo-limite e retentativa

Não se aplicam ao produto: o download acontece uma vez, na mão do mantenedor, fora do caminho do
usuário. No gerador, a política é a mais simples possível — sem retentativa automática, tempo
limite generoso e mensagem de erro que diga qual URL falhou e em que verificação parou.

## 8. Gatilho de revisão

Alinhado a MD-0008 e a ADR 0011: nova edição da *Caderneta da Criança* ou revisão das tabelas
pela OMS dispara reexecução do gerador, conferência do `git diff` e reavaliação dos rótulos
literais. Enquanto o hash das origens não mudar, o dado embarcado é o vigente.
