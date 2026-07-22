# Relatório: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Status: 6/6 ações concluídas

## 1. O que mudou, em uma frase

Quando a TFG está entre 30 e 45 mL/min/1,73 m², a recomendação de reduzir a dose de metformina em 50% deixa de aparecer no fim da lista e passa a ser subitem, recuado, da recomendação de manter a metformina — nenhum texto, tipo ou regra do motor mudou.

## 2. Estrutura da lista antes/depois (cenários do requirements §7)

**TFG 40 (início) — antes:**

```
• Manter a metformina ao iniciar a insulina NPH.
• Manter a sulfonilureia ao iniciar a insulina NPH.
• Orientar aferição de glicemia capilar em jejum três vezes por semana, ...
• TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.
```

**TFG 40 (início) — depois** (screenshot capturado no build de produção em 22/07/2026; recuo de 18px medido por `getComputedStyle`):

```
• Manter a metformina ao iniciar a insulina NPH.
    ◦ TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.
• Manter a sulfonilureia ao iniciar a insulina NPH.
• Orientar aferição de glicemia capilar em jejum três vezes por semana, ...
```

**TFG 60 ou ausente:** lista idêntica, em texto e ordem, à anterior à feature (verificado por teste de integração).

**TFG 25:** "Manter a metformina" segue suprimida (precedência da feature 001 intocada); "suspender a metformina" permanece item de topo.

**Titulação sem fracionamento com TFG 30–45:** a recomendação de redução aparece órfã e permanece item de topo (fallback D-02).

## 3. Medições e verificações (T005)

| Verificação | Resultado |
|-------------|-----------|
| Suíte padrão (`npm test`) | 202/202 verdes (eram 193 + 9 novos: 5 do agrupador, 4 do painel) |
| Contrato (`test:api`, banco local 5433 + `next start`) | 16/16 verdes |
| E2e + axe (`test:e2e`) | 4/4 verdes; violações axe = linha de base da feature 004 (0) |
| Lint (`eslint`) e typecheck (`tsc --noEmit`) | limpos |
| Strings clínicas | `git diff models/` vazio — nenhuma mensagem, constante ou referência mudou |
| CSS | nenhuma regra nova: o seletor descendente `.bloco-recomendacoes ul` já recua a sublista (18px) |

## 4. Pendência declarada

A extensão à titulação com fracionamento (RF-02) é derivação da sessão de esclarecimentos, não resposta direta do prescritor (premissa 🟡, roadmap §4): fica **aguardando validação em uso real**. Se a subordinação não fizer sentido nesse modo, a reversão é a remoção do par no mapa `SUBORDINACOES` de `interface/calculadora/agrupar-recomendacoes.ts`, condicionada ao modo.

## 5. Rastros

- Código: `interface/calculadora/agrupar-recomendacoes.ts` (novo), `interface/calculadora/resultado.tsx` (componente `Recomendacoes`)
- Testes: `tests/unit/interface/agrupar-recomendacoes.test.ts` (novo), `tests/integration/interface/resultado.test.tsx` (describe "Feature 005")
- Impacto no legado: `legacy-impact.md`; vigilância: `regression-watch.md` (nesta pasta)
