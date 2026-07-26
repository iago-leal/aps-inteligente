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

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso a cada `/reversa`. -->

## Arquivadas

<!-- Vazio. -->
