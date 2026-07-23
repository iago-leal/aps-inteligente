# C4 — Nível 3: Componentes — aps-inteligente

> Regenerado pelo Reversa Architect em 2026-07-23 (re-extração nº 2).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

🟢 Dois recortes: a **aplicação web** (home → três telas → três domínios puros, sobre a `Moldura` comum) e a **fatia de observabilidade** (Function → infra → banco). As três camadas mantêm dependência unidirecional `pages → interface → models` (ADR 0003); o domínio não importa framework.

## Recorte 1 — Aplicação web (home, telas e domínios)

```mermaid
C4Component
    title Componentes — aplicação web

    Container_Boundary(pages, "pages (shell Next.js)") {
        Component(index, "index.tsx", "Next.js", "Raiz serve a home (sem redirect)")
        Component(rotas, "dm2/ · pre-natal/ · cardiologia/", "Next.js", "Uma casca <Head> por rota → tela")
    }

    Container_Boundary(comum, "interface/comum + inicio (casca)") {
        Component(moldura, "moldura.tsx", "React", "Cabeçalho, logo por tema, selo de privacidade, alternador de tema")
        Component(home, "tela.tsx (TelaInicio)", "React", "Home por seções; cartões stretched-link")
        Component(catalogo, "catalogo.ts", "TS", "Fonte única tipada das seções/rotas (anti-drift, D-07)")
    }

    Container_Boundary(telas, "interface/{calculadora,gestacao,cardiologia}") {
        Component(appIns, "calculadora-app.tsx", "React", "EstadoResultado + ritual de revisão + Copiar plano (insulina)")
        Component(appGes, "app.tsx (IG)", "React", "EstadoIg; injeta data do dispositivo; SEM ritual")
        Component(appCar, "app.tsx (Cardio)", "React", "EstadoCardiologia (+ fora-do-escopo); SEM ritual")
        Component(tema, "preferencia-de-tema.ts", "TS", "useSyncExternalStore sobre localStorage")
        Component(rel, "relator-de-erros.ts", "TS", "Contrato; implementação nula (ADR 0007)")
    }

    Container_Boundary(dom, "models/* (três domínios puros)") {
        Component(facIns, "CalculadoraInsulinaDM2", "TS puro", "valida → escopo → regras → pós-processa")
        Component(facGes, "CalculadoraIdadeGestacional", "TS puro", "IG/DPP/trimestre; comparação DUM×USG")
        Component(facCar, "CalculadoraCardiopatiaIsquemica", "TS puro", "classifica → estima → ajusta → conduz → adverte")
        Component(fontes, "fonte-clinica.ts ×3", "TS puro", "REFERENCIAS + CONSTANTES congeladas por domínio")
    }

    Rel(index, home, "monta")
    Rel(rotas, appIns, "monta")
    Rel(rotas, appGes, "monta")
    Rel(rotas, appCar, "monta")
    Rel(home, moldura, "compõe (destaque, logoComoTitulo)")
    Rel(home, catalogo, "lê seções/rotas")
    Rel(appIns, moldura, "compõe")
    Rel(appGes, moldura, "compõe")
    Rel(appCar, moldura, "compõe")
    Rel(appIns, facIns, "calcular(entrada)")
    Rel(appGes, facGes, "calcular(entrada, dataDeHoje)")
    Rel(appCar, facCar, "avaliar(entrada)")
    Rel(appIns, rel, "reporta falha inesperada (só nome da classe)")
    Rel(moldura, tema, "alterna tema")
    Rel(facIns, fontes, "referências/constantes")
    Rel(facGes, fontes, "referências/constantes")
    Rel(facCar, fontes, "referências/constantes")
```

## Recorte 2 — Observabilidade (Function → infra → banco)

```mermaid
C4Component
    title Componentes — healthcheck

    Container_Boundary(api, "pages/api/v1") {
        Component(status, "status.ts", "Vercel Function", "Discrimina método; no-store; monta {atualizado_em, versao, commit}")
    }
    Container_Boundary(infra, "infra") {
        Component(db, "database.ts", "TS + pg", "obterPool (lazy singleton); saude()=SELECT 1; ErroDeBanco; log sem credencial")
    }
    ContainerDb_Ext(pg, "PostgreSQL", "Neon / local", "SELECT 1")

    Rel(status, db, "saude()")
    Rel(db, pg, "SELECT 1 (parametrizado)", "TLS")
```

## Responsabilidades e padrões

| Componente | Padrão | Nota |
|---|---|---|
| `CalculadoraInsulinaDM2` | Facade + Strategy informal | Pipeline validação → escopo → `Peso` → despacho por modo → pós (alertas ordenados, dedupe) |
| `CalculadoraIdadeGestacional` | Facade | Datas em dias epoch UTC (ADR 0013); veredito de comparação, não escolha |
| `CalculadoraCardiopatiaIsquemica` | Facade | Cascata classificar→estimar→ajustar→conduzir; matriz congelada de 24 células |
| `Moldura` | Composite / casca comum | Props opcionais acumuladas por feature (`apresentacao`, `logoComoTitulo`) |
| `catalogo.ts` | Registro tipado | Toda calculadora nova entra aqui primeiro (anti-drift) |
| `preferencia-de-tema.ts` | External store | Único efeito colateral persistente da aplicação |
| `relator-de-erros.ts` | Porta e adaptador | Implementação nula; troca futura sem tocar UI/motor |
| `database.ts` | Adaptador de infraestrutura | Único ponto de acesso ao banco; erro como valor (`ErroDeBanco`) |

## Pontos de atenção estruturais

- 🟡 `interface/comum` importa `preferencia-de-tema.ts` de `interface/calculadora` — acoplamento residual declarado no código, realocação adiada.
- 🟡 `let proximoId` módulo-global em `formulario.tsx` da insulina — frágil sob HMR/StrictMode, funcional.
- 🟡 A fronteira `interface → models` (unidirecional) não tem verificação automática de lint (D-01); hoje respeitada por disciplina e revisão.
