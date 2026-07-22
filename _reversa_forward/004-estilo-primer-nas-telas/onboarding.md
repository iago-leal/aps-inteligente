# Onboarding: testar a feature "Primer como base de estilo"

> Identificador: `004-estilo-primer-nas-telas`
> Data: `2026-07-21`
> Público: humano testando a feature pela primeira vez, após o `/reversa-coding`

## Pré-requisitos

- Node >= 24 (campo `engines` do `package.json`)
- npm (gerenciador do projeto)
- Navegadores do Playwright instalados (passo 5 cuida disso)

## 1. Preparar e subir

```bash
cd ~/dev/aps-inteligente
npm ci
npm run dev
```

Abra http://localhost:3000. A calculadora deve renderizar com a identidade Primer: tipografia do sistema (não mais IBM Plex), componentes com a aparência do GitHub.

## 2. Verificar o comportamento preservado (RF-02)

1. Preencha um caso válido de início: peso (ex.: `80`), glicemias de jejum, sem insulina prévia.
2. Calcule. A conduta deve trazer a faixa 10–15 UI de NPH ao deitar, com a referência do guia (página/figura).
3. Edite qualquer campo: o resultado deve marcar-se desatualizado e a revisão desmarcar-se.
4. Marque "Revisei a dose e a fonte": o bloco "Pronto para prescrever" aparece.
5. "Novo cálculo" limpa tudo (formulário remontado).

Os textos clínicos devem ser idênticos aos da versão anterior, byte a byte.

## 3. Verificar o tema (RF-03 / RN-04)

1. Alterne para o tema escuro no alternador da tela: **todas** as superfícies mudam (fundo, campos, painéis, alertas).
2. Recarregue a página: o escuro persiste (localStorage `aps-inteligente:tema`).
3. Volte ao claro e recarregue: idem.

## 4. Verificar a privacidade (RN-02)

```bash
npm run build && npm run start
```

Com a aba de rede do navegador aberta em http://localhost:3000, use a calculadora de ponta a ponta: **nenhuma requisição** pode sair para origem externa (fontes, CSS, ícones — tudo vem de `localhost`). Depois:

```bash
npm run test:api
```

O teste de contrato dos cabeçalhos de segurança (CSP) deve estar verde.

## 5. Rodar o harness e2e + acessibilidade (RF-05)

```bash
npx playwright install --with-deps chromium   # só na primeira vez
npm run test:e2e
```

A suíte navega a calculadora real e roda a verificação axe; o resultado deve acusar violações menores ou iguais à linha de base registrada na feature (ver relatório em `_reversa_forward/004-estilo-primer-nas-telas/`).

## 6. Verificar a quitação da dívida de CSS (RF-04)

```bash
wc -l interface/estilos/globais.css
```

Esperado: **< 400** linhas.

## 7. Verificar o manifesto (RF-01 e cenário negativo)

```bash
grep -E '"@primer/(react|primitives)"' package.json
grep -E '"@primer/(css|view-components)"' package.json || echo "OK: pacotes vetados ausentes"
```

Esperado: `@primer/react` e `@primer/primitives` pinados (sem `^`/`~`); os vetados ausentes.

## 8. Suítes completas

```bash
npm test
```

Unidade + integração verdes, cobertura de `models/**` ≥ 90%.

## Se algo falhar

- Falha de build por import do primitives: confira o caminho do CSS de temas contra a doc do `@primer/react` v38 (lacuna 🟡 registrada no `investigation.md` §6).
- Tema não persiste: inspecione `localStorage["aps-inteligente:tema"]` no console; a chave e os valores `claro`/`escuro` são invariantes (data-delta §3).
- Violações axe novas: compare com a linha de base antes de assumir regressão — a contagem, não o zero absoluto, é o critério.
