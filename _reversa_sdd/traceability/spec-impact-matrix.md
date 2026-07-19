# Spec Impact Matrix — aps-inteligente

> Gerado pelo Reversa Architect em 2026-07-19.
> Unidades conforme `[specs] granularity = "module"` (MD-0005): `models-insulina`, `interface-calculadora`, `pages-next`.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## 1. Matriz módulo × módulo

Leitura: alterar a **linha** impacta as **colunas** marcadas.

| Alterado ↓ / Impacta → | models-insulina | interface-calculadora | pages-next | tests |
|---|---|---|---|---|
| **models-insulina** | — | 🟢 alto | 🟢 nulo | 🟢 alto |
| **interface-calculadora** | 🟢 nulo (dependência unidirecional) | — | 🟢 baixo | 🟢 médio |
| **pages-next** | 🟢 nulo | 🟢 baixo | — | 🟢 baixo |

## 2. Pontos de contato precisos (por que o impacto existe)

| Contato | De → Para | Natureza |
|---|---|---|
| `CalculadoraInsulinaDM2.calcular()` | interface → models | Fachada; única porta de entrada do motor |
| `SaidaCalculo` (union) | models → interface | `resultado.tsx` e `calculadora-app.tsx` fazem switch no discriminante `tipo`; **nova variante quebra a UI silenciosamente** se o switch não for exaustivo |
| `CONSTANTES` | models → interface | `formulario.tsx` espelha faixas de validação; mudar plausibilidade no motor muda a UI automaticamente (acoplamento desejado) |
| `TipoAlerta` / `TipoRecomendacao` | models → interface | Textos e ícones do painel dependem dos valores; adicionar valor exige tratamento visual novo |
| `TelaCalculadora` | interface → pages | `index.tsx` só monta o componente raiz |
| `globais.css` + tokens de tema | interface → pages | `_app.tsx` importa o CSS global |
| `ErroDeInvariante` | models → interface | Gatilho do painel honesto (EC-07) e do `RelatorDeErros` |

## 3. Zonas de alto risco (mudança pequena, raio grande)

1. 🟢 **`tipos.ts`** — qualquer campo novo em `EntradaCalculo`/`SaidaCalculo` propaga para: as 3 regras, validação, formulário, resultado, builders de teste (`tests/apoio/construtores.ts`) e as 10 suítes. É o epicentro da matriz.
2. 🟢 **`fonte-clinica.ts` (CONSTANTES)** — mudar um limiar clínico altera condutas em todos os modos e invalida testes de validação numérica; exige nova extração citada do guia (ADR 0001) antes do código (Princípio I).
3. 🟢 **`AjusteEmCurso`** — estado de trabalho compartilhado pelas 3 regras em sequência; mudar sua forma impacta as três ao mesmo tempo.
4. 🟡 **Ordem do pipeline da fachada** (validar → escopo → titulação → fracionamento → intensificação) — as regras assumem efeitos das anteriores (ex.: intensificação lê `houveAjuste`).

## 4. Impacto das mudanças pendentes conhecidas

As quatro divergências clínicas aprovadas no design (`domain.md` §7) mapeadas contra a matriz:

| Divergência | models-insulina | interface-calculadora | tests |
|---|---|---|---|
| 1. Dose de metformina + alerta de otimização | `EntradaCalculo`, nova regra/recomendação, `CONSTANTES` (🔴 depende de extração do guia) | formulário (campo novo), resultado | unidade + integração + builders |
| 2. TFG para ajuste/contraindicação de metformina | idem (🔴 depende de extração do guia) | idem | idem |
| 3. `SUSPENDER_SULFONILUREIA` ampliada | `regra-titulacao-basal.ts` (+ redação condicional) | resultado (texto) | unidade |
| 4. Glicemias por momento (4 campos) | nenhum (contrato `GlicemiaAferida[]` já comporta) | `formulario.tsx` (reestruturação) | 🟢 quebra declarada de `tests/integration/interface/formulario.test.tsx` |

## 5. Impactos fora do código

| Mudança | Artefato a reconciliar |
|---|---|
| Qualquer regra clínica | Spec do motor (a reconstituir pelo Writer) + `domain.md` + testes de validação — spec **antes** do código (Princípios I/II) |
| Nova variante de saída ou alerta | `data-dictionary.md`, `erd-complete.md` |
| Renascimento da API v1 | ADR 0008 (guarda de privacidade + teste de contrato), `c4-containers.md`, `permissions.md` |
| Introdução de banco/persistência | ADR 0002 (gatilho LGPD), `permissions.md` (RBAC deixa de ser n/a), ERD |
