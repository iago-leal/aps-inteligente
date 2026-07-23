# interface/calculadora — UI da calculadora de insulina

> `requirements.md` · Re-extração 2 (2026-07-23), regenerado. Absorve features 004 (Primer), 005 (redação metformina×TFG), 006 (ritual funcionalizado) e 007 (Moldura extraída, rota `/dm2/insulina`).
> Escala: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Visão Geral

Camada de apresentação da primeira calculadora: formulário controlado com validação no blur, painel de resultado com ritual de revisão explícita, e ação "Copiar plano" habilitada pela revisão. **Nenhuma regra clínica própria** — números e faixas vêm do domínio (`models/insulina`); a UI orquestra entrada, chama a fachada e apresenta a saída, sobre a Moldura comum da plataforma. 🟢

## Responsabilidades

- Montar a `EntradaCalculo` a partir de campos controlados (linhas dinâmicas de glicemia e aplicação). 🟢
- Validar no blur espelhando as faixas do motor (nunca duplicando valores). 🟢
- Exibir as variantes de `SaidaCalculo` em ordem fixa: alertas → dose → fonte → revisão → disclaimer. 🟢
- Impor o ritual de revisão ("Revisei a dose e a fonte") antes de "Pronto para prescrever". 🟢
- Oferecer "Copiar plano" (texto para o prontuário) apenas com revisão válida (feature 006). 🟢
- Invalidar o resultado a qualquer edição (`desatualizado`) e desfazer a revisão. 🟢
- Tratar exceção inesperada com painel honesto (EC-07) e evento anônimo ao `RelatorDeErros`. 🟢
- Compor a Moldura comum (cabeçalho, selo, tema), sem reimplementá-la. 🟢

## Regras de Negócio

- **RN-01 (privacidade):** nenhum dado clínico sai do navegador; único storage é o tema; a cópia é gesto local do usuário. `EventoDeErro` só transporta o nome da classe. 🟢
- **RN-02 (invalidação):** editar após um cálculo marca desatualizado e desmarca a revisão. 🟢
- **RN-03 (revisão):** "Pronto para prescrever" e "Copiar plano" só com revisão confirmada e resultado atual. 🟢
- **RN-04 (honestidade):** falha inesperada exibe "Não prescreva a partir desta tela", jamais resultado parcial. 🟢
- **RN-05 (reset por reconstrução):** "Novo cálculo" remonta o formulário via `key`. 🟢
- **RN-06 (entrada tolerante):** decimais aceitam vírgula ou ponto; doses só inteiras. 🟢
- **RN-07 (classificação):** tipo de esquema pela contagem de Regular: 0 → basal, 1 → basal-plus, ≥2 → basal-bolus. 🟢
- **006 (plano copiável):** o texto tem quatro partes (esquema/dose → recomendações → fonte → contexto); alertas e condutas alternativas ficam **fora** do texto (D-04; ADR 0005). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Formulário por modo (início/titulação) com linhas dinâmicas | Must | Alternar modo mostra/oculta o bloco de esquema |
| RF-02 | Validação no blur espelhando `CONSTANTES` | Must | Valor rejeitado pela UI também é rejeitado pelo motor |
| RF-03 | Chamar `CalculadoraInsulinaDM2.calcular` e mapear variantes | Must | Cada variante rende painel distinto |
| RF-04 | Painel de sucesso em ordem fixa | Must | alertas → dose → fonte → revisão → disclaimer |
| RF-05 | Ritual de revisão + invalidação por edição | Must | Cenários Gherkin abaixo |
| RF-06 | Painel honesto + `RelatorDeErros.reportar({nome})` | Must | Erro → painel de falha; evento só com nome de classe |
| RF-07 | Alternador de tema persistente (via Moldura) | Could | Tema sobrevive a reload; sem localStorage, funciona sem persistir |
| RF-08 | Selo de privacidade visível (via Moldura) | Should | Presente em todas as telas |
| RF-09 (006) | Copiar plano habilitado pela revisão | Should | "Copiar plano" só com revisão válida; copia as quatro partes |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Zero fetch; storage restrito ao tema; cópia local | ausência de `fetch`; `preferencia-de-tema.ts`; `area-de-transferencia.ts` | 🟢 |
| Segurança de tipo | Vazamento de payload clínico impossível no relato de erro | `relator-de-erros.ts` (`EventoDeErro = {nome}`) | 🟢 |
| Acessibilidade | Playwright + axe-core em e2e (WCAG AA nos 2 viewports) | `e2e/calculadora.spec.ts`; `axe-baseline.json` | 🟢 |
| Testabilidade | Integração via Testing Library/jsdom | `tests/integration/interface/` | 🟢 |

## Critérios de Aceitação

```gherkin
Cenário: Revisão habilita prescrição e cópia
  Dado um cálculo bem-sucedido exibido
  Quando o prescritor marca "Revisei a dose e a fonte"
  Então "Pronto para prescrever" é exibido e "Copiar plano" fica habilitado

Cenário: Copiar plano leva as quatro partes
  Dado uma revisão confirmada
  Quando o prescritor aciona "Copiar plano"
  Então a área de transferência recebe esquema/dose, recomendações, fonte e a linha de contexto
  E não recebe alertas nem condutas alternativas

Cenário: Edição invalida resultado e revisão
  Dado um resultado com revisão confirmada
  Quando qualquer campo é editado
  Então o resultado é marcado desatualizado e a revisão desmarcada

Cenário: Falha honesta
  Dado que o motor lança exceção fora do contrato
  Quando o cálculo é acionado
  Então o painel exibe "Não prescreva a partir desta tela"
  E o RelatorDeErros recebe evento contendo apenas o nome da classe
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| RF-02/RF-03/RF-04/RF-06 | Must | Caminho clínico e honestidade da falha |
| RF-01/RF-05 | Must | Sem formulário e ritual não há produto seguro |
| RF-09 (copiar) | Should | Funcionaliza o ritual; degradável |
| RF-08 | Should | Promessa de privacidade visível |
| RF-07 | Could | Conforto visual, degradável |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `interface/calculadora/tela.tsx` | `TelaCalculadora` (compõe a Moldura) | 🟢 |
| `interface/calculadora/calculadora-app.tsx` | `CalculadoraApp`, `EstadoResultado` | 🟢 |
| `interface/calculadora/formulario.tsx` | formulário, linhas dinâmicas, decimais, tipo de esquema | 🟢 |
| `interface/calculadora/resultado.tsx` | painel, ritual de revisão, ação copiar | 🟢 |
| `interface/calculadora/formatar-plano.ts` | `formatarPlano` (feature 006) | 🟢 |
| `interface/calculadora/area-de-transferencia.ts` | `copiarParaAreaDeTransferencia` (feature 006) | 🟢 |
| `interface/calculadora/rotulos.ts` | `ROTULO_MOMENTO`, `textoDoDelta` (anti-drift) | 🟢 |
| `interface/calculadora/agrupar-recomendacoes.ts` | agrupamento com subitens (feature 005) | 🟢 |
| `interface/calculadora/preferencia-de-tema.ts` | store de tema (usado pela Moldura) | 🟢 |
| `interface/calculadora/relator-de-erros.ts` | `RelatorDeErros`, `relatorNulo` | 🟢 |
