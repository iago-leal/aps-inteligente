# Onboarding: testar a feature 001-integrar-design-claude

> Para um humano que vai verificar a feature pela primeira vez, após o `/reversa-coding`.
> Pré-requisito: Node ≥ 24 e npm (stack pinada; lockfile commitado).

## 1. Subir a aplicação

```bash
cd ~/dev/aps-inteligente
npm ci
npm run dev
# abrir http://localhost:3000
```

## 2. Roteiro de verificação manual

### 2.1 Entrada de glicemias por momento (RF-04)

1. No formulário, localize os quatro campos: **jejum**, **antes do almoço**, **antes do jantar**, **ao deitar**.
2. Digite no jejum: `98,5 180 200` (espaço separa aferições; vírgula é decimal). Deixe os demais vazios.
3. Preencha peso e o restante de um caso de titulação válido e calcule.
4. Esperado: o ajuste usa a média do jejum; digitar `65 180` no jejum deve fazer a hipoglicemia prevalecer (−4 UI + alerta), independentemente da média.
5. Digite `5` no jejum e apague o peso: os dois ofensores devem aparecer juntos (validação coleta todos).

### 2.2 Metformina (RF-01)

1. Informe dose de metformina `1000` (mg/dia) num cálculo de início ou titulação.
2. Esperado: alerta de otimização da metformina, com referência às p. 28/58 do guia.
3. Repita com `2000` ou mais: o alerta não deve aparecer. Deixe o campo vazio: nada novo aparece.

### 2.3 TFG (RF-02)

1. Informe TFG `40`: recomendação de reduzir a dose de metformina em 50% (p. 58).
2. Informe TFG `25`: recomendação de suspender a metformina (p. 28/58).
3. TFG vazia: nenhuma recomendação nova.

### 2.4 Sulfonilureia ampliada (RF-03)

1. Cenário fracionamento: titulação com NPH única alta (ex.: 32 UI) que dispare fracionamento, **sem** informar uso de sulfonilureia. Esperado: recomendação com a redação condicional ("Uso de sulfonilureia não informado: se estiver em uso, suspender…").
2. Cenário já fracionado: esquema de entrada com NPH em duas aplicações e uso de sulfonilureia marcado como "sim". Esperado: recomendação de suspender, mesmo sem novo fracionamento.
3. Conferir que o ritual de revisão continua: editar qualquer campo desfaz a confirmação e marca o resultado como desatualizado.

## 3. Verificação automatizada

```bash
npm run lint && npm run typecheck
npm test              # suíte completa deve estar verde
npm run test:coverage # cobertura ≥ 90% em models/**
```

Atenção especial: `tests/regression/BUG-20260719-RHZ5.test.ts` (sentinela da intensificação) e os property tests de invariantes (toda saída com referência clínica) devem passar sem alteração.

## 4. O que NÃO deve acontecer

- Nenhuma requisição de rede com dado clínico (aba Network vazia de fetch) — privacidade por arquitetura.
- Nenhum dado novo em localStorage além do tema.
- Nenhuma dose fora de 1–60 UI por aplicação nas saídas.
