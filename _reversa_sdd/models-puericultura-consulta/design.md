# `models/puericultura/consulta` — Design Técnico

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `020-consulta-puericultura-soap`.
> Segunda fachada sob `models/puericultura` (ADR 0017). Domínio puro, sem I/O.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `RegistroDeConsultaPuericultura` | `new (fichas?: readonly Ficha[])` | — | Catálogo injetável, com `FICHAS` por omissão. |
| `.catalogo` | `()` | `readonly Ficha[]` | As dez fichas na ordem cronológica. |
| `.sugerir` | `(idades: IdadesDerivadas)` | `SugestaoDeFicha` | Usa `diasDeVida`, nunca `diasCorrigidos`. |
| `.montar` | `(entrada: EntradaDoRegistro)` | `RegistroDaConsulta` | Único ponto de montagem. |
| `sugerirFicha` | `(idades, fichas?)` | `SugestaoDeFicha` | Lança `ErroDeInvariante` se nenhuma faixa cobrir a idade. |
| `camposAplicaveis` | `(secao, sexo)` | `readonly Campo[]` | Filtro por `sexos`, com ausência significando "ambos". |
| `rotuloDoCampo` | `(campo, sexo)` | `string` | Par declarado, sem interpolação. |
| `montarRegistro` | `(entrada)` | `RegistroDaConsulta` | Reúne, agrupa, anota e referencia. |
| `descreverIdade` | `(diasDeVida)` | `string` | "18 dias", "2 meses", "2 meses e 3 dias". |

### Entrada da montagem

`EntradaDoRegistro` reúne quatro coisas: a `ficha` escolhida, o `contexto` da consulta (sexo,
datas, idades derivadas e posição da medição), o `preenchimento` — um mapa de identificador de
campo para resposta — e, opcionalmente, a `avaliacao` produzida pela fachada de crescimento.

### O modelo de campo

Cada campo tem identificador, rótulo, seção do SOAP a que pertence, página da caderneta de
onde veio e, quando cabe, rótulo feminino, orientação e restrição de sexo. A natureza governa
a resposta que ele aceita:

| Natureza | Resposta esperada | Projeção no registro |
|----------|-------------------|----------------------|
| `marcacao` | `"sim"` ou `"nao"` | "Sim" ou "Não" |
| `escolha` | opção, com complemento opcional | `opção` ou `opção — complemento` |
| `medida` | texto bruto | `bruto` mais a unidade (`g`, `cm`, `kg/m²`); em branco é omissão |
| `texto` | texto livre | aparado; em branco é omissão |

### Saída

`RegistroDaConsulta` traz a ficha usada (id, título, página), a idade declarada com a espécie,
as seções não vazias em ordem S, O, A, P, as notas e as referências. Cada item declara a
`origem`: `ficha` ou `calculadora-de-crescimento`, e esta última conserva a `ReferenciaClinica`
carimbada pelo motor de crescimento.

## Fluxo Principal

1. **Reunir os itens da ficha.** Percorre as seções e, dentro de cada uma, só os campos
   aplicáveis ao sexo. Campo sem resposta é ignorado; resposta que projeta em nada — medida ou
   texto em branco — também.
2. **Reunir os itens da calculadora**, quando há avaliação. Os índices calculados viram itens
   da seção objetiva; o estado nutricional, um item da avaliação.
3. **Agrupar** na ordem S, O, A, P, e **descartar a seção sem item**.
4. **Anotar**: organização em SOAP e fichas ausentes sempre; supressão de campo apenas quando
   a ficha tiver campo restrito ao outro sexo.
5. **Referenciar**: cobertura das páginas verdes, página da ficha, e as referências dos itens
   transpostos, sem repetir localização.

```
montar → itensDaFicha + itensDaCalculadora → agrupar (descarta vazias) → notas → referências
```

## O catálogo das dez fichas

| Ficha | Página | Faixa em dias de vida |
|-------|--------|-----------------------|
| Consulta da 1ª Semana | 68 | 0 – 29 |
| Consulta do 1º Mês | 69 | 30 – 60 |
| Consulta do 2º Mês | 70 | 61 – 121 |
| Consulta do 4º Mês | 71 | 122 – 182 |
| Consulta do 6º Mês | 72 | 183 – 273 |
| Consulta do 9º Mês | 72 | 274 – 364 |
| Consulta do 12º Mês | 73 | 365 – 547 |
| Consulta do 18º Mês | 73 | 548 – 729 |
| Consulta do 24º Mês | 74 | 730 – 1.095 |
| Consulta do 36º Mês | 74 | 1.096 em diante |

As faixas são contíguas e não deixam lacuna. A última é aberta à direita, de modo que criança
de qualquer idade acima de três anos receba a ficha do 36.º mês — a fonte não publica consulta
datada além dela. 🟢

## Fluxos Alternativos

- **Sem avaliação de crescimento.** As seções da ficha são montadas normalmente e nenhum item
  de origem `calculadora-de-crescimento` aparece. A ficha e a calculadora são independentes.
- **Avaliação sem IMC calculado.** O estado nutricional cai para o peso para a idade, e o
  valor diz de qual índice veio.
- **Avaliação sem nenhum índice calculado.** Não há item de avaliação; os objetivos também
  ficam vazios, e a seção some.
- **Idade acima de 1.095 dias.** Ficha do 36.º mês, por a faixa ser aberta.
- **Idade sem ficha correspondente.** `ErroDeInvariante`: só ocorre se as faixas do índice
  deixarem de cobrir a reta, o que é bug de dado, não fluxo.

## Dependências

- `models/puericultura/tipos.ts` — `IdadesDerivadas`, `ResultadoAvaliacao`, `IndiceCalculado`,
  `ReferenciaClinica`, `Sexo`. Compartilhados por serem a mesma unit.
- `models/puericultura/fonte-clinica.ts` — a função `referencia`, de modo que as duas fachadas
  citem a mesma fonte com a mesma forma.
- Nenhuma dependência externa. Nenhum import de React, Next ou Primer, verificado por
  `invariantes.test.ts`, que varre `models/puericultura/**`.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Segunda fachada sob a mesma unit, e não unit irmã. | `consulta/calculadora.ts`; ADR 0017 | 🟢 |
| O domínio devolve estrutura; a projeção em texto é da interface, com dois consumidores. | `interface/puericultura/consulta/formatar-registro.ts` | 🟢 |
| Seção vazia é descartada no `filter` da montagem, não escondida na tela. | `consulta/registro.ts:agrupar` | 🟢 |
| A aplicabilidade por sexo mora no dado do campo. | `consulta/tipos.ts:CampoBase.sexos`; `MD-0026` | 🟢 |
| A flexão de gênero se faz por par de rótulos declarado. | `consulta/selecao.ts:rotuloDoCampo` | 🟢 |
| Os campos são construídos por fábrica que carimba a página, de modo que nenhuma ficha possa citar página errada por descuido. | `consulta/fichas/campos.ts:camposDaPagina` | 🟢 |
| O escore transposto é formatado com sinal explícito e menos tipográfico. | `consulta/registro.ts:formatarEscoreZ` | 🟢 |
| A seleção do estado nutricional prefere o IMC e cai para o peso. | `consulta/registro.ts:itensDaCalculadora` | 🟢 |

## Estado Interno

Nenhum entre chamadas. A instância guarda apenas o catálogo recebido, somente-leitura. O
`Preenchimento` é um `ReadonlyMap` fornecido pelo chamador; a unit não o modifica. 🟢

## Observabilidade

Nenhuma. Telemetria nula por decisão de plataforma (ADR 0007). A rastreabilidade do registro
vem dos próprios campos `origem` e `referencia` de cada item. 🟢

## Riscos e Lacunas

- 🟡 **A ficha imediatamente anterior.** A criança de sete meses cai na ficha do 6.º mês,
  porque a fonte não diz o que fazer com a idade entre duas consultas previstas. O custo de
  errar é um clique, já que a troca de ficha é livre na tela.
- 🟡 **A atribuição de cada campo a uma seção do SOAP é editorial.** A caderneta imprime seções
  numeradas e não menciona registro orientado por problemas. A nota `ORGANIZACAO_EM_SOAP`
  declara isso em toda montagem, mas a atribuição campo a campo continua sendo juízo do
  produto.
- 🟡 **Três registros das mesmas páginas ficaram fora**: Pré-Natal/Parto/Nascimento (p. 67),
  Triagens Neonatais (p. 68) e Outras Medidas e Consultas Necessárias (p. 75), esta com a
  tabela de aferição da pressão arterial. A nota `FICHAS_AUSENTES` declara a lacuna.
- 🟡 **A lista de campos restritos por sexo tem um item só.** `MD-0027` registra que a isenção
  nominal no verificador de citação foi tomada na execução e permanece aberta a revisão
  enquanto a lista não crescer.
- 🟢 Nada aqui depende de rede, relógio ou armazenamento.
