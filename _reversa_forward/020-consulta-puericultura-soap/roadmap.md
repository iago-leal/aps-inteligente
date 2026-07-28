# Roadmap: Ficha de consulta de puericultura, da caderneta ao SOAP

> Identificador: `020-consulta-puericultura-soap`
> Data: `2026-07-28`
> Requirements: `_reversa_forward/020-consulta-puericultura-soap/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA
> Categoria (Princípio nº 4 global): **Produto** — ferramenta clínica usada em consulta real, com responsabilidade profissional sobre o que registra.

## 1. Resumo da abordagem

A feature nasce **dentro** da unit `models/puericultura`, num submódulo `consulta/`, porque a
fonte é a mesma caderneta da feature 017 em seção diferente e porque RN-05 exige reusar
`IdadesDerivadas` sem uma terceira cópia da aritmética de datas. O conteúdo das dez fichas vira
**dado declarado** — um módulo por ficha, um `Campo` por item impresso, cada rótulo carregando a
página de onde veio —, e não marcação escrita dez vezes à mão. O motor não produz texto: devolve
um `RegistroDaConsulta` estruturado nas quatro seções do SOAP, já sem os campos em branco; a
projeção em texto é uma função pura da camada de interface, no molde de `formatar-plano.ts` da
feature 006, e a tela exibe e copia **a mesma cadeia**, de modo que a identidade que RF-08 pede é
propriedade da construção e não coincidência a verificar. A calculadora de crescimento da 017 entra
por painel `next/dynamic` que chama a fachada existente com a entrada montada da ficha: não há
segundo formulário, logo não há o que redigitar. O portão mais barulhento da entrega é o inventário
textual, e a decisão D-04 é o que impede que ele custe trezentas e cinquenta declarações escritas à
mão. Nenhum dos cinco domínios muda de comportamento, nenhum container nasce, nada é persistido.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | O dado das fichas é projeção do `requirements.md` e do PDF, e o oráculo de transcrição (D-12) prova a projeção contra a fonte, não contra a leitura de quem transcreveu | respeita |
| II. Cadeia de derivação | Cada módulo novo cita no cabeçalho os `RF-NN` e `RN-NN` que o originam, no molde de `models/puericultura/tipos.ts` | respeita |
| III. Clarificação precede solução | As três lacunas foram arbitradas em 28/07 antes deste documento; as decisões com mais de uma saída defensável (D-01, D-04, D-08, D-12) trazem ≥3 alternativas descartadas | respeita |
| IV. Portão G1 | O `requirements.md` está sem `[DÚVIDA]`; o plano nasce de requisitos travados | respeita |
| V. Fase 2 proporcional | Categoria Produto: roadmap, data-delta, contrato de saída, onboarding e actions; as duas premissas 🟡 entram como risco declarado (§4), nunca embutidas | respeita |
| VI. Rastreabilidade bidirecional | `traceability/code-spec-matrix.md` ganha as colunas do submódulo e da tela; cada arquivo novo cita o `RF-NN` no cabeçalho | respeita |
| VII. Testes em dois papéis | Unidade no domínio novo, property-based nos invariantes do registro, integração na tela, e2e na rota, mais o oráculo de transcrição de D-12 | respeita |
| VIII. Proporcionalidade | Produto: pirâmide inteira. O volume textual justifica um nível que as features de apresentação não teriam | respeita |
| IX. A prosa do produto tem norma declarada | É o princípio que mais pesa aqui: a feature é o maior acréscimo de classe `citação` que o projeto já viu. D-04, D-05 e D-06 existem para que a norma continue verificável sob esse volume | respeita, sob tensão declarada em D-04 |

**Tensão a registrar, sem propor mudança no princípio.** A decisão D-04 da feature 018 manda declarar
a classe **literal a literal**, e a razão é impedir que a classificação seja inferida do diretório.
Trezentos e cinquenta rótulos declarados um a um satisfariam a letra e derrotariam o propósito: o
mapa passaria a ser mantido no automático, que é o defeito que aquela decisão nomeia em
`pages-e-arquivos.mts`. D-04 deste roadmap propõe a saída — declaração por **regra escrita sobre a
origem que o próprio dado carrega** —, e ela não é inferência por diretório: é a página impressa,
declarada campo a campo por quem transcreveu. Se a arbitragem for contrária, o custo é conhecido e
recai sobre a fase 2 do `actions.md`.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | O motor da ficha é submódulo `models/puericultura/consulta/`, e não uma sexta unit de domínio | Mesma fonte editorial (`MD-0001`, ADR 0011) em seção diferente; RN-05 exige `IdadesDerivadas` e `datas.ts` já existentes. Unit nova exigiria ou importar de outra unit, sem precedente, ou uma **terceira** cópia da aritmética de datas — a dívida D-07 da 017, que já é gêmea da de `models/gestacao` | (a) unit `models/consulta-puericultura` importando `models/puericultura` — cria acoplamento entre units que a família nunca teve; (b) unit nova com datas duplicadas — triplica a dívida declarada; (c) pôr a lógica na camada de interface — violaria domínio puro (ADR 0003) | 🟢 |
| D-02 | O conteúdo das dez fichas é dado declarado em `consulta/fichas/`, um módulo por ficha, com um `Campo` por item impresso: `id`, `rotulo`, `natureza`, `secaoSoap`, `pagina`, `sexos?` | RNF de manutenibilidade do requirements; edição nova da caderneta se absorve editando dado. Um módulo por ficha mantém cada arquivo longe do teto de 400 linhas (Princípio 5.6) | (a) JSX escrito dez vezes — multiplica por dez o custo de qualquer correção de transcrição; (b) um único arquivo de catálogo — passaria de 1200 linhas; (c) JSON — ver D-04, sairia do inventário textual pela porta dos fundos | 🟢 |
| D-03 | O domínio devolve **estrutura** (`RegistroDaConsulta`), e a projeção em texto é função pura em `interface/puericultura/consulta/formatar-registro.ts`. Tela e comando de cópia consomem **a mesma cadeia**, de um `useMemo` único | RF-08 pede identidade byte a byte entre exibido e copiado; com uma função e uma variável, a identidade é estrutural. Molde exato de `formatar-plano.ts` (006), que já projeta em texto o que o painel exibe | (a) domínio devolvendo texto pronto — amarra formato de apresentação ao motor e quebra o invariante de domínio puro em espírito; (b) duas funções, uma para exibir e outra para copiar — é precisamente o defeito que RF-08 teme; (c) copiar do DOM — frágil e intestável | 🟢 |
| D-04 | A classe textual dos rótulos se declara por **regra escrita sobre o dado**, em módulo novo `scripts/textos/classes/models-puericultura-consulta.mts`, que importa as dez fichas e deriva: todo `rotulo` de campo é `citacao` com `origem` na página que o campo declara; todo `id` e toda `natureza` são `identificador`. Os poucos literais autorais do submódulo ficam declarados à mão | São ~350 rótulos e **uma** decisão de classe, tomada uma vez e escrita por extenso. A origem vem do dado, não do diretório: cada campo carrega a página impressa de onde foi transcrito, que é exatamente o que `MD-0014` manda usar. O predicado novo entra em `MODULOS` **antes** do de `models/puericultura/` | (a) ~350 entradas à mão — satisfaz a letra de D-04/018 e derrota o propósito: mapa mantido no automático; (b) `UNIFORMES` por arquivo — a porta está declarada estreita e exclui arquivo de código, com razão escrita; (c) excluir a subárvore do inventário, como se fez com `oms/tabelas` — lá a razão era dado numérico gerado, aqui é o oposto: é citação clínica, que é o que o guarda existe para ver | 🟡 |
| D-05 | A supressão de "Criptorquidia" na ficha feminina se realiza por **aplicabilidade declarada no dado** (`sexos: ["masculino"]`), não por condicional na tela; a nota da supressão é constante do domínio, lida pela proveniência | `MD-0026` exige supressão **declarada**. Constante própria, no molde de `NOTA_CORRECAO_DE_CONCORDANCIA`, permite que um watch item vigie a permanência da declaração sobre símbolo exportado, e não sobre trecho de parágrafo | (a) `if` na tela — espalha a decisão pela apresentação e some do dado, onde alguém procuraria; (b) duas fichas do 2.º mês, uma por sexo — duplica 40 campos por causa de um; (c) suprimir sem nota — violaria `MD-0015` e `MD-0026` | 🟢 |
| D-06 | A flexão por sexo entra como **par de rótulos** no dado (`rotulo` mais `rotuloFeminino`), jamais como interpolação em tempo de execução | O gerador do inventário ignora crase **com** interpolação, de propósito: o texto montado em runtime não existe como literal único. Uma flexão interpolada tiraria a citação do guarda — a cegueira que `MD-0019` corrigiu ao baixar o corte para duas palavras | (a) template com interpolação do sexo; (b) `replace` sobre o rótulo masculino; ambas produzem texto exibido que o inventário não vê | 🟢 |
| D-07 | `consulta/selecao.ts` puro sugere a ficha pela **idade cronológica** e devolve, junto, a espécie de idade que governou; a troca continua do usuário | RN-04 e RN-05 arbitradas em 28/07. Devolver a espécie junto com a sugestão é o que permite ao registro declará-la sem a tela reescrever a regra | (a) sugerir pela corrigida no pré-termo; (b) não sugerir nada; ambas descartadas na sessão de esclarecimento | 🟢 |
| D-08 | A calculadora de crescimento entra por **painel de resultado**, não por segundo formulário: o painel chama `CalculadoraCrescimentoInfantil.avaliar` com a entrada montada do estado da ficha e monta o `PainelCrescimento` existente. Carga por `next/dynamic`, no molde de `bloco-de-apoio.tsx` (019) | RF-09 pede ausência de redigitação; sem formulário no painel, não há o que redigitar — a ausência é estrutural. RF-11 pede que quem não abre o painel não pague as tabelas antropométricas, e `dynamic` é o mecanismo já provado na 019 | (a) reusar `FormularioCrescimento` com valores iniciais — obriga a alterar o formulário da 017 e ainda pede um segundo submeter; (b) navegar para `/puericultura/crescimento` levando estado — sai da tela, contra o pedido explícito; (c) duplicar a tela de crescimento | 🟢 |
| D-09 | Dois dados que a ficha impressa **não tem** e o motor da 017 exige entram declarados: a **posição da medição** vira campo autoral, exibido só quando há comprimento preenchido; a conversão de **gramas para quilos** é do adaptador e vai dita na tela | A ficha imprime "Peso: ____ g" e não pergunta se a criança foi medida deitada ou em pé; `RN-09` da 017 proíbe supor a posição, porque supor erra 0,7 cm em silêncio na medida que alimenta o escore. Ambos são acréscimos do produto sobre a fonte, e por isso são **autorais**, não citação | (a) inferir a posição pela idade — é exatamente o default silencioso que a 017 recusou; (b) não oferecer o comprimento ao painel — mutilaria dois dos quatro índices; (c) tratar o peso em gramas no motor — mudaria o contrato da 017 por conveniência da 020 | 🟢 |
| D-10 | Nenhuma persistência, nenhuma rede; o aviso de RF-13 é constante do domínio lida pela tela | ADR 0002, RN-13. A constante no domínio impede que tela e motor divirjam sobre o que se promete ao usuário, no molde anti-drift de `NOTA_PROVENIENCIA` | (a) rascunho em `sessionStorage` — reabre LGPD e specs; (b) aviso escrito na tela — divergiria do domínio na primeira edição | 🟢 |
| D-11 | Folha de estilo **nova**, `interface/estilos/consulta-puericultura.css`, importada em `_app.tsx`; um componente por natureza de campo em `interface/puericultura/consulta/` | Empurrar `puericultura.css` para o teto de 400 linhas recriaria a dívida amarela que a re-extração 3 acabou de encerrar. Um componente por natureza (marcação, escolha, medida, texto) mantém cada função abaixo de 50 linhas com dez fichas de anatomia repetida | (a) estender `puericultura.css`; (b) um componente único com `switch` de 120 linhas | 🟢 |
| D-12 | O oráculo da transcrição congela o **texto bruto das onze páginas** das duas tiragens, extraído por script dev-time, e a suíte afirma que cada rótulo declarado ocorre na página que o campo diz. Onde o layout em duas colunas partir o rótulo, a exceção vai declarada com o motivo, sobre lista fechada | `MD-0010` e `MD-0025`: o oráculo é a fonte primária, não uma segunda leitura nossa. Congelar o texto e afirmar ocorrência é robusto ao layout e barato; parsear as colunas do `pdftotext` seria reimplementar a fonte. O PDF fica fora do git por `MD-0008`, e o congelado entra — precedente exato de `scripts/congelar-casos-oraculo.mts` | (a) conferência por leitura humana campo a campo — é a "segunda implementação" que `MD-0010` recusa; (b) parsear o layout em colunas — frágil e ele mesmo a ser testado; (c) confiar na transcrição — trezentos e cinquenta rótulos sem rede | 🟡 |
| D-13 | A rota nova é `pages/puericultura/consulta.tsx`, segunda ficha da seção Puericultura no `CATALOGO` | `code-analysis.md#Módulo 10`: o catálogo congelado é a fonte única de seções e rotas, e calculadora nova entra ali primeiro | (a) submenu dentro de `/puericultura/crescimento`; (b) seção nova na home — a seção Puericultura já existe | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Idade entre duas consultas previstas sugere a ficha imediatamente anterior | §10, premissa 🟡 primeira; RN-04 | Baixo e observável: o prescritor troca a ficha sugerida com frequência. A troca já é livre por RN-04, de modo que o erro custa um clique, nunca um registro errado |
| "Laços de afeto" e "Sinais de violências/negligências" em **O**, "Acidentes domésticos" em **P** | §10, premissa 🟡 segunda; §9, terceiro esclarecimento; RN-09 | Baixo: corrigir é editar uma linha do mapa em `consulta/fichas/`, sem tocar estrutura. O sinal é o registro colado no prontuário parecer errado ao próprio autor |
| O texto extraído pelo `pdftotext` preserva os rótulos de forma contígua na maioria dos casos | D-12 | Médio: se a fração partida pelo layout for grande, a lista fechada de exceções deixa de ser fechada e o oráculo perde valor. Mitigação em §9 |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `models/puericultura` | `_reversa_sdd/architecture.md#1` | componente-novo (dentro de unit existente) | Submódulo `consulta/` com dado declarado das dez fichas, seleção por idade e montagem do registro. Os **cinco** domínios continuam cinco: a unit ganha um segundo motor sob a mesma fonte |
| Fachada de domínio | `_reversa_sdd/c4-components.md` | componente-novo | `RegistroDeConsultaPuericultura.montar` ao lado de `CalculadoraCrescimentoInfantil.avaliar`, primeira unit da plataforma com duas fachadas |
| Camada dev-time `scripts/**` | `_reversa_sdd/addenda/017` (delta de camadas) | componente-novo | Congelamento do texto das páginas 66 a 75 das duas tiragens (D-12), na cadeia já existente de oráculos congelados |
| `interface/puericultura` | `_reversa_sdd/code-analysis.md#Módulo 10` e adendo 017 | componente-novo | Subpasta `consulta/` com a tela da ficha, o painel de crescimento sob demanda, a projeção em texto e a proveniência própria |
| `interface/inicio` (`CATALOGO`) | `_reversa_sdd/code-analysis.md#Módulo 10` | regra-alterada (extensão) | Segunda ficha na seção `puericultura`; diff aditivo, nenhuma entrada existente tocada |
| `interface/estilos` | `_reversa_sdd/code-analysis.md#Módulo 11` | componente-novo | Sétima folha, `consulta-puericultura.css`; `puericultura.css` e `globais.css` intocadas |
| `pages` | `_reversa_sdd/code-analysis.md#Módulo 12` | componente-novo | Rota `pages/puericultura/consulta.tsx` e o `import` da folha nova em `_app.tsx`; as oito rotas existentes inalteradas |
| `state-machines.md#3` | `_reversa_sdd/state-machines.md` | componente-novo | `EstadoDaConsulta` (`preenchendo → registro-disponível`), sem ritual de revisão e sem invalidação por edição: aqui a edição **é** o preenchimento, e o registro reflete o estado corrente a cada tecla |
| `domain.md` | `_reversa_sdd/domain.md#7`, `#8` | regra-nova | Dezoito regras de negócio novas, entre elas a composição da avaliação (RN-09b) e a supressão declarada de `MD-0026`; a fronteira de escopo ganha as três fichas que ficaram fora |
| Inventário textual | `_reversa_sdd/code-analysis.md` (cadeia da 018) | regra-alterada | Sexto módulo de classes em `MODULOS`, com predicado próprio antes do de `models/puericultura/` |
| `traceability/spec-impact-matrix.md` | `_reversa_sdd/traceability/` | componente-novo | Duas colunas novas, no precedente de isolamento das features 014 e 017 |
| ADR 0002 · 0004 · 0005 · 0011 · 0012 | `_reversa_sdd/adrs/` | sem delta | Privacidade, erro-como-valor, o motor informa, fonte única por unit e ritual só na insulina: os cinco preservados e exercitados. Registrado para leitura |

## 6. Delta no modelo de dados

- Resumo: nascem entidades **em memória** e um acervo **estático** de dado declarado — as dez fichas, seus campos e o registro montado. Nada é persistido, nenhuma tabela nasce, nenhuma migração existe. O banco do healthcheck segue sem dado clínico.
- Detalhe completo em: `_reversa_forward/020-consulta-puericultura-soap/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Texto do registro SOAP entregue à área de transferência | arquivo (saída de texto para consumo externo) | `_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md` |

`GET /api/v1/status` permanece byte a byte. Nenhuma integração de runtime é criada, e a única
operação assíncrona da feature continua sendo o acesso à área de transferência.

## 8. Plano de migração

n/a quanto a dados. A ordem de construção, que substitui a migração:

1. Contrato do domínio (`consulta/tipos.ts`) e as regras puras — seleção, montagem do registro, omissão do vazio —, com testes antes do dado.
2. Congelamento do oráculo das páginas (D-12) e o teste de transcrição, **antes** de transcrever as fichas: o guarda existe primeiro, e a transcrição nasce sob ele.
3. As dez fichas, uma a uma, cada qual verde no oráculo antes da seguinte.
4. Módulo de classes textuais (D-04) e a passagem do inventário; sem isso nada mais roda.
5. Projeção em texto, tela, painel de crescimento, rota e catálogo.
6. Integração, e2e, medição de bundle e acessibilidade.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Erro de transcrição em um dos ~350 rótulos, invisível à revisão de quem transcreveu | alto — é uma ferramenta que o prescritor confere contra a página | alto sem guarda | Oráculo de D-12, escrito **antes** da transcrição; ficha só se dá por pronta com o teste verde |
| O layout em duas colunas parte rótulos e a lista de exceções do oráculo deixa de ser fechada | médio — o guarda perde valor sem avisar | médio | Congelar as **duas** extrações (`-layout` e fluxo de leitura) e exigir ocorrência contígua em ao menos uma; se ainda assim a lista passar de dez itens, parar e reabrir a decisão em vez de crescer a exceção em silêncio |
| O inventário textual vira o gargalo da entrega, com o gerador parando a cada ficha | médio — atrasa sem risco clínico | alto se D-04 for recusada | D-04; e a ordem do §8, que põe o módulo de classes antes da tela |
| A ficha longa fica inacessível ou intransitável por teclado | alto — RF-17 e a baseline `axe` em 0/0 desde a 017 | médio | Cabeçalhos de seção na hierarquia da fonte, `fieldset`/`legend` por seção numerada, e a guarda e2e por rota |
| Arquivo ou função acima dos tetos de 400 e 50 linhas sob o volume textual | médio — dívida declarada no próprio requirements | alto sem D-02/D-11 | Um módulo por ficha, um componente por natureza de campo, folha de estilo própria |
| O painel de crescimento reintroduz custo de bundle na home ou na rota nova | baixo | baixo | `next/dynamic` (D-08) e a medição no molde de `medicao-bundle.md` da 019 |
| A feature 019 segue sem adendo, e a 020 já cita seu precedente de painel e cópia | baixo — risco de contexto, não de código | alto (é fato) | `/reversa-sync` da 019 antes da re-extração nº 4; o roadmap cita o código, que existe, e não o adendo, que falta |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] As dez fichas verdes no oráculo de transcrição (D-12), com a lista de exceções fechada e declarada
- [ ] `node scripts/inventariar-textos.mts --gerar` conclui sem candidato órfão, e a segunda execução deixa `git diff` vazio
- [ ] `tests/apoio/citacao-linha-de-base.json` e `e2e/axe-baseline.json` intocados (`git status` limpo quanto a eles)
- [ ] Texto exibido e texto copiado idênticos, afirmado por teste
- [ ] Suíte anterior verde sem alteração de asserção; nenhum motor existente tocado
- [ ] Medição de bundle mostrando que a rota nova não paga o painel de crescimento no primeiro carregamento
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-plan`, sobre o `requirements.md` esclarecido na mesma sessão | reversa |
