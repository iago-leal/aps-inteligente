# Roadmap: Calculadora de dor torácica e probabilidade pré-teste de cardiopatia isquêmica

> Identificador: `010-dor-toracica-pre-teste`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/010-dor-toracica-pre-teste/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Terceira calculadora, construída como **delta aditivo** no molde já provado pela feature 007: nasce uma unit de domínio pura `models/cardiopatia-isquemica/` (tipos, fonte clínica congelada, classificação, probabilidade, conduta, validação e fachada), sem dependência dos motores `models/insulina` e `models/gestacao` — que permanecem byte a byte intocados. A camada de interface ganha `interface/cardiologia/` (app, formulário, resultado, blocos de referência, tela), reusando a `Moldura` comum e os tokens Primer. A navegação entra pela fonte única `interface/inicio/catalogo.ts`, com nova seção **"Cardiologia"** e a rota `pages/cardiologia/dor-toracica.tsx`. A lógica clínica projeta o TeleCondutas *Cardiopatia Isquêmica* (2017) em três passos determinísticos — classificar a dor (Quadro 1) → estimar probabilidade pré-teste por idade/sexo/fatores de risco (Quadro 2) → traduzir em conduta de investigação (baixa/intermediária/alta, ergometria × exame alternativo) — com toda saída referenciada e erros como valores. Os invariantes do projeto (privacidade por construção, determinismo, coleta total de ofensores, painel honesto) são herdados, não reinventados. TDD do domínio primeiro; interface e e2e aditivos, sem alterar asserções existentes.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | `requirements.md` (travado, sem `[DÚVIDA]`) origina cada regra; código será projeção | respeita |
| II. Cadeia de derivação | Cada arquivo novo rastreia um RF-NN; nada entra sem RF (a Tabela 1/CCS entram por RF-10) | respeita |
| III/IV. Clarificação precede, G1 | Escopo, fatores de risco e nomenclatura resolvidos em `/reversa-clarify` (§9) antes do plano | respeita |
| V. Fase 2 proporcional (Produto) | Trio crítico + regras/dados; sem molde de API (nenhum contrato externo novo) | respeita |
| VI. Rastreabilidade bidirecional | Cabeçalho de cada módulo citará o RF-NN; matriz fecha no `/reversa-coding` | respeita |
| VII. Testes em dois papéis | Property-based para invariante "toda saída referenciada" e oráculo por célula do Quadro 2; regressão por bug futuro | respeita |
| VIII. Proporcionalidade | Categoria **Produto** (uso clínico): pirâmide unidade→integração→contrato→e2e, cobertura ≥ 90% em `models/**` | respeita |

Nenhum conflito de princípio detectado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Nova unit `models/cardiopatia-isquemica/`, pura e isolada, espelhando `models/gestacao/` (tipos · fonte-clinica · classificacao · probabilidade · conduta · validacao · calculadora) | Alta coesão, baixo acoplamento; motores existentes intocados (ADR 0003; adendo 007) | (a) estender `models/insulina`; (b) módulo único monolítico | 🟢 |
| D-02 | Tabela do Quadro 2 como **constante congelada** `PROBABILIDADE_PRE_TESTE[classe][sexo][faixaEtaria] → %`, fonte numérica única | Determinismo e fidelidade à fonte (MD-0009); oráculo de teste por célula | Calcular via escore Diamond-Forrester (fórmula) | 🟢 |
| D-03 | Ajuste por fatores de risco como **faixa** `[base×2, base×3]`, **capada** em ">90% / alta" ao extrapolar; ≥ 1 fator ⇒ estrato nunca "baixa" | Decisão do prescritor em §9; "apoio à decisão, não decisão" (ADR 0005) | Número único; multiplicador fixo ×2,5 | 🟡 |
| D-04 | Estrato → conduta como **mapa declarativo** (baixa/intermediária/alta), com causas não cardíacas na baixa e regra ergometria × exame alternativo (ECG basal alterado / não pode exercitar) | RN-04/RN-05; conduta é o desfecho que responde à demanda | Texto livre não estruturado | 🟢 |
| D-05 | Idade fora de 30–69 → `ForaDoEscopoDaFonte` (variante de união), sem extrapolar | RN-06; honestidade de escopo (MD-0009; ADR 0009) | Extrapolar linearmente a tabela | 🟢 |
| D-06 | Nova seção `cardiologia` em `catalogo.ts` + rota `pages/cardiologia/dor-toracica.tsx`; ícone via Octicon em `interface/inicio/icones.tsx` | Fonte única de navegação (adendo 007); home dirigida pelo catálogo | Rota solta sem entrada no catálogo | 🟢 |
| D-07 | Blocos de referência (RF-10: CCS, tratamento + Tabela 1, seguimento, manejo agudo) em `interface/cardiologia/referencias.tsx`, textual, sem cálculo, cada bloco citando quadro/página | Escopo decidido em §9; separa material informativo do núcleo calculado | Misturar referência com o resultado calculado | 🟢 |
| D-08 | **Sem ritual de revisão** na tela (diferente da insulina), espelhando a IG: a saída estratifica e recomenda investigação, não prescreve dose | Precedente 007 ("datação não prescreve"); reduz atrito | Portar o checkbox "Revisei" + "Copiar plano" da insulina | 🟡 |
| D-09 | Estilo Primer reusando `Moldura` e classes existentes; folha própria `interface/estilos/cardiologia.css` só se necessário, mantendo arquivos < 400 linhas | Coerência visual (adendo 004); teto de arquivo (sinal 5.6) | Estilos inline; inchar `globais.css` | 🟢 |

## 4. Premissas

Nenhuma premissa herdada de `[DÚVIDA]` — todas as dúvidas foram resolvidas em `/reversa-clarify` (§9 do requirements). As decisões D-03 e D-08 são marcadas 🟡 por conterem inferência de implementação (mecânica do *cap* da faixa; ausência de ritual de revisão) a validar em uso pelo prescritor — ver §9 (Riscos) e `regression-watch.md` na fase de coding.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `models/cardiopatia-isquemica/` | `_reversa_sdd/architecture.md#1-estilo-arquitetural` | componente-novo | Terceira unit de domínio pura; nenhuma dependência entre motores |
| `interface/cardiologia/` | `_reversa_sdd/architecture.md#2-containers-e-componentes` | componente-novo | Tela nova (app/formulario/resultado/referencias/tela) reusando `Moldura` |
| `interface/inicio/catalogo.ts` | `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` | regra-alterada | Nova seção `cardiologia` com a ficha da calculadora; catálogo segue fonte única |
| `interface/inicio/icones.tsx` | adendo 008 (`icones.tsx`) | regra-alterada | Mapear `cardiologia` → Octicon (ex.: `HeartIcon`/`PulseIcon`), fallback null |
| `pages/cardiologia/dor-toracica.tsx` | `_reversa_sdd/code-analysis.md#módulo-3` (pages) | componente-novo | Rota que monta a tela, no molde de `pages/pre-natal/idade-gestacional.tsx` |
| `tests/unit/dominio-cardiopatia/` | `_reversa_sdd/architecture.md#5-qualidade-e-testes` | componente-novo | Unidade com property-based (invariante de referência) + oráculo do Quadro 2 |
| `tests/integration/interface/cardiologia.test.tsx` · `inicio.test.tsx` | `_reversa_sdd/architecture.md#5` | componente-novo / regra-alterada | Integração da nova tela; `inicio.test.tsx` ganha a nova seção (asserções antigas byte a byte) |
| `e2e/plataforma.spec.ts` · `e2e/axe-baseline.json` | adendo 007 (harness e2e) | regra-alterada | Casos aditivos (ficha nova, fluxo típico, fora de escopo, exame alternativo); baseline ganha chaves da rota nova em zero |
| `interface/estilos/cardiologia.css` (opcional) | adendo 009 (`cabecalho.css`/`globais.css`) | componente-novo | Só se o reúso de classes não bastar; importado por `_app.tsx` após globais |

Contratos externos: **nenhum delta** — `GET /api/v1/status`, CSP e cabeçalhos byte a byte; zero requisição de rede nova (por isso não há `interfaces/`). Motores `insulina`/`gestacao` intocados (`git diff models/insulina models/gestacao` deve ficar vazio).

## 6. Delta no modelo de dados

- Resumo das mudanças: sem banco (ausência por design). Novas entidades **em memória** — `EntradaAvaliacao` (idade, sexo, três características da dor, fatores de risco, sinais de instabilidade, impedimento de ergometria) → `SaidaAvaliacao` (união: `ResultadoAvaliacao` | `ForaDoEscopoDaFonte` | `EntradaInvalida` | `ErroDeInvariante`). Nenhuma migração.
- Detalhe completo em: `_reversa_forward/010-dor-toracica-pre-teste/data-delta.md`

## 7. Delta de contratos externos

n/a — a feature não cria nem altera contrato externo. Diretório `interfaces/` omitido.

## 8. Plano de migração

n/a — feature puramente aditiva; nenhuma migração de dados ou de rota destrutiva. A raiz e as rotas existentes (`/dm2/insulina`, `/pre-natal/idade-gestacional`) permanecem inalteradas; a home passa a listar a terceira ferramenta por dados do catálogo.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Erro de transcrição da tabela do Quadro 2 (24 células) | alto | médio | Oráculo de teste célula a célula; revisão do usuário médico antes do encerramento |
| Mecânica do *cap* da faixa de fatores de risco (D-03) divergir da leitura clínica | médio | médio | Validar redação/limite com o prescritor; registrar em `regression-watch.md` |
| Ausência de ritual de revisão (D-08) surpreender o usuário | baixo | médio | Decisão explícita no plano; confirmar em uso; reversível (portar o checkbox se pedido) |
| PDF da fonte fora do versionamento (MD-0008) | baixo | alto | Estender `.gitignore` à terceira fonte; guardar `referencias/` localmente |
| Crescimento do bundle acima do gate D-08 (< 100 kB gzip) | baixo | baixo | Medir no build (base × final); Octicon tree-shaken; sem libs novas |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Domínio novo com cobertura ≥ 90% e property-based do invariante "toda saída referenciada" verde
- [ ] Oráculo do Quadro 2 (24 células) verde; classificação, ajuste por fatores de risco, fora de escopo e conduta cobertos
- [ ] Suítes existentes intocadas (só adições); contrato 16/16; e2e aditivos verdes; `axe` sem aumento sobre baseline
- [ ] `git diff models/insulina models/gestacao` vazio; nenhum arquivo > 400 linhas
- [ ] Bundle medido contra o gate D-08; `regression-watch.md` gerado
- [ ] Re-extração reversa sem regressão vermelha (recomendado)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
