# Onboarding — 023-saude-do-idoso-gds

> Data: `2026-07-30`
> Para quem vai **testar a feature pela primeira vez**, inclusive o autor daqui a seis meses.
> Nada aqui exige banco de dados: a calculadora é inteiramente client-side.

## 1. Preparar

```bash
cd ~/dev/aps-inteligente
npm ci
npm run dev            # http://localhost:3000
```

O banco (`npm run db:up`) só é necessário para o healthcheck e para a suíte de contrato.
Esta feature não o toca.

## 2. Conferir a fonte antes de conferir o produto

A fonte é página web, e a conferência dela é **manual por decisão registrada** (`MD-0039`).
Antes de julgar a tela, tenha à vista o que a fonte publica:

```bash
open referencias/saude-do-idoso/escala-de-depressao-geriatrica-linhas-de-cuidado-ms-20260730.html
shasum -a 256 referencias/saude-do-idoso/*.html   # esperado: bb74f9bc...
```

Se quiser saber se a página mudou desde 30/07/2026, baixe-a de novo e compare o `sha256`
com o de cima. Divergência **não** é defeito do produto: é sinal de que a fonte se moveu, e
o caminho é reabrir a transcrição, não corrigir o teste.

## 3. Caminho feliz, com os números que provam a soma

Abra `http://localhost:3000/saude-do-idoso/depressao-gds`.

| Cenário | Como responder | Resultado esperado |
|---|---|---|
| Escore mínimo | Em todos os quinze itens, marque a resposta **oposta** à que pontua | Escore **0**, faixa "se considera normal" |
| Escore máximo | Em todos, marque a resposta que pontua | Escore **15**, faixa "depressão severa" |
| Fronteira baixa | Cinco itens pontuando | Escore **5**, ainda na faixa normal |
| Primeira troca de faixa | Seis itens pontuando | Escore **6**, "depressão leve" |
| Segunda troca de faixa | Onze itens pontuando | Escore **11**, "depressão severa" |

Os itens que pontuam com **"Não"** são o 1, o 5, o 7, o 11 e o 13; os outros dez pontuam com
"Sim". Se a tela discordar disso, o defeito é de transcrição, e o oráculo do passo 6 deve
ter reprovado antes.

Em qualquer faixa, o resultado exibe a **providência da fonte** ("escores elevados sugerem
encaminhamento para avaliação neuropsicológica específica") e a **advertência** de que o
instrumento rastreia e não estabelece diagnóstico. A providência aparece sempre: se ela
sumir em escore baixo, alguém inventou um limiar que a fonte não tem.

## 4. Caminhos que devem falhar bem

1. **Item em branco.** Deixe três itens sem resposta e peça o resultado: os **três** devem
   ser nomeados de uma vez, e nenhum escore pode aparecer. Um ofensor só, ou um escore
   parcial, é defeito.
2. **Edição depois do cálculo.** Calcule, depois troque uma resposta: o resultado passa a
   "desatualizado". Não há checkbox de revisão nesta tela, e não deve haver.
3. **Nenhum campo de idade.** Confira que o formulário não pede idade e que nada é recusado
   por idade. A tela deve dizer em prosa a quem o instrumento se dirige.

## 5. Conferir a promessa de privacidade com os próprios olhos

Com o DevTools aberto na aba **Network**, responda à escala inteira e calcule. Não deve
haver requisição alguma além dos ativos da própria página. Na aba **Application**, o único
item em `localStorage` continua sendo `aps-inteligente:tema`.

## 6. Rodar as verificações

```bash
npm run test                    # suíte padrão; inclui o oráculo de transcrição
npm run test:coverage           # models/** acima de 90%
npm run lint && npm run typecheck
node scripts/inventariar-textos.mts    # deve terminar sem parar
npx playwright test e2e/saude-do-idoso.spec.ts   # axe em zero
npx playwright test e2e/plataforma.spec.ts       # guarda geométrica nas oito rotas
```

Para **ver o oráculo reprovar** — o que vale mais do que vê-lo passar —, troque
temporariamente a resposta que pontua de um item em `models/depressao-geriatrica/itens.ts` e
rode `npm run test`. O teste de transcrição deve falhar nomeando o item. Desfaça em seguida.

Se `npm run format:check` reprovar, confira se a reprovação é a do `README.md`, que já
existia antes desta feature (dívida 10 de `architecture.md`), ou se é nova.

## 7. Regerar o congelado da fonte

Só quando a cópia em `referencias/` for substituída por uma leitura mais recente:

```bash
node scripts/congelar-fonte-gds.mts     # lê o HTML local, nunca a rede
git diff tests/apoio/gds-fonte-congelada.json
```

O `git diff` é leitura humana obrigatória: ele põe lado a lado o que a fonte dizia e o que
passou a dizer. Congelado que muda sem que ninguém leia o diff é oráculo que deixou de
oraculizar.

## 8. Onde olhar quando algo estiver errado

| Sintoma | Provável origem |
|---|---|
| Suíte vermelha em `tests/unit/textos/citacao.test.ts` | A subárvore do unit não foi declarada em `SUBARVORES_COM_ORACULO_PROPRIO` (D-10) |
| `scripts/inventariar-textos.mts` para nomeando arquivo e linha | Literal novo sem classe declarada nos módulos de `scripts/textos/classes/` |
| Cabeçalho desalinhado do corpo na rota nova | A folha `saude-do-idoso.css` declarou coluna própria, contra `MD-0029` |
| Escore plausível mas errado | Chave de pontuação invertida em algum item; comparar com o passo 3 e com o congelado |
