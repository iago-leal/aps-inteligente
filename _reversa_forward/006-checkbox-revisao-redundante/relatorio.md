# Relatório — 006-checkbox-revisao-redundante

> Data: `2026-07-22`
> Feature: o ritual de revisão ganha função — com revisão confirmada e resultado atual, o bloco "Pronto para prescrever" oferece **Copiar plano**, que põe na área de transferência o plano completo para colar no campo Plano do prontuário.

## 1. O que foi entregue

| Peça | Arquivo | Papel |
|------|---------|-------|
| Rótulos compartilhados | `interface/calculadora/rotulos.ts` | Fonte única de texto para tela e formatador (anti-drift) |
| Formatador do plano | `interface/calculadora/formatar-plano.ts` | Função pura `ResultadoCalculo → string`, quatro partes do RF-02 |
| Adaptador de clipboard | `interface/calculadora/area-de-transferencia.ts` | API do navegador isolada; falha como valor (`{ok: false}`) |
| Painel estendido | `interface/calculadora/resultado.tsx` | `AcaoCopiarPlano` montado só com `revisaoValida`; desmonte na invalidação zera o retorno por construção |
| Testes | `tests/unit/interface/formatar-plano.test.ts` (8), `tests/integration/interface/resultado.test.tsx` (+5), `e2e/calculadora.spec.ts` (+1) | TDD: nasceram falhando, entrega verde |

## 2. Exemplo real do texto copiado (saída do formatador executado)

### Modo início (com o agrupamento da feature 005)

```
Insulina NPH ao deitar — dose inicial pela fonte: 10 a 15 UI/dia.
Equivalente por peso (0,1 a 0,2 UI/kg/dia): 8 a 16 UI/dia.
A dose exata é fixada pelo prescritor.

Recomendações ao prescritor:
- Manter a metformina ao iniciar a insulina NPH.
  - TFG entre 30 e 45 mL/min/1,73 m²: reduzir a dose de metformina em 50%.
- Orientar aferição de glicemia capilar em jejum três vezes por semana, com registro, durante 15 dias.

Fonte clínica:
- Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023: p. 60; Figura 4, p. 62
- Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023: p. 58

Plano elaborado com apoio de ferramenta de decisão clínica; a prescrição é responsabilidade do médico.
```

### Modo titulação

```
Conduta: Aumentar 4 UI. Dose total: 26 UI/dia.
Esquema:
- NPH 10 UI antes do café
- NPH 16 UI ao deitar

Recomendações ao prescritor:
- Reavaliar a resposta em 3 dias.

Fonte clínica:
- Guia Rápido Diabetes Mellitus — SMS-Rio, 2.ª ed. atualizada, 2023: p. 60; Figura 4, p. 62

Plano elaborado com apoio de ferramenta de decisão clínica; a prescrição é responsabilidade do médico.
```

## 3. Verificação (critério de pronto do roadmap §10)

| Verificação | Resultado |
|-------------|-----------|
| Unidade + integração (`npm test`) | 215/215 ✅ (202 pré-existentes + 13 novos) |
| Contrato (`npm run test:api`, banco local + servidor de produção) | 16/16 ✅ |
| E2E (`npm run test:e2e`) | 5/5 ✅, incluindo leitura real da área de transferência no chromium |
| Axe | Linha de base da feature 004 mantida (0 violações nas duas telas) ✅ |
| `git diff models/` | Vazio ✅ |
| Strings clínicas existentes | Intocadas: as únicas linhas removidas de `resultado.tsx` são os rótulos movidos byte a byte para `rotulos.ts` ✅ |
| Rede | Zero `fetch` em `interface/`; teste e2e de origem externa segue verde ✅ |
| Limites do mantenedor | `resultado.tsx` 353 linhas; `globais.css` 397 (não tocado) ✅ |
| Lint + typecheck + prettier (arquivos tocados) | Limpos ✅ |

## 4. Watchs registrados (ver `regression-watch.md`)

- **D-04 (interpretação 🟡):** alertas e condutas alternativas ficam **fora** do texto copiado — o Plano registra a conduta sugerida; a escolha entre equivalentes é do prescritor (ADR 0005). **Validar em uso real**: se sentir falta delas ao colar no prontuário, é ajuste de uma função (`formatar-plano.ts`), sem tocar o motor.
- **Drift formatador×tela:** o formatador importa as mesmas funções e rótulos da renderização; recomendações novas entram automaticamente, mas blocos novos de painel exigirão decisão de inclusão no texto.
- **Premissa de plataforma:** a cópia depende de contexto seguro (HTTPS/localhost) e permissão de clipboard; falha degrada com orientação manual (RN-05), verificada em integração.

## 5. Notas de execução

- A regra nova do lint de hooks vetou o reset de estado por efeito; a solução ficou mais limpa: `AcaoCopiarPlano` como componente filho montado apenas com `revisaoValida` — o desmonte zera o estado por construção, exatamente a semântica do RF-04.
- A suíte de contrato exige o Postgres local da feature 003 (`npm run db:up`) e o servidor de produção (`npm run build && npm start`) de pé; ambos foram sobidos e derrubados durante a verificação.
