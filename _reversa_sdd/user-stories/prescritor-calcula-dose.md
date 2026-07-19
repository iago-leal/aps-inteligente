# User Story — Prescritor calcula a conduta de insulina

> Gerado pelo Reversa Writer em 2026-07-19.
> Ator único do sistema (ver `../permissions.md`); fluxo transversal às três units.

## História

**Como** médico da APS atendendo um paciente com DM2,
**quero** informar peso, glicemias e o esquema atual de insulina e receber a conduta do Guia Rápido DM com a referência de página,
**para** ajustar a prescrição com segurança durante a consulta, sem que nenhum dado do paciente saia do meu navegador.

## Narrativa do fluxo (feliz)

1. O prescritor acessa `/` — a calculadora carrega com o selo "Nada é salvo nem enviado" (pages-next).
2. Escolhe o modo (início ou titulação) e preenche os campos; a validação no blur aponta valores implausíveis na hora (interface-calculadora).
3. Aciona "Calcular"; o motor valida tudo de novo, aplica as regras do guia e devolve esquema sugerido, delta, alertas ordenados e referências com página/figura (models-insulina).
4. Quando o guia oferece condutas equivalentes, ambas aparecem rotuladas — a escolha é do médico.
5. O prescritor confere dose e fonte, marca "Revisei a dose e a fonte" e o bloco "Pronto para prescrever" se habilita.
6. Se editar qualquer campo, o resultado é marcado como desatualizado e a revisão se desfaz — recalcular é obrigatório.

## Variações

- **Entrada inválida:** todos os problemas listados de uma vez, campo a campo (nunca um por vez).
- **Cenário fora do guia** (ex.: insulina análoga): recusa explícita com orientação, sem cálculo parcial.
- **Falha inesperada:** painel honesto "Não prescreva a partir desta tela".

## Critérios de aceitação de ponta a ponta

```gherkin
Cenário: Consulta completa sem vazamento de dados
  Dado o site em produção
  Quando o prescritor realiza um cálculo completo de titulação
  Então nenhuma requisição de rede transporta dado clínico
  E o resultado exibe ≥ 1 referência ao Guia Rápido DM (SMS-Rio, 2023)
  E o bloco de prescrição só aparece após revisão confirmada
```

## Rastreabilidade

| Passo | Unit | Spec |
|---|---|---|
| 1 | pages-next | `../pages-next/requirements.md` RF-03 |
| 2, 5, 6 | interface-calculadora | `../interface-calculadora/requirements.md` RF-01/02/05 |
| 3, 4 | models-insulina | `../models-insulina/requirements.md` RF-01..RF-05 |
