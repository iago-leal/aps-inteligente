# Onboarding — testar a calculadora de dor torácica pela primeira vez

> Feature `010-dor-toracica-pre-teste` · 2026-07-23
> Passo a passo executável para um humano validar a feature. Categoria: Produto.

## Pré-requisitos

- Node e o gerenciador de pacotes do projeto já instalados (ver README). A feature **não** exige banco (`db:up` é dispensável — nada de dado clínico persiste).
- PDF da fonte guardado em `referencias/` (fora do git). Só necessário para conferir a transcrição do Quadro 2.

## Subir a aplicação

```bash
npm install          # se ainda não instalado
npm run dev          # Next.js em http://localhost:3000
```

## Roteiro de verificação manual

1. **Home → nova seção.** Abrir `http://localhost:3000`. Confirmar a seção **"Cardiologia"** com a ficha "Calculadora de probabilidade pré-teste de cardiopatia isquêmica". O cartão inteiro é clicável e leva a `/cardiologia/dor-toracica`.
2. **Angina típica, alto risco.** Homem, 55 anos; marcar as três características da dor; marcar hipertensão e diabetes. Esperado: dor = **angina típica**; probabilidade-base do Quadro 2 (homem, 50–59, típica) exibida; faixa ajustada ×2–×3 **capada em ">90% / alta"**; conduta de **probabilidade alta** com estratificação e encaminhamento ao cardiologista. Toda saída com referência ao guia.
3. **Dor não anginosa, baixo risco.** Marcar apenas uma característica; nenhum fator de risco. Esperado: **dor não anginosa**; conduta informando que **exame funcional não está indicado** e listando causas não cardíacas (musculoesquelética, psiquiátrica, gastrointestinal, pulmonar).
4. **Fator de risco impede "baixa".** Repetir o passo 3 marcando um fator de risco. Esperado: o estrato **deixa de ser "baixa"** e a conduta muda (não mais "exame não indicado").
5. **Ergometria × exame alternativo.** Caso de probabilidade intermediária/alta com "ECG basal alterado / não pode exercitar" marcado. Esperado: conduta indica **método não invasivo** (eco de estresse, cintilografia ou RM), não ergometria, referenciando a p. 6.
6. **Fora do escopo da fonte.** Idade 74. Esperado: mensagem **"fora do escopo da fonte"** (Quadro 2 cobre 30–69), **sem** número estimado.
7. **Advertência de instabilidade.** Marcar sinal de angina instável. Esperado: **advertência de encaminhamento emergencial**, desviando do fluxo eletivo.
8. **Validação total.** Enviar formulário com múltiplos campos inválidos. Esperado: **todos** os ofensores listados de uma vez.
9. **Blocos de referência (RF-10).** Conferir os blocos textuais (CCS, tratamento + Tabela 1, seguimento, manejo agudo), cada um com citação de quadro/página, sem qualquer cálculo.
10. **Tema.** Alternar claro/escuro pelo seletor da Moldura; layout coerente nos dois temas.

## Verificação automatizada

```bash
npm run lint
npm run typecheck
npm test              # unidade + integração (inclui dominio-cardiopatia e oráculo do Quadro 2)
npm run test:api      # contrato 16/16 — deve permanecer intocado
npm run test:e2e      # e2e da plataforma (casos aditivos + axe ≤ baseline)
npm run test:coverage # cobertura de models/** ≥ 90%
npm run build         # medir first-load contra o gate D-08 (< 100 kB gzip/rota)
```

## Sinais de que algo está errado

- Qualquer resultado **sem** referência clínica → invariante quebrado (property-based deve pegar antes).
- Divergência de qualquer célula do Quadro 2 → erro de transcrição (oráculo deve falhar).
- `git diff models/insulina models/gestacao` **não** vazio → motor existente tocado indevidamente.
- Requisição de rede na aba Network ao usar a calculadora → violação de privacidade por construção.
