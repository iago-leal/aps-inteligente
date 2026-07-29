# Adendo 020 — Ficha de consulta de puericultura, da caderneta ao SOAP

> Feature: `020-consulta-puericultura-soap`
> Data: `2026-07-28`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-28.

Superado pela re-extração de 2026-07-28.

## Resumo da entrega

As páginas verdes da *Caderneta da Criança* (pp. 66 a 75) dizem, consulta a consulta, o que se
investiga em cada idade, e o médico da Atenção Primária as preenchia em papel para depois redigir o
registro do prontuário à mão, duas vezes o mesmo trabalho. A feature transforma essas páginas em
tela preenchível: escolhida a idade da criança, o produto apresenta os campos da consulta
correspondente na redação da fonte, aceita marcação, seleção e texto livre, e devolve por um comando
de cópia tudo o que foi preenchido já organizado em SOAP, pronto para colar. As medidas
antropométricas chegam à calculadora de crescimento da feature 017 sem redigitação, e os escores z
voltam para o registro.

Três coisas mudam de natureza no sistema, e cada uma delas a próxima re-extração precisa reencontrar.

A primeira é que **uma unit passa a ter dois motores**. Até aqui, cada unit da família tinha uma
fachada; `models/puericultura` passa a ter `CalculadoraCrescimentoInfantil.avaliar`, da 017, e
`RegistroDeConsultaPuericultura.montar`, desta feature. A ADR 0011 permanece intacta, porque ela diz
uma fonte por unit, e não uma fachada por unit: é a mesma caderneta, em outra seção. A alternativa
examinada, uma sexta unit, exigiria importar de outra unit, sem precedente na família, ou uma
terceira cópia da aritmética de datas.

A segunda é que **o produto da plataforma deixa de ser sempre um número**. As cinco calculadoras
anteriores emitem escore, dose, probabilidade ou data; esta emite um texto de registro que atravessa
para fora da plataforma por colagem no prontuário. É a primeira saída com contrato de forma escrito
(`interfaces/registro-soap.md`), e a primeira em que a estabilidade do formato é promessa a quem o
consome todo dia.

A terceira é que **um guarda de outra feature precisou mudar**, e essa é a alteração de maior
severidade da entrega. Está descrita adiante em seção própria.

**46 de 46 ações concluídas.** Suíte em 808 testes de unidade e integração e 54 roteiros de ponta a
ponta, todos verdes, sem alteração de asserção anterior. Cobertura de `models/**` em 97,3% de
linhas, 96,6% no submódulo novo. Nenhum arquivo de aplicação acima de 400 linhas e nenhuma função
acima de 50.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/addenda/017-puericultura-crescimento.md` | unit `models/puericultura` | componente-novo | É este o artefato vigente sobre a unit, e não `code-analysis.md`: a extração nº 3 é anterior à feature 017 e não conhece puericultura. A unit ganha o submódulo `consulta/` (9 arquivos de motor e 12 de acervo) e a **segunda fachada**, `RegistroDeConsultaPuericultura.montar`. Nada do motor da 017 foi tocado, o que RF-18 verifica por `git diff` |
| `_reversa_sdd/architecture.md` | §1, camadas e família `models/*` | regra-alterada | A leitura implícita de "uma fachada por unit" deixa de valer. O invariante que permanece é o da ADR 0011, uma **fonte** por unit; a segunda fachada cobre outra seção da mesma caderneta. Todos os demais invariantes da família são exercitados pelo submódulo novo, inclusive `ReferenciaClinica` em toda saída e o motor que informa sem escolher |
| `_reversa_sdd/architecture.md` | §2, Containers e componentes | componente-novo | Nona rota, `/puericultura/consulta`, e subpasta `interface/puericultura/consulta`. Nenhum container nasce, nada passa a ser persistido, e o painel de crescimento entra por `next/dynamic`, de modo que as tabelas da OMS ficam fora do primeiro acesso |
| `_reversa_sdd/architecture.md` | §5, Qualidade e testes | regra-alterada | Sete roteiros de ponta a ponta e seis arquivos de teste novos; a rota nova mantém `axe` em zero **por asserção direta**, sem entrada em `e2e/axe-baseline.json`. Entra também o quarto gerador idempotente dev-time, `congelar-fichas-caderneta.mts`, que congela texto de página impressa em vez de dado numérico |
| `_reversa_sdd/architecture.md` | §6, Dívidas técnicas | regra-nova | Dívida amarela nova, herdada e agravada: `scripts/textos/classes/interface.mts` foi de 589 para **684 linhas**, e já estava acima do teto de 400 antes desta feature. É mapa de declarações, não lógica, e a exceção que o README concede a `models/puericultura/oms/tabelas/` **não o alcança nominalmente**. A saída natural é parti-lo por camada de tela |
| `_reversa_sdd/code-analysis.md` | Módulo 10, `interface/inicio` | regra-alterada | O `CATALOGO` ganha a segunda ficha da seção Puericultura; o diff é aditivo, e as cinco entradas anteriores permanecem byte a byte, asserido por lista ordenada exaustiva em `inicio.test.tsx` |
| `_reversa_sdd/code-analysis.md` | Módulo 11, `interface/estilos` | componente-novo | Entra `consulta-puericultura.css`, com 108 linhas; `puericultura.css` e `globais.css` ficam intocadas. Sobre a contagem: esta feature a viu como sétima folha, e a 019 chamou de sétima a sua própria; com as duas entregues e a `moldura.css` da 021, o total corrente é **nove** |
| `_reversa_sdd/code-analysis.md` | Módulo 12, `pages` | componente-novo | Nona rota e um `import` de folha em `pages/_app.tsx`; as oito rotas existentes ficam inalteradas |
| `_reversa_sdd/addenda/018-revisao-linguagem-textos.md` | cadeia do inventário textual | regra-alterada | Sexto módulo em `MODULOS`, com o predicado do submódulo **antes** do da unit, e o inventário sobe de 703 para 1 161 literais, idempotente. Ponto que pede leitura de terceiro: este é o primeiro módulo de classes que **deriva** as declarações do catálogo em vez de escrevê-las literal a literal, contra a letra de D-04 da 018. O que sustenta a derivação não é inferência por diretório, que aquela decisão proíbe, e sim a página impressa que cada campo já declara por outra razão |
| `_reversa_sdd/addenda/018-revisao-linguagem-textos.md` | verificador da classe citação (RF-07) | **regra-alterada** | Ver a seção seguinte. É o item de severidade HIGH da entrega |
| `_reversa_sdd/domain.md` | §7, invariantes, e §8, fronteiras | regra-nova | O domínio ganha regras que a extração base não cobre, porque não conhece a unit: o registro omite campo não preenchido e seção sem item, cabeçalho incluído; a seção **A** só recebe campo que a ficha imprime como juízo, de modo que o motor não forma conclusão; e as três fichas fora do escopo da fonte vão declaradas. As duas tiragens divergentes da caderneta e o campo que não se aplica a quem o recebe foram resolvidos por `MD-0026`, com omissão declarada em nota |
| `_reversa_sdd/traceability/code-spec-matrix.md` | Mapa unit ↔ spec | componente-novo | A matriz precisa acomodar duas fachadas sob uma unit, arranjo que ela ainda não modela. É o primeiro caso da plataforma |
| — | Contrato de forma do registro (`interfaces/registro-soap.md`) | delta-de-contrato-externo | Não há artefato da extração que o cubra. O texto copiado é consumido fora da plataforma, no prontuário, e a estabilidade da forma é promessa a quem cola. A re-extração nº 4 há de lhe dar lugar, ao lado do BR Code da feature 019 |

Nenhum impacto em `erd-complete.md`, `openapi/status.yaml` ou `data-dictionary.md`: a feature não
persiste nada, não toca `/api/v1/status` e não altera dado de infraestrutura. Nenhum dos cinco
domínios existentes mudou de comportamento, e nenhum campo identifica a criança, o que o roteiro de
ponta a ponta verifica com zero rede e zero durável novo.

## O guarda que precisou mudar, e por quê

`tests/unit/textos/citacao.test.ts`, escrito pela feature 018, comparava o conjunto corrente de
literais de classe citação contra `citacao-linha-de-base.json` e exigia que os únicos deltas fossem
os dois afastamentos de `MD-0015`. Como estava escrito, ele reprovava **qualquer** citação nova, e
esta é a primeira feature depois da 018 a trazer fonte clínica nova: trezentos e cinquenta rótulos
transcritos de páginas que ninguém havia lido antes. O guarda confundia citação existente reescrita,
que é violação, com matéria nova, que não é afastamento nenhum.

A alteração introduz `SUBARVORES_COM_ORACULO_PROPRIO`, hoje com uma entrada só,
`models/puericultura/consulta/`, isenta porque tem oráculo **mais forte** que a linha de base: o de
`MD-0010`, que confere contra a página impressa, e não contra um congelado nosso. A isenção alcança
o surgimento de citação; sumiço e alteração continuam reprovando em toda parte, inclusive dentro da
subárvore isenta. `citacao-linha-de-base.json` não foi tocado, o que RF-15 verifica por `git status`.

A forma **nominal** é o que carrega o peso. Uma regra genérica do tipo "arquivo novo é isento"
resolveria este caso e tornaria o verificador opcional na feature seguinte, porque todo arquivo novo
nasce ausente. A decisão está em `MD-0027`, foi tomada na execução e não arbitrada de antemão, e fica
declaradamente **aberta a revisão**: o caminho de volta é barato enquanto a lista tiver uma entrada.

## Regras sob vigilância

Quinze watch items nascem desta entrega: **W001** a **W015**, em
`_reversa_forward/020-consulta-puericultura-soap/regression-watch.md`.

Só o **W001** herda regra 🟢 modificada, e é o par do parágrafo acima: vigia que a isenção continue
nominal e que cada entrada declare o oráculo que a guarda. Junto dele, o **W002** guarda a linha de
base contra regeração, que é o desfecho que `MD-0018` existe para impedir. Dos demais, os de maior
consequência clínica são o **W009**, que impede o produto de formar juízo na seção de avaliação, o
**W010**, que impede uma segunda fonte de escore z dentro da mesma unit, e o **W007**, que exige que
o texto exibido e o entregue à área de transferência saiam do mesmo cálculo, porque o defeito
contrário faria conferir uma coisa e colar outra.

Dez observações sem peso de regressão acompanham a lista, entre elas duas premissas 🟡 que só o uso
arbitra — a ficha sugerida entre duas consultas previstas e a colocação de três campos entre O e P —
e duas dívidas que esta feature encontrou sem poder quitar: `interface.mts` acima do teto (`O-20-04`)
e `format:check` reprovando 587 arquivos no estado anterior à entrega (`O-20-10`).

## Fontes

- `_reversa_forward/020-consulta-puericultura-soap/requirements.md`
- `_reversa_forward/020-consulta-puericultura-soap/roadmap.md`
- `_reversa_forward/020-consulta-puericultura-soap/legacy-impact.md`
- `_reversa_forward/020-consulta-puericultura-soap/regression-watch.md`
- `_reversa_forward/020-consulta-puericultura-soap/actions.md`
- `_reversa_forward/020-consulta-puericultura-soap/progress.jsonl`
- `_reversa_forward/020-consulta-puericultura-soap/medicao-bundle.md`
- `.harness/decisoes/MD-0026.md`, `MD-0027.md`, `MD-0028.md`

## Nota de sincronização tardia

Este adendo foi gerado em 2026-07-28, na mesma data da entrega, porém em sessão posterior à da
feature 021, que o precedeu na fila de `/reversa-sync`. A dívida está registrada em `O-21-04`, e a
ordem de leitura correta dos adendos é a numérica, não a cronológica de escrita.
