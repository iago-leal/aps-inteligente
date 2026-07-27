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

O que se espera: tudo verde, `axe` em 0/0 por rota. E, sobretudo, o que RF-08 exige e o número prova:

```bash
grep -rEn "getByText|getByRole\(.*name:|getByLabelText|toHaveTextContent|getByPlaceholderText|findByText|queryByText" tests e2e --include='*.ts' --include='*.tsx' | wc -l
```

O que se espera: **igual ou maior que 251**, a contagem de entrada medida em 27/07. Número menor significa asserção removida para fazer a suíte passar, e RF-08 reprova a entrega nesse caso, mesmo com tudo verde.

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

O que se espera: a descrição nomeia as **quatro** seções — Diabetes Mellitus tipo 2, Pré-natal, Cardiologia e Puericultura —, e não mais as duas de antes. Confira o mesmo no manifesto:

```bash
node -e "const m=JSON.parse(require('node:fs').readFileSync('public/manifest.webmanifest','utf8')); console.log(m.name,'|',m.short_name,'|',m.description)"
```

O que se espera: `name` e `short_name` **inalterados** (`APS Inteligente` e `APSi`), e a `description` sem enumeração desatualizada.

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
| `axe` deixou de ser 0/0 | Algum nome acessível foi degradado pela revisão de estilo — RN-07 reprova |

## 10. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-plan` | reversa |
