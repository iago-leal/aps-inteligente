# Investigation: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`

## 1. O problema observado

Na tela de resultado (produção, 22/07/2026), o modo início com TFG entre 30 e 45 mL/min/1,73 m² exibe, na seção "Recomendações ao prescritor":

1. Manter a metformina ao iniciar a insulina NPH.
2. Manter a sulfonilureia ao iniciar a insulina NPH.
3. Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.
4. TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.

Os itens 1 e 4, distantes três posições, lidos isoladamente parecem se contradizer. A causa da distância é mecânica: `RegraInicio.calcular` emite as recomendações fixas primeiro (`regra-inicio.ts:35-52`) e a fachada `comAntidiabeticosOrais` (`calculadora.ts:96-128`) apenas concatena a saída de `RegraMetformina` ao final, antes da deduplicação. Não há bug de lógica — o prescritor validou a conduta — e sim de composição visual.

## 2. Alternativas avaliadas

| Alternativa | Avaliação | Veredito |
|-------------|-----------|----------|
| Mensagem integrada única ("Manter a metformina..., com a dose reduzida em 50% pela TFG") | Exigiria aprovação de texto clínico novo e variantes por modo; o prescritor preferiu não reescrever | descartada pelo usuário (sessão de esclarecimentos 2026-07-22) |
| Reordenar na fachada (`calculadora.ts`), aproximando os itens na saída do motor | Muda a saída observável do motor; viola o RF-03 e contamina o domínio com preocupação de apresentação (contra `_reversa_sdd/adrs/0003`) | descartada |
| Campo de hierarquia no tipo `Recomendacao` (ex.: `subordinadaA`) | Mudança de contrato do motor, proibida pelo resumo do requirements; obrigaria as regras de domínio a conhecer layout | descartada |
| Agrupamento na interface: função pura + lista aninhada no componente | Motor intocado, testável em unidade, acessível por construção, reversível em uma linha | **escolhida** (D-01/D-02/D-03) |

## 3. Fundamentos e padrões aplicáveis

- **Lista aninhada como semântica de subordinação.** `<ul>` dentro de `<li>` é o mecanismo nativo de HTML para relação item–subitem; leitores de tela anunciam a lista interna no contexto do item pai, sem ARIA adicional (WAI/W3C, práticas de estrutura de conteúdo; MDN, elemento `ul` — listas podem ser aninhadas dentro de `li`). Nenhuma dependência nova.
- **Precedente interno de extração de módulo puro na interface.** A feature 001 extraiu `validacao-campos.ts` de `formulario.tsx` para isolar transformação testável de renderização; `agrupar-recomendacoes.ts` segue o mesmo molde (coesão funcional, SRP).
- **Precedente interno de supressão por precedência.** `semManterMetforminaSeSuspensa` (`calculadora.ts:40-49`) mostra que relações entre tipos de recomendação já são tratadas por função pura pequena com mapa implícito de tipos; o agrupador replica o estilo, mas na camada de apresentação, porque o efeito desejado é visual, não de conteúdo.
- **Linha de base de acessibilidade.** A feature 004 instituiu a varredura `@axe-core/playwright` com 0 violações como baseline versionada; a mudança precisa passar por ela, o que dá verificação automática de que a lista aninhada não regride acessibilidade.

## 4. Sondagem do código afetado

- `interface/calculadora/resultado.tsx:81-93` — componente `Recomendacoes`: hoje um `map` plano sobre `itens`; ponto único de renderização da lista (os dois modos passam por ele).
- `models/insulina/regra-titulacao-basal.ts:168-169` — emite "Manter a metformina ao fracionar a NPH." apenas no fluxo de fracionamento; na titulação sem fracionamento, `REDUZIR_METFORMINA_TFG` pode aparecer órfã — daí o fallback do agrupador (subitem sem pai vira item de topo).
- `tests/integration/interface/resultado.test.tsx` — exercita a lista de recomendações; asserções de estrutura precisarão acompanhar o aninhamento (textos intocados).
- `tests/unit/dominio/metformina.test.ts` (bloco "Precedência clínica") — permanece intocado; serve de sentinela de que o motor não mudou.

## 5. Fontes externas

- MDN Web Docs — `<ul>`: aninhamento de listas (developer.mozilla.org/docs/Web/HTML/Element/ul).
- W3C WAI, Web Accessibility Tutorials — Content Structure / Lists (w3.org/WAI/tutorials/page-structure/content/).
- Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023: p. 58 (ajuste renal da metformina), p. 60/62 (início da insulinização) — apenas como confirmação de que nenhum conteúdo clínico novo é introduzido.
