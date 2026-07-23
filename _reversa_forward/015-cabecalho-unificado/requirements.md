# Requirements: Cabeçalho unificado entre home e calculadoras

> Identificador: `015-cabecalho-unificado`
> Data: `2026-07-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA
> Categoria (Princípio nº 4): **Aplicação** — feature de apresentação sobre a `Moldura` compartilhada, sem tocar domínio nem catálogo.

## 1. Resumo executivo

O cabeçalho da home e o das calculadoras compartilham o mesmo componente (`Moldura`), mas divergem visualmente porque a camada de estilo bifurca a apresentação em duas variantes — `padrao` (calculadoras, `cabecalho.css`) e `destaque` (home, `inicio.css`) — que discordam no alinhamento vertical da barra de ações, na tipografia e na altura resultante. O usuário percebe "dois cabeçalhos diferentes": os ícones assentam em alturas distintas ao trafegar entre telas, e a barra tem altura própria em cada uma. Esta feature padroniza a apresentação do cabeçalho para que os controles ocupem a mesma posição e o cabeçalho leia como uma peça só em toda a plataforma, sem alterar a semântica (h1, selo, alternador, comando de início) já congelada nas features 007–013.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/interface-comum/requirements.md#responsabilidades` | Uma única `Moldura` é a casca de todas as telas; a variante `padrao`/`destaque` é "só CSS, semântica idêntica" (RN-02). Confirma que **não** há dois componentes: há um, com duas peles CSS. | 🟢 |
| `_reversa_sdd/interface-estilos/requirements.md#responsabilidades` | `cabecalho.css` (116) governa a variante `padrao`; a variante `destaque` da home vive em `inicio.css` (188). A apresentação do cabeçalho está **partida entre duas folhas**. | 🟢 |
| `_reversa_sdd/code-analysis.md#interface-comum` | `apresentacao?: "padrao" \| "destaque"` via `data-apresentacao`; home usa `destaque` + `logoComoTitulo`; proporções da `padrao` já foram alinhadas à home na feature 013. | 🟢 |
| `_reversa_sdd/domain.md#7.2` | Regras da interface com força de navegação (011/013): comando de início só nas calculadoras; alternador exibe o tema-alvo. **Semântica a preservar**, fora do escopo desta feature. | 🟢 |
| `interface/estilos/cabecalho.css:25-31` | `padrao`: `padding: 44px max(32px, calc(50% − 558px)) 36px` e **`align-items: center`**. | 🟢 |
| `interface/estilos/inicio.css:12-31` | `destaque`: `padding: 44px max(32px, calc(50% − 328px)) 36px`, **`align-items: flex-end`**, `h1` 28px, `gap` 6px, `p` 14px. | 🟢 |

### Diagnóstico da divergência (causa-raiz)

A percepção do usuário está correta no efeito, imprecisa na causa. Não existem "dois códigos de cabeçalho": existe uma `Moldura` única (`interface/comum/moldura.tsx`), extraída byte a byte na feature 007. A divergência é puramente de CSS, concentrada em quatro pontos objetivos:

1. **Alinhamento vertical da barra de ações** — `padrao` usa `align-items: center`; `destaque` usa `align-items: flex-end` (`inicio.css:15`). É a origem direta da queixa "os ícones ficam mais altos": em cada tela os `IconButton` assentam contra uma linha-base diferente. 🟢
2. **Altura do bloco de identidade** — `h1` a 20px (`padrao`) contra 28px (`destaque`); `gap` 4px contra 6px; subtítulo 12px contra 14px. A identidade da home é mais alta, então o cabeçalho inteiro é mais alto. 🟢
3. **Coluna de encaixe distinta** — `max(…, 50% − 558px)` (corpo de 1180px, calculadoras) contra `max(…, 50% − 328px)` (coluna de 720px, home): o padding lateral difere e altera onde os controles caem. 🟢
4. **Breakpoints responsivos distintos** — `padrao` reflui em 900px; `destaque` em 544px. A altura do cabeçalho salta em larguras diferentes conforme a tela. 🟢

Nas calculadoras a logo é `.cabecalho-marca` (34px) **acima** de um `h1` textual; na home a logo **é** o `h1` (34px). A composição vertical da identidade, portanto, também difere por construção — decisão semântica das features 009/011, a ser preservada.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor (anônimo) — único papel do sistema (`_reversa_sdd/domain.md#papéis`) | Navegar da home para uma calculadora e voltar sem sentir "troca de página" no topo | Ao ir da home a `/cardiologia/dor-toracica`, o cabeçalho não "pula": ícones e altura permanecem coerentes. |
| Mantenedor (Iago) | Ter uma fonte única de verdade para o cabeçalho, retomável em 12 meses | Ao ajustar o cabeçalho, edita **um** lugar; as variantes restantes são mínimas e justificadas. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A barra de ações (comando de início, quando presente, e alternador de tema) ocupa a **mesma posição vertical relativa** ao bloco de identidade em toda tela — um único critério de alinhamento vale para `padrao` e `destaque`. 🟢
   - Origem no legado: corrige a divergência `align-items: center` × `flex-end` (`interface/estilos/cabecalho.css:27`, `interface/estilos/inicio.css:15`).
   - Tipo: alterada (apresentação).
2. **RN-02:** O **alinhamento** e a **posição da barra de ações** do cabeçalho passam a ser governados por **uma camada única** (`cabecalho.css`), válida para as duas variantes. A variante `destaque` **permanece**, mas reduzida ao que a justifica: o peso tipográfico do hero da home (h1/subtítulo maiores, coluna de 720px). Nenhuma regra de alinhamento de controles fica espalhada por `inicio.css`. 🟢
   - Origem no legado: `_reversa_sdd/interface-estilos/requirements.md#responsabilidades` (apresentação hoje partida entre `cabecalho.css` e `inicio.css`).
   - Tipo: alterada (organização da apresentação).
3. **RN-03 (preservada):** A semântica do cabeçalho é intocável — um único `h1` por tela, selo "Nada é salvo nem enviado" sempre visível, alternador exibindo o tema-alvo, comando de início só nas calculadoras (`logoComoTitulo` falso), logo por tema, tudo sobre tokens Primer sem cor literal. 🟢
   - Origem no legado: `_reversa_sdd/interface-comum/requirements.md#regras-de-negócio` (RN-02..RN-05) e `_reversa_sdd/domain.md#7.2`.
   - Tipo: não alterada (escopo negativo).

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Alinhamento vertical único da barra de ações entre `padrao` e `destaque` | Must | Um só valor de `align-items` (ou técnica equivalente) governa a linha dos ícones nas duas variantes; medida por guarda geométrica no e2e | 🟢 |
| RF-02 | Cabeçalho lê como peça única na travessia home↔calculadora (mesma família de altura/ritmo), **preservado o hero da home** | Must | A home mantém título/subtítulo maiores (peso de porta de entrada da feature 008); ainda assim a posição dos `IconButton` e o ritmo de altura não produzem "salto" perceptível ao navegar; verificado por captura e por asserção geométrica. A **home é a referência** para onde os valores convergem (coerente com a feature 013) | 🟢 |
| RF-03 | Apresentação do cabeçalho concentrada em `cabecalho.css` | Should | Nenhuma regra que posicione a **barra de ações** ou o **alinhamento** do cabeçalho vive em `inicio.css`; a variante `destaque` **permanece**, limitada ao peso tipográfico do hero (h1/subtítulo maiores e coluna de 720px) | 🟢 |
| RF-04 | Contrato semântico e de acessibilidade preservado | Must | DOM idêntico ao atual (um h1, selo, aria-labels, comando de início condicional); axe-baseline permanece 0/0 por rota | 🟢 |
| RF-05 | Só tokens Primer, sem cor/fonte/sombra literal; teto de 400 linhas por folha | Must | Toda regra usa `var(--*)`; `cabecalho.css` e `inicio.css` seguem < 400 linhas | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Manutenibilidade | Fonte única do cabeçalho; variantes reduzidas ao mínimo justificado por comentário | Princípio nº 5 (alta coesão, baixo acoplamento); `_reversa_sdd/interface-estilos` (hoje partido em duas folhas) | 🟢 |
| Regressão | Guardas geométricas de `e2e/cabecalho.spec.ts` (features 011/013) atualizadas, não removidas | `_reversa_sdd/code-analysis.md#testes` (cabecalho.spec.ts guarda a geometria) | 🟢 |
| Acessibilidade | axe-baseline 0/0 mantido; contraste e foco preservados | `_reversa_sdd/interface-comum/requirements.md#requisitos-não-funcionais` | 🟢 |
| Reprodutibilidade | Sem novas dependências; suíte (vitest + Playwright + axe) verde | Estado atual do repositório | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Ícones no mesmo lugar em toda a plataforma
  Dado a home e uma calculadora renderizadas na mesma largura de viewport
  Quando comparo a posição vertical do alternador de tema nas duas telas
  Então a linha-base dos IconButton coincide segundo a mesma regra de alinhamento

Cenário: Travessia sem salto
  Dado o usuário na home
  Quando navega para /cardiologia/dor-toracica e observa o topo da página
  Então o cabeçalho mantém altura e posição de controles coerentes, sem "pulo" visível

Cenário: Semântica intocada (caso de guarda)
  Dado qualquer tela após a padronização
  Quando inspeciono o DOM do cabeçalho
  Então há exatamente um h1, o selo "Nada é salvo nem enviado", o alternador com nome acessível
       e o comando de início presente só nas calculadoras — idêntico ao estado atual

Cenário: Sem cor literal (caso negativo)
  Dado o CSS do cabeçalho após a mudança
  Quando busco valores de cor/fonte/sombra literais
  Então não encontro nenhum: só var(--*) do Primer
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 alinhamento único dos ícones | Must | É a queixa literal e verificável do usuário |
| RF-02 leitura como peça única | Must | É a Demanda de fundo (padrão estético entre telas) |
| RF-04 contrato preservado | Must | Não-regressão: acessibilidade e semântica são inegociáveis |
| RF-05 tokens Primer / teto de linhas | Must | Doutrina de estilo do projeto (feature 004) |
| RF-03 concentração em `cabecalho.css` | Should | Reduz dívida, mas o núcleo é o efeito visual; a reorganização pode ser parcial |

## 9. Esclarecimentos

### Sessão 2026-07-23

- **Q:** Até onde vai a padronização do cabeçalho entre a home e as calculadoras — unificação total ou harmonização?
  **R:** **Harmonizar**, preservando o hero da home. A home continua com título/subtítulo maiores (peso de porta de entrada da feature 008); o que se corrige é o alinhamento dos ícones e a coerência de altura/ritmo, para a travessia não parecer "trocar de página". Não se desfaz o hero. → fixado em RF-02/RF-03 e RN-02.
- **Q:** Qual cabeçalho é a referência para onde os valores devem convergir?
  **R:** **A home**, coerente com a feature 013, que já a elegeu como referência de proporções (logo 34px, respiro 44/36). → fixado em RF-02.
- **Q:** O comando de início (⌂) deve passar a existir também na home?
  **R:** **Não** — preserva-se a regra das features 011/013: o botão de início aparece só nas calculadoras (a home é a própria raiz; seria link redundante). A padronização é só visual, não altera os controles. → confirma RN-03 (escopo negativo).

## 10. Lacunas

- Nenhuma pendência aberta. As três dúvidas iniciais foram resolvidas na sessão de esclarecimentos de 2026-07-23.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-23 | Esclarecimentos integrados por `/reversa-clarify`: escopo = harmonizar (hero da home preservado), referência = home, controles inalterados; três `[DÚVIDA]` resolvidos | reversa |
