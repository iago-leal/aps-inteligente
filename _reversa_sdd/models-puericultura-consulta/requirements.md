# `models/puericultura/consulta` — Requisitos

> Unit de domínio gerada pelo Reversa Writer na re-extração nº 4 (2026-07-28), a partir da
> feature `020-consulta-puericultura-soap`.
> **Arranjo inédito na plataforma:** é a segunda fachada sob a unit `models/puericultura`, e
> não uma unit irmã (ADR 0017). Também é a primeira saída do produto que **não é um número**.
> Fonte editorial: **Caderneta da Criança** (MS, 2.ª ed., 2020), pp. 66–75, as páginas verdes
> das consultas recomendadas.

## Visão Geral

A unit transforma as dez consultas datadas da caderneta em fichas preenchíveis e devolve o
preenchimento organizado nas quatro seções do registro clínico orientado por problemas —
subjetivo, objetivo, avaliação e plano. Não calcula escore algum: quando há avaliação de
crescimento, ela chega pronta da fachada da feature 017 e é **transposta** para as seções
certas, com a referência que aquele motor já carimbou. 🟢

A divisão de trabalho é a razão de a unit existir sob a mesma pasta em vez de ao lado dela.
As duas fachadas compartilham `tipos`, `datas`, `idades` e a fonte clínica; recalcular escore
aqui criaria uma segunda fonte de escore z dentro do mesmo domínio. 🟢

## Responsabilidades

- Publicar o catálogo das dez fichas, cada uma com título, página e faixa etária em dias. 🟢
- Sugerir a ficha adequada à idade **cronológica** da criança. 🟢
- Selecionar, dentro de cada ficha, os campos aplicáveis ao sexo informado. 🟢
- Montar o registro estruturado a partir do preenchimento, agrupando por seção do SOAP. 🟢
- Transpor os índices calculados que a fachada de crescimento tiver produzido, sem recalcular
  nada. 🟢
- Declarar ao leitor o que é do produto e não da fonte: a organização em SOAP, as fichas que
  ficaram de fora e a supressão de campo por sexo. 🟢

Fora de escopo: persistir preenchimento, sugerir conduta, imprimir, e formatar o registro em
texto corrido. A projeção em cadeia de caracteres é da camada de interface, por decisão. 🟢

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | O domínio devolve **estrutura**, nunca texto pronto. A projeção em texto é da interface, e é uma função com dois consumidores — o bloco que exibe e o comando que copia —, de modo que a identidade entre o que se vê e o que se copia seja estrutural. | 🟢 |
| RN-02 | Campo sem resposta não aparece no registro. Resposta de medida ou de texto em branco equivale a campo sem resposta. | 🟢 |
| RN-03 | Seção que fique sem item **some inteira, cabeçalho incluído**. Cabeçalho solto afirmaria averiguação que não houve, o que é pior que a omissão. | 🟢 |
| RN-04 | A ficha é sugerida pela idade **cronológica**, inclusive no pré-termo, porque é ela que rege o calendário de acompanhamento e o vacinal. A espécie de idade volta declarada na sugestão e no registro. | 🟢 |
| RN-05 | Idade entre duas consultas previstas cai na ficha imediatamente **anterior**. | 🟡 |
| RN-06 | O motor não recalcula escore algum: o resultado da avaliação chega pronto e é transposto com a referência que já traz. | 🟢 |
| RN-07 | Os escores ocupam a seção **objetiva**, que é onde a medida mora; a classificação nutricional ocupa a **avaliação**, porque é juízo da própria fonte e não conclusão que o produto tenha formado. | 🟢 |
| RN-08 | O estado nutricional sai do IMC para a idade; na falta dele, do peso para a idade. O índice que produziu o juízo vai dito no próprio valor. | 🟢 |
| RN-09 | A aplicabilidade por sexo mora no dado, não em condicional de tela. Campo sem `sexos` declarado vale para os dois: a restrição é a exceção, e por isso é ela que se escreve. | 🟢 |
| RN-10 | Havendo supressão de campo por sexo, o registro traz a nota que a declara. Hoje a lista tem um item só, "Criptorquidia", e a supressão é inseparável da declaração ao leitor. | 🟢 |
| RN-11 | A flexão de gênero se faz por par de rótulos declarado (`rotulo` / `rotuloFeminino`), jamais por interpolação de sufixo. | 🟢 |
| RN-12 | Toda montagem declara a organização em SOAP como decisão editorial do produto, e nunca da fonte. | 🟢 |
| RN-13 | Toda montagem declara quais registros das mesmas páginas ficaram fora da entrega, para que quem confere contra a caderneta saiba que a tela não cobre as páginas verdes inteiras. | 🟢 |
| RN-14 | O escore transposto é exibido com uma casa decimal e sinal explícito, com o menos tipográfico `−`. | 🟢 |
| RN-15 | As referências do registro nunca se repetem: a mesma localização entra uma vez só. | 🟢 |
| RN-16 | Nenhuma faixa de ficha pode ficar descoberta. Idade sem ficha correspondente é bug interno, e lança. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Expor a fachada `RegistroDeConsultaPuericultura` com três operações: `catalogo()`, `sugerir(idades)` e `montar(entrada)`. | Must | `tests/unit/dominio-puericultura/consulta-*.test.ts`. |
| RF-02 | Publicar as dez fichas em ordem cronológica, cobrindo de 0 dias em diante sem lacuna. | Must | `consulta-selecao.test.ts` percorre as fronteiras de todas as faixas. |
| RF-03 | Sugerir a ficha pela idade cronológica e declarar a espécie usada. | Must | Sugestão de prematuro de 60 dias de vida cai na ficha do 1.º mês, não na corrigida. |
| RF-04 | Filtrar campos por sexo, com a ausência de `sexos` significando "vale para os dois". | Must | `consulta-sexo.test.ts`. |
| RF-05 | Montar o registro nas quatro seções, na ordem S, O, A, P, omitindo as vazias. | Must | `consulta-registro.test.ts`. |
| RF-06 | Formatar cada natureza de resposta: marcação em Sim/Não, escolha com complemento opcional, medida com unidade, texto aparado. | Must | `consulta-registro.test.ts`. |
| RF-07 | Transpor os índices calculados para objetivo e a classificação nutricional para avaliação. | Must | `consulta-registro.test.ts` com resultado de avaliação injetado. |
| RF-08 | Emitir as notas de organização em SOAP e de fichas ausentes em toda montagem, e a de supressão só quando ela ocorrer. | Must | `consulta-invariantes.test.ts`. |
| RF-09 | Compor as referências: a cobertura das páginas verdes, a página da ficha usada e as referências dos índices transpostos, sem repetição. | Must | `consulta-invariantes.test.ts`. |
| RF-10 | Descrever a idade em prosa (dias até o primeiro mês, depois meses e dias). | Should | `consulta-registro.test.ts`. |
| RF-11 | Aceitar catálogo de fichas injetado, com o real por omissão. | Should | Construtor com valor padrão `FICHAS`. |
| RF-12 | Manter a transcrição das dez fichas conferível contra o impresso. | Must | `consulta-transcricao.test.ts`, contra `tests/apoio/fichas-caderneta-congeladas.json`. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Nada do que se preenche é salvo ou enviado; o registro é montado no navegador e some ao recarregar. A nota `NOTA_NADA_E_SALVO` diz isso ao usuário. | `consulta/fonte-clinica.ts` | 🟢 |
| Determinismo | Nenhuma leitura de relógio: a data da consulta e as idades chegam pelo contexto. | `consulta/tipos.ts:ContextoDaConsulta` | 🟢 |
| Auditabilidade | Cada item transposto conserva a referência clínica de origem, e a origem (`ficha` ou `calculadora-de-crescimento`) vai no próprio item. | `consulta/registro.ts:itensDaCalculadora` | 🟢 |
| Integridade da citação | As fichas transcritas são conferidas contra um congelado que não se regera. | `tests/apoio/fichas-caderneta-congeladas.json`; ADR 0018 | 🟢 |
| Manutenibilidade | Nenhum arquivo acima de 400 linhas; o peso está no acervo das dez fichas (2.484 LOC no submódulo). | `consulta/registro.ts` (270) | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: montagem com ficha e avaliação
  Dado a ficha do 2.º mês e um preenchimento com três campos respondidos
  E um resultado de avaliação com peso e IMC calculados
  Quando o registro é montado
  Então há seção Objetivo com os índices e seção Avaliação com a classificação do IMC
  E cada item transposto traz a referência que o motor de crescimento carimbou
  E o registro declara a organização em SOAP como decisão do produto

Cenário: seção que perde todos os itens
  Dado um preenchimento em que nenhum campo do Plano foi respondido
  Quando o registro é montado
  Então a seção Plano não aparece, nem com o cabeçalho

Cenário: resposta em branco
  Dado um campo de medida com valor "   " e um campo de texto vazio
  Quando o registro é montado
  Então nenhum dos dois aparece, porque em branco equivale a não respondido

Cenário: supressão por sexo
  Dado a ficha do 2.º mês e sexo feminino
  Quando o registro é montado
  Então o campo Criptorquidia não é oferecido nem registrado
  E o registro traz a nota SUPRESSAO_DE_CAMPO, que declara a diferença em relação ao impresso

Cenário: prematuro e a ficha sugerida
  Dado uma criança com 60 dias de vida e 40 dias de idade corrigida
  Quando a ficha é sugerida
  Então a ficha é a do 1.º mês, pela idade cronológica
  E a sugestão declara a espécie "cronologica"

Cenário: sem avaliação de crescimento
  Dado um preenchimento sem resultado de avaliação
  Quando o registro é montado
  Então não há item de origem "calculadora-de-crescimento"
  E as seções da ficha seguem montadas normalmente
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Montagem em SOAP com omissão de seção vazia | Must | É o produto da unit, e a regra que mais protege o registro clínico. |
| Transposição sem recálculo | Must | Recalcular criaria segunda fonte de escore dentro da mesma unit. |
| Sugestão pela idade cronológica | Must | Erro aqui troca a ficha inteira, e o calendário é cronológico. |
| Filtro por sexo com declaração | Must | Diferença em relação ao impresso; silenciá-la quebraria a conferência. |
| Notas de organização e de fichas ausentes | Must | Delimitam o que a tela cobre; sem elas, quem confere supõe cobertura total. |
| Descrição da idade em prosa | Should | Conveniência de leitura; o dado bruto continua disponível. |
| Catálogo injetável | Should | Serve à testabilidade. |
| Complemento em campo de escolha | Could | Usado em poucos campos das dez fichas. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `models/puericultura/consulta/calculadora.ts` | `RegistroDeConsultaPuericultura` | 🟢 |
| `models/puericultura/consulta/tipos.ts` | Contratos de campo, resposta e registro | 🟢 |
| `models/puericultura/consulta/selecao.ts` | `sugerirFicha`, `camposAplicaveis`, `rotuloDoCampo` | 🟢 |
| `models/puericultura/consulta/registro.ts` | `montarRegistro`, `descreverIdade` | 🟢 |
| `models/puericultura/consulta/fonte-clinica.ts` | Referências e as quatro notas | 🟢 |
| `models/puericultura/consulta/fichas/*.ts` | 10 fichas + `campos.ts` + `indice.ts` | 🟢 |

**Cobertura de testes:** 54 testes em 5 arquivos `consulta-*` sob
`tests/unit/dominio-puericultura/` (aferido em 2026-07-28), mais o congelado de transcrição em
`tests/apoio/fichas-caderneta-congeladas.json`.
