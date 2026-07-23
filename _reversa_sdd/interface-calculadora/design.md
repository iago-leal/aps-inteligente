# interface/calculadora — Design Técnico

> `design.md` · Re-extração 2 (2026-07-23), regenerado. A Moldura foi extraída para `interface/comum` (feature 007); o ritual ganhou "Copiar plano" (feature 006); a redução por TFG virou subitem da manutenção (feature 005). Fluxogramas em `../flowcharts/interface-calculadora.md`; máquina de estados em `../state-machines.md`.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `TelaCalculadora` | `()` | JSX | Compõe `Moldura` (comum) + `CalculadoraApp` — não reimplementa a casca |
| `CalculadoraApp` | `{ relator?; motor? }` | JSX | Dono de `EstadoResultado` + `desatualizado`, `revisaoConfirmada`, `geracaoFormulario`; props são injeção para teste |
| `FormularioCalculadora` | `{ onCalcular; onAlteracao? }` | JSX | Controlado; `onAlteracao` notifica qualquer edição (EC-03) |
| `PainelResultado` | `{ estado; desatualizado; revisaoConfirmada; onConfirmarRevisao; onNovoCalculo }` | JSX | Flags ortogonais ao `estado`; expõe "Copiar plano" com revisão válida |
| `formatarPlano` | `(resultado: ResultadoCalculo)` | `string` | Texto do plano em quatro partes (006) |
| `copiarParaAreaDeTransferencia` | `(texto)` | `Promise<ResultadoCopia>` | Erro como valor (`{ok:false}`), sem exceção (006) |
| `agruparRecomendacoes` | `(itens)` | `GrupoDeRecomendacoes[]` | Subordinação de apresentação (005) |
| `RelatorDeErros.reportar` | `(evento: EventoDeErro)` | `void` | Implementação nula na fase 1 (ADR 0007) |

## Fluxo Principal

1. `TelaCalculadora` compõe a `Moldura` (título/subtítulo da insulina) + `CalculadoraApp`. `tela.tsx:8-16` 🟢
2. `Formulario` mantém linhas dinâmicas (strings brutas) e valida no blur com `CONSTANTES` (espelhamento). 🟢
3. Submissão: parse (`interpretaDecimal`), `derivaTipoEsquema` pela contagem de Regular, montagem de `EntradaCalculo`, chamada síncrona em try/catch de `CalculadoraInsulinaDM2.calcular`. 🟢
4. Saída → `EstadoResultado`: `resultado`→`sucesso`; `erro-validacao`/`fora-do-escopo`→`erro`; exceção→`falha-inesperada` + `relator.reportar({nome})`. `calculadora-app.tsx:31-48` 🟢
5. `Resultado` renderiza na ordem fixa (alertas→dose→fonte→revisão→disclaimer); em `sucesso` com revisão confirmada e não desatualizado, exibe "Pronto para prescrever" e "Copiar plano". 🟢
6. Qualquer `aoAlterar`: seta `desatualizado`, desmarca revisão. "Novo cálculo": incrementa `geracaoFormulario` (remonta via `key`) e zera. `calculadora-app.tsx:50-62` 🟢

## Fluxos Alternativos

- **Recomendação subordinada (005):** `agruparRecomendacoes` põe `REDUZIR_METFORMINA_TFG` como subitem de `MANTER_METFORMINA`; subitem sem pai presente vira item de topo. `agrupar-recomendacoes.ts:16-37` 🟢
- **Copiar plano (006):** `formatarPlano` monta esquema/dose → recomendações → fonte → contexto; `copiarParaAreaDeTransferencia` devolve `{ok:false}` na indisponibilidade, para falha honesta. 🟢
- **Tema via Moldura:** localStorage bloqueado → tema em memória (try/catch no store). 🟢
- **Modo início:** bloco de esquema oculto; glicemias opcionais. 🟢

## Dependências

- `models/insulina` — `CalculadoraInsulinaDM2`, `CONSTANTES` (validação espelhada), tipos. Direção única `interface → models` (ADR 0003); motor byte a byte intocado. 🟢
- `interface/comum/moldura` — casca comum (extraída na 007). 🟢
- React 19 (hooks); `@primer/react`; nenhuma lib de formulário/estado externa. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Moldura extraída; `tela.tsx` vira composição fina (D-09) | `tela.tsx:1-7` | 🟢 |
| Ritual funcionalizado: "Copiar plano" gated pela revisão (006) | `formatar-plano.ts:1-5` | 🟢 |
| Alertas e alternativas fora do texto copiado (D-04; ADR 0005) | `formatar-plano.ts:3-5` | 🟢 |
| Subordinação da redução por TFG é só apresentação (005, RF-03) | `agrupar-recomendacoes.ts:1-4` | 🟢 |
| Rótulos como fonte única anti-drift (tela ↔ plano) | `rotulos.ts:1-3` | 🟢 |
| Estado bruto como string até o parse (tolerância de digitação) | `formulario.tsx` | 🟢 |
| Motor injetável por prop; produção usa o real via `useMemo` | `calculadora-app.tsx:22-25` | 🟢 |
| Ids de linha por contador módulo-global | `formulario.tsx` | 🟢 (dívida: frágil sob HMR/StrictMode) |

## Estado Interno

| Estado | Dono | Evolução |
|---|---|---|
| `EstadoResultado` + `desatualizado`/`revisaoConfirmada` | `CalculadoraApp` | máquina de `../state-machines.md` §1; revisão desfeita a cada edição |
| `LinhaGlicemia[]` / `LinhaAplicacao[]` | `Formulario` | adicionar/remover/editar linhas |
| `geracaoFormulario` | `CalculadoraApp` | incrementa a cada "Novo cálculo" |
| `Tema` | store módulo + localStorage (lido pela Moldura) | alternância manual |

## Observabilidade

🟢 Somente o contrato `RelatorDeErros` (nulo). A cópia não emite telemetria. Sem logs/analytics — por design (ADR 0002/0007).

## Riscos e Lacunas

- 🟡 Watch D-04 (feature 006): alertas e condutas alternativas fora do texto copiado — validar em uso real.
- 🟡 `formulario.tsx` (313 LOC) concentra linhas, validação e montagem — extração de subcomponentes recomendável sem mudar contrato.
- 🟢 e2e/acessibilidade **reconstituídos** (features 004+): `e2e/calculadora.spec.ts` aponta para `/dm2/insulina`, axe-baseline em zero. A lacuna 🔴 da extração 1 (sem e2e) está resolvida.
