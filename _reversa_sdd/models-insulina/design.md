# models-insulina — Design Técnico

> Gerado pelo Reversa Writer em 2026-07-19. Foca no COMO, com base no código legado.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA. Fluxogramas detalhados em `../flowcharts/models-insulina.md`.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CalculadoraInsulinaDM2.calcular` | `(entrada: EntradaCalculo)` | `SaidaCalculo` | Única porta de entrada; síncrona, pura, determinística |
| `validarEntrada` | `(entrada: EntradaCalculo)` | `Ofensor[]` | Coleta todos; vazio = válida |
| `motivoForaDoEscopo` | `(entrada: EntradaCalculo)` | `string \| null` | Hoje: insulina fora de NPH/Regular |
| `RegraInicio.calcular` | `(entrada, peso: Peso)` | `ResultadoInicio` | Sem estado compartilhado |
| `RegraTitulacaoBasal.aplicar` | `(entrada, peso, ajuste: AjusteEmCurso)` | `void` (muta `ajuste`) | 1.º estágio da titulação |
| `RegraTitulacaoBasal.fracionarSeIndicado` | `(peso, ajuste)` | `void` | 2.º estágio |
| `RegraIntensificacao.aplicar` | `(entrada, ajuste)` | `void` | 3.º estágio |
| `new Peso(kg)` / `new Glicemia(mgDl)` / `new DoseUi(ui)` | construtores | value object congelado | Violação → `ErroDeInvariante` |
| `referencia(localizacao)` | `(string)` | `ReferenciaClinica` | Fábrica com fonte/edição fixas |

Contratos de dados completos: `../data-dictionary.md` e `../erd-complete.md`.

## Fluxo Principal (fachada, `calculadora.ts:52`)

1. `validarEntrada` — houver ofensor → retorna `{tipo: "erro-validacao", ofensores}` e para. 🟢
2. `motivoForaDoEscopo` — motivo não nulo → retorna `fora-do-escopo` com orientação + referência. 🟢
3. `new Peso(entrada.pesoKg)` — invariante de plausibilidade (defesa redundante à validação). 🟢
4. Despacho: `modo === "inicio"` → `RegraInicio.calcular` e segue ao passo 6; `modo === "titulacao"` → passo 5. 🟢
5. Pipeline de titulação sobre um `AjusteEmCurso` inicializado com cópia do esquema atual: `aplicar` (jejum → NPH noturna) → `fracionarSeIndicado` → `RegraIntensificacao.aplicar`. **A ordem importa**: a intensificação lê `houveAjuste` e o esquema já fracionado. 🟢
6. Pós-processamento (`calculadora.ts:90+`): alerta `DOSE_ACIMA_FAIXA_PLENA` se total > 1,0 UI/kg/dia; `REAVALIAR_EM_3_DIAS` se `houveAjuste`; invariante `DoseUi` por aplicação do esquema final; sort de alertas por `SEVERIDADE`; dedupe de recomendações (`tipo`) e referências (`localizacao`). 🟢

## Fluxos Alternativos

- **Esquema sem NPH na titulação:** jejum não titula nada; pipeline segue para intensificação. 🟢
- **HbA1c ausente fora do EC-10:** intensificação retorna silenciosamente se não estiver já intensificado com pré-prandiais (validação garante EC-10 antes). 🟢
- **Braço AJ com NPH no café:** condutas equivalentes anexadas a `condutasAlternativas`; `esquemaSugerido` não muda por esse braço. 🟢
- **Clamp 1–60:** `contemDoseLimitada` limita e registra `TETO_POR_APLICACAO`. 🟢
- **Exceção inesperada:** propaga ao chamador (UI trata como falha honesta, EC-07). 🟢

## Dependências

Nenhuma. 🟢 TypeScript puro, só imports relativos internos (`tipos`, `fonte-clinica`). Restrição de design a preservar (ADR 0003).

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Facade única + Strategy informal com estado de trabalho mutável (`AjusteEmCurso`) | `calculadora.ts`, `regra-*.ts` | 🟢 |
| Result type (union discriminada) em vez de exceções para erros esperados | `tipos.ts` (`SaidaCalculo`) — ADR 0004 | 🟢 |
| Value objects congelados com invariante no construtor | `tipos.ts` (`Peso`, `Glicemia`, `DoseUi`) | 🟢 |
| Catálogo único de constantes/referências congelado, comentado com R-xx/AMB-xx | `fonte-clinica.ts` — ADR 0001 | 🟢 |
| Severidade de alertas como ordem fixa hardcoded | `calculadora.ts:27-33` (`SEVERIDADE`) | 🟢 |
| Arredondamentos deliberados: `ceil` no ½ principal, `round` no ⅔ alternativo e nas faixas por peso | `regra-titulacao-basal.ts`, `regra-inicio.ts` | 🟢 |

## Estado Interno

🟢 Nenhum estado entre chamadas (motor stateless). Durante um cálculo, o `AjusteEmCurso` (aplicações, alertas, recomendações, referências, condutas alternativas, `houveAjuste`, `naMeta`) é o acumulador compartilhado pelos três estágios — mutável por design, descartado ao fim.

## Observabilidade

🟢 Nenhuma por design: sem logs, métricas ou traces (privacidade por arquitetura, ADR 0002/0007). O canal de erro é o retorno tipado; bug interno lança `ErroDeInvariante`.

## Riscos e Lacunas

- 🔴 Verificação página a página das constantes contra o PDF do guia depende de o usuário fornecê-lo (fora do repo, ADR 0001).
- 🔴 Quatro divergências clínicas aprovadas no design ainda não especificadas (ver `questions.md` e `../traceability/spec-impact-matrix.md` §4).
- 🟡 A mutabilidade do `AjusteEmCurso` acopla os três estágios à ordem do pipeline; reordenar sem reler as premissas (`houveAjuste`, esquema já fracionado) altera conduta clínica.
