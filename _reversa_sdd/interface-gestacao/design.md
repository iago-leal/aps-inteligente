# interface/gestacao — Design Técnico

> `design.md` · Re-extração 2. Molde do `calculadora-app.tsx` da insulina, sem ritual de revisão.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `TelaIdadeGestacional` | `()` | `JSX` | `Moldura` + `AppIdadeGestacional` |
| `AppIdadeGestacional` | `(props: PropsAppIdadeGestacional)` | `JSX` | Estado + formulário + painel |
| `FormularioIdadeGestacional` | `({ dataDeHoje, onCalcular, onAlteracao })` | `JSX` | Coleta `EntradaDatacao` |
| `PainelIdadeGestacional` | `({ estado, desatualizado, onNovoCalculo })` | `JSX` | Renderiza `EstadoIg` |

`PropsAppIdadeGestacional`: `relator?` (default `relatorNulo`), `motor?` (injeção), `dataDeHoje?` (injeção da data de referência para teste). `app.tsx:24-30` 🟢

`EstadoIg`: `{ "vazio" }`, `{ "sucesso", saida }`, `{ "erro", saida }`, `{ "falha-inesperada" }`. 🟢

## Fluxo Principal

1. Instancia o motor via `useMemo`; deriva `dataReferencia` de `dataDeHoje ?? dataLocalDoDispositivo()`. `app.tsx:37-44` 🟢
2. Mantém `estado`, `desatualizado`, `geracaoFormulario`. `app.tsx:45-47` 🟢
3. `aoCalcular` chama `motor.calcular`, mapeia resultado×erro; exceção → painel honesto + relator. `app.tsx:49-65` 🟢
4. `aoAlterar` marca desatualizado; `aoNovoCalculo` zera e remonta por `key`. `app.tsx:67-77` 🟢
5. Renderiza formulário (com `dataDeHoje` e `key`) e painel. `app.tsx:79-92` 🟢

## Fluxos Alternativos

- **Data local do dispositivo:** `dataLocalDoDispositivo` formata `AAAA-MM-DD` a partir de `new Date()` — o único ponto que lê o relógio, na UI, não no motor. `app.tsx:17-22` 🟢
- **Erro de validação:** ofensores exibidos no painel. 🟢
- **Falha inesperada:** painel honesto; relator só nome de erro. 🟢

## Dependências

- `models/gestacao/{calculadora,tipos}` — motor de domínio. 🟢
- `interface/comum/moldura` — casca comum. 🟢
- `interface/calculadora/relator-de-erros` — reúso do legado. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Data de referência da UI, motor não lê relógio (RN-07) | `app.tsx:17-22,41-44` | 🟢 |
| Sem ritual de revisão (D-08): datar ≠ prescrever | `app.tsx:1-6` | 🟢 |
| Molde do app da insulina (invalidação, painel honesto) | `app.tsx:2-6` | 🟢 |

## Estado Interno

`estado: EstadoIg`, `desatualizado`, `geracaoFormulario`. Efêmero. 🟢

## Observabilidade

Só o `relator` (nome da classe de erro). 🟢

## Riscos e Lacunas

- 🟢 Estados e privacidade verificados por integração (+17 testes) na feature 007.
- 🟡 Ergonomia do formulário de entrada dupla (DUM + USG) — validar em uso; sem risco de regressão.
