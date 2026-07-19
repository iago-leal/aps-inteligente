# C4 — Nível 3: Componentes — aps-inteligente

> Gerado pelo Reversa Architect em 2026-07-19.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

🟢 Detalhamento do único container real (aplicação web), nas três camadas com dependência unidirecional (ADR 0003): `pages → interface → models`. O domínio não importa nada de framework.

```mermaid
C4Component
    title Componentes — aplicação web

    Container_Boundary(pages, "pages (shell Next.js)") {
        Component(app, "_app.tsx", "Next.js", "Fontes IBM Plex, CSS global, moldura .app-raiz")
        Component(index, "index.tsx", "Next.js", "Metadados + monta TelaCalculadora")
    }

    Container_Boundary(ui, "interface/calculadora (apresentação)") {
        Component(tela, "tela.tsx", "React", "Moldura: cabeçalho, selo de privacidade, alternador de tema")
        Component(appc, "calculadora-app.tsx", "React", "Estado EstadoResultado; ciclo calcular/invalidar/limpar")
        Component(form, "formulario.tsx", "React", "Formulário controlado; validação no blur espelhando CONSTANTES")
        Component(res, "resultado.tsx", "React", "Painel: alertas → dose → fonte → revisão → disclaimer")
        Component(tema, "preferencia-de-tema.ts", "TS", "useSyncExternalStore sobre localStorage")
        Component(rel, "relator-de-erros.ts", "TS", "Contrato RelatorDeErros; implementação nula (ADR 0007)")
    }

    Container_Boundary(dom, "models/insulina (domínio puro)") {
        Component(fac, "calculadora.ts", "TS puro", "Fachada CalculadoraInsulinaDM2: valida → escopo → despacha → pós-processa")
        Component(val, "validacao.ts", "TS puro", "Coleta todos os ofensores; detecção fora-de-escopo")
        Component(ini, "regra-inicio.ts", "TS puro", "Início: faixa 10–15 UI / 0,1–0,2 UI/kg (AMB-01)")
        Component(tit, "regra-titulacao-basal.ts", "TS puro", "Titulação NPH pelo jejum; clamp 1–60; fracionamento")
        Component(inten, "regra-intensificacao.ts", "TS puro", "Gate HbA1c; braços AA/AJ/AD; titulação da Regular")
        Component(fonte, "fonte-clinica.ts", "TS puro", "REFERENCIAS (20 entradas) + CONSTANTES congeladas")
        Component(tipos, "tipos.ts", "TS puro", "Contratos readonly, unions de saída, value objects")
    }

    Rel(index, tela, "monta")
    Rel(tela, appc, "compõe")
    Rel(appc, form, "controla")
    Rel(appc, res, "exibe")
    Rel(appc, fac, "calcular(entrada)")
    Rel(appc, rel, "reporta falha inesperada")
    Rel(tela, tema, "alterna tema")
    Rel(form, fonte, "importa CONSTANTES (validação espelhada)")
    Rel(fac, val, "validarEntrada")
    Rel(fac, ini, "modo início")
    Rel(fac, tit, "modo titulação (1º)")
    Rel(fac, inten, "modo titulação (2º)")
    Rel(ini, fonte, "referências/constantes")
    Rel(tit, fonte, "referências/constantes")
    Rel(inten, fonte, "referências/constantes")
    Rel(val, tipos, "Ofensor/códigos")
```

## Responsabilidades e padrões

| Componente | Padrão | Nota |
|---|---|---|
| `calculadora.ts` | Facade | Pipeline: validação → escopo → Peso → despacho por modo → pós-processamento (alertas ordenados, dedupe) |
| `regra-*.ts` | Strategy informal | Compõem sobre o estado de trabalho `AjusteEmCurso` |
| `tipos.ts` | Value Objects + Result type | `Peso`, `Glicemia`, `DoseUi` congelados; `SaidaCalculo` como union |
| `relator-de-erros.ts` | Porta e adaptador | Única implementação nula; troca futura sem tocar UI/motor |
| `preferencia-de-tema.ts` | External store | Único efeito colateral persistente da aplicação |

## Pontos de atenção estruturais

- 🟡 `formulario.tsx` (532 LOC) concentra formulário, linhas dinâmicas e validação — candidato a extração de subcomponentes.
- 🟡 `let proximoId` módulo-global em `formulario.tsx` — frágil sob HMR/StrictMode.
- 🔴 A fronteira `interface → models` (unidirecional) não tem verificação automática: a regra de lint D-01 do repo antigo não foi reconstituída.
