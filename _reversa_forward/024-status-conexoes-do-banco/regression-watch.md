# Regression watch — feature 024, o healthcheck passa a dizer quanto do banco está em uso

> Identificador: `024-status-conexoes-do-banco`
> Data: 2026-08-10
> Origem: a seção "Modificadas" de `legacy-impact.md`, mais as duas vigilâncias que a T024 abriu

O que esta lista vigia não é a feature: é o que precisa continuar **verdadeiro** depois dela. Cada
item nasceu de uma regra que a entrega alterou ou criou, e diz o sinal pelo qual a próxima extração
reconhece que ela deixou de valer.

O **W001** nasceu vermelho, na passagem de codificação, e fechou verde na passagem de reconciliação
de 10/08: o corpo publicava `tetoDeConexoes`, e hoje publica `teto_de_conexoes`. O registro do
defeito e da decisão que o desfez está em `legacy-impact.md`, seção "Pendência resolvida"; o item
permanece na lista principal, e não entre as observações, porque a regra que ele vigia é de contrato
externo, não premissa.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após a mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | `interfaces/http-get-api-v1-status.md`, "Campos novos"; RF-01, RF-02; `openapi/status.yaml` `BancoIntegro` | Os três campos chegam ao corpo como `teto_de_conexoes`, `conexoes_abertas` e `versao`, em `snake_case`, como toda chave publicada por esta API. Os nomes vêm de `LeituraDeSaude`, que por isso se declara em `snake_case` contra a convenção do módulo: pela D-08 o tipo **é** a forma de fio | presença | O corpo servido divergir dos nomes do contrato; o esquema deixar de validar o corpo real do alvo íntegro; `npm run status:conferir` responder `ocupação desconhecida` contra um deploy posterior a esta entrega |
| W002 | `interfaces/conexao-banco.md` §2; RN-02; roadmap D-04 | Os três campos existem **apenas** no ramo íntegro, e a garantia é de tipo, não de condicional: no degradado eles ficam ausentes, nunca zerados nem nulos | ausência | `teto_de_conexoes: 0` ou `versao: null` num corpo degradado; campos promovidos a opcionais no mesmo nível do discriminante; `if` em runtime substituindo a assimetria do tipo |
| W003 | `interfaces/http-get-api-v1-status.md`, campo `conexoes_abertas`; RN-08; premissa P-03 do plano | A contagem tem **piso um**, porque a própria requisição mantém conexão aberta enquanto apura, e um vale banco ocioso, não banco vazio. A contagem jamais excede o teto publicado | presença | Zero publicado com o banco de pé, sinal de que a contagem passou a apurar universo diferente do declarado; contagem maior que o teto, sinal de que os dois números deixaram de vir da mesma ida (ver W013) |
| W004 | `interfaces/conexao-banco.md` §1, exigência 1; RN-06; roadmap D-03 | A versão nasce de `current_setting('server_version')` e sai sanitizada ao prefixo numérico. **`version()` permanece proibida pelo nome**: ela devolve o produto, a arquitetura e o compilador, e casa com `/postgres/i` da denylist | ausência | Aparecimento de `version()` em `infra/database.ts`; `banco.versao` com letra, parêntese ou nome de distribuição; cadeia sem prefixo numérico publicada em vez de reprovar a leitura |
| W005 | `interfaces/conexao-banco.md` §1; RN-01; roadmap D-01 | A apuração acontece na **mesma ida** da verificação de saúde: uma consulta, quatro colunas, com o parâmetro `$1` preservado e o repasse de `opcoes` intacto | ausência | Segunda chamada a `query()` dentro de `saude()`; consulta em paralelo para apurar um dos valores; view ou função criada no banco, que exigiria esquema num projeto que não tem |
| W006 | `interfaces/conexao-banco.md` §1, exigência 2; RN-08; roadmap D-02 | A contagem filtra por `datname = current_database()`, e o teto sai de `current_setting('max_connections')`. Os dois universos são declarados no contrato porque **não coincidem** | presença | Filtro removido, fazendo o número descrever a instância inteira; teto lido da pilha de conexões da aplicação, que é cinco, e não do servidor (RN-09) |
| W007 | `interfaces/conexao-banco.md` §1, tabela de validação; RN-03; roadmap D-05 | Coluna fora de formato reprova a verificação inteira com causa **`consulta`**. `CausaDeErroDeBanco` permanece com quatro valores | ausência | Quinta causa acrescentada sem contrato atualizado; estatística ausente tolerada, publicando corpo íntegro incompleto; reprovação silenciosa que vira valor degradado sem passar pelo erro |
| W008 | `interfaces/conexao-banco.md` §3; roadmap D-08 | `pages/api/v1/status.ts` continua **sem linha executável** sobre os campos: insere o valor de `verificarBanco()` inteiro sob a chave `banco` | ausência | Composição, renomeação ou formatação dos campos no handler; conhecimento do banco espalhado por uma camada que não o tem |
| W009 | `interfaces/http-get-api-v1-status.md`, "Denylist"; RN-05; roadmap D-07 | A denylist é aferida sobre o corpo **serializado** dos dois alvos, item por item, e nenhum item é revogado nem migra para aferição campo a campo | presença | Padrão removido de `DENYLIST` ou de `DENYLIST_DE_CONEXAO`; aferição trocada do corpo inteiro pelo campo isolado; bloco do alvo degradado suprimido |
| W010 | `openapi/status.yaml`, `BancoIntegro`; RF-09; roadmap D-09 | Os três campos são **obrigatórios** no ramo íntegro, e `additionalProperties: false` permanece nos dois ramos. O esquema valida o corpo real dos dois alvos | presença | Campos rebaixados a opcionais, descrevendo estado que o código não produz; `additionalProperties` afrouxado para acomodar divergência de nome (ver W001) |
| W011 | `interfaces/http-get-api-v1-status.md`, consumidores; RF-11; roadmap D-10 | O conferidor lê os três campos como **opcionais**: ausência é desconhecido, jamais erro de apuração, e os códigos de saída seguem respondendo à defasagem | presença | Campo ausente produzindo saída 2; `--exigir-saudavel` mudando a semântica dos códigos; percentual no lugar da razão `abertas/teto`, que afirmaria taxa exata onde os universos diferem |
| W012 | `infra/saude.ts`; `legacy-impact.md`, "Módulo 14" | O ramo íntegro publica **exatamente** o que `LeituraDeSaude` declara, e nada mais. Como o adaptador espalha a leitura, todo campo acrescentado ao tipo chega ao corpo público sem uma linha de mudança na camada HTTP | presença | `host`, `datname`, duração ou qualquer campo de conveniência acrescentado a `LeituraDeSaude` e aparecendo na resposta; conjunto de chaves do ramo íntegro deixando de ser aferido por igualdade exata na suíte de contrato |
| W013 | roadmap **D-11** (🟢 desde 2026-08-11); RN-09; ação T024 | O teto publicado é o do servidor que de fato atendeu. **Observado no primeiro deploy**, sobre o commit `08636e3`: `teto_de_conexoes: 112` contra `conexoes_abertas: 1`, centena baixa e não milhar, de modo que a rota fala com a instância de cálculo e os dois números descrevem a mesma camada. O item permanece vigente para vigiar mudança de ordem de grandeza, que sinalizaria agrupador entrando no caminho | observação pós-deploy | Teto de ordem incompatível com a contagem do mesmo corpo; contagem excedendo o teto em produção, que seria a prova de que os dois números descrevem camadas diferentes e quebraria a asserção de não-excedência do W003 sem defeito de código |
| W014 | roadmap **D-07**; RN-05; ação T024 | O falso positivo teórico do padrão `/54(32\|33)/` da denylist permanece **registrado, e não corrigido**: um teto que contivesse `5432` reprovaria a suíte sem vazamento algum. Enfraquecer a guarda para acomodá-lo seria trocar privacidade verificada por conveniência | redação | O padrão removido, comentado ou restrito para acomodar um número; varredura confirma que 5432, 5433, 15432, 54320 e 54331 reprovam, enquanto 100, 450 e 901 passam |

## Observações

Sem peso de regressão. Vigiam premissas que não eram 🟢 no legado, dívida herdada que esta feature
encontrou e não podia quitar, ou desvios de execução que o `actions.md` já registra.

| ID | O que é | Por que fica de fora do watch |
|---|---|---|
| O-24-01 | A T005 pedia a interpretação da linha como função pura **exportada**, e o código a manteve embutida em `saude()`, com dois auxiliares privados | Desvio de forma resolvido por decisão registrada, e não por refatoração: a D-12 do roadmap fixa a forma embutida, porque exportar só para testar alargaria a superfície pública do módulo em troca de nada. As cinco validações existem, são exercitadas por `vi.importActual`, e a T010 seguiu o código |
| O-24-02 | A unidade da interpretação mora em `tests/unit/infra/saude.test.ts`, alcançada por `vi.importActual`, e não em `tests/unit/infra/database.test.ts` como a T010 previa | O §4 do contrato interno já nomeia `saude.test.ts`, de modo que o resultado é coerente com o contrato e discrepante do plano. Nenhuma prova se perdeu |
| O-24-03 | `node scripts/inventariar-textos.mts` não rodou depois de a T020 alterar o `README.md`, que está na travessia do inventário | **Quitado em 10/08.** O inventário rodou até a idempotência, subiu a 1259 literais, e a norma reprovou uma linha de verdade: um ponto médio em fim de linha na prosa nova do conferidor, corrigido por refluxo. Sem a passagem mecânica, o defeito teria viajado |
| O-24-04 | `next-env.d.ts` ficou modificado por subproduto de ferramenta, com o ponteiro migrando de `.next/types` para `.next/dev/types` | **Quitado em 10/08**, e sem intervenção: `npm run build` devolveu o arquivo ao conteúdo versionado, e `git status` já não o lista |
| O-24-05 | `.reversa/active-requirements.json` foi alterado, e ele está fora da lista de escopo declarada da tarefa. O diff ainda reformatou `stages-completed` de linha única para vetor multilinha | Governança do ciclo, não código de produto. Registrado para que a mudança de forma não passe por deliberada |
| O-24-06 | A reprovação por estatística fora de formato lançava `ErroDeBanco` fora de `query()`, logo **sem passar por `registrar()`**, e `infra/saude.ts` devolvia degradado sem log | **Quitado em 10/08.** `saude()` passou a emitir linha estruturada antes de lançar, com causa `consulta`, host mascarado e a lista das colunas reprovadas, jamais os valores. A disciplina está sob teste em `tests/unit/infra/saude.test.ts`, que afere também a ausência de URL, credencial e texto de consulta na linha |
| O-24-07 | `conexoes_abertas` é sensor público, sem autenticação, sem cache e sem limite de taxa, da atividade de terceiros no banco. Medido: seis sessões `psql` alheias levaram o corpo de 1 para 7 | Nenhum padrão da denylist alcança um inteiro, e nenhum dado pessoal é publicado. O que se divulga é **presença**, e presença é metadado de comportamento. Fica como consideração de privacidade a reavaliar se a rota ganhar consumidor em laço |
| O-24-08 | `versao` publica o nível de correção exato do servidor, que indexa o conjunto de CVEs aplicáveis, e `teto_de_conexoes` indexa o dimensionamento contratado | Inferência 🟡, não fato verificado: `max_connections` valeu 100, que é o padrão de fábrica. Pela D-09 os campos são obrigatórios, de modo que retirá-los depois seria mudança incompatível pela RN-07 |
| O-24-09 | Os exemplos de `openapi/status.yaml` traziam `versao: "1.0.0"` e `commit` de sete caracteres, herdados da re-extração 4 | **Quitado em 10/08.** A versão passou a `0.1.0`, que é a do `package.json`, e o commit ao SHA de quarenta caracteres que a própria descrição do campo promete. O `atualizado_em` de julho fica: instante de exemplo não envelhece contrato. Os três exemplos validam contra o esquema |
| O-24-10 | `_reversa_sdd/pages-api-v1-status/contracts.md` segue documentando `"banco": { "estado": "integro" }`, de uma chave só, embora o cabeçalho do `openapi` afirme espelhá-lo | Fora do escopo declarado da tarefa. Só a re-extração ou o adendo do `/reversa-sync` reconciliam |
| O-24-11 | `npm run format:check` reprova 667 arquivos, e nenhum deles é da 024 | Dívida anterior e repo-wide, na mesma família de `O-22-02`. O comando não é portão do CI |
| O-24-12 | A T017, que provaria a D-10 contra a produção **anterior** a esta entrega, não foi executada na passagem de codificação | **Quitado em 10/08**, por duas vias. Contra a produção real, ainda no SHA `84738fe`: veredito `EM DIA`, saída 0, e o banco de lá respondendo degradado. Contra um duplo local servindo o ramo íntegro de uma chave, que é o caminho que o deploy fecha: `banco íntegro · ocupação desconhecida`, saída 0, e o `--json` omitindo os três campos em vez de inventá-los |

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

| Item | Veredito | Nota |
|---|---|---|
| — | — | ainda não houve re-extração posterior a esta feature |

## Arquivadas

<!-- Itens que deixaram de valer, com a decisão que os aposentou. -->

Nenhum. Esta feature não revoga item de watch de nenhuma feature anterior: os catorze itens da 022
seguem vigentes, e os W005, W006 e W012 daquela lista são justamente os que esta entrega mais
exercita.
