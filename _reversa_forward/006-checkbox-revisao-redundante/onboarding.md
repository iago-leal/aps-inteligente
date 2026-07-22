# Onboarding — testar a feature 006 pela primeira vez

> Data: `2026-07-22`
> Pré-requisito: Node instalado; dependências do repo (`npm ci`) em `/Users/iagoleal/dev/aps-inteligente`.

## 1. Subir o app

```bash
cd /Users/iagoleal/dev/aps-inteligente
npm run dev
```

Abra `http://localhost:3000` (localhost conta como contexto seguro: a área de transferência funciona).

## 2. Caminho feliz

1. Preencha um cálculo válido (ex.: modo início, peso 80 kg, glicemia de jejum 180 mg/dL) e acione **Calcular**.
2. No painel de resultado, marque **"Revisei a dose e a fonte"**.
3. O bloco **"Pronto para prescrever"** deve exibir o botão **"Copiar plano"**.
4. Clique no botão: deve surgir confirmação visível de sucesso.
5. Cole (Cmd+V) num editor de texto e confira as quatro partes, nesta ordem, sem cabeçalho "Plano:":
   1. esquema/dose (no início: insulina, momento e faixas; na titulação: conduta, dose total e esquema por aplicação);
   2. recomendações ao prescritor, com subitens recuados (ex.: TFG 40 → redução da metformina recuada sob a manutenção);
   3. referência da fonte (Guia Rápido Diabetes Mellitus — SMS-Rio, edição e localização);
   4. linha final de contexto sobre o apoio da ferramenta e a responsabilidade do médico.

## 3. Invalidação por edição

1. Com a cópia disponível, edite qualquer campo do formulário.
2. O resultado deve esmaecer com o aviso de desatualizado, o checkbox desmarcar e o botão de cópia sumir.
3. Recalcule e repita a revisão: o botão volta; nenhuma mensagem de cópia antiga permanece.

## 4. Falha honesta da área de transferência

1. Nas permissões do site no navegador, bloqueie a área de transferência (ou use uma janela com a permissão negada).
2. Marque a revisão e acione a cópia.
3. Deve aparecer mensagem clara de falha orientando a transcrição manual — sem quebra do painel e sem falso sucesso.

## 5. O que NÃO deve ter mudado

- Alertas, painéis de erro (validação, fora de escopo), painel de falha inesperada, disclaimer e selo de privacidade: textos idênticos aos vigentes.
- Nenhuma requisição de rede nova (conferir na aba Network: zero fetch).
- Tema claro/escuro segue alternando normalmente.

## 6. Suítes

```bash
npm test          # unidade + integração (inclui formatar-plano e resultado estendido)
npm run test:api  # contrato (16 casos, inalterados)
npm run test:e2e  # e2e + axe (linha de base 0 violações; conteúdo do clipboard verificado no chromium)
```
