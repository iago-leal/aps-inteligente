# Requirements: Refatoração do cabeçalho — toggle de tema icônico e navegação de retorno à home

> Identificador: `011-refatora-cabecalho`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O cabeçalho comum de todas as telas (a Moldura) ganha duas melhorias de navegabilidade, sem tocar em nenhum motor de domínio. Primeiro, o alternador de tema deixa de ser um botão textual ("Tema claro" / "Tema escuro") e passa a ser um controle icônico (sol e lua), mais compacto e universalmente reconhecível. Segundo, o cabeçalho ganha um comando explícito de retorno à página inicial: hoje, ao entrar numa calculadora, não há caminho visível de saída de volta à home. A entrega é puramente de apresentação e navegação; regras clínicas, catálogo e cálculo permanecem intocados.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#moldura-comum` | A Moldura é o único acoplamento horizontal entre os domínios; cabeçalho com identidade, selo de privacidade e alternador de tema, envolvendo o `<main>` de cada tela | 🟢 |
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` | Moldura comum extraída (D-09): cabeçalho + `<main>`; a raiz `/` passou a ser a home por seções e cada calculadora ganhou rota própria | 🟢 |
| `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md` | Prop `apresentacao` ("padrao" / "destaque"); ícones Octicons pinados (`@primer/octicons-react`), tree-shaken; semântica idêntica entre variantes (RN-02) | 🟢 |
| `_reversa_sdd/addenda/009-logo-apsi-no-cabecalho.md` | Logo APSi no cabeçalho de todas as telas; nas calculadoras a logo é **marca decorativa** (`aria-hidden`, `alt=""`) e **deliberadamente não é link** (D-04) para não criar segundo elemento navegável | 🟢 |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | Identidade visual Primer integral; `data-tema` como marcador observável da preferência; controles são componentes Primer (`Button`, `Label`) | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | Privacidade por construção; o selo "Nada é salvo nem enviado" no cabeçalho é a sua expressão visível na interface | 🟢 |

Estado atual observado (código real `interface/comum/moldura.tsx`, `interface/estilos/cabecalho.css`):
- O cabeçalho tem duas zonas: **identidade** (logo/`h1` + subtítulo) à esquerda e **ações** à direita.
- A zona de ações contém o selo `Label` "Nada é salvo nem enviado" e um `Button` textual que alterna o tema, exibindo "Tema claro" quando o tema é escuro e "Tema escuro" quando é claro.
- A home distingue-se das calculadoras por passar `logoComoTitulo` à Moldura; as calculadoras não o passam. Não existe hoje nenhum controle de navegação para a home a partir das calculadoras.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor na APS | Alternar entre calculadoras durante o atendimento | Está na Calculadora de Insulina, precisa da de Idade Gestacional e quer voltar ao catálogo sem usar o botão do navegador |
| Qualquer usuário | Ajustar o tema ao ambiente (consultório claro/escuro) | Reconhece de imediato o controle sol/lua e alterna o tema com um clique |
| Usuário de leitor de tela | Navegar e operar os controles do cabeçalho | O alternador de tema, agora icônico, e o comando de início expõem nome acessível textual, sem depender do glifo |

## 4. Regras de negócio novas ou alteradas

Esta feature não altera nenhuma regra de negócio **clínica**. As regras abaixo governam a apresentação e a navegação da Moldura.

1. **RN-01:** O alternador de tema é representado por ícones — sol e lua — em vez de rótulo textual. O glifo exibido é o do **tema-alvo da ação**: sol quando o tema vigente é escuro (acionar clareia), lua quando é claro (acionar escurece). 🟢
   - Origem no legado: `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (alternador textual atual)
   - Tipo: alterada
2. **RN-02:** O alternador icônico preserva integralmente o comportamento funcional atual: um clique inverte o tema; a preferência continua sendo lida e gravada pelo mesmo mecanismo (`data-tema` observável). 🟢
   - Origem no legado: `_reversa_sdd/domain.md` (preferência de tema, RN-04 da feature 004)
   - Tipo: nova (invariante de preservação)
3. **RN-03:** O cabeçalho das telas de calculadora oferece um comando icônico (casa) de retorno à página inicial (`/`). A home **não** exibe esse comando, por ser redundante quando já se está na página inicial; a Moldura distingue os dois casos pela ausência/presença de `logoComoTitulo`. 🟢
   - Tipo: nova
4. **RN-04:** A refatoração preserva o selo de privacidade "Nada é salvo nem enviado" visível no cabeçalho de todas as telas; nenhum controle novo o remove ou o encobre. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md`
   - Tipo: nova (invariante de preservação)
5. **RN-05:** Todo controle icônico do cabeçalho (alternador de tema e comando de início) tem nome acessível textual e é operável por teclado; o ícone é decorativo perante a tecnologia assistiva. 🟢
   - Origem no legado: `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md` (padrão de ícone decorativo + nome acessível textual)
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Substituir o rótulo textual do alternador de tema por um controle icônico (sol/lua) | Must | O cabeçalho não exibe mais o texto "Tema claro"/"Tema escuro"; exibe um ícone (sol ou lua) como controle de alternância | 🟢 |
| RF-02 | Preservar o comportamento de alternância de tema | Must | Um clique/acionamento inverte o tema; `data-tema` alterna entre "claro" e "escuro"; a preferência persiste como hoje | 🟢 |
| RF-03 | Dar nome acessível textual ao alternador icônico, coerente com o tema-alvo | Must | O controle expõe rótulo textual "Ativar tema claro" quando o tema é escuro e "Ativar tema escuro" quando é claro, legível por leitor de tela; o glifo é `aria-hidden` | 🟢 |
| RF-04 | Adicionar comando icônico (casa) de retorno à home, apenas nas calculadoras | Must | Nas telas de calculadora (e não na home), um controle icônico casa no cabeçalho navega para `/`; a home não o exibe | 🟢 |
| RF-05 | Comando de início operável por teclado e com nome acessível | Must | O comando é alcançável por Tab, acionável por Enter/clique; o ícone casa é `aria-hidden` e há rótulo textual "Início" | 🟢 |
| RF-06 | Manter o selo de privacidade no cabeçalho | Must | "Nada é salvo nem enviado" continua visível no cabeçalho de todas as telas após a refatoração | 🟢 |
| RF-07 | Não introduzir regressão de layout responsivo | Should | Em viewport móvel (≤ 900px) os controles do cabeçalho permanecem legíveis, sem sobreposição nem overflow horizontal | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Zero coleta ou envio de dado; nenhuma telemetria nova; navegação de início é client-side/link interno | `_reversa_sdd/adrs/0002-...`, `0007-telemetria-nula-fase-1` | 🟢 |
| Acessibilidade | Contraste, nome acessível e operação por teclado dos controles icônicos preservam a baseline axe 0/0 | `_reversa_sdd/addenda/008-...` (axe-baseline 0/0) | 🟢 |
| Desacoplamento | A mudança fica contida na Moldura e na sua folha de estilo; motores de domínio (`models/*`) e catálogo intocados | `_reversa_sdd/architecture.md#moldura-comum` | 🟢 |
| Estética | Controles dentro do vocabulário Primer; sem cor própria; peso visual do bundle desprezível | `_reversa_sdd/addenda/004-...`, `008-...` | 🟢 |
| Observabilidade | Nenhuma exigência nova; a feature não emite eventos | `0007-telemetria-nula-fase-1` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: alternar tema pelo controle icônico
  Dado que estou em qualquer tela da plataforma no tema claro
  Quando aciono o controle de tema do cabeçalho
  Então o tema passa a escuro
  E o controle passa a indicar a ação inversa (voltar ao claro)
  E nenhum rótulo textual "Tema claro"/"Tema escuro" é exibido

Cenário: nome acessível do alternador icônico
  Dado que uso um leitor de tela
  Quando o foco chega ao controle de tema
  Então ouço um nome que descreve a ação (ex.: "Ativar tema escuro")
  E o glifo do ícone não é anunciado como conteúdo

Cenário: retornar à home a partir de uma calculadora
  Dado que estou na Calculadora de Insulina — DM2
  Quando aciono o comando de início do cabeçalho
  Então navego para a página inicial (/)
  E o catálogo de calculadoras é exibido

Cenário: selo de privacidade preservado
  Dado que a refatoração do cabeçalho foi aplicada
  Quando abro qualquer calculadora ou a home
  Então o selo "Nada é salvo nem enviado" continua visível no cabeçalho

Cenário: operação por teclado
  Dado que navego apenas pelo teclado
  Quando percorro o cabeçalho com Tab
  Então alcanço o comando de início e o alternador de tema
  E consigo acioná-los com Enter, sem depender do mouse
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 alternador icônico | Must | Núcleo do pedido do usuário |
| RF-02 preservar alternância | Must | Não pode haver regressão funcional do tema |
| RF-03 nome acessível do toggle | Must | Ícone-só sem rótulo quebra a baseline de acessibilidade |
| RF-04 comando de início | Must | Núcleo do pedido: sair da calculadora de volta à home |
| RF-05 início por teclado | Must | Consistência de acessibilidade com o restante da Moldura |
| RF-06 selo preservado | Must | Privacidade por construção é princípio do projeto |
| RF-07 sem regressão responsiva | Should | Qualidade de acabamento; o cabeçalho já é responsivo |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** Onde o comando de início deve aparecer no cabeçalho?
  **R:** Apenas nas calculadoras; ocultado na home, onde seria redundante (resolve RN-03, RF-04).
- **Q:** Qual a forma do comando de início?
  **R:** Só-ícone (casa), com nome acessível textual "Início", consistente com o novo toggle (resolve RF-04, RF-05).
- **Q:** O glifo do toggle de tema representa o quê?
  **R:** O tema-alvo da ação — sol quando o tema é escuro, lua quando é claro (resolve RN-01, RF-03).

## 10. Lacunas

> Nenhuma lacuna aberta. Todas as dúvidas iniciais foram resolvidas na Sessão 2026-07-23.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-23 | 3 dúvidas resolvidas por `/reversa-clarify` (escopo, forma e ícone) | reversa |
