# pages-next — Shell Next.js

> Gerado pelo Reversa Writer em 2026-07-19. Foca no QUE a unit faz.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão Geral

🟢 Casca mínima do Pages Router: carrega fontes e estilos globais, define idioma e metadados, e monta a calculadora. Não contém lógica de negócio nem de apresentação — é o ponto de costura entre o framework e a `interface/`.

## Responsabilidades

- Prover o documento HTML base com `lang="pt-BR"`.
- Carregar IBM Plex Sans (texto) e IBM Plex Mono (números clínicos, var `--fonte-dados`) via `next/font`, sem requisição externa em runtime.
- Importar o CSS global e envolver a aplicação em `.app-raiz`.
- Definir metadados da página inicial enfatizando a privacidade ("nada é salvo nem enviado").
- Montar `TelaCalculadora` na rota `/`.

## Regras de Negócio

- **RN-01:** o shell não acessa `models/` diretamente — só `interface/` (dependência unidirecional, ADR 0003). 🟢
- **RN-02:** nenhum script ou fonte de terceiro em runtime (fontes embutidas no build; privacidade por arquitetura, ADR 0002). 🟢
- **RN-03:** rotas de API, quando existirem, não trafegam dado clínico (ADR 0008). 🔴 hoje a rota `/api/v1` é um arquivo vazio que **falha** se requisitada.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | `_document.tsx` com `<Html lang="pt-BR">` | Must | Atributo presente no HTML servido |
| RF-02 | `_app.tsx` com fontes IBM Plex via `next/font` e CSS global | Must | Fontes servidas do próprio domínio; var `--fonte-dados` disponível |
| RF-03 | `index.tsx` com title/description de privacidade e montagem de `TelaCalculadora` | Must | Página inicial renderiza a calculadora |
| RF-04 | Manter o placeholder `/api/v1` **deliberadamente** como lembrete da API futura (decisão do usuário, 2026-07-19); implementação segue o padrão ADR 0008 quando a etapa do banco chegar | Won't (nesta fase) | Placeholder e script `test:api` permanecem como estão, documentados como lembrete 🟢 |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem fonte/script externo em runtime | `pages/_app.tsx` (next/font) | 🟢 |
| Build | Páginas estáticas (SSG implícito do Pages Router sem data fetching) | ausência de `getServerSideProps` | 🟢 |
| Segurança | CSP sem terceiros existia no repo antigo | commit `ebad6a5` (bundle) | 🔴 não verificada na estrutura atual |

## Critérios de Aceitação

```gherkin
Cenário: Página inicial serve a calculadora com privacidade declarada
  Dado o site buildado
  Quando o prescritor acessa /
  Então a calculadora é exibida
  E os metadados declaram que nada é salvo nem enviado
  E nenhuma requisição sai para domínio de terceiro

Cenário: Rota de API fantasma (estado atual — a resolver)
  Dado o build atual
  Quando uma requisição chega a /api/v1
  Então a rota falha por handler ausente 🔴
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| RF-01/RF-02/RF-03 | Must | Sem shell não há produto servível |
| RF-04 | Should | Dívida declarada; falha hoje é barulhenta mas confusa |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `pages/_app.tsx` | `App` | 🟢 |
| `pages/_document.tsx` | `Document` | 🟢 |
| `pages/index.tsx` | página inicial | 🟢 |
| `pages/api/v1/index.js` | — (vazio) | 🔴 |
