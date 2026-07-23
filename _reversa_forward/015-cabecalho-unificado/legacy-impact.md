# Legacy Impact: Cabeçalho unificado entre home e calculadoras

> Feature `015-cabecalho-unificado` · 2026-07-23
> Cenário: **legado** (âncora `_reversa_sdd/architecture.md` + `domain.md`)
> Categoria (Princípio nº 4): **Aplicação** — apresentação sobre a `Moldura` compartilhada.

Feita de estilo: unifica o alinhamento vertical da barra de ações do cabeçalho, hoje bifurcado entre `align-items: center` (variante `padrao`, `cabecalho.css`) e `align-items: flex-end` (variante `destaque` da home, `inicio.css`). O alinhamento passa a ser regra-única em `cabecalho.css`, ancorado ao topo (`flex-start`), válida para as duas variantes; `inicio.css` perde o override e mantém só o peso tipográfico do hero. Nenhuma linha da `Moldura` (`interface/comum/moldura.tsx`) muda — DOM, ordem, `aria-labels` e a presença condicional do comando de início ficam idênticos.

## 1. Tabela de impacto

| Arquivo afetado | Componente (`_reversa_sdd/architecture.md`) | Tipo | Severidade | Justificativa |
|-----------------|---------------------------------------------|------|------------|---------------|
| `interface/estilos/cabecalho.css` | `interface/estilos` (camada de apresentação) | regra-alterada | LOW | `align-items: center` → `flex-start` no `.cabecalho`, promovido a regra-única do alinhamento vertical das duas variantes (RF-01/RF-02, D-01). Só apresentação; sem efeito sobre domínio, contrato ou DOM. |
| `interface/estilos/inicio.css` | `interface/estilos` (camada de apresentação) | regra-removida | LOW | Removido o override `align-items: flex-end` da regra `.pagina[data-apresentacao="destaque"] .cabecalho` (RF-03, D-02). O restante do hero (padding, `borderColor-muted`, h1 28px, subtítulo 14px, `gap` 6px, coluna de 328px, breakpoint 544px) permanece intacto. |
| `e2e/cabecalho.spec.ts` | `e2e` (guardas de regressão) | componente-novo | LOW | Guarda geométrica nova: coincidência vertical do alternador de tema entre `/` e `/dm2/insulina` na mesma viewport, tolerância 2px (D-04). Aditiva; nenhuma guarda existente removida. |

Nenhum impacto CRITICAL/HIGH/MEDIUM: a feature não toca regra de negócio, domínio, banco, contrato HTTP (`/api/v1/status`) nem a semântica/acessibilidade do cabeçalho.

## 2. Diff conceitual por componente

**`interface/estilos` — `cabecalho.css`.** O eixo transversal do `.cabecalho` (flex, `justify-content: space-between`, `flex-wrap: wrap`) deixa de centralizar os filhos e passa a ancorá-los ao topo do content-box. Como `.cabecalho-marca` e a `.cabecalho-logo` do wordmark têm ambas 34px fixos (invariante guardada pela feature 013), a barra de ações assenta à altura do logotipo nas duas telas. A diferença de altura da identidade (hero da home, mais alto) deixa de mover os ícones, porque o alinhamento ao topo é invariante a essa altura. O alinhamento interno da própria `.cabecalho-acoes` (os ícones entre si, `align-items: center`) permanece — governa a linha dos botões, não sua âncora no cabeçalho.

**`interface/estilos` — `inicio.css`.** A regra do hero perde a única propriedade que posicionava controles (`align-items: flex-end`) e fica reduzida ao que justifica a variante `destaque`: o peso tipográfico de porta de entrada (feature 008) e a coluna de 720px. A separação de preocupações se reforça — alinhamento na folha do cabeçalho, tipografia do hero na folha da home —, coerente com a doutrina de "uma folha por preocupação" das features 004/011/013.

**`e2e` — `cabecalho.spec.ts`.** Passa a hospedar, além dos testes de navegação da 011, a guarda geométrica de coincidência dos ícones (assunto cabeçalho concentrado num spec só). Falhava por 41,5px no estado bifurcado; passa após o núcleo.

## 3. Preservadas (regras 🟢 do `domain.md` intactas)

- **RN-02 / RN-03..RN-05 do `interface-comum`** (semântica do cabeçalho): um `h1` por tela, selo "Nada é salvo nem enviado" sempre visível, alternador exibindo o tema-alvo, comando de início só nas calculadoras (`logoComoTitulo` falso), logo por tema. DOM byte a byte idêntico — `git diff` vazio em `moldura.tsx`. 🟢
- **Regras de navegação do cabeçalho (features 011/013, `domain.md#7.2`)**: comando de início ausente na home, presente nas calculadoras; alternador mostra o tema-alvo. Não tocadas (escopo negativo, D-03). 🟢
- **Invariante de privacidade** (`domain.md`, cálculo 100% no cliente, nada salvo/enviado): a feature é CSS; nenhuma requisição nova. 🟢
- **Doutrina de estilo Primer (feature 004, RN-01)**: só `var(--*)`, sem cor/fonte/sombra literal; teto de 400 linhas por folha (cabecalho 127, inicio 193). 🟢
- **Proporções do cabeçalho padrão (feature 013)**: encaixe na coluna do corpo e logo de 34px — guardas geométricas da 013 seguem verdes. 🟢

## 4. Modificadas (regras 🟢 alteradas ou removidas)

- **Alinhamento vertical da barra de ações** (apresentação): de bifurcado (`center` na `padrao` × `flex-end` na `destaque`) para regra-única `flex-start` em `cabecalho.css`. É a única regra 🟢 do legado alterada — de apresentação, sem efeito sobre semântica ou contrato. Vira o watch item W001. 🟢
- **Localização da regra de alinhamento**: sai de `inicio.css` (que a duplicava via override) e concentra-se em `cabecalho.css`. `inicio.css` fica sem regra de alinhamento de controles. Vira o watch item W002 (tipo `ausência`). 🟢
