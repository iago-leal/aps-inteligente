# Roadmap: Calculadora de idade gestacional (DUM ou ultrassom) e página inicial por categorias

> Identificador: `007-idade-gestacional-e-home`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/007-idade-gestacional-e-home/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Dois deltas independentes, entregues juntos porque a segunda calculadora exige o índice. Primeiro, nasce a **unit de domínio `models/gestacao/`** no molde exato de `models/insulina/` (`_reversa_sdd/architecture.md#1-estilo-arquitetural`): tipos com erros como valores, catálogo próprio de referências ao *Guia Rápido Pré-Natal* (pp. 31–32, 113), validação com coleta total de ofensores e fachada pura que recebe a data de referência como entrada — o motor jamais lê o relógio. A UI correspondente nasce em `interface/gestacao/`, espelhando as constantes do domínio. Segundo, `pages/index.tsx` deixa de montar `TelaCalculadora` e passa a montar a **home** (`interface/inicio/`), com as duas seções decididas (Diabetes Mellitus tipo 2 e Pré-natal) alimentadas por um catálogo tipado único — a mesma fonte que gera as rotas, eliminando drift entre índice e páginas. A calculadora de insulina muda apenas de endereço (`pages/dm2/insulina.tsx`), com tela, testes e comportamento byte a byte.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Invariante-mãe: a spec é a fonte de verdade | Fórmulas derivam do requirements (que cita o guia pp. 31–32), não do site de referência funcional; conflito código×spec resolve-se pela spec | respeita |
| II. Cadeia de derivação | Cada decisão D-NN abaixo cita o RF/RN que a motiva; nenhum componente nasce sem origem | respeita |
| III. Clarificação precede solução | Sessão de 2026-07-23 resolveu as três dúvidas antes deste plano; premissas 🟡 remanescentes estão declaradas na §4 | respeita |
| IV. Portão G1 | Requirements travado (zero `[DÚVIDA]`) antes deste roadmap | respeita |
| V. Fase 2 proporcional | Categoria Produto: trio crítico completo (requirements, roadmap, actions) + data-delta e onboarding; sem `interfaces/` porque nenhum contrato externo muda | respeita |
| VI. Rastreabilidade bidirecional | Arquivos novos citarão RF-NN no cabeçalho; a tabela de rastreabilidade da feature fecha no coding | respeita |
| VII. Testes: metade da fonte de verdade | Pirâmide completa: unidade (com property-based nos invariantes de datas), integração, e2e; testes nascem antes do código nas ações | respeita |
| VIII. Proporcionalidade | Rigor pleno justificado: saída influencia conduta clínica de pré-natal | respeita |

Nenhum conflito de princípio identificado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Unit nova `models/gestacao/` no molde de `models/insulina/`: `tipos.ts`, `fonte-clinica.ts`, `validacao.ts`, `datacao.ts` (regras), `calculadora.ts` (fachada) — domínio puro, zero import de framework (RF-01..04, RN-01..07) | Molde já validado por três features e pela extração (ADR 0003, ADR 0004); previsibilidade para o mantenedor | (a) estender `models/insulina` — acoplaria fontes clínicas distintas, violando coesão; (b) lógica na UI — violaria a camada de domínio | 🟢 |
| D-02 | Datas como valor-dia em UTC: entradas `AAAA-MM-DD`, aritmética por dias epoch via UTC, sem objeto `Date` local e sem biblioteca de datas (RN-01..03, RN-07) | Elimina bugs de fuso/horário de verão na diferença de dias; zero dependência nova (dependências enxutas, `_reversa_sdd/dependencies.md#observações`) | (a) biblioteca de datas — dependência de runtime nova sem necessidade; (b) `Temporal` — suporte de navegador ainda desigual; (c) `Date` local — sujeito a fuso | 🟢 |
| D-03 | DPP pela regra calendárica de Naegele (+7 dias, +9 meses), exatamente como a p. 32 do guia; a tela não afirma "40 semanas na DPP", evitando a incoerência de ±1–3 dias com a contagem de 280 dias (RN-02) | A fonte fixa Naegele com exemplo; spec manda (Princípio I). A nota 🟡 da RN-02 resolve-se não exibindo derivação que possa divergir | (a) DUM + 280 dias — divergiria do exemplo literal da fonte; (b) exibir ambas — ruído sem valor clínico | 🟢 |
| D-04 | Fachada única com entrada composta `{dataReferencia, dum?, ultrassom?}` (ao menos uma datação completa): calcula por método presente e, com os dois, emite a comparação da RN-11 (diferença em dias, margem pelo trimestre da USG, veredito "DUM fora da margem") sem escolher pelo prescritor (RF-09, RN-11; ADR 0005) | A regra de arbitragem é da própria fonte (p. 32); saída informativa preserva "apoio à decisão, não decisão" | (a) modos exclusivos — contraria a decisão do usuário de 2026-07-23; (b) motor escolher a datação — violaria ADR 0005 | 🟢 |
| D-05 | USG de terceiro trimestre: o guia só parametriza margens para 1.º (1 semana) e 2.º (2 semanas) trimestres; com USG de 3.º trimestre e DUM presente, a comparação sai **sem veredito**, com recomendação de julgamento clínico (RN-11 fronteira) | Escopo = fonte (`_reversa_sdd/domain.md#6-fronteiras-de-escopo`): o que o guia não parametriza, o motor não inventa (mesmo padrão do NG-07 da insulina) | (a) extrapolar margem de 3 semanas — regra sem fonte; (b) recusar a entrada — esconderia informação útil (as duas datações) | 🟡 |
| D-06 | Rotas espelham as seções: `pages/index.tsx` → home; `pages/dm2/insulina.tsx` → calculadora de insulina; `pages/pre-natal/idade-gestacional.tsx` → calculadora de IG (RF-05, RF-06; RN-08) | URL legível em português diz a que seção pertence; confirmado com o usuário que a criação é em `pages/` (Pages Router vigente, `_reversa_sdd/code-analysis.md#módulo-3`) | (a) `/calculadoras/<nome>` plano — perde o vínculo com as seções; (b) rotas em inglês — destoa do produto todo em pt-BR | 🟡 |
| D-07 | Catálogo tipado único `interface/inicio/catalogo.ts`: lista de seções e calculadoras (título, descrição, rota) consumida pela home; as rotas em `pages/` referenciam as mesmas entradas (RF-05, RF-06) | Fonte única anti-drift entre índice e páginas — mesmo padrão do espelhamento via `CONSTANTES` e do `rotulos.ts` da feature 006 | (a) hardcode dos cards na home — drift certo quando nascer a terceira calculadora | 🟢 |
| D-08 | UI da gestação em `interface/gestacao/` no molde de `interface/calculadora/` (tela, formulário, resultado), com validação espelhada importando as `CONSTANTES` do domínio novo; **sem ritual de revisão** — a IG informa datação, não conduta prescritiva; permanece o disclaimer com fonte (RF-01..04, RF-07) | O ritual existe para gate de prescrição (`_reversa_sdd/domain.md#2-glossário`); datação não prescreve. Premissa registrada na §4 | (a) replicar o ritual — cerimônia sem função, justamente a queixa que originou a feature 006 | 🟡 |
| D-09 | Moldura compartilhada mínima: extrair de `tela.tsx` apenas o que a home e a tela de IG precisam reutilizar (cabeçalho com selo "nada é salvo nem enviado" e alternador de tema) para `interface/comum/`, por refactor sem mudança de comportamento — suíte da calculadora de insulina permanece verde sem alterar asserção (RF-08) | Evita duplicar o selo/tema em três telas; o precedente de extração byte a byte é o `rotulos.ts` da 006 | (a) duplicar a moldura — drift visual entre telas; (b) generalizar `tela.tsx` inteira — refactor maior que o necessário na tela clínica validada | 🟡 |
| D-10 | Pirâmide da feature: unidade do domínio novo (inclui property-based: IG ≥ 0; ida e volta DUM↔dias; Naegele total; margens), integração de `interface/gestacao/` e da home, e2e novo `e2e/plataforma.spec.ts` (home → navegação às duas calculadoras → cálculo IG por DUM → axe 0) mantendo `e2e/calculadora.spec.ts` com rota atualizada (RNFs; Princípio VII) | Mesma pirâmide e thresholds do legado (90% em `models/**`, axe linha de base 0, contrato 16/16) | (a) e2e único inchado — specs por página são mais legíveis e paralelizáveis | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Cortes de trimestre 13+6 / 27+6 (convenção obstétrica; guia não define numericamente) | §10 Lacunas / RN-04 | Trimestre exibido errado no limiar; correção pontual de constante |
| Limites de validação: DUM até 44 semanas retroativas; IG de laudo 0–42 semanas | §10 Lacunas / RN-05 | Recusa indevida de entrada extrema válida; ajuste de constante |
| Sem ritual de revisão na tela de IG (datação ≠ prescrição) | §2 Contexto (adendo 006) / D-08 | Prescritor sentir falta do gate; adicionar o ritual é delta pequeno de UI |
| USG de 3.º trimestre sem veredito de margem (D-05) | RN-11 (fronteira não parametrizada pela fonte) | Se o prescritor esperar veredito, a saída informativa pode parecer incompleta; documentado na tela |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `models/gestacao/` (unit nova) | `_reversa_sdd/architecture.md#1-estilo-arquitetural` (molde) | componente-novo | Domínio puro da datação gestacional: tipos, fonte clínica (guia pré-natal), validação, regras, fachada |
| `interface/gestacao/` | `_reversa_sdd/code-analysis.md#módulo-2` (molde) | componente-novo | Tela, formulário (DUM e/ou USG) e painel de resultado da IG, validação espelhada |
| `interface/inicio/` | n/a (novo) | componente-novo | Home com seções e cartões, alimentada pelo `catalogo.ts` (D-07) |
| `interface/comum/` | `interface/calculadora/tela.tsx` | componente-novo | Extração mínima da moldura (selo de privacidade + alternador de tema), sem mudança de comportamento (D-09) |
| `pages/index.tsx` | `_reversa_sdd/code-analysis.md#módulo-3` | regra-alterada | Deixa de montar `TelaCalculadora`; monta a home (decisão do usuário: raiz vê a home) |
| `pages/dm2/insulina.tsx` | `pages/index.tsx` (conteúdo atual) | componente-novo | Rota própria da calculadora de insulina, metadados preservados |
| `pages/pre-natal/idade-gestacional.tsx` | n/a (novo) | componente-novo | Rota da calculadora de IG com metadados próprios |
| `e2e/` | `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` (harness) | regra-alterada | Spec novo de plataforma; spec da calculadora aponta para a rota nova |
| `models/insulina/` · contratos externos (`/api/v1/status`, cabeçalhos) | — | **intocados** | RF-08; CSP e contrato 16/16 permanecem byte a byte |

## 6. Delta no modelo de dados

- Resumo das mudanças: apenas entidades **em memória** da unit nova (`EntradaDatacao` → `SaidaDatacao` com comparação DUM×USG); nenhuma persistência, banco segue vazio (adendo 003), ERD do legado inalterado.
- Detalhe completo em: `_reversa_forward/007-idade-gestacional-e-home/data-delta.md`

## 7. Delta de contratos externos

Nenhum. A feature é 100% client-side; `GET /api/v1/status` e os cabeçalhos de segurança permanecem byte a byte (diretório `interfaces/` omitido por isso).

## 8. Plano de migração

n/a — sem dados persistidos e sem redirecionamento: a troca da raiz é atômica no deploy (decisão do usuário: quem acessa a raiz passa a ver a home; a insulina fica a um clique).

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Usuário habituado à raiz-calculadora estranhar a home | baixo | média | Card da seção DM2 visível acima da dobra; um clique até a calculadora (RF-06) |
| Erro de aritmética de datas (fuso, meses, bissexto) | alto | média | D-02 (UTC puro) + property-based (D-10) + cenários fixos do requirements §7 |
| Drift entre home e rotas ao crescer o catálogo | médio | média | D-07: catálogo tipado único |
| Refactor da moldura (D-09) alterar a tela clínica validada | alto | baixa | Extração byte a byte com suíte de integração e e2e da insulina inalterados como oráculo |
| Margens de datação mal aplicadas (trimestre da USG) | alto | baixa | Tabela de margens como constante citando p. 32; testes de limite (6+6/7+0; 13+6/14+0; 27+6/28+0) |
| Bundle first-load da home crescer além do gate | baixo | baixa | Home usa componentes já presentes no bundle (adendo 004); gate de bundle do CI vigia |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Suítes verdes: unidade + integração (incluindo `models/gestacao` ≥ 90% de cobertura), contrato 16/16, e2e (specs antigo e novo) com axe na linha de base 0
- [ ] `git diff models/insulina/` vazio; CSP e cabeçalhos byte a byte (teste de contrato)
- [ ] Zero requisição de rede nova (verificação de privacidade do e2e)
- [ ] Arquivos novos citam RF-NN no cabeçalho; nenhum arquivo > 400 linhas
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
