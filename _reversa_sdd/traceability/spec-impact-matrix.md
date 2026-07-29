# Spec Impact Matrix — aps-inteligente

> Regenerado pelo Reversa Architect em 2026-07-28 (re-extração nº 4).
> Unidades conforme `[specs] granularity = "module"` (layout `feature-folder`): os cinco domínios clínicos com as **duas fachadas** da puericultura, o unit não clínico, a casca comum, as seis telas, a home, o shell, a fatia de observabilidade e a camada dev-time.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## 0. O arranjo que esta matriz precisou passar a modelar

🟢 Até a re-extração nº 3, unit e fachada eram sinônimos, e a matriz podia tratá-los como a mesma coisa. A feature 020 desfez a coincidência: `models/puericultura` tem **duas fachadas**, `CalculadoraCrescimentoInfantil` (`mdl-pue`) e `RegistroDeConsultaPuericultura` (`mdl-cns`), sobre a mesma fonte (ADR 0017). Elas entram como **linhas distintas**, porque se alteram e se testam separadamente, e a seta entre as duas é registrada: é o **único acoplamento `models → models` da plataforma**, e ele vive dentro de uma unit só.

Entra também uma coluna que não existia: **`scripts`**, a camada dev-time. Ela não é importada por ninguém em runtime, mas **toda camada a impacta**, porque literal novo sem classe declarada faz o gerador do inventário parar (ADR 0019).

## 1. Matriz módulo × módulo

Leitura: alterar a **linha** impacta as **colunas** marcadas. `∅` = nulo por dependência unidirecional.

Siglas: `mdl-*` = `models/*` (ins insulina · ges gestação · car cardiopatia · rcv risco CV · pue puericultura/crescimento · cns puericultura/consulta · pix contribuição); `if-*` = `interface/*` (ini home + catálogo).

| Alterado ↓ / Impacta → | mdl-ins | mdl-ges | mdl-car | mdl-rcv | mdl-pue | mdl-cns | mdl-pix | if-comum | if-ins | if-ges | if-car | if-rcv | if-pue | if-cns | if-pix | if-ini | pages | api+infra | scripts | tests |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **mdl-ins** | — | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | 🟢 alto |
| **mdl-ges** | ∅ | — | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | 🟢 alto |
| **mdl-car** | ∅ | ∅ | — | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | 🟢 alto |
| **mdl-rcv** | ∅ | ∅ | ∅ | — | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | 🟢 alto |
| **mdl-pue** | ∅ | ∅ | ∅ | ∅ | — | 🟢 **alto** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto | 🟢 médio | ∅ | ∅ | ∅ | ∅ | 🟢 médio | 🟢 alto |
| **mdl-cns** | ∅ | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | ∅ | 🟢 médio | 🟢 alto |
| **mdl-pix** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | 🟢 baixo | 🟢 médio |
| **if-comum (Moldura)** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | 🟢 médio | 🟢 médio | 🟢 médio | 🟢 médio | 🟢 médio | 🟢 médio | 🟡 baixo | 🟢 médio | 🟢 baixo | ∅ | 🟢 baixo | 🟢 **alto** |
| **if-ins** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟡 baixo | — | 🟡 baixo | 🟡 baixo | 🟡 baixo | 🟡 baixo | 🟡 baixo | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 baixo | 🟢 médio |
| **if-ges** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 baixo | 🟢 médio |
| **if-car** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 baixo | 🟢 médio |
| **if-rcv** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 baixo | 🟢 médio |
| **if-pue** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | 🟢 **médio** | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 baixo | 🟢 médio |
| **if-cns** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟡 baixo | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 médio | 🟢 médio |
| **if-pix** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | 🟢 médio | 🟢 baixo | ∅ | 🟢 baixo | 🟢 médio |
| **if-ini (home + catálogo)** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | 🟢 **médio** | ∅ | 🟢 médio | 🟢 **alto** |
| **pages (shell/rotas)** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | 🟢 baixo | 🟢 baixo | 🟢 baixo | 🟢 baixo | 🟢 baixo | ∅ | 🟢 baixo | — | 🟡 baixo | 🟢 baixo | 🟢 médio |
| **api+infra** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | 🟢 baixo | 🟢 médio |
| **scripts (dev-time)** | ∅ | ∅ | ∅ | ∅ | 🟢 **alto** | 🟢 **alto** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | 🟡 baixo | — | 🟢 alto |

🟢 **Leitura da matriz, em cinco pontos:**

1. **Os cinco domínios clínicos seguem mutuamente isolados**, e as features 017, 019 e 020 foram aditivas: `git diff` vazio nos motores anteriores, verificado pelas próprias features.
2. **A única seta `models → models` é `mdl-pue → mdl-cns`**, e ela é intra-unit. Mudar o `ResultadoAvaliacao` do crescimento propaga ao registro da consulta, que o **transpõe**; a seta inversa é `∅`, e é o que garante que não nasça segunda fonte de escore z (watch W010 da 020).
3. **A `Moldura` continua sendo o ponto de acoplamento horizontal da interface**, e o raio dela **cresceu**: desde a feature 021 ela governa o enquadramento de toda tela, de modo que uma mudança ali move o corpo de sete rotas, e não só o cabeçalho. Daí o `tests` alto: as guardas geométricas medem exatamente isso.
4. **O catálogo ganhou raio.** Além de fonte única da home, é oráculo da descrição da plataforma (018) e **entrada da guarda geométrica** (021): calculadora nova cai sob a guarda ao entrar nele. Alterá-lo mexe em `pages` e reprova três famílias de teste distintas.
5. **`scripts` é a coluna que quase todo mundo impacta e a linha que quase ninguém.** Literal novo em qualquer camada exige entrada em `scripts/textos/classes/`, sob pena de o gerador parar; em sentido inverso, os geradores só alcançam os dois submódulos de puericultura, que são os que têm acervo emitido.

🟡 **Nota sobre as marcações baixas em `if-ins`:** as demais telas importam `preferencia-de-tema.ts` e `relator-de-erros.ts` de `interface/calculadora/`. É o acoplamento residual declarado (dívida 2): mudar a porta do tema ou do relator propaga a quem os importa.

## 2. Pontos de contato precisos (por que o impacto existe)

| Contato | De → Para | Natureza |
|---|---|---|
| `CalculadoraInsulinaDM2.calcular()` · `...IdadeGestacional.calcular()` · `...CardiopatiaIsquemica.avaliar()` · `...RiscoCardiovascular.estimar()` · `...CrescimentoInfantil.avaliar()` | tela → domínio | Fachada; única porta de entrada de cada motor |
| `RegistroDeConsultaPuericultura.catalogo() · sugerir() · montar()` | tela → domínio | **Segunda fachada da mesma unit**; devolve estrutura, nunca texto pronto |
| `ResultadoAvaliacao` (017) | `mdl-pue` → `mdl-cns` | 🟢 **Única dependência intra-`models`**: chega pronto e é transposto com a referência já carimbada |
| `Saida*` (union por `tipo`) | domínio → tela | O painel faz switch no discriminante; **nova variante quebra a UI silenciosamente** se o switch não for exaustivo |
| `IndiceCalculado.estado` (puericultura) | domínio → tela | Discriminante **próprio do índice**, distinto do `tipo` da saída; a recusa parcial chega por aqui |
| `CONSTANTES` de cada `fonte-clinica.ts` | domínio → tela | O formulário espelha as faixas de validação; acoplamento anti-drift desejado |
| `NOME_PUBLICADO` (×6) | domínio → verificador de textos | 🆕 Oráculo da única exceção do travessão; o teste importa do domínio, e não de lista própria (`MD-0021`) |
| `TipoAlerta`/`TipoRecomendacao` · `Estrato`/`TipoConduta` · `Veredito` · rótulos de classificação | domínio → tela | Textos, ícones e `Label`/`Flash` dependem dos valores; valor novo exige tratamento visual |
| `Moldura` (props `apresentacao`, `comInicio`) | if-comum → telas + home | 🆕 Casca comum **e** enquadramento: a coluna do corpo mora no `<main>` (ADR 0021) |
| `catalogo.ts` | if-ini → pages · guardas · descrição | 🆕 Três papéis: fonte única de rotas, oráculo da descrição da plataforma e lista que a guarda geométrica percorre |
| `formatar-registro.ts` | if-cns → tela e área de transferência | 🆕 Uma função, dois consumidores; a identidade entre exibido e copiado é estrutural (watch W007) |
| `beneficiario.ts` | if-pix → domínio (por parâmetro) | 🆕 Configuração de instalação na apresentação; o domínio não sabe que a constante existe |
| `scripts/textos/classes/*` | toda camada → dev-time | 🆕 Literal novo sem classe declarada **para o gerador**, nomeando arquivo e linha |
| `manifesto.json` (`sha256`) | fonte tabular → `mdl-pue` | 🆕 Sentinela de procedência: origem alterada acusa na regeração |
| `verificarBanco()` / `saude()` / `ErroDeBanco` | infra → api | 🆕 Dois saltos: a Function chama o adaptador, e só ele chama o banco |
| `ErroDeInvariante` | domínio → tela | Gatilho do painel honesto e do `RelatorDeErros` |

## 3. Zonas de alto risco (mudança pequena, raio grande)

1. 🟢 **`tipos.ts` de qualquer domínio** — campo novo em `Entrada*`/`Saida*` propaga para as regras daquele domínio, sua validação, seu formulário, seu painel e suas suítes. Epicentro por unit, **exceto em `mdl-pue`**, cujo `ResultadoAvaliacao` cruza para o registro da consulta.
2. 🟢 **`fonte-clinica.ts` (constantes e referências)** — mudar um limiar altera condutas e invalida testes numéricos; exige nova extração citada da fonte antes do código. Uma fonte por unit: não vaza para outro domínio.
3. 🟢 **`Moldura`** — único componente cuja alteração toca as **seis telas e a home** ao mesmo tempo, e desde a 021 move o corpo, e não só o cabeçalho.
4. 🟢 **`catalogo.ts`** — alterá-lo mexe na home, nas rotas, na descrição verificada e no conjunto de rotas que a guarda geométrica percorre.
5. 🟢 **Acervo tabular de `mdl-pue`** — regerar as 14 tabelas com origem diferente muda escore, classificação e registro de consulta de uma vez; o `sha256` é o que torna a mudança visível em vez de silenciosa.
6. 🟡 **Ordem do pipeline da fachada da insulina** — as regras assumem efeitos das anteriores.
7. 🟢 **Contrato de `/api/v1/status`** — mudança incompatível é observável externamente e exigiria `/api/v2`. A suíte de contrato, agora com alvo duplo, é o guarda.
8. 🔴 **`ehEstouroDeTempo`** — depende de frase do driver e da ordem de teste dos reconhecedores; atualizar `pg` sem revisar troca `tempo_esgotado` por `conexao` em silêncio.
9. 🆕 🟢 **Contratos emitidos** — BR Code e registro SOAP quebram **fora** do nosso alcance: o primeiro na câmera de quem contribui, sem canal de erro; o segundo na expectativa de quem cola no prontuário.

## 4. Impactos fora do código

| Mudança | Artefato a reconciliar |
|---|---|
| Qualquer regra clínica de um domínio | Spec do motor + `domain.md` + testes — spec **antes** do código (Princípio nº 6) |
| Nova variante de saída, alerta, veredito, estrato ou índice | `data-dictionary.md`, `erd-complete.md`, painel da tela |
| Nova calculadora | `catalogo.ts` (primeiro), unit `models/*` + `interface/*`, rota, ADR 0011 (uma fonte) ou ADR 0016 (isenção), `c4-*.md`, guarda geométrica por herança do catálogo |
| **Segunda fachada sob unit existente** | ADR 0017, esta matriz (linha própria), `code-spec-matrix.md`, `c4-components.md` |
| Novo literal exibido | `scripts/textos/classes/*` (classe declarada), `inventario-textual.json`; se citação, oráculo próprio ou linha de base |
| Nova edição de fonte tabular | `manifesto.json` (`sha256`), regeração pelos scripts, oráculo congelado, `MD-0008` |
| Mudança no contrato da API | ADR 0008/0020, `openapi/status.yaml`, `c4-containers.md`, suíte de contrato nos dois estados, `permissions.md` |
| Mudança de forma no BR Code ou no registro SOAP | Contratos em `_reversa_forward/019-*` e `020-*/interfaces/`, verificação em duas pontas (`MD-0025`) |
| Atualização do driver `pg` | `infra/database.ts` (reconhecedores por frase), watch W007, suíte de contrato do estado degradado |
| Introdução de persistência de dado clínico | ADR 0002 (gatilho LGPD), `permissions.md` (RBAC deixa de ser n/a), ERD com esquema real |

## 5. Premissas 🟡 pendentes mapeadas contra a matriz

| Premissa | Módulo(s) impactado(s) | tests |
|---|---|---|
| Cortes de trimestre 13+6 / 27+6 (gestação) | `mdl-ges` (constante), `if-ges` (exibição) | unidade + integração |
| Limites de plausibilidade DUM ≤ 44 sem / laudo 0–42 sem·0–6 d | `mdl-ges` (validação) | unidade |
| Leitura descritiva do estrato "baixa" (cardio) | `mdl-car` (`estratoDe`) | unidade property-based |
| Cap ×2–×3 da faixa por fatores de risco (cardio) | `mdl-car` | unidade property-based |
| Faixas de clamp fisiológico (risco CV) | `mdl-rcv` (`FAIXAS`, `clamparEntrada`) | unidade property-based |
| Cortes de categoria 5 / 7,5 / 20% (risco CV) | `mdl-rcv` (`CATEGORIAS`) | unidade |
| `raca="outra"` → coeficientes de branco (risco CV) | `mdl-rcv` (`grupoDe`) | unidade da equação |
| 🆕 1.095 dias do limite estendido de correção | `mdl-pue` (`FRONTEIRAS`), e por transposição `mdl-cns` | unidade + oráculo |
| 🆕 Idade cronológica governando a posição de medida | `mdl-pue` (`medidas.ts`) | unidade |
| 🆕 Exibição do escore em uma casa decimal | `if-pue`, `mdl-cns` (formatação do registro) | integração |
| 🆕 Faixas de plausibilidade de peso, comprimento, PC e IG | `mdl-pue` (`validacao.ts`) | unidade |
| 🆕 Ficha imediatamente anterior para idade intermediária | `mdl-cns` (`selecao.ts`) | unidade |
| 🆕 Repartição dos sinais de alerta entre S e O (`MD-0028`) | `mdl-cns` (acervo das dez fichas) | unidade + congelamento |
| 🆕 Piso de `22rem` da ficha (feature 021) | `if-cns`, `if-comum` (moldura.css) | e2e geométrica |
