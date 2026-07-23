# interface/cardiologia — Design Técnico

> `design.md` · Re-extração 2. Molde do `app.tsx` da gestação, sem ritual de revisão.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `TelaCardiologia` | `()` | `JSX` | `Moldura` + `AppCardiologia` |
| `AppCardiologia` | `(props: PropsAppCardiologia)` | `JSX` | Estado + formulário + painel + referências |
| `FormularioCardiologia` | `({ onCalcular, onAlteracao })` | `JSX` | Coleta a `EntradaAvaliacao` |
| `PainelCardiologia` | `({ estado, desatualizado, onNovaAvaliacao })` | `JSX` | Renderiza `EstadoCardiologia` |
| `ReferenciasComplementares` | `()` | `JSX` | Blocos `<details>` da fonte |

`EstadoCardiologia` é união discriminada: `{ estado: "vazio" }`, `{ "sucesso", saida }`, `{ "fora-do-escopo", saida }`, `{ "erro", saida }`, `{ "falha-inesperada" }`. `resultado.tsx` 🟢

`PropsAppCardiologia`: `relator?` (default `relatorNulo`), `motor?` (injeção para teste; produção usa `CalculadoraCardiopatiaIsquemica`). `app.tsx:26-30` 🟢

## Fluxo Principal

1. `AppCardiologia` instancia o motor real via `useMemo` (ou usa o injetado). `app.tsx:36-39` 🟢
2. Mantém `estado`, `desatualizado`, `geracaoFormulario`. `app.tsx:40-42` 🟢
3. `aoAvaliar` chama `motor.avaliar`, mapeia a saída para `EstadoCardiologia` (`estadoDaSaida`); exceção → painel honesto + `relator.reportar`. `app.tsx:44-55` 🟢
4. `aoAlterar` marca `desatualizado` se já houve resultado; `aoNovaAvaliacao` zera e incrementa `key`. `app.tsx:57-67` 🟢
5. Renderiza formulário (com `key`), painel e `ReferenciasComplementares`. `app.tsx:69-83` 🟢

## Fluxos Alternativos

- **Fora-do-escopo:** variante própria do painel, sem número estimado. 🟢
- **Erro de validação:** ofensores exibidos. 🟢
- **Falha inesperada:** painel honesto; `relator` recebe só o `name` da classe (privacidade). `app.tsx:48-53` 🟢

## Dependências

- `models/cardiopatia-isquemica/{calculadora,tipos}` — motor de domínio. 🟢
- `interface/comum/moldura` — casca comum. 🟢
- `interface/calculadora/relator-de-erros` — `relatorNulo`/`RelatorDeErros` (reúso do legado). 🟢
- `@primer/react` — componentes visuais. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Sem ritual de revisão (D-08): estratificar ≠ prescrever | `app.tsx:1-5` (comentário) e ausência de gate | 🟢 |
| Molde do app da gestação (invalidação, painel honesto) | `app.tsx:1-5` | 🟢 |
| Referências como `<details>` nativo, sem JS | `referencias.tsx:5-6,79` | 🟢 |
| Blocos de referência com dados fixos citando página | `referencias.tsx:17-66` | 🟢 |

## Estado Interno

`estado: EstadoCardiologia`, `desatualizado: boolean`, `geracaoFormulario: number` (chave de remonte). Efêmero, some ao recarregar. 🟢

## Observabilidade

Só o `relator` (nome da classe de erro), sem payload clínico. 🟢

## Riscos e Lacunas

- 🟡 Conteúdo dos blocos complementares (RF-10) fiel à fonte — conferência clínica em `models-cardiopatia-isquemica/questions.md` Q-05.
- 🟢 Estados e privacidade verificados por integração (+9 testes) e e2e (axe 0/0) na feature 010.
