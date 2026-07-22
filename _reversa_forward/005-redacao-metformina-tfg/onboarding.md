# Onboarding: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Público: quem vai verificar a feature pela primeira vez (inclusive o "eu de daqui a 12 meses")

## 1. Subir o ambiente

```bash
cd ~/dev/aps-inteligente
npm ci          # se node_modules não existir ou estiver desatualizado
npm run dev     # Next.js em http://localhost:3000
```

A calculadora abre na página inicial. Nada é salvo nem enviado: todo o cálculo é client-side.

## 2. Cenário principal — TFG em faixa de redução (RF-01)

1. Preencha um caso de **início**: peso `80`, HbA1c `9`, e uma glicemia de jejum (ex.: `200`).
2. Em antidiabéticos orais, informe dose de metformina `2000` e **TFG `40`**.
3. Acione **Calcular**.
4. Em "Recomendações ao prescritor", confira:
   - "Manter a metformina ao iniciar a insulina NPH." com o item **"TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%."** imediatamente abaixo dele, **recuado como subitem**;
   - os textos idênticos aos de antes da feature (nenhuma palavra mudou);
   - as demais recomendações (sulfonilureia, aferição de jejum) na posição de sempre.

## 3. Cenários de contraprova

| Cenário | Entrada | Esperado |
|---------|---------|----------|
| TFG normal | Mesmo caso, TFG `60` | Lista exatamente como antes da feature: plana, sem item de ajuste renal |
| TFG de suspensão | Mesmo caso, TFG `25` | "Manter a metformina" **não** aparece; "suspender a metformina" aparece como item de topo (supressão da feature 001 preservada) |
| TFG ausente | Mesmo caso, campo TFG vazio | Lista idêntica, em texto e ordem, à vigente antes da feature |
| Titulação com fracionamento (RF-02) | Modo titulação, NPH única > 30 UI (ex.: 34 UI ao deitar), glicemias que mantenham ajuste, TFG `40` | "Manter a metformina ao fracionar a NPH." com o item de redução como subitem, igual ao início |
| Titulação sem fracionamento, TFG `40` | Modo titulação, esquema pequeno (ex.: NPH 10 UI) | Item de redução aparece **como item de topo** (não há "manter" para subordiná-lo — fallback do agrupador) |

## 4. Verificação automatizada

```bash
npm test          # unidade + integração; inclui o teste do agrupador e o do painel
npm run test:api  # contrato (não deve ter sido afetado)
npm run test:e2e  # Playwright + axe: 0 violações (linha de base da feature 004)
```

Sinais de saúde: suíte inteira verde; nenhuma asserção de texto de mensagem alterada; axe sem violação nova.

## 5. Onde está cada coisa

| Artefato | Caminho |
|----------|---------|
| Agrupador (função pura, mapa de pares) | `interface/calculadora/agrupar-recomendacoes.ts` |
| Renderização da lista | `interface/calculadora/resultado.tsx` (componente `Recomendacoes`) |
| Teste do agrupador | `tests/unit/interface/agrupar-recomendacoes.test.ts` |
| Teste do painel | `tests/integration/interface/resultado.test.tsx` |
| Sentinela de que o motor não mudou | `tests/unit/dominio/metformina.test.ts` (bloco "Precedência clínica") |
