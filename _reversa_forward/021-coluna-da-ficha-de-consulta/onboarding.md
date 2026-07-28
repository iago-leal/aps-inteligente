# Onboarding: como conferir a feature 021 com os próprios olhos

> Feature: `021-coluna-da-ficha-de-consulta`
> Data: `2026-07-28`
> Público: quem vai testar a correção pela primeira vez, inclusive o autor daqui a seis meses

## 1. O que você vai conferir

Que o corpo da ficha de consulta deixou de colar nas bordas da janela e passou a ocupar a mesma
coluna centrada das outras cinco telas, alinhado ao cabeçalho nas duas bordas; e que a guarda que
vigia esse alinhamento passou a alcançar todas as telas, inclusive as que ainda não existem.

## 2. Preparo

```
cd ~/dev/aps-inteligente
npm ci
npm run dev
```

Não é preciso subir banco. A plataforma é integralmente cliente, e a rota da ficha não toca rede
(ADR 0002). O `db:up` só interessa a `/api/v1/status`, que esta feature não altera.

## 3. Conferência a olho, em quatro minutos

1. Abra `http://localhost:3000/puericultura/consulta` numa janela **larga**, de 1280px ou mais.
2. Olhe a borda **esquerda**: o aviso de não persistência, o título das seções e o bloco de
   proveniência devem começar na mesma vertical em que começa a logo do cabeçalho.
3. Olhe a borda **direita**: o texto deve terminar na mesma vertical em que terminam os botões de
   tema e de início, no alto.
4. Estreite a janela até um telefone, perto de 375px. Nenhum texto deve encostar nas bordas.
5. Abra `http://localhost:3000/puericultura/crescimento` e compare: as duas telas devem ter
   exatamente o mesmo recuo, nas duas larguras.
6. Abra a home, `http://localhost:3000/`. Ela é a **variante `destaque`** e usa coluna de 720px:
   em janela larga, deve estar idêntica ao que era antes da feature, mais estreita que as
   calculadoras.
7. Role a home até o pé, onde fica o bloco de contribuição. Aqui há **duas diferenças esperadas**,
   e são as únicas mudanças visíveis da feature fora da tela da ficha. Ambas vêm de D-09 e estão
   declaradas na terceira premissa do roadmap.
   - Na janela **larga**, olhe a régua horizontal que separa o bloco do que está acima. Ela deve
     começar e terminar na mesma vertical do texto, acima e abaixo. Antes era mais larga que o
     texto, 32px transbordando de cada lado.
   - Em **375px**, o bloco passa a ter o mesmo recuo lateral das seções acima dele. Antes tinha o
     dobro, porque `.contribuicao-bloco` declarava a coluna por conta própria e não acompanhava o
     breakpoint da home.

   Nas duas larguras o critério é o mesmo: se o bloco estiver alinhado com o que está acima, está
   certo; se estiver mais estreito que o resto, a subtração de D-09 falhou.

## 4. Conferência do registro longo (RF-05)

1. Ainda em `/puericultura/consulta`, preencha sexo e data de nascimento de modo que a ficha
   sugerida seja a do **1.º Mês**, por exemplo nascimento há trinta e cinco dias.
2. Responda o máximo de campos que conseguir, incluindo os campos de texto livre com frases longas.
3. Role até o bloco do registro em SOAP. O texto deve quebrar **dentro** do bloco.
4. A página não deve rolar horizontalmente, em largura nenhuma. É o teste mais fácil de fazer e o
   mais fácil de esquecer: role a página para os lados e confirme que ela não se move.

## 5. Conferência automatizada

```
npm run typecheck
npm run lint
npm test
npm run test:e2e
node scripts/inventariar-textos.mts --gerar && git diff --stat scripts/textos/
```

O que cada um prova, nesta feature:

| Comando | O que prova aqui |
|---|---|
| `npm test` | Que nenhum domínio foi tocado: as asserções de unidade são as mesmas de antes |
| `npm run test:e2e` | Que os sete casos encaixam na coluna — as seis rotas do catálogo mais a home —, e que a baseline `axe` continua em zero |
| `node scripts/inventariar-textos.mts --gerar` | Que a feature não criou literal exibido. O `git diff` do segundo comando deve sair vazio |

## 6. A conferência que prova a guarda (RF-03)

Esta é a que separa consertar de resolver, e vale fazer uma vez à mão:

1. Em `interface/estilos/moldura.css`, comente a regra da variante `padrao`.
2. Rode `npm run test:e2e -- plataforma`.
3. A guarda deve **reprovar**, e a mensagem deve nomear `/puericultura/consulta` entre as rotas
   que falharam.
4. Descomente a regra e rode de novo. Verde.

Se o passo 3 passar em vez de reprovar, a guarda voltou a ser lista de verificação manual com
aparência de teste, e é isso que a feature existia para impedir.

## 7. O que **não** mudou, e não adianta procurar

- Nenhuma regra clínica, nenhum campo de ficha, nenhum rótulo, nenhuma rota.
- O texto do registro em SOAP, que continua saindo exatamente como a feature 020 o entrega,
  notas de proveniência inclusive. As queixas de uso sobre esse texto estão registradas na seção
  de lacunas do `requirements.md` e são matéria da feature seguinte.
- A grade das seções da ficha, que continua em duas colunas dentro da coluna corrigida (RF-08b).

Uma ressalva a esta lista, para que ela não minta: o bloco de contribuição **mudou** nos dois
pontos do passo 7 acima, o recuo no telefone e a largura da régua em qualquer janela. São as
únicas alterações visíveis fora da tela da ficha, e as duas corrigem desalinhamentos que já
existiam.
