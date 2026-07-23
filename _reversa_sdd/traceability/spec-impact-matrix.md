# Spec Impact Matrix — aps-inteligente

> Regenerado pelo Reversa Architect em 2026-07-23 (re-extração nº 2).
> Unidades conforme `[specs] granularity = "module"` (layout `feature-folder`): os três domínios, a casca comum, as três telas, a home, o shell e a fatia de observabilidade.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## 1. Matriz módulo × módulo

Leitura: alterar a **linha** impacta as **colunas** marcadas. `∅` = nulo por dependência unidirecional.

| Alterado ↓ / Impacta → | mdl-insulina | mdl-gestacao | mdl-cardio | if-comum | if-insulina | if-gestacao | if-cardio | if-inicio | pages | api+infra | tests |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **mdl-insulina** | — | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | ∅ | ∅ | 🟢 alto |
| **mdl-gestacao** | ∅ | — | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | ∅ | 🟢 alto |
| **mdl-cardio** | ∅ | ∅ | — | ∅ | ∅ | ∅ | 🟢 alto | ∅ | ∅ | ∅ | 🟢 alto |
| **if-comum (Moldura)** | ∅ | ∅ | ∅ | — | 🟢 médio | 🟢 médio | 🟢 médio | 🟢 médio | 🟢 baixo | ∅ | 🟢 médio |
| **if-insulina** | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 médio |
| **if-gestacao** | ∅ | ∅ | ∅ | ∅ | ∅ | — | ∅ | ∅ | 🟢 baixo | ∅ | 🟢 médio |
| **if-cardio** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | ∅ | 🟢 baixo | ∅ | 🟢 médio |
| **if-inicio (home+catálogo)** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | 🟢 baixo | ∅ | 🟢 baixo |
| **pages (shell/rotas)** | ∅ | ∅ | ∅ | ∅ | 🟢 baixo | 🟢 baixo | 🟢 baixo | 🟢 baixo | — | ∅ | 🟢 baixo |
| **api+infra** | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | ∅ | — | 🟢 médio |

🟢 **Leitura da matriz:** os três domínios são mutuamente isolados (features 007 e 010 foram aditivas — `git diff models/insulina` vazio). Cada tela depende só do seu domínio. A `Moldura` é o único ponto de acoplamento horizontal na interface (impacta as quatro telas + home). A fatia `api+infra` é ortogonal ao clínico: não impacta nenhum domínio nem tela.

## 2. Pontos de contato precisos (por que o impacto existe)

| Contato | De → Para | Natureza |
|---|---|---|
| `CalculadoraInsulinaDM2.calcular()` / `...IdadeGestacional` / `...CardiopatiaIsquemica.avaliar()` | tela → domínio | Fachada; única porta de entrada de cada motor |
| `Saida*` (union por `tipo`) | domínio → tela | O painel faz switch no discriminante; **nova variante quebra a UI silenciosamente** se o switch não for exaustivo |
| `CONSTANTES` de cada `fonte-clinica.ts` | domínio → tela | O formulário espelha faixas de validação; mudar plausibilidade no motor muda a UI (acoplamento anti-drift desejado) |
| `TipoAlerta`/`TipoRecomendacao` (insulina); `Estrato`/`TipoConduta` (cardio); `Veredito` (gestação) | domínio → tela | Textos, ícones e `Label`/`Flash` do painel dependem dos valores; novo valor exige tratamento visual |
| `Moldura` (props `apresentacao`, `logoComoTitulo`) | if-comum → telas + home | Casca comum; mudança na semântica (h1, selo, alternador) propaga às quatro telas |
| `catalogo.ts` | if-inicio → pages | Fonte única de seções/rotas; toda calculadora nova entra aqui primeiro |
| `preferencia-de-tema.ts` | if-calculadora → if-comum | 🟡 Acoplamento residual: a Moldura importa o store de tema da pasta da insulina (dívida declarada) |
| `saude()` / `ErroDeBanco` | infra → api | Fachada de banco; a Function só chama `saude()` |
| `ErroDeInvariante` | domínio → tela | Gatilho do painel honesto (EC-07) e do `RelatorDeErros` |

## 3. Zonas de alto risco (mudança pequena, raio grande)

1. 🟢 **`tipos.ts` de qualquer domínio** — campo novo em `Entrada*`/`Saida*` propaga para as regras daquele domínio, sua validação, seu formulário, seu painel e suas suítes. Epicentro **por domínio**, sem cruzar para os outros dois.
2. 🟢 **`fonte-clinica.ts` (CONSTANTES/REFERENCIAS)** — mudar um limiar clínico altera condutas e invalida testes numéricos daquele domínio; exige nova extração citada da fonte (ADR 0001) antes do código (Princípio nº 6). Uma fonte por unit (ADR 0011): a mudança não vaza para outro domínio.
3. 🟢 **`Moldura` (`interface/comum`)** — único componente cuja alteração toca as quatro telas + home ao mesmo tempo; asserções de nome acessível (h1, selo) são verificadas byte a byte pela suíte.
4. 🟡 **Ordem do pipeline da fachada da insulina** (validar → escopo → titulação → fracionamento → intensificação → metformina) — as regras assumem efeitos das anteriores (ex.: intensificação lê `houveAjuste`; metformina lê suspensões).
5. 🟢 **Contrato de `/api/v1/status`** — mudança incompatível do corpo é observável externamente; exigiria `/api/v2` (ADR 0008). A suíte de contrato (16/16) é o guarda.

## 4. Impactos fora do código

| Mudança | Artefato a reconciliar |
|---|---|
| Qualquer regra clínica de um domínio | Spec do motor daquele domínio + `domain.md` + testes — spec **antes** do código (Princípio nº 6) |
| Nova variante de saída/alerta/veredito/estrato | `data-dictionary.md`, `erd-complete.md`, painel da tela |
| Nova calculadora (quarto domínio) | `catalogo.ts` (primeiro), nova unit `models/*` + `interface/*`, nova rota, ADR 0011 (uma fonte), `c4-*.md` |
| Mudança no contrato da API | ADR 0008, `c4-containers.md`, suíte de contrato, `permissions.md` |
| Introdução de persistência de dado clínico | ADR 0002 (gatilho LGPD), `permissions.md` (RBAC deixa de ser n/a), ERD com esquema real |
| Nova edição de qualquer guia clínico | Gatilho de revisão MD-0008: reconferir `CONSTANTES` do domínio afetado |

## 5. Premissas 🟡 pendentes mapeadas contra a matriz

As premissas de projeto a validar pelo prescritor (herdadas das features, ver `domain.md` §8), caso mudem:

| Premissa | Módulo(s) impactado(s) | tests |
|---|---|---|
| Cortes de trimestre 13+6 / 27+6 (gestação) | `mdl-gestacao` (constante), `if-gestacao` (exibição) | unidade + integração |
| Limites de plausibilidade DUM ≤ 44 sem / laudo 0–42 sem·0–6 d | `mdl-gestacao` (validação), `if-gestacao` (blur) | unidade |
| Leitura descritiva do estrato "baixa" (cardio) | `mdl-cardio` (`estratoDe`) | unidade property-based |
| Cap ×2–×3 da faixa por fatores de risco (cardio) | `mdl-cardio` (`ajustarPorFatoresDeRisco`) | unidade property-based |
