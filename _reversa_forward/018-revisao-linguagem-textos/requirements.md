# Requirements: Revisão da linguagem dos textos da plataforma

> Identificador: `018-revisao-linguagem-textos`
> Data: `2026-07-26`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A prosa da plataforma nasceu feature a feature, sem norma declarada: cada tela trouxe seus títulos, descrições e mensagens conforme o autor do momento, e nada impede que a próxima calculadora traga outros. Esta feature entrega duas coisas indissociáveis. Primeiro, a **norma de redação do produto**, derivada das preferências de escrita do mantenedor e materializada como artefato consultável no repositório, com regras verificáveis em vez de conselhos. Segundo, a **revisão da prosa já publicada** contra essa norma, tela por tela, incluindo os metadados que saem para fora do navegador.

O beneficiário direto é quem lê: o prescritor na consulta, que encontra um texto uniforme em vez de cinco vozes. O beneficiário durável é o mantenedor, porque a norma escrita e verificada por teste substitui a lembrança de como se escrevia aqui.

A feature separa, e é o seu ponto mais delicado, o **texto autoral** do **texto citado da fonte clínica**. Rótulos transcritos de guia impresso não são prosa do produto: são citação, e permanecem como estão mesmo quando destoam da norma gramatical.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Quatro domínios clínicos sob casca comum, cada um com **fonte clínica única**; mescla de fontes proibida (ADR 0001/0011). O texto que cita a fonte herda essa disciplina. | 🟢 |
| `_reversa_sdd/architecture.md#5-qualidade-e-testes` | Pirâmide realizada com 37 arquivos de teste, integração nas telas e ponta a ponta com baseline de acessibilidade automatizada em 0/0 por rota. É o aparato que a revisão de texto vai atravessar. | 🟢 |
| `_reversa_sdd/domain.md#7-invariantes-transversais` | Invariante 3: toda saída carrega `ReferenciaClinica`. Invariante 5: constantes clínicas congeladas por `Object.freeze` em `fonte-clinica.ts`, como fonte única anti-drift. Os rótulos clínicos vivem sob essa mesma disciplina. | 🟢 |
| `_reversa_sdd/domain.md#7.1-regras-da-interface-com-forca-de-dominio` | Regra 9: a interface espelha as faixas do domínio importando as constantes, sem segunda fonte. Vale para número e vale para rótulo. | 🟢 |
| `_reversa_sdd/domain.md#7.2-regras-da-interface-com-forca-de-navegacao` | Nomes acessíveis do cabeçalho fixados por decisão ("Ativar tema claro/escuro"). Descreve `logoComoTitulo`, prop já removida pelo adendo 016: leia-se `comInicio`. | 🟡 |
| `_reversa_sdd/addenda/017-puericultura-crescimento.md` | Adendo vigente. O quinto domínio inaugurou a recusa **parcial** e trouxe rótulos transcritos literalmente da caderneta impressa, inclusive com concordância destoante da norma. | 🟢 |
| `_reversa_sdd/code-analysis.md#interface-inicio` | `catalogo.ts` é a fonte única das seções e rotas da home (D-07, anti-drift); título e descrição de cada calculadora nascem ali e a home apenas os renderiza. | 🟢 |
| `_reversa_sdd/code-analysis.md#interface-calculadora` | `rotulos.ts` é fonte única de texto compartilhada entre o painel de resultado e o plano copiável (feature 006, RN-03), para que tela e prontuário digam a mesma coisa. | 🟢 |
| `.reversa/principles.md#i-invariante-mae` | A spec é a fonte de verdade; o código é projeção dela. Revisar texto no código sem reconciliar a spec quebra o invariante. | 🟢 |
| `~/.claude/CLAUDE.md#estilo-de-escrita` | Norma de origem: coesão parafrástica, progressão econômica, correção como silêncio; pontuação em três eixos (sintático, expressivo, modal), com parcimônia nos sinais expressivos e o travessão acima de todos. | 🟢 |

### 2.1 Inventário preliminar da superfície textual

Varredura heurística de literais com três ou mais palavras em `interface/`, `pages/` e `models/`, excluídos comentários, testes e as tabelas antropométricas da Organização Mundial da Saúde (OMS). Contagem aproximada, a ser substituída pelo inventário exato de RF-02.

| Camada | Literais de prosa | Observação |
|---|---|---|
| `models/**` | ~179 | Mistura as duas naturezas: mensagens de validação são autorais, rótulos e localizações de referência são citação. | 🟢 |
| `interface/**` | ~90 | Predominantemente autoral: catálogo da home, blocos de proveniência, títulos de seção, nomes acessíveis. | 🟢 |
| `pages/**` | ~7 | `<title>` e `<meta name="description">` das cinco rotas mais a raiz. | 🟢 |
| `public/manifest.webmanifest` | 3 campos | `name`, `short_name`, `description` do aplicativo instalável. | 🟢 |

Concentração relevante: `models/insulina/fonte-clinica.ts` (~28), `interface/cardiologia/referencias.tsx` (~26), `models/puericultura/fonte-clinica.ts` (~25), `models/cardiopatia-isquemica/fonte-clinica.ts` (~15), `interface/inicio/catalogo.ts` (~11). Os arquivos `fonte-clinica.ts` são majoritariamente citação; `referencias.tsx` e `catalogo.ts`, majoritariamente autorais.

### 2.2 Acoplamento dos testes ao texto

O aparato de testes assevera texto visível e nome acessível em **224 ocorrências**, distribuídas por **33 arquivos** de teste, entre busca por texto exibido, por nome acessível e por rótulo de campo. Toda alteração de prosa revisada aparecerá como falha de suíte, o que é a propriedade desejada: a mudança é barulhenta, nunca silenciosa. A atualização desses testes é parte da entrega, não efeito colateral.

### 2.3 Achado de exatidão

🟢 A descrição da home em `pages/index.tsx` afirma que a plataforma cobre "Diabetes Mellitus tipo 2 e Pré-natal". O catálogo vigente tem **quatro seções**: as duas citadas, mais Cardiologia (duas calculadoras) e Puericultura. O texto que sai para buscadores e para o compartilhamento em redes descreve uma plataforma que já não existe. É desatualização de conteúdo, não de estilo, e entra no escopo por RF-04.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor na consulta | Ler a tela sem tropeçar, e reconhecer nela o material impresso que tem à mão | Abre a avaliação do crescimento com a caderneta aberta ao lado e confere se o rótulo da tela é o mesmo da página impressa |
| Prescritor que chega pela busca | Entender em uma frase o que a plataforma faz e o que ela cobre | Encontra o resultado no buscador e lê uma descrição que corresponde às quatro seções existentes |
| Mantenedor intermitente | Escrever a próxima tela sem redescobrir a norma | Abre o guia de redação antes de nomear a sexta calculadora e sabe, sem deliberar, como pontuar o subtítulo |
| Agente de codificação | Produzir texto conforme, sem depender de instrução repetida no prompt | Executa `/reversa-coding` de uma feature nova e encontra a norma como artefato do projeto, verificada por teste |

## 4. Regras de negócio novas ou alteradas

1. **RN-01: três classes de texto, e só uma é revisável.** Todo literal exibido ao usuário pertence a exatamente uma classe: **autoral** (escrito pelo produto), **citação** (transcrito de fonte clínica, incluindo rótulo de classificação, conduta e localização bibliográfica) ou **identificador** (chave, `id`, nome de campo, valor de `data-*`). A revisão alcança a classe autoral. A citação permanece byte a byte. O identificador está fora do escopo. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 5, constantes congeladas como fonte única)
   - Tipo: nova

2. **RN-02: a classe é dada pela origem do texto, nunca pelo arquivo onde ele mora.** Mensagens de validação em `models/*/validacao.ts` são autorais, porque nenhum guia impresso escreve "Informe o peso do paciente"; rótulos em `interface/**` podem ser citação, quando reproduzem a fonte. Classificar por diretório produziria erro nas duas direções. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1` (domínio puro não impede prosa autoral dentro dele)
   - Tipo: nova

3. **RN-03: pontuação pelos três eixos, com parcimônia no expressivo.** O texto autoral usa os sinais sintáticos livremente e reserva os expressivos, travessão à frente, para o que de fato marque subjetividade. Regra dura e verificável: **no máximo um par de travessões por bloco de texto autoral**, e nenhuma reticência ou exclamação em prosa de produto. O travessão é `—`, jamais o hífen `-` nem a sequência `--`. 🟢
   - Origem no legado: `~/.claude/CLAUDE.md#estilo-de-escrita`
   - Tipo: nova

4. **RN-04: revisão de forma nunca altera conteúdo clínico.** Nenhuma reescrita pode mudar número, unidade, faixa, corte, nome de fármaco, nome de exame, conduta ou o sentido de uma recusa. Alteração dessa natureza deixa de ser revisão de linguagem e exige feature própria, com validação do prescritor. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7` (invariante 6, o motor informa e não escolhe)
   - Tipo: nova

5. **RN-05: a revisão preserva a fonte única de texto.** Onde já existe um ponto único que alimenta dois consumidores, como `rotulos.ts` entre painel e plano copiável, ou `catalogo.ts` entre home e rotas, a reescrita acontece nesse ponto e em nenhum outro. A revisão não pode criar segunda fonte para o mesmo texto. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7.1` (regra 9) e `_reversa_sdd/code-analysis.md#interface-inicio` (D-07)
   - Tipo: nova

6. **RN-06: o texto que descreve a plataforma corresponde ao catálogo vigente.** Título, descrição e manifesto que enumeram o que a ferramenta cobre derivam do catálogo, ou são verificados contra ele. Enumeração desatualizada é defeito, não questão de estilo. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#interface-inicio` (catálogo como fonte única anti-drift)
   - Tipo: nova

7. **RN-07: o nome acessível descreve a ação, e a revisão de estilo não o degrada.** Rótulos de leitor de tela permanecem imperativos e específicos, no molde de "Ativar tema claro". Elegância de prosa não é razão para tornar um nome acessível vago. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7.2` (regra 12, nome acessível fixado por decisão)
   - Tipo: alterada, no sentido de passar a valer como restrição explícita da revisão

8. **RN-08: texto alterado é texto congelado.** Cada literal autoral revisado passa a ser asseverado por teste, de modo que alteração futura seja deliberada e visível na suíte, jamais um efeito colateral de refatoração. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#5` (disciplina de oráculos congelados já praticada no domínio)
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Guia de redação do produto como artefato versionado do repositório, derivado das preferências globais de escrita e reduzido a regras aplicáveis: as três classes de RN-01, os três eixos de pontuação, os tetos de RN-03, e o tratamento de siglas, números e unidades | Must | Existe arquivo único, citado pelo `CLAUDE.md` do projeto, cujas regras são todas ou verificáveis por teste ou ilustradas por par "antes/depois" retirado do próprio produto | 🟢 |
| RF-02 | Inventário completo e classificado de todos os literais exibidos ao usuário, cada um marcado como autoral, citação ou identificador, com arquivo e linha | Must | O inventário cobre `interface/**`, `pages/**`, `models/**` e `public/manifest.webmanifest`; nenhum literal exibido fica sem classe; a soma bate com a varredura de conferência | 🟢 |
| RF-03 | Revisão de todo texto da classe autoral contra o guia de RF-01 | Must | Cada literal autoral do inventário aparece como mantido, com justificativa de uma linha, ou reescrito, com o par "antes/depois" registrado | 🟢 |
| RF-04 | Correção da descrição da home, que enumera duas das quatro seções existentes | Must | A descrição de `pages/index.tsx` e a do manifesto correspondem ao catálogo vigente, verificado por teste contra `CATALOGO` | 🟢 |
| RF-05 | Verificação automatizada das regras mecânicas da norma sobre os textos autorais, integrada à suíte | Should | Existe teste que falha quando um literal autoral novo viola os tetos de RN-03 ou usa hífen no lugar de travessão; as citações de RN-01 ficam explicitamente isentas | 🟢 |
| RF-06 | Congelamento por teste dos textos autorais revisados | Should | Alterar qualquer literal autoral revisado quebra ao menos um teste, com mensagem que aponta o guia | 🟢 |
| RF-07 | Preservação verificada de toda a classe citação | Must | Comparação automática entre o estado anterior e o posterior demonstra zero alteração nos literais classificados como citação | 🟢 |
| RF-08 | Atualização dos testes que asseveram texto visível e nome acessível, em razão das reescritas de RF-03 | Must | Suíte integralmente verde; nenhuma asserção removida para acomodar a mudança, apenas atualizada | 🟢 |
| RF-09 | Reconciliação da spec com o texto revisado, na disciplina do Princípio I | Should | Os artefatos da extração que citam literais alterados são apontados no relatório da feature, para absorção por `/reversa-sync` | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Compatibilidade | Nenhuma mudança de comportamento observável além do texto: mesmas rotas, mesmos cálculos, mesmos estados | A feature é de superfície; qualquer delta de cálculo indica erro de execução | 🟢 |
| Acessibilidade | Baseline `axe` permanece 0/0 por rota, e todo elemento interativo mantém nome acessível não vazio | `_reversa_sdd/architecture.md#5` (e2e com axe-baseline por rota) | 🟢 |
| Desempenho | Variação de bundle desprezível, por se tratar de troca de literais; qualquer crescimento acima de 1 kB gzip por rota deve ser declarado | Método de medição já estabelecido em `_reversa_forward/017-puericultura-crescimento/medicao-bundle.md` | 🟢 |
| Manutenibilidade | O guia de RF-01 é curto o bastante para ser lido inteiro antes de escrever uma tela, e suas regras duras cabem no teste de RF-05 | Contexto operacional do mantenedor: norma que só existe em prosa longa não sobrevive a seis meses de pausa | 🟡 |
| Privacidade | Nenhum texto revisado passa a coletar, exibir ou transmitir dado do paciente | ADR 0002, privacidade por construção | 🟢 |
| Rastreabilidade | Cada reescrita registra o literal anterior, de modo que a revisão seja auditável sem recorrer ao `git log` | Princípio VI, rastreabilidade bidirecional | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: prosa autoral revisada conforme a norma
  Dado um literal da classe autoral que hoje usa três travessões em uma frase
  Quando a revisão da feature é aplicada
  Então o literal passa a usar no máximo um par de travessões
  E o par "antes/depois" fica registrado no relatório da feature

Cenário: rótulo transcrito da fonte impressa permanece intacto
  Dado o rótulo "Comprimento adequada", transcrito da Caderneta da Criança
  Quando a revisão da feature é aplicada
  Então o rótulo permanece byte a byte idêntico
  E a comparação automática de RF-07 acusa zero alteração na classe citação

Cenário: descrição da plataforma corresponde ao catálogo
  Dado que o catálogo declara quatro seções
  Quando a descrição da home é lida
  Então ela não enumera um subconjunto próprio dessas seções
  E o teste que a compara ao catálogo passa

Cenário: texto novo fora da norma é barrado
  Dado um literal autoral novo que usa hífen onde caberia travessão
  Quando a suíte é executada
  Então o teste de RF-05 falha
  E a mensagem de falha aponta a regra do guia que foi violada

Cenário: revisão que alteraria conteúdo clínico é recusada
  Dado um literal autoral cuja reescrita mudaria a unidade de uma dose
  Quando a revisão é proposta
  Então a alteração é rejeitada por RN-04
  E o literal permanece como está, com a razão registrada

Cenário: nome acessível preservado em especificidade
  Dado o nome acessível "Ativar tema claro"
  Quando a revisão de estilo é aplicada ao cabeçalho
  Então o nome acessível continua descrevendo a ação de forma imperativa e específica
  E o baseline de acessibilidade automatizada permanece 0/0

Cenário: inventário fechado, sem literal órfão
  Dado o conjunto de literais exibidos ao usuário nas cinco rotas e no manifesto
  Quando o inventário da feature é conferido contra uma varredura independente
  Então todo literal exibido tem exatamente uma classe atribuída
  E não resta literal sem classe nem literal classificado em duas

Cenário: norma consultável antes de escrever
  Dado um mantenedor que abre o projeto após meses de pausa
  Quando ele procura como pontuar o subtítulo de uma tela nova
  Então encontra a regra no guia de redação apontado pelo CLAUDE.md do projeto
  E a regra vem acompanhada de um par "antes/depois" tirado do próprio produto

Cenário: alteração futura de texto revisado não passa silenciosa
  Dado um literal autoral já revisado e congelado
  Quando alguém o altera sem atualizar a asserção correspondente
  Então a suíte falha
  E a mensagem de falha aponta o guia de redação

Cenário: entrega com suíte verde
  Dado que as reescritas quebraram asserções de texto existentes
  Quando a feature é dada por concluída
  Então todas as asserções afetadas foram atualizadas, nenhuma removida
  E a suíte completa passa

Cenário: literais alterados que a extração cita são reportados
  Dado um literal reescrito que aparece transcrito em artefato da extração
  Quando o relatório da feature é fechado
  Então esse artefato consta da lista de reconciliação
  E a lista fica disponível para a convergência posterior da extração
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 guia de redação | Must | Sem norma escrita, a revisão é gosto pessoal de uma tarde e a deriva recomeça na feature seguinte |
| RF-02 inventário classificado | Must | "Todos os textos" só é verificável contra uma lista fechada; sem ela não há critério de pronto |
| RF-03 revisão da prosa autoral | Must | É o pedido literal |
| RF-04 descrição desatualizada | Must | Defeito de exatidão já constatado, visível a quem chega pela busca |
| RF-07 preservação da citação | Must | Alterar rótulo de fonte cria divergência entre a tela e o material impresso na mão do prescritor |
| RF-08 testes atualizados | Must | 224 asserções de texto quebram junto; entrega sem suíte verde não é entrega |
| RF-05 verificação automatizada | Should | Converte a norma em guardrail; sem ela a regra depende de lembrança |
| RF-06 congelamento por teste | Should | Torna deliberada a mudança futura, no molde dos oráculos já usados no domínio |
| RF-09 reconciliação da spec | Should | Princípio I; pode ser absorvida por `/reversa-sync` ao fim do ciclo |
| Revisão de comentários de código e documentação do repositório | Won't, nesta feature | Fora de "textos do website"; ver lacuna L-01 |
| Tradução ou versão em outro idioma | Won't | Não pedido, e multiplicaria a superfície a manter |
| Redesenho de layout, hierarquia visual ou tipografia | Won't | Feature de linguagem, não de design; alterações visuais têm ciclo próprio |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- 🔴 **L-01 [DÚVIDA] Fronteira de "website".** A leitura assumida é: entra tudo o que o usuário lê na tela mais o que sai para fora do navegador, ou seja `interface/**`, `pages/**` incluindo `<title>` e `<meta>`, os literais autorais de `models/**` e o `manifest.webmanifest`. Ficam fora os comentários de código, o `README.md`, os artefatos de `_reversa_sdd/` e as mensagens de commit. Confirmar, porque incluir a documentação do repositório multiplicaria o escopo por uma ordem de grandeza.
- 🔴 **L-02 [DÚVIDA] Rótulos de fonte com desvio de norma.** A Caderneta da Criança imprime "Peso elevado para idade", "Comprimento adequada" e "Baixa comprimento", concordâncias que destoam da norma culta e que o produto hoje reproduz deliberadamente, para que a tela case com a página impressa. O pedido diz "todos os textos"; a posição registrada em `models/puericultura/fonte-clinica.ts` diz que corrigir criaria divergência onde a fonte não tem nenhuma. Confirmar que a citação prevalece, e se cabe sinalizar o desvio ao leitor, por exemplo com uma nota de que o rótulo reproduz o impresso.
- 🔴 **L-03 [DÚVIDA] Alcance do guardrail.** A norma fica como guia consultável mais teste automatizado no repositório, como propõem RF-01 e RF-05, ou sobe também a princípio formal em `.reversa/principles.md`, com numeração romana e impacto declarado nos templates? A segunda via exige uma passagem por `/reversa-principles`, que é ato separado desta feature.
- 🟡 **L-04 Separador tipográfico.** O ponto médio "·" aparece em subtítulos, títulos de página e no manifesto, no molde de "Calculadoras clínicas para a Atenção Primária à Saúde · cálculo 100% no navegador". Não é sinal de pontuação dos três eixos, e sim recurso tipográfico de separação. A norma precisa decidir se ele permanece, e em quais posições, antes que RF-03 toque esses textos.
- 🟡 **L-05 Grafia de números e unidades.** Não há regra declarada para decimal com vírgula, espaço antes de unidade, uso de "≥" contra "maior ou igual a", nem para a forma das siglas na primeira ocorrência. São escolhas que aparecem em dezenas de literais e que o guia de RF-01 precisa fixar para que RF-03 seja mecânico em vez de opinativo.
- 🟡 **L-06 Registro do modo imperativo.** Mensagens de validação alternam entre imperativo direto, como "Informe o peso do paciente", e constatação impessoal, como "Peso fora da faixa plausível". A alternância pode ser deliberada, distinguindo ausência de valor implausível, ou acidental. O guia deve decidir, porque a escolha atravessa as cinco telas.
- 🟡 **L-07 Desalinhamento herdado da extração.** `_reversa_sdd/domain.md` §7.2 regra 11 ainda descreve a prop `logoComoTitulo`, removida pelo adendo 016. Não afeta esta feature, mas quem ler a citação da seção 2 encontrará a discrepância; a correção pertence à re-extração nº 4.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-26 | Versão inicial gerada por `/reversa-requirements` | reversa |
