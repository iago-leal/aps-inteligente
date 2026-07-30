# Roadmap: Saúde do idoso — Escala de Depressão Geriátrica (GDS)

> Identificador: `023-saude-do-idoso-gds`
> Data: `2026-07-30`
> Requirements: `_reversa_forward/023-saude-do-idoso-gds/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature é um **sexto unit clínico no molde da cardiopatia isquêmica**, que é o análogo
estrutural mais próximo: questionário de respostas booleanas, contagem, faixa nomeada e
conduta transcrita. Nada de acervo tabular, nada de carregamento sob demanda, nenhuma
dependência nova. O domínio recebe os quinze itens e as três faixas como **dado congelado**,
soma, classifica e devolve resultado referenciado; a tela repete o esqueleto de
`interface/cardiologia`, sem ritual de revisão e **sem a variante `fora-do-escopo`**, que
esta calculadora não tem por a fonte não publicar faixa etária.

Duas coisas fogem do molde e são o miolo do plano. A primeira: a fonte é página web, e a
transcrição precisa de oráculo — entra um **congelado extraído da cópia datada** que já está
em `referencias/`, no molde de `MD-0010`, e com ele a subárvore do unit novo passa a
constar em `SUBARVORES_COM_ORACULO_PROPRIO` de `tests/unit/textos/citacao.test.ts`, sem o
que a suíte reprovaria por construção (`MD-0027`). A segunda: como não há campo de idade, a
prosa que diz a quem o instrumento se dirige carrega sozinha o papel que noutras telas é de
uma regra de recusa, e por isso é tratada como conteúdo do domínio, e não como texto de
enfeite da tela.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | Os quinze itens, a chave de pontuação e os cortes vivem no `requirements.md` (RN-02, RN-04) antes de existirem em código; o oráculo confere o código contra a fonte, não contra si mesmo | respeita |
| II. Cadeia de derivação | Cada arquivo previsto na §5 rastreia um `RF-NN`; nada entra sem RF que o origine, inclusive a folha de estilo e o script de congelamento | respeita |
| III. Clarificação precede solução | Duas rodadas de `/reversa-clarify` em 30/07 fecharam fonte, idade, emissão de texto e nomes; `MD-0037` e `MD-0038` registram o que a leitura da fonte obrigou | respeita |
| IV. Portão G1 | Requisitos sem `[DÚVIDA]` antes deste plano | respeita |
| V. Fase 2 proporcional | Categoria **Produto** (`_reversa_sdd/` trata a plataforma como tal): trio crítico completo, pirâmide inteira, sem moldes de API por não haver contrato de máquina novo | respeita |
| VI. Rastreabilidade bidirecional | Cabeçalho de cada arquivo cita o `RF-NN`; o `regression-watch.md` fecha o circuito no `/reversa-coding` | respeita |
| VII. Testes em dois papéis | Validação por RF, propriedade sobre os invariantes do domínio, oráculo de transcrição contra a fonte, e regressão herdada intocada | respeita |
| VIII. Proporcionalidade | Sem `next/dynamic`, sem geração de tabelas, sem camada nova: o porte do domínio dispensa o aparato que a puericultura exigiu | respeita |
| IX. Prosa com norma verificável | Três classes declaradas em módulos próprios de `scripts/textos/classes/`; itens e rótulos como citação, notas do produto como autoral | respeita |

Nenhum conflito com princípio ativo. Há **uma tensão registrada, e não conflito**: o
princípio IX exige que a citação seja reconferível, e `MD-0039` optou por conferência
manual da URL. A tensão se resolve porque o congelado da §3, D-09, confere o **produto
contra a cópia da fonte** automaticamente; o que ficou manual é apenas notar que a *fonte
publicada* mudou, e isso nenhum teste do repositório jamais fez para fonte alguma.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Unit `models/depressao-geriatrica`, fachada `EscalaDepressaoGeriatrica.avaliar(entrada): SaidaAvaliacao` | Os cinco units clínicos nomeiam o **domínio**, não a seção da home; `models/puericultura` e a seção "Puericultura" coincidirem é acidente, não regra | `models/saude-do-idoso` (nomeia a seção, e a seção há de crescer com outros instrumentos); `models/gds` (sigla como nome de pasta, ilegível em seis meses) | 🟢 |
| D-02 | Os quinze itens como **dado congelado** em `itens.ts`: `{ id, numero, texto, respostaQuePontua }`, `Object.freeze` profundo | A chave mistura dez "Sim" com cinco "Não", e é o ponto exato em que a transcrição de instrumentos erra; como dado, a pergunta tem um lugar só e o oráculo a confere | Cadeia de `if`/`switch` por número de item; dois arrays paralelos, um de textos e outro de sinais (o segundo desalinha em silêncio na primeira edição) | 🟢 |
| D-03 | Entrada como **mapa de respostas por `id` de item**, com ausência representada por chave ausente; a validação devolve um ofensor `ITEM_NAO_RESPONDIDO` por item faltante, todos de uma vez | Coleta total é invariante da família (`domain.md#10`, invariante 4), e um array de quinze booleanos tornaria "não respondido" inexprimível, empurrando a regra para a tela | Array de quinze `boolean` (perde a ausência); array de `boolean \| null` (exprime, mas amarra o domínio à ordem de renderização) | 🟢 |
| D-04 | Faixas como dado ordenado `{ de, ate, rotulo }`, cobrindo 0–15 sem buraco nem sobreposição, com teste exaustivo dos dezesseis escores possíveis | O espaço é minúsculo e inteiramente enumerável: prova-se por varredura, e não por amostragem, o que dispensa aqui a fronteira dupla que a puericultura precisou declarar | Cadeia de `if` com `>=`/`<` (é onde a transcrição de cortes erra); comparação por `switch` em faixas nomeadas | 🟢 |
| D-05 | `fonte-clinica.ts` guarda, separados por comentário, o que é **da fonte** (rótulos, providência, localizações, `NOME_PUBLICADO`) e o que é **do produto** (advertência de rastreamento, público a que o instrumento se dirige) | Molde do `NOTA_PROVENIENCIA` do risco cardiovascular, que já mistura os dois no mesmo arquivo com a distinção escrita; separar em dois arquivos criaria pergunta nova sem resolver nenhuma | Arquivo `notas.ts` separado; pôr a prosa do público na tela (a tela passaria a afirmar coisa clínica que o domínio não disse) | 🟢 |
| D-06 | A providência da fonte entra no resultado **em toda faixa**, como citação com referência, sem limiar | A fonte diz "escores elevados" e não quantifica; quantificar seria o produto emitindo regra própria com aparência de citação. Precedente: `sem-parametro-na-fonte` da gestação (regra 25) | Exibir só a partir de 6 pontos; exibir só em "depressão severa"; converter "elevados" num corte próprio documentado | 🟢 |
| D-07 | Tela `interface/saude-do-idoso/` com `tela.tsx`, `app.tsx`, `formulario.tsx` e `resultado.tsx`; máquina `EstadoDepressaoGeriatrica`: `vazio → sucesso \| erro \| falha-inesperada` | Esqueleto de `interface/cardiologia` **menos** a variante `fora-do-escopo`, que exigiria uma recusa que este domínio não tem. Máquina com estado inalcançável é convite a código morto | Reaproveitar a máquina da cardiopatia com a variante inerte; criar componente genérico de questionário para futuros instrumentos (abstração antes do segundo caso) | 🟢 |
| D-08 | Cada item é um grupo de duas opções **sem valor pré-selecionado**, rotulado pelo enunciado do item | Sem padrão, "não respondido" é estado real e a coleta total de D-03 tem o que coletar; com padrão, o formulário responderia pelo paciente, que é o defeito clínico mais grave possível aqui | Padrão "Não"; padrão "Sim"; caixa de seleção única por item, que confunde "não marcado" com "respondeu Não" | 🟢 |
| D-09 | **Oráculo de transcrição**: `scripts/congelar-fonte-gds.mts` lê a **cópia local** da fonte em `referencias/saude-do-idoso/…-20260730.html` e emite `tests/apoio/gds-fonte-congelada.json`, contra o qual `tests/unit/dominio-depressao-geriatrica/transcricao.test.ts` confere itens, chave de pontuação, rótulos e providência | Cadeia independente da mão que escreve o domínio, no molde de `MD-0010`. Lê arquivo, **nunca a rede**, o que preserva `MD-0039`: nenhum teste depende de estar on-line | Escrever o JSON à mão (o oráculo viria da mesma mão que o código, e provaria nada); conferir contra a URL em tempo de teste (suíte dependente de rede); não ter oráculo (a chave de pontuação ficaria sem guarda alguma) | 🟢 |
| D-10 | `models/depressao-geriatrica/` entra em `SUBARVORES_COM_ORACULO_PROPRIO` de `tests/unit/textos/citacao.test.ts`, declarando o oráculo de D-09 | Sem isso a suíte **reprova por construção**: a linha de base congelada de 27/07 não conhece citação nova, e regerá-la é o que `MD-0018` proíbe. A forma nominal preserva o gate para a próxima feature (`MD-0027`) | Regerar a linha de base; alargar `AFASTAMENTOS_AUTORIZADOS`; declarar a subárvore sem nomear oráculo | 🟢 |
| D-11 | Módulos de classe **novos e pequenos**: `scripts/textos/classes/models-depressao-geriatrica.mts` e `scripts/textos/classes/interface-saude-do-idoso.mts`, registrados no agregador `classificacao.mts` | O segundo começa a partição que a **dívida 3** pede (`interface.mts` em 684 linhas): parte-se por camada de tela, e a feature nova entra pelo lado certo em vez de engordar o arquivo | Acrescentar tudo a `interface.mts` e `models-demais.mts` (agrava a dívida e mistura três fontes num módulo já grande) | 🟢 |
| D-12 | Décima folha, `interface/estilos/saude-do-idoso.css`, com o arranjo vertical do questionário e **nenhuma propriedade horizontal de coluna** | `MD-0029`: a `Moldura` é dona do enquadramento, e tela que declare coluna própria aninha coluna e desalinha o cabeçalho | Estender `globais.css` (reabriria a dívida que a 021 fechou); reusar `cardiologia.css` (acoplaria duas telas sem parentesco) | 🟢 |
| D-13 | e2e próprio em `e2e/saude-do-idoso.spec.ts`, com `axe` por asserção direta e **sem entrada na baseline**; a guarda geométrica alcança a rota automaticamente ao entrar no catálogo | É a propriedade que a feature 021 instalou e que a 013 pagou caro para descobrir: rota nova cai sob a guarda pelo catálogo, sem lista à mão | Acrescentar a rota à lista da guarda geométrica (a lista não existe mais); confiar no e2e da plataforma | 🟢 |
| D-14 | Nenhuma dependência nova; o cálculo é síncrono e local, e a rota não faz `fetch` | ADR 0002/0007 e o filtro de longevidade do projeto; quinze somas não justificam biblioteca | Biblioteca de formulários; biblioteca de validação de esquema | 🟢 |

## 4. Premissas

Nenhuma premissa herdada de `[DÚVIDA]` não resolvida: as três dúvidas do `requirements.md`
foram fechadas nas duas rodadas de 30/07. Ficam registradas as premissas **de projeto**,
que o `/reversa-coding` pode confirmar ou devolver:

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| O unit se chama pelo domínio clínico, e não pela seção | §8, "Premissa que segue aberta" | Baixo: renomear pasta antes do primeiro commit custa minutos; depois, custa uma passagem de imports |
| A prosa do público a que o instrumento se dirige basta, sem campo de idade | §4, RN-07 | Médio e **clínico**: se a tela for usada fora do público previsto, nada no produto o barra. É a contrapartida assumida de não inventar fronteira que a fonte não tem |
| A conferência de que a página não mudou é manual | §6, requisito de reprodutibilidade da citação; `MD-0039` | Médio no tempo: uma correção publicada pela fonte pode demorar a chegar ao produto. O oráculo de D-09 **não** cobre isso, e é importante que os dois não sejam confundidos |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `models/depressao-geriatrica` | `_reversa_sdd/architecture.md#1-estilo-arquitetural` | componente-novo | Sexto unit clínico: `tipos.ts`, `itens.ts`, `fonte-clinica.ts`, `validacao.ts`, `escore.ts`, `classificacao.ts`, `calculadora.ts` |
| `interface/saude-do-idoso` | `_reversa_sdd/code-analysis.md#módulo-11--interfacecardiologia` | componente-novo | Quatro arquivos no molde da cardiologia, sem ritual de revisão e sem `fora-do-escopo` |
| `interface/inicio/catalogo.ts` | `_reversa_sdd/code-analysis.md#módulo-16--interfaceinicio` | regra-alterada | Quinta seção `saude-do-idoso`, título "Saúde da pessoa idosa", uma ficha; diff **aditivo**, as seis anteriores byte a byte |
| `interface/inicio/icones.tsx` | idem | regra-alterada | Quinto par `id → ícone`, mantido o fallback `null` |
| `interface/estilos/` | `_reversa_sdd/code-analysis.md#módulo-17--interfaceestilos` | componente-novo | Décima folha, sem propriedade horizontal (D-12) |
| `pages/` | `_reversa_sdd/code-analysis.md#módulo-18--pages` | componente-novo | Oitava rota de página: `pages/saude-do-idoso/depressao-gds.tsx`, casca de metadados mais tela |
| `pages/_app.tsx` | idem | regra-alterada | Um `import` de folha, na ordem existente |
| `_reversa_sdd/state-machines.md` | `#3-estadocardiologia` | contrato-novo | Máquina nova `EstadoDepressaoGeriatrica`, com **três** destinos a partir de `vazio`, e não quatro |
| `scripts/textos/classes/` | `_reversa_sdd/code-analysis.md#módulo-21--scripts` | componente-novo | Dois módulos de classe novos e o registro no agregador; começa a partição da dívida 3 |
| `scripts/congelar-fonte-gds.mts` | idem | componente-novo | Quinto gerador idempotente da camada dev-time; lê arquivo local, nunca a rede |
| `tests/unit/textos/citacao.test.ts` | `_reversa_sdd/architecture.md#5-qualidade-e-testes` | regra-alterada | **Alteração em guarda escrito por outra feature**: entrada nominal na lista de subárvores com oráculo próprio (D-10). Item de severidade alta no `legacy-impact.md`, como foi na 020 |
| `tests/integration/interface/inicio.test.tsx` | `_reversa_sdd/code-analysis.md#módulo-16--interfaceinicio` | regra-alterada | A lista ordenada exaustiva passa a afirmar cinco seções e sete fichas |
| `README.md` | `_reversa_sdd/domain.md#103-a-norma-de-redação` | regra-alterada | A calculadora nova entra na lista, e o nome publicado da fonte fica sujeito ao verificador que lê o domínio (regra 21). Atenção à dívida 10, que já reprova `prettier --check` |
| `referencias/saude-do-idoso/` | `_reversa_sdd/inventory.md#fontes-clínicas-versionadas` | componente-novo | Cópia datada da fonte, fora do versionamento, com `sha256` citado no `requirements.md` e no cabeçalho do script de congelamento |

**O que NÃO muda, e é deliberado:** os seis units existentes, a `Moldura`, o cabeçalho,
`infra/**`, `pages/api/v1/status.ts`, o contrato do BR Code e o do registro SOAP. Nenhum
arquivo de motor anterior é aberto por esta feature.

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma persistência, nenhuma migração, nenhuma tabela.** Entram
  quatro estruturas em memória (item da escala, resposta, resultado, ofensor) e dois
  artefatos de dado em disco: o congelado do oráculo, versionado, e a cópia da fonte, fora
  do versionamento. O banco do healthcheck não é tocado.
- Detalhe completo em: `_reversa_forward/023-saude-do-idoso-gds/data-delta.md`

## 7. Delta de contratos externos

**n/a.** Nenhum contrato de máquina é criado ou alterado: `GET /api/v1/status` permanece
com as seis chaves da feature 022, o BR Code e o registro SOAP não são tocados, e RF-16
ficou em `Won't`, de modo que a feature **não** emite texto para consumo externo. O
diretório `interfaces/` não é criado, conforme a regra do próprio molde.

O que se aproxima de contrato, sem o ser, é a **rota nova** e a entrada no catálogo: são
superfície de navegação, cobertas pelos testes de integração da home e pelo e2e.

## 8. Plano de migração

**n/a.** Não há dado a migrar, esquema a versionar nem consumidor a avisar. A feature é
aditiva em toda superfície que toca, e o pior desfecho de um `revert` é a home voltar a
quatro seções.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Chave de pontuação transcrita ao contrário em um ou dois itens | **Alto e silencioso**: o escore sai plausível, na faixa vizinha da correta, e nenhuma inspeção de tela pega | médio | Oráculo de D-09, que extrai a chave da cópia da fonte por cadeia própria, mais o teste dos dois extremos (0 e 15), que só fecha se a direção de todos os quinze estiver certa |
| A suíte reprovar por citação nova sem isenção declarada | Médio, e certo se esquecido | **alto** | D-10 antes de escrever qualquer literal do domínio; a ação entra cedo no `actions.md`, não no fim |
| O inventário textual parar por literal sem classe | Baixo, barulhento por design | alto | D-11 na mesma fase da escrita dos literais; `node scripts/inventariar-textos.mts` roda antes do commit |
| Formulário de quinze grupos de opções com rótulo mal associado | Médio: acessibilidade é requisito, e `axe` reprova | médio | D-08 com rótulo pelo enunciado; e2e com `axe` por asserção direta, sem baseline |
| A fonte publicada mudar sem que ninguém perceba | Médio no tempo | baixo | Cópia datada com `sha256`; conferência manual assumida em `MD-0039`, com gatilho de revisão escrito |
| `interface.mts` continuar crescendo por hábito | Baixo | médio | D-11 cria o módulo separado; a dívida 3 encolhe em vez de crescer |
| Alterar `citacao.test.ts` quebrar a garantia que a 018 instalou | Médio | baixo | A isenção é **nominal** e alcança só surgimento; sumiço e alteração continuam reprovando em toda parte, inclusive dentro da subárvore |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Suíte padrão verde, com os testes novos do domínio e da tela, e cobertura de `models/**` acima do limiar de 90%
- [ ] Oráculo de transcrição verde, e visto reprovar ao menos uma vez com um item deliberadamente trocado
- [ ] `node scripts/inventariar-textos.mts` sem parar, com o inventário regerado e o diff sob leitura humana
- [ ] e2e da rota nova com `axe` em zero, sem entrada na baseline, e a guarda geométrica passando pelas oito rotas
- [ ] `lint`, `typecheck` e `prettier --check` sem regressão em relação à linha de base conhecida (o `README.md` já reprovava antes, dívida 10)
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-30 | Versão inicial gerada por `/reversa-plan` | reversa |
