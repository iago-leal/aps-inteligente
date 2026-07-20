# Requirements: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A feature publica em produção a primeira página da plataforma — a calculadora de insulina para DM2 (diabetes mellitus tipo 2) — e reconstitui a API v1 com seu primeiro endpoint de saúde: `GET /api/v1/status`, que responde HTTP 200 com um corpo de saúde quando o site está no ar. Beneficia o médico prescritor, que passa a acessar a calculadora por URL pública, e o mantenedor, que ganha observabilidade mínima do deploy sem telemetria. Resolve duas intenções não realizadas do legado (a API v1 hoje reduzida a placeholders vazios e a antiga feature 002 de observabilidade do deploy, perdida na refundação) e quita, como condição da subida, três dívidas técnicas correlatas: CI inexistente, script de testes de API quebrado e cabeçalhos de segurança não verificados. Produção nesta feature é a URL padrão do provedor de hospedagem já configurado; domínio próprio está fora do escopo.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/domain.md#7-intenções-declaradas-e-não-realizadas` | A API v1 é intenção não realizada: `pages/api/v1/index.js` vazio; a feature 002 (`/api/v1/status`, observabilidade do deploy, MD-0011) existiu no repo pré-refundação e não foi reconstituída | 🟢 |
| `_reversa_sdd/adrs/0008-plataforma-hibrida-api-sem-dado-clinico.md` | Rotas de API são permitidas desde que nenhum dado clínico ou pessoal trafegue ou persista; guarda comportamental (sem leitura de corpo, sem `Set-Cookie`) vigiada por teste de contrato; endpoint, guarda e teste de contrato voltam juntos | 🟢 |
| `_reversa_sdd/domain.md#6-fronteiras-de-escopo` | Persistência de dado clínico excluída por arquitetura (MD-0003); rotas de API apenas sem dado clínico (MD-0011) | 🟢 |
| `_reversa_sdd/architecture.md#2-containers-e-componentes` | Um único container de runtime (aplicação web servida pelo provedor de hospedagem já configurado) e um container fantasma `pages/api/v1/` vazio | 🟢 |
| `_reversa_sdd/inventory.md#cicd-docker-e-configuração` | Deploy alvo já configurado no projeto (`.vercel/project.json` presente); CI/CD ausente | 🟢 |
| `_reversa_sdd/inventory.md#scripts-do-packagejson` | Script `test:api` quebrado: referencia config de teste de API inexistente (existia antes da refundação, recuperável no bundle) | 🟢 |
| `_reversa_sdd/architecture.md#6-dívidas-técnicas` | Dívidas correlatas: nº 1 (CI inexistente), nº 3 (scripts `test:api`/`test:e2e` quebrados), nº 8 (CSP e cabeçalhos de segurança não verificados desde a refundação; existiam no repo antigo, commit `ebad6a5`) | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` e `0007-telemetria-nula-fase-1.md` | Privacidade por arquitetura: sem telemetria, sem coleta; qualquer observabilidade nova não pode coletar dado de uso | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-3--pages-shell-nextjs` | Rota `/api/v1` declarada sem handler; requisições a ela falham hoje | 🟢 |
| `_reversa_sdd/addenda/001-integrar-design-claude.md` | Estado atual do sistema a publicar: feature 001 entregue, suíte de 188 testes verde, cobertura de domínio ≥ 90% | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico prescritor da APS (atenção primária à saúde) | Usar a calculadora de insulina no atendimento | Acessa a URL pública de produção e realiza um cálculo completo, com a mesma privacidade da versão local |
| Mantenedor do projeto | Saber por URL se o site está no ar, sem painel externo | Consulta `GET /api/v1/status` e obtém HTTP 200 com o corpo de saúde quando o site está online |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O endpoint `GET /api/v1/status` responde HTTP 200 com corpo JSON de saúde sempre que a aplicação está no ar; ele é a observabilidade mínima do deploy e não depende de nenhum estado externo (não há banco nem serviço a consultar). O corpo expõe o carimbo de tempo da resposta e a identificação do build publicado (versão/commit). 🟢
   - Origem no legado: `_reversa_sdd/domain.md#7` (feature 002 histórica, MD-0011) e `_reversa_sdd/adrs/0008`; campos do corpo decididos em esclarecimento (sessão 2026-07-19, Q4)
   - Tipo: nova (reconstituição de regra pré-refundação)
2. **RN-02:** Nenhuma rota de API trafega ou persiste dado clínico ou pessoal. A guarda é comportamental, não nominal: o endpoint não lê corpo de requisição, não emite `Set-Cookie` e não registra dado de uso; um teste de contrato vigia essas propriedades. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0008` e `_reversa_sdd/domain.md#6` (MD-0011)
   - Tipo: nova (formaliza decisão histórica ativa)
3. **RN-03:** A publicação em produção é condicionada a um gate de qualidade automatizado: integração contínua mínima (lint, verificação de tipos e suíte completa de testes) executada a cada mudança, e deploy de produção que só ocorre com o CI verde. Isso quita a dívida técnica nº 1. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#5` e `#6` (dívida nº 1) e Princípio VII; automatização decidida em esclarecimento (sessão 2026-07-19, Q2)
   - Tipo: nova
4. **RN-04:** Métodos HTTP não suportados pelo endpoint de status recebem resposta explícita de método não permitido (HTTP 405), nunca falha silenciosa. 🟡
   - Origem no legado: princípio de erros barulhentos (`_reversa_sdd/adrs/0004`, por analogia: erro esperado é valor/resposta explícita)
   - Tipo: nova
5. **RN-05:** A resposta do endpoint de status é sempre fresca: o endpoint proíbe cache (na CDN e no cliente), para que um status armazenado nunca "minta" que o site está no ar. A proibição é verificada pelo teste de contrato. 🟢
   - Origem: esclarecimento (sessão 2026-07-19, Q5); coerente com o propósito de observabilidade da feature 002 histórica (`_reversa_sdd/domain.md#7`)
   - Tipo: nova
6. **RN-06:** A página publicada em produção serve os cabeçalhos de segurança e a CSP (Content Security Policy — política de segurança de conteúdo) reconstituídos do repo pré-refundação, como condição da subida. Isso quita a dívida técnica nº 8 e materializa a privacidade por arquitetura também na camada HTTP. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#6` (dívida nº 8, commit `ebad6a5` no bundle) e `_reversa_sdd/adrs/0002`; inclusão no escopo decidida em esclarecimento (sessão 2026-07-19, Q3)
   - Tipo: nova (reconstituição de comportamento pré-refundação)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | A página da calculadora de insulina está publicada em produção, acessível pela URL pública padrão do provedor já configurado, servindo o estado atual do repositório (feature 001 incluída) | Must | `GET /` em produção responde HTTP 200 e renderiza a calculadora; um cálculo completo funciona na URL pública | 🟢 |
| RF-02 | O endpoint `GET /api/v1/status` existe e responde HTTP 200 com corpo JSON de saúde quando a aplicação está online, expondo carimbo de tempo da resposta e identificação do build publicado (versão/commit) | Must | Requisição `GET /api/v1/status` em produção retorna status 200, `Content-Type` JSON e corpo parseável com os campos de carimbo de tempo e build | 🟢 |
| RF-03 | O endpoint de status cumpre a guarda de privacidade da RN-02 e a proibição de cache da RN-05, verificadas por teste de contrato automatizado | Must | Teste de contrato comprova: resposta sem `Set-Cookie`, sem eco de corpo de requisição, corpo sem dado clínico ou pessoal, e cabeçalhos que proíbem cache | 🟢 |
| RF-04 | O script de testes de API do manifesto volta a funcionar, executando a suíte de contrato do endpoint (repara a dívida técnica nº 3, na parte de API) | Must | O comando de teste de API roda sem erro de configuração e executa ao menos os testes de contrato do RF-03 | 🟢 |
| RF-05 | Métodos diferentes de `GET` em `/api/v1/status` recebem HTTP 405 | Should | Requisição `POST /api/v1/status` retorna 405; teste automatizado cobre o caso | 🟡 |
| RF-06 | Existe integração contínua mínima (lint, verificação de tipos e testes) executada a cada mudança no ramo principal, e o deploy de produção é condicionado ao CI verde (RN-03) | Must | Uma mudança com teste falhando não chega à produção; o histórico do CI registra a execução verde que liberou o deploy | 🟢 |
| RF-07 | A produção serve os cabeçalhos de segurança e a CSP reconstituídos do repo pré-refundação (RN-06), com verificação automatizada | Must | As respostas da página em produção contêm os cabeçalhos de segurança esperados; um teste verifica a presença deles | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança e privacidade | A produção preserva a privacidade por arquitetura: nenhum dado clínico sai do navegador; a API não introduz cookie, sessão ou coleta; a camada HTTP serve CSP e cabeçalhos de segurança | `_reversa_sdd/adrs/0002`, `0007`, `0008`; RN-06 | 🟢 |
| Observabilidade | A saúde do deploy é verificável por URL, sem telemetria e sem painel de terceiros; falhas do endpoint são barulhentas (resposta de erro explícita); a resposta de saúde nunca é servida de cache | `_reversa_sdd/domain.md#7` (propósito da feature 002 histórica); ADR 0004 por analogia; RN-05 | 🟢 |
| Desempenho | O endpoint de status responde de imediato (sem I/O externo); não há requisito numérico de latência nesta fase | RN-01: ausência de estado externo por design | 🟡 |
| Reprodutibilidade | O deploy é reproduzível a partir do repositório: build determinístico com lockfile commitado e versões pinadas; o gate de CI garante que só estados verdes chegam à produção | `_reversa_sdd/architecture.md#6` (sem dívida de dependências); CLAUDE.md global §5.3; RN-03 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: site online responde ao status
  Dado que a aplicação está publicada em produção
  Quando o mantenedor faz GET /api/v1/status
  Então a resposta tem status HTTP 200
  E o corpo é JSON parseável com carimbo de tempo da resposta e identificação do build publicado

Cenário: calculadora acessível em produção
  Dado que a aplicação está publicada em produção
  Quando o médico prescritor acessa a URL pública raiz
  Então a página da calculadora renderiza
  E um cálculo completo pode ser realizado sem qualquer requisição com dado clínico

Cenário: guarda de privacidade e frescor da API
  Dado o endpoint /api/v1/status publicado
  Quando qualquer requisição GET é feita a ele
  Então a resposta não contém cabeçalho Set-Cookie
  E o corpo não contém dado clínico nem pessoal
  E os cabeçalhos da resposta proíbem cache

Cenário: cabeçalhos de segurança na página
  Dado que a aplicação está publicada em produção
  Quando qualquer página é requisitada
  Então a resposta contém a CSP e os cabeçalhos de segurança reconstituídos

Cenário: suíte de contrato executável no repositório
  Dado o repositório clonado com as dependências instaladas
  Quando o mantenedor executa o script de testes de API do manifesto
  Então a suíte de contrato do endpoint de status roda sem erro de configuração
  E reporta o resultado de cada teste

Cenário: método não suportado
  Dado o endpoint /api/v1/status publicado
  Quando uma requisição POST é feita a ele
  Então a resposta tem status HTTP 405

Cenário: deploy bloqueado por CI vermelho
  Dado uma mudança no ramo principal com teste falhando
  Quando o CI executa
  Então a publicação em produção não ocorre
  E a falha fica registrada de forma explícita
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | É o objeto central do pedido: a primeira página no ar |
| RF-02 | Must | Primeiro endpoint de saúde, pedido explícito e reconstituição da feature 002 histórica |
| RF-03 | Must | ADR 0008 condiciona a existência da API à guarda com teste de contrato: endpoint sem guarda viola decisão vigente |
| RF-04 | Must | Sem o script funcional, o teste de contrato não é executável de forma reprodutível (dívida nº 3) |
| RF-05 | Should | Robustez do contrato HTTP; não bloqueia a subida se o comportamento default do framework já for explícito |
| RF-06 | Must | Decisão do esclarecimento Q2: o gate de qualidade é automatizado de ponta a ponta nesta feature (dívida nº 1) |
| RF-07 | Must | Decisão do esclarecimento Q3: a CSP reconstituída é condição da subida (dívida nº 8) |
| RNF de reprodutibilidade | Must | Categoria Produto: deploy não reproduzível é dívida imediata |

## 9. Esclarecimentos

### Sessão 2026-07-19

- **Q:** O que conta como "produção" nesta feature: URL padrão do provedor ou domínio próprio?
  **R:** (a) A URL padrão do provedor já configurado basta; domínio próprio fica fora do escopo desta feature.
- **Q:** Como o gate de qualidade da RN-03 deve ser executado antes do deploy?
  **R:** (c) CI mínimo (lint + verificação de tipos + testes) já nesta feature, com o deploy de produção condicionado ao CI verde — gate automatizado de ponta a ponta, quitando a dívida técnica nº 1.
- **Q:** Os cabeçalhos de segurança e a CSP (dívida técnica nº 8) entram nesta subida?
  **R:** (b) Sim: reconstituir do bundle pré-refundação já nesta feature, como condição da subida.
- **Q:** Quais campos o corpo JSON do status deve expor além do HTTP 200?
  **R:** (b) Carimbo de tempo da resposta e identificação do build publicado (versão/commit).
- **Q:** Como tratar cache no endpoint de saúde, que cacheado poderia "mentir" o status?
  **R:** (a) Resposta sempre fresca: o endpoint proíbe cache, comportamento verificado pelo teste de contrato.

## 10. Lacunas

- Nenhuma lacuna pendente: as três dúvidas da versão inicial foram resolvidas na sessão de esclarecimentos de 2026-07-19.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-19 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-19 | Sessão de esclarecimentos integrada por `/reversa-clarify`: 5 dúvidas resolvidas, RN-05/RN-06 e RF-06/RF-07 adicionados, lacunas zeradas | reversa |
