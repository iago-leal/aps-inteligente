# Roadmap: Estrutura do cabeçalho da home unificada com a das calculadoras

> Identificador: `016-estrutura-cabecalho-home`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/016-estrutura-cabecalho-home/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A divergência de altura (home 200,5px × calculadoras 209,0px) não se corrige por CSS de altura sem chumbar um número; corrige-se igualando a **estrutura**. A home passa a montar a mesma identidade de três blocos das calculadoras — `marca decorativa (34px, aria-hidden) + h1 textual + subtítulo` — sobre o padding vertical que já é idêntico nas duas variantes (44/36, provado no adendo 015). Com o mesmo conteúdo e o mesmo respiro, a altura emerge igual, sem `min-height`. No caminho, a `Moldura` deixa de derivar duas preocupações de uma só flag: `logoComoTitulo` — que hoje decide **e** se a logo é o `h1` **e** se o comando de início aparece — fica órfã (a logo vira decorativa em toda tela) e é removida; a presença do ⌂ passa a uma prop própria `comInicio` (default ausente), que as quatro calculadoras declaram e a home não. A variante `destaque` encolhe: perde a tipografia de hero (feature 008) e guarda só a coluna de 720px que alinha o cabeçalho ao corpo da home. Duas guardas e2e novas congelam a invariante — altura coincidente em todas as rotas e ausência de altura fixa no `.cabecalho`.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | O delta nasce do `requirements.md` travado e reconcilia `interface-comum`/`interface-estilos`/`interface-inicio` da extração; nenhum comportamento novo sem RF | respeita |
| II. Cadeia de derivação | Cada decisão abaixo cita o RF-NN que a motiva (RF-01..RF-06) | respeita |
| III. Clarificação precede solução | Sessão 2026-07-23 resolveu subtítulo, contrato da prop, hero e h1 antes do plano | respeita |
| VI. Rastreabilidade bidirecional | Cabeçalhos dos arquivos tocados citam a feature 016; guardas e2e nomeiam os RF | respeita |
| VII. Testes: metade da fonte | Guarda de altura (validação de RF-01) e guarda negativa (sem número mágico) nascem com a feature | respeita |
| VIII. Proporcionalidade | Aplicação de apresentação + contrato de componente: sem camada de dados, sem migração; testes de integração + e2e, não a pirâmide inteira | respeita |

Nenhum princípio em conflito.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Igualar a altura pela **estrutura** (home ganha os três blocos), não por métrica | O padding vertical já é 44/36 nas duas variantes (adendo 015); com o mesmo conteúdo, a altura emerge igual sem constante a manter (RF-01/RF-02, RN-01) | `min-height`/`height` chumbado no `.cabecalho` (número mágico, dívida); calcular altura em JS | 🟢 |
| D-02 | Remover `logoComoTitulo` e criar prop dedicada `comInicio` (default `false`) na `Moldura` | Como a logo vira decorativa em toda tela (RN-02), o ramo `logoComoTitulo` some e a flag fica órfã; separar o comando de início dá uma responsabilidade por prop (SRP, RN-03) | Manter `logoComoTitulo` sem uso; derivar o ⌂ de `apresentacao` (reacoplaria a controle a variante visual) | 🟢 |
| D-03 | `h1` da home = texto literal `"APS Inteligente"` (era o `alt` da logo) | Preserva o nome acessível do heading — delta axe nulo (RF-04, RN-02); esclarecimento 2026-07-23 | `h1` distinto ("Calculadoras"): mudaria o nome acessível e sairia da RN-02 | 🟢 |
| D-04 | Aposentar a tipografia do hero em `inicio.css` (gap 6px, h1 28/24px, subtítulo 14px + `max-width:60ch`); manter só o padding da coluna (720/328) e a borda `muted` da variante `destaque` | A home igual às calculadoras é o que fecha a altura por construção; a coluna de 720px ainda alinha o cabeçalho ao corpo (RF-05, RN-04) | Manter parte do hero (reabre a divergência); remover a variante `destaque` inteira (perderia a coluna que alinha ao corpo) | 🟢 |
| D-05 | Duas guardas e2e: (a) altura de `.cabecalho` coincidente nas 5 rotas na mesma viewport (±2px), falha barulhenta ao 1º desvio; (b) ausência de `height`/`min-height` no seletor `.cabecalho` | Observabilidade de regressão da invariante no tempo (RF-01/RF-06) | Comparar só home×insulina (não cobre as quatro calculadoras) | 🟢 |
| D-06 | Subtítulo da home: **medir** a 720px na implementação; encurtar para versão enxuta só se quebrar em duas linhas | Política travada em 2026-07-23; a altura idêntica prevalece sobre o texto integral | Encurtar já (mexe no conteúdo sem necessidade provada); aceitar 2 linhas (contraria RF-01) | 🟡 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Com a tipografia padrão (12px) e sem `max-width:60ch`, o subtítulo atual (~85 caracteres) cabe em **uma linha** na coluna da home (~656px a 1280px) | §9 / §10 (esclarecido); D-06 | Se quebrar em duas linhas, a home volta a divergir em altura; mitigado por D-06 (encurtar para versão enxuta), sem retrabalho estrutural |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `Moldura` (interface/comum) | `_reversa_sdd/interface-comum/requirements.md#responsabilidades` | contrato-alterado | Remove `logoComoTitulo`; adiciona `comInicio?: boolean` (default `false`); identidade única = marca decorativa + `h1` textual + subtítulo + selo |
| Home (interface/inicio) | `_reversa_sdd/interface-inicio/requirements.md#responsabilidades` | regra-alterada | Monta a `Moldura` sem `logoComoTitulo` e sem `comInicio`; herda a identidade de três blocos |
| Calculadoras (interface/{calculadora,cardiologia,gestacao,risco-cardiovascular}) | `_reversa_sdd/interface-*/requirements.md` | regra-alterada | Passam `comInicio` na `Moldura` para preservar o comando de início (antes derivado de `!logoComoTitulo`) |
| `cabecalho.css` (interface/estilos) | `_reversa_sdd/interface-estilos/requirements.md#responsabilidades` | regra-removida | Remove a regra órfã `.cabecalho-identidade h1 .cabecalho-logo` (a logo-como-wordmark deixa de existir) |
| `inicio.css` (interface/estilos) | `_reversa_sdd/interface-estilos/requirements.md#responsabilidades` | regra-removida | Remove a tipografia do hero da variante `destaque`; mantém padding da coluna e a borda `muted` |
| `e2e/cabecalho.spec.ts` | `_reversa_sdd/code-analysis.md#testes` | componente-novo (teste) | Guarda de altura nas 5 rotas + guarda negativa (sem altura fixa) |
| `moldura.test.tsx`, `plataforma.spec.ts` | `_reversa_sdd/code-analysis.md#testes` | contrato-alterado (teste) | Atualiza os casos que assumiam `logoComoTitulo`/`.cabecalho-logo` para a identidade unificada e para `comInicio` |

Fora do escopo (escopo negativo): `models/` (quatro domínios), catálogo (`interface/inicio/catalogo.ts`), `/api/v1/status`, tokens Primer. `git diff` esperado vazio nessas áreas.

## 6. Delta no modelo de dados

- Resumo das mudanças: **n/a** — a feature é de apresentação e de contrato de componente de UI; nenhum modelo de domínio, campo ou persistência é tocado.
- Detalhe completo em: `_reversa_forward/016-estrutura-cabecalho-home/data-delta.md`

## 7. Delta de contratos externos

**n/a** — nenhum contrato HTTP/fila/gRPC/GraphQL afetado. `/api/v1/status` permanece inalterado. Diretório `interfaces/` omitido. A única mudança de contrato é interna à UI (props da `Moldura`), coberta em §5 e no `data-delta.md`.

## 8. Plano de migração

n/a — sem dado persistido nem versão de API. A troca de contrato da `Moldura` é atômica no mesmo commit: remover `logoComoTitulo` e adicionar `comInicio` nos cinco pontos de uso (home + quatro calculadoras) evita estado intermediário quebrado.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Subtítulo da home quebra em duas linhas na coluna de 720px | médio | baixa | D-06: medir na implementação; adotar versão enxuta do subtítulo se necessário |
| Testes que assumem logo-no-`h1` (`moldura.test.tsx`, `plataforma.spec.ts:403` casando `.cabecalho-logo`) quebram | baixo | alta (esperado) | Atualizá-los como parte da entrega para a identidade unificada e para `comInicio` |
| Regressão nas guardas 011/015 (⌂ ausente na home; alternador coincidente) | alto | baixa | Guardas seguem no `cabecalho.spec.ts`; `comInicio` preserva o comportamento da regra 11 |
| Repetição visual marca APSi + `h1` "APS Inteligente" na home | baixo | certa | Aceita no esclarecimento 2026-07-23 (D-03); nome acessível preservado |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Guarda de altura verde nas 5 rotas (±2px) e guarda negativa (sem `height`/`min-height` no `.cabecalho`) verde
- [ ] Guardas 011/013/015 seguem verdes; `axe-baseline` 0/0 por rota; folhas < 400 linhas; só `var(--*)`
- [ ] `vitest` + `playwright` + `axe` verdes; sem novas dependências
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
