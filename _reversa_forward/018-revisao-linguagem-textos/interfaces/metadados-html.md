# Contrato: metadados HTML das rotas

> Identificador: `018-revisao-linguagem-textos`
> Tipo: superfície de saída (documento HTML servido por rota)
> Consumidores externos: buscadores, prévias de compartilhamento, leitores de aba do navegador
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Natureza do contrato

Não é API: é o par `<title>` + `<meta name="description">` que cada rota emite pelo `<Head>` do Next.js. Entra como contrato porque é a única prosa da plataforma que agentes externos consomem — o buscador que indexa, a rede social que monta a prévia, a aba que se empilha com outras vinte. Quem lê essa prosa está fora do produto, e por isso o defeito de exatidão de §2.3 do `requirements.md` é mais grave ali do que seria numa tela interna.

Nenhum cabeçalho HTTP muda. `_reversa_sdd/openapi/status.yaml` não é tocado, e `tests/contract/plataforma/cabecalhos.test.ts` permanece como está: a CSP, o `theme-color` e os `<link>` de ícone e manifesto em `pages/_document.tsx` ficam intactos.

## 2. Estado atual, conferido

| Rota | `<title>` | Separador | Defeito |
|---|---|---|---|
| `/` | `APS Inteligente — Calculadoras clínicas para a APS` | `—` | A `description` enumera duas das quatro seções 🔴 |
| `/dm2/insulina` | `Calculadora de Insulina — DM2 · APS Inteligente` | `—` **e** `·` | Dois separadores no mesmo título 🟡 |
| `/pre-natal/idade-gestacional` | `Calculadora de Idade Gestacional · APS Inteligente` | `·` | — |
| `/cardiologia/dor-toracica` | `Probabilidade Pré-teste de Cardiopatia Isquêmica · APS Inteligente` | `·` | — |
| `/cardiologia/risco-cardiovascular` | `Risco Cardiovascular em 10 anos (Pooled Cohort Equations) · APS Inteligente` | `·` | — |
| `/puericultura/crescimento` | `Avaliação do Crescimento Infantil · APS Inteligente` | `·` | — |

Todas as seis `description` terminam com a mesma cláusula de privacidade: `Cálculo 100% no navegador: nada é salvo nem enviado.` É uniformidade a preservar, não a revisar. 🟢

Observação de capitalização: os títulos oscilam entre caixa alta de título (`Calculadora de Insulina`, `Avaliação do Crescimento Infantil`) e a caixa de frase que o `CATALOGO` usa nas mesmas calculadoras (`Calculadora de insulina`, `Avaliação do crescimento infantil`). O guia de RF-01 decide qual padrão vale; a decisão pertence a ele, não a este contrato (D-13). 🟡

## 3. O que muda

### 3.1 A `description` da raiz — obrigatório (RF-04)

**Antes**

> Calculadoras clínicas para a Atenção Primária à Saúde, por seção: Diabetes Mellitus tipo 2 e Pré-natal. Cálculo 100% no navegador: nada é salvo nem enviado.

**Depois**: prosa autoral reescrita que nomeie as **quatro** seções vigentes de `CATALOGO` — Diabetes Mellitus tipo 2, Pré-natal, Cardiologia e Puericultura —, preservada a cláusula de privacidade. O texto continua escrito à mão; o que a feature acrescenta é o teste que o compara ao catálogo (D-05), de modo que a quinta seção não possa entrar sem que a descrição seja revisitada.

### 3.2 Uniformização do separador — decorrente do guia (RF-03, RN-10)

Um padrão único para os seis títulos, fixado em `docs/redacao.md`. O caso de `/dm2/insulina` é o que força a decisão: acumula `—` e `·` no mesmo título, contra a regra de forma de RN-10.

### 3.3 Revisão de forma das cinco `description` restantes — decorrente (RF-03)

Classe autoral, sujeitas aos tetos de RN-03 e à grafia fixada pelo guia. Restrição dura de RN-04: nenhuma reescrita pode alterar nome de fonte clínica, ano de edição, sigla ou o que a calculadora afirma cobrir. O `TeleCondutas — Cardiopatia Isquêmica` da rota `/cardiologia/dor-toracica` é **nome próprio da fonte**, e o travessão que ele carrega não é escolha de pontuação do produto: não conta para o teto de RN-03 e não pode ser trocado.

## 4. O que não muda

- `<meta name="viewport">` das seis rotas — não é prosa.
- `<meta name="theme-color">`, `<link rel="icon">`, `<link rel="apple-touch-icon">` e `<link rel="manifest">` em `pages/_document.tsx`.
- O atributo `lang="pt-BR"` do `<Html>`.
- Cabeçalhos HTTP e política de segurança de conteúdo.
- A estrutura de rotas: nenhuma nasce, nenhuma morre.

## 5. Erros, idempotência e tempo de resposta

Não se aplicam no sentido de contrato de rede: o documento é gerado em build e servido estático. Vale registrar, porém, o que responde ao mesmo espírito:

- **Idempotência.** O metadado é estático por rota; a mesma rota devolve o mesmo `<head>` a cada carga, sem estado nem negociação.
- **Modo de falha.** Não há falha em tempo de execução; a falha possível é de **conteúdo** — descrição que não corresponde ao produto —, e é precisamente o que o teste de RF-04 passa a detectar em tempo de suíte.
- **Propagação.** O buscador reindexa no seu próprio ritmo. A correção de §2.3 não tem efeito imediato na busca, e essa latência é do consumidor externo, não da plataforma. 🟡

## 6. Verificação

| O que se verifica | Onde |
|---|---|
| A `description` da raiz nomeia as quatro seções de `CATALOGO` | Teste novo de RF-04, comparação contra a constante |
| Os seis títulos usam o separador único do guia | Teste de norma de RF-05, sobre a classe autoral do inventário |
| Nenhum literal de metadado saiu do inventário sem classe | Gerador de RF-02, falha ruidosa |
| Os títulos revisados permanecem congelados | Teste de RF-06, contra `tests/apoio/inventario-textual.json` |
| A cláusula de privacidade sobrevive nas seis rotas | Asserção explícita, a criar |

Nota de implementação para o gerador: o `<title>` de `/cardiologia/risco-cardiovascular` está quebrado em duas linhas no JSX e chega como `JsxText` com quebra e recuo internos. A extração precisa normalizar espaço em branco antes de comparar, sob pena de o inventário registrar um literal que não corresponde ao que o navegador exibe. 🟢

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-plan` | reversa |
