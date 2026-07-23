# pages/ — Shell Next.js (Pages Router)

> `requirements.md` · Re-extração 2 (2026-07-23), regenerado. Superadas as premissas da extração 1 (IBM Plex, raiz montando a calculadora, `/api/v1` vazia): agora a raiz é a home, a tipografia é a pilha do sistema do Primer (feature 004), e `/api/v1/status` está realizada (feature 002, unit própria).
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão Geral

Casca do Pages Router: documento HTML base com idioma e identidade PWA, provedor de tema e estilos globais, e as rotas que montam cada tela. Ponto de costura entre o framework e a `interface/`, sem lógica de negócio nem de apresentação. 🟢

## Responsabilidades

- Prover o documento base com `lang="pt-BR"` e a identidade instalável (favicon, apple-touch, manifest, theme-color). 🟢
- Importar os primitivos do Primer e as folhas de estilo globais, e envolver a aplicação no `ProvedorTemaPrimer` (`.app-raiz`). 🟢
- Servir a home na raiz (`/`), sem redirecionamento. 🟢
- Montar as três calculadoras em suas rotas: `/dm2/insulina`, `/pre-natal/idade-gestacional`, `/cardiologia/dor-toracica`. 🟢
- Declarar metadados de privacidade por página. 🟢
- Expor a API de status em `/api/v1/status` (ver unit `pages-api-v1-status`). 🟢

## Regras de Negócio

- **RN-01** O shell não acessa `models/` diretamente — só `interface/` (dependência unidirecional, ADR 0003). 🟢
- **RN-02** Nenhum script ou fonte de terceiro em runtime: a tipografia é a pilha do sistema do Primer, nenhum arquivo de fonte baixado (feature 004, D-04; ADR 0002). 🟢
- **RN-03** A API não trafega dado clínico (ADR 0008); `/api/v1/status` é público e sem estado. 🟢
- **PWA** Ativos de ícone/manifesto vivem em `public/` (same-origin, sob a CSP `img-src 'self' data:`; `manifest-src` recai em `default-src 'self'`). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | `_document.tsx` com `lang="pt-BR"` e identidade PWA | Must | favicon, apple-touch, manifest e theme-color presentes |
| RF-02 | `_app.tsx` com primitivos Primer, estilos e provedor de tema | Must | Estilos na ordem correta; `.app-raiz` envolve o app |
| RF-03 | Raiz serve a home (`TelaInicio`) com metadados de privacidade | Must | `/` renderiza a home; description declara "nada é salvo nem enviado" |
| RF-04 | Rotas das três calculadoras | Must | `/dm2/insulina`, `/pre-natal/idade-gestacional`, `/cardiologia/dor-toracica` montam suas telas |
| RF-05 | API de status realizada | Must | `/api/v1/status` responde (ver `pages-api-v1-status`) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem fonte/script externo em runtime | `pages/_app.tsx:1-27` | 🟢 |
| Build | Páginas estáticas (sem data fetching nas rotas de tela) | ausência de `getServerSideProps` | 🟢 |
| Segurança | CSP sem terceiros; ativos same-origin | `_document.tsx:4-14` | 🟢 |
| Instalabilidade | Manifesto PWA com ícones 192/512 | `_document.tsx:11-13` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: Raiz serve a home com privacidade declarada
  Dado o site buildado
  Quando o prescritor acessa /
  Então a home por seções é exibida
  E os metadados declaram que nada é salvo nem enviado

Cenário: Rotas das calculadoras
  Dado o site buildado
  Quando o prescritor acessa /dm2/insulina, /pre-natal/idade-gestacional ou /cardiologia/dor-toracica
  Então a tela correspondente é montada

Cenário: Identidade instalável
  Dado o documento servido
  Quando inspecionado
  Então há favicon, apple-touch-icon, manifest e theme-color same-origin
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| RF-01/RF-02/RF-03/RF-04 | Must | Sem shell e rotas não há produto servível |
| RF-05 | Must | Observabilidade de deploy (feature 002) |
| PWA | Should | Identidade instalável (feature 009) |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `pages/_app.tsx` | `App` (`ProvedorTemaPrimer`, estilos) | 🟢 |
| `pages/_document.tsx` | `Document` (lang, PWA) | 🟢 |
| `pages/index.tsx` | home (`TelaInicio`) | 🟢 |
| `pages/dm2/insulina.tsx` | `TelaCalculadora` | 🟢 |
| `pages/pre-natal/idade-gestacional.tsx` | `TelaIdadeGestacional` | 🟢 |
| `pages/cardiologia/dor-toracica.tsx` | `TelaCardiologia` | 🟢 |
| `pages/api/v1/status.ts` | `status` (ver unit própria) | 🟢 |
