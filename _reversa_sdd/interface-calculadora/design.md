# interface-calculadora — Design Técnico

> Gerado pelo Reversa Writer em 2026-07-19.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA. Fluxogramas em `../flowcharts/interface-calculadora.md`; máquina de estados em `../state-machines.md`.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `TelaCalculadora` | componente sem props | JSX | Ponto de montagem usado por `pages/index.tsx` 🟢 |
| `CalculadoraApp` | `{ relator?: RelatorDeErros; motor?: {calcular} }` | JSX | Dono do `EstadoResultado` (+ estados `desatualizado`, `revisaoConfirmada`, `geracaoFormulario`); **props são injeção para teste** — em produção, `relatorNulo` e `new CalculadoraInsulinaDM2()` 🟢 |
| `FormularioCalculadora` | `{ onCalcular: (EntradaCalculo) => void; onAlteracao?: () => void }` | JSX | Controlado; `onAlteracao` notifica qualquer edição (EC-03) 🟢 |
| `PainelResultado` | `{ estado; desatualizado; revisaoConfirmada; onConfirmarRevisao(boolean); onNovoCalculo() }` | JSX | Flags chegam como props separadas do `estado` (ortogonais) 🟢 |
| `usePreferenciaDeTema` | hook | `[Tema, alternar]` | `useSyncExternalStore` sobre localStorage 🟢 |
| `RelatorDeErros.reportar` | `(evento: EventoDeErro)` | `void` | Implementação nula na fase 1 (ADR 0007) 🟢 |

Assinaturas verificadas contra o código em 2026-07-19 (`calculadora-app.tsx:12`, `formulario.tsx:15`, `resultado.tsx:22`) — reclassificadas 🟡→🟢 pelo Reviewer.

## Fluxo Principal

1. `pages/index.tsx` monta `TelaCalculadora` → moldura (cabeçalho, selo de privacidade, tema) + `CalculadoraApp`. 🟢
2. `Formulario` mantém linhas dinâmicas (`LinhaGlicemia[]`, `LinhaAplicacao[]` com strings brutas) e valida no blur com `CONSTANTES`. 🟢
3. Submissão: parse (`interpretaDecimal` — vírgula/ponto), `derivaTipoEsquema` pela contagem de Regular, montagem de `EntradaCalculo`, chamada **síncrona e em try/catch** de `CalculadoraInsulinaDM2.calcular`. 🟢
4. Saída → `EstadoResultado`: `resultado` → `sucesso`; `erro-validacao`/`fora-do-escopo` → `erro`; exceção → `falha-inesperada` + `relator.reportar({nome: e.constructor.name})`. 🟢
5. `Resultado` renderiza na ordem fixa; em `sucesso`, exibe checkbox de revisão; confirmada e não desatualizada, mostra "Pronto para prescrever". 🟢
6. Qualquer `aoEditar` do formulário: seta `desatualizado`, desmarca revisão. "Novo cálculo": incrementa `geracaoFormulario` (remonta via `key`) e zera o estado. 🟢

## Fluxos Alternativos

- **localStorage bloqueado:** tema funciona em memória, sem persistir (try/catch no store). 🟢
- **Modo início:** bloco de esquema oculto; glicemias opcionais. 🟢
- **Condutas alternativas presentes:** painel exibe as opções rotuladas lado a lado, sem pré-seleção. 🟢

## Dependências

- `models/insulina` — fachada `CalculadoraInsulinaDM2`, `CONSTANTES` (validação espelhada), tipos de saída. Direção única: `interface → models` (ADR 0003). 🟢
- React 19 (hooks, `useSyncExternalStore`); nenhuma biblioteca de formulário ou estado externa. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Estado bruto como string até o parse na submissão (tolerância de digitação) | `formulario.tsx` (`valorBruto`, `doseBruta`) | 🟢 |
| Reset por remontagem (`key={geracaoFormulario}`) em vez de limpeza campo a campo | `calculadora-app.tsx` — RF-10 legado | 🟢 |
| Porta `RelatorDeErros` com implementação nula | `relator-de-erros.ts` — ADR 0007 | 🟢 |
| Validação espelhada por import de `CONSTANTES`, nunca números duplicados | `formulario.tsx` | 🟢 |
| Motor injetável por prop para teste (produção sempre usa o real via `useMemo`) | `calculadora-app.tsx:12-24` | 🟢 |
| Ids de linha por contador módulo-global (`let proximoId`) | `formulario.tsx:114` | 🟢 (dívida: frágil sob HMR/StrictMode) |

## Estado Interno

| Estado | Dono | Evolução |
|---|---|---|
| `EstadoResultado` + flags `desatualizado`/`revisaoConfirmada` | `CalculadoraApp` | máquina de `../state-machines.md` §1 |
| `LinhaGlicemia[]` / `LinhaAplicacao[]` | `Formulario` | adicionar/remover/editar linhas |
| `geracaoFormulario` | `CalculadoraApp` | incrementa a cada "Novo cálculo" |
| `Tema` | store módulo + localStorage | alternância manual |

## Observabilidade

🟢 Somente o contrato `RelatorDeErros` (nulo). Sem logs, analytics ou métricas — por design (ADR 0002/0007).

## Riscos e Lacunas

- 🔴 Sem testes e2e/acessibilidade na estrutura atual (existiam no repo antigo com axe/Playwright); regressão de WCAG AA invisível até reconstituir.
- 🟡 `formulario.tsx` com 532 LOC concentra três responsabilidades (linhas, validação, montagem) — extração de subcomponentes recomendada sem mudança de contrato.
- 🔴 Divergência 4 aprovada no design (entrada de glicemias por momento, 4 campos) reestrutura este formulário e quebra `tests/integration/interface/formulario.test.tsx` — exige spec antes (Princípio I).
