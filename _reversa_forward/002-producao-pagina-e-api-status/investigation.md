# Investigation: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`

## 1. Fonte principal: a feature 002 histórica no bundle

A investigação central desta feature foi arqueológica: o bundle `~/dev/aps-inteligente-backup.bundle` (clone de trabalho em `scratchpad/bundle-clone` desta sessão) contém a feature `002-endpoints-status-api-v1` completa, do requirements ao código. Commits relevantes do snapshot `0366d52`:

| Commit | Conteúdo recuperável |
|---|---|
| `e5e52a8` | `src/pages/api/v1/status/index.js` (stub do curso.dev), `vitest.api.config.ts`, testes `get.status.test.js` e `contract.status.test.js` com a **denylist de privacidade** (15 padrões: segredos, tokens, dado clínico/pessoal) |
| `ebad6a5` | `next.config.ts` com o bloco `headers()`: CSP sem terceiros (produção), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` |
| `ad231bd` | `.github/workflows/ci.yml`: job lint+typecheck+testes em todo push; job e2e como gate de merge |
| `70c27af`/`5eef16e` | roadmap, contrato `interfaces/http-get-api-v1-status.md` e actions da feature histórica |

## 2. O que a reconstituição preserva e o que muda

| Aspecto | Histórico (bundle) | Esta feature | Motivo |
|---|---|---|---|
| Corpo do status | Evolutivo, stub `{ "chave": ... }`, cresceria com o curso.dev | Contrato fixo: `atualizado_em`, `versao`, `commit` | Esclarecimento Q4; o vínculo com o curso.dev não existe mais |
| Denylist de privacidade no teste de contrato | Presente | Preservada integralmente | ADR 0008; artefato validado |
| Cache | "nenhum contrato de cache declarado" | `Cache-Control: no-store` obrigatório e testado | Esclarecimento Q5 |
| Método não-GET | Stub respondia igual a tudo | 405 + `Allow: GET` | RN-04; nota do próprio contrato histórico apontava a lacuna |
| `test:api` | Fora do CI (exigia dev server manual) | Dentro do CI, contra `next build && next start` | Esclarecimento Q2; de quebra o contrato roda com a CSP ativa (só existe em produção) |
| Local dos testes de API | `tests/integration/api/**` | `tests/contract/**` | Doutrina da pirâmide (`tdd.md`, Princípio VII) nomeia o nível contract |
| CSP e cabeçalhos | Em `next.config.ts` | Reconstituídos com adaptação mínima ao config atual (que hoje só fixa `turbopack.root`) | Esclarecimento Q3 |
| CI | lint+typecheck+testes + e2e | lint+typecheck+testes + contrato + **deploy gateado**; e2e fica fora (sem config Playwright no repo) | Esclarecimento Q2; escopo do requirements |
| Deploy | Auto-deploy do provedor por push | Deploy pelo CI, auto-deploy desligado | RF-06 exige que mudança vermelha não chegue à produção |

## 3. Alternativas avaliadas para o gate de deploy

1. **Auto-deploy do provedor por push (histórico).** Simples, zero config, mas publica antes de o CI opinar — viola RF-06 (Must). Descartada.
2. **"Ignored build step" do provedor.** Roda um script no provedor para decidir se builda, mas o script não tem acesso confiável ao resultado do CI do GitHub — o gate ficaria heurístico. Descartada.
3. **Deploy executado pelo CI via CLI do provedor, com auto-deploy desligado (`vercel.json`, `git.deploymentEnabled: false`).** O deploy vira um job com `needs:` nos jobs de verificação e contrato; só `main` verde publica. Exige um token como secret do repositório. **Escolhida** (D-07/D-08).

## 4. Padrões aplicáveis

- **Health endpoint sem estado**: como não há banco nem serviço externo (`architecture.md#3`), o status é prova de vida do runtime, não agregador de dependências; responder 200 é condição suficiente. Campos de build (`versao`, `commit`) dão ao mantenedor a confirmação de *qual* estado está no ar — exatamente a demanda da feature 002 histórica (MD-0011).
- **Contract testing no alvo real**: rodar a suíte de contrato contra o build de produção local (mesmo artefato que o provedor serve) reduz a distância entre o que o CI aprova e o que vai ao ar.
- **Cabeçalhos de saúde não-cacheáveis**: prática padrão para endpoints de monitoramento; um 200 servido de cache após queda do site é o pior falso-negativo possível.

## 5. Fontes externas

- Documentação do provedor sobre variáveis de sistema expostas ao runtime (SHA do commit do deploy) e sobre `git.deploymentEnabled` no `vercel.json` — a confirmar na execução com a CLI instalada (`vercel --version` local: 56.x).
- Nenhuma dependência nova de runtime ou desenvolvimento é necessária: tudo se faz com o que `dependencies.md` já lista (Next, Vitest) e com GitHub Actions.
