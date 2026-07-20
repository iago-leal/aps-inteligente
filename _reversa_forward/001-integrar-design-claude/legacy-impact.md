# Legacy Impact: Integração do design aprovado da calculadora

> Identificador: `001-integrar-design-claude`
> Data: `2026-07-19`
> Âncora: extração de legado (`_reversa_sdd/architecture.md` + `_reversa_sdd/domain.md`)
> Gerado por `/reversa-coding` após execução completa (T001–T020; suíte 188/188 verde)

## 1. Arquivos afetados

| Arquivo afetado | Componente (`architecture.md`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `models/insulina/tipos.ts` | Contratos do domínio (epicentro da Spec Impact Matrix §3) | delta-de-dados | HIGH | Campos opcionais `doseMetforminaMgDia`/`tfg` em `EntradaCalculo`; tipos novos `METFORMINA_NAO_OTIMIZADA`, `REDUZIR_METFORMINA_TFG`, `SUSPENDER_METFORMINA_TFG`, `METFORMINA_FORA_DE_FAIXA`, `TFG_FORA_DE_FAIXA` |
| `models/insulina/fonte-clinica.ts` | Catálogo clínico único (ADR 0001) | regra-alterada | HIGH | Grupos `metformina`/`tfg` em `CONSTANTES`, extensão de `plausibilidade`, referências p. 28/58/59 em `REFERENCIAS`, catálogo `TEXTO_SUSPENDER_SULFONILUREIA` (D-05) |
| `models/insulina/regra-metformina.ts` | — (novo) | componente-novo | HIGH | Regra transversal RN-01/RN-02, chamada pela fachada nos dois modos (D-01), com precedência clínica TFG > otimização |
| `models/insulina/calculadora.ts` | Fachada `CalculadoraInsulinaDM2` (code-analysis §módulo-1) | regra-alterada | HIGH | Pipeline ganha a etapa de antidiabéticos orais nos dois modos, o gatilho do esquema já fracionado e a supressão de `MANTER_METFORMINA` sob `SUSPENDER_METFORMINA_TFG`; severidade do alerta novo (posição 5) |
| `models/insulina/regra-titulacao-basal.ts` | RegraTitulacaoBasal (domain.md §3.2, regra 8) | regra-alterada | HIGH | RN-03: suspensão de sulfonilureia em três gatilhos, com redação única por contexto e estado do uso |
| `models/insulina/validacao.ts` | Validação de entrada (domain.md §3.4, regra 15) | regra-alterada | MEDIUM | Ofensores `METFORMINA_FORA_DE_FAIXA` (100–3000 mg/dia) e `TFG_FORA_DE_FAIXA` (1–200), coleta total preservada (D-09) |
| `interface/calculadora/formulario.tsx` | Formulário (code-analysis §módulo-2) | regra-alterada | MEDIUM | Entrada de glicemias por momento (RF-04) e composição dos subcomponentes novos; 532 → 313 linhas (dívida 4 reduzida) |
| `interface/calculadora/glicemias-por-momento.tsx` | — (novo) | componente-novo | MEDIUM | Quatro campos por momento, tokenização por espaço + `interpretaDecimal`, conversão para `GlicemiaAferida[]` (D-06) |
| `interface/calculadora/antidiabeticos-orais.tsx` | — (novo) | componente-novo | LOW | Campos opcionais de metformina/TFG com validação no blur espelhada via `CONSTANTES` |
| `interface/calculadora/esquema-atual.tsx` | — (novo, extraído do formulário) | componente-novo | LOW | Fieldset da titulação movido sem mudança de comportamento (D-07) |
| `interface/calculadora/validacao-campos.ts` | — (novo, extraído do formulário) | componente-novo | LOW | `interpretaDecimal` e validadores de peso/HbA1c/dose movidos sem mudança de comportamento (D-07) |
| `tests/apoio/construtores.ts` | Apoio de testes (architecture.md §5) | regra-alterada | LOW | Builder `esquemaNphFracionada`; campos novos fluem pelos `extras` com default ausente |
| `tests/unit/dominio/*.test.ts`, `tests/integration/interface/*.test.tsx` | Suítes (architecture.md §5) | regra-alterada | MEDIUM | Suíte nova `metformina.test.ts`; titulação/validação/invariantes/referências estendidas; `formulario.test.tsx` reescrito para a entrada por momento; `resultado.test.tsx` estendido |

Sem impacto: `interface/calculadora/resultado.tsx` (renderização por lista já genérica — verificado por teste), `pages/**`, `regra-inicio.ts`, `regra-intensificacao.ts`, máquinas de estado (`state-machines.md`), contratos externos (nenhum, ADR 0008) e persistência (inexistente, ADR 0002).

## 2. Diff conceitual por componente

**Fachada e regra nova.** O pipeline documentado (validação → estratégia → invariantes → pós-processamento) ganhou uma etapa transversal: `RegraMetformina.avaliar` roda nos dois modos, no pós-processamento, antes da ordenação de alertas e da deduplicação. Dose de metformina informada abaixo de 2000 mg/dia gera o alerta `METFORMINA_NAO_OTIMIZADA` (severidade abaixo de `INDICACAO_INSULINA`); TFG 30–45 gera `REDUZIR_METFORMINA_TFG`; TFG < 30 gera `SUSPENDER_METFORMINA_TFG`. Duas supressões de coerência clínica foram introduzidas como decisão de execução (registrada nas Notas do `actions.md`, pendente de reconciliação de spec): TFG ≤ 45 suprime o alerta de otimização, e a suspensão por TFG remove `MANTER_METFORMINA` da mesma saída — este último ponto altera também a regra 3 do início.

**Titulação basal.** A regra 8 deixou de emitir a suspensão de sulfonilureia apenas na transição do fracionamento com uso explícito: agora há três gatilhos (fracionar com uso explícito → redação direta; fracionar com uso não informado → redação condicional; esquema que já chega com ≥ 2 aplicações de NPH → variantes de contexto), com `usoSulfonilureia === false` continuando silencioso. A redação vive uma única vez em `TEXTO_SUSPENDER_SULFONILUREIA` no catálogo clínico; a variante condicional agrega a p. 59 às referências.

**Catálogo clínico.** `CONSTANTES` ganhou os grupos congelados de metformina (1000/2000/2550) e TFG (45/30) — valores citados do guia — e a extensão de `plausibilidade` (100–3000; 1–200), que é decisão técnica D-09, distinção comentada no código. `REFERENCIAS` ganhou `metforminaOtimizada`, `tfgReducaoMetformina`, `tfgSuspensaoMetformina` e `sulfonilureiaComTfg`.

**Formulário.** A entrada de glicemias linha a linha (lista dinâmica com seletor de momento) foi substituída por quatro campos fixos por momento, com espaço como único separador e decimal por vírgula ou ponto; o parsing é 100% da UI e o contrato `GlicemiaAferida[]` do domínio permaneceu intocado (D-06). O bloco de antidiabéticos orais entrou como fieldset próprio. A equivalência clínica entre as duas formas de captura é verificada por teste (RF-04).

## 3. Preservadas (regras 🟢 do `domain.md` intactas)

- §3.1 regras 1–2 (faixa nunca dose única; `INDICACAO_INSULINA` por HbA1c ≥ 10% ou jejum ≥ 300)
- §3.2 regras 4–7 (média com hipoglicemia prevalecendo; tabela de ajuste; NPH mais noturna; clamp 1–60 UI)
- §3.2 regra 8, núcleo do fracionamento (gatilhos > 30 UI ou > 0,4 UI/kg/dia; ½+½ principal, ⅔+⅓ alternativa; manter metformina)
- §3.3 regras 9–14 (gate de HbA1c — incluindo a RN-H do adendo BUG-20260719-RHZ5, sentinela verde —; mapeamento deslocado; condutas por braço; caso AJ; inferência espelhada; NG-07)
- §3.4 regras 16–18 e 20 (fora do escopo sem cálculo parcial; faixa plena; cadência de 3 dias; referência obrigatória em toda saída — property test estendido às saídas novas)
- §3.5 regras 21–22 (privacidade por construção — campos novos não são enviados nem persistidos; invalidação por edição — cobre os campos novos sem mudança estrutural)

## 4. Modificadas (regras 🟢 alteradas — origem dos watch items)

| Regra | Origem | O que mudou |
|---|---|---|
| Regra 8 (parte da sulfonilureia) | `domain.md` §3.2 | De um gatilho (fracionar + uso explícito) para três, com redação única por contexto/estado do uso |
| Regra 3 (recomendações fixas do início) | `domain.md` §3.1 | `MANTER_METFORMINA` passa a ser suprimida quando `SUSPENDER_METFORMINA_TFG` está presente |
| Regra 15 (validação) | `domain.md` §3.4 | Dois ofensores novos opcionais (metformina, TFG), coleta total preservada |
| Regra 19 (ordenação/dedup) | `domain.md` §3.4 | Severidade ganha `METFORMINA_NAO_OTIMIZADA` na última posição; supressões de precedência no pós-processamento |
| Regra 23 (espelhamento de faixas na UI) | `domain.md` §3.5 | Estendida aos campos novos e à validação por momento (extensão compatível) |
