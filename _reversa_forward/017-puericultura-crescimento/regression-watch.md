# Regression watch: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Criado em: `2026-07-26` (execução parcial: Fase 1 + T029)
> Regra de leitura: o **watch principal** só recebe regras que eram 🟢 no legado e que esta
> feature alterou. Premissas 🟡 e itens sem peso de regressão vão para "Observações".

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-------------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/code-analysis.md` Módulo 10 — `interface/inicio` | O catálogo tem **quatro** seções, e `puericultura` é a quarta, com exatamente uma ficha | presença | A extração volta a descrever três seções, ou a seção nova aparece sem ficha |
| W002 | `_reversa_sdd/code-analysis.md` Módulo 10 — mapa de ícones | O mapa tem quatro pares e mantém o fallback `null` para seção sem entrada | presença | Fallback removido, ou seção nova sem ícone |
| W003 | `_reversa_sdd/architecture.md` §1 — camadas | Os scripts dev-time (`scripts/**`) não são importados por `models/**`, `interface/**` nem `pages/**` | ausência | Qualquer `import` de `scripts/` fora de `scripts/` |
| W004 | `_reversa_sdd/adrs/0002` — privacidade por construção | Nenhum `fetch` em código de aplicação; o único da feature vive em `scripts/baixar-tabelas-oms.mts` | ausência | `fetch`, `XMLHttpRequest` ou `storage` em `models/puericultura/**` ou `interface/puericultura/**` |
| W005 | Contrato de aquisição §6 — procedência | `models/puericultura/oms/tabelas/manifesto.json` existe, com 14 origens e 14 `sha256` distintos | presença | Manifesto ausente, incompleto, ou com hash repetido (indício de arquivo trocado na origem) |
| W006 | Contrato de aquisição §6 — idempotência | Rodar `node scripts/gerar-tabelas-oms.mts` sobre as mesmas origens deixa o `git diff` **vazio**; a segunda execução relata "14 já idênticos, 0 escritos" | reprodutibilidade | Diff não vazio sem mudança de `sha256` no manifesto — o gerador deixou de ser função determinística das origens, e a prova do §6 se perdeu |
| W007 | Contrato de aquisição §5, V7 — âncoras | Nos módulos emitidos: perímetro cefálico masculino em `Day 0` = `34.4618`; peso masculino em `Month 61` = `18.5057`; peso feminino em `Month 61` = `18.2579`; peso masculino em `Day 1856` = `18.4968` | presença | Qualquer um desses quatro valores diferente na saída — revisão silenciosa da tabela na origem, ou erro de recorte |
| W008 | Contrato de aquisição §5.2 — degraus de V5 | Os dois degraus declarados continuam presentes e dentro do limite: queda no `Day 1` do peso 2006 (≤ 2%) e no `Day 731` do comprimento/estatura 2006 (≤ 1,5%, medida −0,6715 cm) | presença | Degrau ausente, deslocado de dia, ou de magnitude fora do limite. O de 731 dias é a evidência independente de D-11 e D-16: perdê-lo desamarra a constante de 0,7 cm da fonte que a confirma |
| W009 | Contrato de aquisição §4.1 e D-04 — recorte | Os módulos gerados trazem só `unidade`, `inicio`, `fim`, `l`, `m` e `s`; **nenhuma coluna `SDn`**. O perímetro cefálico termina em `Day 730` e os demais em `Month 120` | ausência | Coluna de desvio embarcada (o oráculo de T008 é que responde por ela), ou faixa maior que o recorte — dado morto no bundle e tentação de extrapolar |
| W010 | `data-delta.md` §3.3 — ciclo de vida do dado | Os 14 módulos de `models/puericultura/oms/tabelas/` só mudam por reexecução do gerador; cada um declara "ARQUIVO GERADO … não editar à mão" no cabeçalho, com URL, data e `sha256` da origem | presença | Diff num módulo de dados sem diff correspondente no manifesto ou no gerador — edição à mão, que quebra a rastreabilidade do número até a fonte |
| W011 | Roadmap D-05 — as duas fronteiras dos cinco anos | `models/puericultura/oms/leitura.ts` lê por **dia** até 1856 e por **mês** de 1857 em diante, com `⌊1856/30,4375⌋ = 60` e `⌊1857/30,4375⌋ = 61`; a fronteira de **rótulo**, aos 1826 dias, não move a tabela e vive em `classificacao.ts` | presença | As duas fronteiras alinhadas num número só — o que produz ora rótulo trocado, ora buraco de cobertura de 30 dias —, ou a de rótulo migrando para a leitura |
| W012 | Roadmap D-15 (ficha `MD-0006`) — fronteira superior | 3682 dias lê o mês 120; 3683 devolve `sem-tabela` com motivo `IDADE_ACIMA_DA_COBERTURA`, para os três índices que chegam aos dez anos | presença | Recusa em 3682 (nega leitura que a fonte publica) ou leitura em 3683 (extrapola a última linha, contra `domain.md` §8) |
| W013 | Roadmap D-16 (ficha `MD-0006`) — fronteira dos dois anos | 730 dias lê o perímetro cefálico; 731 devolve `sem-tabela` com motivo `PERIMETRO_CEFALICO_ACIMA_DE_2_ANOS`, **sem afetar os demais índices**, que seguem lendo aos 731 dias | presença | Recusa global aos 731 dias, que derrubaria peso, comprimento e IMC junto com o PC — RN-08 exige recusa parcial |
| W014 | `data-delta.md` §3.2 — inventário do acervo | `REPOSITORIO_OMS` resolve as 14 combinações publicadas (8 por dia, 6 por mês) e devolve `null` para perímetro cefálico por mês, que a OMS não publica na faixa | presença | Combinação faltando (escore que deixa de existir sem aviso) ou perímetro cefálico por mês aparecendo do nada |
| W015 | Roadmap D-08 — acervo injetável | A leitura e a fachada aceitam `RepositorioDeTabelasOms` por parâmetro, com o real por omissão; nenhum teste de regra precisa carregar as 12.964 linhas | presença | Import direto das tabelas dentro do cálculo, que fecharia a porta de D-09 e obrigaria o teste a carregar o acervo inteiro |
| W016 | Contrato de aquisição §6 + `leitura.ts` — coerência do dado gerado | `conferirTabela` roda na montagem do acervo e recusa unidade trocada ou array mais curto do que a faixa declarada | presença | Guarda removida "porque nunca dispara": é justamente a que pega edição à mão de um módulo gerado, o único jeito de o dado mentir sem a geração ter falhado |
| W017 | `requirements.md` RF-06 (RN-01) — índices independentes | `IndiceAntropometrico` continua união de três variantes, e `ausente`/`fora-do-escopo` **não têm** campo `escoreZ` | ausência | Campo de escore promovido ao tipo comum, ou variante colapsada em objeto com campos opcionais: "não calculado" voltaria a poder ser lido como zero |
| W018 | T008 — a única cópia versionada dos oráculos | `tests/apoio/casos-oraculo-puericultura.json` existe, com 14 tabelas da OMS (356 casos, desvios de −4 a +4) e as 6 tabelas do INTERGROWTH-21st (38 semanas cada, 1596 células) | presença | Arquivo ausente, truncado, ou com bloco a menos. Ele é o que separa "a suíte se prova em clone limpo" de "a suíte se prova na máquina de quem tem `referencias/`" — e `referencias/` está fora do git |
| W019 | T008 — o congelado é gerado, não escrito | Rodar `node scripts/congelar-casos-oraculo.mts` sobre as mesmas fontes deixa o `git diff` **vazio**; o cabeçalho do arquivo declara `geradoPor` e o aviso de não editar à mão | reprodutibilidade | Diff no JSON sem diff correspondente no congelador ou no manifesto — edição à mão de um oráculo, que é o modo de falha mais perigoso possível: o número passa a confirmar a implementação em vez de julgá-la |
| W020 | Contrato de aquisição §5 — V6 para em ±3 | A reconstrução de V6 continua limitada a `SD3neg`…`SD3`; **não** se estende a `SD4neg`/`SD4` | ausência | V6 alcançando ±4: o gerador passaria a abortar em oito das catorze tabelas com dado íntegro, porque a OMS publica essas duas colunas já com a correção de cauda aplicada |
| W021 | `roadmap.md` D-10.1 — onde a cauda se prova | O teste da **não**-aplicação da cauda a C-E/I e PC/I corre sobre acervo sintético com `L ≠ 1`; o da aplicação a P/I e IMC/I corre sobre a coluna `SD4` real | presença | O par "aplica / não aplica" inteiro apoiado no dado real da OMS: ali `L = 1` iguala as duas regras (diferença de 1e-14) e o teste passa com a implementação certa **e** com a errada — um teste que não distingue nada, com aparência de rigor |
| W022 | `requirements.md` RN-04 a RN-07 — rótulos literais | Os rótulos de `fonte-clinica.ts` são a transcrição EXATA da caderneta, inclusive onde a concordância do original destoa: "Comprimento adequada para idade", "Baixa comprimento para idade", "Muito baixo comprimento para idade", "Peso elevado para idade" (sem artigo) e os três do perímetro cefálico com a SIGLA | redação | Rótulo "corrigido" para a norma culta, ou artigo acrescentado. A tela deixaria de coincidir com o documento impresso que o médico tem na mão, e a divergência apareceria como erro da ferramenta |
| W023 | `fonte-clinica.ts` + `classificacao.ts` — a segunda troca de rótulo | O índice de comprimento/estatura troca de SUBSTANTIVO aos 730 dias: "Comprimento" até lá, "Estatura" a partir de 731 — a mesma fronteira de D-16 | presença | Conjunto único para toda a faixa etária. O plano não previa esta troca (achado de T023), e perdê-la faria a tela chamar de "estatura" o que a caderneta chama de "comprimento" na criança de colo |
| W024 | `requirements.md` RN-06 — a troca de nomenclatura do IMC | Aos 1826 dias os três rótulos superiores deslizam um degrau: o que era "Sobrepeso" vira "Obesidade", "Obesidade" vira "Obesidade grave" e "Risco de sobrepeso" vira "Sobrepeso". Os três inferiores não mudam | presença | Conjunto único de rótulos do IMC, ou troca deslocada para 1856 dias (a fronteira de TABELA). É a armadilha central da fonte: errá-la produz laudo nutricional trocado sem que nenhum número pareça errado |
| W025 | `roadmap.md` D-10 — a quem a cauda se aplica | `INDICES_COM_CORRECAO_DE_CAUDA` contém exatamente `peso-idade` e `imc-idade`, e é lista de dados, não `if` espalhado | presença | Índice acrescentado ou removido da lista. Acrescentar estatura ou perímetro cefálico é clinicamente inócuo (ali `L = 1` iguala as regras), mas remover peso ou IMC desloca o escore em até 10,4 unidades justamente na desnutrição e na obesidade graves |
| W026 | `calculadora.ts` — as duas idades governam coisas diferentes | A idade CRONOLÓGICA (`idades.diasDeVida`) governa a posição de medida esperada; a que INDEXA a curva (`diasCorrigidos`, corrigida enquanto a correção vale) governa leitura, escopo e faixa de rótulo | presença | As duas colapsadas numa só. Num prematuro com correção ativa, usar a corrigida para a posição faria a régua de aferição atrasar semanas; usar a cronológica para a curva anularia a correção que RN-16 manda aplicar |
| W027 | `roadmap.md` D-01 — a régua se escolhe num lugar só | `padrao.ts` é o único módulo que decide entre INTERGROWTH-21st (27 ≤ pós-menstruais ≤ 64) e OMS, e a escolha é por CRIANÇA, nunca por índice | presença | Decisão de régua replicada dentro do cálculo de algum índice, ou resultado em que índices declaram padrões diferentes. O invariante property-based que vigia isso ("nenhum resultado mistura as duas réguas") é o guarda desta linha |
| W028 | `requirements.md` RN-16 — os limites da correção de idade | A correção vale enquanto `diasDeVida ≤ 730`, ou `≤ 1095` quando a IG ao nascer for < 28 semanas; passado o limite, a leitura volta à idade cronológica pura e o desconto continua declarado | presença | Limite ausente (prematuro carregando desconto pela vida inteira), trocado de unidade, ou a extensão do terceiro ano estendida a toda prematuridade em vez de só à IG < 28 semanas |
| W029 | `requirements.md` RN-17 — o IMC no pré-termo | Na janela do INTERGROWTH-21st, o índice de IMC sai `ausente` com motivo `IMC_INEXISTENTE_NO_PRETERMO`, jamais `MEDIDA_NAO_INFORMADA` e jamais erro | presença | Motivo colapsado no de medida ausente, o que diria ao prescritor que faltou informar algo; ou IMC calculado na janela, que inventaria índice onde a fonte não publica |
| W030 | `requirements.md` RN-11 — as faixas de plausibilidade travam | Medida fora da faixa antropométrica (peso ≤ 150 kg, comprimento 20–200 cm, PC 20–70 cm) é OFENSOR, e não valor clampado com aviso como no molde da feature 014 | presença | Adoção do clamp da 014 por simetria de estilo. Aqui a faixa é de plausibilidade, não de validação de equação: clampar 200 kg para 150 devolveria escore extremo com aparência de cálculo |
| W031 | `_reversa_sdd/domain.md` §7 invariante 1 — domínio puro, agora testado | `invariantes.test.ts` varre `models/puericultura/**` e falha se algum arquivo importar de fora do domínio, mencionar React/Next/Primer, ou ler o relógio (`Date.now()`, `new Date()` sem argumento, `process.env`, `fetch`) | ausência | Teste removido ou varredura que deixe de achar arquivos (a guarda de sanidade exige ≥ 20). Um teste de fronteira que varre pasta vazia passa dizendo o contrário do que se quer provar |
| W032 | `calculadora.ts` — o escopo precede o preenchimento | Numa criança acima de 730 dias, o perímetro cefálico sai `fora-do-escopo` mesmo quando a medida não foi informada | presença | Ordem invertida, devolvendo `MEDIDA_NAO_INFORMADA`: sugeriria ao prescritor que ele deveria ter informado o perímetro cefálico de uma criança de três anos, quando a caderneta simplesmente não o classifica nessa idade |
| W033 | `roadmap.md` D-11 — o aviso da conversão alcança dois índices | O aviso `CONVERSAO_DE_POSICAO_APLICADA` acompanha o índice de comprimento/estatura **e** o de IMC, porque ambos consomem a medida convertida; o de peso não o carrega | presença | Aviso pendurado só na estatura. O IMC teria mudado de valor sem que a tela dissesse por quê |
| W034 | T012 — o empate de arredondamento nomeado | O teste do INTERGROWTH-21st nomeia a única célula das 1596 que excede 0,005 (peso masculino, semana 55, `z = −3`: publicado 4,40, calculado 4,40503) e exige que ela seja a única | presença | Tolerância global afrouxada para acomodá-la. Uma folga maior passaria a acomodar também coeficiente errado, que é o que esta conferência existe para vigiar |
| W035 | `requirements.md` RF-13 (RN-14) — proveniência fora do painel | O bloco de proveniência é irmão do painel de resultado, nunca filho, e está no DOM **desde o primeiro carregamento**, antes de existir escore | presença | Bloco migrado para dentro do `aside` de resultado, ou renderizado só depois de avaliar. Os limites do que a ferramenta pode afirmar valem para quem ainda vai digitar, e um bloco que só aparece com o número já está tarde |
| W036 | `requirements.md` RF-15 (RN-13) — sem ritual de revisão | A tela de crescimento não tem **nenhum** `checkbox` no DOM, antes ou depois de avaliar; o botão de ação nunca é gated por confirmação | ausência | Qualquer `checkbox` na tela. O ritual é da insulina, onde há dose a conferir; classificar crescimento informa, não prescreve, e importar o ritual por simetria de estilo confundiria as duas coisas |
| W037 | `roadmap.md` D-13 — como o escore chega à tela | O escore z é exibido com **uma casa decimal e sinal sempre explícito**, inclusive no zero (`+0.0`); o valor não arredondado permanece intacto no objeto de saída | redação | Escore exibido cru (ruído de ponto flutuante), com duas casas (precisão que a leitura clínica não usa) ou sem o `+` no positivo — que convida a leitura apressada a supor o lado |
| W038 | `interface/puericultura/resultado.tsx` — a tela não reimplementa fronteira | O título do bloco de comprimento/estatura é **neutro** ("Comprimento/estatura para a idade"); o substantivo correto para a idade vem apenas do rótulo literal que o domínio devolve | ausência | Título trocando de substantivo por conta própria em função da idade. Seria a segunda implementação da fronteira dos 730 dias, na camada mais livre para divergir do motor |
| W039 | `requirements.md` RNF de acessibilidade — a tela nova nasce limpa | `/puericultura/crescimento` tem **zero** violação axe, antes e depois do resultado, e `e2e/axe-baseline.json` permanece **sem entrada** para ela | presença | Entrada nova no arquivo de linha de base para a rota de crescimento. A linha de base existe para tolerar dívida herdada; registrar zero nela só cria o lugar onde afrouxá-la depois |
| W040 | `roadmap.md` D-09 — isolamento de custo por rota | O *first load* das sete rotas existentes não cresce com a feature: medido em T049, bruto **idêntico byte a byte**. Só `/puericultura/crescimento` paga as tabelas | presença | Qualquer rota existente crescendo numa medição futura — sinal de que o dado vazou do *code-splitting*, e o caso em que a porta de D-08 (repositório injetável) deve ser usada para migrar à carga dinâmica |
| W041 | `vitest.config.ts` — cobertura sem exceção | `coverage.include` continua `["models/**"]`, **sem exclusão** dos módulos de dados gerados, e os limites seguem em 90 nas quatro métricas | ausência | Exclusão acrescentada ou limite rebaixado. T050 previa a exceção como possibilidade e ela não foi necessária: o dado gerado é integralmente coberto por ser importado. Rebaixar o limite depois disso seria ajuste sem causa |

## Observações (sem peso de regressão)

- **Estado intermediário assumido.** O catálogo já anuncia `/puericultura/crescimento`, rota que
  ainda não existe (T045 pendente). É consequência da regra de anti-drift do README, que manda o
  catálogo vir primeiro; some quando a fase de integração fechar.
- **D-15 e D-16 ainda não têm código.** As fronteiras de 3683 dias e de 730 dias estão decididas
  e documentadas, mas os testes de limite (T011, T015, T016) e o domínio que as aplica são das
  fases seguintes. Nada a vigiar até lá.
- **`tsconfig.json` com `allowImportingTsExtensions`.** Vale só sob `noEmit`. Se algum dia o
  projeto passar a emitir com `tsc`, a opção precisa sair junto com a extensão nos imports.
- **Coeficientes do INTERGROWTH-21st (MD-0002).** Antes 🟡 por procedência indireta, agora
  conferidos contra as 1596 células das tabelas oficiais. Ganham peso de regressão quando o
  código que os usa existir (T035): o teste de T012 é que os prenderá.
- **Premissas clínicas 🟡 do plano** (roadmap §4, incluída a nova de leitura no mês 120) seguem
  como estão, no precedente de `architecture.md` §6, dívida 5.

Acrescentado na rodada de 2026-07-27 (T030 a T033):

- **O recorte de D-04 deixou de ser promessa e passou a ser propriedade do dado.** Não há, nos
  módulos embarcados, uma linha que a caderneta não cubra: o perímetro cefálico para em 730 dias
  e os demais índices, no mês 120. A verificação de elegibilidade de T027 continua necessária,
  mas agora tem o dado do seu lado — não existe linha para extrapolar.
- **Duas premissas do plano ganharam confirmação independente.** O degrau de −0,6715 cm no dia
  731 da tabela de comprimento/estatura confirma, pelo próprio dado da OMS, a constante de 0,7 cm
  (RF-08, D-11) e a fronteira dos dois anos (D-16), que até aqui vinham só da leitura da
  caderneta. Não muda a confidência formal das fichas, mas reduz o risco de as duas estarem
  erradas juntas.
- **Dívida de higiene, alheia à feature:** `npm run format:check` acusa 544 arquivos fora de
  formato, quase todos documentação pré-existente do Reversa e testes anteriores à 017. Não é
  gate do CI (que roda `lint`, `typecheck` e `test`) e não é regressão desta rodada. Vale um
  ticket de manutenção próprio, com `--write` de uma vez, fora do escopo desta feature.
- **`models/**` cresceu 376 kB de dado gerado.** Isso vai distorcer a métrica de cobertura
  (T050) e o teto de 400 linhas por arquivo (T052). As duas ações já preveem a exceção; o que
  não pode acontecer é o limite ser ajustado em silêncio.

Acrescentado na segunda rodada de 2026-07-27 (T020, T034, T007, T011):

- **Supera a observação anterior "D-15 e D-16 ainda não têm código".** Passaram a ter, e a vigiá-las
  agora são W012 e W013, com teste em `leitura-oms.test.ts`. A observação fica registrada como
  estava, sem reescrita, para que a leitura do documento acompanhe o andamento real.
- **O plano descreve as entidades com uma forma; o código precisou de outra, em três pontos.**
  O discriminante do índice antropométrico é `estado`, não `tipo` (a saída da fachada mantém
  `tipo`, como nos quatro domínios existentes); `idadeUsada` é objeto com espécie, valor, unidade
  e desconto, porque RF-20 pede a idade **com** o desconto; e a idade gestacional ao nascer é
  campo opcional, e não `… | null`. As três são de forma, sem efeito de comportamento, e cabem ao
  `/reversa-sync` reconciliar no `data-delta.md` §2. Sem peso de regressão até lá.
- **Achado de aritmética em D-05, registrado para a re-extração.** O roadmap chama a fronteira de
  tabela de "61 meses (1856 dias)", como se os dois fossem o mesmo ponto; `⌊1856/30,4375⌋` é 60.
  O encaixe real é 1856 (última linha de 2006) → 1857 (primeira do mês 61 de 2007), e é o que o
  código faz. A decisão não muda, apenas o modo de enunciá-la — mas quem reler D-05 sem esta nota
  pode concluir que o código diverge do plano, e não diverge.
- **A cobertura de `models/**` ainda não foi medida com o domínio novo.** O dado gerado continua
  fora de qualquer suíte, e T050 é que decide se ele sai do `include` — por decisão registrada,
  nunca por ajuste silencioso do limite.

Acrescentado na terceira rodada de 2026-07-27 (T008):

- **Supera a observação "Coeficientes do INTERGROWTH-21st (MD-0002)" quanto à durabilidade.** As
  1596 células deixaram de existir só em `referencias/intergrowth/` e estão versionadas no
  congelado. O peso de regressão continua a chegar com T035 e T012, como dizia a observação
  original; o que mudou é que a fonte contra a qual comparar não some mais num clone limpo.
- **Duas tolerâncias, e confundi-las afrouxa o teste em uma ordem de grandeza.** Na escala da
  medida, 5e-4 (metade da última casa publicada). Em `z`, 3e-3 — o dobro do pior desvio observado
  nas 14 tabelas, porque o arredondamento da medida se amplifica por `1/(M·S)` ao virar escore.
  T010 deve ler `oms.toleranciaEmZ` do próprio arquivo, e não repetir o número no teste.
- **O ramo `L = 0` da LMS não existe no dado real.** Nenhuma das 14 tabelas tem linha com `L = 0`
  (o mínimo em módulo é 0,0631, no IMC feminino). O ramo logarítmico só se exercita com o acervo
  sintético de T007, e nenhuma quantidade de dado real da OMS o cobrirá.
- **`pdftotext` é dependência de ambiente do congelamento, não do projeto.** Ela é exigida uma
  vez, para extrair os PDFs do INTERGROWTH-21st, e nunca em teste, build ou runtime. O congelador
  falha com a instrução de instalar o poppler, em vez de congelar tabela pela metade. Quem regerar
  o arquivo numa máquina nova precisa dela; quem só roda a suíte, não.
- **O oráculo externo do plano foi dispensado, e a perda está nomeada** (ficha `MD-0010`). Não há
  checagem cruzada por implementação independente da leitura que fazemos da LMS. O que cobre a
  lacuna é o próprio congelamento, que reprova antes de escrever se a fórmula divergir da fonte em
  qualquer dos 3204 pares. Reavaliar se aparecer oráculo que não seja reimplementação da regra.

### Acrescentadas na rodada do motor (2026-07-27)

- **Premissa 🟡 nova: os três anos da correção estendida valem 1095 dias.** RN-16 fala em "3
  anos" e a ficha `MD-0006` só traduzira em dias a fronteira dos dois. Adotou-se a mesma
  disciplina — ano de 365 dias corridos, não data civil de aniversário —, de modo que as duas
  fronteiras da mesma regra se meçam na mesma unidade. Fica a validar pelo prescritor; o efeito
  prático é de até um dia, em bissexto.
- **Premissa 🟡 nova: a idade cronológica governa a posição de medida no prematuro.** A caderneta
  diz que "crianças menores de 2 anos devem ser medidas deitadas", sem dizer se o corte é de idade
  cronológica ou corrigida. Adotou-se a cronológica, por ser regra de aferição sobre o corpo da
  criança, e não sobre a curva. A alternativa mudaria a posição esperada de um prematuro em até
  três meses.
- **O IMC dos casos-oráculo é construído, não medido.** Em `casos-oraculo.test.ts`, o IMC alvo é
  obtido com 100 cm de comprimento, o que faz o denominador valer 1 m² e o IMC igualar-se
  numericamente ao peso. É artifício de teste, legítimo porque a validação só exige
  plausibilidade, mas quem ler o arquivo procurando casos clínicos realistas não os encontrará ali.
- **A varredura de fronteira arquitetural é textual, não semântica.** `invariantes.test.ts` casa
  expressões regulares contra o código-fonte. Pega o que se quer pegar hoje (import externo,
  menção a framework, leitura de relógio) e não pegaria uma violação escrita de forma criativa —
  `globalThis["Da"+"te"].now()`, por exemplo. É guarda de disciplina, não barreira contra malícia.

### Acrescentadas na rodada da integração e do polimento (2026-07-28, T040 a T052)

- **Supera a observação "estado intermediário assumido".** A rota `/puericultura/crescimento`
  existe desde T045, e o cartão do catálogo deixou de apontar para o vazio. A observação original
  fica registrada como estava, sem reescrita, para que o documento acompanhe o andamento real.
- **Supera a observação "`models/**` cresceu 376 kB de dado gerado".** As duas consequências
  previstas foram medidas, e nenhuma exigiu ajuste: a cobertura ficou em 97,02% de statements
  **sem** exclusão alguma (os módulos de dados são cobertos por serem importados — só exportam
  literais), e o teto de 400 linhas foi excedido apenas pelos seis módulos de tabela, com a
  exceção agora **escrita no README** e delimitada a `models/puericultura/oms/tabelas/`. O que a
  observação temia — limite ajustado em silêncio — não aconteceu porque não houve ajuste.
- **D-09 pode ser promovida de 🟡 a 🟢 no `/reversa-sync`.** A premissa nasceu amarela por depender
  de medição, e a medição de T049 a confirmou: as sete rotas existentes têm *first load* bruto
  idêntico byte a byte, e o custo das tabelas (+80,3 kB gzip) ficou inteiro na rota que o criou.
  O registro completo está em `medicao-bundle.md`.
- **Achado de ferramenta: o `next build` não publica mais o *First Load JS*.** O Next 16 com
  Turbopack imprime só a lista de rotas e o modo de renderização. A comparação que D-09 exige foi
  reconstruída de `.next/build-manifest.json`, somando os chunks por rota — método mais confiável
  de todo modo, porque mede o artefato. Quem repetir a medição no futuro não deve procurar a
  tabela antiga: ela não volta.
- **Achado de ambiente, que quase virou falso alarme de regressão.** A primeira execução do e2e
  falhou em 35 dos 36 testes, inclusive os pré-existentes. A causa não era código: o Playwright
  reutilizou (`reuseExistingServer` fora do CI) um `next-server` de quatro horas antes, servindo
  build velho. Encerrado o processo, tudo passou. Vale a regra: **e2e vermelho em bloco, incluindo
  testes que a rodada não tocou, é suspeita de servidor obsoleto na porta 3000, não de regressão.**
- **Os componentes de tela excedem as 50 linhas por função, e isso é precedente, não novidade.**
  `FormularioCrescimento` tem 226 linhas e `PainelCrescimento`, 108 — como já ocorre em
  `FormularioRiscoCardiovascular` (174) e `PainelRiscoCardiovascular` (113). O corpo é JSX
  declarativo; o teto de função mira lógica, e a lógica está nos `models/`, onde a maior função
  tem 40 linhas. Fica declarado em vez de silencioso, e é candidato a subcomponentes se algum
  desses corpos voltar a crescer.
- **Dívida corrigida de outra feature.** A tabela de rotas do README omitia a calculadora de risco
  cardiovascular desde a 014. Foi acrescentada junto com a quinta, porque um índice de rotas que
  esconde uma delas engana mais do que ajuda.
- **A dívida de higiene do `format:check` continua aberta**, e continua alheia à feature: são
  arquivos de documentação pré-existente do Reversa, fora do gate do CI. Segue valendo o ticket
  próprio com `--write` de uma vez.

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso a cada `/reversa`. -->

## Arquivadas

<!-- Vazio. -->
