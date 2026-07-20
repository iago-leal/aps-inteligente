# Data Delta: Integração do design aprovado da calculadora

> Identificador: `001-integrar-design-claude`
> Data: `2026-07-19`
> Base: entidades em memória do ERD extraído (`_reversa_sdd/erd-complete.md`); sem banco por design (ADR 0002).

## 1. `EntradaCalculo` — campos novos

| Campo | Tipo | Obrigatório | Faixa de validação (D-09) | Origem |
|-------|------|-------------|---------------------------|--------|
| `doseMetforminaMgDia` | número (mg/dia) | não | 100–3000; ausente = "não informado" | RF-01 / RN-01; guia p. 28 e 58 |
| `tfg` | número (mL/min/1,73 m²) | não | 1–200; ausente = "não informado" | RF-02 / RN-02; guia p. 58 |

Semântica de ausência: campo ausente **não** gera ofensor nem saída nova (critérios de aceite de RF-01/RF-02) — mesmo padrão da HbA1c opcional atual (`_reversa_sdd/domain.md#3.4`, regra 15).

Sem mudança em `GlicemiaAferida[]`: a entrada por momento é conversão de captura na UI (D-06); o contrato do domínio permanece o extraído.

## 2. Saídas novas

| Tipo | Categoria | Gatilho | Texto (fixado na spec do coding) | Referência |
|------|-----------|---------|----------------------------------|------------|
| `METFORMINA_NAO_OTIMIZADA` | alerta (severidade abaixo de `INDICACAO_INSULINA`, D-08 🟡) | dose informada < faixa otimizada (2000–2550 mg/dia) ao iniciar ou titular | otimizar dose de metformina antes de intensificar insulina | p. 28, 58 |
| `REDUZIR_METFORMINA_TFG` | recomendação | TFG informada entre 30 e 45 | reduzir a dose de metformina em 50% | p. 58 |
| `SUSPENDER_METFORMINA_TFG` | recomendação | TFG informada < 30 | suspender metformina (risco de acidose lática) | p. 28, 58 |
| `SUSPENDER_SULFONILUREIA` (ampliada) | recomendação existente | gatilhos novos: uso não informado (redação condicional) e esquema já fracionado (≥ 2 aplicações de NPH, D-04 🟡) | redação da RN-03, variante por contexto (D-05) | p. 62; Figura 4 (p. 62–63) |

Ordenação e deduplicação inalteradas: alertas por severidade fixa, recomendações dedupadas por `tipo`, referências por `localizacao` (`_reversa_sdd/domain.md#3.4`, regra 19).

## 3. `CONSTANTES` — grupos novos (congelados, ADR 0001)

```
METFORMINA: {
  DOSE_MIN_MG_DIA: 1000,          // posologia mínima (p. 58)
  DOSE_OTIMIZADA_MIN_MG_DIA: 2000, // piso da dose otimizada (p. 28)
  DOSE_MAX_MG_DIA: 2550           // teto posológico (p. 28, 58)
}
TFG: {
  LIMIAR_REDUCAO_50: 45,  // 30–45: reduzir dose em 50% (p. 58)
  LIMIAR_SUSPENSAO: 30    // < 30: interromper (p. 28, 58)
}
VALIDACAO (extensão): {
  METFORMINA_MG_DIA: { MIN: 100, MAX: 3000 },  // plausibilidade (D-09 🟡)
  TFG: { MIN: 1, MAX: 200 }                    // plausibilidade (D-09 🟡)
}
```

Valores clínicos 🟢 (citados em `investigation.md` §1); faixas de plausibilidade 🟡 (decisão técnica, não conteúdo do guia — comentário no código deve distinguir as duas origens).

## 4. `REFERENCIAS` — entradas novas

| Localização | Conteúdo |
|-------------|----------|
| p. 28 | Dose otimizada de metformina (máx. 2000–2550 mg/dia); função renal < 30 → suspender metformina |
| p. 58 | Posologia da metformina; TFG 30–45 → reduzir 50%; TFG < 30 → interromper |
| p. 59 | Sulfonilureias utilizáveis com TFG > 30 (apoio à redação condicional) |

## 5. Migrações

n/a — nenhum dado persistido (o único localStorage é o tema, fora do escopo). Builders de teste (`tests/apoio/construtores.ts`) ganham os campos novos com default ausente, preservando os testes existentes.
