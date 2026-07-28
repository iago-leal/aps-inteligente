# Onboarding: como provar a ficha de consulta com as próprias mãos

> Feature: `020-consulta-puericultura-soap`
> Data: `2026-07-28`
> Para quem abre este projeto depois de semanas e precisa ver a feature funcionando sem reler o plano inteiro.

## 0. Pré-requisitos

Node e as dependências já instaladas (`npm ci`). O banco **não** é necessário: ele só existe para o
healthcheck e não guarda nada de clínico. Os PDFs da caderneta precisam estar em
`referencias/caderneta/` — eles estão fora do git por `MD-0008`, e sem eles só o oráculo de
transcrição deixa de rodar; a tela funciona.

## 1. Subir a plataforma

```bash
npm run dev
```

Abrir `http://localhost:3000`. A seção **Puericultura** da home deve mostrar **duas** fichas: a
avaliação do crescimento, que já existia, e a consulta de puericultura, que é esta feature. Se a
segunda não aparecer, o problema está no `CATALOGO` de `interface/inicio/catalogo.ts`, que é a
fonte única de seções e rotas.

## 2. Percorrer a ficha como quem atende

1. Ir a `http://localhost:3000/puericultura/consulta`.
2. **Antes de preencher qualquer coisa**, conferir que já estão visíveis: o bloco de proveniência
   (fonte, páginas, o que a organização em SOAP tem de autoral, as três fichas ausentes e a
   supressão da criptorquidia) e o aviso de que nada é salvo. Os dois são requisito, não cortesia:
   quem vai investir dez minutos preenchendo precisa saber antes que recarregar descarta tudo.
3. Informar sexo masculino, nascimento `2026-03-10`, consulta `2026-07-20`.
4. Conferir que a tela exibe a idade em meses e dias e **sugere a ficha do 4.º Mês**.
5. Trocar a ficha para a do 6.º Mês e voltar: os campos exibidos trocam sem recarregar a página.
6. Marcar alguns campos, deixar outros em branco de propósito — o exame ocular, por exemplo.

## 3. Conferir o registro

1. Ler o texto SOAP exibido na tela.
2. Conferir que **não há uma linha sequer** dos campos deixados em branco, e que qualquer seção sem
   campo preenchido sumiu inteira, cabeçalho incluído.
3. Acionar "Copiar" e colar num editor de texto qualquer. O texto colado deve ser **idêntico** ao
   exibido. Se divergirem, a decisão D-03 do roadmap foi desfeita em algum ponto: tela e cópia
   precisam consumir a mesma cadeia.

## 4. Conferir a calculadora de crescimento sem redigitar

1. Preencher peso, comprimento e perímetro cefálico na ficha.
2. Informar a posição da medição, que é campo do produto e não da caderneta — a fonte não pergunta,
   e o motor da 017 se recusa a supor (roadmap D-09).
3. Abrir o painel de crescimento. **Nenhum campo deve pedir redigitação.**
4. Fechar o painel e reler o texto SOAP: os escores z devem estar na seção objetiva, a classificação
   nutricional na avaliação, ambos com a localização bibliográfica que a fachada emite.

## 5. Conferir o pré-termo

1. Informar idade gestacional ao nascer de 32 semanas e 3 dias.
2. A tela deve exibir **as duas idades**, cada uma rotulada.
3. A ficha sugerida vem da **cronológica**, e o texto copiado declara isso.

## 6. Conferir a supressão declarada

1. Informar sexo **feminino** e abrir a ficha do 2.º Mês.
2. O campo "Criptorquidia" **não** deve aparecer.
3. O bloco de proveniência deve dizer que a fonte o imprime nas duas tiragens.
4. Trocar para sexo masculino: o campo reaparece. A diferença é do produto, e vai declarada —
   `MD-0026`.

## 7. Conferir que nada é salvo

1. Preencher metade da ficha.
2. Recarregar a página. O formulário volta vazio.
3. No console do navegador, `Object.keys(localStorage)` deve trazer apenas a chave da preferência de
   tema, e `Object.keys(sessionStorage)` deve vir vazio.
4. A aba de rede não deve registrar nenhuma requisição externa durante todo o preenchimento.

## 8. Os portões, na ordem em que falham mais barato

```bash
npm run typecheck
npm run lint
node scripts/inventariar-textos.mts --gerar   # o portão mais barulhento desta feature
npm test
npm run test:e2e
```

O gerador do inventário para diante de **qualquer** literal novo sem classe declarada, e nesta
feature são centenas de rótulos citados da caderneta. Se ele parar, a mensagem diz o arquivo, a
linha, o texto e em qual módulo de `scripts/textos/classes/` declarar. Não contornar: a parada é o
mecanismo, não o defeito.

Depois de rodar com `--gerar`, rodar de novo e conferir que `git diff` fica vazio — o inventário é
idempotente por construção.

## 9. Se algo estiver errado, onde olhar primeiro

| Sintoma | Onde olhar |
|---|---|
| A ficha não aparece na home | `interface/inicio/catalogo.ts` |
| Um rótulo diverge da página impressa | o módulo da ficha em `models/puericultura/consulta/fichas/`, e o oráculo de transcrição, que deveria ter pego |
| O gerador do inventário para | a mensagem nomeia o módulo de `scripts/textos/classes/` onde declarar |
| O texto copiado difere do exibido | `interface/puericultura/consulta/formatar-registro.ts` e o `useMemo` que a tela usa |
| Campo em branco aparecendo no registro | a montagem em `models/puericultura/consulta/registro.ts` (RN-10) |
| O painel de crescimento pede redigitação | a montagem da `EntradaAvaliacao` a partir do estado da ficha (D-08), inclusive a conversão de gramas para quilos |
| A rota nova ficou pesada | medição de bundle no molde de `medicao-bundle.md` da feature 019; conferir se o painel está sob `next/dynamic` |
