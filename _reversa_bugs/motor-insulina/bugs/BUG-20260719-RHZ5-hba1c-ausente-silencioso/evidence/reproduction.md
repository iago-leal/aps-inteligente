# Cápsula de reprodução — BUG-20260719-RHZ5

| Campo | Valor |
|---|---|
| Data | 2026-07-19 |
| Commit base | `dc1d9fd88d9526e6da947da3699d310ee376a691` (branch `main`, árvore limpa) |
| Ambiente | macOS (Darwin 25.5.0), Node v26.1.0, execução via `tsx` (type stripping) |
| Comando | `npx -y tsx scratchpad/repro-BUG-20260719-RHZ5.mjs` (script isolado, fora do projeto) |
| Exit code | 0 |
| Taxa | 2/2 cenários defeituosos reproduzidos na primeira tentativa |
| Classificação | **deterministic** (fluxo puro, sem I/O nem relógio) |

## Cenários executados contra `CalculadoraInsulinaDM2.calcular` real

### Ramo (a) — defeito

Entrada: `modo: titulacao`, peso 80 kg, esquema basal NPH 20 UI ao deitar, glicemias `[jejum 100]`, HbA1c ausente.

```text
tipo: resultado | naMeta: true | alertas: [] | recomendacoes: []
```

Nenhuma menção a HbA1c. O prescritor recebe "na meta" sem saber que falta o exame que dirige a intensificação.

### Ramo (b) — defeito

Entrada: idem, com esquema basal-plus (NPH 20 ao deitar + Regular 4 antes do café), glicemias `[jejum 100]`, HbA1c ausente.

```text
tipo: resultado | naMeta: true | alertas: [] | recomendacoes: []
```

### Controle (c) — comportamento correto preservado

Basal puro COM pré-prandial (150 antes do almoço), HbA1c ausente → `erro-validacao` com `HBA1C_OBRIGATORIA` (EC-10 barra o terceiro ramo lógico, como documentado no bug).

### Controle (d) — comportamento correto preservado

Basal-plus COM pré-prandial, HbA1c ausente → resultado com `REPETIR_HBA1C_3_MESES` + `REAVALIAR_EM_3_DIAS` (o gate emite recomendação quando o fluxo passa da linha 99).

## Conclusão

O defeito relatado reproduz exatamente como descrito nos Steps to Reproduce: o silêncio ocorre nos dois ramos alcançáveis de `regra-intensificacao.ts:99` (`if (!temRegular || prePrandiais.length === 0) return;`) quando `hba1cPercent === undefined`, e apenas neles.
