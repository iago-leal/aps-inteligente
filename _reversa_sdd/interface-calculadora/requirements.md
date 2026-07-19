# interface-calculadora — UI da calculadora de insulina

> Gerado pelo Reversa Writer em 2026-07-19. Foca no QUE a unit faz.
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão Geral

🟢 Camada de apresentação React da calculadora: formulário controlado com validação no blur, painel de resultado com ritual de revisão explícita, tema claro/escuro e relato nulo de erros. **Nenhuma regra clínica própria** — números e faixas vêm do domínio (`CONSTANTES`); a UI orquestra entrada, chama a fachada e apresenta a saída.

## Responsabilidades

- Montar a `EntradaCalculo` a partir de campos controlados (linhas dinâmicas de glicemia e aplicação).
- Validar no blur com as mesmas faixas do motor (espelhamento, nunca duplicação de valores).
- Exibir as quatro variantes de `SaidaCalculo` na ordem fixa: alertas → dose → fonte → revisão → disclaimer.
- Impor o ritual de revisão ("Revisei a dose e a fonte") antes de "Pronto para prescrever".
- Invalidar o resultado a qualquer edição (`desatualizado`) e desfazer a revisão.
- Tratar exceção inesperada com o painel honesto (EC-07) e evento anônimo ao `RelatorDeErros`.
- Gerenciar tema com degradação graciosa se localStorage bloqueado.

## Regras de Negócio

- **RN-01 (privacidade):** nenhum dado clínico sai do navegador; único storage é o tema. `EventoDeErro` só transporta o nome da classe do erro. 🟢
- **RN-02 (invalidação):** editar qualquer campo após um cálculo marca o resultado como desatualizado e desmarca a revisão. 🟢
- **RN-03 (revisão):** "Pronto para prescrever" só aparece com revisão confirmada e resultado atual. 🟢
- **RN-04 (honestidade):** falha inesperada exibe "Não prescreva a partir desta tela" — jamais um resultado parcial. 🟢
- **RN-05 (reset por reconstrução):** "Novo cálculo" remonta o formulário via `key`, não limpa campo a campo. 🟢
- **RN-06 (entrada tolerante):** decimais aceitam vírgula ou ponto (EC-01); doses só inteiras. 🟢
- **RN-07 (classificação):** tipo de esquema derivado da contagem de Regular: 0 → basal, 1 → basal-plus, ≥2 → basal-bolus. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Formulário por modo (início/titulação) com linhas dinâmicas de glicemias e, na titulação, de aplicações | Must | Alternar modo mostra/oculta o bloco de esquema |
| RF-02 | Validação no blur espelhando `CONSTANTES` (peso, glicemia, HbA1c opcional, dose inteira 1–60) | Must | Mesmo valor rejeitado pela UI é rejeitado pelo motor e vice-versa |
| RF-03 | Chamar `CalculadoraInsulinaDM2.calcular` e mapear as 4 variantes para o `EstadoResultado` | Must | Cada variante rende painel distinto |
| RF-04 | Painel de sucesso em ordem fixa com alertas por severidade, dose/esquema, condutas alternativas rotuladas, referências e disclaimer | Must | Ordem: alertas → dose → fonte → revisão → disclaimer |
| RF-05 | Ritual de revisão + invalidação por edição (máquina de `state-machines.md` §1) | Must | Cenários Gherkin abaixo |
| RF-06 | Painel honesto + `RelatorDeErros.reportar({nome})` em exceção | Must | Erro lançado → painel de falha, evento só com nome de classe |
| RF-07 | Alternador de tema persistente com `useSyncExternalStore` | Could | Tema sobrevive a reload; sem localStorage, funciona sem persistir |
| RF-08 | Selo de privacidade "Nada é salvo nem enviado" visível na moldura | Should | Presente em todas as telas |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Zero fetch; storage restrito a `aps-inteligente:tema` | ausência de `fetch` em `interface/`; `preferencia-de-tema.ts` | 🟢 |
| Segurança de tipo | Vazamento de payload clínico estruturalmente impossível no relato de erro | `relator-de-erros.ts` (`EventoDeErro = {nome: string}`) | 🟢 |
| Acessibilidade | Playwright + axe-core no repo antigo (WCAG AA nos 2 viewports) | `package.json` (@axe-core/playwright); commit `ebad6a5` do bundle | 🔴 sem config/specs e2e atuais |
| Testabilidade | Integração via Testing Library/jsdom | `tests/integration/interface/` (3 suítes) | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: Revisão habilita o bloco de prescrição
  Dado um cálculo bem-sucedido exibido
  Quando o prescritor marca "Revisei a dose e a fonte"
  Então o bloco "Pronto para prescrever" é exibido

Cenário: Edição invalida resultado e revisão
  Dado um resultado com revisão confirmada
  Quando qualquer campo do formulário é editado
  Então o resultado é marcado como desatualizado
  E a revisão é desmarcada e o bloco de prescrição desabilitado

Cenário: Falha honesta
  Dado que o motor lança uma exceção fora do contrato
  Quando o cálculo é acionado
  Então o painel exibe "Não prescreva a partir desta tela"
  E o RelatorDeErros recebe evento contendo apenas o nome da classe do erro

Cenário: Novo cálculo remonta o formulário
  Dado um resultado exibido
  Quando o prescritor aciona "Novo cálculo"
  Então o formulário volta ao estado inicial por remontagem
  E o painel volta ao estado vazio
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| RF-02/RF-03/RF-04/RF-06 | Must | Caminho clínico e honestidade da falha |
| RF-01/RF-05 | Must | Sem formulário e ritual não há produto seguro |
| RF-08 | Should | Promessa de privacidade visível |
| RF-07 | Could | Conforto visual, degradável |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `interface/calculadora/calculadora-app.tsx` | `CalculadoraApp`, `EstadoResultado` | 🟢 |
| `interface/calculadora/formulario.tsx` | formulário, linhas dinâmicas, `interpretaDecimal`, `derivaTipoEsquema` | 🟢 |
| `interface/calculadora/resultado.tsx` | painel, ritual de revisão | 🟢 |
| `interface/calculadora/tela.tsx` | moldura, selo, alternador | 🟢 |
| `interface/calculadora/preferencia-de-tema.ts` | store de tema | 🟢 |
| `interface/calculadora/relator-de-erros.ts` | `RelatorDeErros`, `relatorNulo` | 🟢 |
