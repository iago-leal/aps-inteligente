# Onboarding: Publicação em produção da primeira página e API de saúde (status)

> Identificador: `002-producao-pagina-e-api-status`
> Data: `2026-07-19`
> Público: humano testando a feature pela primeira vez (o "eu de daqui a 12 meses")

## Pré-requisitos

- Node >= 24 e npm (campo `engines` do manifesto)
- Dependências instaladas: `npm ci`

## 1. Verificar o gate de qualidade local

```bash
npm run lint && npm run typecheck && npm test
```

Esperado: tudo verde (suíte de 188+ testes; as suítes de contrato não rodam aqui — ver passo 3).

## 2. Subir o build de produção local

```bash
npm run build
npm start
```

Esperado: servidor em `http://localhost:3000`. A CSP só existe neste modo (em `next dev` ela é desligada para o HMR funcionar).

## 3. Rodar a suíte de contrato contra o build de produção

Com o `npm start` de pé, em outro terminal:

```bash
npm run test:api
```

Esperado: suítes de `tests/contract/` verdes — status (200, JSON com `atualizado_em`/`versao`/`commit`, sem `Set-Cookie`, `Cache-Control: no-store`, denylist de privacidade, 405 para POST) e cabeçalhos de segurança da página.

## 4. Inspecionar manualmente o endpoint e os cabeçalhos

```bash
curl -i http://localhost:3000/api/v1/status        # 200, JSON, no-store
curl -i -X POST http://localhost:3000/api/v1/status # 405, Allow: GET
curl -sI http://localhost:3000/ | grep -iE 'content-security|referrer|x-content-type'
```

Esperado: os três cabeçalhos de segurança presentes na página; `commit: "local"` no corpo (fora do provedor é o fallback correto).

## 5. Verificar a produção

Após um push em `main` com CI verde (o deploy é o último job do workflow):

```bash
curl -i https://<url-padrao-do-provedor>/api/v1/status
```

Esperado: 200 com `commit` igual ao SHA do último commit de `main`; abrir a URL raiz no navegador deve renderizar a calculadora e permitir um cálculo completo.

## 6. Verificar o gate na prática (opcional, recomendado)

Num branch de teste, quebre um teste de propósito e faça push: o CI deve falhar e **nenhum** deploy deve ocorrer. Isso comprova o RF-06 de ponta a ponta.

## Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| `test:api` falha com conexão recusada | `npm start` não está de pé | Repetir o passo 2 |
| `commit: "local"` em produção | Variável de ambiente do provedor não exposta ao runtime | Ver premissa 2 do roadmap §4 |
| Deploy não ocorre com CI verde | Secret do token ausente no repositório | Ver premissa 1 do roadmap §4 |
| Página quebrada só em produção | CSP bloqueando recurso novo | Comparar console do navegador com a CSP em `next.config.ts` |
