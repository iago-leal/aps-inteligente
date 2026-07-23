# Requirements: Estrutura do cabeçalho da home unificada com a das calculadoras

> Identificador: `016-estrutura-cabecalho-home`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA
> Categoria (Princípio nº 4): **Aplicação** — evolução de apresentação **e de contrato de componente** (`Moldura`), sem tocar domínio nem catálogo.

## 1. Resumo executivo

A feature 015 unificou o **alinhamento** vertical da barra de ações (ícones ancorados ao topo, coincidentes entre telas), mas restou uma divergência de **altura**: o cabeçalho da home mede 200,5px e o das quatro calculadoras, 209,0px. A causa é estrutural — a calculadora empilha três blocos na identidade (`marca decorativa + h1 do nome + subtítulo`), enquanto a home funde `logo = h1` e tem só dois blocos. Esta feature dá à home a **mesma composição de três blocos** das calculadoras, tornando a altura igual **por construção** — sem `min-height` nem px chumbado — e, no caminho, corrige um acoplamento na `Moldura`: hoje uma única prop (`logoComoTitulo`) governa duas preocupações ortogonais (se a logo é o `h1` e se o comando de início aparece). A home deixa de ser caso especial; a variante `destaque` reduz-se à coluna de 720px.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/interface-comum/requirements.md#responsabilidades` | A `Moldura` trata a logo como `h1` (home, `logoComoTitulo`) ou como marca decorativa (calculadoras, `aria-hidden`); **e** oferece o comando de início "apenas nas calculadoras (`!logoComoTitulo`)". As duas responsabilidades pendem da mesma flag. | 🟢 |
| `_reversa_sdd/interface-comum/requirements.md#regras-de-negócio` | RN-03/RN-05: com `logoComoTitulo`, a logo é `<img>` dentro do `h1` com `alt` igual ao título (nome acessível preservado); sem a prop, é marca decorativa sem segundo h1. RN-02: a variante é puramente visual. | 🟢 |
| `_reversa_sdd/domain.md#7.2` (regra 11) | "Comando de início só nas calculadoras (D-03/D-04): a `Moldura` renderiza o `IconButton` de casa apenas quando `logoComoTitulo` é falso — na home seria redundante." É o **comportamento** a preservar; o **mecanismo** (derivar de `logoComoTitulo`) é o que muda. | 🟢 |
| `_reversa_sdd/interface-inicio/requirements.md#responsabilidades` | A home monta as seções sobre a `Moldura` em variante `destaque` + `logoComoTitulo`, numa **coluna clínica de 720px** (`.inicio-secoes`). | 🟢 |
| `_reversa_sdd/interface-estilos/requirements.md#responsabilidades` | `cabecalho.css` governa a família `.cabecalho*`; `inicio.css` (188) guarda o hero em variante `destaque`, seções e cartões. Teto de 400 linhas por folha, só tokens `var(--*)`. | 🟢 |
| `_reversa_sdd/addenda/015-cabecalho-unificado.md` (vigente) | A 015 tornou `align-items: flex-start` regra-única do alinhamento; a divergência de **altura** ficou explicitamente para esta feature. | 🟢 |

### Diagnóstico (medição, viewport 1280px)

`home = 200,5px`; `idade-gestacional = insulina = dor-toracica = risco-cardiovascular = 209,0px`. As quatro calculadoras são idênticas entre si; só a home destoa, por lhe faltar a linha do título textual. A diferença é irredutível por CSS de altura sem fixar um valor — daí a escolha de igualar a **estrutura**, não a métrica.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor (anônimo) — único papel (`_reversa_sdd/domain.md#papéis`) | Navegar entre home e calculadoras sem o topo "pular" | Ao ir da home a `/dm2/insulina`, o cabeçalho tem a mesma altura; nada salta. |
| Mantenedor (Iago) | Cabeçalho com fonte única e sem número mágico, retomável em 12 meses | A altura emerge do conteúdo; a `Moldura` tem props de responsabilidade única; um teste avisa se alguma tela divergir. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A identidade do cabeçalho da home adota a **mesma composição estrutural** das calculadoras — `marca decorativa (34px, aria-hidden) + h1 textual + subtítulo` —, de modo que a altura do cabeçalho seja igual entre home e calculadoras **por construção**, sem valor de altura fixo. 🟢
   - Origem no legado: `_reversa_sdd/interface-comum/requirements.md#regras-de-negócio` (RN-03/RN-05); `_reversa_sdd/addenda/015-cabecalho-unificado.md`.
   - Tipo: alterada (estrutura de apresentação da home).
2. **RN-02:** O `h1` da home passa a ser o **texto "APS Inteligente"**; a logo vira marca decorativa (`aria-hidden`, `alt=""`), como nas calculadoras. O **nome acessível** do heading permanece "APS Inteligente" (era o `alt` da logo) — delta de acessibilidade nulo. 🟢
   - Origem no legado: `_reversa_sdd/interface-comum/requirements.md#regras-de-negócio` (RN-03/RN-05).
   - Tipo: alterada (semântica de apresentação; um h1 por tela preservado).
3. **RN-03:** A exibição do **comando de início** (⌂) deixa de ser derivada de `logoComoTitulo` e passa a um **contrato próprio** na `Moldura` (prop dedicada, default = ausente). Como a logo passa a ser marca decorativa em **todas** as telas (RN-02), `logoComoTitulo` fica sem uso e é **removida** do contrato — cada prop com responsabilidade única (SRP pleno). Preserva-se o **comportamento** da regra 11 (`_reversa_sdd/domain.md#7.2`): início ausente na home, presente nas calculadoras. 🟢 _(esclarecido em 2026-07-23)_
   - Origem no legado: `_reversa_sdd/domain.md#7.2` (regra 11); `_reversa_sdd/interface-comum/requirements.md#responsabilidades`.
   - Tipo: alterada (mecanismo/contrato; comportamento inalterado). Reduz acoplamento (SRP).
4. **RN-04:** A variante `destaque` **permanece apenas** como a coluna de 720px que alinha o cabeçalho ao corpo da home; a **tipografia do hero** (feature 008: h1 maior, subtítulo maior, gaps maiores) é **aposentada** — a home passa à tipografia padrão das calculadoras. 🟢
   - Origem no legado: `_reversa_sdd/interface-estilos/requirements.md#responsabilidades`; `_reversa_sdd/interface-inicio/requirements.md#responsabilidades`.
   - Tipo: alterada (redução da variante; hero tipográfico removido).
5. **RN-05 (preservada):** Contrato semântico e de privacidade intocado — um `h1` por tela, selo "Nada é salvo nem enviado" sempre visível, alternador exibindo o tema-alvo, logo por tema, só tokens Primer sem cor literal, teto de 400 linhas por folha. 🟢
   - Origem no legado: `_reversa_sdd/interface-comum/requirements.md#regras-de-negócio`; `_reversa_sdd/interface-estilos/requirements.md#regras-de-negócio`.
   - Tipo: não alterada (escopo negativo).

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Altura do cabeçalho igual entre a home e todas as calculadoras, **por construção** | Must | Guarda e2e mede a altura do `.cabecalho` em todas as rotas e exige coincidência (tolerância ±2px); **nenhuma** regra CSS fixa a altura do cabeçalho (`min-height`/`height`) | 🟢 |
| RF-02 | Home com a estrutura de três blocos das calculadoras | Must | DOM da identidade da home: `marca aria-hidden` + `h1` textual "APS Inteligente" + subtítulo + selo — mesma ordem e tipos das calculadoras | 🟢 |
| RF-03 | Comando de início desacoplado de `logoComoTitulo` na `Moldura`; prop `logoComoTitulo` removida (órfã) | Must | Prop dedicada (default ausente) governa a presença do ⌂; `logoComoTitulo` não existe mais no contrato; e2e confirma início **ausente na home** e **presente nas calculadoras** (guardas da 011 seguem verdes) | 🟢 |
| RF-04 | Contrato semântico e de acessibilidade preservado | Must | Um `h1` por tela; nome acessível "APS Inteligente" na home; `axe-baseline` 0/0 por rota | 🟢 |
| RF-05 | Variante `destaque` reduzida à coluna de 720px; hero tipográfico aposentado | Should | Nenhuma regra de tipografia de hero em `inicio.css`; a variante só ajusta a coluna; folhas < 400 linhas; só `var(--*)` | 🟢 |
| RF-06 | Guarda de altura falha **barulhento** se qualquer tela divergir | Should | O teste de RF-01 quebra com mensagem clara ao primeiro desvio > tolerância (observabilidade de regressão) | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Manutenibilidade | Altura emergente do conteúdo, sem constante de layout a manter em sincronia | Princípio nº 5 (mínima dívida); decisão registrada na conversa da feature | 🟢 |
| Baixo acoplamento | `Moldura` com props de responsabilidade única (logo-como-h1 × comando de início separados) | `_reversa_sdd/interface-comum/requirements.md#responsabilidades` (acoplamento atual) | 🟢 |
| Acessibilidade | Um h1 por tela; `axe-baseline` 0/0; nome acessível preservado | `_reversa_sdd/interface-comum/requirements.md#requisitos-não-funcionais` | 🟢 |
| Regressão | Guardas geométricas da 011/013/015 atualizadas, não removidas; guarda de altura nova cobre todas as telas | `_reversa_sdd/code-analysis.md#testes` | 🟢 |
| Reprodutibilidade | Sem novas dependências; suíte (vitest + Playwright + axe) verde | Estado do repositório | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Altura idêntica em toda a plataforma
  Dado a home e cada calculadora na mesma largura de viewport
  Quando meço a altura do cabeçalho em todas as telas
  Então todas coincidem dentro da tolerância, sem que o CSS fixe uma altura

Cenário: Home com estrutura de calculadora
  Dado a home renderizada
  Quando inspeciono a identidade do cabeçalho
  Então há uma marca decorativa (aria-hidden), um h1 textual "APS Inteligente" e um subtítulo

Cenário: Comando de início preserva o comportamento (guarda)
  Dado a home e uma calculadora
  Quando inspeciono a barra de ações
  Então o comando de início está ausente na home e presente na calculadora — como antes

Cenário: Acessibilidade intocada (caso de guarda)
  Dado qualquer tela após a mudança
  Quando rodo o axe e conto os headings
  Então há exatamente um h1 por tela e a linha de base de acessibilidade permanece 0/0

Cenário: Sem número mágico de altura (caso negativo)
  Dado o CSS do cabeçalho após a mudança
  Quando busco regras de altura fixa no .cabecalho
  Então não encontro min-height nem height chumbados
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 altura igual por construção | Must | É a queixa e a Demanda de fundo (cabeçalho como peça única) |
| RF-02 estrutura de três blocos na home | Must | É o meio que entrega RF-01 sem px chumbado |
| RF-03 desacoplar o comando de início | Must | Pré-condição de RF-02 (senão a home ganha o ⌂ proibido) e ganho de coesão |
| RF-04 contrato/acessibilidade preservados | Must | Não-regressão inegociável |
| RF-05 variante reduzida / hero aposentado | Should | Reduz dívida; o núcleo é a altura e a estrutura |
| RF-06 guarda barulhenta | Should | Observabilidade; protege a invariante no tempo |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** Se o subtítulo da home não couber em uma linha na coluna de 720px com a tipografia padrão (12px), qual a política? **R:** Medir antes; encurtar só se preciso. Durante a implementação, mede-se o subtítulo na largura de 720px com a tipografia padrão; se quebrar em duas linhas, adota-se uma versão enxuta na home (afinada no plano); se couber em uma linha, mantém-se o texto atual. A altura idêntica (RF-01) prevalece sobre a preservação do texto integral.
- **Q:** Com a logo virando decorativa em todas as telas e o h1 sempre textual, `logoComoTitulo` fica órfã — o que fazer com o contrato da `Moldura`? **R:** Remover `logoComoTitulo` de vez e governar o comando de início por uma prop dedicada (default ausente). Contrato mínimo, uma responsabilidade por prop (SRP pleno).
- **Q:** A 016 aposenta a tipografia de hero da home (feature 008), igualando-a às calculadoras. Confirma a reversão estética? **R:** Sim, aposentar o hero — a home passa à tipografia padrão; é o que torna a altura idêntica por construção.
- **Q:** Que texto para o h1 textual da home, dado que ele segue a marca decorativa? **R:** "APS Inteligente" — preserva o nome acessível atual (era o `alt` da logo), com delta de acessibilidade nulo; aceita-se a leve repetição visual marca+texto.

## 10. Lacunas

- ✅ **Resolvida (sessão 2026-07-23):** a política do subtítulo da home ficou definida — medir na largura de 720px durante a implementação e encurtar para uma versão enxuta apenas se o texto atual quebrar em duas linhas; do contrário, mantê-lo. Ver §9.
- Nenhuma lacuna `[DÚVIDA]` em aberto após a sessão de esclarecimentos.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-23 | Sessão de esclarecimentos: subtítulo (medir/encurtar), remoção de `logoComoTitulo`, hero aposentado, h1 "APS Inteligente" | reversa-clarify |
