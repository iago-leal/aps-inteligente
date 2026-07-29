# `pages/` — Shell Next.js (Pages Router)

> `requirements.md` · **Re-extração 4 (2026-07-28)**, regenerado. Absorve as features 017
> (duas rotas de puericultura), 018 (metadados revistos), 021 (folhas de estilo) e 022 (a rota
> de API com I/O).
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão Geral

Casca do Pages Router: documento HTML base com idioma e identidade instalável, provedor de
tema e estilos globais, e as rotas que montam cada tela. Ponto de costura entre o framework e a
`interface/`, sem lógica de negócio nem de apresentação. 🟢

São **sete rotas de página** e **uma de API**. A contagem cresceu com as duas rotas de
puericultura da feature 017 e da 020. 🟢

## Responsabilidades

- Prover o documento base com `lang="pt-BR"` e a identidade instalável. 🟢
- Importar os primitivos do Primer e as **nove** folhas de estilo, na ordem correta, e envolver
  a aplicação no provedor de tema. 🟢
- Servir a home na raiz, sem redirecionamento. 🟢
- Montar as **seis** calculadoras nas suas rotas. 🟢
- Declarar os metadados de cada página, sob a norma de redação. 🟢
- Expor a API de status, hoje com I/O real (unit própria). 🟢

## Rotas

| Rota | Tela | Feature |
|------|------|---------|
| `/` | `TelaInicio` | 007 |
| `/dm2/insulina` | `TelaCalculadora` | 007 |
| `/pre-natal/idade-gestacional` | `TelaIdadeGestacional` | 007 |
| `/cardiologia/dor-toracica` | `TelaCardiologia` | 010 |
| `/cardiologia/risco-cardiovascular` | `TelaRiscoCardiovascular` | 014 |
| `/puericultura/crescimento` | `TelaCrescimento` | 017 |
| `/puericultura/consulta` | `TelaConsulta` | 020 |
| `/api/v1/status` | handler `async` | 002, 022 |

## Regras de Negócio

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | O shell não acessa `models/` diretamente — só `interface/` (ADR 0003). A única exceção é a rota de API, que fala com `infra/`. | 🟢 |
| RN-02 | Nenhum script ou fonte de terceiro em runtime: a tipografia é a pilha do sistema do Primer. | 🟢 |
| RN-03 | A API não trafega dado clínico; é pública e sem estado próprio. | 🟢 |
| RN-04 | Os ativos de ícone e manifesto vivem em `public/`, same-origin, sob a CSP. | 🟢 |
| RN-05 | **(018)** Os doze metadados das rotas foram revistos sob a norma de redação, com correção de **exatidão** na descrição da raiz: o que se afirma sobre a plataforma se afere contra o catálogo. | 🟢 |
| RN-06 | **(021)** A ordem de importação das folhas é significativa: primitivos, `globais.css`, `moldura.css`, depois as folhas de tela. | 🟢 |
| RN-07 | As rotas de tela não têm busca de dados em servidor; são estáticas. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Documento base com idioma e identidade instalável. | Must | Favicon, apple-touch, manifesto e cor de tema presentes. |
| RF-02 | Aplicação com primitivos, as nove folhas e o provedor de tema. | Must | Ordem de importação respeitada. |
| RF-03 | Raiz servindo a home com metadados exatos. | Must | A descrição corresponde ao catálogo. |
| RF-04 | As seis rotas de calculadora montando as suas telas. | Must | Toda rota do catálogo responde. |
| RF-05 | API de status realizada. | Must | Ver `pages-api-v1-status`. |
| RF-06 | Metadados por página sob a norma de redação. | Must | O inventário textual cobre `<title>` e `<meta>`. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Sem fonte ou script externo em runtime. | `pages/_app.tsx` | 🟢 |
| Build | Páginas estáticas; nenhuma busca de dados em servidor nas telas. | ausência de `getServerSideProps` nas rotas de tela | 🟢 |
| Segurança | CSP sem terceiros; ativos same-origin. | `pages/_document.tsx` | 🟢 |
| Instalabilidade | Manifesto com ícones. | `pages/_document.tsx` | 🟢 |
| Exatidão editorial | A descrição da plataforma se afere contra o catálogo. | feature 018 | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: raiz com privacidade declarada
  Dado o site publicado
  Quando o prescritor acessa /
  Então a home por seções é exibida
  E os metadados declaram que nada é salvo nem enviado

Cenário: sete rotas de página
  Quando cada rota do catálogo é acessada
  Então a tela correspondente é montada

Cenário: identidade instalável
  Quando o documento é inspecionado
  Então há favicon, apple-touch-icon, manifesto e cor de tema, todos same-origin

Cenário: exatidão da descrição
  Quando a descrição da raiz é comparada ao catálogo
  Então ela não afirma calculadora que o catálogo não lista
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Shell, estilos e rotas | Must | Sem eles não há produto servível. |
| API de status | Must | Observabilidade do deploy. |
| Metadados exatos | Must | O que se afirma do produto precisa ser verdade. |
| Identidade instalável | Should | Conveniência de uso em celular. |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `pages/_app.tsx` | Provedor de tema e as nove folhas | 🟢 |
| `pages/_document.tsx` | Documento, idioma, identidade instalável | 🟢 |
| `pages/index.tsx` | Home | 🟢 |
| `pages/dm2/insulina.tsx` | `TelaCalculadora` | 🟢 |
| `pages/pre-natal/idade-gestacional.tsx` | `TelaIdadeGestacional` | 🟢 |
| `pages/cardiologia/dor-toracica.tsx` | `TelaCardiologia` | 🟢 |
| `pages/cardiologia/risco-cardiovascular.tsx` | `TelaRiscoCardiovascular` | 🟢 |
| `pages/puericultura/crescimento.tsx` | `TelaCrescimento` | 🟢 |
| `pages/puericultura/consulta.tsx` | `TelaConsulta` | 🟢 |
| `pages/api/v1/status.ts` | `status` | 🟢 |
