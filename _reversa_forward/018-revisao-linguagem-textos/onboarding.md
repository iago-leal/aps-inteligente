# Onboarding: conferir a revisão da linguagem

> Identificador: `018-revisao-linguagem-textos`
> Data: `2026-07-27`
> Para quem: quem vai testar a feature pela primeira vez, sem tê-la implementado
> Tempo estimado: 20 a 30 minutos, dos quais a leitura das telas é a maior parte

Este roteiro é executável de ponta a ponta a partir de um clone limpo. Não exige as fontes clínicas de `referencias/` — pasta que o `.gitignore` exclui —, porque nenhum passo desta feature depende delas.

## 0. Preparar

```bash
npm ci                       # Node >= 24, conforme o campo engines
```

O banco PostgreSQL da feature 003 **não** é necessário para conferir esta feature: nenhum texto revisado passa por ele, e o único teste que o exige é o de contrato de infraestrutura. Se quiser a suíte inteira verde de uma vez, suba-o antes com `npm run db:up`.

## 1. A norma existe e é encontrável

O primeiro critério é o mais barato de conferir, e é o que sobrevive à feature:

```bash
cat docs/redacao.md | head -40
grep -n "redacao\|redação" CLAUDE.md README.md
grep -n "^### IX" .reversa/principles.md
```

O que se espera: o guia existe; `CLAUDE.md` e `README.md` apontam para ele; `.reversa/principles.md` traz o princípio **IX**; e guia e princípio remetem um ao outro. Se o guia não responder, em menos de um minuto de leitura, "como pontuo o subtítulo de uma tela nova?", ele falhou no propósito, ainda que passe em todos os testes.

## 2. O inventário fecha, e o gerador é idempotente

```bash
node scripts/inventariar-textos.mts     # regera o inventário
git diff --stat tests/apoio/inventario-textual.json
```

O que se espera: **diff vazio.** Diff vazio significa que o arquivo versionado corresponde ao código atual, que é a propriedade de idempotência herdada dos geradores da feature 017. Diff não vazio na primeira execução, sem nenhuma edição de código no meio, é defeito do gerador.

Conferir a contagem e a ausência de órfãos:

```bash
node -e "const i=require('./tests/apoio/inventario-textual.json'); console.log(i.totais); console.log('sem classe:', i.literais.filter(l=>!l.classe).length)"
```

O que se espera: `sem classe: 0`, e os totais por classe e por camada substituindo a estimativa de §2.1 do requirements. Este é o número que fecha RF-02.

Para ver o gerador falhar como deve — a propriedade mais importante dele —, introduza um literal novo sem declará-lo no mapa e rode outra vez:

```bash
# acrescente uma string de três ou mais palavras em qualquer componente de interface/
node scripts/inventariar-textos.mts     # deve PARAR, nomeando arquivo e linha
git checkout -- .                       # desfaz o teste
```

## 3. A suíte inteira, e a contagem de asserções

```bash
npm run lint && npm run typecheck && npm test
npm run test:e2e
```

O que se espera: tudo verde, e **nenhuma rota pior** que a linha de base de acessibilidade. Atenção ao que essa frase não diz: `e2e/axe-baseline.json` **não** é 0/0 por rota, e nunca foi. Tolera uma violação em `telaInicial` e uma em `telaComResultado`, ambas dívida herdada da calculadora de insulina, alheia a esta feature (L-10); a puericultura assevera zero diretamente, sem entrada no arquivo. O gate é a catraca, `toBeLessThanOrEqual`, e o arquivo de baseline não deve ter sido alterado por esta feature. Se ele aparecer no `git diff`, alguém acomodou uma regressão em vez de corrigi-la.

E, sobretudo, o que RF-08 exige e o número prova:

```bash
# família 1: consultas do Testing Library
grep -rEn "getByText|getByRole\(.*name:|getByLabelText|toHaveTextContent|getByPlaceholderText|findByText|queryByText" tests e2e --include='*.ts' --include='*.tsx' | wc -l

# família 2: asserções literais sobre texto de produto
grep -rEn 'expect\([^)]*\)\.(not\.)?(toContain|toBe)\("' tests e2e --include='*.ts' --include='*.tsx' | wc -l
```

O que se espera: **cada uma igual ou maior que a contagem de entrada registrada nas notas de execução do `actions.md`**, medida com estas mesmas duas réguas antes da primeira reescrita. Não compare contra número escrito em prosa: as varreduras manuais de 27/07 discordaram entre si (224 e 251, por contarem coisas diferentes), e por isso a régua canônica passou a ser a medição, não a cifra (L-13). Número menor significa asserção removida para fazer a suíte passar, e RF-08 reprova a entrega nesse caso, mesmo com tudo verde.

A segunda família existe por uma razão que vale conhecer antes de conferir: `tests/unit/interface/formatar-plano.test.ts` assevera dezessete literais do plano copiável por `toContain`, e a régua original não o via. Era o arquivo mais acoplado ao texto e o único que a medição tratava como intocado (D-19).

## 4. A citação foi preservada, com exatamente duas exceções

O ponto mais delicado da feature, e o que merece a conferência mais atenta:

```bash
node -e "const i=require('./tests/apoio/inventario-textual.json'); const e=i.literais.filter(l=>l.excecao); console.log(e.length); e.forEach(l=>console.log(l.arquivo+':'+l.linha+'  '+l.texto))"
```

O que se espera: **dois**, e exatamente estes:

- `Comprimento adequado para idade` (era `Comprimento adequada para idade`)
- `Baixo comprimento para idade` (era `Baixa comprimento para idade`)

E, por contraste, os dois que **não** podem ter mudado:

```bash
grep -rn "Muito baixo comprimento para idade" models/puericultura/fonte-clinica.ts
grep -c "para idade" models/puericultura/fonte-clinica.ts     # a elipse do artigo permanece
```

O que se espera: `Muito baixo comprimento para idade` intacto, porque já estava correto na fonte; e a elipse `para idade` preservada nos vinte e quatro rótulos que a trazem, porque não é concordância. Qualquer terceiro delta na classe citação reprova a entrega por RF-07.

A prova formal está no segundo artefato de dado, e vale conferir que ele existe e que não foi mexido depois de emitido:

```bash
node -e "const b=require('./tests/apoio/citacao-linha-de-base.json'); console.log(b.aviso); console.log('citações na linha de base:', b.literais.length)"
git log --oneline -- tests/apoio/citacao-linha-de-base.json     # deve ter UM commit só
```

O que se espera: o aviso declarando que o arquivo não se regera, e **um único commit** no histórico dele. Mais de um commit é o sinal de que a linha de base se moveu, e linha de base que se move deixa de medir: o teste de RF-07 passaria a comparar o estado corrente consigo mesmo, verde por construção (D-14).

## 5. A declaração chega ao leitor

Este passo não se verifica por comando: verifica-se abrindo a tela, que é onde o requisito de fato se cumpre.

```bash
npm run dev
```

Abra `http://localhost:3000/puericultura/crescimento` e leia o bloco **"Proveniência e limites desta avaliação"**, que fica visível mesmo antes de qualquer cálculo.

O que se espera: um parágrafo que informe, em prosa legível por quem não conhece o código, que dois rótulos de classificação corrigem a concordância do impresso, **nomeando as formas originais da Caderneta**. O teste do requisito é o do prescritor com a caderneta ao lado: lendo só a tela, ele consegue saber por que a página impressa diz "Comprimento adequada" e o produto diz "Comprimento adequado"? Se precisar abrir o código para entender, RF-10 não foi cumprido, ainda que o texto exista.

Confira também que o bloco continua sem texto próprio:

```bash
grep -c "NOTA_" interface/puericultura/proveniencia.tsx    # o texto vem do domínio, não daqui
```

## 6. A descrição da plataforma corresponde ao que ela é

Ainda com `npm run dev` rodando, em `http://localhost:3000`:

```bash
curl -s http://localhost:3000 | grep -o '<meta name="description"[^>]*>'
grep -n "^    titulo:" interface/inicio/catalogo.ts     # as seções vigentes, para comparar
```

O que se espera: a descrição nomeia as **quatro** seções — Diabetes Mellitus tipo 2, Pré-natal, Cardiologia e Puericultura —, e não mais as duas de antes.

O manifesto responde à forma **oposta**, e confundir as duas é o erro fácil deste passo:

```bash
node -e "const m=JSON.parse(require('node:fs').readFileSync('public/manifest.webmanifest','utf8')); console.log(m.name,'|',m.short_name,'|',m.description); console.log('comprimento da description:', m.description.length)"
```

O que se espera: `name` e `short_name` **inalterados** (`APS Inteligente` e `APSi`), e uma `description` que **não** enumera subconjunto próprio das quatro seções — o que hoje ela cumpre por não enumerar nenhuma. Ela não deve nomear as quatro: o campo tem teto prático em torno de 78 caracteres, é truncado na tela de instalação e persiste no dispositivo de quem instalou até a reinstalação (D-17). Descrição do manifesto que cresceu para enumerar seções é regressão, não cumprimento.

Confira ainda o par que não pode ter divergido:

```bash
node -e "
const fs=require('node:fs');
const sub=(fs.readFileSync('interface/inicio/tela.tsx','utf8').match(/subtitulo=\"([^\"]*)\"/)||[])[1];
const man=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8')).description;
console.log(sub===man ? 'IGUAIS' : 'DIVERGIRAM\n  home: '+sub+'\n  manifesto: '+man);"
```

O que se espera: `IGUAIS`. O subtítulo da home e a descrição do manifesto são o mesmo literal desde antes desta feature, e a revisão alcança os dois no mesmo ato precisamente para não converter duplicação em divergência (D-18, RN-05).

E a cláusula que sobrevive à revisão, em todas as seis rotas:

```bash
grep -rn 'name="description"' -A 2 pages/*.tsx pages/**/*.tsx | grep -ci "navegador"
```

O que se espera: **seis**. A redação da cláusula pode ter mudado — o guia a alcança como a qualquer prosa autoral —, mas a afirmação de que o cálculo não sai do navegador tem de continuar em todas elas (D-20).

## 7. A leitura das seis rotas

O que nenhum teste substitui. Percorra, no navegador, e leia como leitor, não como revisor:

| Rota | O que olhar |
|---|---|
| `/` | Hero, cartões das quatro seções, descrição de cada calculadora |
| `/dm2/insulina` | Rótulos de campo, mensagens de validação, painel de resultado, plano copiável |
| `/pre-natal/idade-gestacional` | Mensagens de validação e o bloco de resultado |
| `/cardiologia/dor-toracica` | Bloco de referências, o mais denso em prosa da plataforma |
| `/cardiologia/risco-cardiovascular` | Bloco de proveniência, no molde do da puericultura |
| `/puericultura/crescimento` | Rótulos de classificação, proveniência, e os títulos neutros dos índices |

Em cada uma, três perguntas: o texto soa como uma voz só? algum travessão sobrou onde caberia vírgula? o título da aba segue o mesmo padrão das outras cinco?

E uma verificação que a suíte não faz: acione o tema escuro pelo cabeçalho e confira que nenhuma reescrita produziu texto longo demais para o espaço em que vive.

## 8. A vigilância de regressão foi reconciliada

O passo que se esquece, e cuja falta produz falso alarme na próxima verificação:

```bash
grep -n "W022" -A 4 _reversa_forward/017-puericultura-crescimento/regression-watch.md
```

O que se espera: **W022 reescrito**, com nota de superação apontando `MD-0015`. O item deve continuar vigiando os vinte e três rótulos que permanecem intocáveis, e passar a vigiar também a permanência da declaração de RF-10. Se W022 ainda disser que "rótulo corrigido para a norma culta" é o modo de falha, a spec está mentindo sobre o que o código faz.

## 9. Sinais de que algo deu errado

| Sintoma | O que provavelmente aconteceu |
|---|---|
| Suíte verde, mas a contagem de asserções caiu | Asserção removida em vez de atualizada — RF-08 reprova |
| Mais de dois literais com `excecao` no inventário | A exceção de RN-09 escapou da lista fechada de §2.4 — RF-07 reprova |
| Rótulo corrigido, mas a proveniência não menciona nada | Correção sem declaração — viola RN-09, e é o pior modo de falha da feature |
| `git diff` não vazio depois de rodar o gerador duas vezes | O gerador não é idempotente; provavelmente carrega data de relógio ou ordenação instável |
| Número ou unidade diferente em alguma tela | A revisão passou de forma para conteúdo — RN-04 reprova, e a alteração precisa ser desfeita |
| Alguma rota piorou em relação ao baseline de `axe` | Algum nome acessível foi degradado pela revisão de estilo — RN-07 reprova |
| `e2e/axe-baseline.json` aparece no `git diff` | Uma regressão de acessibilidade foi acomodada no gate em vez de corrigida; o arquivo não é alvo desta feature |
| `tests/apoio/citacao-linha-de-base.json` com mais de um commit | A linha de base se moveu, e RF-07 perdeu a capacidade de reprovar sem ficar vermelho — o defeito mais silencioso que esta feature pode ter |
| Literal autoral no inventário sem linha no relatório de RF-03 | A frente de reescrita voltou a ser mais estreita que a superfície inventariada; a suíte não acusa isso, porque o congelamento aprova o não revisado igual ao revisado (D-16) |
| Subtítulo da home e `description` do manifesto diferentes entre si | Um dos dois foi revisado sozinho, e a duplicação virou divergência (D-18) |
| `description` do manifesto passou de ~78 caracteres | Alguém aplicou ao manifesto a forma positiva de RF-04, que é da home; o texto será truncado na instalação (D-17) |
| Contagem da segunda família de asserções caiu | Asserção literal removida em `tests/unit/interface/**`; a régua antiga não veria isso, a de D-19 vê |

## 10. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-07-27 | Segunda passagem: o passo 3 troca o "0/0 por rota" pela catraca real e a cifra fixa de asserções pela contagem registrada; o passo 4 ganha a conferência da linha de base e do seu histórico de um commit; a tabela de sintomas ganha três linhas novas | reversa |
| 2026-07-27 | Terceira passagem: o passo 3 mede as **duas** famílias de asserção (D-19); o passo 6 separa a forma positiva da home da negativa do manifesto, acrescenta a conferência do par duplicado home ↔ manifesto e a da cláusula de privacidade nas seis rotas (D-17, D-18, D-20); a tabela de sintomas ganha quatro linhas | reversa |
