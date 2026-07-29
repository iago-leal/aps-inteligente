# `models/puericultura` — Tarefas de Implementação

> Sequência para reimplementar a unit a partir do legado, com rastreabilidade ao código
> original. Reversa Writer, re-extração nº 4 (2026-07-28).

## Pré-requisitos

- [ ] Runtime TypeScript com `strict` ligado; nenhuma dependência externa é necessária.
- [ ] Acesso às planilhas de referência da OMS (padrões de 2006 e referência de 2007), que
      ficam **fora do git** em `referencias/` e são a origem dos módulos gerados.
- [ ] Exemplar da Caderneta da Criança (MS, 2.ª ed., 2020), pp. 85–97, para conferir os
      rótulos transcritos.
- [ ] Oráculo congelado em `tests/apoio/casos-oraculo-puericultura.json`, que permite rodar a
      suíte em clone limpo, sem rede e sem as fontes.

## Tarefas

- [ ] T-01, Declarar os contratos da unit: `EntradaAvaliacao`, `IdadesDerivadas`, os três
      estados de índice, as três variantes de saída e `ErroDeInvariante`.
  - Origem no legado: `models/puericultura/tipos.ts`
  - Critério de pronto: o discriminante da saída é `tipo` e o do índice é `estado`; nenhum
    campo de entrada identifica a criança.
  - Confiança: 🟢

- [ ] T-02, Transcrever a fonte clínica: as cinco listas de cortes, as fronteiras em dias, a
      janela do pré-termo, a conversão de posição, as referências por página e as duas notas.
  - Origem no legado: `models/puericultura/fonte-clinica.ts`
  - Critério de pronto: cada corte declara `acimaDe`, `aPartirDe` ou `abaixoDeTudo`; os
    rótulos batem com o impresso, salvo os dois de concordância corrigida, e a correção vem
    declarada em constante própria.
  - Confiança: 🟢

- [ ] T-03, Implementar a aritmética de datas em dias epoch UTC (`paraDiasEpoch`,
      `diferencaEmDias`), recusando data malformada com `null`.
  - Origem no legado: `models/puericultura/datas.ts`; ADR 0013
  - Critério de pronto: nenhuma passagem por fuso horário local; `2024-02-29` é aceita e
    `2023-02-29` não.
  - Confiança: 🟢

- [ ] T-04, Implementar a validação por coleta total, com os dez códigos de ofensor.
  - Origem no legado: `models/puericultura/validacao.ts`
  - Critério de pronto: entrada com três problemas devolve três ofensores; comprimento sem
    posição produz `POSICAO_DA_MEDICAO_AUSENTE`.
  - Confiança: 🟢

- [ ] T-05, Derivar as três idades, com o desconto de prematuridade e as duas fronteiras da
      correção (730 dias, ou 1.095 quando a IG ao nascer for inferior a 28 semanas).
  - Origem no legado: `models/puericultura/idades.ts`
  - Critério de pronto: IG ausente produz desconto zero e pós-menstrual nula; nascida a termo
    com IG informada, idem.
  - Confiança: 🟢

- [ ] T-06, Implementar a conversão de posição e o IMC sobre a medida já convertida.
  - Origem no legado: `models/puericultura/medidas.ts`
  - Critério de pronto: deitado acima de 730 dias subtrai 0,7 cm; em pé abaixo de 730 soma;
    posição igual à esperada não gera aviso.
  - Confiança: 🟢

- [ ] T-07, Implementar a elegibilidade nas duas espécies: recusa global e recusa parcial do
      perímetro cefálico.
  - Origem no legado: `models/puericultura/elegibilidade.ts`
  - Critério de pronto: a parcial devolve a variante de **índice** e por isso não derruba o
    resultado; a global devolve a variante de **saída**.
  - Confiança: 🟢

- [ ] T-08, Implementar a escolha da régua como ponto único de fronteira.
  - Origem no legado: `models/puericultura/padrao.ts`
  - Critério de pronto: 27 ≤ pós-menstrual ≤ 64 escolhe INTERGROWTH-21st; abaixo de 27 lança,
    porque a recusa cabia à elegibilidade; nenhum resultado mistura padrões entre índices.
  - Confiança: 🟢

- [ ] T-09, Gerar os 14 módulos de tabelas da OMS a partir das planilhas, com `manifesto.json`
      registrando `sha256`, `url` e data de download de cada origem.
  - Origem no legado: `scripts/gerar-tabelas-oms.mts`; `models/puericultura/oms/tabelas/`
  - Critério de pronto: reexecução com as mesmas origens produz `git diff` vazio.
  - Confiança: 🟢

- [ ] T-10, Implementar a leitura das tabelas: seleção de unidade e chave, busca aritmética
      pela posição, e conferência de coerência do dado gerado.
  - Origem no legado: `models/puericultura/oms/leitura.ts`
  - Critério de pronto: até 1.856 dias lê-se o dia; acima, o mês completo `⌊dias/30,4375⌋`;
    nenhuma interpolação; tabela com unidade trocada faz `conferirTabela` lançar.
  - Confiança: 🟢

- [ ] T-11, Implementar o escore LMS e a correção de cauda, com a lista de índices alcançados
      como dado.
  - Origem no legado: `models/puericultura/oms/lms.ts`
  - Critério de pronto: `L = 0` usa o ramo logarítmico; fora de ±3 nos dois indicadores de
    peso, o escore é extrapolado no passo `SD3 − SD2`.
  - Confiança: 🟢

- [ ] T-12, Implementar as curvas INTERGROWTH-21st como equações fechadas, com escala
      logarítmica no peso e no comprimento, e declarar o IMC inexistente nessas curvas.
  - Origem no legado: `models/puericultura/intergrowth/{equacoes,escore}.ts`
  - Critério de pronto: conferência contra o oráculo congelado; `medidaDoIndiceNoPreTermo`
    devolve `inexistente` para o IMC.
  - Confiança: 🟢

- [ ] T-13, Implementar a classificação por índice e faixa etária, com as duas trocas de
      conjunto (substantivo aos 2 anos, nomenclatura do IMC aos 5).
  - Origem no legado: `models/puericultura/classificacao.ts`
  - Critério de pronto: z = +2,5 devolve "Sobrepeso" aos 4 anos e "Obesidade" aos 6; escore
    não finito lança.
  - Confiança: 🟢

- [ ] T-14, Montar a fachada, encadeando validação, datação, escopo, medidas, régua e os
      quatro índices, e produzindo notas, proveniência e referências.
  - Origem no legado: `models/puericultura/calculadora.ts`
  - Critério de pronto: resultado sem referência lança; o aviso da conversão aparece nos dois
    índices que consomem a medida convertida.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Conferência contra o oráculo congelado, nas duas réguas (`casos-oraculo.test.ts`).
- [ ] TT-02, Fachada nas três variantes de saída e nas três espécies de estado de índice.
- [ ] TT-03, Recusas: global por idade, global por pós-menstrual e parcial do perímetro
      cefálico, esta última provando que os demais índices sobrevivem.
- [ ] TT-04, Fronteiras: 730, 1.826, 1.856, 3.682 dias e 27/64 semanas, cada uma testada nos
      dois lados.
- [ ] TT-05, Correção de cauda, incluindo o acervo sintético com `L ≠ 1` que prova a não
      aplicação em comprimento e perímetro cefálico.
- [ ] TT-06, Validação: os dez códigos de ofensor e a coleta total.
- [ ] TT-07, Invariantes por propriedade: todo índice calculado tem referência, e todo
      resultado tem lista de referências não vazia.
- [ ] TT-08, Conversão de posição nos dois sentidos, com o aviso presente nos dois índices.

> Aferido em 2026-07-28: 201 testes em 12 arquivos sob `tests/unit/dominio-puericultura/`.

## Tarefas de Migração de Dados

Não se aplica: a unit não persiste nada. O único "dado" é o acervo tabular embarcado, coberto
por T-09.

## Ordem Sugerida

1. T-01 a T-03 primeiro: contratos, fonte e datas são a base de todo o resto.
2. T-04 e T-05 em seguida, porque a fachada depende da validação vencida e das idades.
3. T-09 antes de T-10, que antes de T-11: sem acervo não há leitura, e sem leitura não há
   escore pela OMS.
4. T-12 é independente do ramo da OMS e pode correr em paralelo a T-09/T-10/T-11.
5. T-13 depende só de T-02.
6. T-14 por último, e é ela que fecha os invariantes de TT-07.

## Lacunas Pendentes (🔴)

Nenhuma que impeça a reimplementação. As premissas clínicas abertas estão em `questions.md`,
e nenhuma delas altera a estrutura do motor: todas dizem respeito a valores de fronteira ou a
limites de plausibilidade.
