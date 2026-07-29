# `models/puericultura` — Requisitos

> Unit de domínio gerada pelo Reversa Writer na re-extração nº 4 (2026-07-28), a partir da
> feature `017-puericultura-crescimento`. Quinto domínio clínico da plataforma e o mais
> ramificado dela.
> Fonte editorial única: **Caderneta da Criança** (Ministério da Saúde, 2.ª ed., Brasília,
> 2020), seção "Acompanhando o Crescimento", pp. 85–97 — ADR 0011, `MD-0001`.

## Visão Geral

A unit calcula os escores z dos quatro índices antropométricos do acompanhamento infantil e
os converte no rótulo nutricional que a Caderneta da Criança imprime, cobrindo de zero a dez
anos de idade e, no nascido pré-termo, a janela de 27 a 64 semanas pós-menstruais pelas curvas
INTERGROWTH-21st. É motor puro: recebe medida, data e sexo, devolve número, rótulo e
proveniência, e não emite conduta alguma (ADR 0005). 🟢

O que a distingue dos quatro domínios anteriores é a **ramificação por idade**. Uma criança
não tem uma idade, tem três — cronológica, corrigida e pós-menstrual —, e cada uma governa
coisa diferente. Errar qual delas indexa a curva troca o laudo nutricional sem produzir erro
visível. 🟢

## Responsabilidades

- Derivar as três idades a partir da data de nascimento, da data da medição e, quando
  informada, da idade gestacional ao nascer. 🟢
- Decidir, **por criança e não por índice**, qual régua vale: INTERGROWTH-21st ou OMS. 🟢
- Ler os parâmetros L, M e S na linha publicada da tabela da OMS, sem interpolar. 🟢
- Calcular o escore z pelo método LMS, com correção de cauda nos dois indicadores baseados
  em peso. 🟢
- Converter a medida de comprimento entre as posições deitada e em pé, declarando a
  conversão. 🟢
- Classificar cada escore no rótulo literal da fonte, respeitando as trocas de conjunto que
  ocorrem aos dois e aos cinco anos. 🟢
- Recusar o que a fonte não cobre, distinguindo recusa global de recusa parcial. 🟢
- Carimbar cada índice com o padrão, a idade usada e a página da caderneta de onde o rótulo
  veio. 🟢

Fora de escopo, por decisão explícita: emitir conduta, sugerir encaminhamento, traçar
tendência entre medições sucessivas e persistir qualquer dado da criança. A entrada não tem
campo de identificação — nem nome, nem prontuário, nem documento (ADR 0002). 🟢

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | Quatro índices, sempre na ordem da caderneta: peso/idade, comprimento-estatura/idade, IMC/idade e perímetro cefálico/idade. Cada um é independente dos demais. | 🟢 |
| RN-02 | Escore z por LMS: `z = ((X/M)^L − 1)/(L·S)` quando `L ≠ 0`; `z = ln(X/M)/S` quando `L = 0`. | 🟢 |
| RN-03 | Quando `\|z\| > 3`, o escore é recalculado por extrapolação linear a partir do último ponto confiável, no passo `SD3 − SD2` daquele lado. Aplica-se **só** a `peso-idade` e `imc-idade`, e a lista dos índices alcançados é dado (`INDICES_COM_CORRECAO_DE_CAUDA`), não condicional. | 🟢 |
| RN-04 | Peso para idade: quatro faixas, com categoria superior (`> +2` elevado; `≥ −2` adequado; `≥ −3` baixo; abaixo disso muito baixo). | 🟢 |
| RN-05 | Comprimento/estatura: três faixas, **sem** categoria superior — a caderneta não classifica estatura acima de +2, e inventar rótulo para ela seria inventar fonte. O substantivo troca aos 2 anos: "Comprimento" até 730 dias, "Estatura" depois. | 🟢 |
| RN-06 | IMC: seis faixas, e os três rótulos superiores **deslizam um degrau** aos cinco anos. O mesmo z = +2,5 é "Sobrepeso" aos 4 anos e "Obesidade" aos 6. | 🟢 |
| RN-07 | Perímetro cefálico: três faixas, sem corte em ±3. A fonte usa a sigla, não o nome por extenso. | 🟢 |
| RN-08 | Duas espécies de recusa. **Global**: idade corrigida acima de 3.682 dias, ou pós-menstrual abaixo de 27 semanas — nenhum índice é calculado. **Parcial**: perímetro cefálico acima de 730 dias — só aquele índice sai de escopo, e os demais permanecem válidos. | 🟢 |
| RN-09 | A conversão de posição é de 0,7 cm, aplicada quando a posição informada difere da esperada para a idade cronológica, e **sempre declarada**. O aviso acompanha os dois índices que consomem a medida convertida: comprimento/estatura e IMC. | 🟢 |
| RN-10 | Toda aritmética de datas ocorre em dias epoch UTC (ADR 0013). O motor não lê o relógio: a data da medição é injetada pela interface. | 🟢 |
| RN-11 | Validação por coleta total: todos os ofensores de uma vez, nunca só o primeiro. São dez códigos. | 🟢 |
| RN-12 | O motor informa escore e classificação; não escolhe conduta (ADR 0005). | 🟢 |
| RN-13 | Erro esperado é valor de retorno; exceção (`ErroDeInvariante`) fica reservada a bug interno (ADR 0004). | 🟢 |
| RN-14 | Toda saída carrega a nota de proveniência, que diz três coisas que o número não diz sozinho: que a medição isolada não substitui a tendência, quais réguas produziram o escore e que a leitura é por linha publicada. | 🟢 |
| RN-15 | Idade gestacional ausente **não** é pré-termo: a criança é tratada como nascida a termo, e a premissa sai declarada no resultado (`PREMISSA_DE_TERMO`), nunca silenciada. | 🟢 |
| RN-16 | Correção de prematuridade: desconto de `40 semanas − IG ao nascer`, ativo até 730 dias de vida, ou até 1.095 quando a IG ao nascer for inferior a 28 semanas. | 🟢 |
| RN-17 | O IMC não existe nas curvas de pré-termo. A ausência é por inexistência (`IMC_INEXISTENTE_NO_PRETERMO`), e o motivo tem de dizer qual das duas ausências ocorreu. | 🟢 |
| RN-18 | Abaixo de 27 semanas pós-menstruais a fonte não publica referência, e estimá-la seria inventar curva para o recém-nascido mais frágil. | 🟢 |
| RN-19 | Todo índice calculado declara o par padrão + idade usada. Sem ele o escore seria inauditável: duas crianças com o mesmo peso e a mesma data de nascimento recebem escores distintos por terem nascido em idades gestacionais diferentes. | 🟢 |
| RN-20 | Duas fronteiras dos cinco anos que **de propósito não coincidem**: a de tabela aos 1.856 dias e a de rótulo aos 1.826. Entre elas vale a tabela de 0–5 anos com os rótulos de 5–10. | 🟢 |
| RN-21 | Sem interpolação: até 1.856 dias lê-se o dia inteiro; de lá em diante, o mês completo `⌊dias/30,4375⌋`. Nenhum valor usado no cálculo é estimado. | 🟢 |
| RN-22 | Dois rótulos são exibidos com a concordância corrigida em relação ao impresso, e a correção é declarada ao leitor em constante própria (`NOTA_CORRECAO_DE_CONCORDANCIA`, `MD-0015`). A lista é fechada. | 🟢 |
| RN-23 | Os limites de plausibilidade da digitação são bom senso clínico, não da fonte: a caderneta não publica faixas de entrada. Existem para barrar erro grosseiro, não para julgar o caso extremo. | 🟡 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Expor a fachada `CalculadoraCrescimentoInfantil.avaliar(entrada) → SaidaAvaliacao`, união discriminada de três variantes (`resultado`, `fora-do-escopo`, `erro-validacao`). | Must | `tests/unit/dominio-puericultura/fachada.test.ts` exercita as três variantes. |
| RF-02 | Calcular o escore z de cada índice informado, pela régua escolhida para a criança. | Must | Conferência contra o oráculo congelado em `casos-oraculo.test.ts`. |
| RF-03 | Aplicar a correção de cauda apenas em `peso-idade` e `imc-idade`, e apenas fora de ±3. | Must | `lms.test.ts`; sabotar a lista faz o teste falhar de modo visível. |
| RF-04 | Classificar o escore no rótulo literal da fonte, conforme índice e faixa etária. | Must | `classificacao.test.ts` cobre as trocas de conjunto aos 2 e aos 5 anos. |
| RF-05 | Derivar as três idades e expô-las no resultado como campos inspecionáveis. | Must | `idades.test.ts`. |
| RF-06 | Suportar medida ausente: a falta de uma medida suprime só o índice que dela depende, e "não calculado" nunca se confunde com "calculado como zero". | Must | Variante `IndiceAusente` no retorno, verificada em `fachada.test.ts`. |
| RF-07 | Escolher a régua num ponto único do código (`padrao.ts`), por criança e nunca por índice. | Must | `fachada.test.ts`: nenhum resultado mistura padrões entre índices. |
| RF-08 | Converter a posição da medição e emitir o aviso correspondente nos dois índices afetados. | Must | `medidas.test.ts`. |
| RF-09 | Recusar globalmente fora da cobertura da fonte, com mensagem que diga o limite e por que ele existe. | Must | `elegibilidade.test.ts` e `fachada-recusas.test.ts`. |
| RF-10 | Carimbar cada índice calculado com `ReferenciaClinica` — nunca ausente — e devolver a lista de referências do resultado, nunca vazia. | Must | `invariantes.test.ts`, por propriedade. |
| RF-11 | Coletar todos os ofensores de validação de uma vez, com campo, código e mensagem acionável. | Must | `validacao.test.ts` cobre os dez códigos. |
| RF-12 | Aceitar repositório de tabelas injetado, com o acervo real por omissão. | Should | Construtor com valor padrão `REPOSITORIO_OMS`; `leitura-oms.test.ts` injeta acervo sintético. |
| RF-13 | Expor a nota de proveniência como fonte textual única, lida pela tela. | Must | Constante `NOTA_PROVENIENCIA`; verificador de citação em `tests/unit/textos/`. |
| RF-14 | Recusar parcialmente o perímetro cefálico acima de dois anos, sem derrubar os demais índices. | Must | `fachada-recusas.test.ts`. |
| RF-15 | Avaliar o nascido pré-termo pelas curvas INTERGROWTH-21st como equações fechadas, sem tabela. | Must | `intergrowth.test.ts` contra o oráculo congelado. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Nenhum campo de entrada identifica a criança; nada é persistido nem transmitido. | `models/puericultura/tipos.ts:40-52` (`EntradaAvaliacao`) | 🟢 |
| Determinismo | O motor não lê o relógio nem gera aleatoriedade: a data da medição entra como parâmetro. | `tipos.ts:44`, `idades.ts` (`derivarIdades`) | 🟢 |
| Auditabilidade | Todo escore declara padrão, idade usada e página da fonte; o resultado sem referência é invariante que lança. | `calculadora.ts:252-256` | 🟢 |
| Integridade do dado | As 14 tabelas embarcadas são geradas com `sha256` das planilhas de origem registrado em `manifesto.json`. | `models/puericultura/oms/tabelas/manifesto.json` | 🟢 |
| Reprodutibilidade | O oráculo de conferência é congelado e jamais regerado, de modo que a suíte roda em clone limpo, sem rede e sem as fontes fora do git. | `tests/apoio/casos-oraculo-puericultura.json`; ADR 0018 | 🟢 |
| Manutenibilidade | Nenhum arquivo de motor acima de 400 linhas; os módulos gerados de `oms/tabelas/` são exceção nominal declarada no README. | `calculadora.ts` (316), `oms/leitura.ts` (331) | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: criança a termo, dentro da cobertura
  Dado sexo masculino, nascimento em 2024-01-10 e medição em 2025-01-09
  E peso de 10,2 kg, comprimento de 76 cm aferido deitado
  Quando a fachada avalia a entrada
  Então a saída tem tipo "resultado"
  E cada índice informado traz escoreZ, classificacao, padrao "OMS" e referencia
  E o índice de IMC traz o mesmo aviso de conversão que o de comprimento, se houve conversão
  E o resultado traz a nota PREMISSA_DE_TERMO, porque a idade gestacional não foi informada

Cenário: nascido pré-termo dentro da janela do INTERGROWTH-21st
  Dado nascimento com 30 semanas e 0 dias de idade gestacional
  E idade pós-menstrual de 34 semanas na data da medição
  Quando a fachada avalia a entrada
  Então todos os índices calculados usam o padrão "INTERGROWTH-21st"
  E a espécie de idade declarada é "pos-menstrual"
  E o índice de IMC vem ausente com motivo IMC_INEXISTENTE_NO_PRETERMO

Cenário: recusa parcial do perímetro cefálico
  Dado uma criança de 900 dias de idade corrigida
  E perímetro cefálico informado
  Quando a fachada avalia a entrada
  Então o índice de perímetro cefálico vem com estado "fora-do-escopo" e motivo PC_ACIMA_DE_2_ANOS
  E os demais índices seguem calculados

Cenário: recusa global por idade acima da cobertura
  Dado uma criança de 3.700 dias de idade corrigida
  Quando a fachada avalia a entrada
  Então a saída tem tipo "fora-do-escopo" e motivo IDADE_FORA_DA_COBERTURA
  E nenhum escore é devolvido

Cenário: entrada inválida, com coleta total
  Dado sexo inválido, data de nascimento posterior à medição e nenhuma medida informada
  Quando a fachada avalia a entrada
  Então a saída tem tipo "erro-validacao"
  E a lista de ofensores traz os três problemas, não apenas o primeiro

Cenário: comprimento informado sem posição
  Dado comprimento de 80 cm e posicaoDaMedicao ausente
  Quando a fachada avalia a entrada
  Então há ofensor POSICAO_DA_MEDICAO_AUSENTE, porque a conversão de 0,7 cm depende dela
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Escore z por LMS e classificação literal | Must | É o produto da unit; sem ele não há tela. |
| Três idades e escolha da régua | Must | Caminho crítico de toda avaliação; erro aqui é silencioso. |
| Correção de cauda nos dois indicadores de peso | Must | Omiti-la desloca o escore em até 10,4 unidades de IMC. |
| Recusa global e recusa parcial | Must | Limite do que a fonte autoriza afirmar. |
| Declaração de proveniência e referência por índice | Must | Invariante de plataforma; o resultado sem referência lança. |
| Conversão de posição com aviso | Must | Regra da fonte, e a omissão do aviso esconderia mudança de dado. |
| Repositório de tabelas injetável | Should | Serve à testabilidade; o acervo real é o padrão do construtor. |
| Faixas de plausibilidade da digitação | Should | Barram erro grosseiro, mas são premissa 🟡 e não regra da fonte. |
| Leitura por mês completo acima de cinco anos | Must | Sem ela, um terço da cobertura ficaria sem tabela. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `models/puericultura/calculadora.ts` | `CalculadoraCrescimentoInfantil` | 🟢 |
| `models/puericultura/tipos.ts` | Contratos e `ErroDeInvariante` | 🟢 |
| `models/puericultura/fonte-clinica.ts` | `REFERENCIAS`, `FRONTEIRAS`, cinco conjuntos de cortes, notas | 🟢 |
| `models/puericultura/validacao.ts` | `validarEntrada` | 🟢 |
| `models/puericultura/idades.ts` | `derivarIdades`, `ehPreTermo` | 🟢 |
| `models/puericultura/medidas.ts` | `derivarMedidas`, `converterPosicao`, `imcDe` | 🟢 |
| `models/puericultura/elegibilidade.ts` | `foraDoEscopo`, `perimetroCefalicoForaDoEscopo` | 🟢 |
| `models/puericultura/padrao.ts` | `escolherPadrao` | 🟢 |
| `models/puericultura/classificacao.ts` | `classificar`, `cortesDe` | 🟢 |
| `models/puericultura/datas.ts` | `paraDiasEpoch`, `diferencaEmDias` | 🟢 |
| `models/puericultura/oms/lms.ts` | `escoreZ`, `escoreLms`, `medidaEmZ` | 🟢 |
| `models/puericultura/oms/leitura.ts` | `lerLms`, `REPOSITORIO_OMS`, `conferirTabela` | 🟢 |
| `models/puericultura/oms/tabelas/*` | 14 módulos gerados + `manifesto.json` | 🟢 |
| `models/puericultura/intergrowth/equacoes.ts` | `mu`, `sigma`, `escalaDe` | 🟢 |
| `models/puericultura/intergrowth/escore.ts` | `escoreZPreTermo`, `medidaDoIndiceNoPreTermo` | 🟢 |

**Cobertura de testes:** 201 testes em 12 arquivos sob `tests/unit/dominio-puericultura/`
(aferido em 2026-07-28), mais o oráculo congelado de `tests/apoio/casos-oraculo-puericultura.json`.
