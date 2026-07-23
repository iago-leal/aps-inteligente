# Onboarding — 008-design-mais-bonito-da-home

> Passo a passo para um humano verificar a feature pela primeira vez.

## 1. Preparar

```bash
cd ~/dev/aps-inteligente
npm install        # traz @primer/octicons-react@19.29.2 (única dependência nova)
npm run dev        # http://localhost:3000
```

## 2. Verificar a home (raiz)

1. Abra `http://localhost:3000`.
2. **Área introdutória (RF-04):** título "APS Inteligente", subtítulo e selo "Nada é salvo nem enviado" com peso visual de porta de entrada, acima das seções.
3. **Seções (RF-02):** "Diabetes Mellitus tipo 2" e "Pré-natal" claramente separadas, cada uma com seu ícone.
4. **Cartões (RF-01):** cada calculadora é um cartão com superfície e borda delimitadas, título, descrição e affordance de navegação; passe o mouse e observe o estado de hover; navegue por Tab e observe o foco visível.
5. **Cartão inteiro clicável (RF-05):** clique na *descrição* (não no título) do cartão da IG — deve navegar para `/pre-natal/idade-gestacional`.
6. **Tema (RN-03):** alterne para o tema escuro pelo botão do cabeçalho; superfícies e contrastes devem acompanhar; recarregue e confirme a persistência.
7. **Responsivo (RF-03):** estreite a janela (~375 px): cartões em coluna única, sem rolagem horizontal.

## 3. Verificar a moldura nas calculadoras (RF-07)

1. Visite `/dm2/insulina` e `/pre-natal/idade-gestacional`.
2. O cabeçalho refinado deve estar presente nas duas, com selo e alternador funcionando; o comportamento das calculadoras é o mesmo de antes (nenhuma mudança funcional).

## 4. Rodar as suítes

```bash
npm run lint && npm run typecheck
npm test               # unidade + integração (asserções antigas intactas + casos novos)
npm run test:api       # 16/16 — CSP e cabeçalhos byte a byte
npm run test:e2e       # e2e + axe contra e2e/axe-baseline.json (home 0) + teste móvel novo
```

## 5. Conferir os gates

```bash
git diff models/                  # deve ser vazio
git diff interface/inicio/catalogo.ts   # deve ser vazio
npm run build                     # comparar first load com o valor pré-feature (gate D-08 < 100 kB gzip)
```

## 6. Validação estética

Compare as screenshots das três telas nos dois temas anexadas ao `relatorio.md` da feature; a palavra final sobre "mais bonito" é sua — divergências viram ajuste antes do encerramento.
