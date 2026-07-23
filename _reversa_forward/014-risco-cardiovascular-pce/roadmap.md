# Roadmap: Calculadora de risco cardiovascular (Pooled Cohort Equations — ACC/AHA)

> Identificador: `014-risco-cardiovascular-pce`
> Data: `2026-07-23`
> Requirements: `_reversa_forward/014-risco-cardiovascular-pce/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature nasce **aditiva**, replicando ponto a ponto o molde da calculadora de dor torácica (feature 010, adendo `010-dor-toracica-pre-teste.md`): uma nova unit de domínio puro, uma tela React sobre a `Moldura` comum, uma rota do Pages Router, uma ficha no catálogo e uma folha CSS própria — sem tocar em nenhum dos três motores existentes (`git diff` de `models/insulina`, `models/gestacao` e `models/cardiopatia-isquemica` vazio). A diferença de natureza em relação ao molde é o núcleo de cálculo: no lugar de um *lookup* em matriz congelada de 24 células, entra a avaliação de quatro equações de Cox sexo- e raça-específicas (Pooled Cohort Equations, Goff et al. 2013), com coeficientes congelados em `fonte-clinica.ts` e validadas por *golden cases* extraídos de implementação de referência (pacote R `PooledCohort`). A calculadora **apenas informa** o risco percentual de ASCVD em 10 anos e sua categoria, sem emitir recomendação de conduta (invariante da ADR 0005). A seção `cardiologia` do catálogo, hoje com uma ficha, passa a ter duas; como o nome `interface/cardiologia/` já designa a tela da dor torácica, a nova tela é nomeada pela calculadora (`interface/risco-cardiovascular/`), decisão registrada em D-02. Nenhum contrato externo muda: o cálculo roda 100% no cliente e `GET /api/v1/status` fica byte a byte.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. Spec é a fonte de verdade | Coeficientes e faixas vivem congelados em `fonte-clinica.ts`, derivados da fonte clínica (RN-01/RN-03), não do código; os *golden cases* materializam a spec em teste | respeita |
| II. Cadeia de derivação | Cada arquivo novo rastreia um RF-NN; a matriz `_reversa_sdd/traceability/code-spec-matrix.md` ganha as linhas da unit nova | respeita |
| III. Clarificação precede solução | Quatro rodadas de `/reversa-clarify` fecharam o pivô PREVENT→PCE, a decisão "só informa o risco" e o tratamento da raça; zero `[DÚVIDA]` aberta (requirements §10) | respeita |
| IV. Portão G1 | Requirements travado antes deste plano (não há seção preliminar pendente) | respeita |
| V. Fase 2 proporcional | Categoria **Produto** (ferramenta clínica, RN de correção): trio SDD + pirâmide de testes com property-based e regressão, no molde da 010 | respeita |
| VI. Rastreabilidade bidirecional | Cada arquivo cita no cabeçalho o RF-NN de origem; a matriz fecha `RF ↔ artefato ↔ teste` | respeita |
| VII. Testes como fonte de verdade | *Golden cases* das PCE (validação) + invariante property-based "toda saída carrega ≥1 referência" (RF-08); teste de regressão nasce de bug, se houver | respeita |
| VIII. Proporcionalidade | Reaplica o mesmo nível de rigor do molde 010, adequado à criticidade clínica | respeita |

Nenhum conflito de princípio identificado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Nova unit de domínio `models/risco-cardiovascular/` com 7 arquivos espelhando a anatomia da 010: `tipos.ts`, `fonte-clinica.ts`, `elegibilidade.ts`, `equacao.ts`, `categoria.ts`, `validacao.ts`, `calculadora.ts` (sem barril `index.ts`, como no molde) | Isolamento por unit e uma fonte por domínio (ADR 0003/0011); coesão funcional por arquivo | Um único arquivo monolítico (baixa coesão); reaproveitar `models/cardiopatia-isquemica` (mescla de fontes, proibida por ADR 0011) | 🟢 |
| D-02 | Nomear a tela pela calculadora — `interface/risco-cardiovascular/` — e não pela seção clínica; a rota permanece sob o path da seção (`pages/cardiologia/risco-cardiovascular.tsx`) | `interface/cardiologia/` já é a tela da dor torácica; a seção `cardiologia` passa a ter duas calculadoras, quebrando o 1:1 seção↔tela que o molde assumia | Renomear `interface/cardiologia`→`interface/cardiologia/dor-toracica` (toca artefato existente, viola regra aditiva); segunda tela dentro da mesma pasta (baixa coesão) | 🟢 |
| D-03 | Fachada `CalculadoraRiscoCardiovascular` com método público `estimar(entrada): SaidaEstimativa`, união discriminada por `tipo`: `"resultado" \| "fora-do-escopo" \| "erro-validacao"` | Replica o contrato de erro-como-valor da 010 (ADR 0004); `ErroDeInvariante` só para bug interno | Lançar exceção para entrada inválida (quebra ADR 0004) | 🟢 |
| D-04 | Congelar em `fonte-clinica.ts` os coeficientes de **alta precisão** dos quatro grupos (homens brancos/outros, homens negros, mulheres brancas/outras, mulheres negras), `BASELINE_SURVIVAL` (0.91436 / 0.89536 / 0.96652 / 0.95334) e `MEANS` (61.18 / **19.54** / −29.18 / 86.61), comentados com a Tabela A de Goff 2013 | Reproduzir o ASCVD Risk Estimator Plus exige a precisão estendida; o `mean` dos homens negros é 19.54 (a fonte que o requirements citou de memória continha erro, corrigido aqui) | Coeficientes truncados da tabela publicada (diverge do estimador oficial nos *golden cases*) | 🟢 |
| D-05 | Categoria de raça obrigatória com três opções — `branco`, `afro-americano`, `outra` — mapeando `outra` → coeficientes de brancos, como o ASCVD Estimator oficial | Decisão travada no requirements (RN-05, §9); a limitação é exposta na nota de proveniência (RF-10) | Omitir raça (as PCE são raça-específicas por construção; impossível); inferir raça (fora de escopo, sem fonte) | 🟢 |
| D-06 | Elegibilidade em `elegibilidade.ts`: idade **40–79** e ausência de DCV prévia; ambos produzem `ForaDoEscopoDaFonte` (variante `fora-do-escopo`), com `motivo` distinto — `IDADE_FORA_DA_FAIXA` e `DCV_PREVIA` | As PCE só foram validadas para prevenção primária em 40–79 (ADR 0009); reusa a variante já modelada em `EstadoCardiologia` (state-machines §3) | Faixa 40–80 do pacote `PooledCohort` (diverge do instrumento clínico oficial); saída dedicada nova para DCV prévia (multiplica variantes sem ganho) | 🟢 |
| D-07 | Valor numérico fora da faixa fisiológica (colesterol 130–320, HDL 20–100, PAS 90–200) é **alerta, não trava**: estima com o valor-limite mais próximo (*clamp*) e sinaliza possível sub/superestimativa | Padrão do projeto (ADR 0006) e comportamento documentado do estimador do ACC | Rejeitar como ofensor (mais rígido que o instrumento oficial; RN-07 pede alerta) | 🟡 |
| D-08 | Sem ritual de revisão (checkbox só existe na insulina, ADR 0012/D-08); qualquer edição marca o resultado `desatualizado` | Invariante transversal (domain.md §6.1, regras 8 e 10); estimar risco não prescreve dose | — | 🟢 |
| D-09 | A nota de proveniência (RN-09/RF-10) vive em componente próprio `proveniencia.tsx` na tela, alimentado por `NOTA_PROVENIENCIA` congelada no domínio | Fonte textual única anti-drift, mesma disciplina de `referencias.tsx` no molde | Texto embutido no JSX (segunda fonte do mesmo conteúdo) | 🟢 |
| D-10 | Bloco de contexto metodológico `ContextoDaFonte` na tela (material consultável **fora** do painel de resultado) explica por que a ferramenta usa as PCE e não a AHA PREVENT, com link para o estimador oficial da PREVENT (`professional.heart.org`). Materializa a decisão do requirements §9; adicionado após o plano, por pedido do prescritor (2026-07-23) | Torna visível ao usuário a razão da escolha de fonte (PCE fundamentam o limiar de estatina da USPSTF 2022; PREVENT estima risco menor e descasaria do limiar). Renderizado fora do `aside` de resultado, preserva ADR 0005 (o resultado não emite conduta). Link é `<a>` nativo, não requisição de rede (ADR 0002) | Embutir a menção no painel de resultado (arriscaria ler-se como conduta); omitir a PREVENT (o prescritor perde o contexto da escolha) | 🟢 |

## 4. Premissas

Nenhuma premissa herdada de `[DÚVIDA]` não resolvida — o requirements fechou todas as dúvidas (§10). Duas decisões marcadas 🟡 pelo requirements permanecem como **decisões de projeto a confirmar pelo prescritor**, não premissas cegas:

| Decisão 🟡 | Origem (`requirements.md`) | Risco se errada |
|----------|----------------------------|-----------------|
| Clamp de valor fora de faixa como alerta (D-07) | RN-07, RF-04 | Baixo — comportamento reversível; alinhado ao estimador oficial e à ADR 0006 |
| DCV prévia como `fora-do-escopo` em vez de saída dedicada (D-06/RF-05) | RF-05 | Baixo — reagrupável numa variante própria se a UX pedir mensagem mais rica |
| Cortes de categoria de risco (RF-07) | RF-07 | Baixo — cortes 5/7,5/20% são os do guideline de prevenção primária 2019, confirmados |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Camada de domínio | `_reversa_sdd/architecture.md#1` | componente-novo | Quarta unit `models/risco-cardiovascular/` (7 arquivos, sem barril), isolada dos três motores; a família passa de três para quatro domínios puros |
| Fachada de domínio | `_reversa_sdd/c4-components.md` | componente-novo | `CalculadoraRiscoCardiovascular` junta-se a `CalculadoraCardiopatiaIsquemica` e às demais fachadas |
| Camada de interface | `_reversa_sdd/architecture.md#2` | componente-novo | Nova tela `interface/risco-cardiovascular/` (`tela`, `app`, `formulario`, `resultado`, `proveniencia`) reusando `interface/comum/moldura`, `interface/calculadora/relator-de-erros` e `interface/calculadora/erro-de-campo` |
| Máquina de estado da tela | `_reversa_sdd/state-machines.md#3` | componente-novo | `EstadoRiscoCardiovascular` replica o esqueleto `vazio → sucesso \| fora-do-escopo \| erro \| falha-inesperada` da 010, sem ritual de revisão |
| Rota | `_reversa_sdd/code-analysis.md#módulo-3` (pages) | componente-novo | `pages/cardiologia/risco-cardiovascular.tsx`, molde de `pages/cardiologia/dor-toracica.tsx`; raiz e rotas existentes inalteradas |
| Catálogo | `_reversa_sdd/addenda/010-dor-toracica-pre-teste.md` (catálogo) | regra-alterada | `interface/inicio/catalogo.ts` ganha a **segunda ficha** da seção `cardiologia` (a ficha existente byte a byte) |
| Ícones da home | `_reversa_sdd/addenda/008` (ícones) | inalterado | `interface/inicio/icones.tsx` não muda — a seção `cardiologia` já mapeia `HeartIcon`; o ícone é por seção |
| Camada de estilo | `_reversa_sdd/addenda/009` (estilos) | componente-novo | `interface/estilos/risco-cardiovascular.css` (nova folha, só tokens Primer), importada em `pages/_app.tsx` ao final do bloco de CSS; `globais.css` intocado (hoje em 364 linhas, sob o teto de 400) |
| Testes | `_reversa_sdd/architecture.md#5` | componente-novo · regra-alterada | +`tests/unit/dominio-risco-cardiovascular/` (com `invariantes.test.ts` em fast-check e `equacao.test.ts` com *golden cases*), +`tests/integration/interface/risco-cardiovascular.test.tsx`, +bloco na `e2e/plataforma.spec.ts` e +2 chaves em zero no `e2e/axe-baseline.json`; `inicio.test.tsx` ganha +1 caso da ficha nova (asserções antigas byte a byte) |
| Fontes editoriais | `_reversa_sdd/data-dictionary.md` (MD-0008) | delta-de-dados | O guideline Goff 2013 é dependência **editorial** (fora do git); o `.gitignore` de `referencias/` já cobre |

**Contratos externos: nenhum delta.** `GET /api/v1/status`, CSP e cabeçalhos byte a byte; zero requisição de rede nova; cálculo síncrono no cliente. Motores `models/insulina/`, `models/gestacao/` e `models/cardiopatia-isquemica/` byte a byte.

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma persistência e nenhuma migração de banco (o Postgres serve só ao healthcheck, sem dado clínico — architecture.md §3). O "modelo" desta feature é o **domínio em memória**: novos value objects (`EntradaEstimativa`, `SaidaEstimativa` e auxiliares) e a tabela de coeficientes das quatro equações de Cox. O único durável do sistema segue sendo o tema em `localStorage`.
- Detalhe completo em: `_reversa_forward/014-risco-cardiovascular-pce/data-delta.md`

## 7. Delta de contratos externos

Nenhum. O cálculo é 100% client-side; a única superfície HTTP (`GET /api/v1/status`) não é tocada. Diretório `interfaces/` omitido por não haver contrato afetado.

## 8. Plano de migração

n/a — feature puramente aditiva, sem estado persistido a migrar e sem mudança de contrato. A "migração" resume-se à ordem de introdução dos arquivos, detalhada no `actions.md` (a gerar por `/reversa-to-do`): domínio → testes de domínio (golden cases) → tela → integração → rota + catálogo + CSS → e2e/axe.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Erro de transcrição dos coeficientes das PCE (β, `S₀`, means) | alto | média | *Golden cases* do `PooledCohort` em `equacao.test.ts`, tolerância ±0,1 pp, cobrindo os três eixos (sexo, raça, faixa de risco); coeficientes comentados com a origem |
| Precisão de ponto flutuante (Ln/exp/pow) divergir do estimador oficial | médio | baixa | Usar coeficientes de alta precisão (D-04); validar contra os valores publicados na casa decimal do teste |
| Categorização racial norte-americana mal traduzível ao Brasil | médio (clínico) | alta | Nota de proveniência visível (RF-10/D-09) declarando a limitação; decisão de negócio já travada (RN-05/RN-09) |
| Ferramenta ser lida como recomendação de estatina | alto (clínico) | média | Nenhuma conduta emitida (RN-06/ADR 0005); só risco % + categoria; teste de integração que asserta ausência de recomendação (critério Gherkin §7) |
| Estouro de `globais.css` acima de 400 linhas | baixo | baixa | Folha própria `risco-cardiovascular.css`; `globais.css` não recebe nada (D do adendo 009) |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `models/risco-cardiovascular/` isolada: `git diff` dos outros três motores vazio
- [ ] *Golden cases* das PCE verdes (≥3 casos, ±0,1 pp) e invariante "toda saída carrega ≥1 referência" (property-based) verde
- [ ] Integração da tela: entrada válida → risco % + categoria; idade fora de 40–79 → `fora-do-escopo`; DCV prévia → `fora-do-escopo`; dois campos inválidos → dois ofensores; resultado **não** recomenda estatina
- [ ] Nota de proveniência visível na tela (RF-10)
- [ ] Ficha nova na home (seção Cardiologia); rota `/cardiologia/risco-cardiovascular` renderiza sob `<Head>` com aviso de cálculo local; fichas antigas byte a byte
- [ ] `e2e/plataforma.spec.ts` verde e `axe-baseline.json` 0/0 na rota nova
- [ ] Suíte completa verde (vitest + playwright), lint + typecheck limpos
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-23 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-07-23 | +D-10: bloco de contexto metodológico PCE × PREVENT (com link), pós-coding, por pedido do prescritor | reversa |
