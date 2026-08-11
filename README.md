# APS Inteligente

Plataforma web dedicada à prática médica na APS, 100% client-side: nenhum dado clínico
sai do navegador (ADR 0002). A raiz (`/`) é a **página inicial por seções** (feature 007);
as calculadoras vivem em rotas próprias, cada uma com sua fonte clínica citável:

| Seção                    | Calculadora                                                                 | Rota                                | Fonte                                                                                                | Domínio                         |
| ------------------------ | --------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| Diabetes Mellitus tipo 2 | Insulina (início, titulação, intensificação)                                | `/dm2/insulina`                     | Guia Rápido Diabetes Mellitus — SMS-Rio, 2023                                                        | `models/insulina/`              |
| Pré-natal                | Idade gestacional (DUM e/ou ultrassom)                                      | `/pre-natal/idade-gestacional`      | Guia Rápido Pré-Natal — SMS-Rio, 2025                                                                | `models/gestacao/`              |
| Cardiologia              | Dor torácica e probabilidade pré-teste de cardiopatia isquêmica             | `/cardiologia/dor-toracica`         | TeleCondutas — Cardiopatia Isquêmica (TelessaúdeRS-UFRGS, 2017)                                      | `models/cardiopatia-isquemica/` |
| Cardiologia              | Risco cardiovascular em 10 anos (ASCVD)                                     | `/cardiologia/risco-cardiovascular` | 2013 ACC/AHA Guideline — Pooled Cohort Equations (Goff et al., 2014)                                 | `models/risco-cardiovascular/`  |
| Puericultura             | Crescimento infantil (peso, comprimento/estatura, IMC e perímetro cefálico) | `/puericultura/crescimento`         | Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), pp. 85–97 (curvas OMS e INTERGROWTH-21st) | `models/puericultura/`          |
| Puericultura             | Ficha de consulta (dez consultas datadas, registro em SOAP)                 | `/puericultura/consulta`            | Caderneta da Criança (Ministério da Saúde, 2.ª ed., 2020), pp. 66–75 (Acompanhamento da Criança)      | `models/puericultura/consulta/` |
| Saúde da pessoa idosa    | Rastreamento de depressão (GDS, quinze itens)                               | `/saude-do-idoso/depressao-gds`     | Escala de Depressão Geriátrica (GDS), Linhas de Cuidado, Ministério da Saúde (acesso em 30/07/2026)   | `models/depressao-geriatrica/`  |

Next.js (Pages Router) com domínio puro em `models/`, interface em `interface/` e shell
em `pages/`. Os PDFs das fontes ficam em `referencias/` (fora do versionamento, MD-0008).

## Como rodar

```bash
npm ci          # Node >= 24 (campo engines)
npm run dev     # desenvolvimento (CSP desligada para o HMR)
```

Gate de qualidade local: `npm run lint && npm run typecheck && npm test`.

## Norma de redação (feature 018)

Todo texto que a plataforma exibe responde a uma norma escrita, em **[`docs/redacao.md`](docs/redacao.md)**.
Leia-a antes de escrever ou reescrever qualquer literal que chegue à tela, ao `<title>`, à
`<meta name="description">` ou ao manifesto. Em resumo:

- **Três classes de texto**: autoral, citação e identificador. A classe vem da origem do
  texto, jamais do diretório onde ele mora, e se **declara** em `scripts/textos/classes/`.
- **A revisão de estilo alcança só a autoral.** A citação da fonte clínica permanece byte a
  byte, com uma exceção estrita: desvio de concordância se corrige **e se declara ao
  leitor**, sobre lista fechada.
- **O eixo expressivo fica fora.** Nenhum travessão, nenhuma reticência e nenhuma
  exclamação na prosa autoral: onde um deles separava ou introduzia, escreve-se o sinal
  sintático que faz esse trabalho. A exceção única é o nome pelo qual a fonte clínica se
  publica, conferido contra `NOME_PUBLICADO` no domínio. O ponto médio `·` é recurso
  tipográfico, não pontuação, e permanece onde está.

A razão de ser da norma é o **princípio IX** de `.reversa/principles.md`. Parte das regras é
verificada por teste em `tests/unit/textos/`; a seção 7 do guia diz qual parte, para que
ninguém confunda "a suíte passou" com "o texto está bom".

### Inventário da superfície textual

Terceiro gerador idempotente do projeto, no molde de `gerar-tabelas-oms.mts` e
`congelar-casos-oraculo.mts`, e, como eles, com o `git diff` vazio por resultado esperado:

```bash
node scripts/inventariar-textos.mts --listar          # candidatos, sem exigir classe
node scripts/inventariar-textos.mts --gerar           # → tests/apoio/inventario-textual.json
git diff                                              # ← a verificação
```

O inventário é a lista fechada do que são "todos os textos", cada um com arquivo, linha e
classe; a contagem vive no próprio arquivo, e não nesta linha. Ele serve a três papéis ao
mesmo tempo (lista fechada, oráculo do congelamento e entrada do verificador de norma), e
por isso é **regerado** ao fim de toda revisão de texto.

**Onde se declara a classe de um literal novo.** Em `scripts/textos/classes/`, um módulo
por camada. Literal candidato sem entrada faz o gerador **parar**, nomeando arquivo, linha
e o módulo em que declarar. A falha é ruidosa por desenho: literal sem classe é decisão
adiada, não acidente. A classe vem da origem do texto, jamais do diretório.

**A linha de base da citação é outro arquivo, e é outro de propósito:**

```bash
node scripts/inventariar-textos.mts --linha-de-base   # → tests/apoio/citacao-linha-de-base.json
```

Ela guarda a classe citação como era **antes** da revisão de linguagem, e é contra ela que
a suíte prova que a exceção de concordância continuou restrita aos dois rótulos declarados.
O modo é **de uso único**: existindo o arquivo, o gerador se recusa a sobrescrevê-lo e diz
por quê. Regerada, a comparação passaria a ser do estado corrente consigo mesmo: verde
para sempre, incapaz de reprovar, e sem produzir sinal nenhum de que deixou de servir.

## Estilo das telas (Primer, feature 004)

A base de estilo é o **Primer** (design system do GitHub) pela via React: `@primer/react`
(componentes, CSS Modules) + `@primer/primitives` (tokens e temas claro/escuro), ambos
pinados e servidos pelo bundle próprio, de modo que nenhum recurso de estilo sai de origem externa
(CSP intocada). O CSS próprio é cola de layout: cores sempre por `var(--*)` do Primer,
nunca hexadecimal local. `interface/estilos/globais.css` cobre a moldura e as telas das
calculadoras; `interface/estilos/inicio.css` isola os estilos da home (feature 008) e
`interface/estilos/cabecalho.css` a camada de logo do cabeçalho (feature 009), ambos
mantendo o `globais.css` dentro do limite de 400 linhas. `@primer/css` e
`@primer/view-components` são vetados (sem manutenção plena). Ícones, quando necessários,
vêm de `@primer/octicons-react` (mesma família, pinado).

### Identidade da marca (logo APSi, feature 009)

A logo vive em `public/` como ativo estático same-origin (sob a CSP, fora do bundle JS):
`apsi-light.png`/`apsi-dark.png` para o cabeçalho claro/escuro, `apsi-tile.png` (512) e
`apsi-tile-192.png` para favicon, `apple-touch-icon` e o `manifest.webmanifest` (PWA
instalável, declarado em `pages/_document.tsx`). `apsi-white.png`/`apsi-navy.png` ficam
versionadas para sobre-foto/impressão, sem uso na web. A `Moldura` troca a variante da
logo pelo tema já lido no componente.

Para **criar uma tela nova**:

1. O provider já está no shell (`pages/_app.tsx` → `interface/calculadora/provedor-tema.tsx`,
   que liga a preferência persistida em `localStorage["aps-inteligente:tema"]` ao color
   mode do Primer). Nenhum setup adicional por página.
2. Componha a tela com componentes de `@primer/react` (`Button`, `FormControl`,
   `TextInput`, `Flash`, `Heading`, entre outros); recorra ao `globais.css` apenas para cola de
   layout, usando variáveis funcionais do Primer.
3. Mensagens de erro de formulário usam `interface/calculadora/erro-de-campo.tsx`
   (contrato `role="alert"` asserido pelos testes).
4. Cubra a tela no e2e (`e2e/*.spec.ts`) incluindo a varredura axe; a linha de base de
   acessibilidade vive em `e2e/axe-baseline.json` e só muda por decisão registrada.

## Como adicionar uma calculadora nova (feature 007)

1. **Catálogo primeiro** (fonte única anti-drift): registre título, descrição e rota em
   `interface/inicio/catalogo.ts`: a home renderiza a partir dele, e seção nova só nasce
   com pelo menos uma calculadora.
2. **Domínio puro** em `models/<tema>/`, no molde de `models/gestacao/`: `tipos.ts`,
   `fonte-clinica.ts` (REFERENCIAS/CONSTANTES congeladas com página da fonte),
   `validacao.ts` (coleta total de ofensores) e fachada; erros como valores, sem ler o
   relógio nem framework. Cobertura ≥ 90% (`vitest.config.ts` já cobre `models/**`).
3. **Tela** em `interface/<tema>/` sobre a `Moldura` comum (`interface/comum/moldura.tsx`)
   e **rota** em `pages/<secao>/<calculadora>.tsx` com metadados próprios, o mesmo caminho
   declarado no catálogo. A `Moldura` exibe a logo APSi como marca decorativa do cabeçalho
   acima de um `<h1>` **textual** em toda tela, inclusive a home (feature 016): a identidade
   é unificada, o que iguala a altura do cabeçalho por construção. Passe a prop `comInicio`
   nas calculadoras para o comando de retorno à home (⌂); a home não a usa (seria redundante).
4. **Ícone da seção** (opcional, feature 008): registre `id da seção → Octicon` em
   `interface/inicio/icones.tsx`; seção sem entrada simplesmente não exibe ícone (fallback).
   O ícone é decorativo (`aria-hidden`), e o catálogo permanece a fonte de navegação.
5. **Fonte clínica**: PDF em `referencias/` (ignorado pelo git) e toda saída do motor
   carregando `ReferenciaClinica` com página/seção.

## Contribuição voluntária via PIX (feature 019)

A home traz, ao pé das seções, um bloco de apoio que abre um painel com o QR do PIX, a chave em
texto e o código copia e cola. Nada é processado no site: o arranjo é **PIX estático**, o
payload é montado no navegador e a plataforma não fica sabendo se alguém contribuiu.

**Onde se configura, e é ponto único.** `interface/contribuicao/beneficiario.ts` guarda chave,
nome e cidade, congelados por `Object.freeze` no molde do `CATALOGO`. Trocar a chave ali troca o
destinatário no QR e nas duas cópias, e nada mais precisa mudar. Nome e cidade aparecem na tela
de confirmação do aplicativo de quem contribui, e é por eles que a pessoa reconhece a quem está
transferindo. Os limites do padrão do Banco Central são de **25 caracteres para o nome** e **15
para a cidade**, e o módulo **recusa** o que exceder, em vez de truncar: nome cortado geraria
código válido apresentando beneficiário errado, que é o pior desfecho possível. A recusa aparece
como erro no painel durante o desenvolvimento.

**Como conferir depois de trocar a chave.** A suíte prova que o payload obedece à nossa leitura
da especificação, e não que a leitura estava certa. Por isso o procedimento tem duas partes, e a
segunda é obrigatória a cada alteração no módulo:

1. Rode a suíte (`npm test`) e confira o payload contra um decodificador independente, como em
   `_reversa_forward/019-contribuicao-voluntaria-pix/oraculo-externo.md`.
2. Abra o painel e leia o QR com o aplicativo de um banco real, conferindo o nome do
   beneficiário na tela de confirmação. **Não conclua a transferência**: ver o nome certo já
   prova o que precisa ser provado.

O motor do BR Code vive em `models/contribuicao/`, é o primeiro domínio **não clínico** do
projeto e declara essa isenção no cabeçalho da fachada (`MD-0022`): não tem fonte clínica única
e não emite `ReferenciaClinica`. O painel carrega por import dinâmico, de modo que o desenho do
QR não pesa no primeiro carregamento da home.

## As dez fichas de consulta (feature 020)

O conteúdo das dez consultas datadas é **dado declarado**, não marcação escrita dez vezes: um
módulo por ficha em `models/puericultura/consulta/fichas/`, um `Campo` por item impresso, e
cada rótulo carregando a página de onde foi transcrito. Edição nova da caderneta se absorve
editando dado.

São cerca de trezentos e cinquenta rótulos copiados à mão de uma página impressa, e erro de
digitação em rótulo clínico é o defeito mais provável desse acervo. Por isso a transcrição tem
**oráculo**, e o oráculo veio antes dela:

```bash
node scripts/congelar-fichas-caderneta.mts   # pp. 66–75 das duas tiragens → tests/apoio/fichas-caderneta-congeladas.json
npx vitest run tests/unit/dominio-puericultura/consulta-transcricao.test.ts
```

O teste afirma que cada texto citado ocorre na página que o próprio campo declara, no texto que
o `pdftotext` extraiu do PDF. Conferir por releitura seria a segunda implementação que
`MD-0010` recusa: quem transcreveu lê o que quis escrever. Como as páginas são diagramadas em
duas colunas, o congelamento guarda **duas** extrações de **duas** tiragens, e basta ocorrer em
uma delas; onde o layout parte o rótulo nas quatro, a exceção vai declarada com o motivo, sobre
lista fechada de dez. Passando disso, a decisão se reabre em vez de a exceção crescer.

A classe textual desses rótulos é **derivada do próprio catálogo**, em
`scripts/textos/classes/models-puericultura-consulta.mts`, e não escrita literal a literal.
Não é inferência por diretório, que é o que `MD-0014` proíbe: a origem vem da página impressa
que o campo declara, escrita por quem o transcreveu. Declarar trezentas e cinquenta entradas à
mão satisfaria a letra da regra e a derrotaria, porque um mapa desse tamanho passa a ser
mantido no automático.

O produto desta tela é um **texto**, e não um número: o registro em SOAP que se cola no
prontuário. A forma dele tem contrato escrito em
`_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md`, e o texto
exibido e o copiado são a mesma cadeia, de uma função só.

## Tabelas de referência da OMS (feature 017)

A avaliação do crescimento é o primeiro domínio que depende de **dado tabular externo**: as
12 964 linhas `L/M/S` dos padrões da OMS (2006, de 0 a 5 anos) e da referência (2007, de 5 a
10 anos), em `models/puericultura/oms/tabelas/`. Esses módulos são **gerados, não escritos à
mão**, e ficam versionados junto do gerador que os produziu, de modo que quem clona o
repositório não precisa baixar nada para rodar os testes.

A cadeia tem duas ferramentas, e só a primeira toca a rede:

```bash
node scripts/baixar-tabelas-oms.mts    # 14 .xlsx da OMS → referencias/oms/ (fora do git), com sha256 no manifesto
node scripts/gerar-tabelas-oms.mts     # .xlsx → os 14 módulos .ts versionados
git diff                               # ← a verificação
```

**O `git diff` vazio é o resultado esperado**, e é a forma de reconferir o dado sem entender o
gerador: significa que a OMS não mudou nada desde a última geração. Diff não vazio é achado:
ou a fonte mudou, ou o gerador mudou, e nos dois casos a diferença precisa ser lida linha a
linha antes de virar commit. O mesmo vale para o oráculo de escore z congelado em
`tests/apoio/casos-oraculo-puericultura.json`, regenerável por
`node scripts/congelar-casos-oraculo.mts`.

Os coeficientes do INTERGROWTH-21st (curvas de pré-termo, 27 a 64 semanas pós-menstruais) não
vêm de planilha: são seis expressões publicadas em Villar 2015, transcritas à mão e conferidas
coeficiente a coeficiente contra a tabela impressa (`MD-0002`, no quadro do projeto).

**Exceção declarada aos tetos do mantenedor:** seis desses módulos passam de 400 linhas (o maior
tem 728), e é a única exceção da base. Ela vale **só** para `models/puericultura/oms/tabelas/`,
porque ali cada linha é um registro `L/M/S` publicado pela OMS, não código a manter, e o
limite existe para conter arquivo que cresce por acúmulo de lógica. Todo o resto do domínio continua
sob o teto: o maior arquivo escrito à mão tem 331 linhas e a maior função, 40. Nos componentes
de tela, o corpo é JSX declarativo e ultrapassa as 50 linhas por função, como já ocorre nas
outras calculadoras: o teto de função mira lógica, e essa fica nos `models/`.

## Banco de dados (fundação, feature 003)

PostgreSQL local em container (`infra/compose.yaml`, imagem pinada `postgres:17.10-alpine`)
e, em produção, instância gerenciada Neon (plano Free) via Vercel Marketplace, que injeta
`DATABASE_URL` nos ambientes do projeto. Acesso programático **somente** por
`infra/database.ts` (pool preguiçoso, consultas parametrizadas, `ErroDeBanco` nomeado).
Sem esquema de negócio nesta fase; nenhum dado clínico ou pessoal é persistido (RN-01).

```bash
cp .env.example .env.local   # configurar: DATABASE_URL local (ajuste a porta se a 5432 estiver ocupada)
npm run db:up                # subir (idempotente; aguarda o healthcheck)
npm run test:api             # verificar saúde: inclui tests/contract/infra/banco.test.ts
npm run db:psql              # sessão interativa (psql de dentro do container)
npm run db:down              # derrubar e remover o volume (próxima subida parte do zero)
```

A suíte de teste lê `.env.test` (o modo de teste do loader ignora `.env.local`); se mudar
a porta local, replique a `DATABASE_URL` em `.env.test.local`. Contra a Neon, a primeira
conexão pode sofrer cold start (autosuspend do plano Free); limites e roteiro completo em
`_reversa_forward/003-banco-de-dados-psql-pg/onboarding.md`.

## Como verificar saúde

Local, contra o build de produção (CSP ativa):

```bash
npm run build && npm start          # http://localhost:3000
npm run test:api                    # suíte de contrato (tests/contract/)
npm run test:e2e                    # e2e Playwright + axe (sobe o build sozinho)
curl -i http://localhost:3000/api/v1/status
```

Produção, pelo comando que já faz a comparação (é o caminho curto):

```bash
npm run status:conferir             # veredito em uma linha; 0 em dia, 1 defasada, 2 erro
npm run status:conferir -- --json   # o mesmo, para consumo por máquina
npm run status:conferir -- --exigir-saudavel   # banco degradado também sai não-zero
curl -iL https://apsinteligente.app/api/v1/status   # domínio próprio: o apex redireciona
```

Esperado: `200`, com `Cache-Control: no-store` e seis campos na raiz:
`{atualizado_em, versao, commit, publicado_em, ambiente, banco}`. Os três primeiros são os
da feature 002 e não mudaram de nome nem de significado; os três últimos vieram com a 022.

- `atualizado_em` é quando **esta resposta** foi gerada; `publicado_em`, quando o build
  deste deploy foi carimbado. Confundi-los era o defeito que a 022 corrigiu: o primeiro
  muda a cada consulta, o segundo é idêntico enquanto o deploy for o mesmo.
- `ambiente` vale `producao`, `pre-visualizacao` ou `local`, em vocabulário próprio: o nome
  do provedor jamais é repassado cru.
- `banco` traz `{"estado":"degradado","causa":…}`, com a causa em vocabulário fechado
  (`conexao`, `consulta`, `configuracao`, `tempo_esgotado`), ou, de pé, quatro chaves:
  `{"estado":"integro","teto_de_conexoes":100,"conexoes_abertas":3,"versao":"17.10"}`. As
  três últimas vieram com a 024 e existem **só** no estado íntegro; no degradado ficam
  ausentes, nunca zeradas, porque zero é leitura possível do mundo e diria o que não se
  apurou. A versão sai só como número, sem o nome do produto.
- Os dois números não medem o mesmo universo: `teto_de_conexoes` é a configuração do
  **servidor**, que pode hospedar outros bancos, e `conexoes_abertas` conta o **banco
  corrente**. A razão entre eles é indicativa, e não uma taxa exata de ocupação. Some-se
  que a rota se conta: a própria requisição mantém uma conexão aberta enquanto apura, de
  modo que `conexoes_abertas` nunca vale zero, e um significa banco ocioso, não banco vazio.
- `npm run status:conferir` exibe a ocupação ao lado do estado, no molde
  `banco íntegro · 3/100 conexões`. Contra um deploy anterior à 024, que não publica os
  campos, a ocupação sai como
  `ocupação desconhecida`, e a conferência não falha por isso: ausência de campo posterior
  à feature 002 é desconhecido, jamais erro de contrato.

**Degradado significa banco fora, não produto fora** (`MD-0031`). O cálculo das seis
calculadoras é integralmente no navegador, de modo que elas seguem servindo com a
dependência caída, e é por isso que o código permanece `200` em todo estado do banco: um
`503` afirmaria queda de uma plataforma que está no ar. Quem quiser a degradação refletida
no código de saída usa `--exigir-saudavel`; sem ele, os códigos seguem respondendo à
defasagem, que é a pergunta do comando.

O teto da verificação é de 3 000 ms e sai de `APS_TIMEOUT_SAUDE_MS` (gabarito em
`.env.example`). Ele acomoda o despertar da instância suspensa do plano gratuito, que um
teto curto reprovaria como se fosse defeito; estourado, a causa é `tempo_esgotado`, distinta
de `conexao` justamente para que ociosidade não se leia como banco fora.

**Atenção à régua, porque a intuitiva é errada.** Não se espera que `commit` seja igual ao
SHA do `HEAD` de `main`: o `HEAD` carrega commits de encerramento de sessão e de artefato do
Reversa, que nunca chegam ao build. A pergunta certa é se o publicado **contém** o último
commit que toca aplicação; é ela que `npm run status:conferir` responde, tratando o
publicado à frente por commits de governança como estar em dia. Comparar com o `HEAD` foi o
que sustentou, por quatro sessões de julho de 2026, uma pendência de "produção defasada" que
não existia.

A raiz (`/`) deve renderizar a home com as cinco seções, e cada calculadora deve abrir na
sua rota. Roteiro completo:
`_reversa_forward/002-producao-pagina-e-api-status/onboarding.md` e
`_reversa_forward/007-idade-gestacional-e-home/onboarding.md`.

## Como publicar

Push em `main` → CI (`.github/workflows/ci.yml`): verificação → contrato contra o build
de produção → deploy na Vercel. O auto-deploy por push está desligado (`vercel.json`);
**o CI é o único caminho para produção** e exige os secrets `VERCEL_TOKEN`,
`VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` no repositório GitHub.

## Documentação

- Specs e extração reversa: `_reversa_sdd/` (arquitetura, domínio, ADRs, ERD).
- Ciclo forward por feature: `_reversa_forward/<feature>/` (requirements → roadmap →
  actions → legacy-impact → regression-watch).
- Registro de bugs: `_reversa_bugs/`.
