# Requirements: Proporções do cabeçalho da calculadora (padrão) alinhadas à home

> Identificador: `013-cabecalho-proporcoes`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Nas telas de calculadora (variante `padrao` da Moldura), o cabeçalho perdeu as proporções da porta de entrada: o conteúdo (logo, título, subtítulo, selo) cola na borda esquerda da página e os botões de ação colam na borda direita, desalinhados da coluna centrada do corpo, a faixa ficou baixa e **até a logo APSi encolhe** (24px de marca contra 34px de wordmark na home). A home (variante `destaque`) é a referência correta: ali o cabeçalho compartilha a mesma coluna do corpo, respira na vertical e a logo tem o tamanho pleno. A feature restaura, no cabeçalho `padrao`, esses três atributos — **centralização na coluna do conteúdo**, **altura** e **tamanho da logo** — sem tocar semântica, domínio ou catálogo. É correção só de apresentação (CSS), replicando a doutrina visual já aprovada da home.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/interface-estilos/requirements.md#requisitos-funcionais` | `cabecalho.css` é a cola de layout do cabeçalho sobre tokens Primer; a variante `destaque` (hero da home) usa coluna clínica centrada | 🟢 |
| `_reversa_sdd/interface-estilos/requirements.md#regras-de-negócio` | RN-01: só tokens `var(--*)` do Primer, nenhuma cor/fonte/sombra própria; teto de 400 linhas por folha | 🟢 |
| `_reversa_sdd/interface-comum/requirements.md#regras-de-negócio` | RN-02: a variante de apresentação (`data-apresentacao`) é puramente visual; a semântica (h1, selo, alternador) é idêntica em `padrao` e `destaque` | 🟢 |
| `_reversa_sdd/interface-inicio/requirements.md#requisitos-funcionais` | RF-04 (008): a home usa `apresentacao="destaque"`; hero em coluna centrada — a referência de proporção pedida | 🟢 |
| `_reversa_sdd/addenda/008-design-mais-bonito-da-home.md` | A variante `destaque` deu ao cabeçalho da home peso de porta de entrada (coluna centrada de 720px, altura generosa) | 🟢 |
| `_reversa_sdd/addenda/011-refatora-cabecalho.md` | Última mexida no cabeçalho `padrao` (toggle icônico + comando de início) e migração do selo para a identidade — vizinhança da regressão percebida | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | O selo "Nada é salvo nem enviado" é garantia fixa; apresentação não pode enfraquecê-lo | 🟢 |

Observação: `interface-estilos/requirements.md` ainda descreve `cabecalho.css` com 72 linhas; o arquivo real está em 98 (delta do ajuste do selo, adendo 011 — atualização 2026-07-23). Não afeta esta feature, que trabalha sobre o arquivo real.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor na APS | Usar a calculadora com uma interface coesa e legível | Ao abrir `/dm2/insulina`, `/pre-natal/idade-gestacional` ou a de cardiologia, o cabeçalho tem a mesma proporção equilibrada da home, sem sensação de layout quebrado |
| Mantenedor (o próprio autor) | Manter uma linguagem visual única entre home e calculadoras | Uma só doutrina de cabeçalho (compartilhar a coluna do corpo + respiro), replicada da home para o `padrao` |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O cabeçalho `padrao` alinha seu conteúdo à mesma coluna centrada do corpo da tela (a coluna clínica da calculadora), em vez de estender-se de borda a borda da página. 🟢
   - Origem no legado: replica o princípio de `_reversa_sdd/interface-inicio/requirements.md#requisitos-funcionais` (RF-04/008, hero em coluna centrada), aplicado agora ao `padrao`.
   - Tipo: nova (regra de apresentação)
2. **RN-02:** O cabeçalho `padrao` recupera altura (respiro vertical) comparável à do cabeçalho `destaque` da home, tomada como referência. 🟢
   - Tipo: nova (regra de apresentação)
3. **RN-03:** A mudança é exclusivamente de apresentação, sobre tokens `var(--*)` do Primer, sem cor/fonte/sombra própria (RN-01 de `interface-estilos`); a semântica do cabeçalho (h1, subtítulo, selo, alternador, comando de início) permanece byte a byte, preservando RN-02 de `interface-comum`. 🟢
   - Origem no legado: `_reversa_sdd/interface-estilos/requirements.md#regras-de-negócio`, `_reversa_sdd/interface-comum/requirements.md#regras-de-negócio`
   - Tipo: invariante preservada
4. **RN-04 (premissa de referência 🟡):** A coluna de alinhamento do cabeçalho `padrao` é a **coluna do corpo da própria calculadora** (largura de conteúdo de `.calc-regioes`, 1180px centrados com gutter de 32px), não a coluna estreita de 720px da home. Justificativa: o formulário da calculadora precisa da largura; replicar o *princípio* da home (cabeçalho compartilha a coluna do corpo e respira) é mais fiel que copiar a largura absoluta. A validação final é visual, na fase de coding. 🟡
5. **RN-05:** A logo APSi tem o **mesmo tamanho** no cabeçalho `padrao` (marca decorativa, `.cabecalho-marca`) e na home (wordmark, `.cabecalho-logo`), tomando a home como referência (34px de altura). Revê a decisão da feature 009 de manter a marca "um degrau menor"; a semântica permanece (marca decorativa `aria-hidden`, sem virar link nem segundo h1 — RN-03/RN-05 de `interface-comum` íntegras). 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Alinhar o conteúdo do cabeçalho `padrao` à coluna centrada do corpo | Must | Em viewport largo (≥ 1180px), a borda esquerda do bloco de identidade coincide com a borda esquerda do conteúdo de `.calc-regioes`, e a borda direita da zona de ações coincide com a borda direita desse conteúdo (tolerância ≤ 2px) | 🟢 |
| RF-02 | Restaurar altura/respiro vertical do cabeçalho `padrao` | Must | O padding vertical do cabeçalho `padrao` aumenta em relação aos atuais 20px, aproximando-se do ritmo do `destaque` (referência ~44px topo / ~36px base), validado por comparação visual lado a lado com a home | 🟢 |
| RF-03 | Preservar a semântica e o conteúdo do cabeçalho | Must | `git diff` em `models/`, `catalogo.ts` e nos textos/nomes acessíveis vazio; nenhum teste de integração/e2e existente precisa alterar asserção de conteúdo | 🟢 |
| RF-04 | Não regredir a home nem outras variantes | Must | A variante `destaque` (home) permanece pixel-idêntica; o override de `destaque` continua vencendo o base por especificidade | 🟢 |
| RF-05 | Manter o comportamento responsivo | Should | Em ≤ 900px o cabeçalho continua com respiro reduzido e nada transborda horizontalmente; o alinhamento de coluna degrada para gutter simples de borda | 🟢 |
| RF-06 | Coerência entre as três calculadoras | Should | A correção no `padrao` vale igualmente para insulina, idade gestacional e cardiopatia isquêmica (todas usam a Moldura `padrao`) | 🟢 |
| RF-07 | Igualar o tamanho da logo APSi ao da home | Must | A altura de `.cabecalho-marca` passa a 34px (igual a `.cabecalho-logo` da home); largura automática preserva a proporção 314×138 | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Manutenibilidade | Alteração contida em `cabecalho.css`; folha permanece < 400 linhas | RN de teto de 400 em `_reversa_sdd/interface-estilos/requirements.md#regras-de-negócio` | 🟢 |
| Consistência visual | Só tokens Primer; nenhuma cor/fonte/sombra literal | RN-01 (004) de `interface-estilos` | 🟢 |
| Acessibilidade | `axe` baseline permanece em zero violação nas telas afetadas | Harness Playwright+axe da feature 004 | 🟢 |
| Desempenho | Delta de bundle nulo (só CSS; nenhum ativo/JS novo) | Mudança CSS pura | 🟢 |
| Regressão | Suíte de integração (`moldura.test.tsx`) e e2e (`plataforma.spec.ts`, specs por calculadora) permanecem verdes sem alterar asserções de conteúdo | Ciclo forward 007–011 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Cabeçalho da calculadora alinhado à coluna do corpo
  Dado que abro /dm2/insulina em um viewport de 1280px
  Quando observo o cabeçalho e o corpo da calculadora
  Então a borda esquerda da identidade do cabeçalho coincide com a borda esquerda do conteúdo de .calc-regioes
  E a borda direita da zona de ações coincide com a borda direita desse conteúdo
  E o cabeçalho tem respiro vertical comparável ao da home (não a faixa comprimida de 20px)

Cenário: A home permanece intocada
  Dado que abro / (home) em um viewport de 1280px
  Quando comparo com a captura anterior à feature
  Então o cabeçalho da home (variante destaque) permanece pixel-idêntico

Cenário: Logo com o mesmo tamanho da home
  Dado que abro uma calculadora e a home no mesmo tema
  Quando meço a altura da logo APSi em cada uma
  Então a marca da calculadora (.cabecalho-marca) tem a mesma altura do wordmark da home (.cabecalho-logo)

Cenário: Semântica preservada
  Dado o cabeçalho de qualquer calculadora
  Quando inspeciono o DOM
  Então o h1, o subtítulo, o selo "Nada é salvo nem enviado", o alternador de tema e o comando de início permanecem presentes, com os mesmos nomes acessíveis

Cenário (negativo): Viewport estreito não transborda
  Dado que abro uma calculadora em 375px de largura
  Quando observo o cabeçalho
  Então nada transborda horizontalmente e o respiro é o reduzido do modo móvel
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (alinhar à coluna) | Must | É o cerne da regressão percebida (centralização) |
| RF-02 (altura) | Must | Segundo atributo explicitamente citado pelo usuário |
| RF-03 (semântica preservada) | Must | Invariante não-negociável do projeto (só apresentação) |
| RF-04 (não regredir a home) | Must | A home é a referência; não pode piorar |
| RF-07 (tamanho da logo) | Must | Terceiro atributo citado pelo usuário ("até a logo muda de tamanho") |
| RF-05 (responsivo) | Should | Preservar comportamento já existente |
| RF-06 (três calculadoras) | Should | Coerência entre telas irmãs |
| RNF de acessibilidade/regressão | Must | Gate de qualidade do ciclo forward |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna bloqueante. A única premissa aberta (RN-04, coluna de referência = corpo da calculadora, 1180px) está marcada como 🟡 e será validada visualmente na fase de coding, sem impedir o planejamento.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
